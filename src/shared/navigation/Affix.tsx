/**
 * Affix 固钉（Preact）。
 * 滚动超过阈值后将子节点经 `createPortal` 挂到 `document.body`，`position: fixed` 贴顶；
 * 原位保留占位高度。`scroll` 监听挂在纵向可滚动祖先及 `globalThis`。
 */

import type { ComponentChildren, JSX } from "preact";
import { useLayoutEffect, useRef, useState } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { createPortal } from "preact/compat";
import { twMerge } from "tailwind-merge";

/** 浮层 z-index，需高于常见顶栏（如 z-50） */
const AFFIX_PORTAL_Z = 1030;

/** 调试：需要排障时改为 `true` */
const AFFIX_DEBUG = false;

let affixDebugSeq = 0;

/** 调试输出 `[Affix]` */
function affixDbg(...args: unknown[]) {
  if (!AFFIX_DEBUG) return;
  console.log("[Affix]", ...args);
}

/** IntersectionObserver 阈值 */
const AFFIX_IO_THRESHOLDS = Array.from(
  { length: 21 },
  (_, i) => i / 20,
);

export interface AffixProps {
  /** 子节点 */
  children?: ComponentChildren;
  /** 距离视口顶部的偏移（px），默认 `0` */
  offsetTop?: number;
  /** 额外 class（原位包装器） */
  class?: string;
  /** 固定浮层上的 class（如 shadow） */
  affixClass?: string;
  /** 额外监听 scroll 的容器（元素或 getter） */
  scrollTarget?: Element | (() => Element | null);
  /**
   * 是否避让视口顶部 fixed/sticky 遮挡；为 `false` 则 `top` 仅相对视口顶与 `offsetTop`。
   */
  respectFixedHeader?: boolean;
  /** 测得顶栏高度 > 0 时，固钉与顶栏底之间的额外间距（px），默认 `8` */
  headerGap?: number;
}

function getVerticalScrollAncestors(host: HTMLElement): HTMLElement[] {
  if (typeof getComputedStyle === "undefined") return [];
  const out: HTMLElement[] = [];
  let node: HTMLElement | null = host.parentElement;
  while (node) {
    const s = getComputedStyle(node);
    if (/(auto|scroll|overlay)/.test(s.overflowY)) out.push(node);
    node = node.parentElement;
  }
  return out;
}

function resolveExplicitScrollTarget(
  explicit: AffixProps["scrollTarget"],
): HTMLElement | null {
  if (explicit === undefined) return null;
  const t = typeof explicit === "function" ? explicit() : explicit;
  return t instanceof HTMLElement ? t : null;
}

function resolveHeaderGap(raw: AffixProps["headerGap"]): number {
  if (raw === undefined) return 8;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 8;
  return Math.max(0, Math.min(24, n));
}

const AFFIX_MIN_HOST_HEIGHT = 0.5;

/** 跳过本库 Portal 锚点，避免把浮层当顶栏 */
function isDreamerPortalNode(node: HTMLElement): boolean {
  return node.closest(
    "[view-portal], [data-dreamer-drawer-portal-anchor], [data-dreamer-toast-portal-anchor], [data-dreamer-message-portal-anchor], [data-dreamer-notification-portal-anchor]",
  ) != null;
}

/**
 * 估算视口顶部遮挡高度（fixed/sticky 与文档流顶栏）。
 */
