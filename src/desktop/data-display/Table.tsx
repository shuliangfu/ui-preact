/**
 * Table 表格（Preact）。
 * 桌面为主，移动可卡片化；支持列定义、排序、固定列、展开行、分页、loading、尺寸、边框、行选择、
 * 列级可编辑（text、{@link InputNumber} 数字、email/url/tel、date/time、select/checkbox/radio，受控 onCellChange；默认只读展示，双击进入编辑，失焦退出）。
 * 失焦退出编辑态前会从槽内 DOM 再提交一次当前值，确保回到只读表格时数据与输入一致。
 * 调试可编辑焦点：控制台 `globalThis.__TABLE_EDIT_DEBUG__ = true` 后见 `console.debug` 前缀 `[@dreamer/ui-preact Table]`。
 * date/time 使用 {@link DatePicker}、{@link TimePicker}（自研浮层 + 确定），非浏览器原生控件。
 *
 * **数据源：** 每次渲染须从 `props.dataSource` 读取最新数组（勿在组件外缓存解构结果），以便父级更新后表格同步；
 * 行选择回调内同样应读 `props.dataSource`。
 */

import type { ComponentChildren, JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { type Signal, signal, useSignalEffect } from "@preact/signals";
import { twMerge } from "tailwind-merge";
import { DatePicker } from "../form/DatePicker.tsx";
import { InputNumber } from "../form/InputNumber.tsx";
import { TimePicker } from "../form/TimePicker.tsx";
/** 按需：单文件图标，避免经 icons/mod 拉入全表 */
import { IconChevronDown } from "../../shared/basic/icons/ChevronDown.tsx";
import { IconChevronUp } from "../../shared/basic/icons/ChevronUp.tsx";
import type { SizeVariant } from "../../shared/types.ts";

export type SortOrder = "ascend" | "descend" | null;

/** 可编辑列：下拉 / 单选项 */
export type TableEditableOption = {
  label: string;
  value: string | number;
};

/** 可编辑列是否禁用（整列或按行） */
export type TableEditableDisabled<T> =
  | boolean
  | ((record: T, rowIndex: number) => boolean);

type TableEditableCore<T> = {
  /** 禁用当前格或按行判断 */
  disabled?: TableEditableDisabled<T>;
};

/**
 * 列级可编辑配置（不含 textarea；由父组件受控更新 `dataSource`）。
 * 设置后该列**优先渲染控件**，忽略 `render`。
 */
export type TableColumnEditable<T = unknown> =
  | (TableEditableCore<T> & {
    type: "text";
    placeholder?: string;
    maxLength?: number;
  })
  | (TableEditableCore<T> & {
    type: "number";
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number | "any";
  })
  | (TableEditableCore<T> & { type: "email"; placeholder?: string })
  | (TableEditableCore<T> & { type: "url"; placeholder?: string })
  | (TableEditableCore<T> & { type: "tel"; placeholder?: string })
  | (TableEditableCore<T> & { type: "date" })
  | (TableEditableCore<T> & { type: "time" })
  | (TableEditableCore<T> & {
    type: "select";
    options: TableEditableOption[];
    placeholder?: string;
  })
  | (TableEditableCore<T> & { type: "checkbox" })
  | (TableEditableCore<T> & {
    type: "radio";
    options: TableEditableOption[];
  });

/** 单元格编辑回调载荷（无内部草稿，由父组件写回数据源） */
export type TableCellChangePayload<T> = {
  columnKey: string;
  dataIndex: keyof T | string;
  value: unknown;
  record: T;
  rowIndex: number;
};

export interface TableColumn<T = unknown> {
  /** 列 key / dataIndex */
  key: string;
  /** 列标题 */
  title?: string | ComponentChildren;
  /** 对应数据字段名（不传则用 key） */
  dataIndex?: keyof T | string;
  /** 自定义渲染 */
  render?: (value: unknown, record: T, index: number) => ComponentChildren;
  /**
   * 单元格可编辑：`false` 或省略为只读；传入配置则默认只读展示、双击进入编辑（忽略 `render`）。
   */
  editable?: false | TableColumnEditable<T>;
  /** 列宽 */
  width?: number | string;
  /** 对齐 */
  align?: "left" | "center" | "right";
  /** 是否固定左侧 */
  fixed?: "left";
  /** 是否可排序 */
  sorter?: boolean | ((a: T, b: T) => number);
  /** 默认排序 */
  defaultSortOrder?: SortOrder;
  /** 是否可收缩 */
  ellipsis?: boolean;
}

export interface TableProps<T = unknown> {
  /** 列定义 */
  columns: TableColumn<T>[];
  /** 数据源 */
  dataSource: T[];
  /** 行 key 的字段名或函数 */
  rowKey?: keyof T | string | ((record: T, index: number) => string);
  /** 是否显示边框 */
  bordered?: boolean;
  /** 尺寸 */
  size?: SizeVariant;
  /** 是否条纹行 */
  striped?: boolean;
  /** 是否加载态 */
  loading?: boolean;
  /** 行点击 */
  onRow?: (record: T, index: number) => { onClick?: (e: Event) => void };
  /** 可展开行：自定义展开内容 */
  expandable?: {
    expandedRowRender?: (record: T, index: number) => ComponentChildren;
    expandedRowKeys?: string[];
    onExpand?: (expanded: boolean, record: T) => void;
    rowExpandable?: (record: T) => boolean;
  };
  /** 表尾合计行（函数返回节点，会渲染在 tfoot） */
  summary?: (data: T[]) => ComponentChildren;
  /** 文案配置，如 emptyText */
  locale?: { emptyText?: string };
  /** 自定义空状态渲染（dataSource 为空时），不传则用 locale.emptyText 或「暂无数据」 */
  renderEmpty?: () => ComponentChildren;
  /** 表格上方标题 */
  title?: ComponentChildren;
  /** 表格上方右侧区域（筛选、导出等） */
  extra?: ComponentChildren;
  /** 分页配置；false 不显示；不传则不分页 */
  pagination?: false | {
    current?: number;
    pageSize?: number;
    total?: number;
    onChange?: (page: number, pageSize: number) => void;
  };
  /** 选中变化时回调当前选中的整行数据；传了则显示选择列 */
  onSelectChange?: (selectedRows: T[]) => void;
  /** 受控时的选中行 key 列表 */
  selectedRowKeys?: string[];
  /** 选择列类型：checkbox 多选 / radio 单选，默认 checkbox */
  selectionType?: "checkbox" | "radio";
  /** 某行是否禁用勾选 */
  getCheckboxProps?: (record: T) => { disabled?: boolean };
  /** 行 class（根据 record、index 返回） */
  rowClassName?: (record: T, index: number) => string;
  /** 是否开启行悬停高亮（默认 false） */
  hoverable?: boolean;
  /** 表头 class */
  headerClass?: string;
  /** 表格 class */
  class?: string;
  /**
   * 可选状态缓存 key。传值时非受控的 rowSelection/expandable 状态会按 key 跨父组件重渲染保留，
   * 避免整树渲染导致 `signal()` 重新创建、选中/展开态被清空。
   * 当前正在编辑的单元格（双击 editable）及「编辑重聚焦」用 ref（`pendingEditRefocusCount`、`tableEditRootRef` 等）
   * 也按同一 key 缓存；**可编辑列 + `onCellChange` 且父级会频繁重挂载 `Table` 时请务必传入**，
   * 否则每次调用会新建 ref，受控输入一字后重挂易导致失焦退回只读。
   */
  stateKey?: string;
  /**
   * 可编辑列变更回调（受控）。双击单元格进入编辑、失焦退出；父组件应据此更新 `dataSource`。未传时不可进入编辑。
   */
  onCellChange?: (payload: TableCellChangePayload<T>) => void;
}

/** 当前编辑中的单元格（与 editingCell signal 存值一致） */
type TableEditingTarget = { rowKey: string; columnKey: string };

/**
 * 受控可编辑 + 父级重跑 `Table()` 时，除 `editing` signal 外，下列 ref 也必须跨次调用复用**同一对象**：
 * 否则 `emit` 里 `++` 的是「旧次调用」的 `pending`，`ref` 指向已卸载的 wrapper，
 * `scheduleTableEditRefocus` 永远找不到 input，而 `focusout` 闭包里的 `pending` 仍是 0，立刻清空 `editingCell`。
 */
type TableStateCacheEntry = {
  selected: Signal<Set<string>>;
  expanded: Signal<string[]>;
  editing: Signal<TableEditingTarget | null>;
  tableEditRootRef: { current: HTMLElement | null };
  pendingEditRefocusCount: { current: number };
  pendingEditTextSelectionRef: {
    current: { start: number; end: number } | null;
  };
};

/** 按 stateKey 缓存选中/展开/编辑态及编辑聚焦用 ref，避免父组件重挂 Table 时丢失或错绑闭包 */
const stateCache = new Map<string, TableStateCacheEntry>();

/**
 * 在控制台执行 `globalThis.__TABLE_EDIT_DEBUG__ = true` 后输出可编辑单元格焦点/失焦判定日志（默认关闭）。
 *
 * @param args - 与 `console.debug` 相同
 */
function tableEditDebugLog(...args: unknown[]): void {
  const g = globalThis as unknown as { __TABLE_EDIT_DEBUG__?: boolean };
  if (typeof globalThis !== "undefined" && g.__TABLE_EDIT_DEBUG__) {
    console.debug("[@dreamer/ui-preact Table]", ...args);
  }
}

/**
 * `tryBlurExit` 在 `pendingEditRefocusCount > 0` 时每步约 2 帧；上限约为「最多等待多久放弃」（防 onDone 未调用时死循环）。
 * 160 步 × 2 rAF ≈ 320 帧量级，仅作安全阀，正常重聚焦几帧内应完成。
 */
const TABLE_EDIT_PENDING_REFOCUS_MAX_WAIT_STEPS = 160;

/**
 * `tableEditRootRef` / 槽位尚未挂上时的短轮询上限（每步 2 rAF），避免 ref 晚一帧时误判失焦。
 */
const TABLE_EDIT_DOM_SNAP_MAX_WAIT_STEPS = 32;

/**
 * `focusout` 的 `relatedTarget === null` 时：受控 `onCellChange` 后子 `input` 可能被替换，
 * 短暂 `activeElement === body`；须多轮 2×rAF 再判，否则会误清 `editingCell`、表现为无法键入。
 */
const TABLE_EDIT_NULL_RELATED_MAX_STEPS = 28;

/**
 * 可编辑格内嵌 DatePicker / TimePicker / DateTimePicker 且 `panelAttach="viewport"` 时，
 * 浮层为视口 `fixed` 仍为 host 子树；但从触发器点到面板内按钮的瞬间，`document.activeElement` 可能短暂为 `body` 等，
 * tryBlurExit 会误判「已失焦」并清空 `editingCell`。每步 2×rAF 重试，上限作安全阀。
 *
 * **注意**：达到上限后若浮层仍挂载（见 tryBlurExit 内对 `pickerRoot` 的兜底），**不得**再清空编辑态——
 * 月/年宫格等可全程无焦点落在 `role="dialog"` 内，焦点会长期停在 `body`，否则约一秒后会误关面板。
 */
const TABLE_EDIT_PICKER_FOCUS_SETTLE_MAX_STEPS = 32;

const sizeClasses: Record<SizeVariant, string> = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-4 py-3 text-sm",
};

