/**
 * BackTop 回到顶部（Preact）。
 * 长页浮动按钮，平滑滚动到顶部。
 * 文档等布局常在 `<main overflow-y-auto>` 内滚动而非 `window`，默认需同时处理 `scrollY` 与主滚动容器。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { IconChevronUp } from "../basic/icons/ChevronUp.tsx";

export type BackTopTarget = (() => Element | null) | string | Element | null;

export interface BackTopProps {
  visibilityHeight?: number;
  target?: BackTopTarget;
  visible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  /** 点击时先调用；**仍会执行默认回到顶部滚动**（与仅「通知」的常见用法一致） */
  onClick?: () => void;
  right?: number;
  bottom?: number;
  children?: ComponentChildren;
  class?: string;
}

type BackTopEntry = {
  el: HTMLElement;
  getScrollTop: () => number;
  visibilityHeight: number;
  onVisibilityChange: (v: boolean) => void;
};

const entries: BackTopEntry[] = [];
/** 已在 `window` 上挂过 scroll */
let windowScrollAttached = false;
/** 已在具体元素上挂过 scroll（WeakSet 防止重复监听同一 DOM） */
const elementScrollRoots = new WeakSet<Element>();

function getScrollTarget(target: BackTopTarget | undefined): Element | null {
  if (target == null) return null;
  if (typeof target === "function") return target();
  if (typeof target === "string") {
    return globalThis.document?.querySelector(target) ?? null;
  }
  return target;
}

/**
 * 未指定 `target` 时，尝试找到实际承担纵向滚动的元素（如文档站 `main.overflow-y-auto`）。
 *
 * @returns 可带 `scrollTop` 的元素；找不到时返回 null（回退到 `window`/`document`）
 */
function getDefaultScrollContainer(): HTMLElement | null {
  const doc = globalThis.document;
  if (!doc) return null;
  const main = doc.querySelector("main");
  if (!(main instanceof HTMLElement)) return null;
  const oy = globalThis.getComputedStyle(main).overflowY;
  if (oy === "auto" || oy === "scroll" || oy === "overlay") return main;
  return null;
}

/**
 * 读取当前「视口级」纵向滚动量：`window` 与常见主栏容器取较大值，避免只监听到其一。
 *
 * @param explicitTarget - `props.target` 解析结果；非 null 时只读该元素
 */
function getScrollTopFromTarget(explicitTarget: Element | null): number {
  if (explicitTarget) {
    return (explicitTarget as HTMLElement).scrollTop ?? 0;
  }
  const win = globalThis.scrollY ?? globalThis.pageYOffset ?? 0;
  const main = getDefaultScrollContainer();
  const mainTop = main?.scrollTop ?? 0;
  return Math.max(win, mainTop);
}

function onScroll() {
  const next = entries.filter((e) => e.el.isConnected);
  entries.length = 0;
  entries.push(...next);
  for (const e of entries) {
    const top = e.getScrollTop();
    e.onVisibilityChange(top >= e.visibilityHeight);
  }
}

/**
 * 为默认模式挂上 `window` 与（若存在）`main` 等滚动容器的监听，避免只绑 `window` 时主栏滚动不触发显隐。
 *
 * @param explicitTarget - 非 null 时只在该元素上监听
 */
function attachScrollListeners(explicitTarget: Element | null): void {
  if (explicitTarget != null) {
    if (!elementScrollRoots.has(explicitTarget)) {
      elementScrollRoots.add(explicitTarget);
      explicitTarget.addEventListener("scroll", onScroll, { passive: true });
    }
    return;
  }
  if (!windowScrollAttached) {
    windowScrollAttached = true;
    globalThis.addEventListener("scroll", onScroll, { passive: true });
  }
  const main = getDefaultScrollContainer();
  if (main != null && !elementScrollRoots.has(main)) {
    elementScrollRoots.add(main);
    main.addEventListener("scroll", onScroll, { passive: true });
  }
}

/**
 * 将 `window`、document 与常见主滚动容器滚到顶部（不传 `target` 时全部尝试，适配 flex+main 布局）。
 *
 * @param explicitTarget - 若指定则只滚该元素
 */
function scrollToTopSmooth(explicitTarget: Element | null): void {
  const opts: ScrollToOptions = { top: 0, behavior: "smooth" };
  if (explicitTarget instanceof HTMLElement) {
    explicitTarget.scrollTo(opts);
    return;
  }
  globalThis.scrollTo?.(opts);
  const doc = globalThis.document;
  doc?.scrollingElement?.scrollTo?.(opts);
  doc?.documentElement?.scrollTo?.(opts);
  doc?.body?.scrollTo?.(opts);
  const main = getDefaultScrollContainer();
  main?.scrollTo?.(opts);
}

/**
 * 固定定位「回到顶部」按钮；需父级根据 `onVisibilityChange` 维护 `visible`。
 */
export function BackTop(props: BackTopProps): JSX.Element {
  const {
    visibilityHeight = 200,
    target: targetProp,
    visible = true,
    onVisibilityChange,
    onClick,
    right = 24,
    bottom = 24,
    children,
    class: className,
  } = props;

  const setWrapperRef = (el: unknown) => {
    const div = el as HTMLDivElement | null;
    if (!div) return;
    if (!onVisibilityChange) return;
    if (entries.some((e) => e.el === div)) return;
    const explicitTarget = getScrollTarget(targetProp);
    const getScrollTop = () => getScrollTopFromTarget(explicitTarget);
    entries.push({
      el: div,
      getScrollTop,
      visibilityHeight,
      onVisibilityChange,
    });
    attachScrollListeners(explicitTarget);
    onScroll();
  };

  /**
   * 点击：先执行可选 `onClick`，再按 `target`/默认容器平滑滚顶。
   */
  const handleClick = () => {
    onClick?.();
    const explicitTarget = getScrollTarget(targetProp);
    scrollToTopSmooth(explicitTarget);
  };

  return (
    <div
      ref={setWrapperRef}
      class={twMerge(
        "back-top-host",
        !visible && "pointer-events-none invisible opacity-0",
      )}
      style={{
        position: "fixed",
        right: `${right}px`,
        bottom: `${bottom}px`,
        zIndex: 100,
        transition: "opacity 0.2s, visibility 0.2s",
      }}
    >
      <button
        type="button"
        class={twMerge(
          "flex items-center justify-center w-10 h-10 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition",
          "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white",
          className,
        )}
        onClick={handleClick}
        aria-label="回到顶部"
      >
        {children != null
          ? children
          : <IconChevronUp class="w-5 h-5 text-inherit" />}
      </button>
    </div>
  );
}
