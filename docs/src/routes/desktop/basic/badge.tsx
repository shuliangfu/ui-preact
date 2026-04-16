/**
 * Badge 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/basic/badge
 */

import { Badge, CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const BADGE_API: ApiRow[] = [
  {
    name: "variant",
    type: "ColorVariant",
    default: "primary",
    description:
      "语义变体：default、primary、secondary、success、warning、danger、ghost",
  },
  {
    name: "size",
    type: "SizeVariant",
    default: "md",
    description: "尺寸：xs、sm、md、lg",
  },
  {
    name: "count",
    type: "number",
    default: "-",
    description: "显示数字，超过 max 时显示 max+",
  },
  { name: "max", type: "number", default: "99", description: "数字上限" },
  {
    name: "dot",
    type: "boolean",
    default: "false",
    description: "仅圆点不显示数字",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "无 count 时显示的自定义文案（如 New、Hot）",
  },
];

const importCode = `import { Badge } from "@dreamer/ui-preact";

<Badge
  variant="primary"
  count={5}
/>
<Badge variant="danger">Hot</Badge>`;

const exampleVariant = `<Badge variant="default" count={1} />
<Badge variant="primary" count={2} />
<Badge variant="secondary" count={3} />
<Badge variant="success" count={5} />
<Badge variant="warning" count={9} />
<Badge variant="danger" count={99} />
<Badge variant="ghost" count={0} />`;

const exampleCountMax = `<Badge variant="primary" count={10} max={9} />
<Badge variant="danger" count={100} max={99} />`;

const exampleDot = `<Badge variant="primary" dot />
<Badge variant="danger" dot />`;

const exampleSize = `<Badge variant="primary" size="xs" count={1} />
<Badge variant="primary" size="sm" count={2} />
<Badge variant="primary" size="md" count={3} />
<Badge variant="primary" size="lg" count={4} />`;

const exampleChildren = `<Badge variant="primary">New</Badge>
<Badge variant="danger">Hot</Badge>
<Badge variant="success">Pro</Badge>`;

export default function BasicBadge() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Badge 角标 / 徽章</Title>
        <Paragraph class="mt-2">
          数字徽章或圆点角标，支持 variant、size、count、max、dot；无 count
          时可用 children 显示自定义文案（如 New、Hot）。Tailwind v4 +
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
          <Title level={3}>variant 变体</Title>
          <div class="flex flex-wrap gap-3">
            <Badge variant="default" count={1} />
            <Badge variant="primary" count={2} />
            <Badge variant="secondary" count={3} />
            <Badge variant="success" count={5} />
            <Badge variant="warning" count={9} />
            <Badge variant="danger" count={99} />
            <Badge variant="ghost" count={0} />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleVariant}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>count 与 max</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            超过 max 时显示为 max+（如 10 显示 9+）。
          </Paragraph>
          <div class="flex flex-wrap items-center gap-4">
            <Badge variant="primary" count={10} max={9} />
            <Badge variant="danger" count={100} max={99} />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleCountMax}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>dot 圆点</Title>
          <div class="flex flex-wrap gap-4">
            <Badge variant="primary" dot />
            <Badge variant="danger" dot />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleDot}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>size 尺寸</Title>
          <div class="flex flex-wrap items-center gap-4">
            <Badge variant="primary" size="xs" count={1} />
            <Badge variant="primary" size="sm" count={2} />
            <Badge variant="primary" size="md" count={3} />
            <Badge variant="primary" size="lg" count={4} />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleSize}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>children 自定义文案</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            不传 count 时，用 children 作为徽章内显示内容。
          </Paragraph>
          <div class="flex flex-wrap gap-3">
            <Badge variant="primary">New</Badge>
            <Badge variant="danger">Hot</Badge>
            <Badge variant="success">Pro</Badge>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleChildren}
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
          组件接收以下属性（均为可选）。
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
              {BADGE_API.map((row) => (
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
