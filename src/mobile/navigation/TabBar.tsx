/**
 * TabBar 底部标签栏（Preact）。
 * 移动端底部导航；items(key/label/icon)、activeKey、onChange。
 * `activeKey` 支持 `Signal` / 零参 getter，勿仅传 `sig.value`（Hybrid 下可能不更新）。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import {
  type ControlledStringInput,
  readControlledStringInput,
} from "../../shared/feedback/controlled-open.ts";

export interface TabBarItem {
  /** 唯一 key */
  key: string;
  /** 文案 */
  label: string | ComponentChildren;
  /** 图标（可选） */
  icon?: ComponentChildren;
  /** 角标：数字或字符串显示在图标旁，或自定义节点；不传则不显示 */
  badge?: number | string | ComponentChildren;
}

export interface TabBarProps {
  /** 标签项 */
  items: TabBarItem[];
  /** 当前选中的 key；推荐 `activeKey={sig}`，勿 `activeKey={sig.value}` */
  activeKey?: ControlledStringInput;
  /** 切换回调 */
  onChange?: (key: string) => void;
  /** 是否固定在底部（fixed bottom-0），默认 true */
  fixed?: boolean;
  /** 是否显示上边框，默认 true */
  border?: boolean;
  /** 是否开启底部安全区占位（如 iPhone 刘海底），默认 true */
  safeAreaInsetBottom?: boolean;
  /** 额外 class */
  class?: string;
}

/**
 * 底部 Tab 导航：高亮随受控 `activeKey` 更新（含 Signal）。
 *
 * @param props - 项列表、当前 key、样式开关
 */
export function TabBar(props: TabBarProps): JSX.Element {
  const {
    items,
    onChange,
    fixed = true,
    border = true,
    safeAreaInsetBottom = true,
    class: className,
  } = props;

  /** 每帧解析受控 key，保证 Hybrid 下切换能刷新高亮 */
  const activeKeyResolved = readControlledStringInput(props.activeKey) ?? "";

  return (
    <nav
      class={twMerge(
        "flex items-center justify-around bg-white dark:bg-slate-800",
        border && "border-t border-slate-200 dark:border-slate-600",
        safeAreaInsetBottom && "pb-safe",
        fixed && "fixed left-0 right-0 bottom-0 z-30",
        className,
      )}
      role="tablist"
      aria-label="底部导航"
    >
      {items.map((item) => {
        const selected = activeKeyResolved === item.key;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={selected}
            class={twMerge(
              "flex flex-col items-center justify-center gap-1 py-2 px-4 min-w-0 flex-1 relative",
              "text-xs transition-colors",
              selected
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300",
            )}
            onClick={() => onChange?.(item.key)}
          >
            {(item.icon != null || item.badge != null) && (
              <span class="shrink-0 flex items-center justify-center w-6 h-6 relative">
                {item.icon != null && (
                  <>
                    {/* Icon 根节点默认色会盖住父级选中色，用 [&>span] 强制对齐选中态 */}
                    <span
                      class={twMerge(
                        selected
                          ? "[&>span]:!text-blue-600 dark:[&>span]:!text-blue-400"
                          : "[&>span]:!text-slate-500 dark:[&>span]:!text-slate-400",
                      )}
                    >
                      {item.icon}
                    </span>
                  </>
                )}
                {item.badge != null && (
                  <span class="absolute -top-0.5 -right-1 min-w-[1rem] h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-medium">
                    {typeof item.badge === "number"
                      ? (item.badge > 99 ? "99+" : String(item.badge))
                      : typeof item.badge === "string"
                      ? item.badge
                      : item.badge}
                  </span>
                )}
              </span>
            )}
            <span class="truncate w-full text-center">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
