/**
 * Stack 垂直/水平堆叠（Preact）。
 * 基于 flex；支持 direction、gap、align、justify、wrap。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";

export type StackDirection =
  | "row"
  | "column"
  | "row-reverse"
  | "column-reverse";
export type StackAlign = "start" | "end" | "center" | "stretch" | "baseline";
export type StackJustify =
  | "start"
  | "end"
  | "center"
  | "between"
  | "around"
  | "evenly";

export interface StackProps {
  /** 方向，默认 "column" */
  direction?: StackDirection;
  /** 间距（Tailwind 值如 2、4），默认 4 */
  gap?: number | string;
  /** 交叉轴对齐 */
  align?: StackAlign;
  /** 主轴对齐 */
  justify?: StackJustify;
  /** 是否换行，默认 false */
  wrap?: boolean;
  /** 是否内联 flex（inline-flex），默认 false */
  inline?: boolean;
  /** 额外 class */
  class?: string;
  /** 子节点 */
  children?: ComponentChildren;
}

const alignClasses: Record<StackAlign, string> = {
  start: "items-start",
  end: "items-end",
  center: "items-center",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const justifyClasses: Record<StackJustify, string> = {
  start: "justify-start",
  end: "justify-end",
  center: "justify-center",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

const directionClasses: Record<StackDirection, string> = {
  row: "flex-row",
  column: "flex-col",
  "row-reverse": "flex-row-reverse",
  "column-reverse": "flex-col-reverse",
};

/**
 * Flex 堆叠容器。
 */
export function Stack(props: StackProps): JSX.Element {
  const {
    direction = "column",
    gap = 4,
    align,
    justify,
    wrap = false,
    inline = false,
    class: className,
    children,
  } = props;

  const gapNum = typeof gap === "number" ? gap : Number(gap);
  const gapMap: Record<number, string> = {
    0: "gap-0",
    1: "gap-1",
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    5: "gap-5",
    6: "gap-6",
    8: "gap-8",
    10: "gap-10",
    12: "gap-12",
  };
  const gapSafe = typeof gapNum === "number" && gapMap[gapNum] != null
    ? gapMap[gapNum]
    : "gap-4";

  return (
    <div
      class={twMerge(
        inline ? "inline-flex" : "flex",
        directionClasses[direction],
        gapSafe,
        align != null && alignClasses[align],
        justify != null && justifyClasses[justify],
        wrap && "flex-wrap",
        className,
      )}
    >
      {children}
    </div>
  );
}
