/**
 * Typography 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/basic/typography
 */

import { CodeBlock, Paragraph, Text, Title } from "@dreamer/ui-preact";

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const TITLE_API: ApiRow[] = [
  {
    name: "level",
    type: "1 | 2 | 3 | 4 | 5 | 6",
    default: "2",
    description: "标题层级，对应 h1～h6",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
  { name: "children", type: "unknown", default: "-", description: "标题内容" },
];

const TEXT_API: ApiRow[] = [
  {
    name: "truncate",
    type: "boolean",
    default: "false",
    description: "是否单行省略号截断",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
  { name: "children", type: "unknown", default: "-", description: "正文内容" },
];

const PARAGRAPH_API: ApiRow[] = [
  { name: "class", type: "string", default: "-", description: "额外 class" },
  { name: "children", type: "unknown", default: "-", description: "段落内容" },
];

const importCode = `import { Title, Text, Paragraph } from "@dreamer/ui-preact";

<Title level={1}>标题</Title>
<Text>正文</Text>
<Paragraph>段落</Paragraph>`;

const exampleTitle = `<Title level={1}>标题 level 1</Title>
<Title level={2}>标题 level 2</Title>
<Title level={3}>标题 level 3</Title>`;

const exampleText = `<Text>这是一段正文（Text）。</Text>
<Text truncate class="max-w-xs block">
  这是一段会被省略号截断的较长正文内容。
</Text>`;

const exampleParagraph = `<Paragraph>
  Paragraph 渲染为语义化 <p>，默认使用 relaxed 行高与灰阶正文色，在 light / dark
  下对比度已区分，适合说明文、帮助文案与文档正文等需要成段阅读的场景。
</Paragraph>
<Paragraph>
  多个 Paragraph 纵向堆叠时，可通过外层容器（如 space-y-*）控制段间距；需要首行缩进、
  两端对齐等版式时，请通过 class 传入 Tailwind 工具类覆盖默认样式。
</Paragraph>`;

export default function BasicTypography() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Typography 排版</Title>
        <Paragraph class="mt-2">
          Title（标题 level 1～6）、Text（正文，可
          truncate）、Paragraph（段落）。适用于文档与页面排版，Tailwind v4 +
          light/dark。
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
          <Title level={3}>Title 标题层级</Title>
          <div class="space-y-2">
            <Title level={1}>标题 level 1</Title>
            <Title level={2}>标题 level 2</Title>
            <Title level={3}>标题 level 3</Title>
            <Title level={4}>标题 level 4</Title>
            <Title level={5}>标题 level 5</Title>
            <Title level={6}>标题 level 6</Title>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleTitle}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>Text 正文</Title>
          <p>
            <Text>这是一段正文（Text）。</Text>
          </p>
          <p>
            <Text truncate class="max-w-xs block">
              这是一段会被省略号截断的较长正文内容，用于演示 truncate 属性。
            </Text>
          </p>
          <CodeBlock
            title="代码示例"
            code={exampleText}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>Paragraph 段落</Title>
          <Paragraph>
            {`Paragraph 渲染为语义化 <p>，默认使用 relaxed 行高与灰阶正文色，在 light / dark 下对比度已区分，适合说明文、帮助文案与文档正文等需要成段阅读的场景。`}
          </Paragraph>
          <Paragraph>
            {`多个 Paragraph 纵向堆叠时，可通过外层容器（如 space-y-*）控制段间距；需要首行缩进、两端对齐等版式时，请通过 class 传入 Tailwind 工具类覆盖默认样式。`}
          </Paragraph>
          <CodeBlock
            title="代码示例"
            code={exampleParagraph}
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
          Title / Text / Paragraph 属性如下（均为可选）。
        </Paragraph>
        <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-600">
          <table class="w-full min-w-lg text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/80">
                <th class="px-4 py-3 text-left font-medium text-slate-900 dark:text-slate-100">
                  组件
                </th>
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
              {TITLE_API.map((row) => (
                <tr
                  key={`title-${row.name}`}
                  class="border-b border-slate-100 dark:border-slate-700"
                >
                  <td class="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    Title
                  </td>
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
              {TEXT_API.map((row) => (
                <tr
                  key={`text-${row.name}`}
                  class="border-b border-slate-100 dark:border-slate-700"
                >
                  <td class="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    Text
                  </td>
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
              {PARAGRAPH_API.map((row) => (
                <tr
                  key={`p-${row.name}`}
                  class="border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                >
                  <td class="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    Paragraph
                  </td>
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
