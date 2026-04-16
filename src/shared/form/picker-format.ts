/**
 * 日期/时间选择器的 `format` 解析与校验（与 Day.js 展示格式对齐）。
 *
 * **占位符（区分大小写）**
 * - `YYYY`：四位年
 * - `YY`：两位年（展示为年后两位；解析时按当前世纪展开，如 2026 年显示 `26`）
 * - `MM`：两位月（01–12）
 * - `DD`：两位日（01–31）
 * - `HH`：24 小时（00–23）
 * - `mm`：分（00–59），**必须小写**，与 `MM`（月）区分
 * - `ss`：秒（00–59）
 *
 * 分隔符可为任意非占位字面量（如 `-`、`/`、空格、`:`、`T`）。
 *
 * **合法规则**
 * - 日期段：只能是 `YYYY` 或 `YY` 起头的 `→MM` → `→DD` **前缀链**，不得跳级（禁止 `YYYY-DD`、仅有 `DD` 等）；同一 format 不可混用 `YYYY` 与 `YY`。
 * - 时间段：可为单独 `HH`、`mm` 或 `ss`；或多段前缀链 `HH` → `HH`+`mm` → `HH`+`mm`+`ss`（禁止跳级如 `HH-ss`、乱序）。
 * - 日期时间：整串中，所有日期占位在前，所有时间占位在后，中间可有字面量；禁止 `HH` 出现在 `YYYY` 之前等交错。
 * - 禁止重复同一占位（如两个 `YYYY`）。
 */

/** 支持的占位 token */
export type PickerFormatToken =
  | "YYYY"
  | "YY"
  | "MM"
  | "DD"
  | "HH"
  | "mm"
  | "ss";

/** 分片：字面量或 token */
export type PickerFormatPiece =
  | { kind: "literal"; text: string }
  | { kind: "token"; token: PickerFormatToken };

/** 日期粒度（由 format 推导） */
export type PickerDateGranularity = "year" | "year-month" | "day";

/** 时间粒度（单列可为仅时 / 仅分 / 仅秒） */
export type PickerTimeGranularity =
  | "hour"
  | "minute"
  | "second"
  | "hour-minute"
  | "hour-minute-second";

/** 仅含日期类 token 的已校验规格 */
export interface ParsedDateFormat {
  readonly pattern: string;
  readonly pieces: readonly PickerFormatPiece[];
  readonly granularity: PickerDateGranularity;
}

/** 仅含时间类 token 的已校验规格 */
export interface ParsedTimeFormat {
  readonly pattern: string;
  readonly pieces: readonly PickerFormatPiece[];
  readonly granularity: PickerTimeGranularity;
}

/** 日期 + 时间组合（DateTimePicker）；`datePieces` 含日期段末尾字面量（如 `T`、空格） */
export interface ParsedDateTimeFormat {
  readonly pattern: string;
  readonly datePieces: readonly PickerFormatPiece[];
  readonly timePieces: readonly PickerFormatPiece[];
  readonly dateGranularity: PickerDateGranularity;
  readonly timeGranularity: PickerTimeGranularity;
}

const DATE_TOKENS: ReadonlySet<PickerFormatToken> = new Set([
  "YYYY",
  "YY",
  "MM",
  "DD",
]);
const TIME_TOKENS: ReadonlySet<PickerFormatToken> = new Set([
  "HH",
  "mm",
  "ss",
]);

/**
 * 将 format 字符串拆成字面量与 token 交替序列（最长匹配占位符）。
 */
export function tokenizePickerFormat(format: string): PickerFormatPiece[] {
  const pieces: PickerFormatPiece[] = [];
  let i = 0;
  while (i < format.length) {
    const rest = format.slice(i);
    let tok: PickerFormatToken | null = null;
    if (rest.startsWith("YYYY")) tok = "YYYY";
    else if (rest.startsWith("YY")) tok = "YY";
    else if (rest.startsWith("MM")) tok = "MM";
    else if (rest.startsWith("DD")) tok = "DD";
    else if (rest.startsWith("HH")) tok = "HH";
    else if (rest.startsWith("mm")) tok = "mm";
    else if (rest.startsWith("ss")) tok = "ss";
    if (tok != null) {
      pieces.push({ kind: "token", token: tok });
      i += tok.length;
      continue;
    }
    let j = i + 1;
    while (j < format.length) {
      const r = format.slice(j);
      if (
        r.startsWith("YYYY") || r.startsWith("YY") || r.startsWith("MM") ||
        r.startsWith("DD") ||
        r.startsWith("HH") || r.startsWith("mm") || r.startsWith("ss")
      ) {
        break;
      }
      j++;
    }
    pieces.push({ kind: "literal", text: format.slice(i, j) });
    i = j;
  }
  return pieces;
}

