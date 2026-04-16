/**
 * Password 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/form/password
 */

import {
  CodeBlock,
  Form,
  FormItem,
  Paragraph,
  Password,
  Title,
} from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const PASSWORD_API: ApiRow[] = [
  {
    name: "value",
    type: "string | (() => string) | Signal<string>",
    default: "-",
    description:
      "受控密码文本。与全库表单一致为 MaybeSignal：字面量、`() => T`、`createSignal` 返回值；勿直接绑 `sig.value`（快照失步或误订阅）。",
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
  {
    name: "showStrength",
    type: "boolean",
    default: "false",
    description: "是否显示强度提示（弱/中/强），组件内根据 value 动态计算",
  },
  {
    name: "showPassword",
    type: "boolean",
    default: "-",
    description: "是否显示明文（显隐由父组件控制）",
  },
  {
    name: "onToggleShow",
    type: "() => void",
    default: "-",
    description: "点击显隐按钮时回调",
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
    description: "失焦回调（透传至原生 password input）",
  },
  {
    name: "onFocus",
    type: "(e: Event) => void",
    default: "-",
    description: "聚焦回调（透传至原生 password input）",
  },
  {
    name: "onKeyDown",
    type: "(e: Event) => void",
    default: "-",
    description: "键盘按下（透传至原生 password input）",
  },
  {
    name: "onKeyUp",
    type: "(e: Event) => void",
    default: "-",
    description: "键盘抬起（透传至原生 password input）",
  },
  {
    name: "onClick",
    type: "(e: Event) => void",
    default: "-",
    description: "点击（透传至原生 password input）",
  },
  {
    name: "onPaste",
    type: "(e: Event) => void",
    default: "-",
    description: "粘贴（透传至原生 password input）",
  },
  { name: "name", type: "string", default: "-", description: "原生 name" },
  { name: "id", type: "string", default: "-", description: "原生 id" },
];

const importCode =
  `import { Password, Form, FormItem } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

const val = signal("");
<FormItem label="密码">
  <Password
    value={val}
    placeholder="输入密码"
    showStrength
  />
</FormItem>`;

export default function FormPassword() {
  const val = signal("");
  const valNoStrength = signal("");

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Password 密码输入</Title>
        <Paragraph class="mt-2">
          密码输入框，支持显隐切换、showStrength
          强度提示、size、disabled。宽度由 class 控制，表单中需占满一列时传
          class="w-full"。Tailwind v4 + light/dark。
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
            <Title level={3}>带强度提示（showStrength）</Title>
            <FormItem label="密码" id="password-1">
              <Password
                id="password-1"
                value={val}
                showStrength
                placeholder="输入密码看强度"
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Password
  value={val}
  showStrength
  placeholder="输入密码看强度"
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={2}>无强度提示</Title>
            <FormItem label="密码">
              <Password
                value={valNoStrength}
                placeholder="仅显隐切换"
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Password
  value={valNoStrength}
  placeholder="仅显隐切换"
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
              <Password placeholder="禁用" disabled value="" />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Password
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
            <Title level={2}>size（xs / sm / md / lg）</Title>
            <FormItem label="xs">
              <Password size="xs" placeholder="xs" value="" />
            </FormItem>
            <FormItem label="sm">
              <Password size="sm" placeholder="sm" value="" />
            </FormItem>
            <FormItem label="md（默认）">
              <Password size="md" placeholder="md" value="" />
            </FormItem>
            <FormItem label="lg">
              <Password size="lg" placeholder="lg" value="" />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Password size="xs" placeholder="xs" value="" />
<Password size="sm" placeholder="sm" value="" />
<Password size="md" placeholder="md" value="" />
<Password size="lg" placeholder="lg" value="" />`}
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
              {PASSWORD_API.map((row) => (
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
