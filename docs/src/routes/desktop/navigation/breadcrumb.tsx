/**
 * Breadcrumb 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/navigation/breadcrumb
 */

import { Breadcrumb, CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const BREADCRUMB_API: ApiRow[] = [
  {
    name: "items",
    type: "BreadcrumbItem[]",
    default: "-",
    description: "面包屑项（label、href、onClick）",
  },
  {
    name: "separator",
    type: "unknown",
    default: "ChevronRight 图标",
    description: "自定义分隔符",
  },
  {
    name: "onItemClick",
    type: "(item, index) => void",
    default: "-",
    description: "某项无 href 时的点击回调",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "nav 容器 class",
  },
];

const BREADCRUMB_ITEM_API: ApiRow[] = [
  {
    name: "label",
    type: "string | unknown",
    default: "-",
    description: "显示文案",
  },
  {
    name: "href",
    type: "string",
    default: "-",
    description: "链接（最后一项可不传）",
  },
  {
    name: "onClick",
    type: "(e: Event) => void",
    default: "-",
    description: "无 href 时的点击回调",
  },
];

const importCode = `import { Breadcrumb } from "@dreamer/ui-preact";

const items = [
  { label: "首页", href: "#" },
  { label: "列表", href: "#" },
  { label: "详情" },
];
<Breadcrumb items={items} />`;

const exampleDefault = `const items = [
  { label: "首页", href: "#" },
  { label: "列表", href: "#" },
  { label: "详情" },
];
<Breadcrumb items={items} />`;

const exampleSeparator = `<Breadcrumb
  items={items}
  separator={<span class="mx-1.5 text-slate-400">/</span>}
/>`;

const exampleOnItemClick = `<Breadcrumb
  items={itemsWithClick}
  onItemClick={(item, index) => console.log(item.label, index)}
/>`;

export default function NavigationBreadcrumb() {
  const items = [
    { label: "首页", href: "#" },
    { label: "列表", href: "#" },
    { label: "详情" },
  ];

  const itemsWithClick = [
    { label: "首页", href: "#" },
    { label: "列表" },
    { label: "详情" },
  ];

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Breadcrumb 面包屑</Title>
        <Paragraph class="mt-2">
          面包屑：items（label、href 等）、separator、onItemClick、class。 使用
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
          <Title level={3}>默认</Title>
          <Breadcrumb items={items} />
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
          <Title level={3}>自定义 separator</Title>
          <Breadcrumb
            items={items}
            separator={<span class="mx-1.5 text-slate-400">/</span>}
          />
          <CodeBlock
            title="代码示例"
            code={exampleSeparator}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>onItemClick（无 href 项点击）</Title>
          <Breadcrumb
            items={itemsWithClick}
            onItemClick={(_item, index) => {
              if (typeof globalThis.console !== "undefined") {
                globalThis.console.log("clicked", index);
              }
            }}
          />
          <CodeBlock
            title="代码示例"
            code={exampleOnItemClick}
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
          BreadcrumbItem：label、href、onClick。Breadcrumb 属性如下。
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
              {BREADCRUMB_API.map((row) => (
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
          BreadcrumbItem
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
              {BREADCRUMB_ITEM_API.map((row) => (
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
