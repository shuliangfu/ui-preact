/**
 * DateTimePicker 日期时间选择（Preact + @preact/signals）。
 * 自研：Calendar + 时/分/秒列表 + 底部确定/取消；不依赖浏览器 `input[type=datetime-local]`。
 * 受控值格式由 `format` 决定（默认 `YYYY-MM-DD HH:mm`）；支持 mode：`single`（默认）、`range`、`multiple`。
 * 行为与 ui-view 对齐；实现风格同 {@link DatePicker}、{@link TimePicker}。
 */

import type { JSX } from "preact";
import {
  batch,
  type Signal,
  useSignal,
  useSignalEffect,
} from "@preact/signals";
import { twMerge } from "tailwind-merge";
/** 触发器右侧用日历图标（日期+时间仍以日期为主视觉） */
import { IconCalendar } from "../basic/icons/Calendar.tsx";
import {
  calendarDayStart,
  defaultPickerDayWhenNoValue,
  yearGridPageStart,
} from "../data-display/calendar-utils.ts";
import type { SizeVariant } from "../types.ts";
import {
  controlBlueFocusRing,
  pickerTriggerSizeClasses,
  pickerTriggerSurface,
} from "./input-focus-ring.ts";
import {
  type PickerCalendarHeaderPanel,
  PickerCalendarNav,
} from "./picker-calendar-nav.tsx";
import {
  DEFAULT_DATETIME_FORMAT,
  formatDateTimeWithSpec,
  getLocalTimeHourMinuteSecond,
  normalizeMinMaxDateForGranularity,
  parseDateTimePickerFormat,
  parseDateTimeStringWithSpec,
  type ParsedDateTimeFormat,
  type PickerTimeGranularity,
  pickerTimeSegmentSingleColumnHeaderLabel,
} from "./picker-format.ts";
import {
  pickerPortalZClass,
  type PickerTimeColumnDraft,
  pickerTimeColumnWrapClass,
  pickerTimeListInnerWidthClass,
  pickerTimeListScrollClass,
  pickerTimeStripRowMultiClass,
  pickerTimeStripSingleCenterWrapClass,
  registerPickerFixedOverlayPositionAndOutsideClick,
  runTimeStripPrimaryPointerPick,
  schedulePickerTimeDraftColumnsScroll,
} from "./picker-portal-utils.ts";
import { pickerCalendarIconProps } from "./picker-trigger-icon.ts";
import {
  commitMaybeSignal,
  type MaybeSignal,
  readMaybeSignal,
} from "./maybe-signal.ts";

/** range 模式受控值（每项为 `YYYY-MM-DD HH:mm` 等由 format 决定） */
export interface DateTimePickerRangeValue {
  start?: string;
  end?: string;
}

/** 日期时间选择模式 */
export type DateTimePickerMode = "single" | "range" | "multiple";

/** 受控值形态（由 {@link DateTimePickerProps.mode} 决定） */
export type DateTimePickerValue = string | DateTimePickerRangeValue | string[];

export interface DateTimePickerProps {
  mode?: DateTimePickerMode;
  /** 见 {@link MaybeSignal} */
  value?: MaybeSignal<DateTimePickerValue>;
  /** 可选：限制可选日期的下限（仅日期部分 YYYY-MM-DD，与 {@link DatePicker} 一致） */
  min?: string;
  /** 可选：限制可选日期的上限（YYYY-MM-DD） */
  max?: string;
  size?: SizeVariant;
  disabled?: boolean;
  onChange?: (e: Event) => void;
  class?: string;
  name?: string;
  id?: string;
  /** 无值时的占位文案 */
  placeholder?: string;
  /** 为 true 时隐藏聚焦激活态边框；默认 false 显示 ring */
  hideFocusRing?: boolean;
  /**
   * 单串内含日期段 + 时间段：如 `YYYY-MM-DD HH:mm:ss`；`MM` 为月，`mm` 为小写分。
   * `range`/`multiple` 须为完整日 + 至少到「分」的时间；否则回退默认并 `console.warn`。
   */
  format?: string;
  /**
   * 浮层挂载方式：`anchored`（默认）相对根 `absolute`；`viewport` 为视口 `fixed` + 几何同步，避免被表格等 overflow 裁切。
   */
  panelAttach?: "anchored" | "viewport";
}

const DROPDOWN_ESC_KEY = "__lastDropdownClose" as const;

/** 与 {@link DatePicker} 相同：Esc 关闭浮层 */
function registerDropdownEsc(close: () => void): void {
  if (typeof globalThis === "undefined") return;
  const g = globalThis as unknown as Record<
    string,
    (() => void) | undefined
  >;
  g[DROPDOWN_ESC_KEY] = close;
}

