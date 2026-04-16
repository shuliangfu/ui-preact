/**
 * Input 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/form/input
 */

import {
  CodeBlock,
  Form,
  FormItem,
  IconLock,
  IconUser,
  Link,
  // Input,
  Paragraph,
  Title,
} from "@dreamer/ui-preact";
import { Input } from "@dreamer/ui-preact/form";

import { signal } from "@preact/signals";

/** 本页 API 表行（与其它表单文档页结构一致） */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const INPUT_API: ApiRow[] = [
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
    name: "value",
    type: "string | (() => string) | Signal<string>",
    default: "-",
    description:
      "受控文本。与全库表单一致为 MaybeSignal：字面量、`() => T`、`createSignal` 返回值；勿直接绑 `sig.value`（快照失步或误订阅）。",
  },
  {
    name: "type",
    type: "string",
    default: "text",
    description: "原生 type：text、password、email 等",
  },
  {
    name: "readOnly",
    type: "boolean",
    default: "false",
    description: "是否只读",
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: "是否必填（aria-required）",
  },
  {
    name: "error",
    type: "boolean",
    default: "false",
    description: "错误状态（红框）",
  },
  {
    name: "hideFocusRing",
    type: "boolean",
    default: "false",
    description: "为 true 时隐藏聚焦时的蓝色激活边框（ring）；默认 false 显示",
  },
  { name: "prefix", type: "unknown", default: "-", description: "前缀节点" },
  { name: "suffix", type: "unknown", default: "-", description: "后缀节点" },
  {
    name: "allowClear",
    type: "boolean",
    default: "false",
    description: "有内容时显示右侧清除按钮",
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
    description: "失焦回调",
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
    description: "键盘按下",
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
  { name: "name", type: "string", default: "-", description: "原生 name" },
  { name: "id", type: "string", default: "-", description: "原生 id" },
];

const importCode = `import { Input, Form, FormItem } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

const val = signal("");
<FormItem label="用户名">
  <Input
    value={val}
    placeholder="请输入"
  />
</FormItem>`;

