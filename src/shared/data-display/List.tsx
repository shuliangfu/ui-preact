/**
 * List 列表（Preact）。
 * 支持 header、footer、分割线、加载态、栅格模式、尺寸。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import type { SizeVariant } from "../types.ts";

export interface ListItemProps {
  /** 唯一 key */
  key?: string;
  /** 主内容 */
  children?: ComponentChildren;
  /** 左侧缩略图/图标 */
  thumb?: ComponentChildren;
  /** 右侧额外操作/文案 */
  extra?: ComponentChildren;
  /** 是否禁用 */
  disabled?: boolean;
  /** 点击回调 */
  onClick?: (e: Event) => void;
}

export interface ListProps {
  /** 列表项数据 */
  items?: ListItemProps[] | unknown[];
  /** 自定义每项渲染 */
  renderItem?: (item: unknown, index: number) => ComponentChildren;
  /** 列表头部 */
  header?: ComponentChildren;
  /** 列表底部 */
  footer?: ComponentChildren;
  /** 是否加载态 */
  loading?: boolean;
  /** 加载更多区域 */
  loadMore?: ComponentChildren;
  /** 是否显示分割线，默认 true */
  split?: boolean;
  /** 尺寸 */
  size?: SizeVariant;
  /** 是否带边框容器 */
  bordered?: boolean;
  /** 栅格模式（多列卡片式排布） */
  grid?: {
    column?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  /** 额外 class */
  class?: string;
  /** 单项 class */
  itemClass?: string;
}

const sizeClasses: Record<SizeVariant, string> = {
  xs: "py-2 px-3 text-xs",
  sm: "py-2.5 px-3 text-sm",
  md: "py-3 px-4 text-sm",
  lg: "py-4 px-4 text-base",
};

function clampGridColumns(n: number): number {
  const k = Math.floor(n);
  if (!Number.isFinite(k)) return 1;
  return Math.min(12, Math.max(1, k));
}

function gridColsClass(
  n: number,
  breakpoint?: "sm" | "md" | "lg",
): string {
  const k = clampGridColumns(n);
  const map: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    7: "grid-cols-7",
    8: "grid-cols-8",
    9: "grid-cols-9",
    10: "grid-cols-10",
    11: "grid-cols-11",
    12: "grid-cols-12",
  };
  const util = map[k] ?? "grid-cols-1";
  return breakpoint != null ? `${breakpoint}:${util}` : util;
}

function buildListGridContainerClass(
  grid: NonNullable<ListProps["grid"]>,
): string {
  const hasBreakpoint = grid.xs != null || grid.sm != null || grid.md != null ||
    grid.lg != null;
  const parts = ["grid", "gap-2"];
  if (!hasBreakpoint) {
    parts.push(gridColsClass(grid.column ?? 1));
    return parts.join(" ");
  }
  const base = grid.xs ?? grid.column ?? 1;
  parts.push(gridColsClass(base));
  if (grid.sm != null) parts.push(gridColsClass(grid.sm, "sm"));
  if (grid.md != null) parts.push(gridColsClass(grid.md, "md"));
  if (grid.lg != null) parts.push(gridColsClass(grid.lg, "lg"));
  return parts.join(" ");
}

function listItemRowKey(item: unknown, index: number): string {
  const it = item as ListItemProps;
  if (it.key != null && String(it.key) !== "") {
    return String(it.key);
  }
  return `__list-row-${index}`;
}

/**
 * List：列表容器。
 */
export function List(props: ListProps): JSX.Element {
  const {
    items = [],
    renderItem,
    header,
    footer,
    loading = false,
    loadMore,
    split = true,
    size = "md",
    bordered = false,
    grid,
    class: className,
    itemClass,
  } = props;

  const listItems = Array.isArray(items) ? items : [];
  const paddingCls = sizeClasses[size];

  const renderOne = (item: unknown, index: number): ComponentChildren => {
    if (renderItem) return renderItem(item, index);
    const it = item as ListItemProps;
    const hasThumb = it.thumb != null;
    const hasExtra = it.extra != null;
    const hasHandler = typeof it.onClick === "function";
    const interactive = hasHandler && !it.disabled;

    return (
      <div
        class={twMerge(
          "flex items-center gap-3 min-w-0",
          paddingCls,
          interactive &&
            "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50",
          it.disabled && "opacity-60 cursor-not-allowed",
          itemClass,
        )}
        aria-disabled={it.disabled ? "true" : undefined}
        onClick={interactive
          ? (e: Event) => {
            it.onClick?.(e);
          }
          : undefined}
      >
        {hasThumb && <div class="shrink-0">{it.thumb}</div>}
        <div class="flex-1 min-w-0">{it.children}</div>
        {hasExtra && <div class="shrink-0">{it.extra}</div>}
      </div>
    );
  };

  const bodyClass = grid ? buildListGridContainerClass(grid) : "flex flex-col";

  return (
    <div
      class={twMerge(
        "list",
        bordered &&
          "border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden",
        className,
      )}
    >
      {header != null && (
        <div class="px-4 py-2 border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 text-sm font-medium text-slate-700 dark:text-slate-300">
          {header}
        </div>
      )}
      <div class={bodyClass}>
        {listItems.map((item, i) => (
          <div
            key={listItemRowKey(item, i)}
            class={split && !grid
              ? "border-b border-slate-100 dark:border-slate-700 last:border-b-0"
              : ""}
          >
            {renderOne(item, i)}
          </div>
        ))}
      </div>
      {loading && (
        <div class="px-4 py-3 text-center text-sm text-slate-500 dark:text-slate-400">
          加载中…
        </div>
      )}
      {loadMore != null && (
        <div class="shrink-0 border-t border-slate-100 px-4 py-3 dark:border-slate-700">
          {loadMore}
        </div>
      )}
      {footer != null && (
        <div class="px-4 py-2 border-t border-slate-200 dark:border-slate-600 text-sm text-slate-500 dark:text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
}
