/**
 * Pagination 分页（Preact）。
 * 支持当前页、总条数、每页条数、跳转、上一页/下一页。
 */

import { useSignal } from "@preact/signals";
import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { IconChevronLeft } from "../basic/icons/ChevronLeft.tsx";
import { IconChevronRight } from "../basic/icons/ChevronRight.tsx";
import { getPaginationState } from "./pagination-utils.ts";

/**
 * Pagination 内置文案。函数式项接收上下文（如页码、总数）并返回最终文本，便于多语言/复数处理。
 */
export interface PaginationMessages {
  /** 根 `<nav>` 的 `aria-label` */
  nav: string;
  /** 上一页按钮 `aria-label` */
  prev: string;
  /** 下一页按钮 `aria-label` */
  next: string;
  /** 单个页码按钮 `aria-label`，参数为该页码 */
  pageLabel: (page: number) => string;
  /** 每页条数选择器 `aria-label` */
  pageSize: string;
  /** 每页条数下拉项文本，参数为条数 */
  pageSizeUnit: (n: number) => string;
  /** 快速跳转输入框前的提示文本 */
  jumpTo: string;
  /** 快速跳转输入框后的单位文本 */
  pageUnit: string;
  /** showTotal=true 时的「共 N 条」默认渲染 */
  totalText: (total: number) => string;
}

/** 默认中文文案 */
export const defaultPaginationMessages: PaginationMessages = {
  nav: "分页",
  prev: "上一页",
  next: "下一页",
  pageLabel: (p) => `第 ${p} 页`,
  pageSize: "每页条数",
  pageSizeUnit: (n) => `${n} 条/页`,
  jumpTo: "跳至",
  pageUnit: "页",
  totalText: (total) => `共 ${total} 条`,
};

export interface PaginationProps {
  /** 当前页码（受控）；不传则内部 `useSignal` */
  current?: number | (() => number);
  defaultCurrent?: number;
  total?: number;
  totalPages?: number;
  /** 每页条数（受控）；不传则内部 Signal */
  pageSize?: number | (() => number);
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  onChange: (page: number, pageSize?: number) => void;
  showPrevNext?: boolean;
  showPageNumbers?: boolean;
  showQuickJumper?: boolean;
  showTotal?:
    | boolean
    | ((total: number, range: [number, number]) => ComponentChildren);
  disabled?: boolean;
  syncUrl?: boolean;
  class?: string;
  /** 多语言/自定义文案；未传字段走 {@link defaultPaginationMessages} */
  messages?: Partial<PaginationMessages>;
}

/** 将当前 URL 的 search 与 page/pageSize 合并后写入 */
function updateUrlSearch(page: number, pageSize: number) {
  if (typeof globalThis.location === "undefined") return;
  const u = new URL(globalThis.location.href);
  u.searchParams.set("page", String(page));
  u.searchParams.set("pageSize", String(pageSize));
  globalThis.history.replaceState(
    globalThis.history.state,
    "",
    u.pathname + u.search,
  );
}

/**
 * 分页导航条。
 */
