/**
 * Drawer 侧边抽屉（Preact）。
 * 有 `document.body` 时用 `createPortal` 挂到 body；`open` 支持 `Signal<boolean>` 与零参 getter。
 */

import { useEffect } from "preact/hooks";
import { createPortal } from "preact/compat";
import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { IconClose } from "../basic/icons/Close.tsx";
import {
  type ControlledOpenInput,
  readControlledOpenInput,
} from "./controlled-open.ts";
import { getBrowserBodyPortalHost } from "./portal-host.ts";

export type DrawerPlacement = "left" | "right";

export type DrawerTitleAlign = "left" | "center";

export type DrawerTitleInput =
  | string
  | number
  | null
  | false
  | ComponentChildren
  | (() => DrawerTitleInput | undefined);

/** `open`：与 {@link ControlledOpenInput} 一致 */
export type DrawerOpenInput = ControlledOpenInput;

type DrawerTitleResolved =
  | { kind: "hidden" }
  | { kind: "text"; text: string }
  | { kind: "custom"; content: ComponentChildren };

export interface DrawerProps {
  open?: DrawerOpenInput;
  onClose?: () => void;
  placement?: DrawerPlacement;
  width?: string | number;
  title?: DrawerTitleInput;
  titleAlign?: DrawerTitleAlign;
  children?: ComponentChildren;
  footer?: ComponentChildren | null;
  closable?: boolean;
  maskClosable?: boolean;
  destroyOnClose?: boolean;
  keyboard?: boolean;
  class?: string;
  titleBarClass?: string;
  contentClass?: string;
}

const defaultWidth = "360px";

function readDrawerTitleInput(
  v: DrawerTitleInput | undefined,
): DrawerTitleResolved {
  if (v === undefined || v === null || v === false) return { kind: "hidden" };
  if (typeof v === "function") {
    if ((v as () => unknown).length !== 0) return { kind: "hidden" };
    return readDrawerTitleInput((v as () => DrawerTitleInput | undefined)());
  }
  if (typeof v === "boolean") return { kind: "hidden" };
  if (typeof v === "string") {
    return v === "" ? { kind: "hidden" } : { kind: "text", text: v };
  }
  if (typeof v === "number" && !Number.isNaN(v)) {
    return { kind: "text", text: String(v) };
  }
  return { kind: "custom", content: v as ComponentChildren };
}

function trySetDocumentBodyOverflow(overflow: string): void {
  try {
    if (typeof globalThis.document === "undefined") return;
    const b = globalThis.document.body;
    if (b == null || b.nodeType !== 1) return;
    const st = b.style;
    if (st == null) return;
    st.overflow = overflow;
  } catch {
    /* 忽略 */
  }
}

/**
 * 侧边抽屉：遮罩、滑入动画、Esc 关闭。
 */
