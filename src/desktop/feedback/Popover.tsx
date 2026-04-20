/**
 * Popover 弹出面板（Preact）。
 * 桌面常用：悬停触发，显示带标题的面板；支持 placement、箭头。
 * 有 `document.body` 时经 {@link createPortal} 挂到 body 且 `position: fixed`，与 {@link ../../shared/feedback/Tooltip.tsx} 同策略；
 * 否则回退为包裹层内 `absolute` + `group-hover`，便于 SSR/无 DOM。
 */

import type { ComponentChildren, JSX } from "preact";
import { createPortal } from "preact/compat";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "preact/hooks";
import { twMerge } from "tailwind-merge";
import { getBrowserBodyPortalHost } from "../../shared/feedback/portal-host.ts";
import {
  computePopFixedStyle,
  type FullPopStylePlacement,
  POP_FIXED_STYLE_RESET,
} from "../../shared/feedback/popFixedStyle.ts";

export type PopoverPlacement = FullPopStylePlacement;

export interface PopoverProps {
  /** 面板标题（可选） */
  title?: string | null;
  /** 面板内容 */
  content: string | ComponentChildren;
  /** 气泡位置，默认 "top" */
  placement?: PopoverPlacement;
  /** 触发元素（子节点） */
  children?: ComponentChildren;
  /** 是否显示箭头，默认 true */
  arrow?: boolean;
  /** 额外 class（作用于包装器） */
  class?: string;
  /** 面板容器 class */
  overlayClass?: string;
  /**
   * 进入触发区后多少 ms 再显示浮层（Portal 路径），默认 0。
   * 若大于 0，可与 `hoverCloseDelay` 配合从触发区移入浮层。
   */
  hoverOpenDelay?: number;
  /**
   * 离开触发区/浮层后多少 ms 再收起，默认 100。
   */
  hoverCloseDelay?: number;
}

