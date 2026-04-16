/**
 * Tooltip 悬停提示（Preact）。
 * 触发器悬停显示气泡；placement、箭头。
 * 有 `document.body` 时气泡经 {@link createPortal} 挂到 body，`fixed` 定位，避免祖先 `overflow` 裁切；否则回退为包裹层内 `absolute`。
 */

import type { ComponentChildren, JSX } from "preact";
import { createPortal } from "preact/compat";
import { useCallback, useLayoutEffect, useRef, useState } from "preact/hooks";
import { twMerge } from "tailwind-merge";

export type TooltipPlacement =
  | "top"
  | "topLeft"
  | "topRight"
  | "bottom"
  | "bottomLeft"
  | "bottomRight"
  | "left"
  | "leftTop"
  | "leftBottom"
  | "right"
  | "rightTop"
  | "rightBottom";

export interface TooltipProps {
  content: string | ComponentChildren;
  placement?: TooltipPlacement;
  children?: ComponentChildren;
  arrow?: boolean;
  class?: string;
  overlayClass?: string;
}

const TOOLTIP_VIEWPORT_GAP_PX = 8;

/** 占位矩形，仅作 useState 初值，首帧 hover 前由 {@link syncFloatGeometry} 覆盖 */
const EMPTY_DOM_RECT = {
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
} as unknown as DOMRect;

/**
 * 根据触发器视口矩形与 placement，计算 Portal 浮层 `fixed` 的 left/top/transform（像素）。
 *
 * @param placement - 气泡相对触发器的方位
 * @param rect - 触发器 {@link DOMRect}
 * @param gap - 与触发器边距（px）
 */
function getTooltipFixedStyle(
  placement: TooltipPlacement,
  rect: DOMRect,
  gap: number,
): { left: string; top: string; transform: string } {
  const L = rect.left;
  const R = rect.right;
  const T = rect.top;
  const B = rect.bottom;
  const cx = L + rect.width / 2;
  const cy = T + rect.height / 2;
  switch (placement) {
    case "top":
      return {
        left: `${cx}px`,
        top: `${T - gap}px`,
        transform: "translate(-50%, -100%)",
      };
    case "topLeft":
      return {
        left: `${L}px`,
        top: `${T - gap}px`,
        transform: "translate(0, -100%)",
      };
    case "topRight":
      return {
        left: `${R}px`,
        top: `${T - gap}px`,
        transform: "translate(-100%, -100%)",
      };
    case "bottom":
      return {
        left: `${cx}px`,
        top: `${B + gap}px`,
        transform: "translate(-50%, 0)",
      };
    case "bottomLeft":
      return {
        left: `${L}px`,
        top: `${B + gap}px`,
        transform: "translate(0, 0)",
      };
    case "bottomRight":
      return {
        left: `${R}px`,
        top: `${B + gap}px`,
        transform: "translate(-100%, 0)",
      };
    case "left":
      return {
        left: `${L - gap}px`,
        top: `${cy}px`,
        transform: "translate(-100%, -50%)",
      };
    case "leftTop":
      return {
        left: `${L - gap}px`,
        top: `${T}px`,
        transform: "translate(-100%, 0)",
      };
    case "leftBottom":
      return {
        left: `${L - gap}px`,
        top: `${B}px`,
        transform: "translate(-100%, -100%)",
      };
    case "right":
      return {
        left: `${R + gap}px`,
        top: `${cy}px`,
        transform: "translate(0, -50%)",
      };
    case "rightTop":
      return {
        left: `${R + gap}px`,
        top: `${T}px`,
        transform: "translate(0, 0)",
      };
    case "rightBottom":
      return {
        left: `${R + gap}px`,
        top: `${B}px`,
        transform: "translate(0, -100%)",
      };
    default:
      return {
        left: `${cx}px`,
        top: `${T - gap}px`,
        transform: "translate(-50%, -100%)",
      };
  }
}

function arrowClass(placement: TooltipPlacement): string {
  const base = "absolute w-2 h-2 rotate-45 bg-slate-800 dark:bg-slate-700";
  if (placement.startsWith("top")) {
    return `${base} bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2`;
  }
  if (placement.startsWith("bottom")) {
    return `${base} top-0 left-1/2 -translate-x-1/2 -translate-y-1/2`;
  }
  if (placement.startsWith("left")) {
    return `${base} right-0 top-1/2 -translate-y-1/2 translate-x-1/2`;
  }
  if (placement.startsWith("right")) {
    return `${base} left-0 top-1/2 -translate-y-1/2 -translate-x-1/2`;
  }
  return base;
}

