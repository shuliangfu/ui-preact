/**
 * DatePicker 日期选择（Preact）。
 * 自研触发按钮 + Calendar 浮层；行为与 ui-view 对齐。
 */

import type { JSX } from "preact";
import { batch, type Signal, useSignal } from "@preact/signals";
import { twMerge } from "tailwind-merge";
import { IconCalendar } from "../basic/icons/Calendar.tsx";
import {
  calendarDayStart,
  compareCalendarDays,
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
  DEFAULT_DATE_FORMAT,
  formatDateWithSpec,
  normalizeMinMaxDateForGranularity,
  parseDatePickerFormat,
  parseDateStringWithSpec,
  type ParsedDateFormat,
} from "./picker-format.ts";
import {
  pickerPortalZClass,
  registerPickerFixedOverlayPositionAndOutsideClick,
} from "./picker-portal-utils.ts";
import { pickerCalendarIconProps } from "./picker-trigger-icon.ts";
import {
  commitMaybeSignal,
  type MaybeSignal,
  readMaybeSignal,
} from "./maybe-signal.ts";

/** 与 {@link DatePickerProps.mode} 中 `range` 对应的受控值形态 */
export interface DatePickerRangeValue {
  start?: string;
  end?: string;
}

/** 日期选择模式 */
export type DatePickerMode = "single" | "range" | "multiple";

/** 受控值形态 */
export type DatePickerValue = string | DatePickerRangeValue | string[];

export interface DatePickerProps {
  mode?: DatePickerMode;
  value?: MaybeSignal<DatePickerValue>;
  min?: string;
  max?: string;
  size?: SizeVariant;
  disabled?: boolean;
  onChange?: (e: Event) => void;
  class?: string;
  name?: string;
  id?: string;
  placeholder?: string;
  hideFocusRing?: boolean;
  format?: string;
  panelAttach?: "anchored" | "viewport";
}

const DROPDOWN_ESC_KEY = "__lastDropdownClose" as const;

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

function parseYmdFull(s: string | undefined): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (
    isNaN(date.getTime()) || date.getFullYear() !== y ||
    date.getMonth() !== m - 1 || date.getDate() !== d
  ) return null;
  return date;
}

function resolveDatePickerFormatSpec(
  format: string | undefined,
  mode: DatePickerMode,
): ParsedDateFormat {
  const raw = format?.trim() || DEFAULT_DATE_FORMAT;
  const parsed = parseDatePickerFormat(raw);
  if (!parsed.ok) {
    console.warn(
      `[DatePicker] format 无效：${parsed.error}，已使用 ${DEFAULT_DATE_FORMAT}`,
    );
    const fb = parseDatePickerFormat(DEFAULT_DATE_FORMAT);
    if (!fb.ok) throw new Error("[DatePicker] 内置默认 format 解析失败");
    return fb.spec;
  }
  if (mode !== "single" && parsed.spec.granularity !== "day") {
    console.warn(
      "[DatePicker] range/multiple 仅支持含「日」的完整日期（如 YYYY-MM-DD），已回退默认 format",
    );
    const fb = parseDatePickerFormat(DEFAULT_DATE_FORMAT);
    if (!fb.ok) throw new Error("[DatePicker] 内置默认 format 解析失败");
    return fb.spec;
  }
  return parsed.spec;
}

