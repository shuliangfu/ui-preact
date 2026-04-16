/**
 * CodeBlock 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/data-display/code-block
 */

import { signal } from "@preact/signals";
import { CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";

const sampleJS = `function hello(name) {
  console.log("Hello, " + name);
}
hello("World");
`;

const sampleJSON = `{
  "name": "@dreamer/ui-preact",
  "version": "0.1.0"
}
`;

const sampleTS = `interface CodeBlockProps {
  code: string;
  language?: CodeBlockLanguage;
  showLineNumbers?: boolean;
}
`;

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const CODE_BLOCK_API: ApiRow[] = [
  { name: "code", type: "string", default: "-", description: "代码内容" },
  {
    name: "language",
    type: "CodeBlockLanguage",
    default: "-",
    description: "语言（语法高亮）",
  },
  {
    name: "showLineNumbers",
    type: "boolean",
    default: "false",
    description: "是否显示行号",
  },
  {
    name: "lineNumberStart",
    type: "number",
    default: "1",
    description: "行号起始值",
  },
  {
    name: "maxHeight",
    type: "string | number",
    default: "-",
    description: "最大高度，超出可滚动",
  },
  {
    name: "title",
    type: "string | null",
    default: "-",
    description: "标题（如文件名）",
  },
  {
    name: "copyable",
    type: "boolean",
    default: "true",
    description: "是否显示复制按钮",
  },
  {
    name: "showWindowDots",
    type: "boolean",
    default: "true",
    description: "是否显示左上角三色圆点",
  },
  {
    name: "onCopy",
    type: "() => void",
    default: "-",
    description: "复制成功后回调",
  },
  {
    name: "wrapLongLines",
    type: "boolean",
    default: "false",
    description: "长行是否换行",
  },
  {
    name: "preClass",
    type: "string",
    default: "-",
    description: "pre 的 class",
  },
  {
    name: "codeClass",
    type: "string",
    default: "-",
    description: "code 的 class",
  },
  { name: "class", type: "string", default: "-", description: "最外层 class" },
];

const importCode = `import { CodeBlock } from "@dreamer/ui-preact";

<CodeBlock
  code={\`console.log("hello");\`}
  language="javascript"
  title="example.js"
  copyable
/>`;

const exampleTitleCopyable = `<CodeBlock
  code={sampleJS}
  language="javascript"
  title="example.js"
  copyable
  onCopy={() => {}}
/>`;

const exampleLineNumbersMaxHeight = `<CodeBlock
  code={sampleJSON}
  language="json"
  showLineNumbers
  lineNumberStart={1}
  maxHeight="12rem"
/>`;

const examplePlaintext = `<CodeBlock
  code="echo 'no highlight'"
  language="plaintext"
  title="plaintext"
/>`;

export default function DataDisplayCodeBlock() {
  const copied = signal(false);

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>CodeBlock 代码块</Title>
        <Paragraph class="mt-2">
          代码块：code、language、showLineNumbers、lineNumberStart、maxHeight、title、copyable、showWindowDots、onCopy、wrapLongLines、preClass、codeClass。
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
          <Title level={3}>title + copyable + onCopy</Title>
          <CodeBlock
            code={sampleJS}
            language="javascript"
            title="example.js"
            copyable
            onCopy={() => {
              copied.value = true;
              setTimeout(() => copied.value = false, 1500);
            }}
          />
          {copied.value && <p class="text-sm text-green-600">已复制到剪贴板</p>}
          <CodeBlock
            title="代码示例"
            code={exampleTitleCopyable}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>showLineNumbers + maxHeight</Title>
          <CodeBlock
            code={sampleJSON}
            language="json"
            showLineNumbers
            lineNumberStart={1}
            maxHeight="12rem"
          />
          <CodeBlock
            title="代码示例"
            code={exampleLineNumbersMaxHeight}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>language=typescript / plaintext</Title>
          <CodeBlock
            code={sampleTS}
            language="typescript"
            title="CodeBlock.tsx"
            showLineNumbers
            copyable={false}
          />
          <CodeBlock
            code="echo 'no highlight'"
            language="plaintext"
            title="plaintext"
          />
          <CodeBlock
            title="代码示例"
            code={examplePlaintext}
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
          组件接收以下属性，code 为必填。
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
              {CODE_BLOCK_API.map((row) => (
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
