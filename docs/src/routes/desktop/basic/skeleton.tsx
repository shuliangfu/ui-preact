/**
 * Skeleton 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/basic/skeleton
 */

import { CodeBlock, Paragraph, Skeleton, Title } from "@dreamer/ui-preact";

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const SKELETON_API: ApiRow[] = [
  {
    name: "size",
    type: "SizeVariant",
    default: "md",
    description: "预设高度：xs、sm、md、lg",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "自定义宽高（如 w-full h-4）",
  },
];

const importCode = `import { Skeleton } from "@dreamer/ui-preact";

<Skeleton size="md" />
<Skeleton class="w-full h-4" />`;

const exampleSize = `<Skeleton size="xs" />
<Skeleton size="sm" />
<Skeleton size="md" />
<Skeleton size="lg" />`;

const exampleClass = `<Skeleton class="w-full h-4" />
<Skeleton class="w-3/4 h-4" />
<Skeleton class="w-1/2 h-8" />`;

const examplePage =
  `<div class="rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
  <header class="flex h-14 items-center gap-4 border-b px-4">
    <Skeleton class="h-8 w-24 rounded-md shrink-0" />
    <nav class="flex gap-2">
      <Skeleton class="h-8 w-16 rounded-md" />
      <Skeleton class="h-8 w-16 rounded-md" />
    </nav>
  </header>
  <main class="p-6 space-y-4">
    <Skeleton class="h-8 w-64" />
    <Skeleton class="h-4 w-full max-w-xl" />
    <div class="grid grid-cols-3 gap-4">
      <Skeleton class="h-24 w-full rounded-lg" />
      <Skeleton class="h-24 w-full rounded-lg" />
      <Skeleton class="h-24 w-full rounded-lg" />
    </div>
  </main>
</div>`;

export default function BasicSkeleton() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Skeleton 骨架屏</Title>
        <Paragraph class="mt-2">
          加载占位组件，支持 size（xs/sm/md/lg）与 class 自定义宽高（如 w-full
          h-4）。用于列表、卡片、整页加载占位。Tailwind v4 + light/dark。
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
          <div class="space-y-3">
            <Skeleton size="xs" />
            <Skeleton size="sm" />
            <Skeleton size="md" />
            <Skeleton size="lg" />
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
          <Title level={3}>自定义宽高（class）</Title>
          <div class="space-y-3">
            <Skeleton class="w-full h-4" />
            <Skeleton class="w-3/4 h-4" />
            <Skeleton class="w-1/2 h-8" />
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

        <div class="space-y-4">
          <Title level={3}>模拟整页排版</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            顶栏、主内容区的骨架，用于整页加载占位。
          </Paragraph>
          <div class="rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden bg-white dark:bg-slate-900">
            <header class="flex h-14 items-center gap-4 border-b border-slate-200 dark:border-slate-700 px-4">
              <Skeleton class="h-8 w-24 rounded-md shrink-0" />
              <nav class="flex gap-2">
                <Skeleton class="h-8 w-16 rounded-md" />
                <Skeleton class="h-8 w-16 rounded-md" />
                <Skeleton class="h-8 w-20 rounded-md" />
              </nav>
              <div class="ml-auto flex items-center gap-2">
                <Skeleton class="h-8 w-8 rounded-full" />
                <Skeleton class="h-8 w-8 rounded-full" />
              </div>
            </header>
            <div class="min-h-[200px] p-6 space-y-4">
              <Skeleton class="h-8 w-64" />
              <Skeleton class="h-4 w-full max-w-xl" />
              <Skeleton class="h-4 w-full max-w-lg" />
              <div class="grid grid-cols-3 gap-4">
                <Skeleton class="h-24 w-full rounded-lg" />
                <Skeleton class="h-24 w-full rounded-lg" />
                <Skeleton class="h-24 w-full rounded-lg" />
              </div>
            </div>
          </div>
          <CodeBlock
            title="代码示例"
            code={examplePage}
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
              {SKELETON_API.map((row) => (
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
