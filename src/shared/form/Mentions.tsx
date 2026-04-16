/**
 * Mentions @提及（Preact）。
 * 对齐 Input 与 `MaybeSignal`；下拉由子组件渲染；下拉打开时支持方向键与 Enter 选择。
 */

import type { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { controlBlueFocusRing } from "./input-focus-ring.ts";
import {
  commitMaybeSignal,
  type MaybeSignal,
  readMaybeSignal,
} from "./maybe-signal.ts";

/** 候选选项 */
export interface MentionOption {
  value: string;
  label: string;
}

export interface MentionsProps {
  /** 当前值（受控可选） */
  value?: MaybeSignal<string>;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  onChange?: (e: Event) => void;
  onInput?: (e: Event) => void;
  onBlur?: (e: Event) => void;
  onFocus?: (e: Event) => void;
  onKeyDown?: (e: Event) => void;
  onKeyUp?: (e: Event) => void;
  onClick?: (e: Event) => void;
  onPaste?: (e: Event) => void;
  showDropdown?: boolean | (() => boolean);
  dropdownOptions?: MentionOption[] | (() => MentionOption[]);
  onSelectOption?: (option: MentionOption) => void;
  class?: string;
  hideFocusRing?: boolean;
  name?: string;
  id?: string;
}

const textareaSurface =
  "border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-3 py-2 text-sm rounded-lg resize-y min-h-[80px]";

const dropdownCls =
  "absolute z-10 mt-1 w-full min-w-[160px] max-h-48 overflow-auto rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg py-1";
const dropdownItemBaseCls =
  "px-3 py-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer";
const dropdownItemHoverCls = "hover:bg-slate-100 dark:hover:bg-slate-700";
const dropdownItemActiveCls = "bg-slate-100 dark:bg-slate-700";

/**
 * 解析是否展示下拉及候选列表（与下拉子组件逻辑一致）。
 *
 * @param showDropdown - 布尔或 getter
 * @param dropdownOptions - 数组或 getter
 * @returns 是否打开、选项列表
 */
function resolveMentionsDropdownState(
  showDropdown?: boolean | (() => boolean),
  dropdownOptions?: MentionOption[] | (() => MentionOption[]),
): { open: boolean; options: MentionOption[] } {
  const open = typeof showDropdown === "function"
    ? Boolean(showDropdown())
    : Boolean(showDropdown);
  const options = typeof dropdownOptions === "function"
    ? dropdownOptions()
    : (dropdownOptions ?? []);
  return { open, options };
}

/**
 * 下拉 listbox：展示候选；支持键盘高亮索引与鼠标移入同步高亮。
 */
function MentionsDropdown(props: {
  showDropdown?: boolean | (() => boolean);
  dropdownOptions?: MentionOption[] | (() => MentionOption[]);
  onSelectOption?: (option: MentionOption) => void;
  /** 当前高亮项下标，-1 表示无 */
  highlightedIndex: number;
  /** 鼠标移入某一项时更新高亮 */
  onHighlightIndex: (index: number) => void;
  /** 挂载在 listbox 根节点，供将高亮项滚入可视区域 */
  listboxRef: { current: HTMLDivElement | null };
  /** 稳定 DOM id，供 textarea `aria-controls` / `aria-activedescendant` */
  listboxId: string;
}) {
  const {
    showDropdown = false,
    dropdownOptions = [],
    onSelectOption,
    highlightedIndex,
    onHighlightIndex,
    listboxRef,
    listboxId,
  } = props;
  const { open: show, options: opts } = resolveMentionsDropdownState(
    showDropdown,
    dropdownOptions,
  );
  if (!show || opts.length === 0 || !onSelectOption) return null;
  return (
    <div
      ref={listboxRef}
      id={listboxId}
      class={dropdownCls}
      role="listbox"
      aria-label="提及候选"
    >
      {opts.map((opt, i) => (
        <div
          key={opt.value}
          id={`${listboxId}-opt-${i}`}
          role="option"
          aria-selected={highlightedIndex === i}
          class={twMerge(
            dropdownItemBaseCls,
            dropdownItemHoverCls,
            highlightedIndex === i && dropdownItemActiveCls,
          )}
          onClick={() => onSelectOption(opt)}
          onMouseEnter={() => onHighlightIndex(i)}
          onMouseDown={(e: Event) => e.preventDefault()}
        >
          {opt.label}
        </div>
      ))}
    </div>
  );
}

/**
 * Mentions：带 @ 候选下拉的文本域。
 * 下拉打开且存在 `onSelectOption` 时：`ArrowUp`/`ArrowDown` 移动高亮，`Enter` 选中（`Shift+Enter` 仍换行），`Escape` 仅清除高亮并透传 `onKeyDown`。
 */
export function Mentions(props: MentionsProps): JSX.Element {
  const {
    value,
    placeholder = "输入 @ 提及",
    rows = 3,
    disabled = false,
    onChange,
    onInput,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    onClick,
    onPaste,
    showDropdown,
    dropdownOptions,
    onSelectOption,
    class: className,
    hideFocusRing = false,
    name,
    id,
  } = props;

  /** 下拉内键盘高亮下标，-1 为未选中项 */
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const listboxRef = useRef<HTMLDivElement | null>(null);
  /** 与 `id` 解耦的稳定 listbox id，避免多实例冲突 */
  const listboxIdRef = useRef<string | null>(null);
  if (listboxIdRef.current === null) {
    listboxIdRef.current = `mentions-lb-${
      Math.random().toString(36).slice(2, 11)
    }`;
  }
  const listboxId = listboxIdRef.current;

  const { open: dropdownOpen, options: dropdownOpts } =
    resolveMentionsDropdownState(showDropdown, dropdownOptions);

  const optsKey = dropdownOpts.map((o) => `${o.value}\t${o.label}`).join("\n");

  /** 下拉关闭或无时清空高亮 */
  useEffect(() => {
    if (!dropdownOpen || dropdownOpts.length === 0) {
      setHighlightedIndex(-1);
    }
  }, [dropdownOpen, dropdownOpts.length]);

  /** 候选内容变化时重置高亮，避免过滤后仍指向旧下标 */
  useEffect(() => {
    if (!dropdownOpen) return;
    setHighlightedIndex(-1);
  }, [dropdownOpen, optsKey]);

  /** 将高亮项滚入 listbox 可视区域 */
  useLayoutEffect(() => {
    if (highlightedIndex < 0 || !dropdownOpen) return;
    const doc = globalThis.document;
    if (!doc) return;
    const el = doc.getElementById(`${listboxId}-opt-${highlightedIndex}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, dropdownOpen, optsKey, listboxId]);

  const handleInput = (e: Event) => {
    commitMaybeSignal(value, (e.target as HTMLTextAreaElement).value);
    onInput?.(e);
  };

  const handleChange = (e: Event) => {
    commitMaybeSignal(value, (e.target as HTMLTextAreaElement).value);
    onChange?.(e);
  };

  /**
   * 合并键盘逻辑：下拉打开时拦截方向键与 Enter；其余交给外部 `onKeyDown`。
   *
   * @param e - 原生键盘事件
   */
  const handleKeyDown = (e: JSX.TargetedKeyboardEvent<HTMLTextAreaElement>) => {
    const canKeyboardSelect = dropdownOpen &&
      dropdownOpts.length > 0 &&
      Boolean(onSelectOption) &&
      !disabled;

    if (canKeyboardSelect) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          if (prev < 0) return 0;
          return Math.min(prev + 1, dropdownOpts.length - 1);
        });
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          if (prev < 0) return dropdownOpts.length - 1;
          return Math.max(prev - 1, 0);
        });
        return;
      }
      /** Shift+Enter 保留为换行，不抢为选候选 */
      if (e.key === "Enter" && !e.shiftKey) {
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < dropdownOpts.length
        ) {
          e.preventDefault();
          onSelectOption!(dropdownOpts[highlightedIndex]);
          return;
        }
        /** 无高亮时仍把 Enter 交给默认行为（换行）与外部 */
      }
      if (e.key === "Escape") {
        setHighlightedIndex(-1);
      }
    }

    onKeyDown?.(e);
  };

  const textVal = readMaybeSignal(value) ?? "";

  const activedescendantId = dropdownOpen &&
      highlightedIndex >= 0 &&
      highlightedIndex < dropdownOpts.length
    ? `${listboxId}-opt-${highlightedIndex}`
    : undefined;

  return (
    <div class={twMerge("relative", className)}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={textVal}
        placeholder={placeholder}
        disabled={disabled}
        class={twMerge(textareaSurface, controlBlueFocusRing(!hideFocusRing))}
        aria-expanded={dropdownOpen}
        aria-haspopup="listbox"
        aria-controls={dropdownOpen ? listboxId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={activedescendantId}
        onChange={handleChange}
        onInput={handleInput}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={handleKeyDown}
        onKeyUp={onKeyUp}
        onClick={onClick}
        onPaste={onPaste}
      />
      <MentionsDropdown
        showDropdown={showDropdown}
        dropdownOptions={dropdownOptions}
        onSelectOption={onSelectOption}
        highlightedIndex={highlightedIndex}
        onHighlightIndex={setHighlightedIndex}
        listboxRef={listboxRef}
        listboxId={listboxId}
      />
    </div>
  );
}