function measureTopObstruction(): number {
  const doc = globalThis.document;
  if (!doc) return 0;
  const vh = globalThis.innerHeight;
  const vw = globalThis.innerWidth;
  let maxBottom = 0;

  const considerTopChromeRect = (r: DOMRectReadOnly) => {
    if (r.height < 1) return;
    if (r.top > 112) return;
    if (r.height > 280 || r.bottom > vh * 0.42) return;
    maxBottom = Math.max(maxBottom, r.bottom);
  };

  if (typeof doc.elementsFromPoint === "function") {
    const xs = [0.12, 0.5, 0.88]
      .map((ratio) => Math.min(Math.max(vw * ratio, 8), vw - 8));

    let probeY = 6;
    for (let layer = 0; layer < 4; layer++) {
      let layerMax = 0;
      for (const x of xs) {
        const stack = doc.elementsFromPoint(x, probeY);
        if (!stack?.length) continue;
        for (const node of stack) {
          if (!(node instanceof HTMLElement)) continue;
          if (isDreamerPortalNode(node)) continue;
          const s = getComputedStyle(node);
          if (s.position !== "fixed" && s.position !== "sticky") continue;
          const r = node.getBoundingClientRect();
          if (r.top > 120 || r.height < 1) continue;
          if (r.height > 280 || r.bottom > vh * 0.42) continue;
          layerMax = Math.max(layerMax, r.bottom);
        }
      }
      if (layerMax <= probeY + 0.5) break;
      maxBottom = Math.max(maxBottom, layerMax);
      probeY = Math.min(layerMax + 3, vh - 4);
      if (probeY >= vh * 0.4) break;
    }
  }

  const body = doc.body;
  if (body) {
    for (
      const el of Array.from(
        body.querySelectorAll("header, [role='banner']"),
      )
    ) {
      if (!(el instanceof HTMLElement)) continue;
      if (isDreamerPortalNode(el)) continue;
      const r = el.getBoundingClientRect();
      const minBannerWidth = Math.min(vw * 0.32, 320);
      if (r.top > 96 || r.width < minBannerWidth) {
        continue;
      }
      considerTopChromeRect(r);
    }
  }

  return Math.min(Math.ceil(maxBottom), Math.floor(vh * 0.45));
}

function computeShouldAffixTop(
  host: HTMLElement,
  offset: number,
  topInset: number,
): boolean {
  const rect = host.getBoundingClientRect();
  if (rect.height < AFFIX_MIN_HOST_HEIGHT) return false;
  return rect.top <= topInset + offset;
}

function getBody(): HTMLElement | null {
  return typeof globalThis.document !== "undefined"
    ? globalThis.document.body
    : null;
}

/**
 * Affix：长页滚动时将子区域钉在视口顶。
 */
