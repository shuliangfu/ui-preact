/**
 * Input 单行输入（Preact）。
 * 支持 size、disabled、placeholder、allowClear（右侧清除），light/dark 主题。
 * prefix / suffix 渲染在输入框 DOM 外侧，与中间 input 同一外壳 flex 连成一体（统一边框与圆角）。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import type { SizeVariant } from "../types.ts";
import {
  compositeShellFocusRingFromInput,
  controlBlueFocusRing,
  controlErrorBorder,
  controlErrorFocusRing,
} from "./input-focus-ring.ts";
import {
  autofillVisualClass,
  inputNativeAutoComplete,
} from "./input-autofill-classes.ts";
import {
  commitMaybeSignal,
  type MaybeSignal,
  readMaybeSignal,
} from "./maybe-signal.ts";

export interface InputProps {
  /** 尺寸 */
  size?: SizeVariant;
  /** 是否禁用 */
  disabled?: boolean;
  /** 为 true 时隐藏聚焦激活态边框；默认 false 显示 ring */
  hideFocusRing?: boolean;
  /** 占位文案 */
  placeholder?: string;
  /** 输入值（受控可选）；见 {@link MaybeSignal} */
  value?: MaybeSignal<string>;
  /** 原生 type，如 text、password、email */
  type?: string;
  /** 是否只读 */
  readOnly?: boolean;
  /** 是否必填（设置 aria-required） */
  required?: boolean;
  /** 错误状态（红框 + aria-invalid） */
  error?: boolean;
  /** 前缀：在输入框左侧、与框体相连（同一外边框） */
  prefix?: ComponentChildren;
  /** 后缀：在输入框右侧、与框体相连 */
  suffix?: ComponentChildren;
  /** 是否显示右侧清除按钮（有内容且非 disabled/readOnly 时显示） */
  allowClear?: boolean;
  /** 额外 class（作用于最外层：无 addon 时为 input 本身，有 addon 时为组合外壳） */
  class?: string;
  /** 输入回调 */
  onInput?: (e: Event) => void;
  /** 变更回调 */
  onChange?: (e: Event) => void;
  /** 失焦回调 */
  onBlur?: (e: Event) => void;
  /** 聚焦回调 */
  onFocus?: (e: Event) => void;
  /** 键盘按下 */
  onKeyDown?: (e: Event) => void;
  /** 键盘抬起 */
  onKeyUp?: (e: Event) => void;
  /** 点击输入区域 */
  onClick?: (e: Event) => void;
  /** 粘贴 */
  onPaste?: (e: Event) => void;
  /** 原生 name */
  name?: string;
  /** 原生 id */
  id?: string;
  /**
   * 自动完成与暗色 `:-webkit-autofill` 长 class：`true` 时合并并按 `type` 写原生 token；`string` 时原样；`false`/不传则都不加。
   */
  autoComplete?: boolean | string;
}

const sizeClasses: Record<SizeVariant, string> = {
  xs: "px-2.5 py-1 text-xs rounded-md",
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-3 py-2 text-sm rounded-lg",
  lg: "px-4 py-2.5 text-base rounded-lg",
};

/** 组合框圆角（与 {@link sizeClasses} 一致） */
const sizeRoundedClasses: Record<SizeVariant, string> = {
  xs: "rounded-md",
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-lg",
};

/** 组合框中间 input 的纵向与字号（与 {@link sizeClasses} 一致） */
const sizePadYClasses: Record<SizeVariant, string> = {
  xs: "py-1 text-xs",
  sm: "py-1.5 text-sm",
  md: "py-2 text-sm",
  lg: "py-2.5 text-base",
};

const sizeTextClasses: Record<SizeVariant, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-sm",
  lg: "text-base",
};

/** 底纹；autofill 长类见 {@link autofillVisualClass}（仅当设了 `autoComplete` 时） */
const inputSurfaceBase =
  "border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
const readOnlyCls = "bg-slate-50 dark:bg-slate-800/80 cursor-default";

/** 左右缀：与中间输入区分隔线、略浅底，仍在同一外框内 */
const addonBaseCls =
  "shrink-0 flex items-center border-slate-300 bg-slate-50 text-slate-500 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-400";
const addonPrefixCls = twMerge(addonBaseCls, "border-r px-3");
const addonSuffixCls = twMerge(addonBaseCls, "border-l px-3");

/** 清除按钮用的 X 图标（内联 SVG，避免 form 依赖 icons） */
function ClearIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-4 w-4"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

/**
 * 组合输入：prefix | input | suffix/clear，共用一层 border + 圆角。
 *
 * @param showClear - 是否显示清除钮（由调用方在渲染路径上读受控值后传入）
 */
