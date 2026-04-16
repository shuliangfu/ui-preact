/**
 * PullRefresh 下拉刷新（Preact）。
 * 与 `@dreamer/ui-view` 的 PullRefresh 对齐要点：
 * - 最外层不滚动，`overflow-hidden`；仅内层 `data-pull-refresh-content` 纵向滚动。
 * - 下拉时**仅列表滚动层** `translateY`；**头区（文案+进度）固定在壳顶**，不与列表一起整体下移（与 ui-view 观感一致）。
 * - 未超过阈值显示 `pullingText`，超过显示 `loosingText`，并展示进度条。
 * - `scrollTop` 在顶部附近用容差判定（亚像素回弹）。
 * 手势：Pointer（鼠标/笔）+ Touch；`pointermove` / `touchmove` 须能 `preventDefault`（非 passive）。
 */

import type { ComponentChildren, JSX } from "preact";
import { useCallback, useRef, useState } from "preact/hooks";
import { twMerge } from "tailwind-merge";
import {
  type ControlledOpenInput,
  readControlledOpenInput,
} from "../../shared/feedback/controlled-open.ts";

export type PullRefreshStatus =
  | "idle"
  | "pulling"
  | "loosing"
  | "loading"
  | "success";

export interface PullRefreshProps {
  /** 是否处于加载中；推荐 `loading={sig}`，勿 `loading={sig.value}` */
  loading?: ControlledOpenInput;
  /** 下拉释放后触发的刷新回调；父级应在回调内拉取数据并随后将 loading 设为 false */
  onRefresh?: () => void | Promise<void>;
  /** 下拉过程提示文案 */
  pullingText?: string;
  /** 释放过程提示文案 */
  loosingText?: string;
  /** 加载过程提示文案 */
  loadingText?: string;
  /** 刷新成功提示文案；传空则不显示成功态 */
  successText?: string | null;
  /** 成功提示展示时长（ms），默认 500 */
  successDuration?: number;
  /** 头部区域高度（px），默认 50 */
  headHeight?: number;
  /** 触发刷新的下拉距离（px），默认与 headHeight 一致 */
  pullDistance?: number;
  /** 是否禁用下拉刷新 */
  disabled?: boolean;
  /** 子内容（通常为可滚动列表） */
  children?: ComponentChildren;
  /** 额外 class（作用于最外层） */
  class?: string;
  /**
   * 内层可滚动容器（`data-pull-refresh-content`）挂载/卸载时回调；
   * 供 {@link ScrollList} 等组合组件挂 `IntersectionObserver` 或 `scroll` 做上拉加载。
   */
  scrollContainerRef?: (el: HTMLDivElement | null) => void;
}

/** 判定「在列表顶部」的 scrollTop 上限（px），与 ui-view 一致 */
const PULL_REFRESH_TOP_SLOP_PX = 8;

const DEFAULT_PULLING = "下拉即可刷新…";
const DEFAULT_LOOSING = "释放即可刷新…";
const DEFAULT_LOADING = "加载中…";

/**
 * 下拉刷新：头区 + 滚动层联动位移，文案随下拉距离切换。
 *
 * @param props - 文案、阈值、受控 loading 等
 */
