/**
 * Tag 标签（Preact）。
 * 通用标签；支持多色、可关闭、图标、尺寸。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import type { ColorVariant, SizeVariant } from "../types.ts";

export interface TagProps {
  /** 标签内容 */
  children?: ComponentChildren;
  /** 颜色/语义变体 */
  variant?: ColorVariant | "outline";
  /** 尺寸 */
  size?: SizeVariant;
  /** 是否可关闭（显示关闭图标） */
  closable?: boolean;
  /** 关闭回调 */
  onClose?: (e: Event) => void;
  /** 左侧图标节点 */
  icon?: ComponentChildren;
  /** 是否禁用（不可关闭、样式灰） */
  disabled?: boolean;
  /** 是否圆角胶囊 */
  rounded?: boolean;
  /** 额外 class */
  class?: string;
}

const sizeClasses: Record<SizeVariant, string> = {
  xs: "text-xs px-1.5 py-0.5 gap-1",
  sm: "text-xs px-2 py-1 gap-1.5",
  md: "text-sm px-2.5 py-1 gap-2",
  lg: "text-base px-3 py-1.5 gap-2",
};

const variantClasses: Record<ColorVariant | "outline", string> = {
  default:
    "bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-500",
  primary:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-700",
  secondary:
    "bg-slate-200 text-slate-800 dark:bg-slate-500 dark:text-slate-100 border border-slate-300 dark:border-slate-400",
  success:
    "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-700",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-700",
  danger:
    "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-700",
  ghost:
    "bg-transparent text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600",
  outline:
    "bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600",
};

/**
 * Tag：行内标签。
 */
export function Tag(props: TagProps): JSX.Element {
  const {
    children,
    variant = "default",
    size = "md",
    closable = false,
    onClose,
    icon,
    disabled = false,
    rounded = true,
    class: className,
  } = props;

  const handleClose = (e: Event) => {
    e.stopPropagation();
    if (!disabled) onClose?.(e);
  };

  return (
    <span
      class={twMerge(
        "inline-flex items-center font-medium shrink-0",
        sizeClasses[size],
        variantClasses[variant],
        rounded && "rounded-full",
        !rounded && "rounded-md",
        disabled && "opacity-60 cursor-not-allowed",
        className,
      )}
    >
      {icon != null && <span class="shrink-0 flex items-center">{icon}</span>}
      {children}
      {closable && !disabled && (
        <button
          type="button"
          class="shrink-0 ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
          onClick={handleClose as (e: Event) => void}
          aria-label="关闭"
        >
          <span class="text-current leading-none" aria-hidden>
            ×
          </span>
        </button>
      )}
    </span>
  );
}