function extractTokens(
  pieces: readonly PickerFormatPiece[],
): PickerFormatToken[] {
  return pieces.filter((p): p is { kind: "token"; token: PickerFormatToken } =>
    p.kind === "token"
  ).map((p) => p.token);
}

/**
 * 校验日期 token 序列：须为 `YYYY` 或 `YY` 起头，再接可选 `MM`、`DD` 前缀链，无重复、无跳级。
 */
export function validateDateTokens(tokens: PickerFormatToken[]): string | null {
  const d = tokens.filter((t) => DATE_TOKENS.has(t));
  if (d.length === 0) return "日期 format 须至少包含 YYYY 或 YY";
  const seen = new Set<PickerFormatToken>();
  for (const t of d) {
    if (seen.has(t)) return "日期 format 中同一占位符不可重复";
    seen.add(t);
  }
  const y0 = d[0];
  if (y0 !== "YYYY" && y0 !== "YY") {
    return `日期须以 YYYY 或 YY 开头（错误位置：${y0}）`;
  }
  if (d.length === 1) return null;
  if (d[1] !== "MM") {
    return `年占位之后须为 MM（错误位置：${d[1]}）`;
  }
  if (d.length === 2) return null;
  if (d[2] !== "DD") {
    return `MM 之后须为 DD（错误位置：${d[2]}）`;
  }
  if (d.length > 3) return "日期占位超过年、月、日三级";
  return null;
}

/**
 * 校验时间 token 序列：须为 HH → HH mm → HH mm ss 前缀链。
 */
export function validateTimeTokens(tokens: PickerFormatToken[]): string | null {
  const t = tokens.filter((x) => TIME_TOKENS.has(x));
  if (t.length === 0) return "时间 format 须至少包含 HH、mm、ss 之一";
  const seen = new Set<PickerFormatToken>();
  for (const x of t) {
    if (seen.has(x)) return "时间 format 中同一占位符不可重复";
    seen.add(x);
  }
  /** 单列：仅 `HH` / 仅 `mm` / 仅 `ss` */
  if (t.length === 1) {
    if (t[0] === "HH" || t[0] === "mm" || t[0] === "ss") return null;
    return "时间单列须为 HH、mm 或 ss";
  }
  const expected: PickerFormatToken[] = ["HH", "mm", "ss"];
  for (let k = 0; k < t.length; k++) {
    if (t[k] !== expected[k]) {
      return `时间占位须按 HH、mm、ss 顺序且不可跳级（错误位置：${t[k]}）`;
    }
  }
  return null;
}

function dateGranularityFromCount(n: number): PickerDateGranularity {
  if (n === 1) return "year";
  if (n === 2) return "year-month";
  return "day";
}

function timeGranularityFromCount(n: number): PickerTimeGranularity {
  if (n === 1) return "hour";
  if (n === 2) return "hour-minute";
  return "hour-minute-second";
}

/**
 * 由时间段 token 序列推导粒度（与 {@link validateTimeTokens} 合法串一致）。
 */
export function timeGranularityFromTimeTokens(
  t: PickerFormatToken[],
): PickerTimeGranularity {
  const tm = t.filter((x) => TIME_TOKENS.has(x));
  if (tm.length === 3) return "hour-minute-second";
  if (tm.length === 2) return "hour-minute";
  if (tm.length === 1) {
    if (tm[0] === "HH") return "hour";
    if (tm[0] === "mm") return "minute";
    if (tm[0] === "ss") return "second";
  }
  return timeGranularityFromCount(tm.length);
}

/**
 * 时间段仅一列时，表头文案「时 / 分 / 秒」（由 `pieces` 内唯一时间占位决定）。
 */
