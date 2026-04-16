/**
 * FormList 动态表单项（Preact）。
 * 用于动态增减表单项；由父组件持有列表数据，通过 items + onAdd + onRemove 受控。
 *
 * 删除与输入同一水平线时：将 {@link FormListRenderRowContext.removeButton} 赋给 {@link FormItemProps.trailing}。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";

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
}

const wrapCls = "flex flex-col gap-3";
const rowCls = "flex flex-row flex-wrap items-end justify-start gap-2";
const rowMainCls = "min-w-0 w-fit max-w-full";
const renderRowWrapCls = "min-w-0 max-w-full";

const removeBtnCls =
  "inline-flex shrink-0 items-center px-2 py-1 text-sm leading-5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50";

/**
 * 构建单行删除按钮。
 *
 * @param index - 行索引（从 0 起）
 * @param onRemove - 删除回调
 */
function removeButtonForRow(
  index: number,
  onRemove: (i: number) => void,
): ComponentChildren {
  return (
    <button
      type="button"
      class={removeBtnCls}
      onClick={() => onRemove(index)}
      aria-label={`删除第 ${index + 1} 项`}
    >
      删除
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
    addButtonText = "添加一项",
    class: className,
    children,
    renderRow: renderRowProp,
  } = props;

  const length = typeof items === "number" ? items : items.length;

  return (
    <div class={twMerge(wrapCls, className)} role="group" aria-label="动态列表">
      {Array.from({ length }, (_, index) => {
        const removeButton: ComponentChildren | null = onRemove != null
          ? removeButtonForRow(index, onRemove)
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
          class="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-0"
          onClick={onAdd}
        >
          {addButtonText}
        </button>
      )}
    </div>
  );
}
