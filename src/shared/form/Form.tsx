/**
 * Form 表单容器（Preact）。
 * 提供布局（vertical / horizontal / inline）、提交回调；与 FormItem 组合使用。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";

export type FormLayout = "vertical" | "horizontal" | "inline";

export interface FormProps {
  /** 布局：垂直堆叠 / 水平标签 / 行内 */
  layout?: FormLayout;
  /** 提交回调（阻止默认提交，由调用方处理） */
  onSubmit?: (e: Event) => void;
  /** 额外 class（作用于 form） */
  class?: string;
  /** 表单项等子节点 */
  children?: ComponentChildren;
}

const layoutClasses: Record<FormLayout, string> = {
  vertical: "flex flex-col gap-4",
  horizontal: "flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start",
  inline: "flex flex-wrap items-end gap-x-4 gap-y-2",
};

/**
 * 表单根节点：阻止默认提交并回调 `onSubmit`。
 */
export function Form(props: FormProps): JSX.Element {
  const { layout = "vertical", onSubmit, class: className, children } = props;
  const layoutCls = layoutClasses[layout];
  return (
    <form
      class={twMerge(layoutCls, className)}
      onSubmit={(e: Event) => {
        e.preventDefault();
        onSubmit?.(e);
      }}
    >
      {children}
    </form>
  );
}