export function Drawer(props: DrawerProps): JSX.Element | null {
  const {
    onClose,
    placement = "right",
    width = defaultWidth,
    children,
    footer = null,
    closable = true,
    maskClosable = true,
    destroyOnClose = false,
    keyboard = true,
    titleAlign = "left",
    class: className,
    titleBarClass,
    contentClass,
  } = props;

  const isOpen = readControlledOpenInput(props.open);
  const resolvedTitle = readDrawerTitleInput(props.title);

  const widthStyle = typeof width === "number" ? `${width}px` : String(width);
  const drawerPanelStyle: Record<string, string> = {
    width: widthStyle,
    maxWidth: "100vw",
    height: "100%",
    maxHeight: "100dvh",
  };
  const isLeft = placement === "left";

  useEffect(() => {
    if (isOpen) {
      trySetDocumentBodyOverflow("hidden");
      return () => trySetDocumentBodyOverflow("");
    }
  }, [isOpen]);

  /**
   * 首挂时滑入动画。
   */
  const setDrawerRef = (el: unknown) => {
    if (el == null || typeof el !== "object") return;
    const st = (el as HTMLElement).style;
    if (st == null) return;
    const elWithFlag = el as HTMLElement & { _drawerAnimated?: boolean };
    if (elWithFlag._drawerAnimated) return;
    elWithFlag._drawerAnimated = true;
    st.transition = "transform 0.2s ease-out";
    st.transform = isLeft ? "translateX(-100%)" : "translateX(100%)";
    const raf = globalThis.requestAnimationFrame;
    if (raf) {
      raf(() => {
        st.transform = "translateX(0)";
      });
    } else st.transform = "translateX(0)";
  };

  const buildDrawerMarkup = (): JSX.Element => {
    const handleMaskClick = (e: Event) => {
      if (e.target === e.currentTarget && maskClosable) onClose?.();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (keyboard && e.key === "Escape") onClose?.();
    };

    const t = resolvedTitle;
    const showTitleBar = t.kind !== "hidden";

    return (
      <div
        class={twMerge(
          "fixed inset-0 z-300 flex min-h-0",
          isLeft ? "justify-start" : "justify-end",
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={showTitleBar ? "drawer-title" : undefined}
        tabIndex={-1}
        onKeyDown={(e: Event) => handleKeyDown(e as KeyboardEvent)}
      >
        <div
          class={twMerge(
            "absolute inset-0 bg-slate-900/35 transition-opacity",
          )}
          onClick={(e: Event) => handleMaskClick(e)}
          aria-hidden
        />
        <div
          ref={setDrawerRef}
          class={twMerge(
            "relative z-10 flex min-h-0 flex-col h-full max-h-[100dvh] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xl",
            isLeft ? "ml-0" : "ml-auto",
            className,
          )}
          style={drawerPanelStyle}
          onClick={(e: Event) => e.stopPropagation()}
        >
          {showTitleBar && (
            <div
              class={twMerge(
                "shrink-0 border-b border-slate-200 px-6 py-4 dark:border-slate-600",
                titleAlign === "center"
                  ? "relative flex min-h-14 items-center justify-center"
                  : "flex items-center justify-between gap-2",
                titleBarClass,
              )}
            >
              {t.kind === "text"
                ? (
                  <h2
                    id="drawer-title"
                    class={twMerge(
                      "text-lg font-semibold min-w-0 truncate box-border",
                      titleAlign === "center"
                        ? closable
                          ? "w-full text-center px-14 sm:px-16"
                          : "w-full text-center px-1"
                        : "flex-1 pr-2 text-left",
                    )}
                  >
                    {t.text}
                  </h2>
                )
                : (
                  <div
                    id="drawer-title"
                    class={twMerge(
                      "min-w-0 box-border",
                      titleAlign === "center"
                        ? closable
                          ? "w-full flex justify-center px-14 sm:px-16"
                          : "w-full flex justify-center px-1"
                        : "flex-1 min-w-0 pr-2 text-left",
                    )}
                  >
                    {t.content}
                  </div>
                )}
              {closable && (
                <button
                  type="button"
                  aria-label="关闭"
                  class={twMerge(
                    "p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 shrink-0",
                    titleAlign === "center" &&
                      "absolute right-4 top-1/2 -translate-y-1/2",
                  )}
                  onClick={() => onClose?.()}
                >
                  <IconClose class="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          {!showTitleBar && closable && (
            <div class="absolute top-4 right-4 z-10">
              <button
                type="button"
                aria-label="关闭"
                class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                onClick={() => onClose?.()}
              >
                <IconClose class="w-5 h-5" />
              </button>
            </div>
          )}
          <div
            class={twMerge(
              "min-h-0 flex-1 overflow-auto px-6 py-4",
              contentClass,
            )}
          >
            {children}
          </div>
          {footer != null && (
            <div class="shrink-0 flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200 dark:border-slate-600">
              {footer}
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
          data-dreamer-drawer-portal-anchor=""
        />
        {isOpen ? createPortal(buildDrawerMarkup(), portalHost) : null}
      </>
    );
  }

  if (!isOpen) return null;
  return buildDrawerMarkup();
}
