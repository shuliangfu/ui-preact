/**
 * Calendar 日历组件用到的纯函数，便于单测与复用。
 */

/**
 * 获取某年某月的日历格数组（含上月补足首行、本月、下月补足末行）。
 * 用于月视图 7 列网格，索引 0 为当月第一天所在周的周日（或周一依 locale）。
 * @param year 年份（如 2025）
 * @param month 月份 0-11
 * @returns 日期数组，长度约 28~42
 */
export function getDaysInMonth(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: Date[] = [];
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  const startPad = first.getDay();
  for (let i = 0; i < startPad; i++) {
    days.unshift(new Date(year, month, -startPad + i + 1));
  }
  /** 月末补足到整行，避免日历网格最后一行缺格导致底边线与左侧 border 错位 */
  const remainder = days.length % 7;
  const endPad = remainder === 0 ? 0 : 7 - remainder;
  for (let i = 1; i <= endPad; i++) {
    days.push(new Date(year, month + 1, i));
  }
  return days;
}

/** 周几文案（周日为 0） */
export const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

/**
 * 将日期归一化到当日 0 点（本地时区），用于 min/max 按「日」闭区间比较。
 * @param d 任意时刻的 Date
 * @returns 同年同月同日 0 时 0 分
 */
export function calendarDayStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * 仅比较两个日期的「公历自然日」（忽略时分秒）。
 * @returns 早于为负，同日为 0，晚于为正
 */
export function compareCalendarDays(a: Date, b: Date): number {
  const ta = calendarDayStart(a).getTime();
  const tb = calendarDayStart(b).getTime();
  if (ta === tb) return 0;
  return ta < tb ? -1 : 1;
}

/**
 * 判断某自然月是否完全落在 min/max 之外（该月任意一日都不可选时返回 true）。
 * 与 DatePicker 的 disabledDate 闭区间语义一致。
 * @param year 年
 * @param monthIndex 月 0–11
 */
export function isMonthFullyOutsideMinMax(
  year: number,
  monthIndex: number,
  minDate: Date | null,
  maxDate: Date | null,
): boolean {
  const first = calendarDayStart(new Date(year, monthIndex, 1));
  const last = calendarDayStart(new Date(year, monthIndex + 1, 0));
  if (minDate != null) {
    const minS = calendarDayStart(minDate);
    if (last < minS) return true;
  }
  if (maxDate != null) {
    const maxS = calendarDayStart(maxDate);
    if (first > maxS) return true;
  }
  return false;
}

/**
 * 判断某自然年是否完全落在 min/max 之外。
 * @param year 公历年
 */
export function isYearFullyOutsideMinMax(
  year: number,
  minDate: Date | null,
  maxDate: Date | null,
): boolean {
  const first = calendarDayStart(new Date(year, 0, 1));
  const last = calendarDayStart(new Date(year, 11, 31));
  if (minDate != null) {
    const minS = calendarDayStart(minDate);
    if (last < minS) return true;
  }
  if (maxDate != null) {
    const maxS = calendarDayStart(maxDate);
    if (first > maxS) return true;
  }
  return false;
}

/**
 * 年宫格每页 12 个按钮，起始年为 `floor(calendarYear / 12) * 12`（与「月视图 → 点年份进入年宫格」一致）。
 * 打开面板即处于年视图时须用此值同步 `yearPageStart`，否则会沿用初始 `0` 而错误显示 0–11 年。
 *
 * @param calendarYear 公历年（如 `viewDate.getFullYear()`）
 * @returns 当前页第一个格子的年份
 */
export function yearGridPageStart(calendarYear: number): number {
  return Math.floor(calendarYear / 12) * 12;
}

/** 月份文案 */
export const MONTHS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

/**
 * 在给定「锚点」所在自然月内，从 1 号起找第一个未被 `isDisabled` 的日期。
 * 用于无受控值打开面板时：`Calendar` 在 `selectedDate` 为空时用当月 1 号作高亮参考，
 * 确定按钮应对齐为同一可选日，避免「看起来已选、点确定却不写入」。
 *
 * @param monthAnchor 任意落在目标月的 Date（常用该月 1 号或 `viewDate`）
 * @param isDisabled 与 DatePicker `disabledDate` 同语义，true 表示不可选
 * @returns 该月首个可选日；若整月不可选则 `null`
 */
export function firstSelectableDayInMonth(
  monthAnchor: Date,
  isDisabled: (d: Date) => boolean,
): Date | null {
  const y = monthAnchor.getFullYear();
  const m = monthAnchor.getMonth();
  const lastDay = new Date(y, m + 1, 0).getDate();
  for (let day = 1; day <= lastDay; day++) {
    const d = new Date(y, m, day);
    if (!isDisabled(d)) return d;
  }
  return null;
}

/**
 * 无受控日期打开面板时的默认选中日：若「今天」落在 `monthAnchor` 所在月且可选则用今天，否则用
 * {@link firstSelectableDayInMonth}。
 */
export function defaultPickerDayWhenNoValue(
  monthAnchor: Date,
  isDisabled: (d: Date) => boolean,
): Date | null {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const day = now.getDate();
  if (
    y === monthAnchor.getFullYear() &&
    m === monthAnchor.getMonth() &&
    !isDisabled(new Date(y, m, day))
  ) {
    return new Date(y, m, day);
  }
  return firstSelectableDayInMonth(monthAnchor, isDisabled);
}
