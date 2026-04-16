/**
 * Button 与 Link（链接按钮模式）共用的 Tailwind 类片段，单一数据源避免漂移。
 */

import type { ColorVariant, SizeVariant } from "../types.ts";

/** 各尺寸：与 {@link Button} 一致 */
export const BUTTON_SIZE_CLASSES: Record<SizeVariant, string> = {
  xs: "px-2.5 py-1 text-xs rounded-md",
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-5 py-2.5 text-base rounded-lg",
};

/** 语义配色变体：与 {@link Button} 一致 */
export const BUTTON_VARIANT_CLASSES: Record<ColorVariant, string> = {
  default:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 dark:border-slate-600",
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 border border-transparent dark:bg-blue-500 dark:hover:bg-blue-600",
  secondary:
    "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 dark:border-slate-500",
  success:
    "bg-green-600 text-white hover:bg-green-700 border border-transparent dark:bg-green-500 dark:hover:bg-green-600",
  warning:
    "bg-amber-500 text-white hover:bg-amber-600 border border-transparent dark:bg-amber-500 dark:hover:bg-amber-600",
  danger:
    "bg-red-600 text-white hover:bg-red-700 border border-transparent dark:bg-red-500 dark:hover:bg-red-600",
  ghost:
    "bg-transparent text-gray-800 hover:bg-gray-100 border border-gray-300 dark:border-transparent dark:text-slate-200 dark:hover:bg-slate-700 dark:border-slate-600",
};

/** 紧凑按钮组内 focus/active 背景，供 {@link Button} 使用 */
export const BUTTON_VARIANT_GROUP_FOCUS_ACTIVE: Record<ColorVariant, string> = {
  default:
    "focus:bg-gray-200 active:bg-gray-200 dark:focus:bg-slate-600 dark:active:bg-slate-600",
  primary:
    "focus:bg-blue-700 active:bg-blue-700 dark:focus:bg-blue-600 dark:active:bg-blue-600",
  secondary:
    "focus:bg-gray-300 active:bg-gray-300 dark:focus:bg-slate-500 dark:active:bg-slate-500",
  success:
    "focus:bg-green-700 active:bg-green-700 dark:focus:bg-green-600 dark:active:bg-green-600",
  warning:
    "focus:bg-amber-600 active:bg-amber-600 dark:focus:bg-amber-600 dark:active:bg-amber-600",
  danger:
    "focus:bg-red-700 active:bg-red-700 dark:focus:bg-red-600 dark:active:bg-red-600",
  ghost:
    "focus:bg-gray-100 active:bg-gray-100 dark:focus:bg-slate-700 dark:active:bg-slate-700",
};

/** 独立按钮 / 链接按钮的交互基底（非组内） */
export const BUTTON_STANDALONE_INTERACTIVE_BASE =
  "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 disabled:opacity-40 disabled:grayscale disabled:pointer-events-none disabled:cursor-not-allowed";

/** ButtonGroup 内子按钮基底（无 ring） */
export const BUTTON_GROUP_CHILD_BASE =
  "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:opacity-40 disabled:grayscale disabled:pointer-events-none disabled:cursor-not-allowed";
