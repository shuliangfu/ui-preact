/**
 * Card 卡片（Preact）。
 * 通用内容容器；支持标题、extra、封面图、footer、边框、悬浮、尺寸、loading。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import type { SizeVariant } from "../types.ts";

export interface CardProps {
  /** 卡片标题 */
  title?: ComponentChildren;
  /** 标题右侧额外区域 */
  extra?: ComponentChildren;
  /** 封面图或节点（显示在顶部） */
  cover?: ComponentChildren;
  /** 卡片内容 */
  children?: ComponentChildren;
  /** 底部区域 */
  footer?: ComponentChildren;
  /** 底部操作组（图标/按钮列表），显示在 footer 上方 */
  actions?: ComponentChildren[];
  /** 是否带边框，默认 true */
  bordered?: boolean;
  /** 是否悬浮阴影效果 */
  hoverable?: boolean;
  /** 点击回调 */
  onClick?: (e: Event) => void;
  /** 尺寸 */
  size?: SizeVariant;
  /** 是否加载态（显示骨架占位） */
  loading?: boolean;
  /** 额外 class */
  class?: string;
  /** 内容区 class */
  bodyClass?: string;
  /** 标题区 class */
  headerClass?: string;
}

const sizeClasses: Record<SizeVariant, string> = {
  xs: "p-3 text-xs",
  sm: "p-4 text-sm",
  md: "p-5 text-sm",
  lg: "p-6 text-base",
};

/**
 * Card：卡片容器。
 */
export function Card(props: CardProps): JSX.Element {
  const {
    title,
    extra,
    cover,
    children,
    footer,
    actions,
    bordered = true,
    hoverable = false,
    onClick,
    size = "md",
    loading = false,
    class: className,
    bodyClass,
    headerClass,
  } = props;

  const paddingCls = sizeClasses[size];

  return (
    <div
      class={twMerge(
        "rounded-lg bg-white dark:bg-slate-800 overflow-hidden",
        bordered && "border border-slate-200 dark:border-slate-600",
        hoverable && "transition-shadow hover:shadow-md",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      {cover != null && (
        <div class="overflow-hidden rounded-t-lg first:rounded-t-lg">
          {cover}
        </div>
      )}
      {(title != null || extra != null) && (
        <div
          class={twMerge(
            "flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-600",
            paddingCls,
            headerClass,
          )}
        >
          <div class="font-semibold text-slate-900 dark:text-white truncate min-w-0">
            {title}
          </div>
          {extra != null && <div class="shrink-0">{extra}</div>}
        </div>
      )}
      <div class={twMerge(paddingCls, bodyClass)}>
        {loading
          ? (
            <div class="animate-pulse space-y-2">
              <div class="h-3 bg-slate-200 dark:bg-slate-600 rounded w-full" />
              <div class="h-3 bg-slate-200 dark:bg-slate-600 rounded w-5/6" />
              <div class="h-3 bg-slate-200 dark:bg-slate-600 rounded w-4/6" />
            </div>
          )
          : children}
      </div>
      {actions != null && actions.length > 0 && (
        <div class="flex items-center border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          {actions.map((action, i) => (
            <div
              key={i}
              class={twMerge(
                "flex-1 flex items-center justify-center py-3 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors cursor-pointer",
                i < actions.length - 1 &&
                  "border-r border-slate-200 dark:border-slate-700",
              )}
            >
              {action}
            </div>
          ))}
        </div>
      )}
      {footer != null && (
        <div
          class={twMerge(
            "border-t border-slate-200 dark:border-slate-600",
            paddingCls,
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
