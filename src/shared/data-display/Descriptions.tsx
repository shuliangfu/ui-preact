/**
 * Descriptions 描述列表（Preact）。
 * 键值对展示；支持标题、列数、边框、尺寸、垂直/水平布局。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import type { SizeVariant } from "../types.ts";

export interface DescriptionsItem {
  /** 标签（键） */
  label: ComponentChildren;
  /** 内容（值） */
  children?: ComponentChildren;
  /** 跨列数（不超过外层 `column`） */
  span?: number;
}

export interface DescriptionsProps {
  /** 描述项列表 */
  items: DescriptionsItem[];
  /** 标题 */
  title?: ComponentChildren;
  /** 栅格列数；默认 3 */
  column?: number;
  /** 是否带边框 */
  bordered?: boolean;
  /** 尺寸 */
  size?: SizeVariant;
  /** 布局：horizontal 标签在左，vertical 标签在上 */
  layout?: "horizontal" | "vertical";
  /** 标签后是否显示冒号，默认 true */
  colon?: boolean;
  /** 额外 class */
  class?: string;
  /** 标签列 class */
  labelClass?: string;
  /** 内容列 class */
  contentClass?: string;
  /**
   * 仅 `layout="horizontal"`：标签列占当前项格子宽度的百分比（默认 38）。
   */
  labelColPercent?: number;
  /**
   * 仅 `layout="horizontal"`：标签列最小宽度。
   */
  labelMinWidth?: string | number;
}

const sizeClasses: Record<SizeVariant, string> = {
  xs: "text-xs py-1.5 px-2",
  sm: "text-sm py-2 px-3",
  md: "text-sm py-2.5 px-4",
  lg: "text-base py-3 px-4",
};

const DESCRIPTIONS_LABEL_MIN_WIDTH_DEFAULT = "13.5rem";
const DESCRIPTIONS_LABEL_COL_PERCENT_DEFAULT = 38;

function descriptionsLabelMinWidthCss(
  v: string | number | undefined,
  fallback: string,
): string {
  if (v === undefined) return fallback;
  if (typeof v === "number" && Number.isFinite(v)) return `${v}px`;
  const s = String(v).trim();
  return s === "" ? fallback : s;
}

function descriptionsLabelColPercentClamped(n: number | undefined): number {
  const x = n ?? DESCRIPTIONS_LABEL_COL_PERCENT_DEFAULT;
  if (!Number.isFinite(x)) return DESCRIPTIONS_LABEL_COL_PERCENT_DEFAULT;
  return Math.min(85, Math.max(12, Math.round(x)));
}

function descriptionsHorizontalLabelPercentInCell(
  basePercent: number,
  span: number,
): number {
  const s = Number.isFinite(span) && span >= 1 ? Math.floor(span) : 1;
  return basePercent / s;
}

function computeDescriptionsPlacements(
  items: DescriptionsItem[],
  column: number,
): { row: number; startCol: number; span: number }[] {
  const colCount = Math.max(
    1,
    Number.isFinite(column) ? Math.floor(column) : 1,
  );
  const placements: { row: number; startCol: number; span: number }[] = [];

  let row = 0;
  let col = 0;

  for (let i = 0; i < items.length; i++) {
    let span = items[i].span ?? 1;
    if (!Number.isFinite(span) || span < 1) span = 1;
    span = Math.min(Math.floor(span), colCount);

    if (col + span > colCount) {
      row++;
      col = 0;
    }

    placements.push({ row, startCol: col, span });
    col += span;
    if (col >= colCount) {
      row++;
      col = 0;
    }
  }

  const rowToIndices = new Map<number, number[]>();
  for (let i = 0; i < placements.length; i++) {
    const r = placements[i].row;
    if (!rowToIndices.has(r)) rowToIndices.set(r, []);
    rowToIndices.get(r)!.push(i);
  }

  for (const indices of rowToIndices.values()) {
    let maxEnd = 0;
    for (const idx of indices) {
      const p = placements[idx];
      maxEnd = Math.max(maxEnd, p.startCol + p.span);
    }
    if (maxEnd < colCount) {
      const gap = colCount - maxEnd;
      let rightIdx = indices[0];
      for (const idx of indices) {
        const a = placements[rightIdx];
        const b = placements[idx];
        if (b.startCol + b.span > a.startCol + a.span) rightIdx = idx;
      }
      placements[rightIdx].span += gap;
    }
  }

  return placements;
}

/**
 * Descriptions：描述列表。
 */
export function Descriptions(props: DescriptionsProps): JSX.Element {
  const {
    items,
    title,
    column = 3,
    bordered = false,
    size = "md",
    layout = "horizontal",
    colon = true,
    class: className,
    labelClass,
    contentClass,
    labelColPercent: labelColPercentProp,
    labelMinWidth: labelMinWidthProp,
  } = props;

  const labelColPercent = descriptionsLabelColPercentClamped(
    labelColPercentProp,
  );
  const labelMinWidthCss = descriptionsLabelMinWidthCss(
    labelMinWidthProp,
    DESCRIPTIONS_LABEL_MIN_WIDTH_DEFAULT,
  );

  const columnCount = Math.max(
    1,
    Number.isFinite(column) ? Math.floor(column) : 1,
  );

  const placements = computeDescriptionsPlacements(items, columnCount);

  const cellCls = sizeClasses[size];
  const labelCls = twMerge(
    "text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800/50",
    cellCls,
    layout === "horizontal" && "text-right min-w-0 break-words",
    labelClass,
  );
  const contentCls = twMerge(cellCls, contentClass);

  return (
    <div class={twMerge("descriptions", className)}>
      {title != null && (
        <div class="text-base font-semibold text-slate-900 dark:text-white mb-3">
          {title}
        </div>
      )}
      <div
        class={twMerge(
          "grid gap-0",
          bordered &&
            "border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden",
        )}
        style={{
          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        }}
      >
        {items.map((item, index) => {
          const placement = placements[index]!;
          const effectiveSpan = placement.span;
          const labelPercentInCell = descriptionsHorizontalLabelPercentInCell(
            labelColPercent,
            effectiveSpan,
          );
          const touchesRightEdge =
            placement.startCol + effectiveSpan >= columnCount;
          return (
            <div
              key={index}
              class={twMerge(
                "min-w-0",
                layout === "horizontal" && "grid w-full gap-0",
                layout === "vertical" && "flex flex-col",
                bordered &&
                  "border-b border-r border-slate-200 dark:border-slate-600",
              )}
              style={{
                gridRow: placement.row + 1,
                gridColumn: `${placement.startCol + 1} / span ${effectiveSpan}`,
                ...(layout === "horizontal"
                  ? {
                    gridTemplateColumns:
                      `minmax(${labelMinWidthCss}, ${labelPercentInCell}%) minmax(0, 1fr)`,
                  }
                  : {}),
                ...(bordered && touchesRightEdge
                  ? { borderRight: "none" }
                  : {}),
              }}
            >
              <div class={labelCls}>
                {item.label}
                {colon ? "：" : null}
              </div>
              <div class={twMerge(contentCls, "min-w-0 wrap-break-word")}>
                {item.children}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
