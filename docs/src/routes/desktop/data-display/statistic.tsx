/**
 * Statistic 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/data-display/statistic
 */

import { CodeBlock, Paragraph, Statistic, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const STATISTIC_API: ApiRow[] = [
  {
    name: "title",
    type: "string | unknown",
    default: "-",
    description: "标题",
  },
  { name: "value", type: "number | string", default: "-", description: "数值" },
  {
    name: "prefix",
    type: "unknown",
    default: "-",
    description: "前缀（如 ￥、图标）",
  },
  {
    name: "suffix",
    type: "unknown",
    default: "-",
    description: "后缀（如 元、%）",
  },
  {
    name: "trend",
    type: "up | down",
    default: "-",
    description:
      "可选；箭头与红绿配色。不传且 `value` 为数字时按正负自动推断（负 down，否则 up）；字符串等需手动传",
  },
  { name: "precision", type: "number", default: "-", description: "小数精度" },
  {
    name: "groupSeparator",
    type: "string",
    default: "-",
    description: "千分位分隔",
  },
  {
    name: "valueStyle",
    type: "Record<string, string | number>",
    default: "-",
    description: "数值内联样式",
  },
  {
    name: "valueClass",
    type: "string",
    default: "-",
    description: "数值 class",
  },
  { name: "class", type: "string", default: "-", description: "容器 class" },
];

const importCode = `import { Statistic } from "@dreamer/ui-preact";

<Statistic
  title="总销售额"
  value={112893.5}
  prefix="¥"
  precision={2}
/>
<Statistic
  title="访问量"
  value={8846}
  suffix="次"
  groupSeparator=","
/>`;

const exampleBasic = `<Statistic
  title="总销售额"
  value={112893.5}
  prefix="¥"
  precision={2}
/>
<Statistic
  title="访问量"
  value={8846}
  suffix="次"
  groupSeparator=","
/>
<Statistic
  title="完成率"
  value={93.5}
  suffix="%"
  precision={1}
/>`;

const exampleTrend = `<Statistic title="环比" value={12.5} suffix="%" />
<Statistic title="同比" value={-3.2} suffix="%" />`;

export default function DataDisplayStatistic() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Statistic 统计数值</Title>
        <Paragraph class="mt-2">
          统计数值：title、value、prefix、suffix、trend（可选，数字 value
          可自动推断趋势）、precision、groupSeparator、valueStyle、valueClass。
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
          <Title level={3}>prefix / suffix / precision / groupSeparator</Title>
          <div class="flex gap-8 flex-wrap">
            <Statistic
              title="总销售额"
              value={112893.5}
              prefix="¥"
              precision={2}
            />
            <Statistic
              title="访问量"
              value={8846}
              suffix="次"
              groupSeparator=","
            />
            <Statistic title="完成率" value={93.5} suffix="%" precision={1} />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleBasic}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>趋势箭头（数字正负自动判断）</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            `value` 为数字时无需传 `trend`：负数为红与 ↓，0 与正数为绿与
            ↑；`trend` 仅用于覆盖或 `value` 为字符串时。
          </Paragraph>
          <div class="flex gap-8 flex-wrap">
            <Statistic title="环比" value={12.5} suffix="%" />
            <Statistic title="同比" value={-3.2} suffix="%" />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleTrend}
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
          组件接收以下属性，value 为必填。
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
              {STATISTIC_API.map((row) => (
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
