/**
 * Tabs 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/layout/tabs
 */

import { signal } from "@preact/signals";
import { CodeBlock, Paragraph, Tabs, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const TABS_API: ApiRow[] = [
  {
    name: "items",
    type: "TabItem[]",
    default: "-",
    description: "标签项（key、label、disabled、children）",
  },
  {
    name: "activeKey",
    type: "string",
    default: "-",
    description: "当前激活 key（受控）",
  },
  {
    name: "onChange",
    type: "(key: string) => void",
    default: "-",
    description: "切换回调",
  },
  {
    name: "type",
    type: "line | card",
    default: "line",
    description: "line：文件夹式贴线标签；card：浅槽内卡片式",
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: "标签是否占满宽度均分",
  },
  { name: "class", type: "string", default: "-", description: "外层 class" },
  {
    name: "tabListClass",
    type: "string",
    default: "-",
    description: "标签栏 class",
  },
  {
    name: "panelClass",
    type: "string",
    default: "-",
    description: "面板容器 class",
  },
];

const importCode = `import { signal } from "@preact/signals";
import { Tabs } from "@dreamer/ui-preact";

const activeKey = signal("a");
const items = [
  { key: "a", label: "标签 A", children: <p>内容 A</p> },
  { key: "b", label: "标签 B", children: <p>内容 B</p> },
];
{() => (
  <Tabs
    items={items}
    activeKey={activeKey.value}
    onChange={(k) => activeKey.value = k}
    type="line"
  />
)}`;

const exampleLine = `{() => (
  <Tabs
    items={items}
    activeKey={activeKey.value}
    onChange={(k) => activeKey.value = k}
    type="line"
  />
)}`;

const exampleCard = `{() => (
  <Tabs
    items={items}
    activeKey={activeKey.value}
    onChange={(k) => activeKey.value = k}
    type="card"
  />
)}`;

const exampleFullWidth = `{() => (
  <Tabs
    items={items}
    activeKey={activeKey.value}
    onChange={(k) => activeKey.value = k}
    type="line"
    fullWidth
  />
)}`;

const exampleDisabled = `items 中某项设置 disabled: true 即可禁用该标签`;

export default function LayoutTabs() {
  const activeKey = signal("a");

  const items = [
    {
      key: "a",
      label: "标签 A",
      children: (
        <p class="text-sm text-slate-600 dark:text-slate-400">
          内容 A
        </p>
      ),
    },
    {
      key: "b",
      label: "标签 B",
      children: (
        <p class="text-sm text-slate-600 dark:text-slate-400">
          内容 B
        </p>
      ),
    },
    {
      key: "c",
      label: "标签 C",
      children: (
        <p class="text-sm text-slate-600 dark:text-slate-400">
          内容 C
        </p>
      ),
    },
  ];

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Tabs 标签页</Title>
        <Paragraph class="mt-2">
          标签页：items（key、label、disabled、children）、activeKey、onChange、type（line/card）、fullWidth、class、tabListClass、panelClass。
          <code class="rounded bg-slate-100 px-1 dark:bg-slate-800">line</code>
          {" "}
          为文件夹式：激活项左/上/右边框、无底边，底色与根容器一致（默认{" "}
          <code class="rounded bg-slate-100 px-1 dark:bg-slate-800">
            bg-slate-50 / dark:bg-slate-950
          </code>
          ，可用{" "}
          <code class="rounded bg-slate-100 px-1 dark:bg-slate-800">class</code>
          {" "}
          覆盖以贴合页面）；{" "}
          <code class="rounded bg-slate-100 px-1 dark:bg-slate-800">card</code>
          {" "}
          为槽内卡片式。使用 Tailwind v4，支持 light/dark 主题。
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

      {/* 包成 getter，仅示例区随 activeKey 更新，避免整页重跑、data-view-dynamic 整树闪动 */}
      <section class="space-y-8">
        <Title level={2}>示例</Title>

        <div class="space-y-4">
          <Title level={3}>type=line</Title>
          {() => (
            <Tabs
              items={items}
              activeKey={activeKey.value}
              onChange={(k) => activeKey.value = k}
              type="line"
            />
          )}
          <CodeBlock
            title="代码示例"
            code={exampleLine}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>type=card</Title>
          {() => (
            <Tabs
              items={items}
              activeKey={activeKey.value}
              onChange={(k) => activeKey.value = k}
              type="card"
            />
          )}
          <CodeBlock
            title="代码示例"
            code={exampleCard}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>fullWidth</Title>
          {() => (
            <Tabs
              items={items}
              activeKey={activeKey.value}
              onChange={(k) => activeKey.value = k}
              type="line"
              fullWidth
            />
          )}
          <CodeBlock
            title="代码示例"
            code={exampleFullWidth}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>items 含 disabled</Title>
          {() => (
            <Tabs
              items={[
                ...items.slice(0, 2),
                {
                  key: "c",
                  label: "标签 C（禁用）",
                  disabled: true,
                  children: <p class="text-sm">不可选</p>,
                },
              ]}
              activeKey={activeKey.value}
              onChange={(k) => activeKey.value = k}
              type="line"
            />
          )}
          <CodeBlock
            title="代码示例"
            code={exampleDisabled}
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
          TabItem：key、label、disabled、children。Tabs 属性如下。
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
              {TABS_API.map((row) => (
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
