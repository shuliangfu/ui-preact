/**
 * Accordion 手风琴（Preact）。
 * 受控/非受控；非受控用 {@link useSignal} 维护 expandedKeys。
 *
 * 内容区用 `grid` + `0fr`/`1fr` 行高过渡（替代 `max-h`），单开切换时开合时长对称，
 * 视觉上与「新项展开、旧项收起」同一时段并行，避免大 `max-h` 收起明显慢半拍。
 */

import type { ComponentChildren, JSX } from "preact";
import { useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { twMerge } from "tailwind-merge";
import { IconChevronDown } from "../basic/icons/ChevronDown.tsx";

export interface AccordionItem {
  key: string;
  header: string | ComponentChildren;
  disabled?: boolean;
  children: ComponentChildren;
}

export interface AccordionProps {
  items: AccordionItem[];
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  onChange?: (expandedKeys: string[]) => void;
  allowMultiple?: boolean;
  class?: string;
  itemClass?: string;
  headerClass?: string;
  contentClass?: string;
}

/**
 * 可折叠面板列表。
 */
export function Accordion(props: AccordionProps): JSX.Element {
  const {
    items,
    expandedKeys: controlledKeys,
    defaultExpandedKeys = [],
    onChange,
    allowMultiple = true,
    class: className,
    itemClass,
    headerClass,
    contentClass,
  } = props;

  const initialKeys = controlledKeys ?? defaultExpandedKeys ?? [];
  const internalKeys = useSignal<string[]>(initialKeys);
  const lastSyncedRef = useRef("");
  const c = controlledKeys !== undefined ? controlledKeys : null;
  if (c != null) {
    const cStr = JSON.stringify([...c].sort());
    if (cStr !== lastSyncedRef.current) {
      lastSyncedRef.current = cStr;
      internalKeys.value = [...c];
    }
  }

  const toggle = (key: string) => {
    const current = internalKeys.value;
    const next = new Set(current);
    if (next.has(key)) {
      next.delete(key);
    } else {
      if (!allowMultiple) next.clear();
      next.add(key);
    }
    const nextArr = Array.from(next);
    internalKeys.value = nextArr;
    onChange?.(nextArr);
  };

  const expandedSet = new Set(internalKeys.value);

  return (
    <div
      class={twMerge(
        "w-full divide-y divide-slate-200 dark:divide-slate-600 border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden",
        className,
      )}
    >
      {items.map((item) => {
        const isExpanded = expandedSet.has(item.key);
        return (
          <div
            key={item.key}
            class={twMerge("bg-white dark:bg-slate-800", itemClass)}
          >
            <button
              type="button"
              class={twMerge(
                "w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                headerClass,
              )}
              disabled={item.disabled}
              aria-expanded={isExpanded}
              aria-controls={`accordion-content-${item.key}`}
              id={`accordion-header-${item.key}`}
              onClick={() => !item.disabled && toggle(item.key)}
            >
              <span>{item.header}</span>
              <span
                class={twMerge(
                  "shrink-0 w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-200",
                  isExpanded && "rotate-180",
                )}
              >
                <IconChevronDown class="w-full h-full" />
              </span>
            </button>
            <div
              id={`accordion-content-${item.key}`}
              role="region"
              aria-labelledby={`accordion-header-${item.key}`}
              class={twMerge(
                "grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out",
                isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div class="min-h-0 overflow-hidden">
                <div
                  class={twMerge(
                    "px-4 py-3 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700",
                    contentClass,
                  )}
                >
                  {item.children}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
