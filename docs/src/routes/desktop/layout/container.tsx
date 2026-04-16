/**
 * Container 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/layout/container
 */

import { CodeBlock, Container, Paragraph, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const CONTAINER_API: ApiRow[] = [
  {
    name: "maxWidth",
    type: "sm | md | lg | xl | 2xl | full",
    default: "xl",
    description: "最大宽度预设（px：640/768/1024/1280/1536/无限制）",
  },
  {
    name: "centered",
    type: "boolean",
    default: "true",
    description: "是否水平居中",
  },
  {
    name: "padded",
    type: "boolean",
    default: "true",
    description: "是否使用默认内边距",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
  { name: "children", type: "unknown", default: "-", description: "子节点" },
];

const importCode = `import { Container } from "@dreamer/ui-preact";

<Container maxWidth="md">
  <p>内容</p>
</Container>`;

const exampleMaxWidth = `<Container
  maxWidth="md"
  class="bg-slate-100 dark:bg-slate-800 rounded-lg py-4"
>
  <p>maxWidth=md（768px）</p>
</Container>
<Container
  maxWidth="xl"
  class="bg-slate-100 dark:bg-slate-800 rounded-lg py-4"
>
  <p>maxWidth=xl（1280px）</p>
</Container>`;

const exampleCenteredPadded = `<Container
  maxWidth="md"
  centered={false}
  padded={false}
  class="..."
>
  <p>不居中、无默认内边距</p>
</Container>`;

export default function LayoutContainer() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Container 最大宽度容器</Title>
        <Paragraph class="mt-2">
          容器：maxWidth（sm/md/lg/xl/2xl/full）、centered、padded、class、children。
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
          <Title level={3}>maxWidth（md / xl）</Title>
          <Container
            maxWidth="md"
            class="bg-slate-100 dark:bg-slate-800 rounded-lg py-4"
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              maxWidth=md（768px）
            </p>
          </Container>
          <Container
            maxWidth="xl"
            class="bg-slate-100 dark:bg-slate-800 rounded-lg py-4"
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              maxWidth=xl（1280px）
            </p>
          </Container>
          <CodeBlock
            title="代码示例"
            code={exampleMaxWidth}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>centered=false / padded=false</Title>
          <Container
            maxWidth="md"
            centered={false}
            padded={false}
            class="bg-slate-100 dark:bg-slate-800 rounded-lg py-4"
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              不居中、无默认内边距
            </p>
          </Container>
          <CodeBlock
            title="代码示例"
            code={exampleCenteredPadded}
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
              {CONTAINER_API.map((row) => (
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
