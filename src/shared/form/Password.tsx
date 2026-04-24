/**
 * Password 密码输入（Preact）。
 * 对齐 Input：显隐切换与强度提示在独立子组件内读受控值，避免整块重挂载导致失焦。light/dark 主题。
 */

import type { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import type { SizeVariant } from "../types.ts";
import {
  autofillVisualClass,
  passwordNativeAutoComplete,
} from "./input-autofill-classes.ts";
import { controlBlueFocusRing } from "./input-focus-ring.ts";
import {
  commitMaybeSignal,
  type MaybeSignal,
  readMaybeSignal,
} from "./maybe-signal.ts";

export interface PasswordProps {
  /** 尺寸 */
  size?: SizeVariant;
  /** 是否禁用 */
  disabled?: boolean;
  /** 为 true 时隐藏聚焦激活态边框（输入框与显隐按钮）；默认 false 显示 */
  hideFocusRing?: boolean;
  /** 占位文案 */
  placeholder?: string;
  /** 输入值（受控可选）；见 {@link MaybeSignal} */
  value?: MaybeSignal<string>;
  /** 是否显示明文（由父组件控制，用于显隐切换） */
  showPassword?: boolean;
  /** 点击显隐按钮时回调，父组件切换 showPassword */
  onToggleShow?: () => void;
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
   * 自动完成与暗色 autofill 长 class：`true` 时合并并写原生 token；`string` 时原样。见 ui-view `PasswordProps`。
   */
  autoComplete?: boolean | string;
  /** 与 `autoComplete={true}` 联用：新密码字段用 `new-password` */
  newPassword?: boolean;
  /** 是否显示强度提示（弱/中/强） */
  showStrength?: boolean;
}

const sizeClasses: Record<SizeVariant, string> = {
  xs: "px-2.5 py-1 pr-8 text-xs rounded-md",
  sm: "px-3 py-1.5 pr-9 text-sm rounded-md",
  md: "px-3 py-2 pr-10 text-sm rounded-lg",
  lg: "px-4 py-2.5 pr-11 text-base rounded-lg",
};

/** 与 `Input` 的 `inputSurfaceBase` 一致（autofill 长类由 `autofillVisualClass(autoComplete)` 按需合并） */
const inputSurfaceBase =
  "border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

/**
 * 根据密码字符串计算强度等级与展示用 Tailwind 文本色类。
 */
function passwordStrengthMeta(s: string): { level: string; cls: string } {
  let score = 0;
  if (s.length >= 6) score++;
  if (s.length >= 10) score++;
  if (/[0-9]/.test(s)) score++;
  if (/[a-zA-Z]/.test(s)) score++;
  if (/[^a-zA-Z0-9]/.test(s)) score++;
  if (score <= 2) {
    return { level: "弱", cls: "text-red-600 dark:text-red-400" };
  }
  if (score <= 4) {
    return { level: "中", cls: "text-amber-600 dark:text-amber-400" };
  }
  return { level: "强", cls: "text-green-600 dark:text-green-400" };
}

/**
 * 强度文案：单独子组件以便仅该子树随受控值更新。
 */
function PasswordStrength(
  props: { value?: MaybeSignal<string> },
): JSX.Element | null {
  const s = readMaybeSignal(props.value) ?? "";
  if (s.length === 0) return null;
  const { level, cls } = passwordStrengthMeta(s);
  return (
    <span
      class={twMerge("block mt-1 text-xs", cls)}
      aria-live="polite"
    >
      强度：{level}
    </span>
  );
}

/**
 * 密码输入框，可选显隐与强度提示。
 */
export function Password(props: PasswordProps): JSX.Element {
  const {
    size = "md",
    disabled = false,
    placeholder,
    value,
    showPassword = false,
    onToggleShow,
    showStrength = false,
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
    newPassword = false,
  } = props;

  const sizeCls = sizeClasses[size];
  const nativeAutoComplete = passwordNativeAutoComplete(
    autoComplete,
    newPassword,
  );

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

  const inputClass = twMerge(
    inputSurfaceBase,
    autofillVisualClass(autoComplete),
    controlBlueFocusRing(!hideFocusRing),
    sizeCls,
    onToggleShow || showStrength ? "pr-10" : undefined,
    !onToggleShow && !showStrength ? className : undefined,
  );

  const inputProps = {
    type: showPassword ? "text" : "password",
    id,
    name,
    autoComplete: nativeAutoComplete,
    placeholder,
    disabled,
    class: inputClass,
    onInput: handleInput,
    onChange: handleChange,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    onClick,
    onPaste,
  };

  if (!onToggleShow && !showStrength) {
    return <input {...inputProps} value={value} />;
  }

  return (
    <div class={twMerge("relative", className)}>
      <input
        {...inputProps}
        class={twMerge("w-full", inputClass)}
        value={value}
      />
      {onToggleShow && (
        <button
          type="button"
          class={twMerge(
            "absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none",
            controlBlueFocusRing(!hideFocusRing),
          )}
          onClick={onToggleShow}
          aria-label={showPassword ? "隐藏密码" : "显示密码"}
          tabIndex={-1}
        >
          {showPassword
            ? (
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
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            )
            : (
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
        </button>
      )}
      {showStrength ? <PasswordStrength value={value} /> : null}
    </div>
  );
}