export function pickerTimeSegmentSingleColumnHeaderLabel(
  pieces: readonly PickerFormatPiece[],
): string {
  const t = extractTokens(pieces).filter((x) => TIME_TOKENS.has(x));
  if (t.length !== 1) return "时";
  if (t[0] === "HH") return "时";
  if (t[0] === "mm") return "分";
  if (t[0] === "ss") return "秒";
  return "时";
}

/**
 * 解析 DatePicker 的 format；失败返回 `{ ok:false, error }`。
 */
export function parseDatePickerFormat(
  format: string,
): { ok: true; spec: ParsedDateFormat } | { ok: false; error: string } {
  const trimmed = format.trim();
  if (!trimmed) {
    return { ok: false, error: "format 不能为空" };
  }
  const pieces = tokenizePickerFormat(trimmed);
  const tokens = extractTokens(pieces);
  for (const t of tokens) {
    if (!DATE_TOKENS.has(t)) {
      return {
        ok: false,
        error: `DatePicker format 中不允许出现时间占位 ${t}`,
      };
    }
  }
  const err = validateDateTokens(tokens);
  if (err) return { ok: false, error: err };
  const d = tokens.filter((x) => DATE_TOKENS.has(x));
  return {
    ok: true,
    spec: {
      pattern: trimmed,
      pieces,
      granularity: dateGranularityFromCount(d.length),
    },
  };
}

/**
 * 解析 TimePicker 的 format。
 */
export function parseTimePickerFormat(
  format: string,
): { ok: true; spec: ParsedTimeFormat } | { ok: false; error: string } {
  const trimmed = format.trim();
  if (!trimmed) {
    return { ok: false, error: "format 不能为空" };
  }
  const pieces = tokenizePickerFormat(trimmed);
  const tokens = extractTokens(pieces);
  for (const t of tokens) {
    if (!TIME_TOKENS.has(t)) {
      return {
        ok: false,
        error: `TimePicker format 中不允许出现日期占位 ${t}`,
      };
    }
  }
  const err = validateTimeTokens(tokens);
  if (err) return { ok: false, error: err };
  const tm = tokens.filter((x) => TIME_TOKENS.has(x));
  return {
    ok: true,
    spec: {
      pattern: trimmed,
      pieces,
      granularity: timeGranularityFromTimeTokens(tm),
    },
  };
}

/**
 * 解析 DateTimePicker 的 format（单串内含日期段 + 时间段子串）。
 */
export function parseDateTimePickerFormat(
  format: string,
):
  | { ok: true; spec: ParsedDateTimeFormat }
  | { ok: false; error: string } {
  const trimmed = format.trim();
  if (!trimmed) {
    return { ok: false, error: "format 不能为空" };
  }
  const pieces = tokenizePickerFormat(trimmed);
  const tokens = extractTokens(pieces);
  if (tokens.length === 0) {
    return { ok: false, error: "format 须同时包含日期与时间占位" };
  }
  let firstTimePieceIndex = -1;
  for (let i = 0; i < pieces.length; i++) {
    const p = pieces[i];
    if (p.kind === "token" && TIME_TOKENS.has(p.token)) {
      firstTimePieceIndex = i;
      break;
    }
  }
  if (firstTimePieceIndex < 0) {
    return {
      ok: false,
      error: "须包含时间占位（可为 HH / mm / ss 单列或前缀链）",
    };
  }

  const datePieces = pieces.slice(0, firstTimePieceIndex);
  const timePieces = pieces.slice(firstTimePieceIndex);
  const dateToks = extractTokens(datePieces);
  const timeToks = extractTokens(timePieces);

  if (dateToks.length === 0) {
    return {
      ok: false,
      error: "须包含日期占位（YYYY 或 YY，可选 MM、DD）",
    };
  }
  for (const t of dateToks) {
    if (!DATE_TOKENS.has(t)) {
      return { ok: false, error: "日期段内不得含时间占位" };
    }
  }
  for (const t of timeToks) {
    if (!TIME_TOKENS.has(t)) {
      return { ok: false, error: "时间段内不得含日期占位" };
    }
  }

  const de = validateDateTokens(dateToks);
  if (de) return { ok: false, error: de };
  const te = validateTimeTokens(timeToks);
  if (te) return { ok: false, error: te };

  return {
    ok: true,
    spec: {
      pattern: trimmed,
      datePieces,
      timePieces,
      dateGranularity: dateGranularityFromCount(
        dateToks.filter((x) => DATE_TOKENS.has(x)).length,
      ),
      timeGranularity: timeGranularityFromTimeTokens(
        timeToks.filter((x) => TIME_TOKENS.has(x)),
      ),
    },
  };
}