function InputGroupShell(props: {
  size: SizeVariant;
  shellCls: string;
  prefix?: ComponentChildren;
  suffix?: ComponentChildren;
  showClear: boolean;
  type: string;
  id: string | undefined;
  name: string | undefined;
  placeholder: string | undefined;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  error: boolean;
  value: MaybeSignal<string> | undefined;
  nativeAutoComplete: string | undefined;
  autoCompleteHint: boolean | string | undefined;
  onInput: InputProps["onInput"];
  onChange: InputProps["onChange"];
  onBlur: InputProps["onBlur"];
  onFocus: InputProps["onFocus"];
  onKeyDown: InputProps["onKeyDown"];
  onKeyUp: InputProps["onKeyUp"];
  onClick: InputProps["onClick"];
  onPaste: InputProps["onPaste"];
  onClear: () => void;
}): JSX.Element {
  const {
    size,
    shellCls,
    prefix,
    suffix,
    showClear,
    type,
    id,
    name,
    placeholder,
    disabled,
    readOnly,
    required,
    error,
    value,
    nativeAutoComplete,
    autoCompleteHint,
    onInput,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    onClick,
    onPaste,
    onClear,
  } = props;

  const innerInputCls = twMerge(
    "min-w-0 flex-1 border-0 bg-transparent shadow-none outline-none focus:ring-0",
    "text-inherit placeholder:text-slate-400 dark:placeholder:text-slate-500",
    "disabled:cursor-not-allowed",
    autofillVisualClass(autoCompleteHint),
    sizePadYClasses[size],
    "px-3",
  );

  return (
    <div class={shellCls}>
      {prefix != null && prefix !== false && (
        <div class={twMerge(addonPrefixCls, sizeTextClasses[size])}>
          {prefix}
        </div>
      )}
      <input
        type={type}
        id={id}
        name={name}
        autoComplete={nativeAutoComplete}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        aria-required={required}
        aria-invalid={error}
        value={value}
        class={innerInputCls}
        onInput={onInput}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onClick={onClick}
        onPaste={onPaste}
      />
      {showClear
        ? (
          <button
            type="button"
            class={twMerge(
              "inline-flex shrink-0 items-center border-l border-slate-300 px-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300",
              sizePadYClasses[size],
            )}
            onClick={onClear}
            aria-label="清除"
          >
            <ClearIcon />
          </button>
        )
        : suffix != null && suffix !== false
        ? (
          <div
            class={twMerge(
              addonSuffixCls,
              "pointer-events-none",
              sizeTextClasses[size],
            )}
          >
            {suffix}
          </div>
        )
        : null}
    </div>
  );
}

/**
 * 单行文本输入：无 addon 时直接渲染原生 input；有 prefix/suffix/clear 时用组合外壳。
 */
export function Input(props: InputProps): JSX.Element {
  const {
    size = "md",
    disabled = false,
    placeholder,
    value,
    type = "text",
    readOnly = false,
    required = false,
    error = false,
    prefix,
    suffix,
    allowClear = false,
    hideFocusRing = false,
    class: className,
    onInput,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    onClick,
    onPaste,
    name,
    id,
    autoComplete,
  } = props;

  const sizeCls = sizeClasses[size];
  const nativeAutoComplete = inputNativeAutoComplete(autoComplete, type);

  /**
   * 受控 `value` 为 Signal 时由组件写回，再调用外部 `onInput`。
   *
   * @param e - 原生 input 事件
   */
  const handleInput = (e: Event) => {
    commitMaybeSignal(value, (e.target as HTMLInputElement).value);
    onInput?.(e);
  };

  /**
   * 受控 `value` 为 Signal 时由组件写回，再调用外部 `onChange`。
   *
   * @param e - 原生 change 事件
   */
  const handleChange = (e: Event) => {
    commitMaybeSignal(value, (e.target as HTMLInputElement).value);
    onChange?.(e);
  };

  const handleClear = () => {
    commitMaybeSignal(value, "");
    const doc = globalThis.document;
    if (!doc?.createElement) return;
    const el = doc.createElement("input");
    el.value = "";
    handleInput({ target: el } as unknown as Event);
  };

  const inputSpreadProps = {
    type,
    id,
    name,
    autoComplete: nativeAutoComplete,
    placeholder,
    disabled,
    readOnly,
    "aria-required": required,
    "aria-invalid": error,
    class: twMerge(
      inputSurfaceBase,
      autofillVisualClass(autoComplete),
      controlBlueFocusRing(!hideFocusRing),
      sizeCls,
      !prefix && !suffix && !allowClear ? "w-full min-w-0" : undefined,
      error && controlErrorBorder,
      error && !hideFocusRing && controlErrorFocusRing(true),
      readOnly && readOnlyCls,
      !prefix && !suffix && !allowClear ? className : undefined,
    ),
    onInput: handleInput,
    onChange: handleChange,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    onClick,
    onPaste,
  };

  const hasAddon = prefix != null && prefix !== false ||
    suffix != null && suffix !== false ||
    allowClear;

  if (!hasAddon) {
    return <input {...inputSpreadProps} value={value} />;
  }

  const shellCls = twMerge(
    "relative flex w-full min-w-0 items-stretch overflow-hidden",
    inputSurfaceBase,
    sizeRoundedClasses[size],
    sizeTextClasses[size],
    !hideFocusRing &&
      (error
        ? "has-[input:focus]:ring-2 has-[input:focus]:ring-red-500 dark:has-[input:focus]:ring-red-500 has-[input:focus]:border-transparent dark:has-[input:focus]:border-transparent"
        : compositeShellFocusRingFromInput(true)),
    error && controlErrorBorder,
    readOnly && readOnlyCls,
    disabled && "opacity-50",
    className,
  );

  const val = readMaybeSignal(value);
  const showClear = Boolean(
    allowClear && val && !disabled && !readOnly,
  );

  return (
    <InputGroupShell
      size={size}
      shellCls={shellCls}
      prefix={prefix}
      suffix={showClear ? undefined : suffix}
      showClear={showClear}
      type={type}
      id={id}
      name={name}
      nativeAutoComplete={nativeAutoComplete}
      autoCompleteHint={autoComplete}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      error={error}
      value={value}
      onInput={handleInput}
      onChange={handleChange}
      onBlur={onBlur}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onClick={onClick}
      onPaste={onPaste}
      onClear={handleClear}
    />
  );
}
