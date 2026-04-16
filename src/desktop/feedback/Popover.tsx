/**
 * Popover 弹出面板（Preact）。
 * 桌面常用：悬停或点击触发，显示带标题的面板；支持 placement、箭头。
 * 当前为悬停触发；若需点击触发可由上层受控 open 配合使用。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";

export type PopoverPlacement =
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
 * Popover：CSS `group-hover` 展示浮层，无内部 Signal。
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
  } = props;

  const posCls = placementClasses[placement];
  const arrowCls = arrow ? arrowClass(placement) : "";

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
