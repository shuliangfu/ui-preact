/**
 * Switch 开关（Preact）。
 * 支持 disabled、checked，light/dark 主题；label + 隐藏 input + peer 样式。
 * `checked` 为 `signal()` 返回值时，变更会先写入 Signal，可不写 `onChange` 仅做同步。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { commitMaybeSignal, type MaybeSignal } from "./maybe-signal.ts";

export interface SwitchProps {
  /**
   * 是否开启；见 {@link MaybeSignal}（透传至原生 `checked`，Preact 对 Signal 属性做绑定）。
   */
  checked?: MaybeSignal<boolean>;
  /** 是否禁用 */
  disabled?: boolean;
  /** 额外 class（作用于 label） */
  class?: string;
  /**
   * 变更回调。`checked` 为 Signal 时组件会先自动写入；仍可传以做其它副作用。
   */
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
  /** 开启时文案（可选） */
  checkedChildren?: ComponentChildren;
  /** 关闭时文案（可选） */
  unCheckedChildren?: ComponentChildren;
  /** 错误状态（红框/红字） */
  error?: boolean;
  /** 为 true 时隐藏轨道在 peer 聚焦时的蓝色 ring；默认 false 显示 */
  hideFocusRing?: boolean;
}

/** 开关轨道底纹；peer 聚焦 ring 由 `!hideFocusRing` 控制 */
const trackSurface =
  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-600 transition-colors peer-disabled:opacity-50 peer-disabled:cursor-not-allowed peer-checked:bg-blue-600 peer-checked:border-blue-600 dark:peer-checked:bg-blue-500 dark:peer-checked:border-blue-500";
const thumbCls =
  "pointer-events-none absolute left-0.5 top-0.5 inline-block h-5 w-5 rounded-full bg-white dark:bg-slate-200 shadow ring-0 transition-transform peer-checked:translate-x-5";

/**
 * 布尔开关控件。
 */
export function Switch(props: SwitchProps): JSX.Element {
  const {
    checked: checkedMaybe,
    disabled = false,
    error = false,
    class: className,
    onChange: onChangeProp,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    onClick,
    onPaste,
    name,
    id,
    checkedChildren,
    unCheckedChildren,
    hideFocusRing = false,
  } = props;

  /**
   * 用户切换时：若 `checked` 为 Signal 则回写；再调用外部 `onChange`。
   *
   * @param e - 原生 change 事件
   */
  const handleChange = (e: Event) => {
    const next = (e.target as HTMLInputElement).checked;
    commitMaybeSignal(checkedMaybe, next);
    onChangeProp?.(e);
  };

  const checkedForInput = checkedMaybe === undefined ? false : checkedMaybe;

  const errorTrackCls = error
    ? "border-red-500 dark:border-red-500 peer-checked:border-red-500"
    : "";

  return (
    <label
      class={twMerge(
        "relative inline-flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300",
        error && "text-red-600 dark:text-red-400",
        className,
      )}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checkedForInput}
        disabled={disabled}
        aria-invalid={error}
        class="peer sr-only"
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onClick={onClick}
        onPaste={onPaste}
      />
      <span
        class={twMerge(
          trackSurface,
          hideFocusRing
            ? "peer-focus:ring-0"
            : "peer-focus:ring-2 peer-focus:ring-blue-500",
          errorTrackCls,
        )}
      />
      <span class={thumbCls} />
      {unCheckedChildren != null && (
        <span class="peer-checked:hidden">{unCheckedChildren}</span>
      )}
      {checkedChildren != null && (
        <span class="hidden peer-checked:inline">{checkedChildren}</span>
      )}
    </label>
  );
}
