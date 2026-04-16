/**
 * PageHeader 页头（Preact）。
 * 标题、副标题、返回、面包屑、extra、footer。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { IconArrowLeft } from "../basic/icons/ArrowLeft.tsx";
import type { BreadcrumbItem } from "./breadcrumb-types.ts";

export interface PageHeaderProps {
  title: string | ComponentChildren;
  subTitle?: string | ComponentChildren;
  onBack?: () => void;
  breadcrumb?: { items: BreadcrumbItem[] };
  extra?: ComponentChildren;
  footer?: ComponentChildren;
  class?: string;
}

/**
 * 页面顶栏：标题区与可选面包屑。
 */
export function PageHeader(props: PageHeaderProps): JSX.Element {
  const {
    title,
    subTitle,
    onBack,
    breadcrumb,
    extra,
    footer,
    class: className,
  } = props;

  return (
    <header
      class={twMerge(
        "border-b border-slate-200 dark:border-slate-600 pb-4",
        className,
      )}
    >
      {breadcrumb?.items != null && breadcrumb.items.length > 0 && (
        <nav
          class="mb-2 text-sm text-slate-500 dark:text-slate-400"
          aria-label="面包屑"
        >
          {breadcrumb.items.map((item, i) => (
            <span key={i}>
              {item.href != null
                ? (
                  <a
                    href={item.href}
                    class="hover:text-slate-700 dark:hover:text-slate-300"
                    onClick={item.onClick}
                  >
                    {item.label}
                  </a>
                )
                : (
                  <span
                    role={item.onClick ? "button" : undefined}
                    tabIndex={item.onClick ? 0 : undefined}
                    onClick={item.onClick}
                    onKeyDown={item.onClick
                      ? (e: Event) => {
                        const k = e as KeyboardEvent;
                        if (k.key === "Enter" || k.key === " ") {
                          k.preventDefault();
                          item.onClick?.(e);
                        }
                      }
                      : undefined}
                  >
                    {item.label}
                  </span>
                )}
              {i < breadcrumb.items.length - 1 && (
                <span class="mx-1.5" aria-hidden>/</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-3 min-w-0">
          {onBack != null && (
            <button
              type="button"
              class="p-1 -ml-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
              onClick={onBack}
              aria-label="返回"
            >
              <IconArrowLeft class="w-5 h-5" />
            </button>
          )}
          <div class="min-w-0">
            <h1 class="text-xl font-semibold text-slate-900 dark:text-white truncate">
              {title}
            </h1>
            {subTitle != null && (
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {subTitle}
              </p>
            )}
          </div>
        </div>
        {extra != null && <div class="shrink-0">{extra}</div>}
      </div>
      {footer != null && <div class="mt-4">{footer}</div>}
    </header>
  );
}
