/**
 * Calendar 日历（Preact）。
 * 月视图、选日；支持 `value` 与 {@link MaybeSignal}（`@preact/signals`）配合受控。
 */

import { useSignal } from "@preact/signals";
import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import {
  commitMaybeSignal,
  type MaybeSignal,
  readMaybeSignal,
} from "../form/maybe-signal.ts";
import {
  compareCalendarDays,
  getDaysInMonth,
  MONTHS,
  WEEKDAYS,
} from "./calendar-utils.ts";

export type CalendarMode = "month" | "year";

/** 月视图日格子的选择语义 */
export type CalendarDaySelectionMode = "single" | "range" | "multiple";

export interface CalendarProps {
  /**
   * 当前展示的月份；`daySelectionMode=single` 且未传 `selectedDate` 时也作为选中日期。
   */
  value?: MaybeSignal<Date>;
  selectedDate?: Date;
  onChange?: (date: Date) => void;
  mode?: CalendarMode;
  daySelectionMode?: CalendarDaySelectionMode;
  rangeStart?: Date;
  rangeEnd?: Date;
  selectedDates?: readonly Date[];
  dateCellRender?: (date: Date) => ComponentChildren;
  monthCellRender?: (date: Date) => ComponentChildren;
  fullscreen?: boolean;
  disabledDate?: (date: Date) => boolean;
  class?: string;
}

/**
 * 月视图或年视图日历。
 */
export function Calendar(props: CalendarProps): JSX.Element {
  const {
    selectedDate,
    onChange,
    mode = "month",
    daySelectionMode = "single",
    rangeStart,
    rangeEnd,
    selectedDates,
    dateCellRender,
    monthCellRender,
    fullscreen = true,
    disabledDate,
    class: className,
  } = props;

  /** 未传 `value` 时的内部日期 */
  const internalValue = useSignal(new Date());

  /**
   * 解析当前「视图日期」：受控读 `value`，否则读内部 signal。
   */
  const viewDate = (): Date => {
    if (props.value !== undefined) {
      return readMaybeSignal(props.value) ?? new Date();
    }
    return internalValue.value;
  };

  const shouldCommitViewDate = (): boolean =>
    daySelectionMode === "single" && selectedDate === undefined;

  /**
   * 将新日期写回 Signal / 内部状态。
   */
  const commitViewDateIfNeeded = (next: Date): void => {
    if (!shouldCommitViewDate()) return;
    if (props.value !== undefined) {
      commitMaybeSignal(props.value, next);
    } else {
      internalValue.value = next;
    }
  };

  const vd = viewDate();
  const year = vd.getFullYear();
  const month = vd.getMonth();
  const frame = {
    year,
    month,
    days: getDaysInMonth(year, month),
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  /**
   * 根据 daySelectionMode 计算该日格的高亮类型。
   */
  const dayCellHighlight = (
    d: Date,
  ): "endpoint" | "range-middle" | null => {
    if (daySelectionMode === "multiple") {
      const hit = selectedDates?.some((x) => isSameDay(x, d)) ?? false;
      return hit ? "endpoint" : null;
    }
    if (daySelectionMode === "range") {
      const rs = rangeStart;
      const re = rangeEnd;
      if (rs == null && re == null) return null;
      if (rs != null && re != null) {
        const lo = compareCalendarDays(rs, re) <= 0 ? rs : re;
        const hi = compareCalendarDays(rs, re) <= 0 ? re : rs;
        if (isSameDay(lo, hi)) {
          return isSameDay(d, lo) ? "endpoint" : null;
        }
        if (isSameDay(d, lo) || isSameDay(d, hi)) return "endpoint";
        if (
          compareCalendarDays(d, lo) >= 0 && compareCalendarDays(d, hi) <= 0
        ) {
          return "range-middle";
        }
        return null;
      }
      const only = rs ?? re!;
      return isSameDay(d, only) ? "endpoint" : null;
    }
    const ref = selectedDate ?? viewDate();
    return isSameDay(d, ref) ? "endpoint" : null;
  };

  if (mode === "year") {
    return (
      <div class={twMerge("calendar calendar-year", className)}>
        <div class="grid grid-cols-4 gap-2 p-4">
          {MONTHS.map((_, i) => {
            const d = new Date(frame.year, i, 1);
            const curM = frame.month;
            return (
              <button
                key={i}
                type="button"
                class={twMerge(
                  "py-4 rounded-lg text-sm font-medium",
                  curM === i
                    ? "bg-blue-600 text-white dark:bg-blue-500"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600",
                )}
                onClick={() => {
                  commitViewDateIfNeeded(d);
                  onChange?.(d);
                }}
              >
                {monthCellRender ? monthCellRender(d) : MONTHS[i]}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      class={twMerge(
        "calendar rounded-lg border border-slate-200 dark:border-slate-600",
        className,
      )}
    >
      <div class="grid grid-cols-7 border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            class="py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            {w}
          </div>
        ))}
      </div>
      <div
        class={twMerge(
          "box-border grid grid-cols-7 border border-solid border-slate-100 border-t-0 dark:border-slate-700",
          fullscreen &&
            "min-h-[352px] auto-rows-[minmax(60px,1fr)]",
        )}
      >
        {frame.days.map((d, i) => {
          const isLastCol = i % 7 === 6;
          const m = frame.month;
          const isCurrentMonth = d.getMonth() === m;
          const highlight = dayCellHighlight(d);
          const disabled = disabledDate?.(d) ?? false;
          return (
            <button
              key={i}
              type="button"
              data-ui-calendar-day=""
              disabled={disabled}
              class={twMerge(
                "box-border flex h-full w-full min-h-0 flex-col items-center justify-center p-1.5 text-center text-sm leading-none tabular-nums",
                !isLastCol &&
                  "border-r border-slate-100 dark:border-slate-700",
                i >= 7 &&
                  "border-t border-slate-100 dark:border-slate-700",
                isCurrentMonth
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 dark:text-slate-500",
                highlight === "endpoint" &&
                  "bg-blue-600 text-white dark:bg-blue-500",
                highlight === "range-middle" &&
                  "bg-blue-100 text-slate-900 dark:bg-blue-900/40 dark:text-slate-100",
                highlight == null && isCurrentMonth && !disabled &&
                  "hover:bg-slate-100 dark:hover:bg-slate-700/50",
                disabled && "opacity-50 cursor-not-allowed",
              )}
              onClick={() => {
                if (disabledDate?.(d)) return;
                commitViewDateIfNeeded(d);
                onChange?.(d);
              }}
            >
              <span class="flex items-center justify-center">
                {d.getDate()}
              </span>
              {dateCellRender != null && (
                <span class="mt-0.5 block max-w-full text-center text-xs leading-tight opacity-80">
                  {dateCellRender(d)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
