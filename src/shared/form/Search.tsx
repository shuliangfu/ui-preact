/**
 * Search 搜索框（Preact）。
 * 基于 Input type="search"，支持占位、有内容时显示清除按钮、onSearch 时右侧搜索按钮；隐藏浏览器原生 hover 清除图标。
 */

import type { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { IconSearch } from "../basic/icons/Search.tsx";
import type { SizeVariant } from "../types.ts";
import { controlBlueFocusRing } from "./input-focus-ring.ts";
import { commitMaybeSignal, type MaybeSignal } from "./maybe-signal.ts";

export interface SearchProps {
  /** 尺寸 */
  size?: SizeVariant;
  /** 是否禁用 */
  disabled?: boolean;
  /** 为 true 时隐藏聚焦激活态边框（输入框与侧栏按钮）；默认 false 显示 */
  hideFocusRing?: boolean;
  /** 占位文案 */
  placeholder?: string;
  /** 输入值（受控可选）；见 {@link MaybeSignal} */
  value?: MaybeSignal<string>;
  /** 额外 class（作用于包裹容器） */
  class?: string;
  /** 输入回调 */
  onInput?: (e: Event) => void;
  /** 变更回调 */
  onChange?: (e: Event) => void;
  /** 失焦回调 */
  onBlur?: (e: Event) => void;
  /** 聚焦回调 */
  onFocus?: (e: Event) => void;
  /** 键盘按下（在内置「回车触发 onSearch」逻辑之前调用） */
  onKeyDown?: (e: Event) => void;
  /** 键盘抬起 */
  onKeyUp?: (e: Event) => void;
  /** 点击输入区域 */
  onClick?: (e: Event) => void;
  /** 粘贴 */
  onPaste?: (e: Event) => void;
  /** 搜索回调（回车或点击搜索时） */
  onSearch?: (value: string) => void;
  /** 原生 name */
  name?: string;
  /** 原生 id */
  id?: string;
}

const sizeClasses: Record<SizeVariant, string> = {
  xs: "px-2.5 py-1 pl-8 text-xs rounded-md",
  sm: "px-3 py-1.5 pl-9 text-sm rounded-md",
  md: "px-3 py-2 pl-9 text-sm rounded-lg",
  lg: "px-4 py-2.5 pl-10 text-base rounded-lg",
};

const inputSurface =
  "border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

const btnSurface =
  "absolute top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none disabled:opacity-50";

/** 清除按钮显隐由 CSS :has 控制，避免在组件内读 value 订阅导致失焦 */
const clearBtnVisibleCls =
  "search-clear-btn hidden [.search-wrapper:has(input:not(:placeholder-shown))_.search-clear-btn]:inline-flex";

/**
 * 搜索输入 + 可选搜索按钮 + 清除。
 */
export function Search(props: SearchProps): JSX.Element {
  const {
    size = "md",
    disabled = false,
    placeholder = "搜索…",
    value,
    class: className,
    onInput,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    onClick,
    onPaste,
    onSearch,
    name,
    id,
    hideFocusRing = false,
  } = props;

  const sizeCls = sizeClasses[size];

  const handleInput = (e: Event) => {
    commitMaybeSignal(value, (e.target as HTMLInputElement).value);
    onInput?.(e);
  };

  const handleChange = (e: Event) => {
    commitMaybeSignal(value, (e.target as HTMLInputElement).value);
    onChange?.(e);
  };

  const handleClear = () => {
    commitMaybeSignal(value, "");
    const synthetic = { target: { value: "" } } as unknown as Event;
    handleChange(synthetic);
    handleInput(synthetic);
  };

  return (
    <span
      class={twMerge(
        "search-wrapper relative inline-block w-full max-w-xs",
        className,
      )}
    >
      <span
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        aria-hidden="true"
      >
        <svg
          class="size-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </span>
      <input
        type="search"
        id={id}
        name={name}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        class={twMerge(
          "w-full",
          inputSurface,
          controlBlueFocusRing(!hideFocusRing),
          sizeCls,
          onSearch ? "pr-20" : "pr-9",
          "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:[-webkit-appearance:none]",
        )}
        onInput={handleInput}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyUp={onKeyUp}
        onClick={onClick}
        onPaste={onPaste}
        onKeyDown={(e: Event) => {
          onKeyDown?.(e);
          if (e.defaultPrevented) return;
          const ev = e as KeyboardEvent;
          if (ev.key === "Enter" && onSearch && ev.target) {
            onSearch((ev.target as HTMLInputElement).value);
          }
        }}
      />
      <button
        type="button"
        class={twMerge(
          btnSurface,
          controlBlueFocusRing(!hideFocusRing),
          clearBtnVisibleCls,
          onSearch ? "right-10" : "right-2",
        )}
        disabled={disabled}
        aria-label="清除"
        onClick={handleClear}
      >
        <svg
          class="size-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      {onSearch && (
        <button
          type="button"
          class={twMerge(
            btnSurface,
            controlBlueFocusRing(!hideFocusRing),
            "right-2",
          )}
          disabled={disabled}
          aria-label="搜索"
          onClick={(e: Event) => {
            const input = (e.currentTarget as HTMLElement).parentElement
              ?.querySelector("input") as HTMLInputElement | null;
            if (input) onSearch(input.value);
          }}
        >
          <IconSearch size="sm" class="text-blue-600 dark:text-blue-400" />
        </button>
      )}
    </span>
  );
}