const pad2 = (n: number) => (n < 10 ? "0" + n : String(n));

/**
 * 两位年份展开为四位：以参考年所在世纪为基准，偏离超过 50 年则调整世纪。
 *
 * @param twoDigit 0–99
 * @param referenceYear 默认当前日历年
 */
function expandTwoDigitYear(
  twoDigit: number,
  referenceYear?: number,
): number {
  const ref = referenceYear ?? new Date().getFullYear();
  const century = Math.floor(ref / 100) * 100;
  let y = century + twoDigit;
  if (y > ref + 50) y -= 100;
  if (y < ref - 50) y += 100;
  return y;
}

/**
 * 按「仅日期」format 将本地日历日格式化为字符串。
 */
export function formatDateWithSpec(d: Date, spec: ParsedDateFormat): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  let out = "";
  for (const p of spec.pieces) {
    if (p.kind === "literal") {
      out += p.text;
      continue;
    }
    if (p.token === "YYYY") out += String(y);
    else if (p.token === "YY") out += pad2(y % 100);
    else if (p.token === "MM") out += pad2(m);
    else if (p.token === "DD") out += pad2(day);
  }
  return out;
}

/**
 * 按「仅时间」format 格式化。
 */
export function formatTimeWithSpec(
  hour: number,
  minute: number,
  second: number,
  spec: ParsedTimeFormat,
): string {
  let out = "";
  for (const p of spec.pieces) {
    if (p.kind === "literal") {
      out += p.text;
      continue;
    }
    if (p.token === "HH") out += pad2(hour);
    else if (p.token === "mm") out += pad2(minute);
    else if (p.token === "ss") out += pad2(second);
  }
  return out;
}

/**
 * 按 DateTime 组合 format 输出。
 */
export function formatDateTimeWithSpec(
  d: Date,
  hour: number,
  minute: number,
  second: number,
  spec: ParsedDateTimeFormat,
): string {
  return (
    formatDateWithSpec(
      d,
      {
        pattern: spec.pattern,
        pieces: spec.datePieces,
        granularity: spec.dateGranularity,
      },
    ) +
    formatTimeWithSpec(hour, minute, second, {
      pattern: spec.pattern,
      pieces: spec.timePieces,
      granularity: spec.timeGranularity,
    })
  );
}

/**
 * 解析「仅日期」字符串为 Date（日缺失时用 1 号；仅年则用 1 月 1 日）。
 */
export function parseDateStringWithSpec(
  s: string | undefined,
  spec: ParsedDateFormat,
): Date | null {
  if (!s?.trim()) return null;
  const reParts = spec.pieces.map((p) => {
    if (p.kind === "literal") {
      return p.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    if (p.token === "YYYY") return "(\\d{4})";
    if (p.token === "YY") return "(\\d{2})";
    if (p.token === "MM") return "(\\d{2})";
    return "(\\d{2})"; // DD
  });
  const re = new RegExp("^" + reParts.join("") + "$");
  const m = re.exec(s.trim());
  if (!m) return null;
  let gi = 1;
  let y = 1970,
    mo = 1,
    d = 1;
  for (const p of spec.pieces) {
    if (p.kind !== "token") continue;
    const v = parseInt(m[gi++], 10);
    if (p.token === "YYYY") y = v;
    else if (p.token === "YY") y = expandTwoDigitYear(v);
    else if (p.token === "MM") mo = v;
    else if (p.token === "DD") d = v;
  }
  if (mo < 1 || mo > 12) return null;
  if (d < 1 || d > 31) return null;
  const date = new Date(y, mo - 1, d);
  if (
    isNaN(date.getTime()) || date.getFullYear() !== y ||
    date.getMonth() !== mo - 1 || date.getDate() !== d
  ) return null;
  return date;
}

/**
 * 解析时间串为 [hour, minute, second]；缺省秒为 0。
 */
export function parseTimeStringWithSpec(
  s: string | undefined,
  spec: ParsedTimeFormat,
): [number, number, number] | null {
  if (!s?.trim()) return null;
  const reParts = spec.pieces.map((p) => {
    if (p.kind === "literal") {
      return p.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    if (p.token === "HH") return "(\\d{1,2})";
    if (p.token === "mm" || p.token === "ss") return "(\\d{2})";
    return "";
  });
  const re = new RegExp("^" + reParts.join("") + "$");
  const m = re.exec(s.trim());
  if (!m) return null;
  let gi = 1;
  let hh = 0,
    mm = 0,
    ss = 0;
  for (const p of spec.pieces) {
    if (p.kind !== "token") continue;
    const v = parseInt(m[gi++], 10);
    if (p.token === "HH") hh = v;
    else if (p.token === "mm") mm = v;
    else if (p.token === "ss") ss = v;
  }
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59 || ss < 0 || ss > 59) {
    return null;
  }
  return [hh, mm, ss];
}

/**
 * 取当前**本地**时刻的时、分、秒（0–23 / 0–59 / 0–59）。
 * 供 TimePicker、DateTimePicker 在用户未提供可解析初始值时，将草稿列高亮对齐到「此刻」，而非 00:00:00。
 *
 * @returns 三元组 `[hour, minute, second]`
 */
export function getLocalTimeHourMinuteSecond(): readonly [
  number,
  number,
  number,
] {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()];
}

