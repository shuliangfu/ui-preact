/**
 * Tooltip 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/feedback/tooltip
 */

import { CodeBlock, Paragraph, Title, Tooltip } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const TOOLTIP_API: ApiRow[] = [
  {
    name: "content",
    type: "string | unknown",
    default: "-",
    description: "提示文案或节点",
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
    description: "气泡外层（Portal 根节点）class，可传 z-index 等（如全屏编辑器内抬高）",
  },
];

const importCode = `import { Tooltip } from "@dreamer/ui-preact";

<Tooltip
  content="上方提示"
  placement="top"
>
  <span>悬停我</span>
</Tooltip>`;

const examplePlacement =
  `<Tooltip content="上方提示" placement="top"><span>Top</span></Tooltip>
<Tooltip content="右侧提示" placement="right"><span>Right</span></Tooltip>
<Tooltip content="下方提示" placement="bottom"><span>Bottom</span></Tooltip>
<Tooltip content="左侧提示" placement="left"><span>Left</span></Tooltip>`;

const exampleLong =
  `<Tooltip content="这是一段较长的提示文案，用于说明当前操作的注意事项。">
  <span>长文案</span>
</Tooltip>`;

const exampleNoArrow = `<Tooltip
  content="不显示箭头的气泡"
  arrow={false}
>
  <span>无箭头</span>
</Tooltip>`;

export default function FeedbackTooltip() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Tooltip 悬停提示</Title>
        <Paragraph class="mt-2">
          悬停提示：触发器悬停时显示气泡；支持 placement、箭头。有{" "}
          <code class="text-xs">document.body</code> 时气泡经 Portal 挂到 body，
          <code class="text-xs">position:fixed</code> 对齐视口，避免父级{" "}
          <code class="text-xs">overflow</code>{" "}
          裁切；无 body（SSR 等）时回退为包裹层内绝对定位。使用 Tailwind
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
          <Title level={3}>位置（placement）</Title>
          <div class="flex flex-wrap gap-6 pt-4">
            <Tooltip content="上方提示" placement="top">
              <span class="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-600 cursor-default">
                Top
              </span>
            </Tooltip>
            <Tooltip content="右侧提示" placement="right">
              <span class="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-600 cursor-default">
                Right
              </span>
            </Tooltip>
            <Tooltip content="下方提示" placement="bottom">
              <span class="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-600 cursor-default">
                Bottom
              </span>
            </Tooltip>
            <Tooltip content="左侧提示" placement="left">
              <span class="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-600 cursor-default">
                Left
              </span>
            </Tooltip>
          </div>
          <CodeBlock
            title="代码示例"
            code={examplePlacement}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>长文案</Title>
          <div class="pt-4">
            <Tooltip content="这是一段较长的提示文案，用于说明当前操作的注意事项。">
              <span class="px-3 py-1.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 cursor-default">
                长文案
              </span>
            </Tooltip>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleLong}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>无箭头（arrow=false）</Title>
          <div class="pt-4">
            <Tooltip content="不显示箭头的气泡" arrow={false}>
              <span class="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-600 cursor-default">
                无箭头
              </span>
            </Tooltip>
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
              {TOOLTIP_API.map((row) => (
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