const placementClasses: Record<PopoverPlacement, string> = {
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

/**
 * 根据 placement 生成箭头根节点的 Tailwind 类名。
 *
 * @param placement - 气泡方位
 */
function arrowClass(placement: PopoverPlacement): string {
  const base =
    "absolute w-2 h-2 rotate-45 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600";
  if (placement.startsWith("top")) {
    return `${base} bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-t-0 border-l-0`;
  }
  if (placement.startsWith("bottom")) {
    return `${base} top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-b-0 border-r-0`;
  }
  if (placement.startsWith("left")) {
    return `${base} right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-b-0 border-l-0`;
  }
  if (placement.startsWith("right")) {
    return `${base} left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 border-t-0 border-r-0`;
  }
  return base;
}

/**
 * Popover：悬停展示浮层；默认 Portal + `fixed` + rAF 对齐触发器。
 *
 * @param props - 内容与定位配置
 */
export function Popover(props: PopoverProps): JSX.Element {
  const {
    title,
    content,
    placement = "top",
    children,
    arrow = true,
    class: className,
    overlayClass,
    hoverOpenDelay = 0,
    hoverCloseDelay = 100,
  } = props;

  const hoverTimers = useRef({ open: 0, close: 0 });
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [portalFixedStyle, setPortalFixedStyle] = useState<
    Record<string, string>
  >({});

  const portalHost = getBrowserBodyPortalHost();
  const portalHostOk = portalHost != null;

  const posCls = placementClasses[placement];
  const arrowCls = arrow ? arrowClass(placement) : "";

  /**
   * 同步浮层 `fixed` 几何：展开期每帧调用，使滚动/动画下仍贴住触发器。
   */
  const syncPortalPosition = useCallback(() => {
    const el = wrapRef.current;
    if (el == null) return;
    const tr = el.getBoundingClientRect();
    setPortalFixedStyle({
      ...POP_FIXED_STYLE_RESET,
      ...computePopFixedStyle(tr, placement),
    });
  }, [placement]);

  useLayoutEffect(() => {
    if (visible && portalHostOk) {
      syncPortalPosition();
    }
  }, [visible, portalHostOk, syncPortalPosition]);

  useEffect(() => {
    if (!visible || !portalHostOk) {
      setPortalFixedStyle({});
      return;
    }
    let running = true;
    let rafLoop = 0;
    const keepAligned = () => {
      if (!running) return;
      syncPortalPosition();
      rafLoop = globalThis.requestAnimationFrame(keepAligned);
    };
    rafLoop = globalThis.requestAnimationFrame(keepAligned);
    const onResize = () => syncPortalPosition();
    globalThis.window.addEventListener("resize", onResize);
    const vv = globalThis.visualViewport;
    vv?.addEventListener("resize", onResize);
    return () => {
      running = false;
      globalThis.cancelAnimationFrame(rafLoop);
      globalThis.window.removeEventListener("resize", onResize);
      vv?.removeEventListener("resize", onResize);
    };
  }, [visible, portalHostOk, syncPortalPosition]);

  /** 卸载时清空延迟任务，避免泄漏 */
  useEffect(() => {
    return () => {
      if (hoverTimers.current.open) {
        globalThis.clearTimeout(hoverTimers.current.open);
      }
      if (hoverTimers.current.close) {
        globalThis.clearTimeout(hoverTimers.current.close);
      }
    };
  }, []);

  const onHoverEnter = () => {
    if (hoverTimers.current.close) {
      globalThis.clearTimeout(hoverTimers.current.close);
      hoverTimers.current.close = 0;
    }
    if (hoverOpenDelay <= 0) {
      setVisible(true);
    } else {
      hoverTimers.current.open = globalThis.setTimeout(() => {
        setVisible(true);
        hoverTimers.current.open = 0;
      }, hoverOpenDelay);
    }
  };

  const onHoverLeave = () => {
    if (hoverTimers.current.open) {
      globalThis.clearTimeout(hoverTimers.current.open);
      hoverTimers.current.open = 0;
    }
    hoverTimers.current.close = globalThis.setTimeout(() => {
      setVisible(false);
      hoverTimers.current.close = 0;
    }, hoverCloseDelay);
  };

  /** 面板内壳：标题 + 正文 + 可选箭头（与原先 DOM 结构一致） */
  const panelShell = (
    <span
      class={twMerge(
        "relative z-0 block min-w-[140px] max-w-[320px] rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg text-slate-900 dark:text-slate-100",
        overlayClass,
      )}
    >
      {title != null && title !== "" && (
        <div class="px-3 py-2 border-b border-slate-200 dark:border-slate-600 font-medium text-sm">
          {title}
        </div>
      )}
      <div class="px-3 py-2 text-sm">
        {typeof content === "string" ? content : content}
      </div>
      {arrow && <span class={arrowCls} />}
    </span>
  );

  /** 无 body 时沿用 `group-hover`，行为与旧版一致 */
  if (!portalHostOk) {
    return (
      <span class={twMerge("relative inline-flex group", className)}>
        {children}
        <span
          class={twMerge(
            "absolute z-50 min-w-[140px] max-w-[320px] rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg text-slate-900 dark:text-slate-100",
            "opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-150 pointer-events-none",
            posCls,
            overlayClass,
          )}
        >
          {title != null && title !== "" && (
            <div class="px-3 py-2 border-b border-slate-200 dark:border-slate-600 font-medium text-sm">
              {title}
            </div>
          )}
          <div class="px-3 py-2 text-sm">
            {typeof content === "string" ? content : content}
          </div>
          {arrow && <span class={arrowCls} />}
        </span>
      </span>
    );
  }

  return (
    <span
      ref={wrapRef}
      class={twMerge("relative inline-flex", className)}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
    >
      {children}
      {visible && portalHost != null &&
        createPortal(
          <div
            class="pointer-events-auto fixed z-50 min-w-0 max-w-[min(320px,calc(100vw-1rem))] overflow-visible transition-opacity duration-150"
            style={portalFixedStyle}
            onMouseEnter={onHoverEnter}
            onMouseLeave={onHoverLeave}
          >
            {panelShell}
          </div>,
          portalHost,
        )}
    </span>
  );
}