/**
 * 解析完整日期时间串（单字符串，与 spec.pattern 一致）。
 */
export function parseDateTimeStringWithSpec(
  s: string | undefined,
  spec: ParsedDateTimeFormat,
): { day: Date; hour: number; minute: number; second: number } | null {
  if (!s?.trim()) return null;
  /** 将分片序列转为正则片段（字面量转义，token 为捕获组） */
  const buildRe = (pcs: readonly PickerFormatPiece[]) =>
    pcs.map((p) => {
      if (p.kind === "literal") {
        return p.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
      if (p.token === "YYYY") return "(\\d{4})";
      if (
        p.token === "YY" || p.token === "MM" || p.token === "DD" ||
        p.token === "mm" ||
        p.token === "ss"
      ) {
        return "(\\d{2})";
      }
      return "(\\d{1,2})"; // HH
    }).join("");

  const fullRe = new RegExp(
    "^" + buildRe(spec.datePieces) + buildRe(spec.timePieces) + "$",
  );
  const m = fullRe.exec(s.trim());
  if (!m) return null;
  let gi = 1;
  let y = 2000,
    mo = 1,
    d = 1,
    hh = 0,
    mm = 0,
    ss = 0;
  for (const p of spec.datePieces) {
    if (p.kind !== "token") continue;
    const v = parseInt(m[gi++], 10);
    if (p.token === "YYYY") y = v;
    else if (p.token === "YY") y = expandTwoDigitYear(v);
    else if (p.token === "MM") mo = v;
    else if (p.token === "DD") d = v;
  }
  for (const p of spec.timePieces) {
    if (p.kind !== "token") continue;
    const v = parseInt(m[gi++], 10);
    if (p.token === "HH") hh = v;
    else if (p.token === "mm") mm = v;
    else if (p.token === "ss") ss = v;
  }
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59 || ss < 0 || ss > 59) {
    return null;
  }
  const day = new Date(y, mo - 1, d);
  if (
    isNaN(day.getTime()) || day.getFullYear() !== y ||
    day.getMonth() !== mo - 1 || day.getDate() !== d
  ) {
    return null;
  }
  return { day, hour: hh, minute: mm, second: ss };
}

/** DatePicker 默认 format */
export const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";
/** TimePicker 默认（与历史行为一致：到分） */
export const DEFAULT_TIME_FORMAT = "HH:mm";
/** DateTimePicker 默认 */
export const DEFAULT_DATETIME_FORMAT = "YYYY-MM-DD HH:mm";

/**
 * 将 min/max 完整日期（YYYY-MM-DD）转为与粒度一致的比较用 Date（月/年用区间首日）。
 */
export function normalizeMinMaxDateForGranularity(
  ymd: string | undefined,
  granularity: PickerDateGranularity,
): Date | null {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (
    isNaN(date.getTime()) || date.getFullYear() !== y ||
    date.getMonth() !== m - 1 || date.getDate() !== d
  ) return null;
  if (granularity === "year") return new Date(date.getFullYear(), 0, 1);
  if (granularity === "year-month") {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
  return date;
}
