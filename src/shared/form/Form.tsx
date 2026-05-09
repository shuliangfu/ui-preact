/**
 * Form 表单容器（Preact）。
 * 提供布局（vertical / horizontal / inline）、提交回调；与 FormItem 组合使用。
 * 可通过 `size` 为内部未显式指定尺寸的控件统一注入默认规格（见 {@link FormControlSizeContext}）。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import type { SizeVariant } from "../types.ts";
import { FormControlSizeContext } from "./form-control-context.ts";

export type FormLayout = "vertical" | "horizontal" | "inline";

export interface FormProps {
  /** 布局：垂直堆叠 / 水平标签 / 行内 */
  layout?: FormLayout;
  /**
   * 子级 Input / Select / Button 等未传 `size` 时采用的尺寸，默认 `md`。
   */
  size?: SizeVariant;
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
  const {
    layout = "vertical",
    size = "md",
    onSubmit,
    class: className,
    children,
  } = props;
  const layoutCls = layoutClasses[layout];
  return (
    <FormControlSizeContext.Provider value={size}>
      <form
        class={twMerge(layoutCls, className)}
        onSubmit={(e: Event) => {
          e.preventDefault();
          onSubmit?.(e);
        }}
      >
        {children}
      </form>
    </FormControlSizeContext.Provider>
  );
}
