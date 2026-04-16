/**
 * SwipeCell 滑动单元格（Preact）。
 * 移动端列表项左/右滑露出操作按钮（删除、更多等）；支持左右两侧、自定义宽度与样式。
 *
 * **手势**：根节点上**原生** `addEventListener`（`pointermove` 为 `{ passive: false }`），避免仅 JSX 的 `touch*`
 * 在桌面无触摸、或 `touch-pan-y` 抢横向手势；与 `@dreamer/ui-view` 的 SwipeCell 对齐。
 * 单侧宽度等用 **`data-*` 写在根节点**上，监听内按 `dataset` 读取，避免闭包过期。
 */

import type { ComponentChildren, JSX } from "preact";
import { useCallback, useLayoutEffect, useRef } from "preact/hooks";
import { twMerge } from "tailwind-merge";

/** 单侧的一个操作项 */
export interface SwipeCellAction {
  /** 按钮文案 */
  text: string;
  /** 点击回调 */
  onClick?: () => void;
  /** 按钮样式：default 灰、primary 蓝、danger 红 */
  style?: "default" | "primary" | "danger";
  /** 自定义 class 覆盖 */
  class?: string;
}

export interface SwipeCellProps {
  /** 左侧操作列（从左向右滑露出） */
  leftActions?: SwipeCellAction[];
  /** 右侧操作列（从右向左滑露出） */
  rightActions?: SwipeCellAction[];
  /** 单元格主内容 */
  children?: ComponentChildren;
  /** 是否禁用滑动 */
  disabled?: boolean;
  /** 单侧操作按钮宽度（px），默认 64 */
  actionWidth?: number;
  /** 打开时回调（当前为 left | right） */
  onOpen?: (side: "left" | "right") => void;
  /** 关闭时回调 */
  onClose?: () => void;
  /** 额外 class（作用于最外层） */
  class?: string;
}

const ACTION_STYLE_CLASSES: Record<"default" | "primary" | "danger", string> = {
  default:
    "bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 active:bg-slate-300 dark:active:bg-slate-500",
  primary:
    "bg-blue-500 text-white active:bg-blue-600 dark:bg-blue-600 dark:active:bg-blue-700",
  danger:
    "bg-red-500 text-white active:bg-red-600 dark:active:bg-red-600 dark:active:bg-red-700",
};

const ACTION_WIDTH = 64;

/** 根上标记已挂原生 pointer */
const SWIPE_POINTER_KEY = "__swipeCellPtrPack";

/** 挂在根上的打开/关闭回调 */
type SwipeCallbacks = {
  onOpen?: SwipeCellProps["onOpen"];
  onClose?: SwipeCellProps["onClose"];
};

/**
 * 与单个 SwipeCell 根 DOM 绑定的拖拽状态（度量见根节点 `dataset`）。
 */
interface SwipeDragState {
  inner: HTMLDivElement | null;
  startX: number;
  offset: number;
  activePointerId: number | null;
}

const swipeDragByRoot = new WeakMap<HTMLDivElement, SwipeDragState>();

function getOrCreateState(root: HTMLDivElement): SwipeDragState {
  let s = swipeDragByRoot.get(root);
  if (!s) {
    s = { inner: null, startX: 0, offset: 0, activePointerId: null };
    swipeDragByRoot.set(root, s);
  }
  return s;
}

/**
 * 读 `data-*` 数值（px）。勿仅用 `dataset.metricLw`：带连字符的属性在部分环境下映射不一致，会导致 lw/rw 恒为 0，
 * 初始 `translateX(0)` 左侧操作区会整段露在视口里。
 *
 * @param root - 根元素
 * @param attr - 完整属性名，如 `data-metric-lw`
 */
