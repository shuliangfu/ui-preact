/**
 * Select 单选（Preact）：`appearance` 在**自定义下拉**与**原生 select**之间切换。
 * - `dropdown`（默认）：有 `options` 时自绘浮层；无 `options` 时走原生 select + `children`。
 * - `native`：原生 select，加大触控区，适合移动端。
 */

import { useSignal, useSignalEffect } from "@preact/signals";
import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { IconChevronDown } from "../basic/icons/ChevronDown.tsx";
import {
  controlBlueFocusRing,
  nativeSelectSurface,
  pickerTriggerSurface,
} from "./input-focus-ring.ts";
import {
  commitMaybeSignal,
  type MaybeSignal,
  readMaybeSignal,
} from "./maybe-signal.ts";
import type { SizeVariant } from "../types.ts";

/** 与 Dropdown 共用 Esc 关闭注册键，需配合 initDropdownEsc 使用 */
const DROPDOWN_ESC_KEY = "__lastDropdownClose" as const;

/** 展示形态：`dropdown` 浮层；`native` 原生大触控 */
export type SelectAppearance = "dropdown" | "native";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  size?: SizeVariant;
  disabled?: boolean;
  options?: SelectOption[];
  /** 当前值；见 {@link MaybeSignal} */
  value?: MaybeSignal<string>;
  /** 占位选项文案（对应 value=""） */
  placeholder?: string;
  class?: string;
  onChange?: (e: Event) => void;
  name?: string;
  id?: string;
  /** 仅当未传 options 时使用：渲染原生 select，由 children 提供 option 节点 */
  children?: ComponentChildren;
  /** 为 true 时隐藏聚焦激活态边框；默认 false 显示 ring */
  hideFocusRing?: boolean;
  /**
   * `dropdown`：桌面默认同，自定义浮层。
   * `native`：原生 select + 大最小高度，便于移动触控。
   */
  appearance?: SelectAppearance;
}

/** 浮层模式下的尺寸（桌面） */
const sizeClassesDropdown: Record<SizeVariant, string> = {
  xs: "px-2.5 py-1 text-xs rounded-md",
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-3 py-2 text-sm rounded-lg",
  lg: "px-4 py-2.5 text-base rounded-lg",
};

/** 原生模式下的尺寸（移动友好最小高度） */
const sizeClassesNative: Record<SizeVariant, string> = {
  xs: "px-3 py-2 text-sm rounded-md min-h-[44px]",
  sm: "px-4 py-2.5 text-sm rounded-lg min-h-[44px]",
  md: "px-4 py-3 text-base rounded-lg min-h-[48px]",
  lg: "px-5 py-3.5 text-base rounded-lg min-h-[52px]",
};

const optionBase =
  "px-3 py-2 text-sm text-left w-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed first:rounded-t-lg last:rounded-b-lg";

/**
 * 原生 select 分支（`appearance="native"`）。
 */
function SelectNativeBranch(
  props: Omit<SelectProps, "appearance">,
): JSX.Element {
  const {
    size = "md",
    disabled = false,
    options,
    value,
    placeholder,
    class: className,
    onChange,
    name,
    id,
    children,
    hideFocusRing = false,
  } = props;
  const sizeCls = sizeClassesNative[size];
  const resolvedValue = readMaybeSignal(value) ?? "";

  /**
   * `value` 为 Signal 时在组件内写回，无需在 `onChange` 里再赋值。
   */
  const handleChange = (e: Event) => {
    commitMaybeSignal(value, (e.target as HTMLSelectElement).value);
    onChange?.(e);
  };

  return (
    <select
      id={id}
      name={name}
      value={resolvedValue}
      disabled={disabled}
      class={twMerge(
        "w-full touch-manipulation",
        nativeSelectSurface,
        controlBlueFocusRing(!hideFocusRing),
        sizeCls,
        className,
      )}
      onChange={handleChange}
    >
      {options
        ? (
          <>
            {placeholder != null && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
              >
                {opt.label}
              </option>
            ))}
          </>
        )
        : children}
    </select>
  );
}

/**
 * 自定义下拉分支（`appearance="dropdown"`）。
 */
