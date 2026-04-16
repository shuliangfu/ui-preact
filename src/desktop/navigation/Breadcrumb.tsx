/**
 * Breadcrumb 面包屑（Preact）。
 * 桌面更常见：层级路径；支持自定义分隔符、最后一项不可点击、无 href 时 onClick/onItemClick。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { Link } from "../../shared/basic/Link.tsx";
/** 按需：单文件图标，避免经 icons/mod 拉入全表 */
import { IconChevronRight } from "../../shared/basic/icons/ChevronRight.tsx";
import type { BreadcrumbItem } from "../../shared/navigation/breadcrumb-types.ts";

export type { BreadcrumbItem };
export interface BreadcrumbProps {
  /** 面包屑项 */
  items: BreadcrumbItem[];
  /** 自定义分隔符节点；不传则默认 ChevronRight 图标 */
  separator?: ComponentChildren;
  /** 某项无 href 时的点击回调（传入 item 与 index） */
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  /** 额外 class（作用于 nav 容器） */
  class?: string;
}

/**
 * 面包屑导航：语义化 `nav` + `ol`，末项 `aria-current`。
 *
 * @param props - 路径项与分隔符
 */
export function Breadcrumb(props: BreadcrumbProps): JSX.Element {
  const { items, separator, onItemClick, class: className } = props;

  const defaultSeparator = (
    <span
      class="shrink-0 mx-1.5 text-slate-400 dark:text-slate-500"
      aria-hidden
    >
      <IconChevronRight class="w-4 h-4" />
    </span>
  );
  const sep = separator ?? defaultSeparator;

  return (
    <nav
      aria-label="Breadcrumb"
      class={twMerge("flex items-center flex-wrap gap-0 text-sm", className)}
    >
      <ol class="flex items-center flex-wrap gap-0 list-none p-0 m-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const hasClick = !isLast &&
            (item.onClick != null || onItemClick != null) &&
            (item.href == null || item.href === "");
          return (
            <li key={index} class="flex items-center gap-0">
              {index > 0 && sep}
              {isLast
                ? (
                  <span
                    class="text-slate-600 dark:text-slate-400 font-medium"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                )
                : item.href != null && item.href !== ""
                ? (
                  <Link
                    href={item.href}
                    class="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    {item.label}
                  </Link>
                )
                : hasClick
                ? (
                  <button
                    type="button"
                    class="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-transparent border-none cursor-pointer p-0 text-sm"
                    onClick={(e: Event) => {
                      item.onClick?.(e);
                      onItemClick?.(item, index);
                    }}
                  >
                    {item.label}
                  </button>
                )
                : (
                  <span class="text-slate-600 dark:text-slate-400">
                    {item.label}
                  </span>
                )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
