/**
 * PageHeader 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/navigation/page-header
 */

import {
  Button,
  CodeBlock,
  PageHeader,
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

const PAGE_HEADER_API: ApiRow[] = [
  {
    name: "title",
    type: "string | unknown",
    default: "-",
    description: "主标题",
  },
  {
    name: "subTitle",
    type: "string | unknown",
    default: "-",
    description: "副标题",
  },
  {
    name: "onBack",
    type: "() => void",
    default: "-",
    description: "返回按钮回调；不传则不显示返回",
  },
  {
    name: "breadcrumb",
    type: "{ items: BreadcrumbItem[] }",
    default: "-",
    description: "面包屑项",
  },
  { name: "extra", type: "unknown", default: "-", description: "右侧额外区域" },
  { name: "footer", type: "unknown", default: "-", description: "底部区域" },
  { name: "class", type: "string", default: "-", description: "额外 class" },
];

const importCode = `import { Button, PageHeader } from "@dreamer/ui-preact";

<PageHeader
  title="页面标题"
  subTitle="副标题说明"
  onBack={() => history.back()}
  breadcrumb={{ items: [{ label: "首页", href: "#" }, { label: "当前页" }] }}
  extra={<Button variant="primary">操作</Button>}
  footer={<p>底部说明</p>}
/>`;

const exampleFull = `<PageHeader
  title="页面标题"
  subTitle="副标题说明"
  onBack={() => globalThis.history?.back?.()}
  breadcrumb={{ items: [{ label: "首页", href: "#" }, { label: "当前页" }] }}
  extra={<Button variant="primary">操作</Button>}
  footer={<p class="text-sm text-slate-500">底部说明文字</p>}
/>`;

export default function NavigationPageHeader() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>PageHeader 页头</Title>
        <Paragraph class="mt-2">
          页头：title、subTitle、onBack、breadcrumb、extra、footer、class。 使用
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
          <Title level={3}>完整用法</Title>
          <PageHeader
            title="页面标题"
            subTitle="副标题说明"
            onBack={() => globalThis.history?.back?.()}
            breadcrumb={{
              items: [
                { label: "首页", href: "#" },
                { label: "当前页" },
              ],
            }}
            extra={<Button type="button" variant="primary">操作</Button>}
            footer={<p class="text-sm text-slate-500">底部说明文字</p>}
          />
          <CodeBlock
            title="代码示例"
            code={exampleFull}
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
              {PAGE_HEADER_API.map((row) => (
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
