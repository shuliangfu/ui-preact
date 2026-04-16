/**
 * Progress 进度条/环形（Preact）。
 * `percent` 支持数值或 `@preact/signals` 的 `Signal<number>`（或零参 getter）。
 */

import { Signal } from "@preact/signals";
import type { JSX } from "preact";
import { twMerge } from "tailwind-merge";

export type ProgressType = "line" | "circle";
export type ProgressStatus = "normal" | "success" | "exception" | "active";

/** 进度值：快照、`Signal<number>` 或零参 getter */
export type ProgressPercentInput =
  | number
  | Signal<number>
  | (() => number);

export interface ProgressProps {
  percent?: ProgressPercentInput;
  type?: ProgressType;
  status?: ProgressStatus;
  showInfo?: boolean;
  strokeWidth?: number;
  size?: number;
  strokeWidthCircle?: number;
  strokeColor?: string;
  trailColor?: string;
  format?: (percent: number) => string;
  class?: string;
}

const statusSuccessCls = "bg-green-500 dark:bg-green-400";
const statusExceptionCls = "bg-red-500 dark:bg-red-400";
const statusNormalCls = "bg-blue-500 dark:bg-blue-400";
const statusActiveCls = "bg-blue-500 dark:bg-blue-400 animate-pulse";

function percentCls(status: ProgressStatus): string {
  if (status === "success") return statusSuccessCls;
  if (status === "exception") return statusExceptionCls;
  if (status === "active") return statusActiveCls;
  return statusNormalCls;
}

/**
 * 将 `percent` 规范为 0–100。
 */
function readProgressPercentInput(
  v: ProgressPercentInput | undefined,
): number {
  if (v === undefined) return 0;
  if (v instanceof Signal) {
    const n = Number(v.value);
    return clampProgressPercent(n);
  }
  if (typeof v === "function") {
    if ((v as () => unknown).length !== 0) return 0;
    const n = Number((v as () => number)());
    return clampProgressPercent(n);
  }
  return clampProgressPercent(Number(v));
}

function clampProgressPercent(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

function ProgressLine(props: {
  percent: number;
  status: ProgressStatus;
  showInfo: boolean;
  strokeWidth: number;
  strokeColor?: string;
  trailColor?: string;
  format?: (p: number) => string;
  class?: string;
}) {
  const {
    percent,
    status,
    showInfo,
    strokeWidth,
    strokeColor,
    trailColor,
    format,
    class: className,
  } = props;
  const p = Math.min(100, Math.max(0, percent));
  const trailStyle = trailColor ? { backgroundColor: trailColor } : undefined;
  const strokeStyle = strokeColor
    ? { backgroundColor: strokeColor }
    : undefined;
  const barCls = strokeColor ? "" : percentCls(status);

  /**
   * 内层条不对 `width` 做 CSS transition：从 100 瞬间回到 0（如重播）时，
   * 过渡会与定时递增叠在一起，视觉上会停在中间一段比例，与百分比文案不符。
   */
  return (
    <div class={twMerge("flex items-center gap-3 w-full", className)}>
      <div
        class="flex-1 h-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-600"
        style={{ height: `${strokeWidth}px`, ...trailStyle }}
      >
        <div
          class={twMerge("h-full rounded-full", barCls)}
          style={{
            width: `${p}%`,
            ...strokeStyle,
          }}
        />
      </div>
      {showInfo && (
        <span class="shrink-0 text-sm text-slate-600 dark:text-slate-400 min-w-[2.5rem] text-right">
          {format ? format(p) : `${p}%`}
        </span>
      )}
    </div>
  );
}

function ProgressCircle(props: {
  percent: number;
  status: ProgressStatus;
  showInfo: boolean;
  size: number;
  strokeWidth: number;
  strokeColor?: string;
  trailColor?: string;
  format?: (p: number) => string;
  class?: string;
}) {
  const {
    percent,
    status,
    showInfo,
    size,
    strokeWidth,
    strokeColor,
    trailColor,
    format,
    class: className,
  } = props;
  const p = Math.min(100, Math.max(0, percent));
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (p / 100) * circumference;
  const stroke = strokeColor ??
    (status === "success"
      ? "#22c55e"
      : status === "exception"
      ? "#ef4444"
      : "#3b82f6");

  /**
   * 进度弧不对 `strokeDashoffset` 做 CSS transition，与线性条相同理由（重播时避免视觉错位）。
   */
  return (
    <div
      class={twMerge("relative inline-flex", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        class="rotate-[-90deg]"
        aria-hidden
      >
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
          class={trailColor ? "" : "stroke-slate-200 dark:stroke-slate-600"}
          style={trailColor ? { stroke: trailColor } : undefined}
        />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {showInfo && (
        <span class="absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-700 dark:text-slate-300">
          {format ? format(p) : `${p}%`}
        </span>
      )}
    </div>
  );
}

/**
 * 线性或环形进度；读 `percent` 时若为 `Signal` 则随订阅更新。
 */
export function Progress(props: ProgressProps): JSX.Element {
  const {
    percent: percentIn,
    type = "line",
    status = "normal",
    showInfo = true,
    strokeWidth = 8,
    size = 120,
    strokeWidthCircle = 6,
    strokeColor,
    trailColor,
    format,
    class: className,
  } = props;

  const percent = readProgressPercentInput(percentIn);

  if (type === "circle") {
    return (
      <ProgressCircle
        percent={percent}
        status={status}
        showInfo={showInfo}
        size={size}
        strokeWidth={strokeWidthCircle}
        strokeColor={strokeColor}
        trailColor={trailColor}
        format={format}
        class={className}
      />
    );
  }
  return (
    <ProgressLine
      percent={percent}
      status={status}
      showInfo={showInfo}
      strokeWidth={strokeWidth}
      strokeColor={strokeColor}
      trailColor={trailColor}
      format={format}
      class={className}
    />
  );
}
