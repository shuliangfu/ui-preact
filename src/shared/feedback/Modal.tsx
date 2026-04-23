/**
 * Modal 模态弹窗（Preact + @preact/signals）。
 * 桌面居中弹层：遮罩、标题、内容、底部按钮；支持关闭、点击遮罩关闭、Esc、自定义宽度与 footer。
 * 支持拖动标题栏、全屏切换；全屏与关闭按钮并排于标题栏右侧。
 *
 * **客户端**：`open === true` 且存在真实 `globalThis.document.body` 时，用 {@link createPortal} 挂到 `body`；
 * Portal 路径下父级槽位返回**隐藏占位 `span`**（勿返回 `null`），避免 Hybrid 水合 `replaceSlot` 与仅 `null` 时更新链异常。
 * **SSR**（无 `body`）时内联渲染；遮罩行内 `z-index`。
 *
 * **`open`**：勿传 `open={sig.value}` 布尔快照（父级函数子可能不因 `.value` 变化重跑本组件）。
 * 应传 **`open={sig}`**（`Signal<boolean>`）或 **`open={() => …}`**（零参 getter）；本组件在渲染路径用 {@link readControlledOpenInput} 读取，可订阅 `Signal`。
 *
 * **`width` / `title` / `children`**：父级 MountFn 可能只合并首帧 props；**`width` / `title`** 与 `open` 同向可传零参 getter，
 * 渲染时再次读取，打开后改预设仍会更新。**`children`** 仅当不关弹窗、正文也要随同一 signal 变时再传 `children={() => …}`。
 */

import { useEffect, useLayoutEffect } from "preact/hooks";
import { createPortal } from "preact/compat";
import type { ComponentChildren, JSX } from "preact";
import { useSignal } from "@preact/signals";
import { twMerge } from "tailwind-merge";
import {
  type ControlledOpenInput,
  readControlledOpenInput,
} from "./controlled-open.ts";
import { getBrowserBodyPortalHost } from "./portal-host.ts";
/** 按需：单文件图标，避免经 icons/mod 拉入全表 */
import { IconClose } from "../basic/icons/Close.tsx";
import { IconExitFullscreen } from "../basic/icons/ExitFullscreen.tsx";
import { IconMaximize2 } from "../basic/icons/Maximize2.tsx";

/** `open` 合法形态：布尔快照、`Signal<boolean>`，或返回 boolean 的零参 getter（嵌套 state 用 getter）。 */
export type ModalOpenInput = ControlledOpenInput;

/** 标题栏主文案相对弹层的水平对齐（右侧关闭/全屏仍贴右） */
export type ModalTitleAlign = "left" | "center";

/** 宽度字面量与 CSS 数值形态（非 getter）。 */
export type ModalWidthPrimitive =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | string
  | number;

/**
 * `width` 可与 `open` 一样传零参 getter，避免 Hybrid/compileSource 下首帧快照不随 signal 更新。
 */
export type ModalWidthInput =
  | ModalWidthPrimitive
  | (() => ModalWidthPrimitive | undefined);

/**
 * `title` 支持零参 getter；`false` 与 `null` 均不展示标题栏。
 */
export type ModalTitleInput =
  | string
  | null
  | false
  | (() => string | null | false | undefined);

/**
 * 模态层在视口内垂直落位：当前仅 `bottom`（与底部对齐，适配 Home 条安全区），后续可扩展如 `top`。
 */
export type ModalPlacement = "bottom";