function isDatePickerRangeValue(v: unknown): v is DatePickerRangeValue {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function isYmdStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function resolveDatePickerRaw(
  value: DatePickerProps["value"],
): unknown {
  return readMaybeSignal(value as MaybeSignal<DatePickerValue> | undefined);
}

function datePickerDisplayText(
  mode: DatePickerMode,
  raw: unknown,
  placeholder: string,
): string {
  if (mode === "single") {
    const s = typeof raw === "string" ? raw : "";
    return s.trim() !== "" ? s : placeholder;
  }
  if (mode === "range") {
    const o = isDatePickerRangeValue(raw) ? raw : {};
    const st = o.start?.trim() ?? "";
    const en = o.end?.trim() ?? "";
    if (st === "" && en === "") return placeholder;
    return `${st || "…"} ~ ${en || "…"}`;
  }
  const arr = isYmdStringArray(raw) ? raw : [];
  if (arr.length === 0) return placeholder;
  if (arr.length <= 2) return arr.join("、");
  return `${arr.length} 个日期`;
}

function datePickerHiddenSerialized(
  mode: DatePickerMode,
  raw: unknown,
): string {
  if (mode === "single") {
    const s = typeof raw === "string" ? raw : "";
    return s.trim() !== "" ? s : "";
  }
  if (mode === "range") {
    const o = isDatePickerRangeValue(raw) ? raw : {};
    return JSON.stringify({
      start: o.start?.trim() ?? "",
      end: o.end?.trim() ?? "",
    });
  }
  const arr = isYmdStringArray(raw) ? [...raw].sort() : [];
  return JSON.stringify(arr);
}

function datePickerHasValue(mode: DatePickerMode, raw: unknown): boolean {
  if (mode === "single") {
    return typeof raw === "string" && raw.trim() !== "";
  }
  if (mode === "range") {
    const o = isDatePickerRangeValue(raw) ? raw : {};
    return (o.start?.trim() ?? "") !== "" || (o.end?.trim() ?? "") !== "";
  }
  return isYmdStringArray(raw) && raw.length > 0;
}

function getDatePickerDerivatives(props: DatePickerProps) {
  const mode: DatePickerMode = props.mode ?? "single";
  const dateFormatSpec = resolveDatePickerFormatSpec(props.format, mode);
  const minDate = normalizeMinMaxDateForGranularity(
    props.min,
    dateFormatSpec.granularity,
  );
  const maxDate = normalizeMinMaxDateForGranularity(
    props.max,
    dateFormatSpec.granularity,
  );
  const disabledDate = (d: Date) => {
    const t = calendarDayStart(d);
    if (minDate != null && t < calendarDayStart(minDate)) return true;
    if (maxDate != null && t > calendarDayStart(maxDate)) return true;
    return false;
  };
  return { mode, dateFormatSpec, minDate, maxDate, disabledDate };
}

/**
 * DatePicker：日期选择器。
 */
export function DatePicker(props: DatePickerProps): JSX.Element {
  const openState = useSignal(false);
  const draft = useSignal<Date | null>(null);
  const draftRangeStart = useSignal<Date | null>(null);
  const draftRangeEnd = useSignal<Date | null>(null);
  const draftMultiple = useSignal<string[]>([]);
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

  const clearOutsidePointerDismiss = () => {
    outsidePointerCleanup.dispose?.();
    outsidePointerCleanup.dispose = null;
    pickerAnchorScrollCleanup.dispose?.();
    pickerAnchorScrollCleanup.dispose = null;
    outsidePanelEl.current = null;
  };

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

  const onSelectDayRange = (d: Date) => {
    const { disabledDate } = getDatePickerDerivatives(props);
    if (disabledDate(d)) return;
    const s = draftRangeStart.value;
    const e = draftRangeEnd.value;
    if (s == null || (s != null && e != null)) {
      draftRangeStart.value = d;
      draftRangeEnd.value = null;
      return;
    }
    let a = s;
    let b = d;
    if (compareCalendarDays(a, b) > 0) {
      const t = a;
      a = b;
      b = t;
    }
    draftRangeStart.value = a;
    draftRangeEnd.value = b;
  };

  const onSelectDayMultiple = (d: Date) => {
    const { disabledDate, dateFormatSpec } = getDatePickerDerivatives(props);
    if (disabledDate(d)) return;
    const ymd = formatDateWithSpec(d, dateFormatSpec);
    const cur = draftMultiple.value;
    const i = cur.indexOf(ymd);
    if (i >= 0) {
      draftMultiple.value = cur.filter((_, j) => j !== i);
    } else {
      draftMultiple.value = [...cur, ymd].sort();
    }
  };

  const handleConfirm = () => {
    const { mode, dateFormatSpec } = getDatePickerDerivatives(props);
    const { name, onChange } = props;
    if (mode === "single") {
      const d = dateFormatSpec.granularity === "day"
        ? draft.value
        : viewDate.value;
      if (d != null) {
        const str = formatDateWithSpec(d, dateFormatSpec);
        commitMaybeSignal(props.value, str);
        const synthetic = {
          target: { name: name ?? undefined, value: str },
        } as unknown as Event;
        onChange?.(synthetic);
      }
      closePickerOverlay(true);
      return;
    }
    if (mode === "range") {
      const a = draftRangeStart.value;
      const b = draftRangeEnd.value;
      if (a == null || b == null) return;
      const payload = JSON.stringify({
        start: formatDateWithSpec(a, dateFormatSpec),
        end: formatDateWithSpec(b, dateFormatSpec),
      });
      const rangeCommitted: DatePickerRangeValue = {
        start: formatDateWithSpec(a, dateFormatSpec),
        end: formatDateWithSpec(b, dateFormatSpec),
      };
      commitMaybeSignal(props.value, rangeCommitted);
      const synthetic = {
        target: { name: name ?? undefined, value: payload },
      } as unknown as Event;
      onChange?.(synthetic);
      closePickerOverlay(true);
      return;
    }
    const multiCommitted = [...draftMultiple.value];
    commitMaybeSignal(props.value, multiCommitted);
    const payload = JSON.stringify(draftMultiple.value);
    const synthetic = {
      target: { name: name ?? undefined, value: payload },
    } as unknown as Event;
    onChange?.(synthetic);
    closePickerOverlay(true);
  };

  const handleCancel = () => {
    closePickerOverlay(true);
  };

  const rawForTriggerDisplay = (): unknown => {
    const { mode, dateFormatSpec } = getDatePickerDerivatives(props);
    const committed = resolveDatePickerRaw(props.value);
    if (!openState.value) return committed;
    if (mode === "single") {
      const d = draft.value;
      if (d != null) return formatDateWithSpec(d, dateFormatSpec);
      return committed;
    }
    if (mode === "range") {
      const ds = draftRangeStart.value;
      const de = draftRangeEnd.value;
      if (ds == null && de == null) return committed;
      return {
        start: ds != null ? formatDateWithSpec(ds, dateFormatSpec) : "",
        end: de != null ? formatDateWithSpec(de, dateFormatSpec) : "",
      };
    }
    const list = draftMultiple.value;
    return list.length > 0 ? [...list] : committed;
  };

  const handleOpen = () => {
    if (props.disabled) {
      return;
    }
    queueMicrotask(() => {
      if (props.disabled) {
        return;
      }
      {
        const now = typeof globalThis.performance !== "undefined" &&
            typeof globalThis.performance.now === "function"
          ? globalThis.performance.now()
          : Date.now();
        suppressNonForcedCloseUntil = now + OPEN_SUPPRESS_NON_FORCED_CLOSE_MS;
      }
      const { mode, dateFormatSpec, disabledDate } = getDatePickerDerivatives(
        props,
      );
      const raw = resolveDatePickerRaw(props.value);

      batch(() => {
        if (mode === "single") {
          const rawStr = typeof raw === "string" ? raw : undefined;
          const v = parseDateStringWithSpec(rawStr, dateFormatSpec);
          const base = v ?? new Date();
          let vd = base;
          if (dateFormatSpec.granularity === "year") {
            vd = new Date(base.getFullYear(), 0, 1);
          } else if (dateFormatSpec.granularity === "year-month") {
            vd = new Date(base.getFullYear(), base.getMonth(), 1);
          }
          viewDate.value = vd;
          draft.value = dateFormatSpec.granularity === "day"
            ? (v ?? defaultPickerDayWhenNoValue(base, disabledDate))
            : vd;
        } else if (mode === "range") {
          const o = isDatePickerRangeValue(raw) ? raw : {};
          const ds = parseYmdFull(o.start);
          const de = parseYmdFull(o.end);
          draftRangeStart.value = ds;
          draftRangeEnd.value = de;
          const view = ds ?? de ?? new Date();
          viewDate.value = view;
        } else {
          const arr = isYmdStringArray(raw) ? [...raw].sort() : [];
          draftMultiple.value = arr;
          const first = arr.length > 0
            ? parseDateStringWithSpec(arr[0], dateFormatSpec)
            : null;
          viewDate.value = first ?? new Date();
        }

        if (dateFormatSpec.granularity === "year") {
          headerPanel.value = "year";
          yearPageStart.value = yearGridPageStart(
            viewDate.value.getFullYear(),
          );
        } else if (dateFormatSpec.granularity === "year-month") {
          headerPanel.value = "month";
        } else {
          headerPanel.value = "day";
        }
        openState.value = true;
      });
      registerDropdownEsc(() => closePickerOverlay(true));
    });
  };

  const derivatives = getDatePickerDerivatives(props);
  const rawCommitted = resolveDatePickerRaw(props.value);
  const hiddenVal = datePickerHiddenSerialized(derivatives.mode, rawCommitted);
  const placeholder = props.placeholder ?? "请选择日期";
  const rawDisplay = rawForTriggerDisplay();
  const displayText = datePickerDisplayText(
    derivatives.mode,
    rawDisplay,
    placeholder,
  );
  const hasVal = datePickerHasValue(derivatives.mode, rawDisplay);
  const size = props.size ?? "md";
  const triggerBtnClass = twMerge(
    pickerTriggerSurface,
    controlBlueFocusRing(!props.hideFocusRing),
    pickerTriggerSizeClasses[size],
  );
  const iconProps = pickerCalendarIconProps(size);

  const useViewportPanel = (props.panelAttach ?? "anchored") === "viewport";

  let confirmDisabled = false;
  if (derivatives.mode === "range") {
    confirmDisabled = draftRangeStart.value == null ||
      draftRangeEnd.value == null;
  }

  const confirmClass = twMerge(
    "px-3 py-1.5 text-sm rounded text-white",
    derivatives.mode === "single" || !confirmDisabled
      ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      : "cursor-not-allowed bg-slate-300 dark:bg-slate-600",
  );

  return (
    <div
      class={twMerge(
        "relative inline-block",
        props.class,
      )}
      data-ui-datepicker-root=""
    >
      <input
        type="hidden"
        name={props.name}
        value={hiddenVal}
      />
      <button
        type="button"
        id={props.id}
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
        <DatePickerOverlay
          props={props}
          triggerRef={triggerRef}
          clearOutsidePointerDismiss={clearOutsidePointerDismiss}
          outsidePointerCleanup={outsidePointerCleanup}
          pickerAnchorScrollCleanup={pickerAnchorScrollCleanup}
          outsidePanelEl={outsidePanelEl}
          closePickerOverlay={closePickerOverlay}
          draft={draft}
          draftRangeStart={draftRangeStart}
          draftRangeEnd={draftRangeEnd}
          draftMultiple={draftMultiple}
          viewDate={viewDate}
          headerPanel={headerPanel}
          yearPageStart={yearPageStart}
          onSelectDayRange={onSelectDayRange}
          onSelectDayMultiple={onSelectDayMultiple}
          handleConfirm={handleConfirm}
          handleCancel={handleCancel}
          confirmDisabled={confirmDisabled}
          confirmClass={confirmClass}
          useViewportPanel={useViewportPanel}
        />
      )}
    </div>
  );
}

