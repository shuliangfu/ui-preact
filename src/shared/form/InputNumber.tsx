/**
 * InputNumber 数字输入（Preact）。
 * 带 +/- 步进；`value` 支持 {@link MaybeSignal}；外壳用 `has-[input:focus]` 高亮，避免步进钮获焦误亮。
 */

import type { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import type { SizeVariant } from "../types.ts";
import { compositeShellFocusRingFromInput } from "./input-focus-ring.ts";
import {
  commitMaybeSignal,
  type MaybeSignal,
  readMaybeSignal,
} from "./maybe-signal.ts";

export interface InputNumberProps {
  /** 尺寸 */
  size?: SizeVariant;
  /** 是否禁用 */
  disabled?: boolean;
  /** 为 true 时隐藏聚焦激活态边框（仅 input 聚焦时外壳高亮）；默认 false 显示 */
  hideFocusRing?: boolean;
  /** 占位文案 */
  placeholder?: string;
  /** 当前值（受控可选）；见 {@link MaybeSignal}（`number | string` 联合） */
  value?: MaybeSignal<number | string>;
  /** 步进 */
  step?: number;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 额外 class */
  class?: string;
  /** 变更回调 */
  onChange?: (e: Event) => void;
  /** 输入过程回调（与原生 input 一致） */
  onInput?: (e: Event) => void;
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
}

/**
 * 从 step 推断应保留的小数位数（支持普通小数；科学计数法按指数折算）。
 *
 * @param step - 步进值，如 0.1、0.25、1
 * @returns 小数位数，整数 step 返回 0
 */
function decimalPlacesFromStep(step: number): number {
  if (!Number.isFinite(step) || step === 0) return 0;
  const s = step.toString().toLowerCase();
  if (s.includes("e")) {
    const parts = s.split("e");
    const mantissa = parts[0] ?? "";
    const exp = parseInt(parts[1] ?? "0", 10);
    const mantissaDec = mantissa.includes(".")
      ? (mantissa.split(".")[1]?.length ?? 0)
      : 0;
    const p = mantissaDec - exp;
    return p > 0 ? p : 0;
  }
  const dot = s.indexOf(".");
  return dot < 0 ? 0 : s.length - dot - 1;
}

/**
 * 按 step 对应的小数精度做十进制舍入（先放大再 Math.round，再缩回）。
 *
 * @param num - 原始数值
 * @param step - 与 {@link InputNumberProps.step} 一致
 */
function roundByStepPrecision(num: number, step: number): number {
  if (!Number.isFinite(num)) return num;
  const d = decimalPlacesFromStep(step);
  const factor = 10 ** d;
  return Math.round(num * factor) / factor;
}

/** 内层 input 仅 padding / 字号；圆角由外壳 {@link wrapRounded} 统一 */
const sizeClasses: Record<SizeVariant, string> = {
  xs: "px-2.5 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-2.5 text-base",
};

/** 与尺寸一致的外壳圆角（与原先各 size 的 rounded-* 对齐） */
const wrapRounded: Record<SizeVariant, string> = {
  xs: "rounded-md",
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-lg",
};

/** 输入框本体：自身不画 ring；整圈高亮由外壳用 `:has(input:focus)` 控制 */
const inputBase =
  "min-w-0 flex-1 border-0 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

/**
 * 隐藏 `type="number"` 右侧原生上下箭头。
 */
const hideNativeNumberSpinner =
  "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:[-webkit-appearance:none] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-outer-spin-button]:[-webkit-appearance:none] [-moz-appearance:textfield]";

/** 外壳底纹；ring 由 {@link compositeShellFocusRingFromInput}(`!hideFocusRing`) 拼接 */
const wrapShellCls =
  "inline-flex items-stretch overflow-hidden border border-slate-300 dark:border-slate-600";

/**
 * 加减按钮：在渲染路径上读受控值以订阅 Signal，仅步进区随数值更新。
 */
function InputNumberButtons(props: {
  value?: MaybeSignal<number | string>;
  step: number;
  min?: number;
  max?: number;
  disabled: boolean;
  onTriggerChange: (newVal: number) => void;
}): JSX.Element {
  const { value, step, min, max, disabled, onTriggerChange } = props;

  const stepperBtnCls =
    "flex-1 min-w-0 px-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none flex items-center justify-center text-sm font-medium";

  const raw = readMaybeSignal(value);
  const val = value === undefined || raw === undefined || raw === ""
    ? ""
    : String(raw);
  const num = val === "" ? NaN : Number(val);
  const snapped = Number.isNaN(num) ? num : roundByStepPrecision(num, step);
  const nextDown = Number.isNaN(snapped)
    ? NaN
    : roundByStepPrecision(snapped - step, step);
  const nextUp = Number.isNaN(snapped)
    ? NaN
    : roundByStepPrecision(snapped + step, step);
  const canDecrease = !disabled &&
    (min == null || Number.isNaN(nextDown) || nextDown >= min);
  const canIncrease = !disabled &&
    (max == null || Number.isNaN(nextUp) || nextUp <= max);

  return (
    <span class="flex flex-row items-stretch min-w-10 w-10 shrink-0 border-l border-slate-300 dark:border-slate-600">
      <button
        type="button"
        class={twMerge(
          stepperBtnCls,
          "border-r border-slate-300 dark:border-slate-600",
        )}
        disabled={!canDecrease}
        aria-label="减少"
        onClick={() => {
          if (Number.isNaN(num)) {
            onTriggerChange(roundByStepPrecision(min ?? 0, step));
            return;
          }
          const rawNext = Math.max(min ?? -Infinity, snapped - step);
          onTriggerChange(roundByStepPrecision(rawNext, step));
        }}
      >
        −
      </button>
      <button
        type="button"
        class={stepperBtnCls}
        disabled={!canIncrease}
        aria-label="增加"
        onClick={() => {
          if (Number.isNaN(num)) {
            onTriggerChange(roundByStepPrecision(step, step));
            return;
          }
          const rawNext = Math.min(max ?? Infinity, snapped + step);
          onTriggerChange(roundByStepPrecision(rawNext, step));
        }}
      >
        +
      </button>
    </span>
  );
}

/**
 * 数字输入 + 步进按钮。
 */
export function InputNumber(props: InputNumberProps): JSX.Element {
  const {
    size = "md",
    disabled = false,
    placeholder,
    value,
    step = 1,
    min,
    max,
    class: className,
    onChange,
    onInput,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    onClick,
    onPaste,
    name,
    id,
    hideFocusRing = false,
  } = props;

  const sizeCls = sizeClasses[size];

  const onTriggerChange = (newVal: number) => {
    const normalized = roundByStepPrecision(newVal, step);
    const str = String(normalized);
    commitMaybeSignal(value, str);
    const synthetic = {
      target: { value: str },
    } as unknown as Event;
    onChange?.(synthetic);
  };

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

  const inputSpreadProps = {
    type: "number" as const,
    id,
    name,
    placeholder,
    disabled,
    step,
    min,
    max,
    class: twMerge(
      inputBase,
      sizeCls,
      hideNativeNumberSpinner,
    ),
    onChange: handleChange,
    onInput: handleInput,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    onClick,
    onPaste,
  };

  return (
    <span
      class={twMerge(
        wrapShellCls,
        compositeShellFocusRingFromInput(!hideFocusRing),
        wrapRounded[size],
        className,
      )}
    >
      <input {...inputSpreadProps} value={value} />
      <InputNumberButtons
        value={value}
        step={step}
        min={min}
        max={max}
        disabled={disabled}
        onTriggerChange={onTriggerChange}
      />
    </span>
  );
}
