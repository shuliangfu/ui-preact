/**
 * List 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/data-display/list
 */

import { CodeBlock, List, Paragraph, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const LIST_API: ApiRow[] = [
  {
    name: "items",
    type: "ListItemProps[]",
    default: "-",
    description: "列表项（key、children、thumb、extra、disabled、onClick）",
  },
  {
    name: "renderItem",
    type: "(item, index) => unknown",
    default: "-",
    description: "自定义每项渲染",
  },
  { name: "header", type: "unknown", default: "-", description: "列表头部" },
  { name: "footer", type: "unknown", default: "-", description: "列表底部" },
  { name: "loading", type: "boolean", default: "false", description: "加载态" },
  {
    name: "loadMore",
    type: "unknown",
    default: "-",
    description: "加载更多区域",
  },
  {
    name: "split",
    type: "boolean",
    default: "true",
    description: "是否显示分割线",
  },
  { name: "size", type: "SizeVariant", default: "-", description: "尺寸" },
  {
    name: "bordered",
    type: "boolean",
    default: "false",
    description: "是否带边框容器",
  },
  {
    name: "grid",
    type: "{ column?, xs?, sm?, md?, lg? }",
    default: "-",
    description:
      "栅格多列：仅 column 则各断点同列；设 xs/sm/md/lg 任一项则移动优先（列数 1–12）",
  },
  {
    name: "itemClass",
    type: "string",
    default: "-",
    description: "单项 class",
  },
  { name: "class", type: "string", default: "-", description: "容器 class" },
];

const importCode = `import { List } from "@dreamer/ui-preact";

const items = [{ key: "1", children: "列表项 1", extra: "详情" }, ...];
<List
  header="标题"
  items={items}
  footer="共 3 条"
  bordered
/>`;

const exampleHeaderFooter = `<List
  header="列表标题"
  items={items}
  footer="共 3 条"
  bordered
/>`;

const exampleSplitLoading = `<List
  items={items.slice(0, 2)}
  split={false}
/>
<List
  header="加载中"
  items={[]}
  loading
/>`;

const exampleGrid = `<List
  items={gridItems}
  grid={{ column: 2, md: 3 }}
  split={false}
  bordered
/>`;

export default function DataDisplayList() {
  const items = [
    { key: "1", children: "列表项 1", extra: "详情" },
    {
      key: "2",
      children: "列表项 2",
      thumb: <span class="w-8 h-8 rounded bg-slate-200 dark:bg-slate-600" />,
    },
    { key: "3", children: "列表项 3", disabled: true },
  ];

  /** 栅格示例：独立 key，避免与上方列表演示混淆 */
  const gridItems = [
    { key: "g1", children: "栅格项 A" },
    { key: "g2", children: "栅格项 B" },
    { key: "g3", children: "栅格项 C" },
    { key: "g4", children: "栅格项 D" },
  ];

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>List 列表</Title>
        <Paragraph class="mt-2">
          适用于<strong>设置页/个人中心</strong>（主文案 + 右侧操作）、<strong>
            轻量消息或通知行
          </strong>（thumb + extra）、<strong>
            带头尾的简单清单
          </strong>等；数据量很大时需自行虚拟列表或分页。支持
          items、renderItem、header、footer、loading、loadMore、split、size、bordered、grid、itemClass。
          使用 Tailwind v4，支持 light/dark 主题。
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
          <Title level={3}>header / footer / bordered</Title>
          <List header="列表标题" items={items} footer="共 3 条" bordered />
          <CodeBlock
            title="代码示例"
            code={exampleHeaderFooter}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>split=false / loading</Title>
          <List items={items.slice(0, 2)} split={false} />
          <List header="加载中" items={[]} loading />
          <CodeBlock
            title="代码示例"
            code={exampleSplitLoading}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>grid（多列 + 响应式）</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            小屏 2 列、md 及以上 3 列；栅格多列示例关闭
            split，避免与单列「行间分割线」语义混淆。
          </Paragraph>
          <List
            items={gridItems}
            grid={{ column: 2, md: 3 }}
            split={false}
            bordered
          />
          <CodeBlock
            title="代码示例"
            code={exampleGrid}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>
      </section>

      <section class="space-y-3">
        <Title level={2}>API</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          ListItemProps：key、children、thumb、extra、disabled、onClick。List
          属性如下。
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
              {LIST_API.map((row) => (
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