export interface ModalProps {
  /**
   * 是否打开（受控）。
   * 推荐 `open={signal}`；勿依赖 `open={x.value}` 在 Hybrid 下随点击更新。
   */
  open?: ModalOpenInput;
  /** 关闭回调（关闭按钮、遮罩、Esc 触发） */
  onClose?: () => void;
  /** 标题；传 null 或 false 不显示标题栏；可传 `() => string` 订阅 signal */
  title?: ModalTitleInput;
  /**
   * 标题主文案对齐：`center` 在弹层内水平居中（默认）；`left` 与右侧操作按钮两端排布。
   */
  titleAlign?: ModalTitleAlign;
  /** 弹层内容；可传 `() => VNode` 零参 getter 与宽度同步更新 */
  children?: unknown;
  /** 底部区域：传 VNode 或 null 不显示；不传时默认无 footer */
  footer?: unknown;
  /** 是否显示右上角关闭按钮，默认 true */
  closable?: boolean;
  /** 点击遮罩是否关闭，默认 true；`mask={false}` 时不渲染遮罩，本项无实际点击目标 */
  maskClosable?: boolean;
  /** 是否渲染半透明遮罩；`false` 时不渲染遮罩层且不挡背后点击，宜配合 keyboard/关闭按钮 */
  mask?: boolean;
  /** 弹层宽度：预设或 CSS 字符串、数字（px）；默认 "520px"（等同 sm）；可传 `() => 同上` */
  width?: ModalWidthInput;
  /**
   * 是否在视口内垂直居中；`false` 时靠上并留顶距（与 Ant Design 顶部对齐相近）。
   * 与 {@link placement} 同传时，以 `placement` 为准（`placement="bottom"` 时不再使用本项的垂直方向）。
   */
  centered?: boolean;
  /**
   * 在遮罩中的垂直落位。传 `bottom` 时自底部对齐（如底部 Sheet），并预留 `safe-area` 下内边距；水平仍居中。
   * 未传时沿用 `centered` 的居上/居中行为。
   */
  placement?: ModalPlacement;
  /** 关闭后是否销毁子节点（不挂载），默认 false */
  destroyOnClose?: boolean;
  /** 是否支持 Esc 关闭，默认 false；传 true 时按 Esc 触发 onClose */
  keyboard?: boolean;
  /** 是否可拖动（标题栏拖拽），默认 false；传 true 时可拖移弹层 */
  draggable?: boolean;
  /**
   * 每次打开弹层时是否初始为全屏布局；关闭后重置为窗口态。
   * 与 `fullscreenable` 独立；二者可同时使用（打开即全屏且保留切换按钮）。
   */
  fullscreen?: boolean;
  /** 是否显示全屏切换按钮（与关闭按钮并排），默认 false；传 true 时显示 */
  fullscreenable?: boolean;
  /** 遮罩 class（仅 `mask !== false` 时生效） */
  maskClass?: string;
  /** 弹层容器 class */
  wrapClass?: string;
  /** 内容区 class */
  bodyClass?: string;
  /**
   * 底部栏（含确定/取消等）外层 flex 容器的 class，与默认的 `justify-end` 等合并；用于 `Dialog` 在窄屏居中等。
   */
  footerClass?: string;
  /** 额外 class（作用于弹层盒子） */
  class?: string;
}

const defaultWidth = "520px";

/** 预设宽度：xs/sm/md/lg/xl 对应 400/520/640/800/960px */
const WIDTH_PRESETS: Record<string, string> = {
  xs: "400px",
  sm: "520px",
  md: "640px",
  lg: "800px",
  xl: "960px",
};

/**
 * 解析 `width`：支持快照或零参 getter；getter 返回 `undefined` 时用默认宽度。
 *
 * @param v - `ModalProps.width`
 * @returns 用于样式计算的宽度原始值
 */
function readModalWidthInput(
  v: ModalWidthInput | undefined,
): ModalWidthPrimitive {
  if (v === undefined) return defaultWidth;
  if (typeof v === "function") {
    if ((v as () => unknown).length !== 0) return defaultWidth;
    const inner = (v as () => ModalWidthPrimitive | undefined)();
    return inner === undefined ? defaultWidth : inner;
  }
  return v;
}

/**
 * 解析 `title`：`null`/`false`/空串不展示标题栏；支持零参 getter。
 *
 * @param v - `ModalProps.title`
 * @returns 展示用文案，`null` 表示无标题栏
 */
function readModalTitleInput(v: ModalTitleInput | undefined): string | null {
  if (v === undefined) return null;
  if (typeof v === "function") {
    if ((v as () => unknown).length !== 0) return null;
    const t = (v as () => unknown)();
    if (t === null || t === false || t === undefined) return null;
    if (typeof t === "string") return t === "" ? null : t;
    return String(t);
  }
  if (v === null || v === false) return null;
  if (typeof v === "string") return v === "" ? null : v;
  return String(v);
}

