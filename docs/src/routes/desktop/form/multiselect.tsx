/**
 * MultiSelect 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/form/multiselect
 */

import {
  CodeBlock,
  Form,
  FormItem,
  MultiSelect,
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

const MULTISELECT_API: ApiRow[] = [
  {
    name: "options",
    type: "Array<{value, label, disabled?}>",
    default: "-",
    description: "选项列表",
  },
  {
    name: "value",
    type: "string[] | (() => string[]) | Signal<string[]>",
    default: "-",
    description:
      "当前选中项 value 数组。与全库表单一致为 MaybeSignal：字面量、`() => T`、`createSignal` 返回值；勿直接绑 `sig.value`（快照失步或误订阅）。",
  },
  {
    name: "placeholder",
    type: "string",
    default: '"请选择"',
    description: "未选任何项时触发条上的占位文案",
  },
  {
    name: "onChange",
    type: "(e: Event) => void",
    default: "-",
    description:
      "可选。`value` 为 Signal 时组件已回写；需副作用时再传（合成事件 target.value 为 string[]）",
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
  { name: "name", type: "string", default: "-", description: "原生 name" },
  { name: "id", type: "string", default: "-", description: "原生 id" },
  { name: "class", type: "string", default: "-", description: "额外 class" },
];

const options = [
  { value: "a", label: "选项 A" },
  { value: "b", label: "选项 B" },
  { value: "c", label: "选项 C", disabled: true },
];

const importCode =
  `import { MultiSelect, Form, FormItem } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

const options = [{ value: "a", label: "选项 A" }, { value: "b", label: "选项 B" }];
const val = signal<string[]>([]);
<FormItem label="多选">
  <MultiSelect options={options} value={val} />
</FormItem>`;

export default function FormMultiSelect() {
  const val = signal<string[]>([]);
  const val2 = signal<string[]>(["a", "b"]);

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>MultiSelect 多选下拉</Title>
        <Paragraph class="mt-2">
          与单选 Select
          相同：默认收起，点击触发条展开浮层，浮层内有全选、清空、完成（收起；点选即写入
          value）与勾选列表；未选时触发条显示
          placeholder（默认「请选择」），已选时展示已选项标签（顿号分隔）。宽度由
          class 控制，表单中需占满一列时传 class="w-full"。Tailwind v4 +
          light/dark。
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
            <Title level={3}>全选 / 清空</Title>
            <FormItem label="多选（点击展开，浮层内全选/清空）">
              <MultiSelect
                options={options}
                value={val}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<MultiSelect
  options={options}
  value={val}
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>有默认选中 + 选项含 disabled</Title>
            <FormItem label="选项 C 为 disabled">
              <MultiSelect
                options={options}
                value={val2}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`options: [{ value: "c", label: "选项 C", disabled: true }];
value={["a","b"]}`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>disabled</Title>
            <FormItem label="禁用">
              <MultiSelect options={options} value={["a"]} disabled />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<MultiSelect
  options={options}
  value={["a"]}
  disabled
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>size（xs / sm / md / lg）</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              与 <code class="text-xs">Input</code> 相同四种{" "}
              <code class="text-xs">SizeVariant</code>，触发条内边距与圆角一致。
            </Paragraph>
            <div class="w-full max-w-lg space-y-3">
              <FormItem label="xs">
                <MultiSelect options={options} value={[]} size="xs" />
              </FormItem>
              <FormItem label="sm">
                <MultiSelect options={options} value={[]} size="sm" />
              </FormItem>
              <FormItem label="md（默认）">
                <MultiSelect options={options} value={[]} size="md" />
              </FormItem>
              <FormItem label="lg">
                <MultiSelect options={options} value={[]} size="lg" />
              </FormItem>
            </div>
            <CodeBlock
              title="代码示例"
              code={`<MultiSelect options={options} value={[]} size="xs" />
<MultiSelect options={options} value={[]} size="sm" />
<MultiSelect options={options} value={[]} size="md" />
<MultiSelect options={options} value={[]} size="lg" />`}
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
              {MULTISELECT_API.map((row) => (
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
