/**
 * Card 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/data-display/card
 */

import { Button, Card, CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const CARD_API: ApiRow[] = [
  {
    name: "title",
    type: "string | unknown",
    default: "-",
    description: "卡片标题",
  },
  {
    name: "extra",
    type: "unknown",
    default: "-",
    description: "标题右侧额外区域",
  },
  { name: "cover", type: "unknown", default: "-", description: "封面（顶部）" },
  { name: "children", type: "unknown", default: "-", description: "卡片内容" },
  { name: "footer", type: "unknown", default: "-", description: "底部区域" },
  {
    name: "actions",
    type: "unknown[]",
    default: "-",
    description: "底部操作组",
  },
  {
    name: "bordered",
    type: "boolean",
    default: "true",
    description: "是否带边框",
  },
  {
    name: "hoverable",
    type: "boolean",
    default: "false",
    description: "悬浮阴影效果",
  },
  {
    name: "onClick",
    type: "(e: Event) => void",
    default: "-",
    description: "点击回调",
  },
  { name: "size", type: "SizeVariant", default: "-", description: "尺寸" },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: "加载态（骨架）",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
];

const importCode = `import { Button, Card } from "@dreamer/ui-preact";

<Card
  title="卡片标题"
  extra={<Button variant="ghost" size="xs">更多</Button>}
>
  <p>卡片内容</p>
</Card>`;

const exampleTitleExtra = `<Card
  title="卡片标题"
  extra={<Button variant="ghost" size="xs">更多</Button>}
>
  <p>卡片内容区域。</p>
</Card>`;

const _exampleFooterHoverable = `<Card
  title="带底部"
  footer={<span>底部信息</span>}
>
  ...
</Card>
<Card hoverable title="悬浮效果">...</Card>`;

const exampleLoadingBorderedSize = `<Card loading title="加载中">...</Card>
<Card
  title="无边框"
  bordered={false}
>
  ...
</Card>
<Card title="尺寸" size="sm">...</Card>`;

export default function DataDisplayCard() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Card 卡片</Title>
        <Paragraph class="mt-2">
          卡片：title、extra、cover、footer、actions、bordered、hoverable、loading、size、onClick。
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
          <Title level={3}>title + extra</Title>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <Card
              title="卡片标题"
              extra={
                <Button type="button" variant="ghost" size="xs">更多</Button>
              }
            >
              <p class="text-sm text-slate-600 dark:text-slate-400">
                卡片内容区域。
              </p>
            </Card>
            <Card
              title="带底部"
              footer={<span class="text-xs text-slate-500">底部信息</span>}
            >
              <p class="text-sm text-slate-600 dark:text-slate-400">内容。</p>
            </Card>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleTitleExtra}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>hoverable / loading / bordered / size</Title>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <Card hoverable title="悬浮效果">
              <p class="text-sm text-slate-600 dark:text-slate-400">
                hover 时阴影。
              </p>
            </Card>
            <Card loading title="加载中">
              <p>内容被骨架替换</p>
            </Card>
            <Card title="无边框" bordered={false}>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                bordered=false
              </p>
            </Card>
            <Card title="尺寸 size" size="sm">
              <p class="text-sm text-slate-600 dark:text-slate-400">size=sm</p>
            </Card>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleLoadingBorderedSize}
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
              {CARD_API.map((row) => (
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
