/**
 * ScrollList：移动端「列表 + 下拉刷新 + 上拉加载更多」组合。
 * 内层为 {@link ../../shared/data-display/List.tsx}，外包 {@link ../feedback/PullRefresh.tsx}；
 * 底部加载区通过 `List` 的 `loadMore` 插在列表体之后，再经 `IntersectionObserver` 监听占位触发 `onLoadMore`。
 *
 * 行为与 `ui-view` 包内同名组件对齐，要点：
 * - **门闩**：默认可滚时须在滚动根上产生过 `scroll` 才允许触发；上一发加载后须再次近底滚动解锁。
 * - **短列表**：`scrollHeight` 不超出视口时由 {@link relaxLoadMoreLatchIfNoScroll} 放宽门闩，并在 IO 就绪与加载结束后补触发。
 * - **贴底追加**：分页后若 `scrollTop` 仍停在旧底部，可能无新的 `scroll` 事件，须在加载结束节拍用 {@link clearConsumedLatchIfNearBottomIdle} 补解锁。
 * - **滚动根 ref** 须跨渲染稳定（`useRef`），勿每轮新建 holder，否则 `scrollContainerRef` 与 IO 永远对不上。
 *
 */

import type { JSX } from "preact";
import { useCallback, useEffect, useRef } from "preact/hooks";
import { twMerge } from "tailwind-merge";
import {
  type ControlledOpenInput,
  type HasMoreInput,
  readControlledOpenInput,
  readHasMoreInput,
} from "../../shared/feedback/controlled-open.ts";
import {
  List,
  type ListItemProps,
  type ListProps,
} from "../../shared/data-display/List.tsx";
import {
  PullRefresh,
  type PullRefreshProps,
} from "../feedback/PullRefresh.tsx";

/** 从 {@link ListProps} 透传的列表展示相关字段 */
export type ScrollListListProps = Pick<
  ListProps,
  | "items"
  | "renderItem"
  | "header"
  | "footer"
  | "size"
  | "split"
  | "bordered"
  | "itemClass"
  | "grid"
>;

export interface ScrollListProps extends ScrollListListProps {
  /** 最外层容器 class（PullRefresh 根节点） */
  class?: string;
  /** 传给 {@link List} 根节点的 class */
  listClass?: string;
  /** 下拉刷新中；推荐 `signal()` 或 getter，勿只传 `sig.value` 快照 */
  refreshLoading?: ControlledOpenInput;
  /** 下拉松手后的刷新逻辑 */
  onRefresh?: PullRefreshProps["onRefresh"];
  /** 上拉加载中；为 true 时不会重复触发 `onLoadMore` */
  loadMoreLoading?: ControlledOpenInput;
  /**
   * 是否仍有下一页；为 `false` 时不再调用 `onLoadMore`。
   * 未传时视为 `true`；推荐传 `Signal` 或 getter，勿依赖父级不重绘时的 `hasMore={sig.value}` 快照。
   */
  hasMore?: HasMoreInput;
  /** 滚动到底部附近时触发；由父级拉取分页并更新 `items` */
  onLoadMore?: () => void | Promise<void>;
  /** 禁用下拉刷新 */
  disabledPull?: boolean;
  /** 无更多数据时底部提示文案 */
  noMoreText?: string;
  /**
   * 交叉观察 `rootMargin`（扩根盒以提前/延后判定相交）。
   * 默认 **`0px 0px 0px 0px`**：须滚到列表底部哨兵实际进入滚动根可视区才触发；若需略提前可传如 `0px 0px 48px 0px`（仅扩底边）。
   */
  loadMoreRootMargin?: string;
  /**
   * 透传 PullRefresh 文案等（不含 children / class / loading / onRefresh / disabled /
   * scrollContainerRef）。
   */
  pullRefreshTexts?: Pick<
    PullRefreshProps,
    | "pullingText"
    | "loosingText"
    | "loadingText"
    | "successText"
    | "successDuration"
    | "headHeight"
    | "pullDistance"
  >;
}

