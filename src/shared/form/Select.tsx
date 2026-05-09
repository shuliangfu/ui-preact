/**
 * Select 单选（Preact）：**仅**自绘下拉，不渲染原生 `<select>`。
 * 须通过 {@link SelectProps.options} 传入选项。
 */

import { useSignal, useSignalEffect } from "@preact/signals";
import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { IconChevronDown } from "../basic/icons/ChevronDown.tsx";
import {
  controlBlueFocusRing,
  pickerTriggerSurface,
} from "./input-focus-ring.ts";
import { resolveFormControlSize } from "./form-control-context.ts";
import {
  commitMaybeSignal,
  type MaybeSignal,
  readMaybeSignal,
} from "./maybe-signal.ts";
import type { SizeVariant } from "../types.ts";

/** 与 Dropdown 共用 Esc 关闭注册键，需配合 initDropdownEsc 使用 */
const DROPDOWN_ESC_KEY = "__lastDropdownClose" as const;

/** 保留类型别名；仅支持自绘下拉 */
export type SelectAppearance = "dropdown";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Select 内置文案。
 */
export interface SelectMessages {
  /** 触发按钮 `aria-label` 的兜底文案（无选中、无 placeholder 时使用） */
  triggerFallback: string;
}

/** 默认中文文案 */
export const defaultSelectMessages: SelectMessages = {
  triggerFallback: "选择",
};

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
  /**
   * 已废弃：不再支持通过 children 挂载原生 `<option>`。
   * 请改用 {@link SelectProps.options}。
   */
  children?: ComponentChildren;
  /** 为 true 时隐藏聚焦激活态边框；默认 false 显示 ring */
  hideFocusRing?: boolean;
  /** @deprecated 已无其它形态，可省略 */
  appearance?: SelectAppearance;
  /** 多语言/自定义文案；未传字段走 {@link defaultSelectMessages} */
  messages?: Partial<SelectMessages>;
}

/** 浮层模式下的尺寸 */
const sizeClassesDropdown: Record<SizeVariant, string> = {
  xs: "px-2.5 py-1 text-xs rounded-md",
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-3 py-2 text-sm rounded-lg",
  lg: "px-4 py-2.5 text-base rounded-lg",
};

const optionBase =
  "px-3 py-2 text-sm text-left w-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed first:rounded-t-lg last:rounded-b-lg";

/**
 * 自绘下拉分支：`button` + `hidden input` + `listbox`；打开时注册 Esc 关闭（{@link DROPDOWN_ESC_KEY}）。
 *
 * @param props 与 {@link SelectProps} 相同。
 */
function SelectDropdownBranch(props: SelectProps): JSX.Element {
  const {
    size: sizeProp,
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
    messages,
  } = props;

  const resolvedOptions = options ?? [];
  if (
    children != null && children !== false && Boolean(children) &&
    (options == null || options.length === 0)
  ) {
    console.warn(
      "[@dreamer/ui-preact Select] 已移除原生 <select>；请传入 options，勿仅使用 children。",
    );
  }

  /** 合并默认文案；用于自定义下拉触发器 `aria-label` 兜底 */
  const m = { ...defaultSelectMessages, ...messages };
  const size = resolveFormControlSize(sizeProp);

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

  /** 选中某项：写回 Signal、派发合成 change、收起浮层 */
  const triggerChange = (newValue: string) => {
    commitMaybeSignal(value, newValue);
    const synthetic = { target: { value: newValue } } as unknown as Event;
    onChange?.(synthetic);
    openState.value = false;
  };

  /** 点击遮罩关闭下拉 */
  const handleBackdropClick = () => {
    openState.value = false;
  };

  const rv = readMaybeSignal(value) ?? "";
  const currentOpt = resolvedOptions.find((o) => o.value === rv);
  const displayLabel = currentOpt?.label ?? (placeholder ?? "");
  const ariaLabelText = displayLabel || placeholder || m.triggerFallback;

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
            {resolvedOptions.map((opt) => (
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
 * 单选下拉：始终为自绘浮层（无原生 `<select>`）。
 *
 * @param props 选项须通过 `options` 提供。
 */
export function Select(props: SelectProps): JSX.Element {
  return SelectDropdownBranch(props);
}
