/**
 * Empty 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/data-display/empty
 */

import { Button, CodeBlock, Empty, Paragraph, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const EMPTY_API: ApiRow[] = [
  {
    name: "description",
    type: "string | unknown",
    default: "-",
    description: "主描述文案",
  },
  { name: "image", type: "unknown", default: "-", description: "自定义插图" },
  {
    name: "simple",
    type: "boolean",
    default: "false",
    description: "是否简单占位图（线条风格）",
  },
  {
    name: "footer",
    type: "unknown",
    default: "-",
    description: "底部区域（如按钮）",
  },
  { name: "class", type: "string", default: "-", description: "容器 class" },
  {
    name: "imageClass",
    type: "string",
    default: "-",
    description: "插图容器 class",
  },
  {
    name: "descriptionClass",
    type: "string",
    default: "-",
    description: "描述 class",
  },
];

const importCode = `import { Button, Empty } from "@dreamer/ui-preact";

<Empty description="暂无数据" />
<Empty
  description="没有找到"
  simple
  footer={<Button variant="primary">新建</Button>}
/>`;

const exampleDefault = `<Empty description="暂无数据" />`;

const exampleSimpleFooter = `<Empty
  description="没有找到相关结果"
  simple
  footer={<Button variant="primary">新建</Button>}
/>`;

const exampleCustom = `<Empty
  description="自定义插图可通过 image 传入节点"
  footer={<Button variant="ghost" size="sm">刷新</Button>}
/>`;

export default function DataDisplayEmpty() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Empty 空状态</Title>
        <Paragraph class="mt-2">
          空状态：description、image、simple、footer；可自定义插图与描述样式（imageClass、descriptionClass）。
          使用 Tailwind v4，支持 light/dark 主题。
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
          <Title level={3}>默认</Title>
          <Empty description="暂无数据" />
          <CodeBlock
            title="代码示例"
            code={exampleDefault}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>simple + footer</Title>
          <Empty
            description="没有找到相关结果"
            simple
            footer={<Button type="button" variant="primary">新建</Button>}
          />
          <CodeBlock
            title="代码示例"
            code={exampleSimpleFooter}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>自定义 footer</Title>
          <Empty
            description="自定义插图可通过 image 传入节点"
            footer={
              <Button type="button" variant="ghost" size="sm">刷新</Button>
            }
          />
          <CodeBlock
            title="代码示例"
            code={exampleCustom}
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
              {EMPTY_API.map((row) => (
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
