/**
 * Divider 分割线（Preact）。
 * 水平或垂直；可选虚线、可选中间文案（orientation：left/right/center）。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";

export type DividerOrientation = "left" | "right" | "center";

export interface DividerProps {
  /** 水平 或 垂直，默认 "horizontal" */
  type?: "horizontal" | "vertical";
  /** 是否虚线，默认 false */
  dashed?: boolean;
  /** 中间文案时的对齐，默认 "center" */
  orientation?: DividerOrientation;
  /** 中间文案（可选） */
  children?: ComponentChildren;
  /** 额外 class */
  class?: string;
}

/**
 * 分割线组件。
 */
export function Divider(props: DividerProps): JSX.Element {
  const {
    type = "horizontal",
    dashed = false,
    orientation = "center",
    children,
    class: className,
  } = props;

  if (type === "vertical") {
    return (
      <span
        role="separator"
        aria-orientation="vertical"
        class={twMerge(
          "inline-block w-px min-h-4 self-stretch shrink-0",
          dashed
            ? "border-l border-dashed border-slate-200 dark:border-slate-600"
            : "bg-slate-200 dark:bg-slate-600",
          className,
        )}
      />
    );
  }

  const hasLabel = children != null;
  const lineCls = twMerge(
    "flex-1 border-t border-slate-200 dark:border-slate-600",
    dashed && "border-dashed",
  );
  const labelCls = "shrink-0 px-4 text-sm text-slate-500 dark:text-slate-400";

  const renderWithLabel = () => {
    if (orientation === "left") {
      return (
        <>
          <span class={labelCls}>{children}</span>
          <span class={lineCls} />
        </>
      );
    }
    if (orientation === "right") {
      return (
        <>
          <span class={lineCls} />
          <span class={labelCls}>{children}</span>
        </>
      );
    }
    return (
      <>
        <span class={lineCls} />
        <span class={labelCls}>{children}</span>
        <span class={lineCls} />
      </>
    );
  };

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      class={twMerge("flex items-center w-full my-4", className)}
    >
      {hasLabel ? renderWithLabel() : (
        <span
          class={twMerge(
            "w-full border-t border-slate-200 dark:border-slate-600",
            dashed && "border-dashed",
          )}
        />
      )}
    </div>
  );
}
