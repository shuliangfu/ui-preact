/**
 * Calendar 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/data-display/calendar
 */

import { signal } from "@preact/signals";
import { Calendar, CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const CALENDAR_API: ApiRow[] = [
  {
    name: "value",
    type: "Date | () => Date | Signal<Date>",
    default: "不传则非受控",
    description:
      "展示月；single 且无 selectedDate 时兼为选中日期。传 createSignal 返回值可在组件内回写，勿只传 sig.value 快照",
  },
  {
    name: "onChange",
    type: "(date: Date) => void",
    default: "-",
    description: "日期变化通知；value 为 Signal 时已内部赋值，可不写回调",
  },
  {
    name: "mode",
    type: "month | year",
    default: "month",
    description: "月视图或年视图",
  },
  {
    name: "dateCellRender",
    type: "(date: Date) => unknown",
    default: "-",
    description: "自定义日期格子渲染",
  },
  {
    name: "monthCellRender",
    type: "(date: Date) => unknown",
    default: "-",
    description: "自定义月份格子（mode=year）",
  },
  {
    name: "fullscreen",
    type: "boolean",
    default: "false",
    description: "是否全屏占满容器",
  },
  {
    name: "disabledDate",
    type: "(date: Date) => boolean",
    default: "-",
    description: "禁用日期",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
];

const importCode = `import { signal } from "@preact/signals";
import { Calendar } from "@dreamer/ui-preact";

const value = signal(new Date());
<Calendar value={value} />`;

const exampleBasic = `<Calendar value={value} />`;

const exampleModeYear = `<Calendar value={value} mode="year" />`;

const exampleFullscreen = `<Calendar value={value} fullscreen />`;

export default function DataDisplayCalendar() {
  const value = signal(new Date());

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Calendar 日历</Title>
        <Paragraph class="mt-2">
          日历：value、onChange、mode、dateCellRender、monthCellRender、fullscreen、disabledDate、class。
          使用 Tailwind v4，支持 light/dark 主题。受控时请传{" "}
          <code class="text-xs">value=&#123;signal&#125;</code> 或{" "}
          <code class="text-xs">value=&#123;() =&gt; sig.value&#125;</code>
          ，勿只传{" "}
          <code class="text-xs">sig.value</code>；传 Signal
          时选日由组件内回写，无需在 onChange 里赋值。
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
          <Title level={3}>基础选日</Title>
          <div class="w-full">
            <Calendar value={value} />
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
          <Title level={3}>mode=year 年视图</Title>
          <div class="w-full">
            <Calendar value={value} mode="year" />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleModeYear}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>fullscreen</Title>
          <div class="w-full min-h-[280px]">
            <Calendar value={value} fullscreen />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleFullscreen}
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
          组件接收以下属性。
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
              {CALENDAR_API.map((row) => (
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
