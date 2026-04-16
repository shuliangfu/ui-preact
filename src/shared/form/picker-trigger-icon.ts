/**
 * 日期/时间类触发器右侧图标尺寸：比 {@link SizeVariant} 输入框本体小一档，避免图标过大抢视觉。
 * 用于 DatePicker、DateTimePicker、TimePicker 等。
 */
import type { SizeVariant } from "../types.ts";

/**
 * 将 DatePicker / DateTimePicker 的 `size` 映射为日历图标的 `Icon` size。
 * lg→md、md→sm、sm→xs；xs 仍用 `size="xs"` 但通过 `class` 压到 `w-3 h-3`（再小一级）。
 *
 * @param triggerSize 触发器与 {@link Input} 一致的尺寸
 * @returns 传给日历图标组件的 `size` 与可选 `class`（覆盖默认边长）
 */
export function pickerCalendarIconProps(triggerSize: SizeVariant): {
  size: SizeVariant;
  /** 与 Icon 默认尺寸类冲突时由 twMerge 保留更小边长 */
  class?: string;
} {
  switch (triggerSize) {
    case "lg":
      return { size: "sm" };
    case "md":
      return { size: "xs" };
    case "sm":
      return { size: "xs" };
    case "xs":
    default:
      return { size: "xs", class: "w-3 h-3" };
  }
}
