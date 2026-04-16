/**
 * Search 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/form/search
 */

import {
  CodeBlock,
  Form,
  FormItem,
  Paragraph,
  Search,
  Title,
} from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const SEARCH_API: ApiRow[] = [
  {
    name: "value",
    type: "string | (() => string) | Signal<string>",
    default: "-",
    description:
      "搜索框受控文本。与全库表单一致为 MaybeSignal：字面量、`() => T`、`createSignal` 返回值；勿直接绑 `sig.value`（快照失步或误订阅）。",
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
    default: "-",
    description: "占位文案",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
  {
    name: "onInput",
    type: "(e: Event) => void",
    default: "-",
    description: "输入回调",
  },
  {
    name: "onChange",
    type: "(e: Event) => void",
    default: "-",
    description: "变更回调",
  },
  {
    name: "onBlur",
    type: "(e: Event) => void",
    default: "-",
    description:
      "失焦回调；适合在失焦时请求接口，onInput 只更新本地值以减少请求次数",
  },
  {
    name: "onFocus",
    type: "(e: Event) => void",
    default: "-",
    description: "聚焦回调",
  },
  {
    name: "onKeyDown",
    type: "(e: Event) => void",
    default: "-",
    description:
      "键盘按下；内置在之后若未 preventDefault 且按 Enter 仍会调 onSearch",
  },
  {
    name: "onKeyUp",
    type: "(e: Event) => void",
    default: "-",
    description: "键盘抬起",
  },
  {
    name: "onClick",
    type: "(e: Event) => void",
    default: "-",
    description: "点击输入区域",
  },
  {
    name: "onPaste",
    type: "(e: Event) => void",
    default: "-",
    description: "粘贴",
  },
  {
    name: "onSearch",
    type: "(value: string) => void",
    default: "-",
    description: "搜索回调（回车或点击搜索时）；传则显示搜索/清除按钮",
  },
  { name: "name", type: "string", default: "-", description: "原生 name" },
  { name: "id", type: "string", default: "-", description: "原生 id" },
];

const importCode = `import { Search, Form, FormItem } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

const val = signal("");
<FormItem label="搜索">
  <Search
    value={val}
    onSearch={(v) => val.value = v}
    placeholder="搜索…"
  />
</FormItem>`;

export default function FormSearch() {
  const val = signal("");
  const val2 = signal("");
  const valBlur = signal("");

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Search 搜索框</Title>
        <Paragraph class="mt-2">
          搜索框，支持 value、onInput、onBlur、onKeyDown、onPaste、onSearch
          等（与 Input 对齐的输入事件均透传）；传 onSearch
          时显示搜索与清除按钮。若不想在每次键入时调接口，可只在 onInput
          更新受控值，在 onBlur（或 onSearch 回车/按钮）里再请求。宽度由 class
          控制，表单中需占满一列时传 class="w-full"。Tailwind v4 + light/dark。
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
            <Title level={3}>基础（带 onSearch 时显示搜索与清除）</Title>
            <FormItem label="搜索">
              <Search
                value={val}
                onSearch={(v) => {
                  val.value = v;
                  console.log("搜索:", v);
                }}
                placeholder="搜索…"
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Search
  value={val}
  onSearch={(v) => val.value = v}
  placeholder="搜索…"
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>仅输入（无 onSearch，无搜索/清除按钮）</Title>
            <FormItem label="仅输入">
              <Search
                value={val2}
                placeholder="无搜索按钮"
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Search
  value={val2}
  placeholder="无搜索按钮"
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>失焦再请求（onBlur）</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              onInput / onChange 只同步输入框内容；真正调搜索 API 写在 onBlur
              里，避免每敲一字就请求。回车或搜索按钮仍可用 onSearch。
            </Paragraph>
            <FormItem label="输入后点框外失焦触发 console">
              <Search
                value={valBlur}
                onBlur={() => {
                  console.log("失焦搜索:", valBlur.value);
                }}
                placeholder="失焦时打印当前关键词"
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Search
  value={q}
  onBlur={() => {
    void fetchResults(q.value);
  }}
  placeholder="失焦再请求"
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
              <Search placeholder="禁用" disabled value="" />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Search
  placeholder="禁用"
  disabled
  value=""
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>size</Title>
            <FormItem label="xs">
              <Search size="xs" placeholder="xs" value="" />
            </FormItem>
            <FormItem label="sm">
              <Search size="sm" placeholder="sm" value="" />
            </FormItem>
            <FormItem label="md">
              <Search size="md" placeholder="md" value="" />
            </FormItem>
            <FormItem label="lg">
              <Search size="lg" placeholder="lg" value="" />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Search
  size="xs"
  placeholder="xs"
  value=""
/>
<Search
  size="sm"
  placeholder="sm"
  value=""
/>
<Search
  size="md"
  placeholder="md"
  value=""
/>
<Search
  size="lg"
  placeholder="lg"
  value=""
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
              {SEARCH_API.map((row) => (
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
