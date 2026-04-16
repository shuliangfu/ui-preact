/**
 * 数字相关工具（Slider、InputNumber 等复用）。
 */

/**
 * 将数值钳在 [min, max] 范围内。
 */
export function clamp(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * 将 value 按 step 对齐到最接近的步进值（从 min 起算）。
 * 若 step <= 0 则返回 value。
 */
export function stepSnap(min: number, step: number, value: number): number {
  if (step <= 0) return value;
  const n = Math.round((value - min) / step);
  return min + n * step;
}
