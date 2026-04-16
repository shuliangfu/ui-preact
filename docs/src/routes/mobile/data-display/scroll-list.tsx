/**
 * ScrollList 文档页（概述、引入、示例、API）。路由: /mobile/data-display/scroll-list
 */

import { ScrollList } from "@dreamer/ui-preact/mobile";
import { CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";
import type { JSX } from "preact";
import { useMemo } from "preact/hooks";
import { signal } from "@preact/signals";
import {
  DocsApiTable,
  type DocsApiTableRow,
} from "../../../components/DocsApiTable.tsx";
import { MOBILE_DOC_DEMO_SHELL_BASE } from "../../../components/MobileDocDemo.tsx";

const SCROLL_LIST_API: DocsApiTableRow[] = [
  {
    name:
      "items / renderItem / header / footer / size / split / bordered / itemClass / grid",
    type: "同 List",
    default: "-",
    description:
      "与 {@link List} 一致；分页请用 `items={listRows.value}`。在函数组件内须 `useMemo(() => signal(…), [])` 保持同一 Signal 引用，切勿每次 render 新建 `signal()`，否则列表会回到初值并导致上拉死循环",
  },
  {
    name: "class / listClass",
    type: "string",
    default: "-",
    description: "外层（PullRefresh）与 List 根节点 class",
  },
  {
    name: "refreshLoading",
    type: "Signal | () => boolean",
    default: "-",
    description: "下拉刷新中；推荐 `refreshLoading={sig}`",
  },
  {
    name: "onRefresh",
    type: "() => void | Promise<void>",
    default: "-",
    description: "下拉释放后刷新首页数据",
  },
  {
    name: "loadMoreLoading",
    type: "Signal | () => boolean",
    default: "-",
    description: "加载更多中；为 true 时底部不会重复触发",
  },
  {
    name: "hasMore",
    type: "boolean | Signal | () => boolean",
    default: "true",
    description:
      "为 false 时不再调用 onLoadMore；推荐 `hasMore={sig}`，勿只传 `sig.value`（易与观察器重连不同步）",
  },
  {
    name: "onLoadMore",
    type: "() => void | Promise<void>",
    default: "-",
    description:
      "滚动接近底部时触发分页请求；须在列表内产生过滚动，且上一发完成后须再次滚动才会触发下一发，避免 IO 重连时连载多页",
  },
  {
    name: "disabledPull",
    type: "boolean",
    default: "false",
    description: "禁用下拉刷新",
  },
  {
    name: "noMoreText",
    type: "string",
    default: '"没有更多了"',
    description: "无更多时的底部文案",
  },
  {
    name: "loadMoreRootMargin",
    type: "string",
    default: '"0px 0px 0px 0px"',
    description:
      "IntersectionObserver 的 rootMargin；默认 0 须滚到哨兵进视口；略提前可用如 0px 0px 48px 0px",
  },
  {
    name: "pullRefreshTexts",
    type: "object",
    default: "-",
    description: "透传 PullRefresh 的 pullingText、loadingText 等",
  },
];

const importCode = `import { useMemo } from "preact/hooks";
import { ScrollList } from "@dreamer/ui-preact/mobile";
import { signal } from "@preact/signals";

function Example() {
  const refreshLoading = useMemo(() => signal(false), []);
  const loadMoreLoading = useMemo(() => signal(false), []);
  const items = useMemo(() => signal<Item[]>([]), []);
  return (
    <ScrollList
      items={items.value}
      renderItem={(row) => <span>{row.title}</span>}
      refreshLoading={refreshLoading}
      onRefresh={async () => { /* 重置页码并拉首屏 */ }}
      loadMoreLoading={loadMoreLoading}
      hasMore={page < totalPages}
      onLoadMore={async () => { /* 下一页 */ }}
    />
  );
}`;

/** 演示用：生成一页假数据 */
function makePage(start: number, len: number) {
  return Array.from({ length: len }, (_, i) => ({
    key: `k-${start + i}`,
    children: `条目 ${start + i + 1}`,
  }));
}

/** 首屏条数（与每页追加条数一致，便于演示） */
const FIRST_SCREEN = 10;
/** 每页上拉追加条数 */
const PAGE = 10;
/** 演示数据上限（首屏 10 + 两页各 10 = 30） */
const MAX = 30;

/**
 * 文档示例里**仅列表与分页状态**所在层：`items` 变化时只重算本组件，不重跑外层示意外壳，
 * 减少示意外壳与内层 `PullRefresh` 在 reconcile 时「整块像被换掉」的观感（与 ui-view 文档一致）。
 *
 * @returns 内嵌 ScrollList
 */
function ScrollListDocListBody(): JSX.Element {
  /**
   * Signal 必须在组件实例生命周期内保持同一引用。
   * 若每次 render 都写 `signal(…)`，会换一个新 Signal（初值又回到首屏），表现为上拉后条数不变、`scrollHeight` 不涨、日志里死循环。
   */
  const refreshLoading = useMemo(() => signal(false), []);
  const loadMoreLoading = useMemo(() => signal(false), []);
  /** 当前列表行（上拉只追加新页，勿每次 makePage(0, n) 整表换新对象） */
  const listRows = useMemo(() => signal(makePage(0, FIRST_SCREEN)), []);
  const hasMore = useMemo(() => signal(true), []);

  /* 父级示意外壳为 flex 列 + h-72：须 min-h-0 flex-1 把可滚高度交给 PullRefresh */
  return (
    <ScrollList
      class="min-h-0 flex-1"
      listClass="border-0 rounded-none"
      bordered={false}
      split
      size="sm"
      items={listRows.value}
      refreshLoading={refreshLoading}
      onRefresh={async () => {
        refreshLoading.value = true;
        await new Promise((r) => setTimeout(r, 700));
        listRows.value = makePage(0, FIRST_SCREEN);
        hasMore.value = true;
        refreshLoading.value = false;
      }}
      loadMoreLoading={loadMoreLoading}
      hasMore={hasMore}
      onLoadMore={async () => {
        if (!hasMore.value || loadMoreLoading.value) return;
        loadMoreLoading.value = true;
        await new Promise((r) => setTimeout(r, 600));
        const cur = listRows.value.length;
        const add = Math.min(PAGE, MAX - cur);
        if (add > 0) {
          listRows.value = [...listRows.value, ...makePage(cur, add)];
        }
        hasMore.value = listRows.value.length < MAX;
        loadMoreLoading.value = false;
      }}
    />
  );
}

/**
 * ScrollList 文档内嵌示例：外壳与列表子树分离，外壳 class 固定字符串（与 ui-view 一致）。
 *
 * @returns 带固定高度外框的 ScrollList 演示
 */
function ScrollListDocInteractiveDemo(): JSX.Element {
  const demoRootClass =
    `${MOBILE_DOC_DEMO_SHELL_BASE} flex h-72 min-h-0 flex-col overflow-hidden p-0`;

  return (
    <div class={demoRootClass} data-ui-scrolllist-doc-demo="">
      <ScrollListDocListBody />
    </div>
  );
}

export default function MobileScrollListDoc() {
  return (
    <div class="w-full max-w-3xl space-y-10">
      <section>
        <Title level={1}>ScrollList 滚动列表</Title>
        <Paragraph class="mt-2">
          组合 <code class="text-sm">PullRefresh</code> 与{" "}
          <code class="text-sm">List</code>
          ：顶部下拉刷新，底部接近可视区域时自动触发{" "}
          <code class="text-sm">onLoadMore</code>（基于内层滚动容器的{" "}
          <code class="text-sm">IntersectionObserver</code>）。
        </Paragraph>
      </section>

      <section class="space-y-3">
        <Title level={2}>引入</Title>
        <CodeBlock
          title="代码示例"
          code={importCode}
          language="tsx"
          showLineNumbers
          wrapLongLines
        />
      </section>

      <section class="space-y-8">
        <Title level={2}>示例</Title>
        <div class="space-y-4">
          <Title level={3}>下拉刷新 + 上拉加载</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            在框内<strong>向下拖拽</strong>模拟刷新（重置为{" "}
            <strong>{FIRST_SCREEN}</strong> 条）；须先在列表内<strong>
              滚动
            </strong>
            ，再<strong>滚到底部</strong>才会加载下一页（每页{" "}
            <strong>{PAGE}</strong> 条）；加载后视口仍停在原
            <code class="text-sm">scrollTop</code>
            ，新行在下方需继续下滑查看；演示累计最多 {MAX}{" "}
            条，模拟真实分页而非首屏一次拉满。
          </Paragraph>
          <ScrollListDocInteractiveDemo />
          <CodeBlock
            title="代码示例"
            code={importCode}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>
      </section>

      <section class="space-y-4">
        <Title level={2}>API</Title>
        <DocsApiTable rows={SCROLL_LIST_API} />
      </section>
    </div>
  );
}
