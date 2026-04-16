/**
 * PullRefresh 文档页（概述、引入、示例、API）。路由: /mobile/feedback/pull-refresh
 */

import { PullRefresh } from "@dreamer/ui-preact/mobile";
import { CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";
import {
  DocsApiTable,
  type DocsApiTableRow,
} from "../../../components/DocsApiTable.tsx";
import { MobileDocDemo } from "../../../components/MobileDocDemo.tsx";

const PULL_REFRESH_API: DocsApiTableRow[] = [
  {
    name: "loading",
    type: "Signal | () => boolean",
    default: "-",
    description: "是否加载中；推荐 `loading={sig}`，勿仅传 `sig.value`",
  },
  {
    name: "onRefresh",
    type: "() => void | Promise<void>",
    default: "-",
    description: "下拉释放后触发；父级拉取数据后应将 loading 置 false",
  },
  {
    name: "pullingText",
    type: "string",
    default: "内置文案",
    description: "下拉过程提示",
  },
  {
    name: "loosingText",
    type: "string",
    default: "内置文案",
    description: "释放过程提示",
  },
  {
    name: "loadingText",
    type: "string",
    default: "内置文案",
    description: "加载中提示",
  },
  {
    name: "successText",
    type: "string | null",
    default: "null",
    description: "成功态文案；空则不显示成功动画",
  },
  {
    name: "successDuration",
    type: "number",
    default: "500",
    description: "成功提示展示时长（ms）",
  },
  {
    name: "headHeight",
    type: "number",
    default: "50",
    description: "头部指示区高度（px）",
  },
  {
    name: "pullDistance",
    type: "number",
    default: "同 headHeight",
    description: "触发刷新的下拉距离（px）",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "禁用下拉刷新",
  },
  { name: "class", type: "string", default: "-", description: "最外层 class" },
  {
    name: "scrollContainerRef",
    type: "(el: HTMLDivElement | null) => void",
    default: "-",
    description:
      "内层滚动容器（data-pull-refresh-content）挂载/卸载回调；供 ScrollList 等挂 IntersectionObserver",
  },
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "通常为可滚动列表主体",
  },
];

const importCode = `import { PullRefresh } from "@dreamer/ui-preact/mobile";
import { signal } from "@preact/signals";

const loading = signal(false);

<PullRefresh
  loading={loading}
  onRefresh={async () => {
    loading.value = true;
    await fetchData();
    loading.value = false;
  }}
>
  {listContent}
</PullRefresh>`;

/** 演示列表一行：刷新后整表替换为新 id + 随机文案，便于肉眼确认已重新拉数 */
type PullRefreshDemoRow = {
  id: string;
  /** 随机生成的展示文案 */
  label: string;
};

/**
 * 生成若干条随机演示数据（每次调用内容不同）。
 *
 * @param count - 行数
 * @param batch - 刷新批次号（写入文案便于对照「加载中」与「结束后」两阶段）
 * @returns 新数组
 */
function makeRandomPullRows(
  count: number,
  batch: number,
): PullRefreshDemoRow[] {
  const pick = <T,>(arr: readonly T[]): T =>
    arr[Math.floor(Math.random() * arr.length)]!;
  const tags = ["alpha", "beta", "gamma", "delta", "omega"] as const;
  return Array.from({ length: count }, (_, i) => {
    const n = Math.floor(Math.random() * 9000) + 1000;
    return {
      id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 11)}`,
      label: `#${n} · ${pick(tags)}/${pick(tags)} · 行 ${i + 1} · 批次${batch}`,
    };
  });
}

export default function MobilePullRefreshDoc() {
  const loading = signal(false);
  /** 已完成刷新次数（每次触发 onRefresh 递增，用于示例文案展示批次号） */
  const refreshBatch = signal(0);
  /** 列表数据：`onRefresh` 内会替换两次随机行（开始时 + 请求结束后），便于确认回调全程执行 */
  const listRows = signal<PullRefreshDemoRow[]>(makeRandomPullRows(24, 0));

  return (
    <div class="w-full max-w-3xl space-y-10">
      <section>
        <Title level={1}>PullRefresh 下拉刷新</Title>
        <Paragraph class="mt-2">
          列表页顶部下拉触发刷新；<code class="text-sm">loading</code>{" "}
          由父组件在 <code class="text-sm">onRefresh</code>{" "}
          内控制，与桌面无对应单一组件，为移动端常见交互。
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
          <Title level={3}>基础</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            在下方区域内<strong>先滚到顶部</strong>，再<strong>
              向下拖
            </strong>即可触发（触摸或
            <strong>鼠标左键按住拖动</strong>；演示约 0.9s
            后结束加载）。示意外壳须为
            <code class="text-sm">flex</code> 列且给{" "}
            <code class="text-sm">PullRefresh</code>{" "}
            <code class="text-sm">min-h-0 flex-1</code>
            ，内层列表须撑出高度才有纵向滚动。在 Mac 触控板上建议<strong>
              双指滚到顶
            </strong>后用<strong>单指</strong>拖动（或<strong>
              按住左键拖
            </strong>）；<strong>
              三指拖移
            </strong>多为系统手势，与网页触摸序列不同。下方列表为<strong>
              随机文案
            </strong>，每次刷新结束后会整表替换为新数据，便于确认{" "}
            <code class="text-sm">
              onRefresh
            </code>{" "}
            已执行。示例在 <code class="text-sm">onRefresh</code>{" "}
            <strong>
              一开始
            </strong>就替换随机行（加载动画期间即可看到列表变化），结束后再换<strong>
              第二轮
            </strong>随机行，便于确认整段回调跑完。
          </Paragraph>
          <MobileDocDemo class="flex h-52 min-h-0 flex-col overflow-hidden p-0">
            <PullRefresh
              class="min-h-0 flex-1 select-none"
              loading={loading}
              onRefresh={async () => {
                /** 批次 +1，并立即换新随机表（此时即进入 loading，头区转圈期间列表已是新随机） */
                const nextBatch = refreshBatch.value + 1;
                refreshBatch.value = nextBatch;
                listRows.value = makeRandomPullRows(24, nextBatch);
                loading.value = true;
                await new Promise((r) => setTimeout(r, 900));
                /** 模拟请求返回后再整表随机一轮，与上一段区分「结束态」 */
                listRows.value = makeRandomPullRows(24, nextBatch);
                loading.value = false;
              }}
            >
              <div class="space-y-2 p-4 text-sm text-slate-600 dark:text-slate-400">
                <p>
                  在此区域<strong>滚到顶</strong>后<strong>
                    向下拖
                  </strong>触发刷新。松手后<strong>
                    立刻
                  </strong>会换一批随机行（可看顶部加载），约 0.9s
                  后再换<strong>第二批</strong>；批次号在各行末尾
                  <code class="text-xs">· 批次N</code>
                  ，每次刷新 N 递增。
                </p>
                {listRows.value.map((row) => (
                  <div
                    class="rounded border border-slate-200/80 bg-white/60 px-3 py-2 dark:border-slate-600 dark:bg-slate-900/40"
                    key={row.id}
                  >
                    {row.label}
                  </div>
                ))}
              </div>
            </PullRefresh>
          </MobileDocDemo>
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
        <DocsApiTable rows={PULL_REFRESH_API} />
      </section>
    </div>
  );
}
