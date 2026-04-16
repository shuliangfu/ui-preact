/**
 * Spinner 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/basic/spinner
 */

import { CodeBlock, Paragraph, Spinner, Title } from "@dreamer/ui-preact";

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const SPINNER_API: ApiRow[] = [
  {
    name: "size",
    type: "SizeVariant",
    default: "md",
    description: "尺寸：xs、sm、md、lg",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "额外 class（如颜色 text-green-600）",
  },
];

const importCode = `import { Spinner } from "@dreamer/ui-preact";

<Spinner size="md" />
<Spinner class="text-green-600" />`;

const exampleSize = `<Spinner size="xs" />
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />`;

const exampleClass = `<Spinner class="text-green-600" />
<Spinner class="text-red-500" size="lg" />`;

export default function BasicSpinner() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Spinner 加载</Title>
        <Paragraph class="mt-2">
          加载旋转指示器，支持
          size（xs/sm/md/lg）、class（如自定义颜色）。适用于按钮
          loading、区域加载等。Tailwind v4 + light/dark。
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
          <Title level={3}>size 尺寸</Title>
          <div class="flex flex-wrap items-center gap-6">
            <Spinner size="xs" />
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
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
          <Title level={3}>自定义 class（颜色）</Title>
          <div class="flex flex-wrap items-center gap-6">
            <Spinner class="text-green-600" />
            <Spinner class="text-red-500" size="lg" />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleClass}
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
              {SPINNER_API.map((row) => (
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
