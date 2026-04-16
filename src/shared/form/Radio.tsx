/**
 * Radio 单选（Preact）。
 * 支持 disabled、checked，需配合 name 同组互斥；light/dark 主题。
 * `checked` 为 `signal()` 返回值时，变更会先写入 Signal。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { controlBlueFocusRing } from "./input-focus-ring.ts";
import { commitMaybeSignal, type MaybeSignal } from "./maybe-signal.ts";

export interface RadioProps {
  /** 是否选中；见 {@link MaybeSignal} */
  checked?: MaybeSignal<boolean>;
  /** 是否禁用 */
  disabled?: boolean;
  /** 同组 name 一致则互斥 */
  name?: string;
  /** 选项值 */
  value?: string;
  /** 额外 class（作用于 label） */
  class?: string;
  /** 变更回调。`checked` 为 Signal 时组件会先自动写入。 */
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
  /** 原生 id */
  id?: string;
  /** 错误状态（红框/红字） */
  error?: boolean;
  /** 文案或子节点 */
  children?: ComponentChildren;
  /** 为 true 时隐藏聚焦激活态边框；默认 false 显示 ring */
  hideFocusRing?: boolean;
}

/** 单选圆钮底纹（不含 ring） */
const radioInputSurface =
  "h-4 w-4 rounded-full border-slate-300 dark:border-slate-600 text-blue-600 focus:outline-none dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
const labelCls =
  "inline-flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300";
const errorCls = "[&_input]:border-red-500 text-red-600 dark:text-red-400";

/**
 * 单选圆钮。
 */
export function Radio(props: RadioProps): JSX.Element {
  const {
    checked: checkedMaybe,
    disabled = false,
    error = false,
    hideFocusRing = false,
    name,
    value,
    class: className,
    onChange: onChangeProp,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    onClick,
    onPaste,
    id,
    children,
  } = props;

  /**
   * 选中变化时：若 `checked` 为 Signal 则回写；再调用外部 `onChange`。
   *
   * @param e - 原生 change 事件
   */
  const handleChange = (e: Event) => {
    const next = (e.target as HTMLInputElement).checked;
    commitMaybeSignal(checkedMaybe, next);
    onChangeProp?.(e);
  };

  const checkedForInput = checkedMaybe === undefined ? false : checkedMaybe;

  return (
    <label class={twMerge(labelCls, error && errorCls, className)}>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checkedForInput}
        disabled={disabled}
        aria-invalid={error}
        class={twMerge(radioInputSurface, controlBlueFocusRing(!hideFocusRing))}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onClick={onClick}
        onPaste={onPaste}
      />
      {children}
    </label>
  );
}
