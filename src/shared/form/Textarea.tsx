/**
 * Textarea 多行输入（Preact）。
 * 对齐 Input：受控值支持 {@link MaybeSignal}；带 `maxLength` 时在下方展示剩余字数。light/dark 主题。
 */

import type { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import {
  controlBlueFocusRing,
  controlErrorBorder,
  controlErrorFocusRing,
} from "./input-focus-ring.ts";
import {
  commitMaybeSignal,
  type MaybeSignal,
  readMaybeSignal,
} from "./maybe-signal.ts";

export interface TextareaProps {
  /** 是否禁用 */
  disabled?: boolean;
  /** 为 true 时隐藏聚焦激活态边框；默认 false 显示 ring */
  hideFocusRing?: boolean;
  /** 占位文案 */
  placeholder?: string;
  /** 行数（高度） */
  rows?: number;
  /** 输入值（受控可选）；见 {@link MaybeSignal} */
  value?: MaybeSignal<string>;
  /** 最大字数（展示已用/总数） */
  maxLength?: number;
  /** 是否只读 */
  readOnly?: boolean;
  /** 是否必填（aria-required） */
  required?: boolean;
  /** 错误状态（红框 + aria-invalid） */
  error?: boolean;
  /** 额外 class */
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
  /** 点击控件 */
  onClick?: (e: Event) => void;
  /** 粘贴 */
  onPaste?: (e: Event) => void;
  /** 原生 name */
  name?: string;
  /** 原生 id */
  id?: string;
}

/** 基础底纹（不含 ring） */
const textareaSurface =
  "border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-3 py-2 text-sm rounded-lg resize-y min-h-[80px]";
const readOnlyCls = "bg-slate-50 dark:bg-slate-800/80 cursor-default";

/**
 * 在 textarea 下方展示剩余字符数（在渲染路径上读受控值以订阅 Signal）。
 */
function TextareaLengthDisplay(props: {
  value?: MaybeSignal<string>;
  maxLength: number;
}): JSX.Element {
  const { value, maxLength } = props;
  const s = readMaybeSignal(value) ?? "";
  const len = s.length;
  const remaining = Math.max(0, maxLength - len);
  return (
    <span
      class="mt-1 block text-left text-xs text-slate-500 dark:text-slate-400"
      aria-live="polite"
    >
      剩余 {remaining} / {maxLength}
    </span>
  );
}

/**
 * 多行文本输入；可选 `maxLength` 与字数提示。
 */
export function Textarea(props: TextareaProps): JSX.Element {
  const {
    disabled = false,
    placeholder,
    rows = 3,
    value,
    maxLength,
    readOnly = false,
    required = false,
    error = false,
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
  } = props;

  /**
   * 受控 `value` 为 Signal 时由组件写回，再调用外部 `onInput`。
   *
   * @param e - 原生 input 事件
   */
  const handleInput = (e: Event) => {
    commitMaybeSignal(value, (e.target as HTMLTextAreaElement).value);
    onInput?.(e);
  };

  /**
   * 受控 `value` 为 Signal 时由组件写回，再调用外部 `onChange`。
   *
   * @param e - 原生 change 事件
   */
  const handleChange = (e: Event) => {
    commitMaybeSignal(value, (e.target as HTMLTextAreaElement).value);
    onChange?.(e);
  };

  /**
   * 勿写入 `maxLength: undefined`：部分引擎会当成 0。
   */
  /** `value` 单独传入以满足 Preact `Signalish`；勿放进 spread 以免与 `MaybeSignal` 推断冲突 */
  const textareaProps = {
    id,
    name,
    rows,
    placeholder,
    disabled,
    readOnly,
    ...(maxLength != null ? { maxLength } : {}),
    "aria-required": required,
    "aria-invalid": error,
    class: twMerge(
      textareaSurface,
      controlBlueFocusRing(!hideFocusRing),
      error && controlErrorBorder,
      error && !hideFocusRing && controlErrorFocusRing(true),
      readOnly && readOnlyCls,
      className,
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

  if (maxLength == null) {
    return <textarea {...textareaProps} value={value} />;
  }

  return (
    <div>
      <textarea {...textareaProps} value={value} />
      <TextareaLengthDisplay value={value} maxLength={maxLength} />
    </div>
  );
}
