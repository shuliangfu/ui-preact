/**
 * Timeline 时间轴（Preact）。
 * 流程、动态；支持左右/交替、自定义节点、颜色、pending。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import type { ColorVariant } from "../types.ts";

export interface TimelineItemProps {
  /** 唯一 key */
  key?: string;
  /** 节点颜色/语义 */
  color?: ColorVariant | "gray";
  /** 自定义节点（圆点）内容；不传则用默认圆点 */
  dot?: ComponentChildren;
  /** 时间/标签（左侧或上方） */
  label?: ComponentChildren;
  /** 主内容 */
  children?: ComponentChildren;
  /** 是否待定（灰色、虚线） */
  pending?: boolean;
}

export interface TimelineProps {
  /** 时间轴项 */
  items: TimelineItemProps[];
  /** 模式：left 标签在左，right 标签在右，alternate 交替 */
  mode?: "left" | "right" | "alternate";
  /** 是否最后一项为 pending 样式 */
  pending?: boolean;
  /** 额外 class */
  class?: string;
  /** 单项 class */
  itemClass?: string;
}

const colorClasses: Record<ColorVariant | "gray", string> = {
  default: "bg-slate-400 dark:bg-slate-500",
  primary: "bg-blue-500 dark:bg-blue-400",
  secondary: "bg-slate-500 dark:bg-slate-400",
  success: "bg-green-500 dark:bg-green-400",
  warning: "bg-amber-500 dark:bg-amber-400",
  danger: "bg-red-500 dark:bg-red-400",
  ghost: "bg-slate-300 dark:bg-slate-600",
  gray: "bg-slate-300 dark:bg-slate-600",
};

/**
 * Timeline：垂直时间轴。
 */
export function Timeline(props: TimelineProps): JSX.Element {
  const {
    items,
    mode = "left",
    pending: listPending = false,
    class: className,
    itemClass,
  } = props;

  const axisOnRight = mode === "right" || mode === "alternate";

  return (
    <div
      class={twMerge(
        "timeline relative flex flex-col",
        (mode === "right" || mode === "alternate") &&
          "w-max max-w-full ml-auto",
        className,
      )}
    >
      <div
        class={twMerge(
          "absolute top-3 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-600 pointer-events-none",
          mode === "left" && "left-[5px]",
          axisOnRight && "right-[5px]",
        )}
        aria-hidden
      />
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isPending = item.pending ?? (listPending && isLast);
        const color = item.color ?? "primary";
        const dotCls = twMerge(
          "shrink-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 shadow relative z-[1]",
          isPending ? "bg-slate-200 dark:bg-slate-600" : colorClasses[color],
        );
        const textAlignRight = mode === "right" ||
          (mode === "alternate" && index % 2 === 1);

        return (
          <div
            key={item.key ?? index}
            class={twMerge(
              "flex gap-3 relative",
              mode === "left" && "flex-row",
              axisOnRight && "flex-row-reverse justify-start",
              !isLast && "pb-6",
              itemClass,
            )}
          >
            <div class="relative flex flex-col items-center self-stretch">
              <div class={dotCls}>{item.dot}</div>
            </div>
            <div
              class={twMerge(
                mode === "left" && "flex-1 min-w-0",
                axisOnRight && "shrink-0",
                textAlignRight && "text-right",
              )}
            >
              {item.label != null && (
                <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  {item.label}
                </div>
              )}
              <div class="text-sm text-slate-700 dark:text-slate-300">
                {item.children}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
