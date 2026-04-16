/**
 * Button / ButtonGroup 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/basic/button
 */

import {
  Button,
  ButtonGroup,
  CodeBlock,
  Paragraph,
  Title,
} from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const BUTTON_API: ApiRow[] = [
  {
    name: "itemKey",
    type: "string | number",
    default: "-",
    description:
      "可选，写入原生 data-key（调试/E2E）；与 JSX 的 key 属性不同，列表 diff 仍用 key={...}",
  },
  {
    name: "variant",
    type: "ColorVariant",
    default: "primary",
    description:
      "语义变体：default、primary、secondary、success、warning、danger、ghost",
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
    name: "loading",
    type: "boolean",
    default: "false",
    description: "是否加载中（显示旋转图标并禁用点击）",
  },
  {
    name: "type",
    type: "string",
    default: "button",
    description: "原生 type：button、submit、reset",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "额外 class，与 Tailwind 合并",
  },
  {
    name: "onClick",
    type: "(e: Event) => void",
    default: "-",
    description: "点击回调",
  },
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "子节点（文案或图标等）",
  },
];

const importCode = `import { Button, ButtonGroup } from "@dreamer/ui-preact";

<Button variant="primary" onClick={() => console.log("click")}>
  确定
</Button>

<ButtonGroup>
  <Button variant="default" size="sm">刷新</Button>
  <Button variant="primary" size="sm">导出</Button>
</ButtonGroup>`;

/** 各示例对应代码，便于用户复制 */
const exampleVariant = `<Button variant="default">default</Button>
<Button variant="primary">primary</Button>
<Button variant="secondary">secondary</Button>
<Button variant="success">success</Button>
<Button variant="warning">warning</Button>
<Button variant="danger">danger</Button>
<Button variant="ghost">ghost</Button>`;

const exampleSize = `<Button size="xs">xs</Button>
<Button size="sm">sm</Button>
<Button size="md">md</Button>
<Button size="lg">lg</Button>`;

const exampleDisabled = `<Button variant="default" disabled>default</Button>
<Button variant="primary" disabled>primary</Button>
<Button variant="secondary" disabled>secondary</Button>
<Button variant="success" disabled>success</Button>
<Button variant="warning" disabled>warning</Button>
<Button variant="danger" disabled>danger</Button>
<Button variant="ghost" disabled>ghost</Button>`;

const exampleLoading = `<Button variant="primary" loading>加载中</Button>
<Button variant="secondary" loading>提交中</Button>`;

const exampleType = `<Button
  type="button"
  variant="primary"
>
  button
</Button>
<Button
  type="submit"
  variant="secondary"
>
  submit
</Button>
<Button
  type="reset"
  variant="ghost"
>
  reset
</Button>`;

const BUTTON_GROUP_API: ApiRow[] = [
  {
    name: "attached",
    type: "boolean",
    default: "true",
    description:
      "是否紧凑相连：true 时中间无间隙、仅首尾圆角，焦点环仅画在外侧；false 时保留间距",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "额外 class",
  },
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "子节点（通常为多个 Button）",
  },
];

const exampleButtonGroupAttached = `<ButtonGroup>
  <Button variant="default" size="sm" onClick={onRefresh}>刷新</Button>
  <Button variant="primary" size="sm" onClick={onExport}>导出</Button>
</ButtonGroup>`;

const exampleButtonGroupSpaced = `<ButtonGroup attached={false}>
  <Button variant="default" size="sm">刷新</Button>
  <Button variant="primary" size="sm">导出</Button>
</ButtonGroup>`;

export default function BasicButton() {
  return (
    <div class="space-y-10">
      {/* 1. 概述 */}
      <section>
        <Title level={1}>Button 按钮</Title>
        <Paragraph class="mt-2">
          基础按钮组件，支持多种语义变体、尺寸、禁用与加载态，适用于表单提交、操作触发等场景。
          使用 Tailwind v4 类名，支持 light/dark 主题。
        </Paragraph>
      </section>

      {/* 2. 引入 */}
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

      {/* 3. 示例 */}
      <section class="space-y-8">
        <Title level={2}>示例</Title>

        <div class="space-y-4">
          <Title level={3}>variant 变体</Title>
          <div class="flex flex-wrap gap-3">
            <Button variant="default">default</Button>
            <Button variant="primary">primary</Button>
            <Button variant="secondary">secondary</Button>
            <Button variant="success">success</Button>
            <Button variant="warning">warning</Button>
            <Button variant="danger">danger</Button>
            <Button variant="ghost">ghost</Button>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleVariant}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>size 尺寸</Title>
          <div class="flex flex-wrap items-center gap-3">
            <Button size="xs">xs</Button>
            <Button size="sm">sm</Button>
            <Button size="md">md</Button>
            <Button size="lg">lg</Button>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleSize}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>disabled</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            各变体禁用态：opacity + grayscale，不可点击。
          </Paragraph>
          <div class="flex flex-wrap gap-3">
            <Button variant="default" disabled>default</Button>
            <Button variant="primary" disabled>primary</Button>
            <Button variant="secondary" disabled>secondary</Button>
            <Button variant="success" disabled>success</Button>
            <Button variant="warning" disabled>warning</Button>
            <Button variant="danger" disabled>danger</Button>
            <Button variant="ghost" disabled>ghost</Button>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleDisabled}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>loading 加载中</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            loading 为 true 时显示旋转图标并禁用点击。
          </Paragraph>
          <div class="flex flex-wrap gap-3">
            <Button variant="primary" loading>加载中</Button>
            <Button variant="secondary" loading>提交中</Button>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleLoading}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>type 按钮类型</Title>
          <div class="flex flex-wrap gap-3">
            <Button type="button" variant="primary">button</Button>
            <Button type="submit" variant="secondary">submit</Button>
            <Button type="reset" variant="ghost">reset</Button>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleType}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>ButtonGroup 按钮组（默认紧凑相连）</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            将多个按钮横向排列为一组，默认
            attached=true：中间无间隙、仅首尾圆角，焦点环贴边且仅画在外侧。
          </Paragraph>
          <div class="flex flex-wrap gap-4">
            <ButtonGroup>
              <Button
                variant="default"
                size="sm"
                onClick={() => console.log("刷新")}
              >
                刷新
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => console.log("导出")}
              >
                导出
              </Button>
            </ButtonGroup>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleButtonGroupAttached}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>ButtonGroup attached=false（保留间距）</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            attached=false 时按钮之间保留 gap，各自保留圆角。
          </Paragraph>
          <div class="flex flex-wrap gap-4">
            <ButtonGroup attached={false}>
              <Button variant="default" size="sm">刷新</Button>
              <Button variant="primary" size="sm">导出</Button>
            </ButtonGroup>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleButtonGroupSpaced}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>
      </section>

      {/* 4. API */}
      <section class="space-y-6">
        <Title level={2}>API</Title>

        <div class="space-y-3">
          <Title level={3}>Button</Title>
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
                {BUTTON_API.map((row) => (
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
        </div>

        <div class="space-y-3">
          <Title level={3}>ButtonGroup</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            按钮组容器，子节点通常为多个 Button。
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
                {BUTTON_GROUP_API.map((row) => (
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
        </div>
      </section>
    </div>
  );
}
