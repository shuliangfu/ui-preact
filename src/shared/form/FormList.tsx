/**
 * FormList 动态表单项（Preact）。
 * 用于动态增减表单项；由父组件持有列表数据，通过 items + onAdd + onRemove 受控。
 *
 * 删除与输入同一水平线时：将 {@link FormListRenderRowContext.removeButton} 赋给 {@link FormItemProps.trailing}。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";

/** FormList 内置文案 */
export interface FormListMessages {
  /** 新增按钮默认文案；与 {@link FormListProps.addButtonText} 同义，后者优先 */
  addButton: string;
  /** 行尾删除按钮的可见文字 */
  remove: string;
  /** 删除按钮 `aria-label`，参数为该行序号（1-based） */
  removeRow: (index: number) => string;
  /** 整个 FormList 容器 `aria-label` */
  list: string;
}

/** 默认中文文案 */
export const defaultFormListMessages: FormListMessages = {
  addButton: "添加一项",
  remove: "删除",
  removeRow: (index) => `删除第 ${index} 项`,
  list: "动态列表",
};

/** `renderRow` 第二参数：由 FormList 注入 */
export interface FormListRenderRowContext {
  /**
   * 在传了 `onRemove` 时为删除按钮；否则为 `null`。
   */
  removeButton: ComponentChildren | null;
}

export interface FormListProps {
  /** 当前列表项数量或项列表；若为 number 则仅用于长度，每行用 index 区分 */
  items: unknown[] | number;
  /** 新增一项时回调 */
  onAdd?: () => void;
  /** 移除指定索引项时回调 */
  onRemove?: (index: number) => void;
  /** 新增按钮文案 */
  addButtonText?: string;
  /** 额外 class（作用于容器） */
  class?: string;
  /**
   * 按行索引渲染内容；第二参数含 `removeButton` 时请赋给 FormItem `trailing`。
   */
  renderRow?: (
    index: number,
    ctx: FormListRenderRowContext,
  ) => ComponentChildren;
  /** 无 `renderRow` 时：每行挂载同一套子树 */
  children?: ComponentChildren;
  /** 多语言/自定义文案；未传字段走 {@link defaultFormListMessages} */
  messages?: Partial<FormListMessages>;
}

const wrapCls = "flex flex-col gap-3";
const rowCls = "flex flex-row flex-wrap items-end justify-start gap-2";
const rowMainCls = "min-w-0 w-fit max-w-full";
const renderRowWrapCls = "min-w-0 max-w-full";

const removeBtnCls =
  "inline-flex shrink-0 items-center px-2 py-1 text-sm leading-5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 rounded focus:outline-hidden focus:ring-2 focus:ring-red-500 disabled:opacity-50";

/**
 * 构建单行删除按钮。
 *
 * @param index - 行索引（从 0 起）
 * @param onRemove - 删除回调
 * @param messages - 已合并默认值的文案
 */
function removeButtonForRow(
  index: number,
  onRemove: (i: number) => void,
  messages: FormListMessages,
): ComponentChildren {
  return (
    <button
      type="button"
      class={removeBtnCls}
      onClick={() => onRemove(index)}
      aria-label={messages.removeRow(index + 1)}
    >
      {messages.remove}
    </button>
  );
}

/**
 * 动态行列表 + 可选「添加一项」。
 */
export function FormList(props: FormListProps): JSX.Element {
  const {
    items,
    onAdd,
    onRemove,
    class: className,
    children,
    renderRow: renderRowProp,
    messages,
  } = props;

  /** 合并默认中文文案与外部传入 messages */
  const m = { ...defaultFormListMessages, ...messages };
  const addButtonText = props.addButtonText ?? m.addButton;

  const length = typeof items === "number" ? items : items.length;

  return (
    <div class={twMerge(wrapCls, className)} role="group" aria-label={m.list}>
      {Array.from({ length }, (_, index) => {
        const removeButton: ComponentChildren | null = onRemove != null
          ? removeButtonForRow(index, onRemove, m)
          : null;

        if (renderRowProp != null) {
          return (
            <div key={index} class={renderRowWrapCls}>
              {renderRowProp(index, { removeButton })}
            </div>
          );
        }

        return (
          <div key={index} class={rowCls}>
            <div class={rowMainCls}>{children}</div>
            {removeButton}
          </div>
        );
      })}
      {onAdd != null && (
        <button
          type="button"
          class="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-hidden focus:ring-2 focus:ring-blue-500 rounded px-0"
          onClick={onAdd}
        >
          {addButtonText}
        </button>
      )}
    </div>
  );
}
