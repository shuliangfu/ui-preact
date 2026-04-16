/**
 * AutoComplete 组件文档页
 * 路由: /desktop/form/autocomplete
 */

import {
  AutoComplete,
  CodeBlock,
  Form,
  FormItem,
  Paragraph,
  Title,
} from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** AutoComplete 文档用 API 表（与组件 Props 一致） */
const AUTOCOMPLETE_API: ApiRow[] = [
  {
    name: "options",
    type: "string[]",
    default: "[]",
    description: "建议字符串列表（用于自绘下拉过滤展示）",
  },
  {
    name: "value",
    type: "string | (() => string) | Signal<string>",
    default: "-",
    description:
      "受控输入文本。与全库表单一致为 MaybeSignal：字面量、`() => T`、`createSignal` 返回值；勿直接绑 `sig.value`（快照失步或误订阅）。",
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
    name: "placeholder",
    type: "string",
    default: "-",
    description: "占位文案",
  },
  {
    name: "onChange",
    type: "(e: Event) => void",
    default: "-",
    description: "变更回调",
  },
  {
    name: "onInput",
    type: "(e: Event) => void",
    default: "-",
    description: "输入回调（透传至原生 input）",
  },
  {
    name: "onBlur",
    type: "(e: Event) => void",
    default: "-",
    description: "失焦回调（透传至原生 input）",
  },
  {
    name: "onFocus",
    type: "(e: Event) => void",
    default: "-",
    description: "聚焦回调（透传至原生 input）",
  },
  {
    name: "onKeyDown",
    type: "(e: Event) => void",
    default: "-",
    description: "键盘按下（透传至原生 input）",
  },
  {
    name: "onKeyUp",
    type: "(e: Event) => void",
    default: "-",
    description: "键盘抬起（透传至原生 input）",
  },
  {
    name: "onClick",
    type: "(e: Event) => void",
    default: "-",
    description: "点击（透传至原生 input）",
  },
  {
    name: "onPaste",
    type: "(e: Event) => void",
    default: "-",
    description: "粘贴（透传至原生 input）",
  },
  {
    name: "onSelect",
    type: "(value: string) => void",
    default: "-",
    description: "从建议中选中某项时回调",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
  {
    name: "hideFocusRing",
    type: "boolean",
    default: "false",
    description: "为 true 时隐藏聚焦 ring",
  },
  { name: "name", type: "string", default: "-", description: "原生 name" },
  { name: "id", type: "string", default: "-", description: "原生 id" },
];

/** size 示例用的短选项列表 */
const SIZE_DEMO_OPTIONS = ["北京", "上海", "广州"];

export default function FormAutoCompleteDoc() {
  const q = signal("");
  const qSizeXs = signal("");
  const qSizeSm = signal("");
  const qSizeMd = signal("");
  const qSizeLg = signal("");

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>AutoComplete 自动完成</Title>
        <Paragraph class="mt-2">
          输入联想：自绘下拉 + 受控 value（可为 getter，避免 View
          下整树重跑失焦）。有输入时按子串不区分大小写过滤，空输入时展示全部建议；options
          为建议字符串列表。支持与 Input 一致的 DOM 透传（onBlur、onKeyDown
          等）。
        </Paragraph>
      </section>

      <section class="space-y-3">
        <Title level={2}>引入</Title>
        <CodeBlock
          title="代码示例"
          code={`import { AutoComplete, Form, FormItem } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

const q = signal("");
<FormItem label="搜索">
  <AutoComplete
    value={q}
    options={["北京", "上海", "广州", "深圳"]}
    placeholder="输入城市"
    class="w-full max-w-md"
  />
</FormItem>`}
          language="tsx"
          showLineNumbers
          wrapLongLines
        />
      </section>

      <section class="space-y-6">
        <Title level={2}>示例</Title>
        <Form layout="vertical" class="w-full max-w-lg space-y-4">
          <FormItem label="城市（建议）">
            <AutoComplete
              value={q}
              options={["北京", "上海", "广州", "深圳", "杭州"]}
              placeholder="输入或选择"
              class="w-full"
            />
          </FormItem>
        </Form>
        <CodeBlock
          title="代码示例"
          code={`<FormItem label="城市（建议）">
  <AutoComplete
    value={q}
    options={["北京", "上海", "广州", "深圳", "杭州"]}
    placeholder="输入或选择"
    class="w-full"
  />
</FormItem>`}
          language="tsx"
          showLineNumbers
          copyable
          wrapLongLines
        />
      </section>

      <section class="space-y-4">
        <Title level={2}>size（xs / sm / md / lg）</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          与 <code class="text-xs">Input</code> 相同四种{" "}
          <code class="text-xs">
            SizeVariant
          </code>（内边距、字号、圆角映射一致）。
        </Paragraph>
        <Form layout="vertical" class="w-full max-w-lg space-y-3">
          <FormItem label="xs">
            <AutoComplete
              size="xs"
              value={qSizeXs}
              options={SIZE_DEMO_OPTIONS}
              placeholder="xs"
              class="w-full"
            />
          </FormItem>
          <FormItem label="sm">
            <AutoComplete
              size="sm"
              value={qSizeSm}
              options={SIZE_DEMO_OPTIONS}
              placeholder="sm"
              class="w-full"
            />
          </FormItem>
          <FormItem label="md（默认）">
            <AutoComplete
              size="md"
              value={qSizeMd}
              options={SIZE_DEMO_OPTIONS}
              placeholder="md"
              class="w-full"
            />
          </FormItem>
          <FormItem label="lg">
            <AutoComplete
              size="lg"
              value={qSizeLg}
              options={SIZE_DEMO_OPTIONS}
              placeholder="lg"
              class="w-full"
            />
          </FormItem>
        </Form>
        <CodeBlock
          title="代码示例"
          code={`<AutoComplete size="xs" value={q1} options={opts} placeholder="xs" onChange={...} class="w-full" />
<AutoComplete size="sm" ... placeholder="sm" />
<AutoComplete size="md" ... placeholder="md" />
<AutoComplete size="lg" ... placeholder="lg" />`}
          language="tsx"
          showLineNumbers
          copyable
          wrapLongLines
        />
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
              {AUTOCOMPLETE_API.map((row) => (
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
