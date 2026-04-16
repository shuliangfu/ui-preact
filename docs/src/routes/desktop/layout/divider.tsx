/**
 * Divider 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/layout/divider
 */

import { CodeBlock, Divider, Paragraph, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const DIVIDER_API: ApiRow[] = [
  {
    name: "type",
    type: "horizontal | vertical",
    default: "horizontal",
    description: "水平或垂直",
  },
  {
    name: "dashed",
    type: "boolean",
    default: "false",
    description: "是否虚线",
  },
  {
    name: "orientation",
    type: "left | right | center",
    default: "center",
    description: "中间文案对齐（仅 type=horizontal 且 children 时有效）",
  },
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "中间文案（不传则为纯线）",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
];

const importCode = `import { Divider } from "@dreamer/ui-preact";

<Divider />
<Divider>中间文案</Divider>
<Divider type="vertical" />`;

const exampleHorizontal = `<p>上方</p>
<Divider />
<p>下方</p>`;

const exampleOrientation = `<Divider>中间文案</Divider>
<Divider orientation="left">左侧</Divider>
<Divider orientation="right">右侧</Divider>`;

const exampleDashed = `<Divider dashed />`;

const exampleVertical = `<span>左</span>
<Divider type="vertical" />
<span>中</span>
<Divider type="vertical" dashed />
<span>右</span>`;

export default function LayoutDivider() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Divider 分割线</Title>
        <Paragraph class="mt-2">
          分割线：type（horizontal/vertical）、dashed、orientation（left/right/center）、children、class。
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
          <Title level={3}>水平默认</Title>
          <div class="w-full">
            <p class="text-sm text-slate-600 dark:text-slate-400">上方</p>
            <Divider />
            <p class="text-sm text-slate-600 dark:text-slate-400">下方</p>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleHorizontal}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>中间文案（orientation）</Title>
          <div class="w-full">
            <Divider>中间文案</Divider>
            <Divider orientation="left">左侧</Divider>
            <Divider orientation="right">右侧</Divider>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleOrientation}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>dashed</Title>
          <div class="w-full">
            <Divider dashed />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleDashed}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>type=vertical</Title>
          <div class="flex gap-4 h-24 items-stretch">
            <span class="text-sm text-slate-500">左</span>
            <Divider type="vertical" />
            <span class="text-sm text-slate-500">中</span>
            <Divider type="vertical" dashed />
            <span class="text-sm text-slate-500">右</span>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleVertical}
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
              {DIVIDER_API.map((row) => (
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
