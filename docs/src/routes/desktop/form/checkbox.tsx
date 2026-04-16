/**
 * Checkbox 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/form/checkbox
 */

import {
  Checkbox,
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

const CHECKBOX_API: ApiRow[] = [
  {
    name: "checked",
    type: "boolean | (() => boolean)",
    default: "-",
    description: "是否选中；可为 getter",
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
    name: "error",
    type: "boolean",
    default: "false",
    description: "错误状态（红框）",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
  {
    name: "onChange",
    type: "(e: Event) => void",
    default: "-",
    description: "可选。`checked` 为 Signal 时组件已回写；需副作用时再传",
  },
  {
    name: "onBlur",
    type: "(e: Event) => void",
    default: "-",
    description: "失焦回调（透传至内部 input）",
  },
  {
    name: "onFocus",
    type: "(e: Event) => void",
    default: "-",
    description: "聚焦回调（透传至内部 input）",
  },
  {
    name: "onKeyDown",
    type: "(e: Event) => void",
    default: "-",
    description: "键盘按下（透传至内部 input）",
  },
  {
    name: "onKeyUp",
    type: "(e: Event) => void",
    default: "-",
    description: "键盘抬起（透传至内部 input）",
  },
  {
    name: "onClick",
    type: "(e: Event) => void",
    default: "-",
    description: "点击（透传至内部 input）",
  },
  {
    name: "onPaste",
    type: "(e: Event) => void",
    default: "-",
    description: "粘贴（透传至内部 input）",
  },
  { name: "name", type: "string", default: "-", description: "原生 name" },
  { name: "value", type: "string", default: "-", description: "原生 value" },
  { name: "id", type: "string", default: "-", description: "原生 id" },
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "文案或子节点",
  },
];

const importCode =
  `import { Checkbox, Form, FormItem } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

const checked = signal(false);
<FormItem label="勾选">
  <Checkbox checked={checked}>勾选我</Checkbox>
</FormItem>`;

export default function FormCheckbox() {
  const checked = signal(false);

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Checkbox 复选框</Title>
        <Paragraph class="mt-2">
          勾选框，支持
          checked、disabled、error、name、value、id、onChange、children。动态选中态请传
          {" "}
          <code class="text-sm">checked=&#123;signal(...)&#125;</code>
          ，勿绑 <code class="text-sm">sig.value</code>{" "}
          快照。Tailwind v4 + light/dark。
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
            <FormItem label="勾选">
              <Checkbox checked={checked}>勾选我</Checkbox>
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Checkbox checked={checked}>勾选我</Checkbox>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>error</Title>
            <FormItem label="错误态">
              <Checkbox checked={false} error>错误状态红框</Checkbox>
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Checkbox checked={false} error>错误状态红框</Checkbox>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>disabled</Title>
            <FormItem label="未选禁用">
              <Checkbox checked={false} disabled>禁用未选</Checkbox>
            </FormItem>
            <FormItem label="已选禁用">
              <Checkbox checked disabled>禁用已选</Checkbox>
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Checkbox checked={false} disabled>禁用未选</Checkbox>\n<Checkbox checked disabled>禁用已选</Checkbox>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>name / value / id</Title>
            <FormItem label="带 name 和 value">
              <Checkbox
                name="agree"
                value="yes"
                id="input-agree"
                checked={checked}
              >
                同意协议
              </Checkbox>
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Checkbox
  name="agree"
  value="yes"
  id="input-agree"
  checked={checked}
>
  同意协议
</Checkbox>`}
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
              {CHECKBOX_API.map((row) => (
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