const placementClasses: Record<TooltipPlacement, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  topLeft: "bottom-full left-0 mb-2",
  topRight: "bottom-full right-0 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  bottomLeft: "top-full left-0 mt-2",
  bottomRight: "top-full right-0 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  leftTop: "right-full top-0 mr-2",
  leftBottom: "right-full bottom-0 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
  rightTop: "left-full top-0 ml-2",
  rightBottom: "left-full bottom-0 ml-2",
};

const bubbleInnerCls =
  "relative w-max max-w-[min(20rem,calc(100vw-1rem))] px-3 py-1.5 text-xs font-normal text-white text-left whitespace-normal break-words rounded-md bg-slate-800 dark:bg-slate-700 shadow-lg box-border";

/**
 * 是否可将 Portal 挂到 `document.body`（非浏览器或 SSR 时为 false）。
 */
function getBodyPortalHost(): HTMLElement | null {
  try {
    if (typeof globalThis.document === "undefined") return null;
    const b = globalThis.document.body;
    if (b == null || b.nodeType !== 1) return null;
    return b as HTMLElement;
  } catch {
    return null;
  }
}

/**
 * Tooltip：包裹子节点并在悬停时展示内容；默认 Portal 到 body 避免裁切。
 */
export function Tooltip(props: TooltipProps): JSX.Element {
  const {
    content,
    placement = "top",
    children,
    arrow = true,
    class: className,
    overlayClass,
  } = props;

  const tooltipId = `tooltip-${Math.random().toString(36).slice(2, 11)}`;
  const arrowCls = arrow ? arrowClass(placement) : "";
  const posCls = placementClasses[placement];

  const wrapRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [floatStyle, setFloatStyle] = useState(() =>
    getTooltipFixedStyle(placement, EMPTY_DOM_RECT, TOOLTIP_VIEWPORT_GAP_PX)
  );

  const portalHostOk = getBodyPortalHost() != null;

  const syncFloatGeometry = useCallback(() => {
    const el = wrapRef.current;
    if (el == null) return;
    setFloatStyle(
      getTooltipFixedStyle(
        placement,
        el.getBoundingClientRect(),
        TOOLTIP_VIEWPORT_GAP_PX,
      ),
    );
  }, [placement]);

  useLayoutEffect(() => {
    if (!visible || !portalHostOk) return;
    syncFloatGeometry();
    const onScrollOrResize = () => {
      syncFloatGeometry();
    };
    globalThis.addEventListener?.("scroll", onScrollOrResize, true);
    globalThis.addEventListener?.("resize", onScrollOrResize);
    return () => {
      globalThis.removeEventListener?.("scroll", onScrollOrResize, true);
      globalThis.removeEventListener?.("resize", onScrollOrResize);
    };
  }, [visible, portalHostOk, syncFloatGeometry]);

  const onEnter = () => {
    syncFloatGeometry();
    setVisible(true);
  };
  const onLeave = () => {
    setVisible(false);
  };

  if (!portalHostOk) {
    return (
      <span
        class={twMerge("relative inline-flex group", className)}
        aria-describedby={tooltipId}
      >
        {children}
        <span
          id={tooltipId}
          role="tooltip"
          class={twMerge(
            "absolute z-1070 w-max max-w-[min(20rem,calc(100vw-1rem))] px-3 py-1.5 text-xs font-normal text-white text-left whitespace-normal break-words rounded-md bg-slate-800 dark:bg-slate-700 shadow-lg",
            "opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-150 pointer-events-none box-border",
            posCls,
            overlayClass,
          )}
        >
          {content}
          {arrow && <span class={arrowCls} />}
        </span>
      </span>
    );
  }

  const host = getBodyPortalHost();

  return (
    <span
      ref={wrapRef}
      class={twMerge("relative inline-flex", className)}
      aria-describedby={visible ? tooltipId : undefined}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {children}
      {visible && host != null &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            class={twMerge(
              "fixed z-[1070] pointer-events-none transition-opacity duration-150 opacity-100 visible",
              overlayClass,
            )}
            style={{
              left: floatStyle.left,
              top: floatStyle.top,
              transform: floatStyle.transform,
            }}
          >
            <div class={bubbleInnerCls}>
              {content}
              {arrow && <span class={arrowCls} />}
            </div>
          </div>,
          host,
        )}
    </span>
  );
}
