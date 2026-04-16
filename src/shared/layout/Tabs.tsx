/**
 * Tabs 标签页（Preact）。
 * 支持受控/非受控、line/card；非受控时用 {@link useSignal} 维护 activeKey。
 */

import type { ComponentChildren, JSX } from "preact";
import { useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

export type TabsType = "line" | "card";

export interface TabItem {
  key: string;
  label: string | ComponentChildren;
  disabled?: boolean;
  children: ComponentChildren;
}

export interface TabsProps {
  items: TabItem[];
  activeKey?: string;
  onChange?: (key: string) => void;
  type?: TabsType;
  fullWidth?: boolean;
  class?: string;
  tabListClass?: string;
  panelClass?: string;
}

/**
 * 标签页：标签栏 + 单面板。
 */
export function Tabs(props: TabsProps): JSX.Element {
  const {
    items,
    activeKey: controlledKey,
    onChange,
    type = "line",
    fullWidth = false,
    class: className,
    tabListClass,
    panelClass,
  } = props;

  const initialKey = controlledKey ?? items[0]?.key ?? "";
  const internalKey = useSignal(initialKey);
  const lastSyncedRef = useRef<string | undefined>(undefined);
  const c = controlledKey !== undefined && controlledKey !== ""
    ? controlledKey
    : undefined;
  if (c != null && c !== lastSyncedRef.current) {
    lastSyncedRef.current = c;
    internalKey.value = c;
  }

  const activeKey = internalKey.value;

  const lineCls =
    "relative z-0 flex flex-wrap items-end gap-1 border-b border-slate-200 bg-inherit dark:border-slate-600";
  const cardCls = "flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800";

  const tabBtnBase =
    "px-4 py-2 text-sm font-medium transition-colors rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed";
  const tabBtnLine =
    "-mb-px rounded-t-md rounded-b-none border border-transparent text-slate-600 dark:text-slate-400 " +
    "hover:z-10 hover:border-slate-200 hover:border-b-0 hover:bg-inherit hover:text-slate-900 dark:hover:border-slate-600 dark:hover:bg-inherit dark:hover:text-slate-100 " +
    "data-[active]:z-10 data-[active]:border-slate-300 data-[active]:border-b-0 data-[active]:bg-inherit data-[active]:text-blue-600 dark:data-[active]:border-slate-600 dark:data-[active]:text-blue-400";
  const tabBtnCard = type === "card"
    ? "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 data-[active]:bg-white data-[active]:text-slate-900 data-[active]:shadow dark:data-[active]:bg-slate-700 dark:data-[active]:text-slate-100"
    : "";

  const handleTabClick = (key: string) => {
    const item = items.find((i) => i.key === key);
    if (item?.disabled) return;
    internalKey.value = key;
    onChange?.(key);
  };

  return (
    <div
      class={twMerge(
        "w-full",
        type === "line" && "bg-slate-50 dark:bg-slate-950",
        className,
      )}
    >
      <div
        role="tablist"
        class={twMerge(
          type === "line" ? lineCls : cardCls,
          fullWidth && "w-full",
          tabListClass,
        )}
      >
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={activeKey === item.key}
            aria-controls={`tabpanel-${item.key}`}
            id={`tab-${item.key}`}
            disabled={item.disabled}
            data-tab-key={item.key}
            data-active={activeKey === item.key ? "" : undefined}
            class={twMerge(
              tabBtnBase,
              type === "line" ? tabBtnLine : tabBtnCard,
              fullWidth && "flex-1",
            )}
            onClick={() => handleTabClick(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`tabpanel-${activeKey}`}
        aria-labelledby={`tab-${activeKey}`}
        class={twMerge("mt-4", panelClass)}
      >
        {items.find((i) => i.key === activeKey)?.children}
      </div>
    </div>
  );
}