export function PullRefresh(props: PullRefreshProps): JSX.Element {
  const {
    onRefresh,
    pullingText = DEFAULT_PULLING,
    loosingText = DEFAULT_LOOSING,
    loadingText = DEFAULT_LOADING,
    successText: _successText = null,
    successDuration: _successDuration = 500,
    headHeight = 50,
    pullDistance: pullDistanceProp,
    disabled = false,
    children,
    class: className,
    scrollContainerRef,
  } = props;

  /** 当前手势相对起点的向下位移（px，未阻尼），用于文案与进度条 */
  const [dragDelta, setDragDelta] = useState(0);

  const isLoading = readControlledOpenInput(props.loading);
  const pullDistance = pullDistanceProp ?? headHeight;

  /** 单实例手势状态（跨渲染持久） */
  const store = useRef({
    head: null as HTMLDivElement | null,
    shell: null as HTMLDivElement | null,
    scrollEl: null as HTMLDivElement | null,
    startY: 0,
    startScrollTop: 0,
    currentY: 0,
    activePointerId: null as number | null,
    activeTouchId: null as number | null,
    detachPointerMove: null as (() => void) | null,
    detachTouchMove: null as (() => void) | null,
  }).current;

  const scrollContainerRefLatest = useRef(scrollContainerRef);
  scrollContainerRefLatest.current = scrollContainerRef;
  const setScrollContentRef = useCallback((el: HTMLDivElement | null) => {
    store.scrollEl = el;
    scrollContainerRefLatest.current?.(el);
  }, []);

  /** 每帧更新，供壳层原生监听调用，避免 ref 只绑一次导致闭包过期 */
  const gesturePropsRef = useRef({
    disabled,
    isLoading,
    pullDistance,
    onRefresh,
  });
  gesturePropsRef.current = { disabled, isLoading, pullDistance, onRefresh };

  const setHeadRef = (el: HTMLDivElement | null) => {
    store.head = el;
  };

  /**
   * 读取内层滚动容器的 `scrollTop`。
   *
   * @returns 像素值
   */
  const getScrollTop = (): number => {
    const el = store.scrollEl;
    if (!el) return 0;
    return el.scrollTop;
  };

  /**
   * 清除滚动层上的下拉位移（头区不使用 `transform`，无需清头）。
   */
  const clearPullTransforms = (): void => {
    if (store.scrollEl) store.scrollEl.style.transform = "";
    setDragDelta(0);
  };

  /**
   * 原生 `pointermove` / `touchmove` 只绑一次，实现经本 ref 转发以读取最新 props。
   */
  const runRef = useRef({
    pointerMove: (_e: PointerEvent) => {},
    touchMove: (_e: TouchEvent) => {},
  });

  runRef.current.pointerMove = (e: PointerEvent) => {
    if (store.activePointerId !== e.pointerId) return;
    const c = gesturePropsRef.current;
    if (c.disabled || c.isLoading || !store.head || !store.scrollEl) return;
    if (getScrollTop() > PULL_REFRESH_TOP_SLOP_PX) return;
    store.currentY = e.clientY;
    const raw = store.currentY - store.startY;
    if (raw <= 0) return;
    try {
      e.preventDefault();
    } catch {
      /* passive 等环境下可能无效 */
    }
    const pd = c.pullDistance;
    const damp = raw > pd ? pd + (raw - pd) * 0.3 : raw;
    /** 头区固定在顶部，仅推动下方可滚区域，避免「整段提示+列表」一起下移 */
    store.scrollEl.style.transform = `translateY(${damp}px)`;
    setDragDelta(raw);
  };

  runRef.current.touchMove = (e: TouchEvent) => {
    if (store.activePointerId != null) return;
    if (store.activeTouchId == null) return;
    const t = Array.from(e.touches).find((x) =>
      x.identifier === store.activeTouchId
    );
    if (!t) return;
    const c = gesturePropsRef.current;
    if (c.disabled || c.isLoading || !store.head || !store.scrollEl) return;
    if (getScrollTop() > PULL_REFRESH_TOP_SLOP_PX) return;
    store.currentY = t.clientY;
    const raw = store.currentY - store.startY;
    if (raw <= 0) return;
    try {
      e.preventDefault();
    } catch {
      /* ignore */
    }
    const pd = c.pullDistance;
    const damp = raw > pd ? pd + (raw - pd) * 0.3 : raw;
    store.scrollEl.style.transform = `translateY(${damp}px)`;
    setDragDelta(raw);
  };

  /**
   * 根节点 ref：`pointermove` / `touchmove` 均为 `{ passive: false }`（与 ui-view 一致）。
   *
   * @param el - 壳层或 null
   */
  const setShellRef = (el: HTMLDivElement | null) => {
    store.detachPointerMove?.();
    store.detachPointerMove = null;
    store.detachTouchMove?.();
    store.detachTouchMove = null;
    store.shell = el;
    if (!el) return;

    const onPointerMove = (ev: Event) => {
      runRef.current.pointerMove(ev as PointerEvent);
    };
    const onTouchMove = (ev: Event) => {
      runRef.current.touchMove(ev as TouchEvent);
    };

    el.addEventListener("pointermove", onPointerMove, { passive: false });
    el.addEventListener("touchmove", onTouchMove, {
      passive: false,
      capture: true,
    });

    store.detachPointerMove = () => {
      el.removeEventListener("pointermove", onPointerMove);
      store.detachPointerMove = null;
    };
    store.detachTouchMove = () => {
      el.removeEventListener("touchmove", onTouchMove, { capture: true });
      store.detachTouchMove = null;
    };
  };

  /**
   * Pointer 按下。
   *
   * @param e - 事件
   */
  const handlePointerDown = (e: PointerEvent) => {
    if (disabled || isLoading) return;
    if (e.isPrimary === false) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const st = getScrollTop();
    if (st > PULL_REFRESH_TOP_SLOP_PX) return;
    store.startY = e.clientY;
    store.startScrollTop = st;
    store.currentY = e.clientY;
    store.activePointerId = e.pointerId;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  /**
   * Pointer 抬起 / 取消。
   *
   * @param e - 事件
   */
  const handlePointerUp = (e: PointerEvent) => {
    if (store.activePointerId !== e.pointerId) return;
    store.activePointerId = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    finishPullGesture();
  };

  /**
   * 触摸开始（无 Pointer 合成时）。
   *
   * @param e - 事件
   */
  const handleTouchStart = (e: TouchEvent) => {
    if (store.activePointerId != null) return;
    const t = e.touches[0];
    if (!t) return;
    if (disabled || isLoading) return;
    const st = getScrollTop();
    if (st > PULL_REFRESH_TOP_SLOP_PX) return;
    store.activeTouchId = t.identifier;
    store.startY = t.clientY;
    store.startScrollTop = st;
    store.currentY = t.clientY;
  };

  /**
   * 触摸结束。
   *
   * @param e - 事件
   */
  const handleTouchEnd = (e: TouchEvent) => {
    if (store.activePointerId != null) return;
    const ended = Array.from(e.changedTouches).some((x) =>
      x.identifier === store.activeTouchId
    );
    if (!ended) return;
    store.activeTouchId = null;
    finishPullGesture();
  };

  /**
   * 松手：复位 transform，若超过阈值则 `onRefresh`。
   */
  const finishPullGesture = (): void => {
    const c = gesturePropsRef.current;
    const raw = store.currentY - store.startY;
    const atTopStart = store.startScrollTop <= PULL_REFRESH_TOP_SLOP_PX;
    const fire = !c.disabled &&
      !c.isLoading &&
      !!store.head &&
      atTopStart &&
      raw >= c.pullDistance &&
      !!c.onRefresh;
    clearPullTransforms();
    if (fire) {
      c.onRefresh?.();
    }
    store.currentY = 0;
    store.startY = 0;
  };

  const status: PullRefreshStatus = isLoading ? "loading" : "idle";
  const armed = !isLoading && dragDelta >= pullDistance;
  const showHead = isLoading || dragDelta > 0;

  return (
    <div
      ref={setShellRef}
      class={twMerge(
        "pull-refresh relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden overscroll-y-contain select-none",
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onLostPointerCapture={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div class="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div
          ref={setHeadRef}
          data-pull-refresh-head=""
          class={twMerge(
            "relative z-10 flex flex-col items-center justify-center gap-1 transition-all duration-200 ease-out",
            showHead || status === "loading"
              ? twMerge(
                "shrink-0 border-b border-slate-200/90 bg-slate-50/95 px-2 py-1 text-sm shadow-sm dark:border-slate-600/80 dark:bg-slate-900/90",
                "opacity-100",
              )
              : "pointer-events-none max-h-0 min-h-0 shrink-0 overflow-hidden border-0 bg-transparent p-0 opacity-0 shadow-none",
          )}
          style={showHead || status === "loading"
            ? { minHeight: `${headHeight}px` }
            : { minHeight: 0, maxHeight: 0 }}
        >
          <div class="flex min-h-0 w-full items-center justify-center gap-2">
            {status === "loading" && (
              <span
                class="inline-block h-4 w-4 shrink-0 rounded-full border-2 border-slate-300 border-t-blue-500 animate-spin"
                aria-hidden="true"
              />
            )}
            <span
              data-pull-refresh-label=""
              class={twMerge(
                "truncate text-center font-medium transition-colors duration-150",
                armed
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-slate-500 dark:text-slate-400",
              )}
            >
              {status === "loading"
                ? loadingText
                : armed
                ? loosingText
                : pullingText}
            </span>
          </div>
          <div
            data-pull-refresh-progress-track=""
            class={twMerge(
              "h-1 w-[6.5rem] max-w-[85%] shrink-0 overflow-hidden rounded-full bg-slate-200/90 dark:bg-slate-600/80",
              !isLoading && dragDelta > 0
                ? "opacity-100"
                : "pointer-events-none h-0 opacity-0",
            )}
          >
            <div
              data-pull-refresh-progress-inner=""
              class="h-full rounded-full bg-teal-500 transition-[width] duration-75 ease-out dark:bg-teal-400"
              style={{
                width: `${
                  Math.min(
                    100,
                    Math.round((dragDelta / pullDistance) * 100),
                  )
                }%`,
              }}
            />
          </div>
        </div>

        <div
          ref={setScrollContentRef}
          data-pull-refresh-content=""
          class="relative flex min-h-0 min-w-0 flex-1 touch-pan-y flex-col overflow-y-auto overflow-x-hidden overscroll-y-none [overflow-anchor:none]"
        >
          <div class="flex min-h-0 min-w-0 flex-col">{children}</div>
        </div>
      </div>
    </div>
  );
}
