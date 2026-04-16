/**
 * Mentions 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/form/mentions
 */

import {
  CodeBlock,
  Form,
  FormItem,
  Mentions,
  Paragraph,
  Title,
} from "@dreamer/ui-preact";
import type { MentionOption } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const MENTIONS_API: ApiRow[] = [
  {
    name: "value",
    type: "string | (() => string) | Signal<string>",
    default: "-",
    description:
      "当前文本。与全库表单一致为 MaybeSignal：字面量、`() => T`、`createSignal` 返回值；勿直接绑 `sig.value`（快照失步或误订阅）。",
  },
  {
    name: "onInput",
    type: "(e: Event) => void",
    default: "-",
    description: "输入时（用于解析 @ 并更新候选）",
  },
  {
    name: "onChange",
    type: "(e: Event) => void",
    default: "-",
    description: "内容变更（e.target.value）",
  },
  {
    name: "onBlur",
    type: "(e: Event) => void",
    default: "-",
    description: "失焦回调（透传至原生 textarea）",
  },
  {
    name: "onFocus",
    type: "(e: Event) => void",
    default: "-",
    description: "聚焦回调（透传至原生 textarea）",
  },
  {
    name: "onKeyDown",
    type: "(e: Event) => void",
    default: "-",
    description:
      "键盘按下（透传至原生 textarea）。下拉打开时组件会先处理 ArrowUp/ArrowDown/Enter（选候选）/Escape（仅清高亮），再调用本回调（已处理键通常已 preventDefault）",
  },
  {
    name: "onKeyUp",
    type: "(e: Event) => void",
    default: "-",
    description: "键盘抬起（透传至原生 textarea）",
  },
  {
    name: "onClick",
    type: "(e: Event) => void",
    default: "-",
    description: "点击（透传至原生 textarea）",
  },
  {
    name: "onPaste",
    type: "(e: Event) => void",
    default: "-",
    description: "粘贴（透传至原生 textarea）",
  },
  {
    name: "placeholder",
    type: "string",
    default: "-",
    description: "占位文案",
  },
  { name: "rows", type: "number", default: "-", description: "多行行数" },
  {
    name: "showDropdown",
    type: "boolean | (() => boolean)",
    default: "false",
    description: "是否显示候选下拉；可为 getter",
  },
  {
    name: "dropdownOptions",
    type: "MentionOption[] | (() => MentionOption[])",
    default: "-",
    description: "候选列表（value、label）",
  },
  {
    name: "onSelectOption",
    type: "(opt: MentionOption) => void",
    default: "-",
    description:
      '选中某候选时回调；常见写法为保留触发符：正文 = slice(0,atIdx)+"@"+opt.label+" "+slice(cursor)（atIdx 为 @ 下标，slice(0,atIdx) 不含 @）',
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
];

const mentionOptions: MentionOption[] = [
  { value: "u1", label: "张三" },
  { value: "u2", label: "李四" },
  { value: "u3", label: "王五" },
];

const importCode =
  `import { Mentions, Form, FormItem } from "@dreamer/ui-preact";
import type { MentionOption } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

const options: MentionOption[] = [{ value: "u1", label: "张三" }];
const val = signal("");
const showDropdown = signal(false);
const opts = signal<MentionOption[]>([]);
// onInput 里根据 @ 后的关键词过滤 options 并 showDropdown.value = true、opts.value = ...
// onSelectOption 里：用 v.slice(0,atIdx)+"@"+opt.label+" "+v.slice(start) 替换 @ 至光标段，并 showDropdown.value = false
<Mentions
  value={val}
  onInput={handleInput}
  showDropdown={() => showDropdown.value}
  dropdownOptions={() => opts.value}
  onSelectOption={handleSelect}
/>`;

export default function FormMentions() {
  const val = signal("");
  const val2 = signal("你好 @张三 请查收");
  const showDropdown = signal(false);
  const options = signal<MentionOption[]>([]);

  const handleInput = (e: Event) => {
    const el = e.target as HTMLTextAreaElement;
    const v = el.value;
    const start = el.selectionStart ?? 0;
    val.value = v;
    const before = v.slice(0, start);
    const atIdx = before.lastIndexOf("@");
    if (atIdx >= 0) {
      const keyword = before.slice(atIdx + 1).toLowerCase();
      options.value = keyword
        ? mentionOptions.filter(
          (o) =>
            o.label.toLowerCase().includes(keyword) ||
            o.value.toLowerCase().includes(keyword),
        )
        : mentionOptions;
      showDropdown.value = true;
    } else {
      showDropdown.value = false;
    }
  };

  const handleSelect = (opt: MentionOption) => {
    const v = val.value;
    const start = (globalThis.document?.activeElement as HTMLTextAreaElement)
      ?.selectionStart ?? v.length;
    const before = v.slice(0, start);
    const atIdx = before.lastIndexOf("@");
    if (atIdx >= 0) {
      /** `slice(0, atIdx)` 不含 `@`，须显式拼回 `@` 再写入选中展示名 */
      val.value = v.slice(0, atIdx) + "@" + opt.label + " " + v.slice(start);
    }
    showDropdown.value = false;
  };

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Mentions 提及</Title>
        <Paragraph class="mt-2">
          提及输入：多行输入框，输入 @
          触发候选下拉；value、onInput、onChange、showDropdown、dropdownOptions、onSelectOption；选项类型为
          MentionOption（value、label）。下拉打开时可用{" "}
          <strong>方向键 ↑↓</strong> 移动高亮、<strong>Enter</strong>{" "}
          确认选中（Shift+Enter 仍为换行）、<strong>Escape</strong>{" "}
          清除高亮；鼠标移入项会同步高亮。宽度由 class
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
            <Title level={3}>带候选下拉（输入 @ 触发）</Title>
            <FormItem label="提及">
              <Mentions
                value={val}
                onInput={handleInput}
                placeholder="输入 @ 提及"
                showDropdown={() => showDropdown.value}
                dropdownOptions={() => options.value}
                onSelectOption={handleSelect}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Mentions
  value={val}
  onInput={handleInput}
  showDropdown={() => showDropdown.value}
  dropdownOptions={() => options.value}
  onSelectOption={handleSelect}
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>有默认值 / 无候选（仅多行输入）</Title>
            <FormItem label="仅输入">
              <Mentions
                value={val2}
                placeholder="无 @ 候选时就是普通 textarea"
                rows={4}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Mentions
  value={val2}
  onChange={...}
  rows={4}
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
              <Mentions placeholder="禁用" disabled value="" />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Mentions
  disabled
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
          组件接收以下属性（均为可选）。MentionOption
          类型：{`{ value: string; label: string }`}。
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
              {MENTIONS_API.map((row) => (
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
