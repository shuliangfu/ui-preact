/**
 * RadioGroup 单选组（Preact）。
 * 选项列表、统一 name、当前选中 value；支持横向/纵向布局。
 * `value` 为 `signal()` 返回值时，会先写入 Signal，可不写 `onChange` 仅做同步。
 */

import type { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { Radio } from "./Radio.tsx";
import {
  commitMaybeSignal,
  type MaybeSignal,
  readMaybeSignal,
} from "./maybe-signal.ts";

export interface RadioGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** 布局方向：横向（默认）或纵向 */
export type RadioGroupDirection = "vertical" | "horizontal";

export interface RadioGroupProps {
  /** 选项列表 */
  options: RadioGroupOption[];
  /** 同组 name（必填则互斥） */
  name: string;
  /** 当前选中的 value；见 {@link MaybeSignal} */
  value?: MaybeSignal<string>;
  /** 是否整组禁用 */
  disabled?: boolean;
  /** 错误状态（传递给每个 Radio） */
  error?: boolean;
  /**
   * 变更回调。`value` 为 Signal 时组件会先自动写入；仍可传以做其它副作用。
   */
  onChange?: (value: string) => void;
  /** 布局方向：horizontal 横向、vertical 纵向，默认 "horizontal" */
  direction?: RadioGroupDirection;
  /** 额外 class（作用于容器） */
  class?: string;
}

/**
 * 单选组：在渲染路径上读受控 value 以订阅 Signal。
 */
export function RadioGroup(props: RadioGroupProps): JSX.Element {
  const {
    options,
    name,
    value: valueProp,
    disabled = false,
    error = false,
    onChange,
    direction = "horizontal",
    class: className,
  } = props;

  const directionCls = direction === "horizontal"
    ? "flex-row flex-wrap gap-x-4 gap-y-2"
    : "flex-col gap-2";

  const resolvedValue = readMaybeSignal(valueProp) ?? "";

  /**
   * 将新选中 value 写回受控源：`value` 为 Signal 时赋值，再调 `onChange`。
   *
   * @param next - 新选中的选项 value
   */
  const commitValue = (next: string) => {
    commitMaybeSignal(valueProp, next);
    onChange?.(next);
  };

  return (
    <div
      class={twMerge("flex", directionCls, className)}
      role="radiogroup"
      aria-label={name}
      aria-invalid={error}
    >
      {options.map((opt) => (
        <span key={opt.value}>
          <Radio
            name={name}
            value={opt.value}
            checked={resolvedValue === opt.value}
            disabled={disabled || opt.disabled}
            error={error}
            onChange={() => commitValue(opt.value)}
          >
            {opt.label}
          </Radio>
        </span>
      ))}
    </div>
  );
}
