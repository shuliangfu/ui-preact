/**
 * Timeline 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/data-display/timeline
 */

import { CodeBlock, Paragraph, Timeline, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const TIMELINE_API: ApiRow[] = [
  {
    name: "items",
    type: "TimelineItemProps[]",
    default: "-",
    description: "时间轴项",
  },
  {
    name: "mode",
    type: "left | right | alternate",
    default: "-",
    description: "标签在左/右/交替",
  },
  {
    name: "pending",
    type: "boolean",
    default: "false",
    description: "最后一项是否 pending 样式",
  },
  { name: "class", type: "string", default: "-", description: "容器 class" },
  {
    name: "itemClass",
    type: "string",
    default: "-",
    description: "单项 class",
  },
];

const importCode = `import { Timeline } from "@dreamer/ui-preact";

const items = [{ key: "1", label: "2024-01-01", children: "创建项目", color: "primary" }, ...];
<Timeline
  items={items}
  mode="left"
/>`;

const exampleLeft = `<Timeline
  items={items}
  mode="left"
/>`;

export default function DataDisplayTimeline() {
  const items = [
    {
      key: "1",
      label: "2024-01-01",
      children: "创建项目",
      color: "primary" as const,
    },
    { key: "2", label: "2024-02-01", children: "完成设计" },
    {
      key: "3",
      label: "2024-03-01",
      children: "开发完成",
      color: "success" as const,
    },
    { key: "4", children: "待定", pending: true },
  ];

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Timeline 时间轴</Title>
        <Paragraph class="mt-2">
          时间轴：items（key、label、children、color、dot、pending）、mode（left/right/alternate）、pending。
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
          <Title level={3}>mode=left</Title>
          <Timeline items={items} mode="left" />
          <CodeBlock
            title="代码示例"
            code={exampleLeft}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>mode=alternate</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            轴线在右，文案左右对齐交替；整条时间轴靠右。
          </Paragraph>
          <Timeline items={items.slice(0, 3)} mode="alternate" />
          <CodeBlock
            title="代码示例"
            code={`<Timeline items={items} mode="alternate" />`}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>mode=right</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            轴线在右，文案右对齐；整条时间轴靠右。
          </Paragraph>
          <Timeline items={items.slice(0, 3)} mode="right" />
          <CodeBlock
            title="代码示例"
            code={`<Timeline items={items} mode="right" />`}
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
          TimelineItemProps：key、label、children、color、dot、pending。Timeline
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
              {TIMELINE_API.map((row) => (
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