/** 浮层子树：便于主组件保持可读性 */
function DatePickerOverlay(p: {
  props: DatePickerProps;
  triggerRef: { current: HTMLButtonElement | null };
  clearOutsidePointerDismiss: () => void;
  outsidePointerCleanup: { dispose: (() => void) | null };
  pickerAnchorScrollCleanup: { dispose: (() => void) | null };
  outsidePanelEl: { current: HTMLElement | null };
  closePickerOverlay: (forced?: boolean) => void;
  draft: Signal<Date | null>;
  draftRangeStart: Signal<Date | null>;
  draftRangeEnd: Signal<Date | null>;
  draftMultiple: Signal<string[]>;
  viewDate: Signal<Date>;
  headerPanel: Signal<PickerCalendarHeaderPanel>;
  yearPageStart: Signal<number>;
  onSelectDayRange: (d: Date) => void;
  onSelectDayMultiple: (d: Date) => void;
  handleConfirm: () => void;
  handleCancel: () => void;
  confirmDisabled: boolean;
  confirmClass: string;
  useViewportPanel: boolean;
}): JSX.Element {
  const {
    props,
    triggerRef,
    clearOutsidePointerDismiss,
    outsidePointerCleanup,
    pickerAnchorScrollCleanup,
    outsidePanelEl,
    closePickerOverlay,
    draft,
    draftRangeStart,
    draftRangeEnd,
    draftMultiple,
    viewDate,
    headerPanel,
    yearPageStart,
    onSelectDayRange,
    onSelectDayMultiple,
    handleConfirm,
    handleCancel,
    confirmDisabled,
    confirmClass,
    useViewportPanel,
  } = p;

  const { mode, dateFormatSpec, minDate, maxDate, disabledDate } =
    getDatePickerDerivatives(props);

  return (
    <div
      role="dialog"
      aria-label="选择日期"
      class={twMerge(
        "pointer-events-auto w-max min-w-[288px] max-w-[min(100vw-1rem,24rem)] p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg",
        useViewportPanel
          ? twMerge("fixed", pickerPortalZClass)
          : "absolute left-0 top-full z-1070 mt-1",
      )}
      ref={(el: HTMLElement | null) => {
        if (el == null) {
          clearOutsidePointerDismiss();
          return;
        }
        if (el === outsidePanelEl.current) {
          return;
        }
        clearOutsidePointerDismiss();
        outsidePanelEl.current = el;
        queueMicrotask(() => {
          if (outsidePanelEl.current !== el) {
            return;
          }
          const viewport = (props.panelAttach ?? "anchored") === "viewport";
          registerPickerFixedOverlayPositionAndOutsideClick(
            el,
            triggerRef,
            closePickerOverlay,
            outsidePointerCleanup,
            pickerAnchorScrollCleanup,
            { panelMinWidth: 288 },
            viewport ? undefined : { fixedToViewport: false },
          );
        });
      }}
    >
      <PickerCalendarNav
        viewDate={viewDate}
        panelMode={headerPanel}
        yearPageStart={yearPageStart}
        minDate={minDate}
        maxDate={maxDate}
        dateGranularity={dateFormatSpec.granularity}
        selectedDate={mode === "single"
          ? (draft.value ?? undefined)
          : undefined}
        selectedDaySignal={mode === "single" ? draft : undefined}
        daySelectionMode={mode === "range"
          ? "range"
          : mode === "multiple"
          ? "multiple"
          : "single"}
        rangeStart={mode === "range"
          ? (draftRangeStart.value ?? undefined)
          : undefined}
        rangeEnd={mode === "range"
          ? (draftRangeEnd.value ?? undefined)
          : undefined}
        rangeStartSignal={mode === "range" ? draftRangeStart : undefined}
        rangeEndSignal={mode === "range" ? draftRangeEnd : undefined}
        selectedDates={undefined}
        multipleYmdSignal={mode === "multiple" ? draftMultiple : undefined}
        onSelectDay={(d) => {
          if (mode === "single") draft.value = d;
          else if (mode === "range") onSelectDayRange(d);
          else onSelectDayMultiple(d);
        }}
        disabledDate={disabledDate}
      />
      <div class="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
        <button
          type="button"
          disabled={mode === "range" ? confirmDisabled : false}
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
