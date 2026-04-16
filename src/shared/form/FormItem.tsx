/**
 * FormItem 表单项包装（Preact）。
 * 提供标签、必填星号、错误提示；支持标签在上方或左侧，左侧时可左对齐/右对齐。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";

/** 标签位置：上方（默认）或左侧 */
export type FormItemLabelPosition = "top" | "left";

/** 标签对齐（仅 labelPosition=left 时有效）：左对齐或右对齐 */
export type FormItemLabelAlign = "left" | "right";

export interface FormItemProps {
  /** 表单项标签 */
  label?: string;
  /** 是否必填（默认会显示红色 *；若只想语义必填、不显示星号，见 `hideRequiredMark`） */
  required?: boolean;
  /**
   * 为 true 时不渲染标签旁的红色 *，即使 `required` 为 true。
   */
  hideRequiredMark?: boolean;
  /** 错误文案（展示在下方并给容器加 error 样式） */
  error?: string;
  /** 标签位置：上方 或 左侧 */
  labelPosition?: FormItemLabelPosition;
  /** 标签对齐（仅当 labelPosition=left 时有效）：左对齐 / 右对齐 */
  labelAlign?: FormItemLabelAlign;
  /** 额外 class（作用于容器） */
  class?: string;
  /** 关联控件的 id（label for、子控件需同 id） */
  id?: string;
  /**
   * 与主控件同一行、排在输入区域右侧（如 FormList 的「删除」）。
   */
  trailing?: ComponentChildren;
  /** 子控件（单个输入组件等） */
  children?: ComponentChildren;
}

/** text-sm + leading-5 与下方星号容器 h-5 一致 */
const labelBaseCls =
  "text-sm font-medium leading-5 text-slate-700 dark:text-slate-300";
const labelTopCls = "mb-1 flex items-center gap-1";
const labelLeftCls = "flex w-28 min-w-[7rem] shrink-0 items-center gap-1";
const labelAlignLeftCls = "justify-start";
const labelAlignRightCls = "justify-end";
const labelTextCls = "shrink-0 leading-5";
const requiredOuterCls =
  "inline-flex h-5 shrink-0 items-center justify-center text-red-500 dark:text-red-400";
const requiredMarkCls = "relative top-[0.1em] text-sm font-medium leading-none";
const errorCls = "mt-1 text-sm text-red-600 dark:text-red-400";

/**
 * 单字段布局：标签 + 控件 + 可选 trailing + 错误文案。
 */
export function FormItem(props: FormItemProps): JSX.Element {
  const {
    label,
    required = false,
    hideRequiredMark = false,
    error,
    labelPosition = "top",
    labelAlign = "left",
    class: className,
    id,
    trailing,
    children,
  } = props;

  const hasError = Boolean(error);
  const isLeft = labelPosition === "left";
  const hasTrailing = trailing != null && trailing !== false;
  const showRequiredAsterisk = required && !hideRequiredMark;

  const labelEl = label != null
    ? (
      <label
        for={id}
        class={twMerge(
          labelBaseCls,
          isLeft
            ? twMerge(
              labelLeftCls,
              labelAlign === "right" ? labelAlignRightCls : labelAlignLeftCls,
            )
            : labelTopCls,
        )}
      >
        <span class={labelTextCls}>{label}</span>
        {showRequiredAsterisk && (
          <span class={requiredOuterCls} aria-hidden="true">
            <span class={requiredMarkCls}>*</span>
          </span>
        )}
      </label>
    )
    : null;

  return (
    <div
      class={twMerge(
        "flex flex-col my-3",
        hasError &&
          "[&_input]:border-red-500 [&_textarea]:border-red-500 dark:[&_input]:border-red-500 dark:[&_textarea]:border-red-500",
        className,
      )}
      role={hasError ? "alert" : undefined}
    >
      {isLeft && labelEl != null
        ? (
          <div class="flex flex-row items-center gap-4 py-0.5 min-w-0">
            {labelEl}
            <div
              class={twMerge(
                "flex min-w-0 flex-row flex-wrap items-center gap-1.5",
                hasTrailing ? "max-w-md flex-1" : "flex-1",
              )}
            >
              <div class="form-item-input min-w-0 flex-1">{children}</div>
              {hasTrailing && (
                <div class="form-item-trailing shrink-0">{trailing}</div>
              )}
            </div>
          </div>
        )
        : (
          <>
            {labelEl}
            <div
              class={twMerge(
                "flex min-w-0 flex-row flex-wrap items-center gap-1.5",
                hasTrailing && "w-full max-w-md",
              )}
            >
              <div class="form-item-input min-w-0 flex-1">{children}</div>
              {hasTrailing && (
                <div class="form-item-trailing shrink-0">{trailing}</div>
              )}
            </div>
          </>
        )}
      {error != null && error !== "" && (
        <div class={errorCls} id={id ? `${id}-error` : undefined}>
          {error}
        </div>
      )}
    </div>
  );
}
