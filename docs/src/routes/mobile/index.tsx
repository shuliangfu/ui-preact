/**
 * 移动版文档首页：导入方式、与桌面版差异、侧栏导航说明。
 * 路由: /mobile
 */

import { CodeBlock, Link, Paragraph, Title } from "@dreamer/ui-preact";

export default function MobileIndex() {
  return (
    <div class="w-full max-w-3xl space-y-10">
      <header class="space-y-4">
        <p class="text-sm font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
          @dreamer/ui-preact · Mobile
        </p>
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          移动端组件
        </h1>
        <p class="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          从{" "}
          <code class="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-sm">
            @dreamer/ui-preact/mobile
          </code>{" "}
          导入移动专用组件（BottomSheet、TabBar、NavBar 等）；包内同时再导出
          shared 基础组件，便于同一入口写页面。组件以直接返回 ComponentChildren
          为主；遮罩类会经{" "}
          <code class="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-sm">
            globalThis.document
          </code>{" "}
          处理 <code class="text-sm">body</code> 滚动。
        </p>
      </header>

      <section class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 p-6 space-y-4">
        <Title level={2} class="text-xl">
          导入示例
        </Title>
        <CodeBlock
          language="typescript"
          title="jsr / Deno"
          copyable
          code={`import { BottomSheet, TabBar, NavBar } from "@dreamer/ui-preact/mobile";
import { Button } from "@dreamer/ui-preact/mobile"; // shared 也可从此入口`}
        />
      </section>

      <section class="space-y-3">
        <Title level={2} class="text-xl">
          侧栏导航
        </Title>
        <Paragraph class="text-slate-600 dark:text-slate-400">
          左侧含<strong>
            反馈与浮层
          </strong>（BottomSheet、ActionSheet、PullRefresh、SwipeCell）、
          <strong>导航</strong>（TabBar、NavBar）、
          <strong>数据展示</strong>（ScrollList：列表 + 下拉刷新 +
          加载更多）、<strong>
            表单
          </strong>（Select、MultiSelect、TreeSelect、DatePicker、DateTimePicker、Cascader
          等；Select / MultiSelect / TreeSelect 默认{" "}
          <code class="text-sm">appearance</code>{" "}
          与桌面一致，Cascader 等见各页）、
          <strong>
            其它
          </strong>（MobilePortalHostScope）。各页结构为概述、引入、示例、API，与桌面文档一致。顶栏可切回桌面版。
        </Paragraph>
        <Link
          href="/desktop"
          className="inline-flex items-center text-teal-600 dark:text-teal-400 font-medium hover:underline"
        >
          ← 返回桌面版文档
        </Link>
      </section>
    </div>
  );
}