/**
 * 解析 `children`：若为无参函数则调用一次（用于与 signal 同步的子树）。
 *
 * @param v - `ModalProps.children`
 * @returns 实际插入内容区的节点描述
 */
function readModalChildrenInput(v: unknown): unknown {
  if (typeof v === "function" && (v as () => unknown).length === 0) {
    return (v as () => unknown)();
  }
  return v;
}

/**
 * 仅当 `globalThis.document` 与 `body` 存在且为元素节点时设置 `body.style.overflow`。
 *
 * @param overflow - 写入 `overflow` 的 CSS 值
 */
function trySetDocumentBodyOverflow(overflow: string): void {
  try {
    if (typeof globalThis.document === "undefined") return;
    const b = globalThis.document.body;
    if (b == null || b.nodeType !== 1) return;
    const st = b.style;
    if (st == null) return;
    st.overflow = overflow;
  } catch {
    /* 非浏览器或受限环境 */
  }
}

/**
 * 标题栏按下时开始拖动：按下位置即起点，只按位移累加。
 * 在 globalThis.document 上监听 mousemove/mouseup，requestAnimationFrame 节流 + passive，保证跟手。
 *
 * @param getPosition - 当前位移 getter
 * @param setPosition - 设置位移
 * @param enabled - 是否启用拖动
 * @returns mousedown 处理器
 */
function useDrag(
  getPosition: () => { x: number; y: number },
  setPosition: (v: { x: number; y: number }) => void,
  enabled: boolean,
): (e: MouseEvent) => void {
  return (e: MouseEvent) => {
    if (!enabled) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = getPosition();
    let rafId = 0;
    const onMove = (ev: MouseEvent) => {
      const nextX = startPos.x + ev.clientX - startX;
      const nextY = startPos.y + ev.clientY - startY;
      if (rafId) globalThis.cancelAnimationFrame(rafId);
      rafId = globalThis.requestAnimationFrame(() => {
        rafId = 0;
        setPosition({ x: nextX, y: nextY });
      });
    };
    const doc = typeof globalThis.document !== "undefined"
      ? globalThis.document
      : null;
    const onUp = () => {
      if (rafId) globalThis.cancelAnimationFrame(rafId);
      if (!doc) return;
      doc.removeEventListener(
        "mousemove",
        onMove,
        { passive: true } as AddEventListenerOptions,
      );
      doc.removeEventListener("mouseup", onUp);
    };
    if (doc) {
      doc.addEventListener("mousemove", onMove, { passive: true });
      doc.addEventListener("mouseup", onUp);
    }
  };
}

/**
 * 模态弹窗：遮罩、可拖拽、全屏切换、Portal 到 body 或 SSR 内联。
 *
 * @param props - 弹层配置
 * @returns 占位锚点 + Portal，或内联弹层，或 `null`
 */
