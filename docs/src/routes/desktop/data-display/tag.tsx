/**
 * Tag 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/data-display/tag
 */

import { signal } from "@preact/signals";
import { CodeBlock, Paragraph, Tag, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const TAG_API: ApiRow[] = [
  { name: "children", type: "unknown", default: "-", description: "标签内容" },
  {
    name: "variant",
    type: "ColorVariant | outline",
    default: "-",
    description: "颜色/语义变体",
  },
  { name: "size", type: "SizeVariant", default: "-", description: "尺寸" },
  {
    name: "closable",
    type: "boolean",
    default: "false",
    description: "是否可关闭",
  },
  {
    name: "onClose",
    type: "(e: Event) => void",
    default: "-",
    description: "关闭回调",
  },
  { name: "icon", type: "unknown", default: "-", description: "左侧图标" },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "是否禁用",
  },
  {
    name: "rounded",
    type: "boolean",
    default: "false",
    description: "是否圆角胶囊",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
];

const importCode = `import { Tag } from "@dreamer/ui-preact";

<Tag>默认</Tag>
<Tag variant="primary">Primary</Tag>
<Tag closable onClose={() => {}}>可关闭</Tag>`;

const exampleVariant = `<Tag>默认</Tag>
<Tag variant="primary">Primary</Tag>
<Tag variant="success">Success</Tag>
<Tag variant="warning">Warning</Tag>
<Tag variant="danger">Danger</Tag>
<Tag variant="outline">Outline</Tag>`;

const exampleSizeClosable =
  `<Tag size="xs">xs</Tag> <Tag size="sm">sm</Tag> <Tag size="md">md</Tag> <Tag size="lg">lg</Tag>
<Tag closable onClose={() => closed.value = true}>可关闭</Tag>`;

const exampleDisabledRounded = `<Tag disabled>disabled</Tag>
<Tag rounded>rounded</Tag>`;

export default function DataDisplayTag() {
  const closed = signal(false);

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Tag 标签</Title>
        <Paragraph class="mt-2">
          标签：variant、size、closable、onClose、icon、disabled、rounded。 使用
          Tailwind v4，支持 light/dark 主题。
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

        <div class="space-y-4">
          <Title level={3}>variant</Title>
          <div class="flex flex-wrap gap-2">
            <Tag>默认</Tag>
            <Tag variant="primary">Primary</Tag>
            <Tag variant="success">Success</Tag>
            <Tag variant="warning">Warning</Tag>
            <Tag variant="danger">Danger</Tag>
            <Tag variant="outline">Outline</Tag>
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
          <Title level={3}>size / closable</Title>
          <div class="flex flex-wrap gap-2">
            <Tag size="xs">xs</Tag>
            <Tag size="sm">sm</Tag>
            <Tag size="md">md</Tag>
            <Tag size="lg">lg</Tag>
          </div>
          {!closed.value && (
            <Tag closable onClose={() => closed.value = true}>可关闭</Tag>
          )}
          <CodeBlock
            title="代码示例"
            code={exampleSizeClosable}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>disabled / rounded</Title>
          <div class="flex flex-wrap gap-2">
            <Tag disabled>disabled</Tag>
            <Tag rounded>rounded</Tag>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleDisabledRounded}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>
      </section>

      <section class="space-y-3">
        <Title level={2}>API</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          组件接收以下属性。
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
              {TAG_API.map((row) => (
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
