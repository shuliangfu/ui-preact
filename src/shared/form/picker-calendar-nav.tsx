/**
 * DatePicker / DateTimePicker 共用：日历区在「日视图 / 十二宫格选月 / 十二宫格选年」间切换。
 * Preact 版直接渲染并读 `@preact/signals` 的 `Signal`，与父组件联动更新。
 */

import type { Signal } from "@preact/signals";
import type { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { IconChevronLeft } from "../basic/icons/ChevronLeft.tsx";
import { IconChevronRight } from "../basic/icons/ChevronRight.tsx";
import {
  Calendar,
  type CalendarDaySelectionMode,
} from "../data-display/Calendar.tsx";
import {
  isMonthFullyOutsideMinMax,
  isYearFullyOutsideMinMax,
  MONTHS,
  yearGridPageStart,
} from "../data-display/calendar-utils.ts";
import type { PickerDateGranularity } from "./picker-format.ts";

/** 日历头部子面板类型 */
export type PickerCalendarHeaderPanel = "day" | "month" | "year";

export interface PickerCalendarNavProps {
  /** 面板当前展示的年月（与下方日网格一致） */
  viewDate: Signal<Date>;
  /** 当前子面板：日网格 / 月宫格 / 年宫格 */
  panelMode: Signal<PickerCalendarHeaderPanel>;
  /** 年视图中一组 12 年的起始年（含） */
  yearPageStart: Signal<number>;
  minDate: Date | null;
  maxDate: Date | null;
  /** 日视图中已选日期（未选可为 undefined） */
  selectedDate: Date | undefined;
  /** single：优先于 selectedDate，订阅稿 */
  selectedDaySignal?: Signal<Date | null>;
  /** 日网格选择语义 */
  daySelectionMode?: CalendarDaySelectionMode;
  rangeStart?: Date;
  rangeEnd?: Date;
  rangeStartSignal?: Signal<Date | null>;
  rangeEndSignal?: Signal<Date | null>;
  rangeDatetimeActiveEndSignal?: Signal<boolean>;
  selectedDates?: readonly Date[];
  multipleYmdSignal?: Signal<string[]>;
  multipleItemsSignal?: Signal<string[]>;
  multipleItemsToDays?: (items: readonly string[]) => Date[];
  onSelectDay: (d: Date) => void;
  disabledDate?: (d: Date) => boolean;
  calendarClass?: string;
  dateGranularity?: PickerDateGranularity;
}

/**
 * 将 `YYYY-MM-DD` 串列表解析为本地日历日（非法项跳过）。
 */
function parseYmdStringsToDates(ymds: readonly string[]): Date[] {
  const out: Date[] = [];
  for (const s of ymds) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) continue;
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    if (
      isNaN(dt.getTime()) || dt.getFullYear() !== y ||
      dt.getMonth() !== m - 1 || dt.getDate() !== d
    ) continue;
    out.push(dt);
  }
  return out;
}

const gridCellIdle =
  "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600";
const gridCellActive = "bg-blue-600 text-white dark:bg-blue-500";
const gridCellBase =
  "py-2 rounded-lg text-sm font-medium text-center transition-colors";

/**
 * PickerCalendarNav：日历导航 + 日/月/年宫格。
 */