function readDataPx(root: HTMLElement, attr: string): number {
  const v = root.getAttribute(attr);
  if (v == null || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * 从根节点读当前宽度（与手势回调同源）。
 *
 * @param root - `[data-swipe-cell]`
 */
function readMetrics(root: HTMLDivElement): {
  lw: number;
  rw: number;
  aw: number;
  disabled: boolean;
} {
  return {
    lw: readDataPx(root, "data-metric-lw"),
    rw: readDataPx(root, "data-metric-rw"),
    aw: readDataPx(root, "data-metric-aw") || ACTION_WIDTH,
    disabled: root.getAttribute("data-swipe-disabled") === "1",
  };
}

/**
 * @param lw - 左区总宽
 * @param offset - 用户偏移
 */
function transformX(lw: number, offset: number): number {
  return -lw + offset;
}

/**
 * 将 offset 应用到 inner。
 *
 * @param root - 根节点
 * @param offset - 偏移
 */
function applyTransform(root: HTMLDivElement, offset: number): void {
  const s = swipeDragByRoot.get(root);
  const { lw } = readMetrics(root);
  if (!s?.inner) return;
  s.inner.style.transform = `translateX(${transformX(lw, offset)}px)`;
}

/**
 * 吸附到关闭或一侧全开。
 *
 * @param root - 根节点
 */
function snap(root: HTMLDivElement): void {
  const s = swipeDragByRoot.get(root);
  if (!s?.inner) return;
  const { lw, rw, aw } = readMetrics(root);
  const x = s.offset;
  const threshold = aw * 0.3;
  let target = 0;
  if (x > threshold && lw > 0) target = lw;
  else if (x < -threshold && rw > 0) target = -rw;
  s.offset = target;
  s.inner.style.transition = "transform 0.2s ease-out";
  applyTransform(root, target);
  const cb = (root as unknown as Record<string, unknown>)[
    "__swipeCb"
  ] as SwipeCallbacks | undefined;
  if (target === 0) cb?.onClose?.();
  else cb?.onOpen?.(target > 0 ? "left" : "right");
}

/**
 * 原生 `pointerdown`。
 *
 * @param e - 事件
 */
function onNativePointerDown(e: Event): void {
  const ev = e as PointerEvent;
  const root = ev.currentTarget as HTMLDivElement;
  const { disabled } = readMetrics(root);
  if (disabled) return;
  if (ev.isPrimary === false) return;
  if (ev.pointerType === "mouse" && ev.button !== 0) return;
  const s = getOrCreateState(root);
  s.startX = ev.clientX;
  s.activePointerId = ev.pointerId;
  if (s.inner) s.inner.style.transition = "";
  try {
    root.setPointerCapture(ev.pointerId);
  } catch {
    /* ignore */
  }
}

/**
 * 原生 `pointermove`。
 *
 * @param e - 事件
 */
function onNativePointerMove(e: Event): void {
  const ev = e as PointerEvent;
  const root = ev.currentTarget as HTMLDivElement;
  const { disabled, lw, rw } = readMetrics(root);
  if (disabled) return;
  const s = swipeDragByRoot.get(root);
  if (s == null || s.activePointerId !== ev.pointerId || !s.inner) return;
  const currentX = ev.clientX;
  const delta = currentX - s.startX;
  let next = s.offset + delta;
  if (next > lw) next = lw + (next - lw) * 0.3;
  if (next < -rw) next = -rw + (next + rw) * 0.3;
  s.offset = next;
  s.startX = currentX;
  applyTransform(root, next);
}

/**
 * 原生 `pointerup` / `cancel` / `lostpointercapture`。
 *
 * @param e - 事件
 */
function onNativePointerUp(e: Event): void {
  const ev = e as PointerEvent;
  const root = ev.currentTarget as HTMLDivElement;
  const { disabled } = readMetrics(root);
  if (disabled) return;
  const s = swipeDragByRoot.get(root);
  if (s == null || s.activePointerId !== ev.pointerId) return;
  s.activePointerId = null;
  try {
    root.releasePointerCapture(ev.pointerId);
  } catch {
    /* ignore */
  }
  if (s.inner) s.inner.style.transition = "transform 0.2s ease-out";
  snap(root);
}

/**
 * 在根上挂一次监听。
 *
 * @param root - 根节点
 */
function attachNativePointerOnce(root: HTMLDivElement): void {
  const el = root as unknown as Record<string, unknown>;
  if (el[SWIPE_POINTER_KEY]) return;
  el[SWIPE_POINTER_KEY] = true;
  root.addEventListener("pointerdown", onNativePointerDown);
  root.addEventListener("pointermove", onNativePointerMove, { passive: false });
  root.addEventListener("pointerup", onNativePointerUp);
  root.addEventListener("pointercancel", onNativePointerUp);
  root.addEventListener("lostpointercapture", onNativePointerUp);
}

/**
 * 卸载时摘除监听并清 WeakMap。
 *
 * @param root - 根节点
 */
function detachNativePointer(root: HTMLDivElement): void {
  const el = root as unknown as Record<string, unknown>;
  if (!el[SWIPE_POINTER_KEY]) return;
  root.removeEventListener("pointerdown", onNativePointerDown);
  root.removeEventListener("pointermove", onNativePointerMove);
  root.removeEventListener("pointerup", onNativePointerUp);
  root.removeEventListener("pointercancel", onNativePointerUp);
  root.removeEventListener("lostpointercapture", onNativePointerUp);
  delete el[SWIPE_POINTER_KEY];
  delete el.__swipeCb;
  swipeDragByRoot.delete(root);
}

/**
 * 可横向滑动露出两侧操作区的列表单元格。
 *
 * @param props - 左右动作、子内容、宽度等
 */
export function SwipeCell(props: SwipeCellProps): JSX.Element {
  const {
    leftActions = [],
    rightActions = [],
    children,
    disabled = false,
    actionWidth = ACTION_WIDTH,
    onOpen,
    onClose,
    class: className,
  } = props;

  const leftWidth = leftActions.length * actionWidth;
  const rightWidth = rightActions.length * actionWidth;

  /** 当前挂载的根，供卸载与换根时 detach */
  const rootBox = useRef<HTMLDivElement | null>(null);
  /** 记录上一帧左右总宽，变化时重置 `offset`，避免单侧改双侧后仍沿用错误位移 */
  const prevSideWidthsRef = useRef<{ lw: number; rw: number } | null>(null);

  useLayoutEffect(() => {
    return () => {
      if (rootBox.current) {
        detachNativePointer(rootBox.current);
        rootBox.current = null;
      }
      prevSideWidthsRef.current = null;
    };
  }, []);

  /**
   * 根 ref：仅挂监听；`inner` 与初始 `transform` 在同文件内紧随的 `useLayoutEffect` 里同步，避免
   * `queueMicrotask` 晚一帧导致首屏 `translateX` 未生效、左侧默认露出。
   *
   * @param el - 根或 null
   */
  const setRootRef = useCallback((el: HTMLDivElement | null) => {
    if (!el) {
      if (rootBox.current) {
        detachNativePointer(rootBox.current);
        rootBox.current = null;
      }
      prevSideWidthsRef.current = null;
      return;
    }
    const root = el;
    if (rootBox.current && rootBox.current !== root) {
      detachNativePointer(rootBox.current);
    }
    rootBox.current = root;
    attachNativePointerOnce(root);
  }, []);

  /** 同步打开/关闭回调到根节点（监听为稳定函数，从此处读最新回调） */
  useLayoutEffect(() => {
    const r = rootBox.current;
    if (!r) return;
    (r as unknown as Record<string, unknown>).__swipeCb = {
      onOpen,
      onClose,
    } satisfies SwipeCallbacks;
  }, [onOpen, onClose]);

  /**
   * 绑定 `inner`、按当前 `data-metric-*` 应用 `transform`；左右列宽度变化时清零 `offset` 再吸附到关闭位。
   */
  useLayoutEffect(() => {
    const root = rootBox.current;
    if (!root) return;
    const inner = root.firstElementChild;
    if (!(inner instanceof HTMLDivElement)) return;
    const s = getOrCreateState(root);
    s.inner = inner;
    const prev = prevSideWidthsRef.current;
    if (prev == null || prev.lw !== leftWidth || prev.rw !== rightWidth) {
      s.offset = 0;
      prevSideWidthsRef.current = { lw: leftWidth, rw: rightWidth };
    }
    applyTransform(root, s.offset);
  }, [leftWidth, rightWidth, actionWidth, disabled]);

  return (
    <div
      ref={setRootRef}
      data-swipe-cell=""
      data-metric-lw={String(leftWidth)}
      data-metric-rw={String(rightWidth)}
      data-metric-aw={String(actionWidth)}
      data-swipe-disabled={disabled ? "1" : "0"}
      class={twMerge(
        "swipe-cell touch-pan-x select-none overflow-hidden rounded-lg",
        disabled && "pointer-events-none",
        className,
      )}
    >
      <div
        class="flex"
        style={{ width: `calc(100% + ${leftWidth + rightWidth}px)` }}
      >
        {leftActions.length > 0 && (
          <div class="flex shrink-0" style={{ width: `${leftWidth}px` }}>
            {leftActions.map((action, i) => (
              <button
                key={i}
                type="button"
                class={twMerge(
                  "flex items-center justify-center text-sm font-medium h-full",
                  ACTION_STYLE_CLASSES[action.style ?? "default"],
                  action.class,
                )}
                style={{ width: `${actionWidth}px` }}
                onClick={() => action.onClick?.()}
              >
                {action.text}
              </button>
            ))}
          </div>
        )}
        <div class="flex-1 min-w-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 border-l-0 border-r-0">
          {children}
        </div>
        {rightActions.length > 0 && (
          <div class="flex shrink-0" style={{ width: `${rightWidth}px` }}>
            {rightActions.map((action, i) => (
              <button
                key={i}
                type="button"
                class={twMerge(
                  "flex items-center justify-center text-sm font-medium h-full",
                  ACTION_STYLE_CLASSES[action.style ?? "default"],
                  action.class,
                )}
                style={{ width: `${actionWidth}px` }}
                onClick={() => action.onClick?.()}
              >
                {action.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