export function Modal(props: ModalProps): JSX.Element | null {
  const {
    onClose,
    footer = null,
    closable = true,
    maskClosable = true,
    mask: showMask = true,
    centered = true,
    destroyOnClose = false,
    keyboard = false,
    draggable = false,
    fullscreen: startInFullscreen = false,
    fullscreenable = false,
    titleAlign = "center",
    maskClass,
    wrapClass,
    bodyClass,
    footerClass,
    class: className,
  } = props;

  /** 全屏态与拖拽位移；必须在每次渲染中按固定顺序初始化（与 hooks 一致）。 */
  const fullscreen = useSignal(false);
  const position = useSignal({ x: 0, y: 0 });

  /**
   * 渲染路径读取 `open` / `width` / `title` / `children`，便于订阅传入的 `Signal` 与零参 getter。
   */
  const isOpen = readControlledOpenInput(props.open);
  const resolvedWidth = readModalWidthInput(props.width);
  const resolvedTitle = readModalTitleInput(props.title);
  const resolvedChildren = readModalChildrenInput(props.children);

  /**
   * `fullscreen` prop：每次打开时同步初始全屏态，关闭时清零。
   */
  useLayoutEffect(() => {
    if (isOpen) {
      fullscreen.value = !!startInFullscreen;
    } else {
      fullscreen.value = false;
    }
  }, [isOpen, startInFullscreen]);

  /** 打开时在 document 上监听 Esc；关闭或卸载时移除 */
  useEffect(() => {
    if (!isOpen) return;
    const doc = typeof globalThis.document !== "undefined"
      ? globalThis.document
      : null;
    if (!doc) return;
    const handler = (e: KeyboardEvent) => {
      if (keyboard && e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
    };
    doc.addEventListener("keydown", handler as EventListener);
    return () => doc.removeEventListener("keydown", handler as EventListener);
  }, [isOpen, keyboard, onClose]);

  /** 打开时锁定 body 滚动，关闭或卸载时恢复 */
  useEffect(() => {
    if (!isOpen) return;
    trySetDocumentBodyOverflow("hidden");
    return () => trySetDocumentBodyOverflow("");
  }, [isOpen]);

  const handleTitleMouseDown = useDrag(
    () => position.value,
    (v) => {
      position.value = v;
    },
    draggable,
  );

  const handleMaskClick = (e: Event) => {
    if (e.target === e.currentTarget && maskClosable && showMask) {
      onClose?.();
    }
  };

  /**
   * 弹层 DOM：`style` 须为 camelCase 对象（勿用整段 cssText 字符串作 style={…}）。
   */
  const buildModalMarkup = (): JSX.Element => {
    const w = resolvedWidth;
    const widthStyle = typeof w === "number"
      ? `${w}px`
      : (WIDTH_PRESETS[w as string] ?? String(w));
    const title = resolvedTitle;
    const children = resolvedChildren;
    const isFullscreen = fullscreen.value;
    const pos = position.value;
    const hasOffset = pos.x !== 0 || pos.y !== 0;
    const modalBoxStyle: Record<string, string> = isFullscreen
      ? {
        width: "100%",
        height: "100%",
        maxWidth: "100vw",
        maxHeight: "100vh",
      }
      : {
        width: widthStyle,
        ...(draggable
          ? {
            transform: `translate(${pos.x}px,${pos.y}px)`,
            ...(hasOffset ? { willChange: "transform" } : {}),
          }
          : {}),
      };
    const modalClass = isFullscreen
      ? "rounded-none"
      : "rounded-xl max-h-[90vh]";
    const showHeaderActions = fullscreenable || closable;
    /**
     * 无标题栏但仍有关闭/全屏：操作区 `absolute` 在盒内右上；正文须加大上/右内边距以免与按钮重叠。
     * 与顶距同理，不用仅依赖 `pt-12 pr-12`/`top-4` 等 Tailwind（宿主可能未扫描本包导致 purge）。
     */
    const noTitleWithHeaderActions = !(title != null && title !== "") &&
      showHeaderActions;
    const wrapZ = isFullscreen ? 9999 : 300;
    const placement = props.placement;

    return (
      <div
        class={twMerge(
          "fixed inset-0 flex justify-center",
          placement === "bottom"
            ? "items-end pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-0 px-0 sm:px-4"
            : (centered ? "items-center" : "items-start"),
          !showMask && "pointer-events-none",
          wrapClass,
        )}
        style={{
          zIndex: wrapZ,
          ...(placement !== "bottom" && !centered && !isFullscreen
            ? {
              /** 至少 3rem，并吃进刘海安全区；不依赖 Tailwind 是否扫描本包 */
              paddingTop: "max(3rem, env(safe-area-inset-top, 0px))",
            }
            : {}),
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {showMask
          ? (
            <div
              class={twMerge(
                "absolute inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm transition-opacity",
                maskClass,
              )}
              onClick={handleMaskClick as unknown as (e: Event) => void}
              aria-hidden
            />
          )
          : null}
        <div
          class={twMerge(
            "relative z-10 flex flex-col shadow-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100",
            !showMask && "pointer-events-auto",
            modalClass,
            className,
          )}
          style={modalBoxStyle}
          onClick={(e: Event) => e.stopPropagation()}
        >
          {(title != null && title !== "")
            ? (
              <div
                class={twMerge(
                  "shrink-0 px-6 py-4 border-b border-slate-200 dark:border-slate-600",
                  titleAlign === "center"
                    ? "relative flex min-h-14 items-center justify-center"
                    : "flex items-center justify-between",
                  draggable && "cursor-grab active:cursor-grabbing select-none",
                )}
                onMouseDown={handleTitleMouseDown as unknown as (
                  e: Event,
                ) => void}
              >
                <h2
                  id="modal-title"
                  class={twMerge(
                    "text-lg font-semibold min-w-0 truncate box-border",
                    titleAlign === "center"
                      ? showHeaderActions
                        ? "w-full text-center px-14 sm:px-16"
                        : "w-full text-center px-1"
                      : "flex-1 pr-2 text-left",
                  )}
                >
                  {title}
                </h2>
                {showHeaderActions && (
                  <div
                    class={twMerge(
                      "flex items-center gap-1 shrink-0",
                      titleAlign === "center" &&
                        "absolute right-4 top-1/2 -translate-y-1/2",
                    )}
                  >
                    {fullscreenable && (
                      <button
                        type="button"
                        aria-label={isFullscreen ? "退出全屏" : "全屏"}
                        class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                        onMouseDown={(e: Event) => e.stopPropagation()}
                        onClick={(e: Event) => {
                          e.stopPropagation();
                          fullscreen.value = !fullscreen.value;
                        }}
                      >
                        {isFullscreen
                          ? <IconExitFullscreen class="w-5 h-5" />
                          : <IconMaximize2 class="w-5 h-5" />}
                      </button>
                    )}
                    {closable && (
                      <button
                        type="button"
                        aria-label="关闭"
                        class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                        onMouseDown={(e: Event) => e.stopPropagation()}
                        onClick={() => onClose?.()}
                      >
                        <IconClose class="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
            : showHeaderActions
            ? (
              <div
                class="flex items-center"
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  zIndex: 10,
                  gap: "0.25rem",
                }}
              >
                {fullscreenable && (
                  <button
                    type="button"
                    aria-label={isFullscreen ? "退出全屏" : "全屏"}
                    class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                    onMouseDown={(e: Event) => e.stopPropagation()}
                    onClick={(e: Event) => {
                      e.stopPropagation();
                      fullscreen.value = !fullscreen.value;
                    }}
                  >
                    {isFullscreen
                      ? <IconExitFullscreen class="w-5 h-5" />
                      : <IconMaximize2 class="w-5 h-5" />}
                  </button>
                )}
                {closable && (
                  <button
                    type="button"
                    aria-label="关闭"
                    class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                    onMouseDown={(e: Event) => e.stopPropagation()}
                    onClick={() => onClose?.()}
                  >
                    <IconClose class="w-5 h-5" />
                  </button>
                )}
              </div>
            )
            : null}
          <div
            class={twMerge(
              "flex-1 overflow-auto px-6 py-4 min-h-0",
              bodyClass,
            )}
            style={noTitleWithHeaderActions
              ? {
                /** 对应原 `pt-12 pr-12`（3rem），为右上关闭/全屏预留 */
                paddingTop: "3rem",
                paddingRight: "3rem",
              }
              : undefined}
          >
            {children as ComponentChildren}
          </div>
          {footer != null && (
            <div
              class={twMerge(
                "shrink-0 flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200 dark:border-slate-600",
                footerClass,
              )}
            >
              {footer as ComponentChildren}
            </div>
          )}
        </div>
      </div>
    );
  };

  const portalHost = getBrowserBodyPortalHost();

  if (portalHost != null) {
    if (destroyOnClose && !isOpen) {
      return null;
    }
    return (
      <>
        <span
          style="display:none;width:0;height:0;overflow:hidden;position:absolute;clip:rect(0,0,0,0)"
          aria-hidden="true"
          data-dreamer-modal-portal-anchor=""
        />
        {isOpen ? createPortal(buildModalMarkup(), portalHost) : null}
      </>
    );
  }

  if (!isOpen) {
    return null;
  }
  return buildModalMarkup();
}
