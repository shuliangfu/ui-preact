/**
 * Affix 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/navigation/affix
 */

import { Affix, CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const AFFIX_API: ApiRow[] = [
  { name: "children", type: "unknown", default: "-", description: "子节点" },
  {
    name: "offsetTop",
    type: "number",
    default: "0",
    description: "距视口顶部偏移（px）",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "原位包装器 class",
  },
  {
    name: "affixClass",
    type: "string",
    default: "-",
    description: "固钉浮层 class（如 shadow）",
  },
  {
    name: "scrollTarget",
    type: "Element | (() => Element | null)",
    default: "-",
    description:
      "额外绑定 scroll 的容器；默认会收集父链上所有纵向可滚动层并监听 window",
  },
  {
    name: "respectFixedHeader",
    type: "boolean",
    default: "true",
    description: "避让全站顶栏；false 时仅按 offsetTop 相对视口顶",
  },
  {
    name: "headerGap",
    type: "number",
    default: "8",
    description: "测到顶栏时与顶栏底之间的额外间距（px）；无顶栏时不叠加",
  },
];

const importCode = `import { Affix } from "@dreamer/ui-preact";

<Affix offsetTop={0} affixClass="shadow-md">
  <div class="...">滚动后钉在视口顶部的内容</div>
</Affix>`;

const exampleAffixTop = `<Affix offsetTop={0} affixClass="shadow-md">
  <div class="...">此区域在滚动时可固定到视口顶部</div>
</Affix>`;

export default function NavigationAffix() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Affix 固钉</Title>
        <Paragraph class="mt-2">
          固钉用于长页滚动时把工具条、筛选条等「钉」在视口顶部或底部。进入固钉态后，子节点通过
          {" "}
          <code class="text-xs">@dreamer/view</code> 的{" "}
          <code class="text-xs">createPortal</code>
          （与声明式 <code class="text-xs">&lt;Portal&gt;</code> 互补）挂到{" "}
          <code class="text-xs">body</code>
          ，避免被父级 <code class="text-xs">overflow</code>
          裁切；原位保留占位高度。组件内部会监听滚动（默认向上查找纵向可滚动祖先，否则
          {" "}
          <code class="text-xs">window</code>
          ），无需再调用全局初始化函数。使用 Tailwind v4，支持 light/dark 主题。
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
          <Title level={3}>视口顶部固钉</Title>
          <Affix offsetTop={0} affixClass="shadow-md">
            <div class="border border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-white dark:bg-slate-800 shadow">
              <span class="text-sm font-medium">
                向下滚动主内容区，此条会钉在视口顶边（示例 offsetTop=0）
              </span>
            </div>
          </Affix>
          <CodeBlock
            title="代码示例"
            code={exampleAffixTop}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="h-40 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-600 rounded">
          占位区域，用于产生滚动
        </div>
      </section>

      <section class="space-y-3">
        <Title level={2}>API</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          以下为组件属性。固钉态下子树在 body
          上渲染，切换固钉/子节点变化时可能重挂载，复杂表单内状态需注意。
        </Paragraph>
        <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-600">
          <table class="w-full min-w-lg text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/80">
                <th class="px-4 py-3 text-left font-medium text-slate-900 dark:text-slate-100">
                  属性
                </th>
                <th class="px-4 py-3 text-left font-medium text-slate-900 dark:text-slate-100">
                  类型
                </th>
                <th class="px-4 py-3 text-left font-medium text-slate-900 dark:text-slate-100">
                  默认值
                </th>
                <th class="px-4 py-3 text-left font-medium text-slate-900 dark:text-slate-100">
                  说明
                </th>
              </tr>
            </thead>
            <tbody>
              {AFFIX_API.map((row) => (
                <tr
                  key={row.name}
                  class="border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                >
                  <td class="px-4 py-2.5 font-mono text-slate-700 dark:text-slate-300">
                    {row.name}
                  </td>
                  <td class="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    {row.type}
                  </td>
                  <td class="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    {row.default}
                  </td>
                  <td class="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
