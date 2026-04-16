/**
 * Popover 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/feedback/popover
 */

import { CodeBlock, Paragraph, Popover, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const POPOVER_API: ApiRow[] = [
  {
    name: "title",
    type: "string | null",
    default: "-",
    description: "面板标题（可选）",
  },
  {
    name: "content",
    type: "string | unknown",
    default: "-",
    description: "面板内容",
  },
  {
    name: "placement",
    type: "top | right | bottom | left",
    default: "top",
    description: "气泡位置",
  },
  { name: "children", type: "unknown", default: "-", description: "触发元素" },
  {
    name: "arrow",
    type: "boolean",
    default: "true",
    description: "是否显示箭头",
  },
  { name: "class", type: "string", default: "-", description: "包装器 class" },
  {
    name: "overlayClass",
    type: "string",
    default: "-",
    description: "面板容器 class",
  },
];

const importCode = `import { Popover } from "@dreamer/ui-preact";

<Popover
  title="标题"
  content="面板内容"
  placement="top"
>
  <span>悬停我</span>
</Popover>`;

const exampleWithTitle = `<Popover
  title="标题"
  content="这里是面板内容，可放置简短说明或操作链接。"
  placement="top"
>
  <span>带标题 Top</span>
</Popover>`;

const exampleNoTitle = `<Popover
  content="无标题的纯内容面板"
  placement="bottom"
>
  <span>无标题 Bottom</span>
</Popover>`;

const exampleNoArrow = `<Popover
  content="不显示箭头"
  placement="top"
  arrow={false}
>
  <span>无箭头</span>
</Popover>`;

export default function FeedbackPopover() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Popover 弹出面板</Title>
        <Paragraph class="mt-2">
          弹出面板：悬停触发，带标题与内容；支持 placement、箭头。使用 Tailwind
          v4，支持 light/dark 主题。
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
          <Title level={3}>带标题与四向位置</Title>
          <div class="flex flex-wrap gap-6 pt-4">
            <Popover
              title="标题"
              content="这里是面板内容，可放置简短说明或操作链接。"
              placement="top"
            >
              <span class="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-600 cursor-default">
                带标题 Top
              </span>
            </Popover>
            <Popover
              content="无标题的纯内容面板"
              placement="bottom"
            >
              <span class="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-600 cursor-default">
                无标题 Bottom
              </span>
            </Popover>
            <Popover
              title="左侧"
              content="placement=left"
              placement="left"
            >
              <span class="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-600 cursor-default">
                Left
              </span>
            </Popover>
            <Popover
              title="右侧"
              content="placement=right"
              placement="right"
            >
              <span class="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-600 cursor-default">
                Right
              </span>
            </Popover>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleWithTitle}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
          <CodeBlock
            title="代码示例（无标题）"
            code={exampleNoTitle}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>无箭头（arrow=false）</Title>
          <div class="pt-4">
            <Popover content="不显示箭头" placement="top" arrow={false}>
              <span class="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-600 cursor-default">
                无箭头
              </span>
            </Popover>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleNoArrow}
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
          组件接收以下属性，content 为必填。
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
              {POPOVER_API.map((row) => (
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