/** 可编辑控件固定行高，避免撑开单元格导致表格闪动 */
const editableHeightCls: Record<SizeVariant, string> = {
  xs: "h-7 max-h-7 min-h-[1.75rem]",
  sm: "h-8 max-h-8 min-h-8",
  md: "h-9 max-h-9 min-h-9",
  lg: "h-10 max-h-10 min-h-10",
};

const editableInputCls =
  "box-border w-full min-w-0 max-w-full rounded border border-slate-200 bg-white px-2 text-left text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

function isEditableConfig<T>(
  e: false | TableColumnEditable<T> | undefined,
): e is TableColumnEditable<T> {
  return e != null && e !== false;
}

/** 解析列 editable.disabled */
function resolveEditableDisabled<T extends Record<string, unknown>>(
  ed: TableColumnEditable<T>,
  record: T,
  rowIndex: number,
): boolean {
  const d = ed.disabled;
  if (d == null) return false;
  return typeof d === "function" ? d(record, rowIndex) : d;
}

/** 编辑根节点定位用 token（避免 rowKey 特殊字符破坏 querySelector） */
function tableEditSlotToken(rowKey: string, columnKey: string): string {
  return encodeURIComponent(`${rowKey}\0${columnKey}`);
}

/**
 * 查找当前编辑槽内已挂载且可见的日期/时间类 Picker 主浮层根节点（与组件 `role="dialog"` + `aria-label` 一致）。
 * 供可编辑格 `onFocusOut` 的 tryBlurExit 使用：焦点过渡帧内勿结束编辑。
 *
 * @param host - `data-view-table-edit-slot` 对应元素
 * @returns 浮层根；无则 `null`
 */
function tableEditFindOpenPickerDialogRoot(
  host: HTMLElement,
): HTMLElement | null {
  const selectors = [
    '[role="dialog"][aria-label="选择日期"]',
    '[role="dialog"][aria-label="选择时间"]',
    '[role="dialog"][aria-label="选择日期与时间"]',
  ] as const;
  for (let s = 0; s < selectors.length; s++) {
    const el = host.querySelector(selectors[s]) as HTMLElement | null;
    if (el == null || !el.isConnected) continue;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

/**
 * 在 `onInput` 时记录文本类控件的选区，供重挂后 {@link scheduleTableEditRefocus} 恢复光标，
 * 避免 `focus()` 或受控赋值后跑到行首。
 *
 * @param el - 当前 input；`type=number` 等实现常把 `selectionStart`/`End` 置为 null 或误报 0，统一按末尾记录以与 text 一致
 */
function captureTextInputSelection(el: HTMLInputElement): {
  start: number;
  end: number;
} {
  /** number：无法依赖选区 API，按「末尾」与 text 列受控重挂后的体验一致 */
  if (el.type === "number") {
    const len = el.value.length;
    return { start: len, end: len };
  }
  const a = el.selectionStart;
  const b = el.selectionEnd;
  if (a != null && b != null) {
    return { start: a, end: b };
  }
  const len = el.value.length;
  return { start: len, end: len };
}

/**
 * 对 `input`/`textarea` 设置选区；`type=number` 在 Chromium 等环境下直接 `setSelectionRange` 常抛错或无效，
 * 需短暂改为 `text` 再还原，否则重聚焦后光标会一直停在开头。
 *
 * @param ctrl - input 或 textarea
 * @param start - 选区起点（含）
 * @param end - 选区终点（不含）
 */
function setInputSelectionRangeSafe(
  ctrl: HTMLInputElement | HTMLTextAreaElement,
  start: number,
  end: number,
): void {
  const n = ctrl.value.length;
  const s = Math.min(Math.max(0, start), n);
  const e = Math.min(Math.max(0, end), n);
  if (ctrl instanceof HTMLTextAreaElement) {
    try {
      ctrl.setSelectionRange(s, e);
    } catch {
      /** 忽略 */
    }
    return;
  }
  if (ctrl.type === "number") {
    const prev = ctrl.type;
    ctrl.type = "text";
    try {
      ctrl.setSelectionRange(s, e);
    } catch {
      /** 忽略 */
    } finally {
      ctrl.type = prev;
    }
    return;
  }
  try {
    ctrl.setSelectionRange(s, e);
  } catch {
    /** date 等类型部分环境不支持 */
  }
}

/**
 * 按快照恢复 input/textarea 选区（会按当前 `value.length` 裁剪）。
 *
 * @param ctrl - 槽内控件
 * @param ps - 选区起点/终点
 */
function applyEditTextSelectionSnapshot(
  ctrl: HTMLElement,
  ps: { start: number; end: number },
): void {
  if (
    !(ctrl instanceof HTMLInputElement) &&
    !(ctrl instanceof HTMLTextAreaElement)
  ) {
    return;
  }
  setInputSelectionRangeSafe(ctrl, ps.start, ps.end);
}

/**
 * 双击进入编辑等场景：将光标放到文本末尾（与 `focus()` 默认常落在行首区分）。
 * 使用微任务再执行一次，以晚于受控 `value` 写入 DOM。
 *
 * @param ctrl - 槽内 input / textarea
 */
function applyCaretAtEndForEditControl(ctrl: HTMLElement): void {
  if (
    !(ctrl instanceof HTMLInputElement) &&
    !(ctrl instanceof HTMLTextAreaElement)
  ) {
    return;
  }
  const apply = (): void => {
    const n = ctrl.value.length;
    setInputSelectionRangeSafe(ctrl, n, n);
  };
  apply();
  queueMicrotask(() => {
    if (globalThis.document.activeElement !== ctrl) return;
    apply();
  });
}

/** {@link scheduleTableEditRefocus} 可选行为 */
type ScheduleTableEditRefocusOptions = {
  /** 为 true 时忽略待恢复选区（并清空 ref），聚焦后光标置于文本末尾 */
  initialCaretToEnd?: boolean;
};

/**
 * 受控 `onCellChange` 触发后，外层 **函数子响应式插入** 可能整段重挂表体，原 `input` 被摘掉，
 * 焦点落到 `document.body`，在可滚动 `main` 内常表现为视口跳到顶部。
 * 在微任务 + 连续两帧 `requestAnimationFrame` 之后：若焦点已不在当前 `data-view-table-edit-slot` 内，
 * 则对槽内控件执行 `focus({ preventScroll: true })`（与初次进入编辑的 effect 时机对齐）。
 *
 * @param rootRef - 表格外层 `.table-wrapper` 上的 ref
 * @param getEditing - 返回当前编辑格；已为 `null` 时不处理（已退出编辑）
 * @param onDone - 可选；仅在「已尝试聚焦完成」或「确认不再编辑 / 放弃重试」时调用，用于与 `onFocusOut` 的 `tryBlurExit` 对齐计数；
 *   不得在 `root`/`ctrl` 尚未挂上时误调用（否则 `pendingEditRefocusCount` 提前归零会导致误清空 `editingCell`）
 * @param pendingTextSelectionRef - 可选；`onInput` 里写入的选区，聚焦后恢复，避免光标跑到行首
 * @param options - 可选；`initialCaretToEnd` 用于双击进入编辑时光标在末尾而非行首
 */
function scheduleTableEditRefocus(
  rootRef: { current: HTMLElement | null },
  getEditing: () => TableEditingTarget | null,
  onDone?: () => void,
  pendingTextSelectionRef?: { current: { start: number; end: number } | null },
  options?: ScheduleTableEditRefocusOptions,
): void {
  /** 受控整表重挂后 wrapper / input 可能晚几帧才挂上，此前不得 `onDone`，否则 pending 误判为 0 */
  const maxDomRetries = 32;
  queueMicrotask(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const runAttempt = (retry: number): void => {
          try {
            const t = getEditing();
            if (t == null) {
              onDone?.();
              return;
            }
            const root = rootRef.current;
            const slot = tableEditSlotToken(t.rowKey, t.columnKey);
            const host = root?.querySelector(
              `[data-view-table-edit-slot="${slot}"]`,
            ) as HTMLElement | null;
            const ctrl = host?.querySelector<HTMLElement>(
              "input,select,textarea,button",
            );
            if (!root || !host || !ctrl) {
              if (retry < maxDomRetries) {
                requestAnimationFrame(() => runAttempt(retry + 1));
                return;
              }
              onDone?.();
              return;
            }
            /** 仅当焦点已在具体控件上时跳过 focus；若有待恢复选区仍要处理（受控同步可能重置 caret） */
            const ae = globalThis.document.activeElement;
            const alreadyOnCtrl = ae === ctrl ||
              (ae != null && ctrl.contains(ae));
            if (!alreadyOnCtrl) {
              ctrl.focus({ preventScroll: true });
            }
            const initialEnd = options?.initialCaretToEnd === true;
            /** 双击进入编辑：丢弃残留选区快照，改用语义「末尾」 */
            let ps: { start: number; end: number } | null = null;
            if (initialEnd) {
              if (pendingTextSelectionRef) {
                pendingTextSelectionRef.current = null;
              }
            } else {
              ps = pendingTextSelectionRef?.current ?? null;
              if (pendingTextSelectionRef) {
                pendingTextSelectionRef.current = null;
              }
            }
            if (ps != null) {
              applyEditTextSelectionSnapshot(ctrl, ps);
              /**
               * 受控 `value` 的 DOM 同步可能在同一宏任务后续微任务中再次执行，
               * 再跑一次选区恢复，避免光标仍被顶到开头。
               */
              queueMicrotask(() => {
                if (globalThis.document.activeElement !== ctrl) return;
                applyEditTextSelectionSnapshot(ctrl, ps);
              });
            } else if (initialEnd) {
              applyCaretAtEndForEditControl(ctrl);
            }
            onDone?.();
          } catch (err) {
            onDone?.();
            throw err;
          }
        };
        runAttempt(0);
      });
    });
  });
}

