/**
 * Anchor 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/navigation/anchor
 */

import { signal } from "@preact/signals";
import { Anchor, CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const ANCHOR_API: ApiRow[] = [
  {
    name: "links",
    type: "AnchorLink[]",
    default: "-",
    description: "锚点项（key、href、title）",
  },
  {
    name: "activeKey",
    type: "string",
    default: "-",
    description: "当前高亮的 key（受控）",
  },
  {
    name: "onChange",
    type: "(key: string) => void",
    default: "-",
    description: "点击或滚动导致高亮变化时回调",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
];

const ANCHOR_LINK_API: ApiRow[] = [
  {
    name: "key",
    type: "string",
    default: "-",
    description: "唯一 key，与 activeKey 对应",
  },
  {
    name: "href",
    type: "string",
    default: "-",
    description: "目标元素 id（如 #section1）",
  },
  {
    name: "title",
    type: "string | unknown",
    default: "-",
    description: "显示标题",
  },
];

const importCode = `import { signal } from "@preact/signals";
import { Anchor } from "@dreamer/ui-preact";

const activeKey = signal("section1");
const links = [
  { key: "section1", href: "#section1", title: "第一节" },
  { key: "section2", href: "#section2", title: "第二节" },
];
<Anchor links={links} activeKey={activeKey.value} onChange={(k) => activeKey.value = k} />`;

const exampleBasic = `const links = [
  { key: "section1", href: "#section1", title: "第一节" },
  { key: "section2", href: "#section2", title: "第二节" },
  { key: "section3", href: "#section3", title: "第三节" },
];
<Anchor links={links} activeKey={activeKey.value} onChange={(k) => activeKey.value = k} />`;

export default function NavigationAnchor() {
  const activeKey = signal("section1");

  const links = [
    { key: "section1", href: "#section1", title: "第一节" },
    { key: "section2", href: "#section2", title: "第二节" },
    { key: "section3", href: "#section3", title: "第三节" },
  ];

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Anchor 锚点</Title>
        <Paragraph class="mt-2">
          锚点：links、activeKey、onChange、class。点击平滑滚动到对应 id，可配合
          initAnchorSpy 做滚动高亮。 使用 Tailwind v4，支持 light/dark 主题。
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
          <Title level={3}>基础用法（左侧锚点 + 右侧内容）</Title>
          <div class="flex gap-8">
            <aside class="w-40 shrink-0">
              <Anchor
                links={links}
                activeKey={activeKey.value}
                onChange={(k) => activeKey.value = k}
              />
            </aside>
            <div class="flex-1 space-y-12">
              <section id="section1" class="pt-4">
                <h3 class="text-lg font-medium">第一节</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  内容区域一。锚点链接会滚动到此。
                </p>
              </section>
              <section id="section2" class="pt-4">
                <h3 class="text-lg font-medium">第二节</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  内容区域二。
                </p>
              </section>
              <section id="section3" class="pt-4">
                <h3 class="text-lg font-medium">第三节</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  内容区域三。
                </p>
              </section>
            </div>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleBasic}
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
          AnchorLink：key、href、title。Anchor 属性如下。
        </Paragraph>
        <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-600 mb-4">
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
              {ANCHOR_API.map((row) => (
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
        <Paragraph class="text-sm font-medium text-slate-700 dark:text-slate-300">
          AnchorLink
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
              {ANCHOR_LINK_API.map((row) => (
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
