/**
 * Segmented 分段控制器（Preact）。
 * 多选一紧凑展示；受控/非受控；非受控用 `useSignal` 存选中值。
 */

import type { JSX } from "preact";
import { useSignal } from "@preact/signals";
import { twMerge } from "tailwind-merge";
import type { SizeVariant } from "../types.ts";

export interface SegmentedOption<T = string> {
  /** 选项值 */
  value: T;
  /** 显示文案或节点 */
  label: string | JSX.Element | JSX.Element[];
  /** 是否禁用 */
  disabled?: boolean;
}

export interface SegmentedProps<T = string> {
  /** 选项列表（与 children 二选一） */
  options?: SegmentedOption<T>[];
  /** 当前选中的值（受控）；可传 getter */
  value?: T | (() => T);
  /** 变更回调 */
  onChange?: (value: T) => void;
  /** 是否块级撑满 */
  block?: boolean;
  /** 尺寸 */
  size?: SizeVariant;
  /** 是否禁用整组 */
  disabled?: boolean;
  /** 子节点（自定义每段内容） */
  children?: JSX.Element | JSX.Element[] | null;
  /**
   * 预留：与 ui-view 一致；若需跨父级重挂载保留非受控值，可在外层用 `key={stateKey}` 强制重挂载本组件。
   */
  stateKey?: string;
  /** 额外 class */
  class?: string;
}

const sizeClasses: Record<SizeVariant, string> = {
  xs: "text-xs px-2 py-1",
  sm: "text-sm px-2.5 py-1.5",
  md: "text-sm px-3 py-2",
  lg: "text-base px-4 py-2.5",
};

/**
 * Segmented：分段单选。
 */
export function Segmented<T extends string = string>(
  props: SegmentedProps<T>,
): JSX.Element | null {
  const {
    options,
    value: valueProp,
    onChange,
    block = false,
    size = "md",
    disabled = false,
    children,
    class: className,
  } = props;

  const selectedCls =
    "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm";
  const unselectedCls =
    "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200";

  const baseCls =
    "inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600";

  const uncontrolledValRef = useSignal<unknown>(
    typeof valueProp === "function"
      ? (valueProp as () => T)()
      : valueProp ?? null,
  );

  if (children != null) {
    return (
      <div
        class={twMerge(
          baseCls,
          block && "w-full",
          disabled && "opacity-60 pointer-events-none",
          className,
        )}
        role="group"
        aria-label="分段选择"
      >
        {children}
      </div>
    );
  }

  if (options == null || options.length === 0) {
    return null;
  }

  const getDisplayValue = (): T | null => {
    if (valueProp === undefined) return uncontrolledValRef.value as T | null;
    return (typeof valueProp === "function"
      ? (valueProp as () => T)()
      : valueProp) as T | null;
  };

  const handleSelect = (v: T) => {
    if (valueProp === undefined) uncontrolledValRef.value = v;
    onChange?.(v);
  };

  return (
    <div
      class={twMerge(
        baseCls,
        block && "w-full flex",
        !block && "inline-flex",
        disabled && "opacity-60 pointer-events-none",
        className,
      )}
      role="tablist"
      aria-label="分段选择"
    >
      {options.map((opt) => {
        const isSelected = getDisplayValue() === opt.value;
        const isDisabled = disabled || opt.disabled;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="tab"
            aria-selected={isSelected}
            data-value={opt.value}
            data-disabled={isDisabled ? "true" : undefined}
            disabled={isDisabled}
            class={twMerge(
              "shrink-0 rounded-md font-medium transition-colors",
              sizeClasses[size],
              isSelected ? selectedCls : unselectedCls,
              isDisabled && "cursor-not-allowed opacity-60",
              block && "flex-1",
            )}
            onClick={() => {
              if (isDisabled) return;
              handleSelect(opt.value);
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
