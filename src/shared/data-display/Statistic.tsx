/**
 * Statistic 统计数值（Preact）。
 * 数字高亮、前缀/后缀、精度、趋势指示。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";

export interface StatisticProps {
  /** 标题 */
  title?: ComponentChildren;
  /** 数值（数字或字符串展示） */
  value: number | string;
  /** 前缀（如 ￥、$、图标） */
  prefix?: ComponentChildren;
  /** 后缀（如 元、%）、或趋势 up/down 节点 */
  suffix?: ComponentChildren;
  /**
   * 趋势箭头与红绿配色；不传时若 `value` 为有限数字则自动推断：负数 down，否则 up。
   */
  trend?: "up" | "down";
  /** 小数精度（仅当 value 为 number 时生效） */
  precision?: number;
  /** 千分位分隔 */
  groupSeparator?: string;
  /** 数值样式：内联样式对象 */
  valueStyle?: Record<string, string | number>;
  /** 数值 class */
  valueClass?: string;
  /** 额外 class（容器） */
  class?: string;
}

function formatNumber(
  n: number,
  precision?: number,
  groupSeparator?: string,
): string {
  let s = Number.isFinite(n)
    ? (precision != null ? n.toFixed(precision) : String(n))
    : "-";
  if (groupSeparator != null && Number.isFinite(n)) {
    const parts = s.split(".");
    parts[0] = parts[0]!.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
    s = parts.join(".");
  }
  return s;
}

function statisticResolvedTrend(
  value: number | string,
  trendProp: "up" | "down" | undefined,
): "up" | "down" | undefined {
  if (trendProp != null) return trendProp;
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return value < 0 ? "down" : "up";
}

/**
 * Statistic：统计数值展示。
 */
export function Statistic(props: StatisticProps): JSX.Element {
  const {
    title,
    value,
    prefix,
    suffix,
    trend,
    precision,
    groupSeparator = ",",
    valueStyle,
    valueClass,
    class: className,
  } = props;

  const resolvedTrend = statisticResolvedTrend(value, trend);

  const displayValue = typeof value === "number"
    ? formatNumber(value, precision, groupSeparator)
    : String(value);

  return (
    <div class={twMerge("statistic", className)}>
      {title != null && (
        <div class="text-sm text-slate-500 dark:text-slate-400 mb-1">
          {title}
        </div>
      )}
      <div class="flex items-baseline gap-1.5 flex-wrap">
        {prefix != null && (
          <span class="text-slate-600 dark:text-slate-400 text-lg">
            {prefix}
          </span>
        )}
        <span
          class={twMerge(
            "text-2xl font-semibold text-slate-900 dark:text-white tabular-nums",
            resolvedTrend === "up" && "text-green-600 dark:text-green-400",
            resolvedTrend === "down" && "text-red-600 dark:text-red-400",
            valueClass,
          )}
          style={valueStyle}
        >
          {displayValue}
        </span>
        {resolvedTrend != null && (
          <span
            class={twMerge(
              "text-sm",
              resolvedTrend === "up" && "text-green-600 dark:text-green-400",
              resolvedTrend === "down" && "text-red-600 dark:text-red-400",
            )}
            aria-hidden
          >
            {resolvedTrend === "up" ? "↑" : "↓"}
          </span>
        )}
        {suffix != null && (
          <span class="text-slate-600 dark:text-slate-400 text-base">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
