/**
 * Collapse 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/data-display/collapse
 */

import { CodeBlock, Collapse, Paragraph, Title } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const COLLAPSE_API: ApiRow[] = [
  {
    name: "items",
    type: "CollapseItem[]",
    default: "-",
    description: "折叠项（key、header、children、disabled、showArrow）",
  },
  {
    name: "activeKey",
    type: "string[] | () => string[]",
    default: "-",
    description:
      "当前展开 key 列表（受控）；推荐 `() => sig.value` 或 getter，细粒度更新下勿只传一次性快照",
  },
  {
    name: "defaultActiveKey",
    type: "string[]",
    default: "-",
    description: "默认展开 key（非受控）",
  },
  {
    name: "onChange",
    type: "(keys: string[]) => void",
    default: "-",
    description: "展开/收起变化回调",
  },
  {
    name: "accordion",
    type: "boolean",
    default: "false",
    description: "是否手风琴（仅一项展开）",
  },
  {
    name: "bordered",
    type: "boolean",
    default: "true",
    description: "是否带边框",
  },
  {
    name: "ghost",
    type: "boolean",
    default: "false",
    description: "幽灵模式（无边框）",
  },
  {
    name: "size",
    type: "SizeVariant",
    default: "md",
    description:
      "尺寸档位：xs、sm、md、lg；控制标题行与展开区的 padding、字号及右侧箭头大小，未传为 md",
  },
  {
    name: "showArrow",
    type: "boolean",
    default: "true",
    description: "是否显示箭头",
  },
  {
    name: "expandIcon",
    type: "unknown",
    default: "-",
    description: "自定义展开图标",
  },
  { name: "class", type: "string", default: "-", description: "容器 class" },
];

const importCode = `import { signal } from "@preact/signals";
import { Collapse } from "@dreamer/ui-preact";

const activeKey = signal<string[]>(["1"]);
const items = [{ key: "1", header: "面板 1", children: <p>内容一</p> }, ...];
<Collapse
  items={items}
  activeKey={() => activeKey.value}
  onChange={(keys) => (activeKey.value = keys)}
/>`;

const exampleControlled = `<Collapse
  items={items}
  activeKey={() => activeKey.value}
  onChange={(keys) => (activeKey.value = keys)}
/>`;

const exampleAccordion = `<Collapse
  items={items}
  defaultActiveKey={["1"]}
  accordion
  bordered={false}
/>`;

const exampleShowArrowSize = `<Collapse
  items={items}
  defaultActiveKey={[]}
  showArrow={false}
/>
<Collapse
  items={items}
  defaultActiveKey={["1"]}
  size="sm"
/>`;

/** 受控示例的展开 key：提到模块级，避免页面重跑时 createSignal 被重新执行导致只有第一个面板能切换 */
const activeKeyControlled = signal<string[]>([
  "1",
]);

export default function DataDisplayCollapse() {
  const items = [
    {
      key: "1",
      header: "面板 1",
      children: (
        <p class="text-sm text-slate-600 dark:text-slate-400">
          内容一
        </p>
      ),
    },
    {
      key: "2",
      header: "面板 2",
      children: (
        <p class="text-sm text-slate-600 dark:text-slate-400">
          内容二
        </p>
      ),
    },
    {
      key: "3",
      header: "面板 3",
      children: (
        <p class="text-sm text-slate-600 dark:text-slate-400">
          内容三
        </p>
      ),
    },
  ];

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Collapse 折叠面板</Title>
        <Paragraph class="mt-2">
          折叠面板：items、activeKey、defaultActiveKey、onChange、accordion、bordered、ghost、size、showArrow、expandIcon。
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
          <Title level={3}>受控 + 多开</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            受控时请使用{" "}
            <code class="text-xs">
              activeKey=&#123;() =&gt; sig.value&#125;
            </code>
            （或等价 getter），并在 <code class="text-xs">onChange</code>{" "}
            里写回 signal；组件内已每次从{" "}
            <code class="text-xs">props.activeKey</code>{" "}
            解析，避免闭包快照导致点不开。
          </Paragraph>
          {
            /*
             * Collapse 已在内层用函数子订阅展开态；此处勿再包 `{() => <Collapse/>}`，
             * 以免与 CodeBlock 兄弟重排（同 Segmented/Table 文档约定）。
             */
          }
          <Collapse
            items={items}
            activeKey={() => activeKeyControlled.value}
            onChange={(keys) => (activeKeyControlled.value = keys)}
          />
          <CodeBlock
            title="代码示例"
            code={exampleControlled}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>accordion + bordered=false</Title>
          <Collapse
            items={items}
            defaultActiveKey={["1"]}
            accordion
            bordered={false}
          />
          <CodeBlock
            title="代码示例"
            code={exampleAccordion}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>showArrow=false / size=sm</Title>
          <Collapse items={items} defaultActiveKey={[]} showArrow={false} />
          <Collapse items={items} defaultActiveKey={["1"]} size="sm" />
          <CodeBlock
            title="代码示例"
            code={exampleShowArrowSize}
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
          CollapseItem：key、header、children、disabled、showArrow。Collapse
          属性如下。
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
              {COLLAPSE_API.map((row) => (
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
