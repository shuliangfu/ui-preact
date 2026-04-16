/**
 * Grid 栅格（Preact）。
 * 支持 12/24 列、gap、子项 span；基于 CSS Grid。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";

export interface GridProps {
  /** 列数，默认 12 */
  cols?: 6 | 12 | 24;
  /** 间距，默认 4 */
  gap?: number | string;
  /** 额外 class（作用于网格容器） */
  class?: string;
  /** 子节点（通常为 GridItem） */
  children?: ComponentChildren;
}

const colsClasses: Record<6 | 12 | 24, string> = {
  6: "grid-cols-6",
  12: "grid-cols-12",
  24: "grid-cols-[repeat(24,minmax(0,1fr))]",
};

const gapClasses: Record<string, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
};

/**
 * CSS Grid 容器。
 */
export function Grid(props: GridProps): JSX.Element {
  const { cols = 12, gap = 4, class: className, children } = props;
  const gapCls = typeof gap === "number"
    ? gapClasses[String(gap)] ?? "gap-4"
    : (gapClasses[String(gap)] ?? "gap-4");

  return (
    <div
      class={twMerge(
        "grid w-full",
        colsClasses[cols],
        gapCls,
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface GridItemProps {
  /** 占据列数，默认 1 */
  span?: number;
  /** 额外 class */
  class?: string;
  /** React 风格 class 别名 */
  className?: string;
  /** 子节点 */
  children?: ComponentChildren;
}

const spanClasses: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
  13: "col-span-[13]",
  14: "col-span-[14]",
  15: "col-span-[15]",
  16: "col-span-[16]",
  17: "col-span-[17]",
  18: "col-span-[18]",
  19: "col-span-[19]",
  20: "col-span-[20]",
  21: "col-span-[21]",
  22: "col-span-[22]",
  23: "col-span-[23]",
  24: "col-span-[24]",
};

function getSpanClass(span: number): string {
  if (span >= 1 && span <= 24) return spanClasses[span] ?? "col-span-1";
  return "col-span-1";
}

/**
 * 网格子项（列表请在父级 `map` 上写 `key`）。
 */
export function GridItem(props: GridItemProps): JSX.Element {
  const {
    span = 1,
    class: classProp,
    className: classNameProp,
    children,
  } = props;
  const spanCls = getSpanClass(span);
  const extraClass = classProp ?? classNameProp ?? "";
  const combined = twMerge("min-w-0", spanCls, extraClass);
  return <div class={combined}>{children}</div>;
}
