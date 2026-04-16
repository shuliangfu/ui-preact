/**
 * AutoComplete 自动完成（Preact）。
 * 建议列表为自绘浮层；与 Input 一致受控 {@link MaybeSignal}。
 */

import type { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { useEffect, useRef } from "preact/hooks";
import { useSignal, useSignalEffect } from "@preact/signals";
import type { SizeVariant } from "../types.ts";
import { controlBlueFocusRing } from "./input-focus-ring.ts";
import {
  commitMaybeSignal,
  type MaybeSignal,
  readMaybeSignal,
} from "./maybe-signal.ts";

export interface AutoCompleteProps {
  /** 建议选项（子串匹配；空输入展示全部） */
  options?: string[];
  /** 当前输入值（受控可选）；见 {@link MaybeSignal} */
  value?: MaybeSignal<string>;
  /** 尺寸 */
  size?: SizeVariant;
  /** 是否禁用 */
  disabled?: boolean;
  /** 占位文案 */
  placeholder?: string;
  /** 变更回调 */
  onChange?: (e: Event) => void;
  /** 输入回调 */
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
  /** 选中建议时回调 */
  onSelect?: (value: string) => void;
  /** 额外 class */
  class?: string;
  /** 为 true 时隐藏聚焦激活态边框 */
  hideFocusRing?: boolean;
  /** 原生 name */
  name?: string;
  /** 原生 id */
  id?: string;
}

const sizeClasses: Record<SizeVariant, string> = {
  xs: "px-2.5 py-1 text-xs rounded-md",
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-3 py-2 text-sm rounded-lg",
  lg: "px-4 py-2.5 text-base rounded-lg",
};

const inputSurface =
  "border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

const panelCls =
  "absolute z-50 left-0 right-0 top-full mt-1 max-h-60 overflow-auto rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg py-1";

const optionBase =
  "w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer border-0 bg-transparent";

const optionActiveCls =
  "bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200";

let autoCompleteListboxSeq = 0;

/**
 * 按输入内容过滤建议（不区分大小写）。
 */
function filterOptions(query: string, opts: string[]): string[] {
  const q = query.trim().toLowerCase();
  if (q === "") return opts.slice();
  return opts.filter((o) => o.toLowerCase().includes(q));
}

/**
 * 下拉列表面板（读 Signal 以细粒度更新）。
 */
function AutoCompletePanel(props: {
  /** 与 {@link useSignal} 返回类型一致 */
  open: { readonly value: boolean };
  activeIndex: { readonly value: number };
  filterQuery: { readonly value: string };
  options: string[];
  listboxId: string;
  onPick: (opt: string) => void;
}): JSX.Element | null {
  const { open, activeIndex, filterQuery, options, listboxId, onPick } = props;
  if (!open.value) return null;
  const filtered = filterOptions(filterQuery.value, options);
  if (filtered.length === 0) return null;

  return (
    <div
      id={listboxId}
      class={panelCls}
      role="listbox"
      aria-label="建议列表"
    >
      {filtered.map((opt, i) => (
        <button
          type="button"
          key={`${listboxId}-${i}-${opt}`}
          role="option"
          id={`${listboxId}-opt-${i}`}
          aria-selected={activeIndex.value === i}
          class={twMerge(
            optionBase,
            activeIndex.value === i && optionActiveCls,
          )}
          onMouseDown={(e: Event) => e.preventDefault()}
          onClick={() => onPick(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/**
 * 带建议列表的文本输入。
 */
export function AutoComplete(props: AutoCompleteProps): JSX.Element {
  const {
    options = [],
    value,
    size = "md",
    disabled = false,
    placeholder,
    onChange,
    onInput,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    onClick,
    onPaste,
    onSelect,
    class: className,
    hideFocusRing = false,
    name,
    id,
  } = props;

  const sizeCls = sizeClasses[size];
  const listboxId = id
    ? `${id}-listbox`
    : `autocomplete-listbox-${++autoCompleteListboxSeq}`;

  const panelOpen = useSignal(false);
  const activeIndex = useSignal(-1);
  const panelFilterQuery = useSignal("");

  const comboboxInputRef = useRef<HTMLInputElement>(null);

  /** 外部受控 value 变化时与过滤串对齐 */
  const externalSnap = readMaybeSignal(value) ?? "";
  useEffect(() => {
    panelFilterQuery.value = String(externalSnap);
  }, [externalSnap, value]);

  /** `aria-expanded` 随面板开关更新，且不重挂载 input */
  useSignalEffect(() => {
    const node = comboboxInputRef.current;
    if (node != null) {
      node.setAttribute("aria-expanded", panelOpen.value ? "true" : "false");
    }
  });

  const pickOption = (opt: string) => {
    panelFilterQuery.value = opt;
    commitMaybeSignal(value, opt);
    const synthetic = {
      target: { value: opt },
    } as unknown as Event;
    onChange?.(synthetic);
    onInput?.(synthetic);
    if (onSelect) onSelect(opt);
    panelOpen.value = false;
    activeIndex.value = -1;
  };

  const handleInput = (e: Event) => {
    const el = e.target as HTMLInputElement;
    panelFilterQuery.value = el?.value ?? "";
    activeIndex.value = -1;
    panelOpen.value = true;
    const v = el?.value ?? "";
    commitMaybeSignal(value, v);
    onInput?.(e);
    if (onSelect && options.includes(v)) onSelect(v);
  };

  const handleChange = (e: Event) => {
    const el = e.target as HTMLInputElement;
    panelFilterQuery.value = el?.value ?? "";
    activeIndex.value = -1;
    const v = el?.value ?? "";
    commitMaybeSignal(value, v);
    onChange?.(e);
    if (onSelect && options.includes(v)) onSelect(v);
  };

  const handleFocus = (e: Event) => {
    const t = e.target as HTMLInputElement;
    panelFilterQuery.value = t?.value ?? "";
    if (!disabled && options.length > 0) panelOpen.value = true;
    onFocus?.(e);
  };

  const handleBlur = (e: Event) => {
    onBlur?.(e);
    panelOpen.value = false;
    activeIndex.value = -1;
  };

  const handleKeyDown = (e: Event) => {
    const ke = e as unknown as KeyboardEvent;
    const input = e.target as HTMLInputElement;
    const q = input?.value ?? "";
    const filtered = filterOptions(String(q), options);

    if (panelOpen.value && filtered.length > 0) {
      if (ke.key === "ArrowDown") {
        ke.preventDefault();
        const next = Math.min(activeIndex.value + 1, filtered.length - 1);
        activeIndex.value = next < 0 ? 0 : next;
        return;
      }
      if (ke.key === "ArrowUp") {
        ke.preventDefault();
        activeIndex.value = Math.max(activeIndex.value - 1, 0);
        return;
      }
      if (ke.key === "Enter" && activeIndex.value >= 0) {
        ke.preventDefault();
        const opt = filtered[activeIndex.value];
        if (opt != null) pickOption(opt);
        return;
      }
      if (ke.key === "Escape") {
        ke.preventDefault();
        panelOpen.value = false;
        activeIndex.value = -1;
        return;
      }
    }
    onKeyDown?.(e);
  };

  const inputClass = twMerge(
    "w-full",
    inputSurface,
    controlBlueFocusRing(!hideFocusRing),
    sizeCls,
  );

  if (options.length === 0) {
    return (
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        class={twMerge(inputClass, className)}
        onChange={handleChange}
        onInput={handleInput}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onKeyUp={onKeyUp}
        onClick={onClick}
        onPaste={onPaste}
      />
    );
  }

  return (
    <div class={twMerge("relative w-full", className)}>
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        role="combobox"
        aria-controls={listboxId}
        aria-autocomplete="list"
        autoComplete="off"
        class={inputClass}
        ref={comboboxInputRef}
        onChange={handleChange}
        onInput={handleInput}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onKeyUp={onKeyUp}
        onClick={onClick}
        onPaste={onPaste}
      />
      <AutoCompletePanel
        open={panelOpen}
        activeIndex={activeIndex}
        filterQuery={panelFilterQuery}
        options={options}
        listboxId={listboxId}
        onPick={pickOption}
      />
    </div>
  );
}