export function Affix(props: AffixProps): JSX.Element {
  const {
    children,
    offsetTop = 0,
    class: className,
    affixClass,
    scrollTarget: scrollTargetProp,
    respectFixedHeader = true,
    headerGap: headerGapProp,
  } = props;

  const dbgId = AFFIX_DEBUG ? ++affixDebugSeq : 0;

  const headerGapPx = resolveHeaderGap(headerGapProp);
  const offset = Number(offsetTop) || 0;

  const affixed = useSignal(false);
  const placeholderHeight = useSignal(0);
  const layoutTick = useSignal(0);
  const topInset = useSignal(0);

  /** 与 View 一致：上一宿主仍连接时忽略 ref(null) */
  const hostRef = useRef<HTMLElement | null>(null);
  const [hostNode, setHostNode] = useState<HTMLElement | null>(null);

  const setHostRef = (el: unknown) => {
    const next = (el as HTMLElement | null) ?? null;
    if (AFFIX_DEBUG) {
      affixDbg(
        `#${dbgId} ref`,
        next
          ? {
            tag: next.tagName,
            id: next.id || "",
            connected: next.isConnected,
          }
          : "null",
      );
    }
    if (next === null) {
      const prev = hostRef.current;
      if (prev != null && prev.isConnected) return;
      hostRef.current = null;
      setHostNode(null);
      return;
    }
    hostRef.current = next;
    setHostNode(next);
  };

  let runSyncDebugCount = 0;

  const computePortalStyle = (): Record<string, string> => {
    layoutTick.value;
    if (!affixed.value) return {};
    const el = hostRef.current;
    if (!el) return {};
    const inset = respectFixedHeader ? topInset.value : 0;
    const chromeGap = respectFixedHeader && inset > 0 ? headerGapPx : 0;
    const r = el.getBoundingClientRect();
    return {
      position: "fixed",
      left: `${r.left}px`,
      width: `${r.width}px`,
      zIndex: String(AFFIX_PORTAL_Z),
      boxSizing: "border-box",
      top: `${inset + offset + chromeGap}px`,
      bottom: "auto",
    };
  };

  const bumpLayoutAfterScroll = () => {
    queueMicrotask(() => {
      if (affixed.value) layoutTick.value++;
    });
  };

  useLayoutEffect(() => {
    const host = hostNode;
    if (!host || typeof globalThis.document === "undefined") return;

    const runSync = () => {
      const h = hostRef.current;
      if (!h?.isConnected) {
        if (AFFIX_DEBUG) {
          affixDbg(`#${dbgId} runSync skip`, {
            hasHost: !!h,
            connected: h?.isConnected,
          });
        }
        return;
      }
      let inset = 0;
      if (respectFixedHeader) {
        inset = measureTopObstruction();
        if (!Object.is(topInset.peek(), inset)) topInset.value = inset;
      } else if (!Object.is(topInset.peek(), 0)) {
        topInset.value = 0;
      }

      const chromeGap = respectFixedHeader && inset > 0 ? headerGapPx : 0;
      const next = computeShouldAffixTop(h, offset, inset + chromeGap);
      runSyncDebugCount++;
      if (AFFIX_DEBUG && (next !== affixed.peek() || runSyncDebugCount <= 5)) {
        const r = h.getBoundingClientRect();
        affixDbg(`#${dbgId} runSync`, {
          n: runSyncDebugCount,
          next,
          was: affixed.peek(),
          rectTop: r.top,
          rectBottom: r.bottom,
          innerH: globalThis.innerHeight,
        });
      }
      if (next !== affixed.peek()) {
        if (next) {
          placeholderHeight.value = h.getBoundingClientRect().height;
        } else {
          placeholderHeight.value = 0;
        }
        affixed.value = next;
      }
    };

    const explicitEl = resolveExplicitScrollTarget(scrollTargetProp);
    const ancestors = getVerticalScrollAncestors(host);
    const scrollElements = new Set<HTMLElement>();
    if (explicitEl) scrollElements.add(explicitEl);
    for (const a of ancestors) scrollElements.add(a);

    const onScrollOrResize = () => {
      runSync();
      bumpLayoutAfterScroll();
    };

    for (const el of scrollElements) {
      el.addEventListener("scroll", onScrollOrResize, { passive: true });
    }
    globalThis.addEventListener("scroll", onScrollOrResize, { passive: true });
    globalThis.addEventListener("resize", onScrollOrResize);

    const ioRoot: Element | null = ancestors[0] ?? null;
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        () => {
          queueMicrotask(onScrollOrResize);
        },
        {
          root: ioRoot,
          threshold: AFFIX_IO_THRESHOLDS,
          rootMargin: "0px",
        },
      );
      io.observe(host);
      if (AFFIX_DEBUG) {
        affixDbg(`#${dbgId} IntersectionObserver`, {
          root: ioRoot
            ? ioRoot.tagName + (ioRoot.id ? `#${ioRoot.id}` : "")
            : "viewport",
        });
      }
    }

    if (AFFIX_DEBUG) {
      affixDbg(`#${dbgId} bind scroll`, {
        scrollTargets: [...scrollElements].map((el) =>
          `${el.tagName}${el.id ? `#${el.id}` : ""}`
        ),
        ancestorCount: ancestors.length,
      });
    }

    runSync();
    bumpLayoutAfterScroll();

    return () => {
      io?.disconnect();
      for (const el of scrollElements) {
        el.removeEventListener("scroll", onScrollOrResize);
      }
      globalThis.removeEventListener("scroll", onScrollOrResize);
      globalThis.removeEventListener("resize", onScrollOrResize);
    };
  }, [hostNode, scrollTargetProp, respectFixedHeader, headerGapPx, offset]);

  const body = getBody();
  const showPortal = affixed.value && body != null;

  return (
    <div ref={setHostRef} class={twMerge("w-full min-w-0", className ?? "")}>
      {affixed.value
        ? (
          <div
            class="w-full box-border"
            style={{ minHeight: `${placeholderHeight.value}px` }}
            aria-hidden="true"
          />
        )
        : children}
      {showPortal &&
        createPortal(
          <div
            class={twMerge("max-w-full", affixClass ?? "")}
            style={computePortalStyle()}
          >
            {children}
          </div>,
          body!,
        )}
    </div>
  );
}
