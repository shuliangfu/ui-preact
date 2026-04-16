/**
 * Rate 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/form/rate
 */

import {
  CodeBlock,
  Form,
  FormItem,
  Paragraph,
  Rate,
  Title,
} from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const RATE_API: ApiRow[] = [
  {
    name: "value",
    type: "number | (() => number) | Signal<number>",
    default: "-",
    description:
      "当前分数。与全库表单一致为 MaybeSignal：字面量、`() => T`、`createSignal` 返回值；勿直接绑 `sig.value`（快照失步或误订阅）。",
  },
  { name: "count", type: "number", default: "5", description: "星星总数" },
  {
    name: "allowHalf",
    type: "boolean",
    default: "false",
    description:
      "允许 0.5 分档；为 true 时 `value` 可为 3.5 等，第 4 星显示左半填充。鼠标点星**左半边**选半档、**右半边**选整星；键盘 Enter/空格仍为整星",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "是否禁用",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
  {
    name: "onChange",
    type: "(value: number) => void",
    default: "-",
    description: "可选。`value` 为 Signal 时组件已回写；需副作用时再传",
  },
];

const importCode = `import { Rate, Form, FormItem } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

const val = signal(0);
<FormItem label="评分">
  <Rate value={val} count={5} />
</FormItem>`;

export default function FormRate() {
  const val = signal(0);
  /** 半星示例：初始 3.5，第 4 颗星左橙右灰；也可点星左/右半边改分 */
  const valHalf = signal(3.5);

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Rate 评分</Title>
        <Paragraph class="mt-2">
          星级评分，支持 count、value、onChange、allowHalf、disabled。Tailwind
          v4 + light/dark。
        </Paragraph>
        <Paragraph class="mt-2 text-sm text-slate-600 dark:text-slate-400">
          <strong>半星（allowHalf）：</strong>
          表示分值可以按 <strong>0.5</strong>{" "}
          为一档（例如 3.5
          分）。此时下一颗未满分星会画成「左半边橙色、右半边灰色」。
          开启后可用鼠标点某颗星的<strong>左半边</strong>选半档、
          <strong>右半边</strong>选整档；键盘操作仍为整星。
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
            <Title level={3}>基础（5 星）</Title>
            <FormItem label="评分">
              <Rate
                value={val}
                count={5}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Rate
  value={val}
  count={5}
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>allowHalf 半星</Title>
            <FormItem label="半星">
              <Rate
                value={valHalf}
                count={5}
                allowHalf
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`const valHalf = signal(3.5);

<Rate
  value={valHalf}
  count={5}
  allowHalf
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>count / disabled</Title>
            <FormItem label="3 星">
              <Rate value={2} count={3} />
            </FormItem>
            <FormItem label="10 星">
              <Rate value={7} count={10} />
            </FormItem>
            <FormItem label="disabled">
              <Rate value={3} count={5} disabled />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Rate value={2} count={3} />
<Rate
  value={3}
  count={5}
  disabled
/>`}
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
              {RATE_API.map((row) => (
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
