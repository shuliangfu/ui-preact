/**
 * Button 基础组件（Preact）。
 * 使用 Tailwind v4 类名，支持 light/dark 主题（需应用层在根节点使用 .dark 切换）。
 */

import { createContext } from "preact";
import type { ComponentChildren, JSX } from "preact";
import { useContext } from "preact/hooks";
import { twMerge } from "tailwind-merge";
import type { ColorVariant, SizeVariant } from "../types.ts";
import {
  BUTTON_GROUP_CHILD_BASE,
  BUTTON_SIZE_CLASSES,
  BUTTON_STANDALONE_INTERACTIVE_BASE,
  BUTTON_VARIANT_CLASSES,
  BUTTON_VARIANT_GROUP_FOCUS_ACTIVE,
} from "./button-variants.ts";

export interface ButtonProps {
  /**
   * 列表等场景下的稳定标识，写到原生 `data-key` 上便于调试与 E2E 选择器。
   * 勿与 JSX 的 `key={...}` 混淆： reconciler 的 key 写在标签上即可，不必传本属性。
   */
  itemKey?: string | number;
  /** 语义变体，对应 shared ColorVariant */
  variant?: ColorVariant;
  /** 尺寸，对应 shared SizeVariant */
  size?: SizeVariant;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 原生 type */
  type?: "button" | "submit" | "reset";
  /** 额外 class，与 Tailwind 合并 */
  class?: string;
  /** 点击回调 */
  onClick?: (e: Event) => void;
  /** 子节点（文案或图标等） */
  children?: ComponentChildren;
}

/** 默认不在任何 ButtonGroup 内；Provider 注入 { attached: true } 时子级 Button 切换为组内样式 */
const ButtonGroupContext = createContext<{ attached: boolean }>({
  attached: false,
});

/** ButtonGroup 容器 props（与 {@link Button} 同文件）。 */
export interface ButtonGroupProps {
  /** 是否紧凑相连（默认 true：中间无间隙、仅首尾圆角；false 时保留间距） */
  attached?: boolean;
  /** 额外 class，与 Tailwind 合并 */
  class?: string;
  /** 子节点（通常为多个 {@link Button}） */
  children?: ComponentChildren;
}

/**
 * 按钮组容器：横向排列多个按钮。
 * - `attached` 时下面 `class` 直接写 Tailwind，只负责子项圆角与相邻边框；焦点/按下样式由子级 {@link Button} 通过 Context 自行合并。
 * - 勿用模块级变量传递「是否在组内」，请始终用本组件 + Provider。
 */
export function ButtonGroup(props: ButtonGroupProps): JSX.Element {
  const { attached = true, class: className, children } = props;
  return (
    <ButtonGroupContext.Provider value={{ attached }}>
      <div
        class={twMerge(
          "inline-flex items-center",
          attached
            ? "gap-0 [&>*:first-child]:rounded-tr-none! [&>*:first-child]:rounded-br-none! [&>*:last-child]:rounded-tl-none! [&>*:last-child]:rounded-bl-none! [&>*:not(:first-child):not(:last-child)]:rounded-none! [&>*:not(:last-child)]:border-r-0!"
            : "gap-2",
          className,
        )}
        role="group"
      >
        {children}
      </div>
    </ButtonGroupContext.Provider>
  );
}

export function Button(props: ButtonProps): JSX.Element {
  const {
    itemKey,
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    type = "button",
    class: className,
    onClick,
    children,
  } = props;

  const { attached: inAttachedGroup } = useContext(ButtonGroupContext);

  /** 默认带蓝色焦点环；在紧凑组内去掉 ring，改由 variant 的 focus/active 背景提示 */
  const base = inAttachedGroup
    ? BUTTON_GROUP_CHILD_BASE
    : BUTTON_STANDALONE_INTERACTIVE_BASE;

  const sizeCls = BUTTON_SIZE_CLASSES[size];
  const variantCls = BUTTON_VARIANT_CLASSES[variant];
  const groupFocusCls = inAttachedGroup
    ? BUTTON_VARIANT_GROUP_FOCUS_ACTIVE[variant]
    : "";

  return (
    <button
      type={type}
      class={twMerge(
        base,
        sizeCls,
        variantCls,
        groupFocusCls,
        /**
         * `loading` 时原生 `disabled` 会命中 `disabled:*` 灰阶样式；覆盖以保持 primary/danger 等主色，
         * 与「纯禁用」灰按钮区分（仍 `pointer-events-none` 不可点）。
         */
        loading &&
          "disabled:opacity-100 disabled:grayscale-0 disabled:saturate-100",
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading ? true : undefined}
      onClick={onClick}
      data-variant={variant}
      data-loading={loading ? "" : undefined}
      data-key={itemKey !== undefined ? String(itemKey) : undefined}
    >
      {loading && (
        <svg
          class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
