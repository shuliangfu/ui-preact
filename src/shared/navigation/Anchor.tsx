/**
 * Anchor 锚点导航（Preact）。
 * 链接列表 + 可选 {@link initAnchorSpy} 滚动高亮。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";

export interface AnchorLink {
  key: string;
  href: string;
  title: string | ComponentChildren;
}

export interface AnchorProps {
  links: AnchorLink[];
  activeKey?: string;
  onChange?: (key: string) => void;
  class?: string;
}

/** 客户端用「当前路径 + hash」作为 href */
function getAnchorHref(hashHref: string): string {
  if (typeof globalThis.location === "undefined") return hashHref;
  const pathname = globalThis.location.pathname ?? "/";
  return pathname + (hashHref.startsWith("#") ? hashHref : `#${hashHref}`);
}

/**
 * 垂直锚点链接列表。
 */
export function Anchor(props: AnchorProps): JSX.Element {
  const { links, activeKey, onChange, class: className } = props;

  const handleClick = (e: Event, key: string, href: string) => {
    e.preventDefault();
    const selector = href.startsWith("#") ? href : `#${href}`;
    const el = typeof globalThis.document !== "undefined"
      ? globalThis.document.querySelector(selector)
      : null;
    if (el) {
      (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
    }
    onChange?.(key);
  };

  return (
    <nav
      class={twMerge("flex flex-col gap-1 text-sm", className)}
      aria-label="锚点导航"
    >
      {links.map((link) => {
        const isActive = activeKey === link.key;
        return (
          <a
            key={link.key}
            href={getAnchorHref(link.href)}
            class={twMerge(
              "py-1 px-2 rounded truncate",
              isActive
                ? "text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100",
            )}
            onClick={(e: Event) => handleClick(e, link.key, link.href)}
          >
            {link.title}
          </a>
        );
      })}
    </nav>
  );
}

/** {@link initAnchorSpy} 的配置 */
export interface AnchorSpyOptions {
  links: AnchorLink[];
  offset?: number;
  target?: Element | (() => Element | null);
}

/**
 * 根据滚动位置更新当前高亮（scroll spy）。
 */
export function initAnchorSpy(
  setActiveKey: (key: string) => void,
  options?: AnchorSpyOptions,
): (() => void) | undefined {
  if (typeof globalThis.document === "undefined") return;
  const offset = options?.offset ?? 100;
  const getTarget = (): Element | null => {
    if (!options?.target) return null;
    return typeof options.target === "function"
      ? options.target()
      : options.target;
  };
  const linkIds = options?.links
    ? options.links.map((l) => ({
      key: l.key,
      id: l.href.replace(/^#/, ""),
    }))
    : null;

  const onScroll = () => {
    const target = getTarget();
    let scrollTop: number;
    let viewportTop: number;
    if (target && "scrollTop" in target) {
      scrollTop = (target as HTMLElement).scrollTop;
      const tr = target.getBoundingClientRect();
      viewportTop = tr.top;
    } else {
      scrollTop = globalThis.scrollY ?? globalThis.pageYOffset;
      viewportTop = 0;
    }
    let currentKey: string | null = null;
    const check = (el: Element, _id: string, key?: string) => {
      const rect = (el as HTMLElement).getBoundingClientRect();
      const top = rect.top - viewportTop + scrollTop;
      if (scrollTop >= top - offset) currentKey = key ?? (el as HTMLElement).id;
    };
    if (linkIds?.length) {
      linkIds.forEach(({ key, id }) => {
        const el = globalThis.document.getElementById(id);
        if (el) check(el, id, key);
      });
    } else {
      globalThis.document.querySelectorAll("[id]").forEach((el) => {
        const id = (el as HTMLElement).id;
        if (id) check(el, id);
      });
    }
    if (currentKey) setActiveKey(currentKey);
  };
  const target = getTarget();
  if (target) target.addEventListener("scroll", onScroll, { passive: true });
  else globalThis.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  return () => {
    const t = getTarget();
    if (t) t.removeEventListener("scroll", onScroll);
    else globalThis.removeEventListener("scroll", onScroll);
  };
}