/** 与 ui-view `ScrollListRuntime` 对齐的、须跨渲染保留的门闩与 DOM 引用 */
type ScrollListRuntime = {
  rootHolder: { el: HTMLDivElement | null };
  sentinelHolder: { el: HTMLDivElement | null };
  disconnectIo: (() => void) | null;
  loadMoreArmedByScroll: boolean;
  loadMoreConsumedUntilScroll: boolean;
  suppressClearConsumedUntilMs: number;
  scrollMetrics: { lastTop: number; lastH: number; lastCh: number };
  detachScrollListener: (() => void) | null;
  loadMoreLayoutSnapshot: { top: number; h: number; ch: number } | null;
  wasLoadMoreLoading: boolean;
  /**
   * 本次 `onLoadMore` 触发前滚动根的 `scrollHeight`；加载结束后若高度未涨，说明 `items` 未进 DOM（如父级每次 render 新建 signal），勿再跑 idle 补偿以免死循环。
   */
  scrollHeightAtEmit: number;
};

/**
 * 创建运行时初始状态（仅挂载时一次写入 `useRef`）。
 *
 * @returns 初始 runtime
 */
function createScrollListRuntime(): ScrollListRuntime {
  return {
    rootHolder: { el: null },
    sentinelHolder: { el: null },
    disconnectIo: null,
    loadMoreArmedByScroll: false,
    loadMoreConsumedUntilScroll: true,
    suppressClearConsumedUntilMs: 0,
    scrollMetrics: { lastTop: 0, lastH: 0, lastCh: 0 },
    detachScrollListener: null,
    loadMoreLayoutSnapshot: null,
    wasLoadMoreLoading: false,
    scrollHeightAtEmit: 0,
  };
}

/**
 * 当前运行时是否具备 `IntersectionObserver`（Hybrid/SSR 的 Deno 侧通常没有）。
 *
 * @returns 可用则为 true
 */
function hasIntersectionObserver(): boolean {
  return typeof IntersectionObserver !== "undefined" &&
    typeof IntersectionObserver === "function";
}

/**
 * 判断滚动容器是否还有可滚动的纵向余量。
 *
 * @param root - `PullRefresh` 内层滚动根
 * @param slop - 允许的像素裕量
 */
function rootHasVerticalScrollRoom(
  root: HTMLDivElement,
  slop = 6,
): boolean {
  return root.scrollHeight > root.clientHeight + slop;
}

/**
 * 判断滚动条是否已接近最大位置（距底 `px` 以内视为近底）。
 *
 * @param root - 内层滚动根
 * @param px - 距底的像素容差
 */
function rootScrollNearBottom(root: HTMLDivElement, px = 56): boolean {
  const maxT = Math.max(0, root.scrollHeight - root.clientHeight);
  if (maxT <= 0) return true;
  return root.scrollTop >= maxT - px;
}

/**
 * 短列表无法产生有效 `scroll` 时放宽门闩，使 IO 仍能驱动分页。
 *
 * @param rt - 运行时
 * @param props - 当前 props（来自 ref，保证闭包内最新）
 */
function relaxLoadMoreLatchIfNoScroll(
  rt: ScrollListRuntime,
  props: ScrollListProps,
): void {
  const root = rt.rootHolder.el;
  if (!root || props.onLoadMore == null) return;
  if (!readHasMoreInput(props.hasMore)) return;
  if (rootHasVerticalScrollRoom(root)) return;
  if (readControlledOpenInput(props.loadMoreLoading)) return;
  if (Date.now() <= rt.suppressClearConsumedUntilMs) return;
  rt.loadMoreArmedByScroll = true;
  rt.loadMoreConsumedUntilScroll = false;
}

/**
 * 一次加载结束后：若当前已在近底，清除 `loadMoreConsumedUntilScroll`。
 * 用户本就贴在旧 `maxScroll` 时，列表增高后可能不会派发新的 `scroll`，仅靠 {@link relaxLoadMoreLatchIfNoScroll} 无法解锁可滚列表。
 * **不**检查 {@link ScrollListRuntime.suppressClearConsumedUntilMs}：该抑制窗用于避免「纠偏 scroll」与 `onScroll` 抢解锁；加载结束节拍常仍落在抑制窗内，若此处也判断会永远无法贴底解锁。
 *
 * @param rt - 运行时
 * @param props - 当前 props
 */
function clearConsumedLatchIfNearBottomIdle(
  rt: ScrollListRuntime,
  props: ScrollListProps,
): void {
  const root = rt.rootHolder.el;
  if (!root) return;
  if (readControlledOpenInput(props.loadMoreLoading)) return;
  if (!rootHasVerticalScrollRoom(root)) return;
  if (!rootScrollNearBottom(root)) return;
  rt.loadMoreConsumedUntilScroll = false;
}

