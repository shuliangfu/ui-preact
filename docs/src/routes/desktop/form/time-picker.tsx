/**
 * TimePicker 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/form/time-picker
 */

import {
  CodeBlock,
  Form,
  FormItem,
  Paragraph,
  TimePicker,
  Title,
} from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const TIMEPICKER_API: ApiRow[] = [
  {
    name: "mode",
    type: `"single" | "range" | "multiple"`,
    default: "single",
    description:
      "single：单时刻；range：起止两串（JSON）；multiple：多串（JSON 数组）。range/multiple 要求时间至少到「时+分」；若 format 仅为单列（HH / mm / ss）会回退 HH:mm 并 warn",
  },
  {
    name: "value",
    type: "见 mode",
    default: "-",
    description:
      "single → string | getter，形态与 format 一致；range → `{ start?, end? }` 或 getter；multiple → string[] 或 getter",
  },
  {
    name: "size",
    type: "SizeVariant",
    default: "md",
    description: "尺寸：xs、sm、md、lg",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "是否禁用",
  },
  {
    name: "hideFocusRing",
    type: "boolean",
    default: "false",
    description: "为 true 时隐藏聚焦时的蓝色激活边框（ring）；默认 false 显示",
  },
  {
    name: "placeholder",
    type: "string",
    default: `"请选择时间"`,
    description: "无值时触发器占位文案",
  },
  {
    name: "format",
    type: "string",
    default: "HH:mm",
    description:
      "可为单独 `HH`、`mm`、`ss` 或前缀链 `HH`→`mm`→`ss`（不可跳级如 HH-ss）。面板只展示出现的列。分须小写 `mm`，与日期 `MM`（月）区分",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
  {
    name: "onChange",
    type: "(e: Event) => void",
    default: "-",
    description:
      "变更回调；single 为时间串，range / multiple 为 JSON 字符串（与隐藏域一致）",
  },
  { name: "name", type: "string", default: "-", description: "原生 name" },
  { name: "id", type: "string", default: "-", description: "原生 id" },
];

const importCode =
  `import { TimePicker, Form, FormItem } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

const val = signal("");
<FormItem label="时间">
  <TimePicker
    value={val}
  />
</FormItem>`;

export default function FormTimePicker() {
  const val = signal("");
  const val2 = signal("14:30");
  /** format="HH:mm:ss" */
  const valWithSec = signal("14:30:05");
  /** format="HH"（仅 single 推荐；range/multiple 会回退到含分） */
  const valHourOnly = signal("09");
  /** format="mm"：仅分列 */
  const valMinuteOnly = signal("30");
  /** format="ss"：仅秒列 */
  const valSecondOnly = signal("05");
  const valRange = signal<{ start: string; end: string }>({
    start: "09:00",
    end: "18:00",
  });
  const valMulti = signal<string[]>(["09:00", "12:00", "18:00"]);

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>TimePicker 时间选择</Title>
        <Paragraph class="mt-2">
          时间选择框，支持{" "}
          <code class="text-sm">mode</code>（单日 / 区间 /
          多选时刻）、<code class="text-sm">format</code>（
          <code class="text-sm">HH</code> / <code class="text-sm">mm</code> /
          {" "}
          <code class="text-sm">ss</code> / <code class="text-sm">HH:mm</code> /
          {" "}
          <code class="text-sm">HH:mm:ss</code>
          等）、value、size、disabled、onChange、placeholder。区间与多选时
          onChange 的 value 为 JSON。时间区间请使用{" "}
          <code class="text-sm">mode="range"</code>
          。Tailwind v4 + light/dark。
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

        <Form layout="vertical" class="w-full space-y-6">
          <section class="space-y-4">
            <Title level={3}>基础</Title>
            <FormItem label="时间">
              <TimePicker
                value={val}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<TimePicker
  value={val}
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>有默认值</Title>
            <FormItem label="默认 14:30">
              <TimePicker
                value={val2}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<TimePicker
  value={val2}
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>format：秒 / 单列时、分、秒</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              分须为小写 <code class="text-xs">mm</code>；秒为{" "}
              <code class="text-xs">ss</code>。可单独{" "}
              <code class="text-xs">HH</code>、<code class="text-xs">mm</code>
              {" "}
              或 <code class="text-xs">ss</code>，面板只显示对应一列。
            </Paragraph>
            <FormItem label='format="HH:mm:ss"'>
              <TimePicker
                format="HH:mm:ss"
                value={valWithSec}
              />
            </FormItem>
            <FormItem label='format="HH"'>
              <TimePicker
                format="HH"
                value={valHourOnly}
              />
            </FormItem>
            <FormItem label='format="mm"'>
              <TimePicker
                format="mm"
                value={valMinuteOnly}
              />
            </FormItem>
            <FormItem label='format="ss"'>
              <TimePicker
                format="ss"
                value={valSecondOnly}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<TimePicker
  format="HH:mm:ss"
  value={valWithSec}
/>
<TimePicker
  format="HH"
  value={valHourOnly}
/>
<TimePicker
  format="mm"
  value={valMinuteOnly}
/>
<TimePicker
  format="ss"
  value={valSecondOnly}
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>size（xs / sm / md / lg）与 disabled</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              与 <code class="text-xs">Input</code>{" "}
              相同四种尺寸；右侧时钟图标较触发器小一档（与 DatePicker 共用{" "}
              <code class="text-xs">picker-trigger-icon</code> 规则）。
            </Paragraph>
            <FormItem label="xs">
              <TimePicker value="" size="xs" onChange={() => {}} />
            </FormItem>
            <FormItem label="sm">
              <TimePicker value="" size="sm" onChange={() => {}} />
            </FormItem>
            <FormItem label="md（默认）">
              <TimePicker value="" size="md" onChange={() => {}} />
            </FormItem>
            <FormItem label="lg">
              <TimePicker value="" size="lg" onChange={() => {}} />
            </FormItem>
            <FormItem label="禁用">
              <TimePicker value="09:00" disabled onChange={() => {}} />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<TimePicker value="" size="xs" onChange={() => {}} />
<TimePicker value="" size="sm" onChange={() => {}} />
<TimePicker value="" size="md" onChange={() => {}} />
<TimePicker value="" size="lg" onChange={() => {}} />
<TimePicker value="09:00" disabled onChange={() => {}} />`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>mode="range" 时间区间</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              面板内分「开始」「结束」两组时/分；确定后 onChange 的 value 为
              JSON 对象字符串。
            </Paragraph>
            <FormItem label="时间区间">
              <TimePicker mode="range" value={valRange} />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`const valRange = signal({ start: "09:00", end: "18:00" });

<TimePicker mode="range" value={valRange} />`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>mode="multiple" 多个时刻</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              选好时、分后点「加入已选」；已选标签可点按移除；确定为 JSON
              数组字符串。
            </Paragraph>
            <FormItem label="多时刻">
              <TimePicker mode="multiple" value={valMulti} />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`const valMulti = signal<string[]>(["09:00", "12:00"]);

<TimePicker mode="multiple" value={valMulti} />`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>
        </Form>
      </section>

      <section class="space-y-3">
        <Title level={2}>API</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          组件接收以下属性（均为可选）。
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
              {TIMEPICKER_API.map((row) => (
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
