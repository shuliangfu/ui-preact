/**
 * Grid / GridItem 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/layout/grid
 */

import {
  CodeBlock,
  Grid,
  GridItem,
  Paragraph,
  Title,
} from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const GRID_API: ApiRow[] = [
  { name: "cols", type: "6 | 12 | 24", default: "12", description: "列数" },
  {
    name: "gap",
    type: "number | string",
    default: "4",
    description: "间距（Tailwind gap）",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "网格容器 class",
  },
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "子节点（通常为 GridItem）",
  },
];

const GRID_ITEM_API: ApiRow[] = [
  {
    name: "span",
    type: "number",
    default: "1",
    description: "占据列数（1 到 cols）",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
  {
    name: "className",
    type: "string",
    default: "-",
    description: "同上（React 风格）",
  },
  { name: "children", type: "unknown", default: "-", description: "子节点" },
];

const importCode = `import { Grid, GridItem } from "@dreamer/ui-preact";

<Grid
  cols={12}
  gap={4}
>
  <GridItem span={6}>占 6 列</GridItem>
  <GridItem span={6}>占 6 列</GridItem>
</Grid>`;

const exampleCols12 = `<Grid
  cols={12}
  gap={4}
  class="max-w-2xl"
>
  <GridItem span={6}>span 6</GridItem>
  <GridItem span={6}>span 6</GridItem>
  <GridItem span={4}>span 4</GridItem>
  <GridItem span={4}>span 4</GridItem>
  <GridItem span={4}>span 4</GridItem>
</Grid>`;

const exampleCols24 = `<Grid
  cols={24}
  gap={2}
  class="max-w-2xl"
>
  <GridItem span={12}>span 12</GridItem>
  <GridItem span={12}>span 12</GridItem>
  <GridItem span={8}>span 8</GridItem>
  <GridItem span={16}>span 16</GridItem>
</Grid>`;

export default function LayoutGrid() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Grid 栅格</Title>
        <Paragraph class="mt-2">
          栅格：Grid 支持 cols（6/12/24）、gap、class、children；GridItem 支持
          span、class、className、children。 使用 Tailwind v4，支持 light/dark
          主题。
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
          <Title level={3}>cols=12</Title>
          <Grid cols={12} gap={4} class="max-w-2xl">
            <GridItem span={6}>
              <div class="rounded bg-slate-200 dark:bg-slate-600 p-3 text-sm">
                span 6
              </div>
            </GridItem>
            <GridItem span={6}>
              <div class="rounded bg-slate-200 dark:bg-slate-600 p-3 text-sm">
                span 6
              </div>
            </GridItem>
            <GridItem span={4}>
              <div class="rounded bg-slate-200 dark:bg-slate-600 p-3 text-sm">
                span 4
              </div>
            </GridItem>
            <GridItem span={4}>
              <div class="rounded bg-slate-200 dark:bg-slate-600 p-3 text-sm">
                span 4
              </div>
            </GridItem>
            <GridItem span={4}>
              <div class="rounded bg-slate-200 dark:bg-slate-600 p-3 text-sm">
                span 4
              </div>
            </GridItem>
          </Grid>
          <CodeBlock
            title="代码示例"
            code={exampleCols12}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>cols=24</Title>
          <Grid cols={24} gap={2} class="max-w-2xl">
            <GridItem span={12}>
              <div class="rounded bg-slate-200 dark:bg-slate-600 p-3 text-sm">
                span 12
              </div>
            </GridItem>
            <GridItem span={12}>
              <div class="rounded bg-slate-200 dark:bg-slate-600 p-3 text-sm">
                span 12
              </div>
            </GridItem>
            <GridItem span={8}>
              <div class="rounded bg-slate-200 dark:bg-slate-600 p-3 text-sm">
                span 8
              </div>
            </GridItem>
            <GridItem span={16}>
              <div class="rounded bg-slate-200 dark:bg-slate-600 p-3 text-sm">
                span 16
              </div>
            </GridItem>
          </Grid>
          <CodeBlock
            title="代码示例"
            code={exampleCols24}
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
          Grid 与 GridItem 属性如下。
        </Paragraph>
        <Paragraph class="text-sm font-medium text-slate-700 dark:text-slate-300">
          Grid
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
              {GRID_API.map((row) => (
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
          GridItem
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
              {GRID_ITEM_API.map((row) => (
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