/**
 * 在滚动根与占位节点就绪时挂载 `IntersectionObserver`，卸载时断开。
 *
 * @param root - `PullRefresh` 内层滚动容器
 * @param sentinel - 列表底部占位
 * @param opts - 触发条件与回调
 * @returns 断开观察的清理函数
 */
function bindLoadMoreObserver(
  root: HTMLDivElement,
  sentinel: HTMLDivElement,
  opts: {
    rootMargin: string;
    onNeedLoad: () => void;
  },
): () => void {
  if (!hasIntersectionObserver()) {
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      const hit = entries.some((e) => e.isIntersecting);
      if (hit) opts.onNeedLoad();
    },
    { root, rootMargin: opts.rootMargin, threshold: 0 },
  );
  io.observe(sentinel);
  /** 延后 `takeRecords`，与 ui-view 一致，避免同步栈上与 loading 竞态连刷 */
  queueMicrotask(() => {
    if (typeof io.takeRecords !== "function") return;
    for (const e of io.takeRecords()) {
      if (e.isIntersecting) {
        opts.onNeedLoad();
        break;
      }
    }
  });
  return () => {
    io.disconnect();
  };
}

/**
 * 移动端可滚动列表：下拉刷新 + 底部自动加载更多（逻辑对齐 ui-view）。
 *
 * @param props - 列表数据、刷新/加载回调与透传配置
 */