export default function FormInput() {
  const valPlaceholder = signal("");
  const valRequired = signal("");
  /** 演示 FormItem.hideRequiredMark：仍为必填但不显示标签旁 * */
  const valHideMark = signal("");
  const valError = signal("");
  const readOnlyVal = signal("只读内容");
  const valLeft1 = signal("");
  const valLeft2 = signal("");
  const valLeft3 = signal("");
  const valRight1 = signal("");
  const valRight2 = signal("");
  const valRight3 = signal("");
  const valClear = signal("");

  return (
    <div class="space-y-10 w-full">
      <section>
        <Title level={1}>Input 单行输入</Title>
        <Paragraph class="mt-2">
          单行输入框，支持
          size、placeholder、value、type、readOnly、required、error、disabled、prefix、suffix、allowClear。宽度由
          class 控制，表单中需占满一列时传 class="w-full"。Tailwind v4 +
          light/dark。
        </Paragraph>
      </section>

      <section class="space-y-3">
        <Title level={2}>引入</Title>
        <div class="w-full">
          <CodeBlock
            code={importCode}
            language="tsx"
            showLineNumbers
            title="代码示例"
            wrapLongLines
          />
        </div>
      </section>

      <section class="space-y-8">
        <Title level={2}>示例</Title>

        <div class="space-y-6">
          <section class="space-y-4">
            <Title level={3}>基础</Title>
            <Form layout="vertical" class="w-full">
              <FormItem label="placeholder" id="input-placeholder">
                <Input
                  id="input-placeholder"
                  value={valPlaceholder}
                  placeholder="请输入"
                  hideFocusRing
                />
              </FormItem>
            </Form>
            <div class="w-full">
              <CodeBlock
                code={`<Input
  value={val}
  placeholder="请输入"
/>`}
                language="tsx"
                showLineNumbers
                copyable
                title="代码示例"
                wrapLongLines
              />
            </div>
          </section>

          <section class="space-y-4">
            <Title level={3}>required</Title>
            <Form layout="vertical" class="w-full">
              <FormItem label="必填" required id="input-required">
                <Input
                  id="input-required"
                  value={valRequired}
                  placeholder="必填项"
                  required
                />
              </FormItem>
            </Form>
            <div class="w-full">
              <CodeBlock
                code={`<Input
  value={valRequired}
  placeholder="必填项"
  required
/>`}
                language="tsx"
                showLineNumbers
                copyable
                title="代码示例"
                wrapLongLines
              />
            </div>
          </section>

          <section class="space-y-4">
            <Title level={3}>FormItem：hideRequiredMark</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              业务上仍必填、但不想在标签旁显示红色 * 时，设{" "}
              <code class="rounded bg-slate-100 px-1 dark:bg-slate-800">
                hideRequiredMark
              </code>
              ；子级 Input 可继续传{" "}
              <code class="rounded bg-slate-100 px-1 dark:bg-slate-800">
                required
              </code>
              。
            </Paragraph>
            <Form layout="vertical" class="w-full">
              <FormItem
                label="无星号但仍必填"
                required
                hideRequiredMark
                id="input-hide-mark"
              >
                <Input
                  id="input-hide-mark"
                  value={valHideMark}
                  placeholder="标签无 *，原生仍可 required"
                  required
                />
              </FormItem>
            </Form>
            <div class="w-full">
              <CodeBlock
                code={`<FormItem label="邮箱" required hideRequiredMark id="email">
  <Input
    id="email"
    value={val}
    required
  />
</FormItem>`}
                language="tsx"
                showLineNumbers
                copyable
                title="代码示例"
                wrapLongLines
              />
            </div>
          </section>

          <section class="space-y-4">
            <Title level={3}>error</Title>
            <Form layout="vertical" class="w-full">
              <FormItem
                label="错误状态"
                error="请输入有效内容"
                id="input-error"
              >
                <Input
                  id="input-error"
                  value={valError}
                  placeholder="错误时红框"
                  error
                />
              </FormItem>
            </Form>
            <div class="w-full">
              <CodeBlock
                code={`<Input
  value={valError}
  placeholder="错误时红框"
  error
/>`}
                language="tsx"
                showLineNumbers
                copyable
                title="代码示例"
                wrapLongLines
              />
            </div>
          </section>

          <section class="space-y-4">
            <Title level={3}>readOnly</Title>
            <Form layout="vertical" class="w-full">
              <FormItem label="只读" id="input-readonly">
                <Input
                  id="input-readonly"
                  value={readOnlyVal}
                  readOnly
                />
              </FormItem>
            </Form>
            <div class="w-full">
              <CodeBlock
                code={`<Input
  value={readOnlyVal}
  readOnly
/>`}
                language="tsx"
                showLineNumbers
                copyable
                title="代码示例"
                wrapLongLines
              />
            </div>
          </section>

          <section class="space-y-4">
            <Title level={3}>disabled</Title>
            <Form layout="vertical" class="w-full">
              <FormItem label="禁用" id="input-disabled">
                <Input
                  id="input-disabled"
                  placeholder="禁用不可编辑"
                  disabled
                  value=""
                />
              </FormItem>
            </Form>
            <div class="w-full">
              <CodeBlock
                code={`<Input
  placeholder="禁用不可编辑"
  disabled
  value=""
/>`}
                language="tsx"
                showLineNumbers
                copyable
                title="代码示例"
                wrapLongLines
              />
            </div>
          </section>

          <section class="space-y-4">
            <Title level={3}>allowClear 可清除</Title>
            <Form layout="vertical" class="w-full">
              <FormItem label="输入后右侧显示 X，点击可清空">
                <Input
                  value={valClear}
                  placeholder="输入内容后出现清除按钮"
                  allowClear
                />
              </FormItem>
            </Form>
            <div class="w-full">
              <CodeBlock
                code={`<Input
  value={valClear}
  placeholder="输入内容后出现清除按钮"
  allowClear
/>`}
                language="tsx"
                showLineNumbers
                copyable
                title="代码示例"
                wrapLongLines
              />
            </div>
          </section>

          <section class="space-y-6">
            <Title level={3}>标签在左侧</Title>
            <Form layout="vertical" class="w-full">
              <div class="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30 p-5 space-y-6">
                <div>
                  <Title
                    level={3}
                    class="text-sm! font-medium! mb-3! text-slate-600 dark:text-slate-400"
                  >
                    左对齐
                  </Title>
                  <div class="space-y-0">
                    <FormItem
                      label="姓名"
                      labelPosition="left"
                      labelAlign="left"
                      id="left-name"
                    >
                      <Input
                        id="left-name"
                        value={valLeft1}
                        placeholder="请输入姓名"
                      />
                    </FormItem>
                    <FormItem
                      label="手机号"
                      labelPosition="left"
                      labelAlign="left"
                      id="left-phone"
                    >
                      <Input
                        id="left-phone"
                        value={valLeft2}
                        placeholder="请输入手机号"
                      />
                    </FormItem>
                    <FormItem
                      label="邮箱"
                      required
                      labelPosition="left"
                      labelAlign="left"
                      id="left-email"
                    >
                      <Input
                        id="left-email"
                        value={valLeft3}
                        placeholder="必填"
                      />
                    </FormItem>
                  </div>
                </div>
                <div class="pt-2 border-t border-slate-200 dark:border-slate-600">
                  <Title
                    level={3}
                    class="text-sm! font-medium! mb-3! text-slate-600 dark:text-slate-400"
                  >
                    右对齐
                  </Title>
                  <div class="space-y-0">
                    <FormItem
                      label="姓名"
                      labelPosition="left"
                      labelAlign="right"
                      id="right-name"
                    >
                      <Input
                        id="right-name"
                        value={valRight1}
                        onInput={(e) =>
                          valRight1.value =
                            (e.target as HTMLInputElement).value}
                        placeholder="请输入姓名"
                      />
                    </FormItem>
                    <FormItem
                      label="手机号"
                      labelPosition="left"
                      labelAlign="right"
                      id="right-phone"
                    >
                      <Input
                        id="right-phone"
                        value={valRight2}
                        onInput={(e) =>
                          valRight2.value =
                            (e.target as HTMLInputElement).value}
                        placeholder="请输入手机号"
                      />
                    </FormItem>
                    <FormItem
                      label="邮箱"
                      required
                      labelPosition="left"
                      labelAlign="right"
                      id="right-email"
                    >
                      <Input
                        id="right-email"
                        value={valRight3}
                        onInput={(e) =>
                          valRight3.value =
                            (e.target as HTMLInputElement).value}
                        placeholder="必填"
                      />
                    </FormItem>
                  </div>
                </div>
              </div>
            </Form>
            <div class="w-full">
              <CodeBlock
                code={`<FormItem
  label="姓名"
  labelPosition="left"
  labelAlign="left"
>
  <Input value={val} onInput={...} placeholder="请输入姓名" />
</FormItem>`}
                language="tsx"
                showLineNumbers
                copyable
                title="代码示例"
                wrapLongLines
              />
            </div>
          </section>

          <section class="space-y-4">
            <Title level={3}>type / prefix / suffix</Title>
            <Form layout="vertical" class="w-full">
              <FormItem label="type=email" id="input-email">
                <Input
                  id="input-email"
                  type="email"
                  placeholder="user@example.com"
                  value=""
                />
              </FormItem>
              <FormItem label="前缀 prefix" id="input-prefix">
                <Input
                  id="input-prefix"
                  prefix={
                    <span class="text-slate-500 dark:text-slate-400">
                      https://
                    </span>
                  }
                  placeholder="域名"
                  value=""
                />
              </FormItem>
              <FormItem label="后缀 suffix" id="input-suffix">
                <Input
                  id="input-suffix"
                  suffix={
                    <span class="text-slate-500 dark:text-slate-400">.com</span>
                  }
                  placeholder="名称"
                  value=""
                />
              </FormItem>
              <FormItem label="前缀 IconUser" id="input-prefix-user">
                <Input
                  id="input-prefix-user"
                  prefix={
                    <IconUser
                      size="sm"
                      class="text-slate-500 dark:text-slate-400"
                    />
                  }
                  placeholder="用户名"
                  value=""
                />
              </FormItem>
              <FormItem label="前缀 IconLock" id="input-prefix-lock">
                <Input
                  id="input-prefix-lock"
                  type="password"
                  prefix={
                    <IconLock
                      size="sm"
                      class="text-slate-500 dark:text-slate-400"
                    />
                  }
                  placeholder="请输入密码"
                  value=""
                />
              </FormItem>
            </Form>
            <div class="w-full">
              <CodeBlock
                code={`import { Input, IconUser, IconLock } from "@dreamer/ui-preact";

<Input
  type="email"
  placeholder="user@example.com"
/>
<Input
  prefix={<span>https://</span>}
  placeholder="域名"
/>
<Input
  suffix={<span>.com</span>}
  placeholder="名称"
/>
<Input
  prefix={
    <IconUser size="sm" class="text-slate-500 dark:text-slate-400" />
  }
  placeholder="用户名"
/>
<Input
  type="password"
  prefix={
    <IconLock size="sm" class="text-slate-500 dark:text-slate-400" />
  }
  placeholder="请输入密码"
/>`}
                language="tsx"
                showLineNumbers
                copyable
                title="代码示例"
                wrapLongLines
              />
            </div>
          </section>

          <section class="space-y-4">
            <Title level={3}>size</Title>
            <Form layout="vertical" class="w-full">
              <FormItem label="xs" id="size-xs">
                <Input id="size-xs" size="xs" placeholder="xs" value="" />
              </FormItem>
              <FormItem label="sm" id="size-sm">
                <Input id="size-sm" size="sm" placeholder="sm" value="" />
              </FormItem>
              <FormItem label="md（默认）" id="size-md">
                <Input id="size-md" size="md" placeholder="md" value="" />
              </FormItem>
              <FormItem label="lg" id="size-lg">
                <Input id="size-lg" size="lg" placeholder="lg" value="" />
              </FormItem>
            </Form>
            <div class="w-full">
              <CodeBlock
                code={`<Input size="xs" placeholder="xs" />
<Input size="sm" placeholder="sm" />
<Input size="md" placeholder="md" />
<Input size="lg" placeholder="lg" />`}
                language="tsx"
                showLineNumbers
                copyable
                title="代码示例"
                wrapLongLines
              />
            </div>
          </section>
        </div>
      </section>

      <section class="space-y-3">
        <Title level={2}>API</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          下表为 <strong>Input</strong> 属性（均为可选）。 <strong>Form</strong>
          {" "}
          / <strong>FormItem</strong> / <strong>FormList</strong>{" "}
          的说明与属性表见{" "}
          <Link
            href="/desktop/form/form-containers"
            className="text-teal-600 hover:underline dark:text-teal-400"
          >
            表单容器（Form · FormItem · FormList）
          </Link>
          。
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
              {INPUT_API.map((row) => (
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