export function Pagination(props: PaginationProps): JSX.Element {
  const {
    pageSize: pageSizeProp,
    defaultCurrent = 1,
    defaultPageSize = 10,
    pageSizeOptions,
    onChange: onChangeProp,
    showPrevNext = true,
    showPageNumbers = true,
    showQuickJumper = false,
    showTotal = false,
    disabled = false,
    syncUrl = false,
    class: className,
    messages,
  } = props;
  /** 合并默认中文文案与外部传入 messages */
  const m = { ...defaultPaginationMessages, ...messages };

  const internalCurrentRef = useSignal(defaultCurrent);
  const internalPageSizeRef = useSignal(defaultPageSize);

  const btnCls =
    "min-w-8 h-8 px-2 inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed";
  const activeCls =
    "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 pointer-events-none";

  const onChange = (page: number, pageSize?: number) => {
    if (props.current === undefined) internalCurrentRef.value = page;
    if (pageSize != null && props.pageSize === undefined) {
      internalPageSizeRef.value = pageSize;
    }
    if (syncUrl) {
      const ps = pageSize ??
        (props.pageSize === undefined
          ? internalPageSizeRef.value
          : (typeof pageSizeProp === "function"
            ? pageSizeProp()
            : pageSizeProp) ?? 10);
      updateUrlSearch(page, ps);
    }
    onChangeProp(page, pageSize);
  };

  const { total, totalPages: totalPagesProp } = props;
  const currentVal = props.current !== undefined
    ? (typeof props.current === "function" ? props.current() : props.current)
    : internalCurrentRef.value;
  const pageSizeVal = props.pageSize !== undefined
    ? ((typeof pageSizeProp === "function" ? pageSizeProp() : pageSizeProp) ??
      defaultPageSize)
    : internalPageSizeRef.value;
  const {
    totalPages,
    safeCurrent,
    from,
    to,
    canPrev,
    canNext,
    pages,
  } = getPaginationState(
    currentVal,
    pageSizeVal,
    total,
    totalPagesProp,
  );

  return (
    <nav
      role="navigation"
      aria-label={m.nav}
      class={twMerge("flex items-center gap-1 flex-wrap", className)}
    >
      {showTotal && total != null && (
        <span class="mr-2 text-sm text-slate-600 dark:text-slate-400 shrink-0">
          {typeof showTotal === "function"
            ? showTotal(total, [from, to])
            : m.totalText(total)}
        </span>
      )}
      {showPrevNext && (
        <button
          type="button"
          class={twMerge(btnCls, "shrink-0")}
          disabled={disabled || !canPrev}
          aria-label={m.prev}
          onClick={() => onChange(safeCurrent - 1)}
        >
          <IconChevronLeft class="w-4 h-4" />
        </button>
      )}
      {showPageNumbers &&
        pages.map((p, i) =>
          p < 0
            ? (
              <span
                key={`ellipsis-${i}`}
                class="min-w-8 h-8 flex items-center justify-center text-slate-400"
              >
                …
              </span>
            )
            : (
              <button
                key={p}
                type="button"
                class={twMerge(btnCls, safeCurrent === p && activeCls)}
                disabled={disabled}
                aria-label={m.pageLabel(p)}
                aria-current={safeCurrent === p ? "page" : undefined}
                onClick={() => onChange(p)}
              >
                {p}
              </button>
            )
        )}
      {showPrevNext && (
        <button
          type="button"
          class={twMerge(btnCls, "shrink-0")}
          disabled={disabled || !canNext}
          aria-label={m.next}
          onClick={() => onChange(safeCurrent + 1)}
        >
          <IconChevronRight class="w-4 h-4" />
        </button>
      )}
      {pageSizeOptions != null && pageSizeOptions.length > 0 &&
        total != null &&
        (
          <span class="ml-2 inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 shrink-0">
            <select
              class="h-8 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
              value={String(pageSizeVal)}
              onChange={(e: Event) => {
                const v = parseInt(
                  (e.target as HTMLSelectElement).value,
                  10,
                );
                if (!Number.isNaN(v)) onChange(1, v);
              }}
              aria-label={m.pageSize}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {m.pageSizeUnit(n)}
                </option>
              ))}
            </select>
          </span>
        )}
      {showQuickJumper && (
        <span class="ml-2 inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
          {m.jumpTo}
          <input
            type="number"
            min={1}
            max={totalPages}
            class="w-12 h-8 px-1 text-center rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
            onBlur={(e: Event) => {
              const v = parseInt(
                (e.target as HTMLInputElement).value,
                10,
              );
              if (!Number.isNaN(v) && v >= 1 && v <= totalPages) {
                onChange(v);
              }
            }}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === "Enter") {
                const v = parseInt(
                  (e.target as HTMLInputElement).value,
                  10,
                );
                if (!Number.isNaN(v) && v >= 1 && v <= totalPages) {
                  onChange(v);
                }
              }
            }}
          />
          {m.pageUnit}
        </span>
      )}
    </nav>
  );
}