/**
 * 渲染可编辑单元格**编辑态**控件（由双击触发后挂载）；控件限制 max-h 与 w-full，尽量不撑破单元格布局。
 *
 * @param col - 列定义
 * @param record - 行数据
 * @param rowIndex - 数据源中的行下标
 * @param rowDomKey - 行唯一 key（用于 radio name）
 * @param size - 表格尺寸
 * @param cellAlign - 列对齐，checkbox 等用 flex 对齐
 * @param onCellChange - 受控回调；缺省时控件 disabled
 * @param afterCellChange - 可选；在成功调用 `onCellChange` 之后执行（用于受控重挂后把焦点拉回编辑控件）
 * @param pendingTextSelectionRef - 可选；文本类 input 在 `onInput` 内写入选区，供重挂后恢复光标
 * @param pendingEditRefocusCountRef - 与 Table 内 `pendingEditRefocusCount` 同一引用；在 `onCellChange` **之前**递增，
 *   使同步触发的 `focusout`（子 input 被摘掉）进入 `tryBlurExit` 时仍能识别「受控重挂中」，避免误清空 `editingCell`
 */
function renderEditableCell<T extends Record<string, unknown>>(
  col: TableColumn<T>,
  record: T,
  rowIndex: number,
  rowDomKey: string,
  size: SizeVariant,
  cellAlign: "left" | "center" | "right" | undefined,
  onCellChange: ((p: TableCellChangePayload<T>) => void) | undefined,
  afterCellChange?: () => void,
  pendingTextSelectionRef?: { current: { start: number; end: number } | null },
  pendingEditRefocusCountRef?: { current: number },
): JSX.Element | null {
  const ed = col.editable;
  if (!isEditableConfig(ed)) return null;
  const dataIndex = (col.dataIndex ?? col.key) as keyof T;
  const raw = record[dataIndex];
  const disabledByProp = resolveEditableDisabled(ed, record, rowIndex);
  const disabled = !onCellChange || disabledByProp;
  const h = editableHeightCls[size];
  /**
   * `refocusAfter: true`：在 `onCellChange` 前后配合 `pendingEditRefocusCount` 并调用 `afterCellChange`
   * （`scheduleTableEditRefocus`），仅用于极少数「整格 DOM 被换掉」后须把焦点拉回控件的路径。
   *
   * **默认 `false`：** 可编辑列的 `onInput` / 步进 / select / checkbox / radio 等高频更新若默认重排队
   * refocus，会与输入抢焦点，表现为无法键入、number 箭头无效。
   */
  type EditableEmitOpts = { refocusAfter?: boolean };
  /**
   * 发出受控变更；默认不重聚焦，见 {@link EditableEmitOpts}。
   */
  const emit = (value: unknown, opts?: EditableEmitOpts) => {
    if (!onCellChange || disabledByProp) return;
    const refocusAfter = opts?.refocusAfter === true;
    if (refocusAfter && pendingEditRefocusCountRef) {
      pendingEditRefocusCountRef.current++;
    }
    try {
      onCellChange({
        columnKey: col.key,
        dataIndex: (col.dataIndex ?? col.key) as keyof T | string,
        value,
        record,
        rowIndex,
      });
    } catch (err) {
      if (refocusAfter && pendingEditRefocusCountRef) {
        pendingEditRefocusCountRef.current = Math.max(
          0,
          pendingEditRefocusCountRef.current - 1,
        );
      }
      throw err;
    }
    if (refocusAfter) afterCellChange?.();
  };
  /**
   * 失焦时再提交当前输入值（不重聚焦）：部分运行时或中文输入法结束时，末次变更未必触发 `input`，
   * 受控 `value` 仍为先前快照，仅清 `editingCell` 会表现为「弹回旧数据」。
   */
  const emitCurrentTextInputBlur = (el: HTMLInputElement) => {
    if (disabled) return;
    emit(el.value);
  };
  /**
   * 数字列失焦提交：与 {@link emit} 的 `onInput` 分支同一套空串 / `Number` 解析规则。
   */
  const emitCurrentNumberInputBlur = (el: HTMLInputElement) => {
    if (disabled) return;
    const v = el.value;
    if (v === "") emit(null);
    else {
      const n = Number(v);
      emit(Number.isFinite(n) ? n : v);
    }
  };
  const stop = (e: Event) => e.stopPropagation();
  const justifyCheckbox = cellAlign === "right"
    ? "justify-end"
    : cellAlign === "center"
    ? "justify-center"
    : "justify-start";

  switch (ed.type) {
    case "text":
      return (
        <div
          class="min-h-0 w-full max-w-full overflow-hidden"
          onClick={stop}
        >
          <input
            type="text"
            class={twMerge(editableInputCls, h)}
            value={raw == null ? "" : String(raw)}
            placeholder={ed.placeholder}
            maxLength={ed.maxLength}
            disabled={disabled}
            onInput={(e: Event) => {
              const el = e.target as HTMLInputElement;
              if (pendingTextSelectionRef) {
                pendingTextSelectionRef.current = captureTextInputSelection(el);
              }
              emit(el.value);
            }}
            onCompositionEnd={(e: Event) => {
              const el = e.target as HTMLInputElement;
              if (pendingTextSelectionRef) {
                pendingTextSelectionRef.current = captureTextInputSelection(el);
              }
              emit(el.value);
            }}
            onBlur={(e: Event) => {
              emitCurrentTextInputBlur(e.target as HTMLInputElement);
            }}
          />
        </div>
      );
    case "number": {
      const str = raw == null || raw === ""
        ? ""
        : String(typeof raw === "number" ? raw : Number(raw));
      /**
       * 键盘输入走 `onInput`；{@link InputNumber} 的 +/- 步进只触发 `onChange`（合成事件），须两处都写回受控。
       */
      const handleNumberInputOrChange = (e: Event) => {
        const el = e.target as HTMLInputElement;
        if (pendingTextSelectionRef) {
          pendingTextSelectionRef.current = captureTextInputSelection(el);
        }
        const v = el.value;
        if (v === "") emit(null);
        else {
          const n = Number(v);
          emit(Number.isFinite(n) ? n : v);
        }
      };
      /** `InputNumber` 仅支持数值 step；列配置为 `"any"` 时退化为 1 */
      const stepForInputNumber = ed.step === "any" || ed.step == null
        ? 1
        : ed.step;
      return (
        <div
          class="min-h-0 w-full max-w-full overflow-hidden"
          onClick={stop}
        >
          <InputNumber
            size={size}
            /** 单元格内关闭外壳「激活边框」，避免与表格焦点样式叠两层；内层 input 仍可聚焦 */
            hideFocusRing
            value={Number.isFinite(Number(str)) ? str : ""}
            placeholder={ed.placeholder}
            min={ed.min}
            max={ed.max}
            step={stepForInputNumber}
            disabled={disabled}
            class={twMerge("w-full min-w-0", h)}
            onInput={handleNumberInputOrChange}
            onChange={handleNumberInputOrChange}
            onBlur={(e: Event) => {
              emitCurrentNumberInputBlur(e.target as HTMLInputElement);
            }}
          />
        </div>
      );
    }
    case "email":
    case "url":
    case "tel":
      return (
        <div
          class="min-h-0 w-full max-w-full overflow-hidden"
          onClick={stop}
        >
          <input
            type={ed.type}
            class={twMerge(editableInputCls, h)}
            value={raw == null ? "" : String(raw)}
            placeholder={ed.placeholder}
            disabled={disabled}
            onInput={(e: Event) => {
              const el = e.target as HTMLInputElement;
              if (pendingTextSelectionRef) {
                pendingTextSelectionRef.current = captureTextInputSelection(el);
              }
              emit(el.value);
            }}
            onCompositionEnd={(e: Event) => {
              const el = e.target as HTMLInputElement;
              if (pendingTextSelectionRef) {
                pendingTextSelectionRef.current = captureTextInputSelection(el);
              }
              emit(el.value);
            }}
            onBlur={(e: Event) => {
              emitCurrentTextInputBlur(e.target as HTMLInputElement);
            }}
          />
        </div>
      );
    case "date": {
      const dateStr = raw == null ? "" : String(raw);
      // 表格 table-wrapper 使用 overflow-x-auto，会裁切 absolute 浮层；须 panelAttach=viewport（视口 fixed）
      return (
        <div
          class="min-h-0 w-full max-w-full overflow-visible"
          onClick={stop}
        >
          <DatePicker
            value={dateStr}
            size={size}
            disabled={disabled}
            placeholder="选择日期"
            class={twMerge("w-full min-w-0", h)}
            panelAttach="viewport"
            onChange={(e: Event) => {
              const v = (e.target as EventTarget & { value?: string }).value ??
                "";
              emit(v);
            }}
          />
        </div>
      );
    }
    case "time": {
      const timeStr = raw == null ? "" : String(raw);
      // 与 date 列相同：避免浮层被 table-wrapper 裁切
      return (
        <div
          class="min-h-0 w-full max-w-full overflow-visible"
          onClick={stop}
        >
          <TimePicker
            value={timeStr}
            size={size}
            disabled={disabled}
            placeholder="选择时间"
            class={twMerge("w-full min-w-0", h)}
            panelAttach="viewport"
            onChange={(e: Event) => {
              const v = (e.target as EventTarget & { value?: string }).value ??
                "";
              emit(v);
            }}
          />
        </div>
      );
    }
    case "select":
      return (
        <div
          class="min-h-0 w-full max-w-full overflow-visible"
          onClick={stop}
        >
          <select
            class={twMerge(
              editableInputCls,
              h,
              "cursor-pointer appearance-auto pr-2",
            )}
            value={raw == null ? "" : String(raw)}
            disabled={disabled}
            onChange={(e: Event) => {
              const sel = e.target as HTMLSelectElement;
              const v = sel.value;
              const hit = ed.options.find((o) => String(o.value) === v);
              emit(hit ? hit.value : v);
            }}
            onBlur={(e: Event) => {
              if (disabled) return;
              const sel = e.target as HTMLSelectElement;
              const v = sel.value;
              const hit = ed.options.find((o) => String(o.value) === v);
              emit(hit ? hit.value : v);
            }}
          >
            {ed.placeholder != null && ed.placeholder !== "" && (
              <option value="">{ed.placeholder}</option>
            )}
            {ed.options.map((o) => (
              <option
                key={`${col.key}-${String(o.value)}`}
                value={String(o.value)}
              >
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    case "checkbox":
      return (
        <div
          class={twMerge(
            "flex min-h-0 w-full max-w-full items-center overflow-hidden",
            editableHeightCls[size],
            justifyCheckbox,
          )}
          onClick={stop}
        >
          <input
            type="checkbox"
            class="h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
            checked={Boolean(raw)}
            disabled={disabled}
            onChange={(e: Event) => {
              emit((e.target as HTMLInputElement).checked);
            }}
          />
        </div>
      );
    case "radio":
      return (
        <div
          class={twMerge(
            "flex min-h-0 w-full max-w-full flex-nowrap items-center gap-x-3 gap-y-0 overflow-x-auto overflow-y-hidden",
            editableHeightCls[size],
          )}
          onClick={stop}
        >
          {ed.options.map((opt) => (
            <label
              key={`${col.key}-${String(opt.value)}`}
              class="inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap text-xs text-slate-700 dark:text-slate-300"
            >
              <input
                type="radio"
                class="h-3.5 w-3.5 shrink-0 border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
                name={`tbl-ed-${col.key}-${rowDomKey}`}
                checked={raw === opt.value || String(raw) === String(opt.value)}
                disabled={disabled}
                onChange={() => {
                  emit(opt.value);
                }}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      );
    default: {
      const _exhaustive: never = ed;
      return _exhaustive;
    }
  }
}

/**
 * 在即将清空 `editingCell`、退回只读展示前，从编辑槽 DOM 再读一遍控件值并调用 `onCellChange`。
 * 保证「失焦 = 确认当前输入 + 回到表格文案」：避免子控件 `onBlur` 与卸载顺序竞态导致末次键入未提交。
 *
 * @param host - `data-view-table-edit-slot` 对应元素
 * @param col - 当前列
 * @param record - 当前行（与 {@link TableCellChangePayload} 一致）
 * @param rowIndex - 行下标
 * @param onCellChange - 受控回调；缺省时不处理
 */
function commitEditableSlotFromHostToParent<T extends Record<string, unknown>>(
  host: HTMLElement,
  col: TableColumn<T>,
  record: T,
  rowIndex: number,
  onCellChange: ((p: TableCellChangePayload<T>) => void) | undefined,
): void {
  if (!onCellChange) return;
  const ed = col.editable;
  if (!isEditableConfig(ed)) return;
  if (resolveEditableDisabled(ed, record, rowIndex)) return;

  const emitPayload = (value: unknown): void => {
    onCellChange({
      columnKey: col.key,
      dataIndex: (col.dataIndex ?? col.key) as keyof T | string,
      value,
      record,
      rowIndex,
    });
  };

  switch (ed.type) {
    case "date":
    case "time": {
      /** DatePicker / TimePicker 用隐藏域承载提交值 */
      const hid = host.querySelector(
        'input[type="hidden"]',
      ) as HTMLInputElement | null;
      if (hid) emitPayload(hid.value);
      break;
    }
    case "select": {
      const sel = host.querySelector("select") as HTMLSelectElement | null;
      if (!sel) return;
      const v = sel.value;
      const hit = ed.options.find((o) => String(o.value) === v);
      emitPayload(hit ? hit.value : v);
      break;
    }
    case "checkbox": {
      const cb = host.querySelector(
        'input[type="checkbox"]',
      ) as HTMLInputElement | null;
      if (cb) emitPayload(cb.checked);
      break;
    }
    case "radio": {
      const rd = host.querySelector(
        'input[type="radio"]:checked',
      ) as HTMLInputElement | null;
      if (!rd) return;
      const v = rd.value;
      const hit = ed.options.find((o) => String(o.value) === v);
      emitPayload(hit ? hit.value : v);
      break;
    }
    case "number": {
      const el = host.querySelector(
        'input[type="number"]',
      ) as HTMLInputElement | null;
      if (!el) return;
      const v = el.value;
      if (v === "") emitPayload(null);
      else {
        const n = Number(v);
        emitPayload(Number.isFinite(n) ? n : v);
      }
      break;
    }
    case "text":
    case "email":
    case "url":
    case "tel": {
      const el = host.querySelector(
        `input[type="${ed.type}"]`,
      ) as HTMLInputElement | null;
      const inp = el ??
        (host.querySelector(
          "input:not([type=hidden])",
        ) as HTMLInputElement | null);
      if (inp) emitPayload(inp.value);
      break;
    }
    default: {
      const _e: never = ed;
      return _e;
    }
  }
}

/** 可编辑列在非编辑态下的 flex 对齐（与编辑器一致） */
function editableCellJustify(
  cellAlign: "left" | "center" | "right" | undefined,
): string {
  if (cellAlign === "right") return "justify-end";
  if (cellAlign === "center") return "justify-center";
  return "justify-start";
}

/**
 * 可编辑列默认只读展示（双击后再渲染 {@link renderEditableCell}）。
 *
 * @param col - 列定义
 * @param raw - 当前单元格值
 * @param ed - 已解析的 editable 配置
 * @param size - 表格尺寸（与控件同高，避免切换闪动）
 * @param cellAlign - 列对齐
 */
function renderEditableCellDisplay<T extends Record<string, unknown>>(
  _col: TableColumn<T>,
  raw: unknown,
  ed: TableColumnEditable<T>,
  size: SizeVariant,
  cellAlign: "left" | "center" | "right" | undefined,
): ComponentChildren {
  const h = editableHeightCls[size];
  const justify = editableCellJustify(cellAlign);
  const textMuted = "text-slate-700 dark:text-slate-300";

  switch (ed.type) {
    case "checkbox":
      return (
        <span
          class={twMerge(
            "flex w-full min-w-0 max-w-full items-center text-slate-600 dark:text-slate-400",
            h,
            justify,
          )}
        >
          {raw ? "是" : "否"}
        </span>
      );
    case "radio": {
      const hit = ed.options.find(
        (o) => raw === o.value || String(raw) === String(o.value),
      );
      const t = hit?.label ?? (raw == null || raw === "" ? "—" : String(raw));
      return (
        <div
          class={twMerge(
            "flex w-full min-w-0 max-w-full items-center overflow-hidden",
            h,
            justify,
          )}
        >
          <span class={twMerge("min-w-0 truncate", textMuted)}>{t}</span>
        </div>
      );
    }
    case "select": {
      const hit = ed.options.find(
        (o) => String(o.value) === String(raw),
      );
      const t = hit?.label ?? (raw == null || raw === "" ? "—" : String(raw));
      return (
        <div
          class={twMerge(
            "flex w-full min-w-0 max-w-full items-center overflow-hidden",
            h,
            justify,
          )}
        >
          <span class={twMerge("min-w-0 truncate", textMuted)}>{t}</span>
        </div>
      );
    }
    default: {
      const t = raw == null || raw === "" ? "—" : String(raw);
      return (
        <div
          class={twMerge(
            "flex w-full min-w-0 max-w-full items-center overflow-hidden",
            h,
            justify,
          )}
        >
          <span class={twMerge("min-w-0 truncate", textMuted)}>{t}</span>
        </div>
      );
    }
  }
}

/**
 * 表头全选列中的原生 checkbox：`indeterminate` 无法由 JSX 表达，须在 DOM 上同步三线态。
 *
 * @param props - 当前页全选/部分选状态（由父级按 `displayData` 与选中集算出）
 */
function TableHeaderSelectAllInput(props: {
  /** 当前页是否全选（可勾选行） */
  allSelected: boolean;
  /** 当前页是否存在至少一行选中且非全选 */
  someSelected: boolean;
}): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.indeterminate = !props.allSelected && props.someSelected;
  }, [props.allSelected, props.someSelected]);
  return (
    <input
      ref={inputRef}
      type="checkbox"
      class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
      checked={props.allSelected}
      tabIndex={-1}
      readOnly
    />
  );
}

export function Table<
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  props: TableProps<T>,
): JSX.Element {
  const {
    columns,
    rowKey = "key",
    bordered = false,
    size = "md",
    striped = false,
    loading = false,
    onRow,
    expandable,
    summary,
    locale,
    renderEmpty,
    title,
    extra,
    pagination: paginationConfig,
    onSelectChange,
    selectedRowKeys: selectedRowKeysProp,
    selectionType = "checkbox",
    getCheckboxProps,
    rowClassName,
    hoverable = false,
    headerClass,
    class: className,
    stateKey,
    onCellChange,
  } = props;

  /** 分页当前页（非受控时使用） */
  const internalPage = signal(1);

  /** 由扁平 props 合成的行选择配置，供内部逻辑复用 */
  const rowSelection = onSelectChange
    ? {
      type: selectionType,
      selectedRowKeys: selectedRowKeysProp,
      onChange: onSelectChange,
      getCheckboxProps,
    }
    : undefined;

  // 内部排序状态；若有列配置了 defaultSortOrder 则作为初始值
  const defaultSortCol = columns.find(
    (c) => c.sorter && c.defaultSortOrder != null,
  );
  const sortState = signal<
    { key: string | null; order: SortOrder }
  >({
    key: defaultSortCol?.key ?? null,
    order: defaultSortCol?.defaultSortOrder ?? null,
  });

  /**
   * 内部选择/展开状态（非受控时使用）；有 stateKey 时从缓存取，避免整树重渲染丢失。
   * 使用 `@preact/signals` 的 `signal`（`.value` 读写）。
   */
  let selectedRef: Signal<Set<string>>;
  let expandedRef: Signal<string[]>;
  /** 当前正在编辑的单元格（rowKey + columnKey）；有 stateKey 时与选中/展开一并缓存，避免父级重挂 Table 后丢失 */
  let editingCell: Signal<TableEditingTarget | null>;

  /** 可编辑聚焦与失焦竞态用 ref；有 stateKey 时必须来自 stateCache，与 `editingCell` 同寿命 */
  let tableEditRootRef: { current: HTMLElement | null };
  let pendingEditRefocusCount: { current: number };
  let pendingEditTextSelectionRef: {
    current: { start: number; end: number } | null;
  };

  if (stateKey) {
    let cached = stateCache.get(stateKey);
    if (!cached) {
      cached = {
        selected: signal<Set<string>>(new Set()),
        expanded: signal<string[]>([]),
        editing: signal<TableEditingTarget | null>(null),
        tableEditRootRef: { current: null },
        pendingEditRefocusCount: { current: 0 },
        pendingEditTextSelectionRef: { current: null },
      };
      stateCache.set(stateKey, cached);
    } else {
      /**
       * 兼容旧版缓存条目（仅 selected/expanded 或缺 ref 字段）：同进程 HMR / 长期存活 Map 可能遗留。
       */
      if (cached.editing == null) {
        cached.editing = signal<TableEditingTarget | null>(null);
      }
      if (!("tableEditRootRef" in cached)) {
        Object.assign(cached, {
          tableEditRootRef: { current: null },
          pendingEditRefocusCount: { current: 0 },
          pendingEditTextSelectionRef: { current: null },
        });
      }
    }
    selectedRef = cached.selected;
    expandedRef = cached.expanded;
    editingCell = cached.editing;
    tableEditRootRef = cached.tableEditRootRef;
    pendingEditRefocusCount = cached.pendingEditRefocusCount;
    pendingEditTextSelectionRef = cached.pendingEditTextSelectionRef;
  } else {
    selectedRef = signal<Set<string>>(new Set());
    expandedRef = signal<string[]>([]);
    editingCell = signal<TableEditingTarget | null>(null);
    tableEditRootRef = { current: null };
    pendingEditRefocusCount = { current: 0 };
    pendingEditTextSelectionRef = { current: null };
  }

  /**
   * 双击进入编辑时聚焦一次，光标置于文本末尾（避免默认在行首）。
   *
   * **须用 `useSignalEffect`，勿在组件函数体内直接调 `effect()`：** 后者每次 Table
   * 重渲染都会新建订阅并立即跑一遍，父级受控 `onCellChange` 每键入一字即重渲染，会反复
   * `scheduleTableEditRefocus`，与输入抢焦点/选区，表现为 input 无法输入、select 选不中。
   */
  useSignalEffect(() => {
    const t = editingCell.value;
    if (t == null) return;
    scheduleTableEditRefocus(
      tableEditRootRef,
      () => editingCell.value,
      undefined,
      pendingEditTextSelectionRef,
      { initialCaretToEnd: true },
    );
  });

  const getKey = (record: T, index: number): string => {
    if (typeof rowKey === "function") return rowKey(record, index);
    const k = record[rowKey as keyof T];
    return k != null ? String(k) : `row-${index}`;
  };

  const paddingCls = sizeClasses[size];

  const handleSort = (
    key: string,
    sorter: boolean | ((a: T, b: T) => number),
  ) => {
    if (!sorter) return;
    const current = sortState.value;
    let nextOrder: SortOrder = "ascend";
    if (current.key === key) {
      if (current.order === "ascend") nextOrder = "descend";
      else if (current.order === "descend") nextOrder = null;
    }
    sortState.value = { key: nextOrder ? key : null, order: nextOrder };
  };

  /** 全选/取消全选当前传入的数据；startIndex 为数据在 dataSource 中的起始下标，用于 getKey(record, index) */
  const handleSelectAll = (
    checked: boolean,
    currentData: T[],
    startIndex = 0,
  ) => {
    if (!rowSelection) return;
    const newSelected = new Set(
      rowSelection.selectedRowKeys ?? selectedRef.value,
    );
    if (checked) {
      currentData.forEach((record, i) => {
        const key = getKey(record, startIndex + i);
        const props = rowSelection.getCheckboxProps?.(record);
        if (!props?.disabled) {
          newSelected.add(key);
        }
      });
    } else {
      currentData.forEach((record, i) => {
        const key = getKey(record, startIndex + i);
        newSelected.delete(key);
      });
    }

    if (rowSelection.selectedRowKeys === undefined) {
      selectedRef.value = newSelected;
    }

    /** 须读 `props.dataSource`：函数槽 patch 会更新 `liveProps`，顶层解构的数组会停留在首帧 */
    const selectedRows = props.dataSource.filter((record, index) =>
      newSelected.has(getKey(record, index))
    );
    rowSelection.onChange?.(selectedRows);
  };

  const handleSelect = (checked: boolean, record: T, index: number) => {
    if (!rowSelection) return;
    const key = getKey(record, index);
    const newSelected = new Set(
      rowSelection.selectedRowKeys ?? selectedRef.value,
    );

    if (rowSelection.type === "radio") {
      newSelected.clear();
      if (checked) newSelected.add(key);
    } else {
      if (checked) newSelected.add(key);
      else newSelected.delete(key);
    }

    if (rowSelection.selectedRowKeys === undefined) {
      selectedRef.value = newSelected;
    }

    const selectedRows = props.dataSource.filter((r, i) =>
      newSelected.has(getKey(r, i))
    );
    rowSelection.onChange?.(selectedRows);
  };

  /**
   * Preact：整表在同一组件函数体内渲染，直接读 `props.dataSource` 与各 signal `.value`。
   */
  const dataSource = props.dataSource;
  // 展开行：受控用 props，非受控用内部 signal（在 getter 内读以保证 effect 订阅、点击 + 能更新）
  const expandedKeysSource = expandable?.expandedRowKeys ??
    expandedRef.value;
  const expandedSet = new Set(
    Array.isArray(expandedKeysSource) ? expandedKeysSource : [],
  );

  // 处理排序
  const data = [...dataSource];
  const { key: sortKey, order: sortOrder } = sortState.value;
  if (sortKey && sortOrder) {
    const col = columns.find((c) => c.key === sortKey);
    if (col?.sorter) {
      if (typeof col.sorter === "function") {
        data.sort((a, b) =>
          (col.sorter as (a: T, b: T) => number)(a, b) *
          (sortOrder === "descend" ? -1 : 1)
        );
      } else {
        // 默认字符串/数字排序
        data.sort((a, b) => {
          const va = (a as any)[col.dataIndex || col.key];
          const vb = (b as any)[col.dataIndex || col.key];
          if (va === vb) return 0;
          const result = va > vb ? 1 : -1;
          return sortOrder === "descend" ? -result : result;
        });
      }
    }
  }

  // 分页：计算当前页数据与总数（pagination 为对象时启用，false/undefined 不启用）
  const paginationEnabled = paginationConfig !== undefined &&
    paginationConfig !== false;
  const pageSize = paginationEnabled
    ? (paginationConfig?.pageSize ?? 10)
    : data.length || 1;
  const currentPage = paginationEnabled
    ? (paginationConfig?.current ?? internalPage.value)
    : 1;
  const total = paginationEnabled
    ? (paginationConfig?.total ?? data.length)
    : data.length;
  const displayData = paginationEnabled
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // 处理选择状态（基于全量 data 的 key，与当前页 displayData 一致）
  const selectedKeys = new Set(
    rowSelection?.selectedRowKeys ?? selectedRef.value,
  );
  const allSelected = displayData.length > 0 && displayData.every(
    (record, index) => {
      const originalIndex = (currentPage - 1) * pageSize + index;
      const key = getKey(record, originalIndex);
      const props = rowSelection?.getCheckboxProps?.(record);
      return props?.disabled || selectedKeys.has(key);
    },
  );

  const someSelected = displayData.some((r, i) =>
    selectedKeys.has(getKey(r, (currentPage - 1) * pageSize + i))
  );

  /**
   * 选择列原生 input 的 `checked` 须传布尔；`indeterminate` 由 {@link TableHeaderSelectAllInput} 同步。
   */

  /** 固定列 left 偏移（仅 fixed === "left" 的列有值，用于 sticky 定位） */
  const fixedLeftOffsets: (number | null)[] = [];
  let leftAcc = 0;
  for (const col of columns) {
    if (col.fixed === "left") {
      fixedLeftOffsets.push(leftAcc);
      const w = col.width;
      leftAcc += typeof w === "number"
        ? w
        : (typeof w === "string" ? parseFloat(w) || 80 : 80);
    } else {
      fixedLeftOffsets.push(null);
    }
  }

  const handlePageChange = (page: number) => {
    if (paginationConfig !== undefined && paginationConfig !== false) {
      if (paginationConfig.current === undefined) {
        internalPage.value = page;
      }
      paginationConfig.onChange?.(page, pageSize);
    }
  };

  /** 空状态 / 加载行等单行占满表宽时的 colSpan（选择列 + 展开列 + 数据列） */
  const bodyColSpan = (rowSelection ? 1 : 0) +
    (expandable?.expandedRowRender ? 1 : 0) +
    columns.length;

  return (
    <div class="w-full min-w-0">
      {(title != null || extra != null) && (
        <div class="flex justify-between items-center gap-4 mb-2">
          <div class="text-base font-medium text-slate-800 dark:text-slate-200">
            {title}
          </div>
          <div>{extra}</div>
        </div>
      )}
      <div
        ref={(el: HTMLElement | null) => {
          tableEditRootRef.current = el;
        }}
        class={twMerge(
          "table-wrapper overflow-x-auto",
          className,
        )}
      >
        <table
          class={twMerge(
            "w-full border-collapse",
            // 外框用 0.5px，避免默认 1px 在 light 下显得偏粗（高 DPR 下仍可见细线）
            bordered &&
              "box-border border-0.5 border-slate-200 dark:border-slate-600",
          )}
        >
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/50">
              {rowSelection && (
                <th
                  class={twMerge(
                    "w-8 text-center",
                    paddingCls,
                    rowSelection.type !== "radio" &&
                      "cursor-pointer select-none",
                  )}
                  onClick={rowSelection.type !== "radio"
                    ? (e: Event) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const cur = rowSelection?.selectedRowKeys ??
                        selectedRef.value;
                      const set = cur instanceof Set
                        ? cur
                        : new Set((cur as string[]) ?? []);
                      const all = displayData.length > 0 &&
                        displayData.every((r, i) => {
                          const k = getKey(
                            r,
                            (currentPage - 1) * pageSize + i,
                          );
                          const p = rowSelection?.getCheckboxProps?.(r);
                          return p?.disabled || set.has(k);
                        });
                      handleSelectAll(
                        !all,
                        displayData,
                        (currentPage - 1) * pageSize,
                      );
                      const input = (
                        e.currentTarget as HTMLElement
                      ).querySelector(
                        'input[type="checkbox"]',
                      ) as HTMLInputElement | null;
                      if (input) {
                        const nextSet =
                          rowSelection?.selectedRowKeys === undefined
                            ? selectedRef.value
                            : new Set(
                              rowSelection?.selectedRowKeys ?? [],
                            );
                        const nextAll = displayData.length > 0 &&
                          displayData.every((r, i) => {
                            const k = getKey(
                              r,
                              (currentPage - 1) * pageSize + i,
                            );
                            const p = rowSelection?.getCheckboxProps?.(r);
                            return p?.disabled || nextSet.has(k);
                          });
                        const nextSome = displayData.some((r, i) =>
                          nextSet.has(
                            getKey(r, (currentPage - 1) * pageSize + i),
                          )
                        );
                        input.checked = nextAll;
                        input.indeterminate = !nextAll && nextSome;
                      }
                    }
                    : undefined}
                >
                  {rowSelection.type !== "radio" && (
                    <TableHeaderSelectAllInput
                      allSelected={allSelected}
                      someSelected={someSelected}
                    />
                  )}
                </th>
              )}
              {expandable?.expandedRowRender && (
                <th class={twMerge("w-8", paddingCls)} />
              )}
              {columns.map((col, colIndex) => (
                <th
                  key={col.key}
                  class={twMerge(
                    "text-left font-medium text-slate-700 dark:text-slate-300 select-none",
                    col.fixed === "left" &&
                      "bg-slate-50 dark:bg-slate-800 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.3)]",
                    paddingCls,
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right",
                    col.sorter &&
                      "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700",
                    headerClass,
                  )}
                  style={{
                    ...(fixedLeftOffsets[colIndex] != null
                      ? {
                        position: "sticky" as const,
                        left: `${fixedLeftOffsets[colIndex]}px`,
                        zIndex: 2,
                      }
                      : {}),
                    ...(col.width != null
                      ? {
                        width: typeof col.width === "number"
                          ? `${col.width}px`
                          : col.width,
                      }
                      : {}),
                  }}
                  onClick={() => col.sorter && handleSort(col.key, col.sorter)}
                >
                  <div class="flex items-center gap-1">
                    {col.title}
                    {col.sorter && (
                      <div class="flex flex-col text-[10px] text-slate-400">
                        <IconChevronUp
                          class={twMerge(
                            "w-3 h-3 -mb-1",
                            sortKey === col.key &&
                              sortOrder === "ascend" &&
                              "text-blue-500",
                          )}
                        />
                        <IconChevronDown
                          class={twMerge(
                            "w-3 h-3",
                            sortKey === col.key &&
                              sortOrder === "descend" &&
                              "text-blue-500",
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.length === 0
              ? (
                <tr>
                  <td
                    colSpan={bodyColSpan}
                    class={twMerge(
                      "text-center text-slate-500 dark:text-slate-400",
                      paddingCls,
                      // 加载态背景铺在整格；勿只写内层 div，否则 flex 块易收缩、与 thead 视觉宽度不齐
                      loading &&
                        "bg-slate-50/90 dark:bg-slate-900/50",
                    )}
                  >
                    {/* 加载态写在 td 内；内层须 w-full 撑满单元格内容区 */}
                    {loading
                      ? (
                        <div
                          class="flex w-full min-w-0 flex-col items-center justify-center"
                          aria-busy="true"
                          aria-live="polite"
                        >
                          <span class="text-sm">加载中…</span>
                        </div>
                      )
                      : (
                        renderEmpty?.() ??
                          (locale?.emptyText ?? "暂无数据")
                      )}
                  </td>
                </tr>
              )
              : (
                <>
                  {displayData.flatMap((record, index) => {
                    const originalIndex = (currentPage - 1) * pageSize +
                      index;
                    const key = getKey(record, originalIndex);
                    const isExpanded = expandedSet.has(key);
                    const canExpand = expandable?.rowExpandable?.(record) ??
                      true;
                    const isSelected = selectedKeys.has(key);
                    const checkboxProps = rowSelection
                      ?.getCheckboxProps?.(
                        record,
                      );
                    const rowProps = onRow?.(record, originalIndex) ?? {};

                    /**
                     * 斑马纹/行底色须落在每个 td：`border-collapse: collapse` 下 tr 的背景常被单元格遮住，浅色里会整表发白；
                     * light 下 `slate-50/50` 对比太弱，奇数行用 `bg-slate-100` 才能看出条纹。
                     */
                    const bodyRowCellBg = isSelected
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : striped && index % 2 === 1
                      ? "bg-slate-100 dark:bg-slate-800/40"
                      : "bg-white dark:bg-slate-900";

                    const rows: JSX.Element[] = [
                      <tr
                        key={key}
                        class={twMerge(
                          "border-b border-slate-200 dark:border-slate-700",
                          bordered &&
                            "[&_td]:border-r [&_td]:border-slate-200 dark:[&_td]:border-slate-600 [&_td:last-child]:border-r-0",
                          hoverable &&
                            "hover:bg-slate-50 dark:hover:bg-slate-700/30",
                          rowProps.onClick &&
                            "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30",
                          rowClassName?.(record, originalIndex),
                        )}
                        onClick={rowProps.onClick}
                      >
                        {rowSelection && (
                          <td
                            class={twMerge(
                              "text-center",
                              bodyRowCellBg,
                              paddingCls,
                              !checkboxProps?.disabled &&
                                "cursor-pointer select-none",
                            )}
                            onClick={(e: Event) => {
                              if (checkboxProps?.disabled) return;
                              e.preventDefault();
                              e.stopPropagation();
                              const cur = rowSelection?.selectedRowKeys ??
                                selectedRef.value;
                              const set = cur instanceof Set
                                ? cur
                                : new Set((cur as string[]) ?? []);
                              const nextChecked = !set.has(key);
                              handleSelect(
                                nextChecked,
                                record,
                                originalIndex,
                              );
                              const input = (
                                e.currentTarget as HTMLElement
                              ).querySelector(
                                'input[type="checkbox"], input[type="radio"]',
                              ) as HTMLInputElement | null;
                              if (input) input.checked = nextChecked;
                            }}
                          >
                            <input
                              type={rowSelection.type === "radio"
                                ? "radio"
                                : "checkbox"}
                              class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                              checked={isSelected}
                              disabled={checkboxProps?.disabled}
                              tabIndex={-1}
                              readOnly
                            />
                          </td>
                        )}
                        {expandable?.expandedRowRender && (
                          <td class={twMerge(paddingCls, bodyRowCellBg)}>
                            {canExpand && (
                              <button
                                type="button"
                                // 文本符号受 line-height 影响会纵向拉长；用固定正方形 + flex 居中，hover 底四边一致
                                class="inline-flex size-5 shrink-0 items-center justify-center rounded-md p-0 leading-none hover:bg-slate-200 dark:hover:bg-slate-600"
                                onClick={(e: Event) => {
                                  e.stopPropagation();
                                  // 非受控时更新内部展开态，保证 getter 重跑、UI 更新
                                  if (
                                    expandable.expandedRowKeys ===
                                      undefined
                                  ) {
                                    {
                                      const prev = expandedRef.peek();
                                      expandedRef.value = isExpanded
                                        ? prev.filter((k: string) => k !== key)
                                        : [...prev, key];
                                    }
                                  }
                                  expandable.onExpand?.(
                                    !isExpanded,
                                    record,
                                  );
                                }}
                                aria-expanded={isExpanded}
                              >
                                {isExpanded ? "−" : "+"}
                              </button>
                            )}
                          </td>
                        )}
                        {columns.map((col, colIndex) => {
                          const dataIndex =
                            (col.dataIndex ?? col.key) as keyof T;
                          const value = record[dataIndex];
                          const cellEditable = isEditableConfig(
                            col.editable,
                          );
                          const editTarget = editingCell.value;
                          const isEditing = cellEditable &&
                            editTarget != null &&
                            editTarget.rowKey === key &&
                            editTarget.columnKey === col.key;

                          let content: ComponentChildren;
                          if (cellEditable) {
                            const edResolved = col
                              .editable as TableColumnEditable<T>;
                            const dis = resolveEditableDisabled(
                              edResolved,
                              record,
                              originalIndex,
                            );
                            const canActivate = Boolean(onCellChange) &&
                              !dis;
                            if (isEditing) {
                              /** 稳定 vnode，减轻受控更新时子 input 被整节点替换导致误触发 focusout */
                              content = (
                                <div
                                  key={`edit-slot-${key}-${col.key}`}
                                  class="w-full min-w-0 outline-none"
                                  tabIndex={-1}
                                  data-view-table-edit-root="1"
                                  data-view-table-edit-slot={tableEditSlotToken(
                                    key,
                                    col.key,
                                  )}
                                  /**
                                   * 必须用 `focusout`（`onFocusOut`）：`blur` 不冒泡，子 input 失焦时父级
                                   * `onBlur` 永远不会触发，`editingCell` 无法清空，单元格会一直停在编辑态。
                                   */
                                  onFocusOut={(e: FocusEvent) => {
                                    const cur = e
                                      .currentTarget as HTMLElement;
                                    const rel = e.relatedTarget as
                                      | Node
                                      | null;
                                    if (
                                      rel != null && cur.contains(rel)
                                    ) {
                                      return;
                                    }
                                    /**
                                     * 本次 `focusout` 的 `relatedTarget` 快照：闭包传入 `tryBlurExit`，
                                     * 用于区分「焦点仍在子树内」与「受控替换子控件导致的 null」。
                                     */
                                    const focusOutRelated = rel;
                                    /**
                                     * 受控 input 被替换时先失焦、relatedTarget 常为空；不能与
                                     * `scheduleTableEditRefocus` 抢跑：后者是 microtask+2×rAF，
                                     * 若此处双 rAF 先执行会误清空 editingCell。
                                     * 始终用 `tableEditRootRef`+slot 查当前槽位（整段重挂后 `cur` 可能已 detached）。
                                     */
                                    const rowK = key;
                                    const colK = col.key;
                                    /**
                                     * 等待 `pendingEditRefocusCount` 归零的轮询步数（须与「判 activeElement」分开计数）。
                                     * 安全上限见 {@link TABLE_EDIT_PENDING_REFOCUS_MAX_WAIT_STEPS}。
                                     */
                                    let pendingRefocusWaitSteps = 0;
                                    /**
                                     * `tableEditRootRef` / 槽位晚一帧挂上时的短轮询步数；
                                     * 上限见 {@link TABLE_EDIT_DOM_SNAP_MAX_WAIT_STEPS}。
                                     */
                                    let domSnapWaitSteps = 0;
                                    /** 日期/时间浮层打开时焦点尚未落稳的轮询步数；上限见 {@link TABLE_EDIT_PICKER_FOCUS_SETTLE_MAX_STEPS} */
                                    let pickerFocusSettleSteps = 0;
                                    /**
                                     * `relatedTarget === null` 且槽内仍有编辑器时，对 `activeElement` 的补判步数；
                                     * 见 {@link TABLE_EDIT_NULL_RELATED_MAX_STEPS}。
                                     */
                                    let nullRelatedRetries = 0;
                                    const tryBlurExit = (): void => {
                                      const t = editingCell.value;
                                      if (
                                        t == null ||
                                        t.rowKey !== rowK ||
                                        t.columnKey !== colK
                                      ) {
                                        return;
                                      }
                                      if (
                                        pendingEditRefocusCount.current >
                                          0
                                      ) {
                                        pendingRefocusWaitSteps++;
                                        if (
                                          pendingRefocusWaitSteps >
                                            TABLE_EDIT_PENDING_REFOCUS_MAX_WAIT_STEPS
                                        ) {
                                          return;
                                        }
                                        requestAnimationFrame(() => {
                                          requestAnimationFrame(
                                            tryBlurExit,
                                          );
                                        });
                                        return;
                                      }
                                      const root = tableEditRootRef.current;
                                      const slot = tableEditSlotToken(
                                        rowK,
                                        colK,
                                      );
                                      const host = root?.querySelector(
                                        `[data-view-table-edit-slot="${slot}"]`,
                                      ) as HTMLElement | null;
                                      if (root == null || host == null) {
                                        domSnapWaitSteps++;
                                        if (
                                          domSnapWaitSteps <=
                                            TABLE_EDIT_DOM_SNAP_MAX_WAIT_STEPS
                                        ) {
                                          requestAnimationFrame(() => {
                                            requestAnimationFrame(
                                              tryBlurExit,
                                            );
                                          });
                                          return;
                                        }
                                        const tOrphan = editingCell.value;
                                        if (
                                          tOrphan?.rowKey === rowK &&
                                          tOrphan.columnKey === colK
                                        ) {
                                          editingCell.value = null;
                                        }
                                        return;
                                      }
                                      const doc = globalThis.document;
                                      const ae = doc.activeElement;
                                      if (
                                        ae === host ||
                                        host.contains(ae)
                                      ) {
                                        return;
                                      }
                                      /**
                                       * 受控更新替换子 `input` 时：`relatedTarget` 常为 `null`，
                                       * `activeElement` 可能短暂落在 `body`；槽内若仍有表单控件则多轮延后重判，
                                       * 避免误清 `editingCell`（否则每键一次退回只读、无法输入）。
                                       */
                                      if (
                                        focusOutRelated == null &&
                                        host.querySelector(
                                          "input,select,textarea,button",
                                        )
                                      ) {
                                        nullRelatedRetries++;
                                        if (
                                          nullRelatedRetries <=
                                            TABLE_EDIT_NULL_RELATED_MAX_STEPS
                                        ) {
                                          tableEditDebugLog(
                                            "editable: null relatedTarget, retry activeElement",
                                            {
                                              rowK,
                                              colK,
                                              step: nullRelatedRetries,
                                              activeTag: ae &&
                                                (ae as Element).tagName,
                                            },
                                          );
                                          requestAnimationFrame(() => {
                                            requestAnimationFrame(
                                              tryBlurExit,
                                            );
                                          });
                                          return;
                                        }
                                      }
                                      /**
                                       * 格内 Picker 主面板仍打开时：焦点可能在面板内按钮上（须视为仍在编辑），
                                       * 或短暂落在 `body` / `documentElement`（须延后重判，勿清空编辑态）。
                                       */
                                      const pickerRoot =
                                        tableEditFindOpenPickerDialogRoot(
                                          host,
                                        );
                                      if (pickerRoot != null) {
                                        if (
                                          ae instanceof Node &&
                                          pickerRoot.contains(ae)
                                        ) {
                                          return;
                                        }
                                        if (
                                          ae === doc.body ||
                                          ae === doc.documentElement ||
                                          ae == null
                                        ) {
                                          pickerFocusSettleSteps++;
                                          if (
                                            pickerFocusSettleSteps <=
                                              TABLE_EDIT_PICKER_FOCUS_SETTLE_MAX_STEPS
                                          ) {
                                            requestAnimationFrame(() => {
                                              requestAnimationFrame(
                                                tryBlurExit,
                                              );
                                            });
                                            return;
                                          }
                                          /**
                                           * 重试耗尽后焦点仍在 document 默认锚点：常见于仅用鼠标操作月/年面板、
                                           * 或子控件未实现 `tabindex` 夺焦。只要选择器浮层仍连接且可见，视为仍在编辑，
                                           * 勿清空 `editingCell`（否则会卸载格内组件、面板被关掉）。
                                           */
                                          if (
                                            pickerRoot.isConnected
                                          ) {
                                            const pr = pickerRoot
                                              .getBoundingClientRect();
                                            if (
                                              pr.width > 0 &&
                                              pr.height > 0
                                            ) {
                                              return;
                                            }
                                          }
                                        }
                                      }
                                      const t2 = editingCell.value;
                                      if (
                                        t2?.rowKey === rowK &&
                                        t2.columnKey === colK
                                      ) {
                                        /**
                                         * 先提交槽内 DOM 再清编辑态：与 input `onBlur` 双保险，
                                         * 确保失焦后回到只读表格时父级 `dataSource` 已含当前输入。
                                         */
                                        commitEditableSlotFromHostToParent(
                                          host,
                                          col,
                                          record,
                                          originalIndex,
                                          onCellChange,
                                        );
                                        tableEditDebugLog(
                                          "editable: clear editingCell (blur exit)",
                                          { rowK, colK },
                                        );
                                        editingCell.value = null;
                                      }
                                    };
                                    requestAnimationFrame(() => {
                                      requestAnimationFrame(tryBlurExit);
                                    });
                                  }}
                                >
                                  {renderEditableCell(
                                    col,
                                    record,
                                    originalIndex,
                                    key,
                                    size,
                                    col.align,
                                    onCellChange,
                                    () => {
                                      scheduleTableEditRefocus(
                                        tableEditRootRef,
                                        () => editingCell.value,
                                        () => {
                                          pendingEditRefocusCount
                                            .current = Math.max(
                                              0,
                                              pendingEditRefocusCount
                                                .current - 1,
                                            );
                                        },
                                        pendingEditTextSelectionRef,
                                      );
                                    },
                                    pendingEditTextSelectionRef,
                                    pendingEditRefocusCount,
                                  )}
                                </div>
                              );
                            } else {
                              content = (
                                <div
                                  class={twMerge(
                                    "min-w-0 max-w-full",
                                    canActivate
                                      ? "cursor-cell select-none"
                                      : "cursor-not-allowed opacity-60",
                                  )}
                                  title={canActivate ? "双击编辑" : undefined}
                                  onDblClick={(e: Event) => {
                                    e.stopPropagation();
                                    if (!canActivate) return;
                                    editingCell.value = {
                                      rowKey: key,
                                      columnKey: col.key,
                                    };
                                  }}
                                >
                                  {renderEditableCellDisplay(
                                    col,
                                    value,
                                    edResolved,
                                    size,
                                    col.align,
                                  )}
                                </div>
                              );
                            }
                          } else {
                            content = (
                              col.render
                                ? col.render(value, record, originalIndex)
                                : value
                            ) as ComponentChildren;
                          }
                          const isStickyLeft = col.fixed === "left";
                          return (
                            <td
                              key={col.key}
                              class={twMerge(
                                "text-slate-700 dark:text-slate-300",
                                bodyRowCellBg,
                                paddingCls,
                                col.align === "center" && "text-center",
                                col.align === "right" && "text-right",
                                col.ellipsis &&
                                  (!cellEditable || !isEditing) &&
                                  "max-w-0 truncate",
                                isStickyLeft &&
                                  "shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)] dark:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.25)]",
                                cellEditable && "align-middle",
                              )}
                              style={{
                                ...(fixedLeftOffsets[colIndex] != null
                                  ? {
                                    position: "sticky" as const,
                                    left: `${fixedLeftOffsets[colIndex]}px`,
                                    zIndex: 1,
                                  }
                                  : {}),
                                ...(col.width != null
                                  ? {
                                    width: typeof col.width === "number"
                                      ? `${col.width}px`
                                      : col.width,
                                  }
                                  : {}),
                              }}
                            >
                              {content}
                            </td>
                          );
                        })}
                      </tr>,
                    ];
                    if (
                      expandable?.expandedRowRender && isExpanded &&
                      canExpand
                    ) {
                      rows.push(
                        <tr key={`${key}-exp`}>
                          <td
                            colSpan={(expandable ? 1 : 0) +
                              columns.length +
                              (rowSelection ? 1 : 0)}
                            class={twMerge(
                              paddingCls,
                              "bg-slate-100 dark:bg-slate-800/40",
                            )}
                          >
                            {expandable.expandedRowRender(
                              record,
                              originalIndex,
                            )}
                          </td>
                        </tr>,
                      );
                    }
                    return rows;
                  })}
                  {loading && (
                    <tr key="__view-table-loading">
                      <td
                        colSpan={bodyColSpan}
                        class={twMerge(
                          "border-t border-slate-100 bg-slate-50/80 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400",
                          paddingCls,
                        )}
                        aria-busy="true"
                        aria-live="polite"
                      >
                        <div class="flex w-full min-w-0 items-center justify-center py-6">
                          <span>加载中…</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )}
          </tbody>
          {summary != null && (
            <tfoot>
              <tr class="bg-slate-50 dark:bg-slate-800/50 font-medium border-t border-slate-200 dark:border-slate-600">
                <td
                  colSpan={(expandable?.expandedRowRender ? 1 : 0) +
                    columns.length +
                    (rowSelection ? 1 : 0)}
                  class={paddingCls}
                >
                  {summary(dataSource)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {paginationEnabled && (
        <div class="flex items-center justify-between gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
          <span>
            第 {currentPage} / {totalPages} 页，共 {total} 条
          </span>
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              上一页
            </button>
            <button
              type="button"
              class="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