export function PickerCalendarNav(
  props: PickerCalendarNavProps,
): JSX.Element {
  const {
    viewDate,
    panelMode,
    yearPageStart,
    minDate,
    maxDate,
    selectedDate,
    selectedDaySignal,
    daySelectionMode,
    rangeStart,
    rangeEnd,
    rangeStartSignal,
    rangeEndSignal,
    rangeDatetimeActiveEndSignal,
    selectedDates,
    multipleYmdSignal,
    multipleItemsSignal,
    multipleItemsToDays,
    onSelectDay,
    disabledDate,
    calendarClass,
    dateGranularity = "day",
  } = props;

  const view = viewDate.value;
  const mode: PickerCalendarHeaderPanel = panelMode.value ?? "day";
  const y = view.getFullYear();
  const m = view.getMonth();
  const calValue = new Date(y, m, 1);
  const ys = yearPageStart.value;

  const calendarSelectedDate = rangeDatetimeActiveEndSignal != null &&
      daySelectionMode === "single" &&
      rangeStartSignal != null &&
      rangeEndSignal != null
    ? (rangeDatetimeActiveEndSignal.value
      ? (rangeEndSignal.value ?? undefined)
      : (rangeStartSignal.value ?? undefined))
    : selectedDaySignal != null
    ? (selectedDaySignal.value ?? undefined)
    : selectedDate;
  const calendarRangeStart = rangeStartSignal != null
    ? (rangeStartSignal.value ?? undefined)
    : rangeStart;
  const calendarRangeEnd = rangeEndSignal != null
    ? (rangeEndSignal.value ?? undefined)
    : rangeEnd;

  const calendarSelectedDatesResolved =
    daySelectionMode === "multiple" && multipleYmdSignal != null
      ? parseYmdStringsToDates(multipleYmdSignal.value)
      : daySelectionMode === "multiple" &&
          multipleItemsSignal != null &&
          multipleItemsToDays != null
      ? multipleItemsToDays(multipleItemsSignal.value)
      : selectedDates;

  const goPrevMonth = () => {
    viewDate.value = new Date(y, m - 1, 1);
  };
  const goNextMonth = () => {
    viewDate.value = new Date(y, m + 1, 1);
  };

  const goPrevYearInMonthPanel = () => {
    viewDate.value = new Date(y - 1, m, 1);
  };
  const goNextYearInMonthPanel = () => {
    viewDate.value = new Date(y + 1, m, 1);
  };

  const openMonthPanel = () => {
    panelMode.value = "month";
  };

  const openYearPanel = () => {
    yearPageStart.value = yearGridPageStart(y);
    panelMode.value = "year";
  };

  const goPrevYearPage = () => {
    yearPageStart.value = ys - 12;
  };
  const goNextYearPage = () => {
    yearPageStart.value = ys + 12;
  };

  const backToDayPanel = () => {
    panelMode.value = "day";
  };

  const pickMonth = (monthIndex: number) => {
    if (isMonthFullyOutsideMinMax(y, monthIndex, minDate, maxDate)) return;
    viewDate.value = new Date(y, monthIndex, 1);
    if (dateGranularity === "year-month") return;
    panelMode.value = "day";
  };

  const pickYear = (year: number) => {
    if (isYearFullyOutsideMinMax(year, minDate, maxDate)) return;
    if (dateGranularity === "year") {
      viewDate.value = new Date(year, 0, 1);
      return;
    }
    viewDate.value = new Date(year, m, 1);
    panelMode.value = "month";
  };

  return (
    <div class="min-w-0">
      {mode === "day" && (
        <div class="flex items-center justify-between gap-2 mb-2">
          <button
            type="button"
            aria-label="上一月"
            class="p-1 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={goPrevMonth}
          >
            <IconChevronLeft size="sm" />
          </button>
          <button
            type="button"
            aria-label="选择月份与年份"
            class="text-sm font-medium text-slate-700 dark:text-slate-200 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={openMonthPanel}
          >
            {y}年 {MONTHS[m]}
          </button>
          <button
            type="button"
            aria-label="下一月"
            class="p-1 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={goNextMonth}
          >
            <IconChevronRight size="sm" />
          </button>
        </div>
      )}

      {mode === "month" && (
        <>
          {dateGranularity === "day" && (
            <div class="flex justify-end mb-1">
              <button
                type="button"
                class="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 px-1 py-0.5 rounded"
                aria-label="返回日历视图"
                onClick={backToDayPanel}
              >
                返回日历
              </button>
            </div>
          )}
          <div class="flex items-center justify-between gap-2 mb-2">
            <button
              type="button"
              aria-label="上一年"
              class="p-1 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={goPrevYearInMonthPanel}
            >
              <IconChevronLeft size="sm" />
            </button>
            <button
              type="button"
              aria-label="选择年份"
              class="text-sm font-medium text-slate-700 dark:text-slate-200 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={openYearPanel}
            >
              {y}年
            </button>
            <button
              type="button"
              aria-label="下一年"
              class="p-1 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={goNextYearInMonthPanel}
            >
              <IconChevronRight size="sm" />
            </button>
          </div>
        </>
      )}

      {mode === "year" && (
        <>
          {dateGranularity !== "year" && (
            <div class="flex justify-end mb-1">
              <button
                type="button"
                class="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 px-1 py-0.5 rounded"
                aria-label="返回月份选择"
                onClick={() => {
                  panelMode.value = "month";
                }}
              >
                返回选月
              </button>
            </div>
          )}
          <div class="flex items-center justify-between gap-2 mb-2">
            <button
              type="button"
              aria-label="上一组年份"
              class="p-1 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={goPrevYearPage}
            >
              <IconChevronLeft size="sm" />
            </button>
            <span class="text-xs font-medium text-slate-600 dark:text-slate-400 tabular-nums px-1 text-center">
              {ys}年 — {ys + 11}年
            </span>
            <button
              type="button"
              aria-label="下一组年份"
              class="p-1 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={goNextYearPage}
            >
              <IconChevronRight size="sm" />
            </button>
          </div>
        </>
      )}

      {mode === "day" && dateGranularity === "day" && (
        <Calendar
          value={calValue}
          selectedDate={calendarSelectedDate}
          daySelectionMode={daySelectionMode}
          rangeStart={calendarRangeStart}
          rangeEnd={calendarRangeEnd}
          selectedDates={calendarSelectedDatesResolved}
          onChange={onSelectDay}
          disabledDate={disabledDate}
          fullscreen={false}
          class={twMerge("border-0 p-0 min-h-0", calendarClass)}
        />
      )}

      {mode === "month" && (
        <div
          class="grid grid-cols-3 gap-2 mb-1"
          role="grid"
          aria-label="选择月份"
        >
          {MONTHS.map((label, i) => {
            const offRange = isMonthFullyOutsideMinMax(
              y,
              i,
              minDate,
              maxDate,
            );
            const isCurrent = i === m;
            return (
              <button
                key={label}
                type="button"
                role="gridcell"
                disabled={offRange}
                class={twMerge(
                  gridCellBase,
                  offRange && "opacity-50 cursor-not-allowed",
                  !offRange && (isCurrent ? gridCellActive : gridCellIdle),
                )}
                onClick={() => pickMonth(i)}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {mode === "year" && (
        <div
          class="grid grid-cols-3 gap-2 mb-1"
          role="grid"
          aria-label="选择年份"
        >
          {Array.from({ length: 12 }, (_, k) => {
            const yy = ys + k;
            const offRange = isYearFullyOutsideMinMax(
              yy,
              minDate,
              maxDate,
            );
            const isCurrent = yy === y;
            return (
              <button
                key={yy}
                type="button"
                role="gridcell"
                disabled={offRange}
                class={twMerge(
                  gridCellBase,
                  offRange && "opacity-50 cursor-not-allowed",
                  !offRange && (isCurrent ? gridCellActive : gridCellIdle),
                )}
                onClick={() => pickYear(yy)}
              >
                {yy}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
