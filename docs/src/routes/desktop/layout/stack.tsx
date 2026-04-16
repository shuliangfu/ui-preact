/**
 * Stack 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/layout/stack
 */

import { CodeBlock, Paragraph, Stack, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const STACK_API: ApiRow[] = [
  {
    name: "direction",
    type: "column | row",
    default: "column",
    description: "方向",
  },
  {
    name: "gap",
    type: "number | string",
    default: "4",
    description: "间距（Tailwind 值）",
  },
  { name: "align", type: "string", default: "-", description: "交叉轴对齐" },
  { name: "justify", type: "string", default: "-", description: "主轴对齐" },
  { name: "wrap", type: "boolean", default: "false", description: "是否换行" },
  {
    name: "inline",
    type: "boolean",
    default: "false",
    description: "是否 inline-flex",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
  { name: "children", type: "unknown", default: "-", description: "子节点" },
];

const importCode = `import { Stack } from "@dreamer/ui-preact";

<Stack
  direction="column"
  gap={4}
>
  <div>1</div>
  <div>2</div>
</Stack>`;

const exampleColumn = `<Stack
  direction="column"
  gap={4}
  class="max-w-xs"
>
  <div>1</div>
  <div>2</div>
  <div>3</div>
</Stack>`;

const exampleRowAlign = `<Stack
  direction="row"
  gap={2}
  align="center"
>
  <div>A</div>
  <div>B</div>
  <div>C</div>
</Stack>`;

const exampleJustify = `<Stack
  direction="row"
  gap={4}
  justify="between"
  class="max-w-md"
>
  <span>左</span>
  <span>右</span>
</Stack>`;

const exampleWrap = `<Stack
  direction="row"
  gap={2}
  wrap
  class="max-w-48"
>
  <div>1</div><div>2</div><div>3</div><div>4</div>
</Stack>`;

export default function LayoutStack() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Stack 堆叠</Title>
        <Paragraph class="mt-2">
          堆叠：direction、gap、align、justify、wrap、inline、class、children。
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
          <Title level={3}>direction=column</Title>
          <Stack direction="column" gap={4} class="max-w-xs">
            <div class="rounded bg-slate-200 dark:bg-slate-600 p-2">1</div>
            <div class="rounded bg-slate-200 dark:bg-slate-600 p-2">2</div>
            <div class="rounded bg-slate-200 dark:bg-slate-600 p-2">3</div>
          </Stack>
          <CodeBlock
            title="代码示例"
            code={exampleColumn}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>direction=row, align=center</Title>
          <Stack direction="row" gap={2} align="center">
            <div class="rounded bg-blue-200 dark:bg-blue-800 p-2">A</div>
            <div class="rounded bg-blue-200 dark:bg-blue-800 p-2">B</div>
            <div class="rounded bg-blue-200 dark:bg-blue-800 p-2">C</div>
          </Stack>
          <CodeBlock
            title="代码示例"
            code={exampleRowAlign}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>justify=between</Title>
          <Stack direction="row" gap={4} justify="between" class="max-w-md">
            <span class="text-sm">左</span>
            <span class="text-sm">右</span>
          </Stack>
          <CodeBlock
            title="代码示例"
            code={exampleJustify}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>wrap</Title>
          <Stack direction="row" gap={2} wrap class="max-w-48">
            <div class="rounded bg-slate-200 dark:bg-slate-600 p-2">1</div>
            <div class="rounded bg-slate-200 dark:bg-slate-600 p-2">2</div>
            <div class="rounded bg-slate-200 dark:bg-slate-600 p-2">3</div>
            <div class="rounded bg-slate-200 dark:bg-slate-600 p-2">4</div>
          </Stack>
          <CodeBlock
            title="代码示例"
            code={exampleWrap}
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
              {STACK_API.map((row) => (
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
