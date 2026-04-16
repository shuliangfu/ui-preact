/**
 * 表单文本/类 input 控件的聚焦 ring 类名（与既有 Input 蓝色高亮一致）。
 * 各组件 props 中 `hideFocusRing` 默认为 `false`（默认显示激活态边框）；为 `true` 时关闭 ring。
 */

import type { SizeVariant } from "../types.ts";

/**
 * 标准蓝色聚焦 ring（含 `focus:border-transparent`）；`show` 为 false 时用 `focus:ring-0` 关闭。
 *
 * @param show - 是否显示聚焦 ring
 */
export function controlBlueFocusRing(show: boolean): string {
  return show
    ? "focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400"
    : "focus:ring-0";
}

/**
 * 错误态红框上的红色聚焦 ring；`show` 为 false 时不追加 ring 类（边框仍由 {@link controlErrorBorder} 等提供）。
 *
 * @param show - 是否显示错误态聚焦 ring
 */
export function controlErrorFocusRing(show: boolean): string {
  return show ? "focus:ring-red-500 dark:focus:ring-red-500" : "";
}

/** 错误态描边（与 ring 解耦，便于 `hideFocusRing === true` 时仍保留红框） */
export const controlErrorBorder = "border-red-500 dark:border-red-500";

/**
 * InputNumber 等组合控件：仅当内部 `input` 聚焦时外壳整圈 ring（避免 +/- 获焦误亮）。
 *
 * @param show - 是否启用该外壳 ring
 */
export function compositeShellFocusRingFromInput(show: boolean): string {
  return show
    ? "has-[input:focus]:ring-2 has-[input:focus]:ring-blue-500 dark:has-[input:focus]:ring-blue-400 has-[input:focus]:border-transparent"
    : "";
}

/**
 * DatePicker / TimePicker / DateTimePicker 触发按钮共用底纹（不含聚焦 ring）。
 */
export const pickerTriggerSurface =
  "border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-between gap-2 text-left";

/**
 * DatePicker / TimePicker / DateTimePicker 触发器尺寸（与 Input 的 `size` 档位对齐）。
 * `lg` 使用 `pl-4 pr-3`：左侧与 Input `lg` 的 `px-4` 一致，右侧略收——右侧图标已按 `picker-trigger-icon` 缩档，避免留白过大。
 */
export const pickerTriggerSizeClasses: Record<SizeVariant, string> = {
  xs: "px-2.5 py-1 text-xs rounded-md",
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-3 py-2 text-sm rounded-lg",
  lg: "pl-4 pr-3 py-2.5 text-base rounded-lg",
};

/**
 * 原生 `<select>` 等与触发器同色的底纹（不含 ring、不含 flex）；与 {@link controlBlueFocusRing} 搭配。
 * 需要全宽或触控修饰时由调用方再拼 `w-full`、`touch-manipulation` 等。
 */
export const nativeSelectSurface =
  "border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors appearance-none cursor-pointer";
