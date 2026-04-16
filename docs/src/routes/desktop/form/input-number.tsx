/**
 * InputNumber 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/form/input-number
 */

import {
  CodeBlock,
  Form,
  FormItem,
  InputNumber,
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

const INPUT_NUMBER_API: ApiRow[] = [
  {
    name: "value",
    type: "number | string | (() => number | string) | Signal<number | string>",
    default: "-",
    description:
      "当前值（数字或输入中间态字符串）。与全库表单一致为 MaybeSignal：字面量、`() => T`、`createSignal` 返回值；勿直接绑 `sig.value`（快照失步或误订阅）。",
  },
  { name: "min", type: "number", default: "-", description: "最小值" },
  { name: "max", type: "number", default: "-", description: "最大值" },
  { name: "step", type: "number", default: "1", description: "步进值" },
  {
    name: "placeholder",
    type: "string",
    default: "-",
    description: "占位文案",
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
  { name: "class", type: "string", default: "-", description: "额外 class" },
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
    description: "输入过程回调（透传至内层 number input）",
  },
  {
    name: "onBlur",
    type: "(e: Event) => void",
    default: "-",
    description: "失焦回调（透传至内层 number input）",
  },
  {
    name: "onFocus",
    type: "(e: Event) => void",
    default: "-",
    description: "聚焦回调（透传至内层 number input）",
  },
  {
    name: "onKeyDown",
    type: "(e: Event) => void",
    default: "-",
    description: "键盘按下（透传至内层 number input）",
  },
  {
    name: "onKeyUp",
    type: "(e: Event) => void",
    default: "-",
    description: "键盘抬起（透传至内层 number input）",
  },
  {
    name: "onClick",
    type: "(e: Event) => void",
    default: "-",
    description: "点击（透传至内层 number input）",
  },
  {
    name: "onPaste",
    type: "(e: Event) => void",
    default: "-",
    description: "粘贴（透传至内层 number input）",
  },
  { name: "name", type: "string", default: "-", description: "原生 name" },
  { name: "id", type: "string", default: "-", description: "原生 id" },
];

/**
 * 各示例字段的响应式状态。
 *
 * 1）须**模块级**：View 文档页在依赖变化时会重跑整页组件函数，若在函数体内 `createSignal`，会反复新建信号、状态丢失（与 FormList / Tree 文档一致）。
 * 2）**受控**用法必须同时提供可变的 `value`（getter）与 `onChange`；写死 `value="0"` 或未写回时，步进按钮无法改变界面上的数字。
 */
const qtyStep5 = signal("10");
const qtyDecimal = signal("0");
const qtyPlaceholder = signal("");
const qtySizeXs = signal("0");
const qtySizeSm = signal("1");
const qtySizeMd = signal("50");
const qtySizeLg = signal("5");

const importCode =
  `import { InputNumber, Form, FormItem } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

const qty = signal("10");
<FormItem label="数量">
  <InputNumber
    value={qty}
    min={0}
    max={100}
    step={5}
  />
</FormItem>`;

export default function FormInputNumber() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>InputNumber 数字输入</Title>
        <Paragraph class="mt-2">
          数字输入框，带步进按钮；支持
          value、min、max、step、placeholder、size、disabled、onChange。宽度由
          class 控制，表单中需占满一列时传 class="w-full"。Tailwind v4 +
          light/dark。下方示例用多个 <code class="text-sm">signal</code>{" "}
          作表单字段（信号在**模块顶层**定义，{" "}
          <code class="text-sm">value={"{"}qtyStep5{"}"}</code> 或{" "}
          <code class="text-sm">{"value={() => qtyStep5()}"}</code>，再加
          onChange 写回 <code class="text-sm">.value</code>
          ）；受控时勿写死 <code class="text-sm">value="0"</code>{" "}
          且不写 onChange，否则步进无效。也可用 store 等组合状态。
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
            <Title level={3}>步进按钮 + min/max/step</Title>
            <FormItem label="0–100，步进 5">
              <InputNumber
                value={qtyStep5}
                min={0}
                max={100}
                step={5}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<InputNumber
  value={qtyStep5}
  min={0}
  max={100}
  step={5}
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>小数步进（step=0.1）</Title>
            <FormItem label="0–10，步进 0.1">
              <InputNumber
                value={qtyDecimal}
                min={0}
                max={10}
                step={0.1}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<InputNumber
  value={qtyDecimal}
  min={0}
  max={10}
  step={0.1}
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>placeholder</Title>
            <FormItem label="占位">
              <InputNumber
                placeholder="请输入数量"
                value={qtyPlaceholder}
                min={0}
                max={999}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<InputNumber
  placeholder="请输入数量"
  value={qtyPlaceholder}
  min={0}
  max={999}
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>disabled</Title>
            <FormItem label="禁用">
              <InputNumber value="99" min={0} max={100} disabled />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<InputNumber
  value="99"
  min={0}
  max={100}
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
              与 <code class="text-xs">Input</code>{" "}
              相同四种字号与内边距；外框圆角与{" "}
              <code class="text-xs">Input</code> 一致由尺寸映射。
            </Paragraph>
            <FormItem label="xs">
              <InputNumber
                size="xs"
                value={qtySizeXs}
                min={0}
                max={10}
              />
            </FormItem>
            <FormItem label="sm">
              <InputNumber
                size="sm"
                value={qtySizeSm}
                min={0}
                max={10}
              />
            </FormItem>
            <FormItem label="md（默认）">
              <InputNumber
                size="md"
                value={qtySizeMd}
                min={0}
                max={100}
              />
            </FormItem>
            <FormItem label="lg">
              <InputNumber
                size="lg"
                value={qtySizeLg}
                min={0}
                max={10}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<InputNumber size="xs" value={qtySizeXs} min={0} max={10} />
<InputNumber size="sm" value={qtySizeSm} min={0} max={10} />
<InputNumber size="md" value={qtySizeMd} min={0} max={100} />
<InputNumber size="lg" value={qtySizeLg} min={0} max={10} />`}
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
              {INPUT_NUMBER_API.map((row) => (
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