function clearDropdownEsc(): void {
  if (typeof globalThis === "undefined") return;
  const g = globalThis as unknown as Record<
    string,
    (() => void) | undefined
  >;
  g[DROPDOWN_ESC_KEY] = undefined;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const SECONDS = Array.from({ length: 60 }, (_, i) => i);

/** 时间列表项未选中样式 */
const PICKER_TIME_LIST_ITEM_BASE =
  "py-1.5 px-2 text-sm text-center rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700";
/** 时间列表项选中样式 */
const PICKER_TIME_LIST_ITEM_SELECTED =
  "bg-blue-600 text-white dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600";

/**
 * 与 {@link DateTimePickerTimeStrip} 内列可见性一致，供浮层打开时按草稿滚动。
 *
 * @param tg - `dtFormatSpec.timeGranularity`
 */
function dateTimePickerScrollShowFlags(
  tg: PickerTimeGranularity,
): Pick<PickerTimeColumnDraft, "showHour" | "showMinute" | "showSecond"> {
  return {
    showHour: tg === "hour" || tg === "hour-minute" ||
      tg === "hour-minute-second",
    showMinute: tg === "minute" || tg === "hour-minute" ||
      tg === "hour-minute-second",
    showSecond: tg === "second" || tg === "hour-minute-second",
  };
}

/**
 * 解析 `format`；非法或与 range/multiple 冲突时回退 `YYYY-MM-DD HH:mm`。
 */
function resolveDateTimePickerFormatSpec(
  format: string | undefined,
  mode: DateTimePickerMode,
): ParsedDateTimeFormat {
  const raw = format?.trim() || DEFAULT_DATETIME_FORMAT;
  const parsed = parseDateTimePickerFormat(raw);
  if (!parsed.ok) {
    console.warn(
      `[DateTimePicker] format 无效：${parsed.error}，已使用 ${DEFAULT_DATETIME_FORMAT}`,
    );
    const fb = parseDateTimePickerFormat(DEFAULT_DATETIME_FORMAT);
    if (!fb.ok) throw new Error("[DateTimePicker] 内置默认 format 解析失败");
    return fb.spec;
  }
  if (mode !== "single" && parsed.spec.dateGranularity !== "day") {
    console.warn(
      "[DateTimePicker] range/multiple 须使用含「日」的完整日期，已回退默认 format",
    );
    const fb = parseDateTimePickerFormat(DEFAULT_DATETIME_FORMAT);
    if (!fb.ok) throw new Error("[DateTimePicker] 内置默认 format 解析失败");
    return fb.spec;
  }
  if (
    mode !== "single" &&
    (parsed.spec.timeGranularity === "hour" ||
      parsed.spec.timeGranularity === "minute" ||
      parsed.spec.timeGranularity === "second")
  ) {
    console.warn(
      "[DateTimePicker] range/multiple 时间至少须到「时+分」，已回退默认 format",
    );
    const fb = parseDateTimePickerFormat(DEFAULT_DATETIME_FORMAT);
    if (!fb.ok) throw new Error("[DateTimePicker] 内置默认 format 解析失败");
    return fb.spec;
  }
  return parsed.spec;
}

/**
 * 类型守卫：range 受控对象。
 */
function isDateTimeRangeValue(v: unknown): v is DateTimePickerRangeValue {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

/**
 * 类型守卫：多选字符串数组。
 */
function isDateTimeStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

/**
 * 同步读取受控 `value`（与 {@link DatePicker} 一致，使用 {@link readMaybeSignal}）。
 */
function resolveDateTimePickerRaw(
  value: DateTimePickerProps["value"],
): unknown {
  return readMaybeSignal(value as MaybeSignal<DateTimePickerValue> | undefined);
}

/**
 * 两日是否为同一自然日（多选按日 toggle 用）。
 */
function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * 触发器展示文案。
 */
function dateTimePickerDisplayText(
  mode: DateTimePickerMode,
  raw: unknown,
  placeholder: string,
): string {
  if (mode === "single") {
    const s = typeof raw === "string" ? raw : "";
    return s.trim() !== "" ? s : placeholder;
  }
  if (mode === "range") {
    const o = isDateTimeRangeValue(raw) ? raw : {};
    const st = o.start?.trim() ?? "";
    const en = o.end?.trim() ?? "";
    if (st === "" && en === "") return placeholder;
    return `${st || "…"} ~ ${en || "…"}`;
  }
  const arr = isDateTimeStringArray(raw) ? raw : [];
  if (arr.length === 0) return placeholder;
  if (arr.length <= 2) return arr.join("、");
  return `${arr.length} 个日期时间`;
}

/**
 * 隐藏域序列化（已提交值，非草稿）。
 */
function dateTimePickerHiddenSerialized(
  mode: DateTimePickerMode,
  raw: unknown,
): string {
  if (mode === "single") {
    const s = typeof raw === "string" ? raw : "";
    return s.trim() !== "" ? s : "";
  }
  if (mode === "range") {
    const o = isDateTimeRangeValue(raw) ? raw : {};
    return JSON.stringify({
      start: o.start?.trim() ?? "",
      end: o.end?.trim() ?? "",
    });
  }
  const arr = isDateTimeStringArray(raw) ? [...raw].sort() : [];
  return JSON.stringify(arr);
}

/**
 * 是否已有有效展示值（用于触发器文字色）。
 */
function dateTimePickerHasValue(
  mode: DateTimePickerMode,
  raw: unknown,
): boolean {
  if (mode === "single") {
    return typeof raw === "string" && raw.trim() !== "";
  }
  if (mode === "range") {
    const o = isDateTimeRangeValue(raw) ? raw : {};
    return (o.start?.trim() ?? "") !== "" || (o.end?.trim() ?? "") !== "";
  }
  return isDateTimeStringArray(raw) && raw.length > 0;
}

/**
 * 从当前 `props` 派生 mode、format、min/max、`disabledDate`。
 */
function getDateTimePickerDerivatives(props: DateTimePickerProps) {
  const mode: DateTimePickerMode = props.mode ?? "single";
  const dtFormatSpec = resolveDateTimePickerFormatSpec(props.format, mode);
  const minDate = normalizeMinMaxDateForGranularity(
    props.min,
    dtFormatSpec.dateGranularity,
  );
  const maxDate = normalizeMinMaxDateForGranularity(
    props.max,
    dtFormatSpec.dateGranularity,
  );
  const disabledDate = (d: Date) => {
    const t = calendarDayStart(d);
    if (minDate != null && t < calendarDayStart(minDate)) return true;
    if (maxDate != null && t > calendarDayStart(maxDate)) return true;
    return false;
  };
  return { mode, dtFormatSpec, minDate, maxDate, disabledDate };
}

/** 时/分列 props：由内层读各 Signal `.value`，避免父面板合并后高亮不更新 */
interface DateTimePickerTimeStripProps {
  mode: DateTimePickerMode;
  dtFormatSpec: ParsedDateTimeFormat;
  editingRangeEnd: Signal<boolean>;
  draftHour: Signal<number>;
  draftMinute: Signal<number>;
  draftSecond: Signal<number>;
  draftStartHour: Signal<number>;
  draftStartMinute: Signal<number>;
  draftStartSecond: Signal<number>;
  draftEndHour: Signal<number>;
  draftEndMinute: Signal<number>;
  draftEndSecond: Signal<number>;
}

/**
 * 时 / 分 / 秒滚动列表子组件。
 * 在渲染顶层读入稿标量，再在 `map` 内比较，与 {@link TimePicker} 的 {@link TimePickerTimeStrip} 一致。
 */
function DateTimePickerTimeStrip(
  props: DateTimePickerTimeStripProps,
): JSX.Element {
  const {
    mode,
    dtFormatSpec,
    editingRangeEnd,
    draftHour,
    draftMinute,
    draftSecond,
    draftStartHour,
    draftStartMinute,
    draftStartSecond,
    draftEndHour,
    draftEndMinute,
    draftEndSecond,
  } = props;

  const tg = dtFormatSpec.timeGranularity;
  const showHourCol = tg === "hour" || tg === "hour-minute" ||
    tg === "hour-minute-second";
  const showMinuteCol = tg === "minute" ||
    tg === "hour-minute" ||
    tg === "hour-minute-second";
  const showSecondCol = tg === "second" || tg === "hour-minute-second";
  const timeColCount = (showHourCol ? 1 : 0) + (showMinuteCol ? 1 : 0) +
    (showSecondCol ? 1 : 0);
  const timeSingleColHeader = pickerTimeSegmentSingleColumnHeaderLabel(
    dtFormatSpec.timePieces,
  );
  const timeSingleStripClass =
    "text-xs font-medium text-slate-500 dark:text-slate-400 px-2 py-1 text-center border-b border-slate-200 dark:border-slate-600";
  const timeStripSingleCol = timeColCount === 1;
  const timeStripRowClass = timeStripSingleCol
    ? pickerTimeStripSingleCenterWrapClass
    : pickerTimeStripRowMultiClass;
  const timeColWrapClass = pickerTimeColumnWrapClass;
  const timeColListClass = twMerge(
    pickerTimeListScrollClass,
    pickerTimeListInnerWidthClass,
  );

  const activeHour = editingRangeEnd.value ? draftEndHour : draftStartHour;
  const activeMinute = editingRangeEnd.value
    ? draftEndMinute
    : draftStartMinute;
  const activeSecond = editingRangeEnd.value
    ? draftEndSecond
    : draftStartSecond;

  const atRangeEnd = editingRangeEnd.value;
  const selectedHourVal = mode === "range"
    ? (atRangeEnd ? draftEndHour.value : draftStartHour.value)
    : draftHour.value;
  const selectedMinuteVal = mode === "range"
    ? (atRangeEnd ? draftEndMinute.value : draftStartMinute.value)
    : draftMinute.value;
  const selectedSecondVal = mode === "range"
    ? (atRangeEnd ? draftEndSecond.value : draftStartSecond.value)
    : draftSecond.value;

  return (
    <div
      class={twMerge(
        "border-t border-slate-200 pt-2 sm:border-t-0 sm:border-l sm:pl-3 sm:pt-0 dark:border-slate-600",
        timeStripRowClass,
      )}
      data-picker-time-strip-scope="default"
    >
      {timeStripSingleCol
        ? (
          tg === "hour"
            ? (
              <div class={pickerTimeStripSingleCenterWrapClass}>
                <div class={pickerTimeStripRowMultiClass}>
                  <div class={timeColWrapClass}>
                    <div class={timeSingleStripClass}>
                      {timeSingleColHeader}
                    </div>
                    <div
                      class={timeColListClass}
                      data-picker-time-col
                      data-picker-time-kind="hour"
                    >
                      {HOURS.map((h) => {
                        const pick = () => {
                          if (mode === "range") activeHour.value = h;
                          else draftHour.value = h;
                        };
                        return (
                          <button
                            key={h}
                            type="button"
                            data-picker-cell-value={h}
                            data-picker-time-active={selectedHourVal === h
                              ? true
                              : undefined}
                            class={twMerge(
                              PICKER_TIME_LIST_ITEM_BASE,
                              "w-full",
                              selectedHourVal === h
                                ? PICKER_TIME_LIST_ITEM_SELECTED
                                : "",
                            )}
                            onPointerDown={(e: PointerEvent) =>
                              runTimeStripPrimaryPointerPick(e, pick)}
                            onClick={pick}
                          >
                            {String(h).padStart(2, "0")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
            : tg === "minute"
            ? (
              <div class={pickerTimeStripSingleCenterWrapClass}>
                <div class={pickerTimeStripRowMultiClass}>
                  <div class={timeColWrapClass}>
                    <div class={timeSingleStripClass}>
                      {timeSingleColHeader}
                    </div>
                    <div
                      class={timeColListClass}
                      data-picker-time-col
                      data-picker-time-kind="minute"
                    >
                      {MINUTES.map((minVal) => {
                        const pick = () => {
                          if (mode === "range") {
                            activeMinute.value = minVal;
                          } else draftMinute.value = minVal;
                        };
                        return (
                          <button
                            key={minVal}
                            type="button"
                            data-picker-cell-value={minVal}
                            data-picker-time-active={selectedMinuteVal ===
                                minVal
                              ? true
                              : undefined}
                            class={twMerge(
                              PICKER_TIME_LIST_ITEM_BASE,
                              "w-full",
                              selectedMinuteVal === minVal
                                ? PICKER_TIME_LIST_ITEM_SELECTED
                                : "",
                            )}
                            onPointerDown={(e: PointerEvent) =>
                              runTimeStripPrimaryPointerPick(e, pick)}
                            onClick={pick}
                          >
                            {String(minVal).padStart(2, "0")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
            : (
              <div class={pickerTimeStripSingleCenterWrapClass}>
                <div class={pickerTimeStripRowMultiClass}>
                  <div class={timeColWrapClass}>
                    <div class={timeSingleStripClass}>
                      {timeSingleColHeader}
                    </div>
                    <div
                      class={timeColListClass}
                      data-picker-time-col
                      data-picker-time-kind="second"
                    >
                      {SECONDS.map((secVal) => {
                        const pick = () => {
                          if (mode === "range") {
                            activeSecond.value = secVal;
                          } else draftSecond.value = secVal;
                        };
                        return (
                          <button
                            key={secVal}
                            type="button"
                            data-picker-cell-value={secVal}
                            data-picker-time-active={selectedSecondVal ===
                                secVal
                              ? true
                              : undefined}
                            class={twMerge(
                              PICKER_TIME_LIST_ITEM_BASE,
                              "w-full",
                              selectedSecondVal === secVal
                                ? PICKER_TIME_LIST_ITEM_SELECTED
                                : "",
                            )}
                            onPointerDown={(e: PointerEvent) =>
                              runTimeStripPrimaryPointerPick(e, pick)}
                            onClick={pick}
                          >
                            {String(secVal).padStart(2, "0")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
        )
        : (
          <div class="contents">
            {showHourCol && (
              <div class={timeColWrapClass}>
                <div class="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 py-1 text-center border-b border-slate-200 dark:border-slate-600">
                  时
                </div>
                <div
                  class={timeColListClass}
                  data-picker-time-col
                  data-picker-time-kind="hour"
                >
                  {HOURS.map((h) => {
                    const pick = () => {
                      if (mode === "range") activeHour.value = h;
                      else draftHour.value = h;
                    };
                    return (
                      <button
                        key={h}
                        type="button"
                        data-picker-cell-value={h}
                        data-picker-time-active={selectedHourVal === h
                          ? true
                          : undefined}
                        class={twMerge(
                          PICKER_TIME_LIST_ITEM_BASE,
                          "w-full",
                          selectedHourVal === h
                            ? PICKER_TIME_LIST_ITEM_SELECTED
                            : "",
                        )}
                        onPointerDown={(e: PointerEvent) =>
                          runTimeStripPrimaryPointerPick(e, pick)}
                        onClick={pick}
                      >
                        {String(h).padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {showMinuteCol && (
              <div class={timeColWrapClass}>
                <div class="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 py-1 text-center border-b border-slate-200 dark:border-slate-600">
                  分
                </div>
                <div
                  class={timeColListClass}
                  data-picker-time-col
                  data-picker-time-kind="minute"
                >
                  {MINUTES.map((minVal) => {
                    const pick = () => {
                      if (mode === "range") activeMinute.value = minVal;
                      else draftMinute.value = minVal;
                    };
                    return (
                      <button
                        key={minVal}
                        type="button"
                        data-picker-cell-value={minVal}
                        data-picker-time-active={selectedMinuteVal === minVal
                          ? true
                          : undefined}
                        class={twMerge(
                          PICKER_TIME_LIST_ITEM_BASE,
                          "w-full",
                          selectedMinuteVal === minVal
                            ? PICKER_TIME_LIST_ITEM_SELECTED
                            : "",
                        )}
                        onPointerDown={(e: PointerEvent) =>
                          runTimeStripPrimaryPointerPick(e, pick)}
                        onClick={pick}
                      >
                        {String(minVal).padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {showSecondCol && (
              <div class={timeColWrapClass}>
                <div class="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 py-1 text-center border-b border-slate-200 dark:border-slate-600">
                  秒
                </div>
                <div
                  class={timeColListClass}
                  data-picker-time-col
                  data-picker-time-kind="second"
                >
                  {SECONDS.map((secVal) => {
                    const pick = () => {
                      if (mode === "range") {
                        activeSecond.value = secVal;
                      } else draftSecond.value = secVal;
                    };
                    return (
                      <button
                        key={secVal}
                        type="button"
                        data-picker-cell-value={secVal}
                        data-picker-time-active={selectedSecondVal === secVal
                          ? true
                          : undefined}
                        class={twMerge(
                          PICKER_TIME_LIST_ITEM_BASE,
                          "w-full",
                          selectedSecondVal === secVal
                            ? PICKER_TIME_LIST_ITEM_SELECTED
                            : "",
                        )}
                        onPointerDown={(e: PointerEvent) =>
                          runTimeStripPrimaryPointerPick(e, pick)}
                        onClick={pick}
                      >
                        {String(secVal).padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
}

/**
 * 浮层子树：日历 + 时间轨 + 确定/取消（与 {@link DatePicker} 的 {@link DatePickerOverlay} 同构）。
 */
function DateTimePickerOverlay(p: {
  props: DateTimePickerProps;
  triggerRef: { current: HTMLButtonElement | null };
  clearOutsidePointerDismiss: () => void;
  outsidePointerCleanup: { dispose: (() => void) | null };
  pickerAnchorScrollCleanup: { dispose: (() => void) | null };
  outsidePanelEl: { current: HTMLElement | null };
  closePickerOverlay: (forced?: boolean) => void;
  draftDay: Signal<Date | null>;
  draftHour: Signal<number>;
  draftMinute: Signal<number>;
  draftSecond: Signal<number>;
  draftStartDay: Signal<Date | null>;
  draftStartHour: Signal<number>;
  draftStartMinute: Signal<number>;
  draftStartSecond: Signal<number>;
  draftEndDay: Signal<Date | null>;
  draftEndHour: Signal<number>;
  draftEndMinute: Signal<number>;
  draftEndSecond: Signal<number>;
  editingRangeEnd: Signal<boolean>;
  draftDtList: Signal<string[]>;
  viewDate: Signal<Date>;
  headerPanel: Signal<PickerCalendarHeaderPanel>;
  yearPageStart: Signal<number>;
  onSelectMultipleDay: (d: Date) => void;
  handleConfirm: () => void;
  handleCancel: () => void;
  confirmDisabled: boolean;
  confirmClass: string;
  useViewportPanel: boolean;
  showSecondCol: boolean;
  rangeTabCls: (active: boolean) => string;
}): JSX.Element {
  const {
    props,
    triggerRef,
    clearOutsidePointerDismiss,
    outsidePointerCleanup,
    pickerAnchorScrollCleanup,
    outsidePanelEl,
    closePickerOverlay,
    draftDay,
    draftHour,
    draftMinute,
    draftSecond,
    draftStartDay,
    draftStartHour,
    draftStartMinute,
    draftStartSecond,
    draftEndDay,
    draftEndHour,
    draftEndMinute,
    draftEndSecond,
    editingRangeEnd,
    draftDtList,
    viewDate,
    headerPanel,
    yearPageStart,
    onSelectMultipleDay,
    handleConfirm,
    handleCancel,
    confirmDisabled,
    confirmClass,
    useViewportPanel,
    showSecondCol,
    rangeTabCls,
  } = p;

  const { mode, dtFormatSpec, minDate, maxDate, disabledDate } =
    getDateTimePickerDerivatives(props);

  /**
   * 将多选稿中的每条日期时间串解析为自然日，供 {@link PickerCalendarNav} 高亮。
   */
  const datetimeListToDays = (items: readonly string[]): Date[] => {
    const out: Date[] = [];
    for (const s of items) {
      const parsed = parseDateTimeStringWithSpec(s, dtFormatSpec);
      if (parsed != null) out.push(parsed.day);
    }
    return out;
  };

  return (
    <div
      role="dialog"
      aria-label="选择日期与时间"
      class={twMerge(
        "pointer-events-auto box-border w-max min-w-[288px] overflow-hidden p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg",
        showSecondCol
          ? "max-w-[min(100vw-1rem,32rem)]"
          : "max-w-[min(100vw-1rem,28rem)]",
        useViewportPanel
          ? twMerge("fixed", pickerPortalZClass)
          : "absolute left-0 top-full z-1070 mt-1",
      )}
      ref={(el: HTMLElement | null) => {
        if (el == null) {
          clearOutsidePointerDismiss();
          return;
        }
        if (el === outsidePanelEl.current) return;
        clearOutsidePointerDismiss();
        outsidePanelEl.current = el;
        globalThis.queueMicrotask(() => {
          if (outsidePanelEl.current !== el) return;
          const viewport = (props.panelAttach ?? "anchored") === "viewport";
          registerPickerFixedOverlayPositionAndOutsideClick(
            el,
            triggerRef,
            closePickerOverlay,
            outsidePointerCleanup,
            pickerAnchorScrollCleanup,
            { panelMinWidth: showSecondCol ? 360 : 288 },
            viewport ? undefined : { fixedToViewport: false },
          );
        });
      }}
    >
      {mode === "range" && (
        <div class="flex gap-2 mb-2">
          <button
            type="button"
            class={rangeTabCls(!editingRangeEnd.value)}
            onClick={() => {
              editingRangeEnd.value = false;
              const d = draftStartDay.value;
              if (d != null) viewDate.value = d;
            }}
          >
            {draftStartDay.value != null
              ? `开始 · ${
                formatDateTimeWithSpec(
                  draftStartDay.value,
                  draftStartHour.value,
                  draftStartMinute.value,
                  draftStartSecond.value,
                  dtFormatSpec,
                )
              }`
              : "开始"}
          </button>
          <button
            type="button"
            class={rangeTabCls(editingRangeEnd.value)}
            onClick={() => {
              editingRangeEnd.value = true;
              const d = draftEndDay.value;
              if (d != null) {
                viewDate.value = d;
              }
            }}
          >
            {draftEndDay.value != null
              ? `结束 · ${
                formatDateTimeWithSpec(
                  draftEndDay.value,
                  draftEndHour.value,
                  draftEndMinute.value,
                  draftEndSecond.value,
                  dtFormatSpec,
                )
              }`
              : "结束"}
          </button>
        </div>
      )}

      <div class="flex flex-col sm:flex-row sm:items-start gap-3">
        <div class="w-full min-w-0 shrink-0 sm:w-[288px] sm:min-w-[288px] sm:max-w-[288px]">
          <PickerCalendarNav
            viewDate={viewDate}
            panelMode={headerPanel}
            yearPageStart={yearPageStart}
            minDate={minDate}
            maxDate={maxDate}
            dateGranularity={dtFormatSpec.dateGranularity}
            selectedDate={mode === "single"
              ? (draftDay.value ?? undefined)
              : undefined}
            selectedDaySignal={mode === "single" ? draftDay : undefined}
            rangeStartSignal={mode === "range" ? draftStartDay : undefined}
            rangeEndSignal={mode === "range" ? draftEndDay : undefined}
            rangeDatetimeActiveEndSignal={mode === "range"
              ? editingRangeEnd
              : undefined}
            daySelectionMode={mode === "multiple" ? "multiple" : "single"}
            selectedDates={undefined}
            multipleItemsSignal={mode === "multiple" ? draftDtList : undefined}
            multipleItemsToDays={mode === "multiple"
              ? datetimeListToDays
              : undefined}
            onSelectDay={(d) => {
              if (mode === "single") draftDay.value = d;
              else if (mode === "range") {
                if (editingRangeEnd.value) draftEndDay.value = d;
                else draftStartDay.value = d;
              } else onSelectMultipleDay(d);
            }}
            disabledDate={disabledDate}
          />
        </div>
        <DateTimePickerTimeStrip
          mode={mode}
          dtFormatSpec={dtFormatSpec}
          editingRangeEnd={editingRangeEnd}
          draftHour={draftHour}
          draftMinute={draftMinute}
          draftSecond={draftSecond}
          draftStartHour={draftStartHour}
          draftStartMinute={draftStartMinute}
          draftStartSecond={draftStartSecond}
          draftEndHour={draftEndHour}
          draftEndMinute={draftEndMinute}
          draftEndSecond={draftEndSecond}
        />
      </div>
      <div class="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
        <button
          type="button"
          disabled={confirmDisabled}
          class={confirmClass}
          onClick={handleConfirm}
        >
          确定
        </button>
        <button
          type="button"
          class="px-3 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
          onClick={handleCancel}
        >
          取消
        </button>
      </div>
    </div>
  );
}

/**
 * DateTimePicker：日期时间选择器。
 */
export function DateTimePicker(props: DateTimePickerProps): JSX.Element {
  const openState = useSignal(false);
  const draftDay = useSignal<Date | null>(null);
  const draftHour = useSignal(0);
  const draftMinute = useSignal(0);
  const draftSecond = useSignal(0);
  const draftStartDay = useSignal<Date | null>(null);
  const draftStartHour = useSignal(0);
  const draftStartMinute = useSignal(0);
  const draftStartSecond = useSignal(0);
  const draftEndDay = useSignal<Date | null>(null);
  const draftEndHour = useSignal(0);
  const draftEndMinute = useSignal(0);
  const draftEndSecond = useSignal(0);
  const editingRangeEnd = useSignal(false);
  const draftDtList = useSignal<string[]>([]);

  const viewDate = useSignal<Date>(new Date());
  const headerPanel = useSignal<PickerCalendarHeaderPanel>("day");
  const yearPageStart = useSignal(0);

  const triggerRef: { current: HTMLButtonElement | null } = {
    current: null,
  };
  const outsidePointerCleanup: { dispose: (() => void) | null } = {
    dispose: null,
  };
  const pickerAnchorScrollCleanup: { dispose: (() => void) | null } = {
    dispose: null,
  };
  const outsidePanelEl: { current: HTMLElement | null } = { current: null };

  const OPEN_SUPPRESS_NON_FORCED_CLOSE_MS = 120;
  let suppressNonForcedCloseUntil = 0;

  /**
   * range 模式「开始 / 结束」标签按钮样式。
   *
   * @param active - 当前是否为激活槽位
   */
  const rangeTabCls = (active: boolean) =>
    twMerge(
      "flex-1 px-2 py-1.5 text-xs rounded-md border transition-colors",
      active
        ? "border-blue-600 bg-blue-50 text-blue-800 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-200"
        : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50",
    );

  const clearOutsidePointerDismiss = () => {
    outsidePointerCleanup.dispose?.();
    outsidePointerCleanup.dispose = null;
    pickerAnchorScrollCleanup.dispose?.();
    pickerAnchorScrollCleanup.dispose = null;
    outsidePanelEl.current = null;
  };

  /**
   * 关闭浮层；`forced` 为 true 时忽略打开后短时间内的非强制关闭（与 {@link DatePicker} 一致）。
   */
  const closePickerOverlay = (forced = false) => {
    if (!forced) {
      const now = typeof globalThis.performance !== "undefined" &&
          typeof globalThis.performance.now === "function"
        ? globalThis.performance.now()
        : Date.now();
      if (now < suppressNonForcedCloseUntil) {
        return;
      }
    }
    clearOutsidePointerDismiss();
    clearDropdownEsc();
    openState.value = false;
  };

  /**
   * 确定：按 mode 提交并派发 `onChange`。
   */
  const handleConfirm = () => {
    const { mode, dtFormatSpec } = getDateTimePickerDerivatives(props);
    const { name, onChange } = props;
    if (mode === "single") {
      const day = dtFormatSpec.dateGranularity === "day"
        ? draftDay.value
        : viewDate.value;
      if (day == null) return;
      const str = formatDateTimeWithSpec(
        day,
        draftHour.value,
        draftMinute.value,
        draftSecond.value,
        dtFormatSpec,
      );
      commitMaybeSignal(props.value, str);
      const synthetic = {
        target: { name: name ?? undefined, value: str },
      } as unknown as Event;
      onChange?.(synthetic);
      closePickerOverlay(true);
      return;
    }
    if (mode === "range") {
      const ds = draftStartDay.value;
      const de = draftEndDay.value;
      if (ds == null || de == null) return;
      const slotA = formatDateTimeWithSpec(
        ds,
        draftStartHour.value,
        draftStartMinute.value,
        draftStartSecond.value,
        dtFormatSpec,
      );
      const slotB = formatDateTimeWithSpec(
        de,
        draftEndHour.value,
        draftEndMinute.value,
        draftEndSecond.value,
        dtFormatSpec,
      );
      const [startOut, endOut] = slotA <= slotB
        ? [slotA, slotB]
        : [slotB, slotA];
      const rangeCommitted: DateTimePickerRangeValue = {
        start: startOut,
        end: endOut,
      };
      commitMaybeSignal(props.value, rangeCommitted);
      const payload = JSON.stringify({ start: startOut, end: endOut });
      const synthetic = {
        target: { name: name ?? undefined, value: payload },
      } as unknown as Event;
      onChange?.(synthetic);
      closePickerOverlay(true);
      return;
    }
    const multiCommitted = [...draftDtList.value].sort();
    commitMaybeSignal(props.value, multiCommitted);
    const synthetic = {
      target: {
        name: name ?? undefined,
        value: JSON.stringify(multiCommitted),
      },
    } as unknown as Event;
    onChange?.(synthetic);
    closePickerOverlay(true);
  };

  const handleCancel = () => {
    closePickerOverlay(true);
  };

  /**
   * 浮层打开时触发器展示草稿；关闭后与受控 `props.value` 一致。隐藏域始终为已提交值。
   */
  const rawForTriggerDisplay = (): unknown => {
    const { mode, dtFormatSpec } = getDateTimePickerDerivatives(props);
    const committed = resolveDateTimePickerRaw(props.value);
    if (!openState.value) return committed;
    if (mode === "single") {
      const day = dtFormatSpec.dateGranularity === "day"
        ? draftDay.value
        : viewDate.value;
      if (day == null) return committed;
      return formatDateTimeWithSpec(
        day,
        draftHour.value,
        draftMinute.value,
        draftSecond.value,
        dtFormatSpec,
      );
    }
    if (mode === "range") {
      const ds = draftStartDay.value;
      const de = draftEndDay.value;
      if (ds == null && de == null) return committed;
      return {
        start: ds != null
          ? formatDateTimeWithSpec(
            ds,
            draftStartHour.value,
            draftStartMinute.value,
            draftStartSecond.value,
            dtFormatSpec,
          )
          : "",
        end: de != null
          ? formatDateTimeWithSpec(
            de,
            draftEndHour.value,
            draftEndMinute.value,
            draftEndSecond.value,
            dtFormatSpec,
          )
          : "",
      };
    }
    const list = draftDtList.value;
    return list.length > 0 ? [...list] : committed;
  };

  /**
   * multiple：按自然日切换；该日已有任一条则整日移除，否则用当前时/分追加。
   */
  const onSelectMultipleDay = (d: Date) => {
    const { disabledDate, dtFormatSpec } = getDateTimePickerDerivatives(props);
    if (disabledDate(d)) return;
    const hm = formatDateTimeWithSpec(
      d,
      draftHour.value,
      draftMinute.value,
      draftSecond.value,
      dtFormatSpec,
    );
    const list = draftDtList.value;
    const hasDay = list.some((s) => {
      const p = parseDateTimeStringWithSpec(s, dtFormatSpec);
      return p != null && sameCalendarDay(p.day, d);
    });
    if (hasDay) {
      draftDtList.value = list.filter((s) => {
        const p = parseDateTimeStringWithSpec(s, dtFormatSpec);
        return p == null || !sameCalendarDay(p.day, d);
      });
    } else {
      draftDtList.value = [...list, hm].sort();
    }
  };

  /**
   * 打开时按 mode 同步草稿；`queueMicrotask` 避免同一次点击内误关浮层。
   */
  const handleOpen = () => {
    if (props.disabled) return;
    globalThis.queueMicrotask(() => {
      if (props.disabled) return;
      {
        const now = typeof globalThis.performance !== "undefined" &&
            typeof globalThis.performance.now === "function"
          ? globalThis.performance.now()
          : Date.now();
        suppressNonForcedCloseUntil = now + OPEN_SUPPRESS_NON_FORCED_CLOSE_MS;
      }
      const { mode, dtFormatSpec, disabledDate } = getDateTimePickerDerivatives(
        props,
      );
      const raw = resolveDateTimePickerRaw(props.value);

      batch(() => {
        const nowHms = getLocalTimeHourMinuteSecond();
        const [nH, nM, nS] = nowHms;
        if (mode === "single") {
          const rawStr = typeof raw === "string" ? raw : undefined;
          const p = parseDateTimeStringWithSpec(rawStr, dtFormatSpec);
          const base = p?.day ?? new Date();
          let vd = base;
          if (dtFormatSpec.dateGranularity === "year") {
            vd = new Date(base.getFullYear(), 0, 1);
          } else if (dtFormatSpec.dateGranularity === "year-month") {
            vd = new Date(base.getFullYear(), base.getMonth(), 1);
          }
          viewDate.value = vd;
          if (p) {
            draftDay.value = dtFormatSpec.dateGranularity === "day"
              ? p.day
              : vd;
            draftHour.value = p.hour;
            draftMinute.value = p.minute;
            draftSecond.value = p.second;
          } else {
            draftDay.value = dtFormatSpec.dateGranularity === "day"
              ? defaultPickerDayWhenNoValue(base, disabledDate)
              : vd;
            draftHour.value = nH;
            draftMinute.value = nM;
            draftSecond.value = nS;
          }
        } else if (mode === "range") {
          const o = isDateTimeRangeValue(raw) ? raw : {};
          const ps = parseDateTimeStringWithSpec(o.start, dtFormatSpec);
          const pe = parseDateTimeStringWithSpec(o.end, dtFormatSpec);
          draftStartDay.value = ps?.day ?? null;
          draftStartHour.value = ps?.hour ?? nH;
          draftStartMinute.value = ps?.minute ?? nM;
          draftStartSecond.value = ps?.second ?? nS;
          draftEndDay.value = pe?.day ?? null;
          draftEndHour.value = pe?.hour ?? nH;
          draftEndMinute.value = pe?.minute ?? nM;
          draftEndSecond.value = pe?.second ?? nS;
          editingRangeEnd.value = false;
          const view = ps?.day ?? pe?.day ?? new Date();
          viewDate.value = view;
        } else {
          draftDtList.value = isDateTimeStringArray(raw) ? [...raw].sort() : [];
          draftHour.value = nH;
          draftMinute.value = nM;
          draftSecond.value = nS;
          const first = draftDtList.value[0];
          const fp = parseDateTimeStringWithSpec(first, dtFormatSpec);
          viewDate.value = fp?.day ?? new Date();
        }

        if (dtFormatSpec.dateGranularity === "year") {
          headerPanel.value = "year";
          yearPageStart.value = yearGridPageStart(viewDate.value.getFullYear());
        } else if (dtFormatSpec.dateGranularity === "year-month") {
          headerPanel.value = "month";
        } else {
          headerPanel.value = "day";
        }
        openState.value = true;
      });
      registerDropdownEsc(() => closePickerOverlay(true));
    });
  };

  /**
   * 打开或草稿变化后调度时间列滚动（与 {@link TimePicker} 同因）。
   */
  useSignalEffect(() => {
    if (!openState.value) return;
    void draftHour.value;
    void draftMinute.value;
    void draftSecond.value;
    void draftStartHour.value;
    void draftStartMinute.value;
    void draftStartSecond.value;
    void draftEndHour.value;
    void draftEndMinute.value;
    void draftEndSecond.value;
    void editingRangeEnd.value;
    const { mode, dtFormatSpec } = getDateTimePickerDerivatives(props);
    globalThis.queueMicrotask(() => {
      schedulePickerTimeDraftColumnsScroll(() => outsidePanelEl.current, () => {
        const flags = dateTimePickerScrollShowFlags(
          dtFormatSpec.timeGranularity,
        );
        if (mode === "range") {
          const atEnd = editingRangeEnd.value;
          return [
            {
              ...flags,
              hour: atEnd ? draftEndHour.value : draftStartHour.value,
              minute: atEnd ? draftEndMinute.value : draftStartMinute.value,
              second: atEnd ? draftEndSecond.value : draftStartSecond.value,
              stripScope: "default",
            },
          ];
        }
        return [
          {
            ...flags,
            hour: draftHour.value,
            minute: draftMinute.value,
            second: draftSecond.value,
            stripScope: "default",
          },
        ];
      });
    });
  });

  const derivatives = getDateTimePickerDerivatives(props);
  const { mode, dtFormatSpec } = derivatives;
  const rawCommitted = resolveDateTimePickerRaw(props.value);
  const hiddenVal = dateTimePickerHiddenSerialized(mode, rawCommitted);
  const placeholder = props.placeholder ?? "请选择日期时间";
  const rawDisplay = rawForTriggerDisplay();
  const displayText = dateTimePickerDisplayText(mode, rawDisplay, placeholder);
  const hasVal = dateTimePickerHasValue(mode, rawDisplay);
  const size = props.size ?? "md";
  const triggerBtnClass = twMerge(
    pickerTriggerSurface,
    controlBlueFocusRing(!props.hideFocusRing),
    pickerTriggerSizeClasses[size],
  );
  const iconProps = pickerCalendarIconProps(size);
  const rootClass = twMerge("relative inline-block", props.class);
  const useViewportPanel = (props.panelAttach ?? "anchored") === "viewport";
  const showSecondCol = dtFormatSpec.timeGranularity === "second" ||
    dtFormatSpec.timeGranularity === "hour-minute-second";

  const confirmDisabled = mode === "single"
    ? dtFormatSpec.dateGranularity === "day" && draftDay.value == null
    : mode === "range"
    ? draftStartDay.value == null || draftEndDay.value == null
    : false;

  const canConfirm = mode === "single"
    ? (dtFormatSpec.dateGranularity === "day" ? draftDay.value != null : true)
    : mode === "range"
    ? draftStartDay.value != null && draftEndDay.value != null
    : true;

  const confirmClass = twMerge(
    "px-3 py-1.5 text-sm rounded text-white",
    canConfirm
      ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      : "cursor-not-allowed bg-slate-300 dark:bg-slate-600",
  );

  return (
    <div
      class={rootClass}
      data-ui-datetime-picker-root=""
    >
      <input
        type="hidden"
        name={props.name}
        value={hiddenVal}
      />
      <button
        type="button"
        id={props.id}
        /**
         * 触发器 DOM：点外关闭与几何同步用；须用函数 ref。
         */
        ref={(el: HTMLButtonElement | null) => {
          triggerRef.current = el;
        }}
        disabled={props.disabled ?? false}
        aria-haspopup="dialog"
        aria-expanded={openState.value}
        aria-label={displayText}
        class={triggerBtnClass}
        onClick={handleOpen}
      >
        <span
          class={hasVal
            ? "text-slate-900 dark:text-slate-100"
            : "text-slate-400 dark:text-slate-500"}
        >
          {displayText}
        </span>
        <span
          class={twMerge(
            "inline-flex shrink-0 items-center justify-center",
            openState.value
              ? "text-slate-600 dark:text-slate-300"
              : "text-slate-400 dark:text-slate-500",
          )}
        >
          <IconCalendar
            size={iconProps.size}
            class={twMerge(
              iconProps.class,
              "shrink-0",
            )}
          />
        </span>
      </button>
      {openState.value && (
        <DateTimePickerOverlay
          props={props}
          triggerRef={triggerRef}
          clearOutsidePointerDismiss={clearOutsidePointerDismiss}
          outsidePointerCleanup={outsidePointerCleanup}
          pickerAnchorScrollCleanup={pickerAnchorScrollCleanup}
          outsidePanelEl={outsidePanelEl}
          closePickerOverlay={closePickerOverlay}
          draftDay={draftDay}
          draftHour={draftHour}
          draftMinute={draftMinute}
          draftSecond={draftSecond}
          draftStartDay={draftStartDay}
          draftStartHour={draftStartHour}
          draftStartMinute={draftStartMinute}
          draftStartSecond={draftStartSecond}
          draftEndDay={draftEndDay}
          draftEndHour={draftEndHour}
          draftEndMinute={draftEndMinute}
          draftEndSecond={draftEndSecond}
          editingRangeEnd={editingRangeEnd}
          draftDtList={draftDtList}
          viewDate={viewDate}
          headerPanel={headerPanel}
          yearPageStart={yearPageStart}
          onSelectMultipleDay={onSelectMultipleDay}
          handleConfirm={handleConfirm}
          handleCancel={handleCancel}
          confirmDisabled={confirmDisabled}
          confirmClass={confirmClass}
          useViewportPanel={useViewportPanel}
          showSecondCol={showSecondCol}
          rangeTabCls={rangeTabCls}
        />
      )}
    </div>
  );
}