export function ScrollList(props: ScrollListProps): JSX.Element {
  const {
    class: className,
    listClass,
    refreshLoading,
    onRefresh,
    disabledPull = false,
    noMoreText = "没有更多了",
    pullRefreshTexts,
    items,
    renderItem,
    header,
    footer,
    size,
    split,
    bordered,
    itemClass,
    grid,
  } = props;

  const loadingMore = readControlledOpenInput(props.loadMoreLoading);
  const hasMoreNow = readHasMoreInput(props.hasMore);

  const propsRef = useRef(props);
  propsRef.current = props;

  const rtRef = useRef<ScrollListRuntime>(createScrollListRuntime());

  /**
   * 同一次 `onLoadMore` 尚未返回时不再触发，避免 IO / scroll / rAF 同帧叠两次。
   */
  const loadMoreEmitBusyRef = useRef(false);

  /**
   * 满足门闩与 `hasMore` / `loadMoreLoading` 时触发一次 `onLoadMore`。
   * 与 ui-view 的 `tryEmitLoadMore` 条件一致。
   */
  const tryEmitLoadMore = useCallback(() => {
    const p = propsRef.current;
    const rt = rtRef.current;
    const fn = p.onLoadMore;
    if (!fn) return;
    if (loadMoreEmitBusyRef.current) return;
    if (!readHasMoreInput(p.hasMore)) return;
    if (readControlledOpenInput(p.loadMoreLoading)) return;
    const root = rt.rootHolder.el;
    if (!root) return;
    const scrollable = rootHasVerticalScrollRoom(root);
    if (rt.loadMoreConsumedUntilScroll) return;
    if (!rt.loadMoreArmedByScroll && scrollable) return;
    rt.loadMoreLayoutSnapshot = {
      top: root.scrollTop,
      h: root.scrollHeight,
      ch: root.clientHeight,
    };
    rt.suppressClearConsumedUntilMs = Date.now() + 760;
    rt.loadMoreConsumedUntilScroll = true;
    rt.scrollHeightAtEmit = root.scrollHeight;
    loadMoreEmitBusyRef.current = true;
    try {
      const ret = fn();
      if (ret != null && typeof (ret as PromiseLike<void>).then === "function") {
        (ret as PromiseLike<void>).then(
          () => {
            loadMoreEmitBusyRef.current = false;
          },
          () => {
            loadMoreEmitBusyRef.current = false;
          },
        );
      } else {
        loadMoreEmitBusyRef.current = false;
      }
    } catch (e) {
      loadMoreEmitBusyRef.current = false;
      throw e;
    }
  }, []);

  /**
   * 断开旧观察器并在根节点与占位就绪时重新挂载。
   */
  const reconnectObserver = useCallback(() => {
    const rt = rtRef.current;
    rt.disconnectIo?.();
    rt.disconnectIo = null;
    const root = rt.rootHolder.el;
    const sentinel = rt.sentinelHolder.el;
    const p = propsRef.current;
    if (!root || !sentinel || !p.onLoadMore) return;
    const margin = p.loadMoreRootMargin ?? "0px 0px 0px 0px";
    rt.disconnectIo = bindLoadMoreObserver(root, sentinel, {
      rootMargin: margin,
      onNeedLoad: tryEmitLoadMore,
    });
  }, [tryEmitLoadMore]);

  /**
   * `hasMore` / `loadMoreRootMargin` / `onLoadMore` 变化时重连 IO。
   * **勿**把 `loadMoreLoading` 放进依赖：`loading` 每翻一次就 disconnect + `takeRecords`，易与 idle 补偿叠成连刷。
   */
  useEffect(() => {
    void hasMoreNow;
    void props.loadMoreRootMargin;
    void (props.onLoadMore != null);
    queueMicrotask(() => reconnectObserver());
    return () => {
      const rt = rtRef.current;
      rt.disconnectIo?.();
      rt.disconnectIo = null;
    };
  }, [
    hasMoreNow,
    props.loadMoreRootMargin,
    props.onLoadMore != null,
    reconnectObserver,
  ]);

  /**
   * `loadMoreLoading` 刚变为 true 时拍快照（与 ui-view 一致，便于后续扩展纠偏）。
   */
  useEffect(() => {
    const rt = rtRef.current;
    const p = propsRef.current;
    const lm = readControlledOpenInput(p.loadMoreLoading);
    const root = rt.rootHolder.el;
    if (lm && !rt.wasLoadMoreLoading && root) {
      rt.loadMoreLayoutSnapshot = {
        top: root.scrollTop,
        h: root.scrollHeight,
        ch: root.clientHeight,
      };
    }
    rt.wasLoadMoreLoading = lm;
  }, [loadingMore]);

  /**
   * 上一拍是否为「加载中」：用于区分「首屏挂载 loading=false」与「一次加载结束」，避免挂载节拍跑补偿与 IO 抢触发导致底部「加载中」闪动。
   */
  const prevLoadMoreLoadingRef = useRef<boolean | null>(null);

  /**
   * 加载结束后：短列表放宽门闩并尝试触发；可滚列表若在贴底无新 `scroll`，补清 `consumedUntilScroll` 后再尝试（下一帧再判一次布局）。
   * **不在首屏挂载时执行**（仅当 `loadingMore` 刚从 true 变为 false）。
   */
  useEffect(() => {
    const prev = prevLoadMoreLoadingRef.current;
    prevLoadMoreLoadingRef.current = loadingMore;

    if (loadingMore) return;

    /** 首屏：ref 从 null→false，不跑补偿 */
    if (prev === null) {
      return;
    }

    /** 仅在一次加载流程结束后跑贴底补偿，避免从未加载过的页面误触发 */
    if (prev !== true) {
      return;
    }

    queueMicrotask(() => {
      const rt = rtRef.current;
      const p = propsRef.current;
      if (readControlledOpenInput(p.loadMoreLoading)) return;
      const root = rt.rootHolder.el;
      if (
        root != null &&
        rt.scrollHeightAtEmit > 0 &&
        root.scrollHeight <= rt.scrollHeightAtEmit + 2
      ) {
        rt.scrollHeightAtEmit = 0;
        return;
      }
      rt.scrollHeightAtEmit = 0;
      relaxLoadMoreLatchIfNoScroll(rt, p);
      clearConsumedLatchIfNearBottomIdle(rt, p);
      if (root != null && !rootHasVerticalScrollRoom(root)) {
        tryEmitLoadMore();
      }
      const g = globalThis as typeof globalThis & {
        requestAnimationFrame?: (cb: () => void) => number;
      };
      if (typeof g.requestAnimationFrame !== "function") return;
      g.requestAnimationFrame(() => {
        const rt2 = rtRef.current;
        const p2 = propsRef.current;
        if (readControlledOpenInput(p2.loadMoreLoading)) return;
        clearConsumedLatchIfNearBottomIdle(rt2, p2);
        tryEmitLoadMore();
      });
    });
  }, [loadingMore, tryEmitLoadMore]);

  /**
   * 将 `PullRefresh` 内层滚动根与 holder 同步：挂 `scroll` 门闩、短列表微任务补触发。
   *
   * @param el - 滚动容器或 null
   */
  const setScrollRoot = useCallback(
    (el: HTMLDivElement | null) => {
      const rt = rtRef.current;
      rt.detachScrollListener?.();
      rt.detachScrollListener = null;

      const prevScrollRoot = rt.rootHolder.el;
      rt.rootHolder.el = el;

      if (!el) {
        rt.loadMoreArmedByScroll = false;
        rt.loadMoreConsumedUntilScroll = true;
        rt.suppressClearConsumedUntilMs = 0;
      } else if (el !== prevScrollRoot) {
        rt.loadMoreArmedByScroll = false;
        rt.loadMoreConsumedUntilScroll = true;
        rt.suppressClearConsumedUntilMs = 0;
      }

      if (el) {
        /**
         * 滚动时维护门闩，并在近底时解锁「上一发后须再滚动」；近底微任务顺带 `tryEmit`。
         *
         * @returns void
         */
        const onScroll = () => {
          const st = el.scrollTop;
          rt.scrollMetrics.lastH = el.scrollHeight;
          rt.scrollMetrics.lastCh = el.clientHeight;
          rt.loadMoreArmedByScroll = true;
          const loadingNow = readControlledOpenInput(
            propsRef.current.loadMoreLoading,
          );
          if (
            !loadingNow &&
            Date.now() > rt.suppressClearConsumedUntilMs &&
            rootScrollNearBottom(el)
          ) {
            rt.loadMoreConsumedUntilScroll = false;
          }
          if (st > 0) {
            rt.scrollMetrics.lastTop = st;
          }
          queueMicrotask(() => {
            if (rootScrollNearBottom(el)) tryEmitLoadMore();
          });
        };
        el.addEventListener("scroll", onScroll, { passive: true });
        rt.detachScrollListener = () => {
          el.removeEventListener("scroll", onScroll);
        };

        queueMicrotask(() => {
          relaxLoadMoreLatchIfNoScroll(rt, propsRef.current);
          if (el != null && !rootHasVerticalScrollRoom(el)) {
            tryEmitLoadMore();
          }
        });
      }

      reconnectObserver();
    },
    [reconnectObserver, tryEmitLoadMore],
  );

  /**
   * 列表底部占位 ref：仅同步哨兵并重建 IO。
   *
   * @param el - 占位节点或 null
   */
  const setSentinel = useCallback(
    (el: HTMLDivElement | null) => {
      rtRef.current.sentinelHolder.el = el;
      reconnectObserver();
    },
    [reconnectObserver],
  );

  useEffect(() => {
    return () => {
      const rt = rtRef.current;
      rt.disconnectIo?.();
      rt.disconnectIo = null;
      rt.detachScrollListener?.();
      rt.detachScrollListener = null;
    };
  }, []);

  const loadMoreSlot = (
    <div class="flex flex-col gap-2">
      {loadingMore && (
        <div class="text-center text-sm text-slate-500 dark:text-slate-400 py-2">
          加载中…
        </div>
      )}
      {!hasMoreNow && (
        <div class="text-center text-sm text-slate-400 dark:text-slate-500 py-2">
          {noMoreText}
        </div>
      )}
      <div
        ref={setSentinel}
        class="h-2 w-full shrink-0"
        aria-hidden="true"
        data-ui-scroll-list-sentinel=""
      />
    </div>
  );

  return (
    <PullRefresh
      {...pullRefreshTexts}
      class={twMerge(
        "flex min-h-0 flex-1 flex-col isolate",
        className,
      )}
      loading={refreshLoading}
      onRefresh={onRefresh}
      disabled={disabledPull}
      scrollContainerRef={setScrollRoot}
    >
      <List
        items={items as ListItemProps[] | unknown[]}
        renderItem={renderItem}
        header={header}
        footer={footer}
        size={size}
        split={split}
        bordered={bordered}
        itemClass={itemClass}
        grid={grid}
        /**
         * 勿加 `flex-1`：在 PullRefresh 的 flex 链里会把列表压成视口高，滚动根无法产生可滚高度。
         */
        class={twMerge("min-h-0", listClass)}
        loadMore={props.onLoadMore != null ? loadMoreSlot : undefined}
      />
    </PullRefresh>
  );
}