function SelectDropdownBranch(
  props: Omit<SelectProps, "appearance">,
): JSX.Element {
  const {
    size = "md",
    disabled = false,
    options,
    value,
    placeholder,
    class: className,
    onChange,
    name,
    id,
    children,
    hideFocusRing = false,
  } = props;

  const openState = useSignal(false);
  const sizeCls = sizeClassesDropdown[size];

  /** 下拉打开时注册 Esc 关闭回调（与文档站 initDropdownEsc 配合） */
  useSignalEffect(() => {
    if (!openState.value) return;
    const g = globalThis as unknown as Record<
      string,
      (() => void) | undefined
    >;
    const close = () => {
      openState.value = false;
    };
    g[DROPDOWN_ESC_KEY] = close;
    return () => {
      if (g[DROPDOWN_ESC_KEY] === close) {
        delete g[DROPDOWN_ESC_KEY];
      }
    };
  });

  const triggerChange = (newValue: string) => {
    commitMaybeSignal(value, newValue);
    const synthetic = { target: { value: newValue } } as unknown as Event;
    onChange?.(synthetic);
    openState.value = false;
  };

  const handleBackdropClick = () => {
    openState.value = false;
  };

  /** 无 options：原生 select + children */
  if (!options) {
    const resolvedValue = readMaybeSignal(value) ?? "";
    const handleNativeChange = (e: Event) => {
      commitMaybeSignal(value, (e.target as HTMLSelectElement).value);
      onChange?.(e);
    };
    return (
      <select
        id={id}
        name={name}
        value={resolvedValue}
        disabled={disabled}
        class={twMerge(
          nativeSelectSurface,
          controlBlueFocusRing(!hideFocusRing),
          sizeCls,
          className,
        )}
        onChange={handleNativeChange}
      >
        {children}
      </select>
    );
  }

  const rv = readMaybeSignal(value);
  const currentOpt = options.find((o) => o.value === rv);
  const displayLabel = currentOpt?.label ?? (placeholder ?? "");
  const ariaLabelText = displayLabel || placeholder || "选择";

  return (
    <span
      class={twMerge(
        "relative block w-full min-w-0",
        className,
      )}
    >
      <input type="hidden" name={name} value={rv ?? ""} />
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={openState.value}
        aria-label={ariaLabelText}
        class={twMerge(
          "w-full",
          pickerTriggerSurface,
          controlBlueFocusRing(!hideFocusRing),
          sizeCls,
        )}
        onClick={() => {
          if (!disabled) openState.value = !openState.value;
        }}
      >
        <span
          class={twMerge(
            currentOpt
              ? "text-slate-900 dark:text-slate-100"
              : "text-slate-400 dark:text-slate-500",
          )}
        >
          {displayLabel}
        </span>
        <span
          class={twMerge(
            "inline-flex shrink-0 text-slate-400 dark:text-slate-500 transition-transform",
            openState.value && "rotate-180",
          )}
        >
          <IconChevronDown size="sm" />
        </span>
      </button>
      {openState.value && (
        <>
          <div
            key="select-dd-backdrop"
            class="fixed inset-0 z-40"
            aria-hidden
            onClick={handleBackdropClick}
          />
          <div
            key="select-dd-list"
            role="listbox"
            aria-activedescendant={currentOpt?.value}
            class="absolute z-50 top-full left-0 right-0 mt-1 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg max-h-60 overflow-auto"
          >
            {placeholder != null && (
              <button
                type="button"
                role="option"
                aria-selected={!rv}
                class={twMerge(
                  optionBase,
                  !rv &&
                    "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
                )}
                onClick={() => triggerChange("")}
              >
                {placeholder}
              </button>
            )}
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={rv === opt.value}
                disabled={opt.disabled}
                class={twMerge(
                  optionBase,
                  rv === opt.value &&
                    "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
                )}
                onClick={() => !opt.disabled && triggerChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </span>
  );
}

/**
 * 单选下拉：默认浮层；`appearance="native"` 时走原生大触控 select。
 */
export function Select(props: SelectProps): JSX.Element {
  const { appearance = "dropdown", ...rest } = props;
  if (appearance === "native") {
    return SelectNativeBranch(rest);
  }
  return SelectDropdownBranch(rest);
}
