/**
 * Pagination 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/navigation/pagination
 */

import { CodeBlock, Pagination, Paragraph, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const PAGINATION_API: ApiRow[] = [
  {
    name: "current",
    type: "number | (() => number)",
    default: "-",
    description: "当前页码（受控）；不传则用 defaultCurrent 且组件内部维护",
  },
  {
    name: "defaultCurrent",
    type: "number",
    default: "1",
    description: "非受控时的默认当前页",
  },
  {
    name: "total",
    type: "number",
    default: "-",
    description: "总条数（与 totalPages 二选一）",
  },
  {
    name: "totalPages",
    type: "number",
    default: "-",
    description: "总页数（与 total 二选一）",
  },
  {
    name: "pageSize",
    type: "number | (() => number)",
    default: "-",
    description: "每页条数（受控）；不传则用 defaultPageSize 且组件内部维护",
  },
  {
    name: "defaultPageSize",
    type: "number",
    default: "10",
    description: "非受控时的默认每页条数",
  },
  {
    name: "pageSizeOptions",
    type: "number[]",
    default: "-",
    description: "每页条数选项（如 [10, 20, 50]）",
  },
  {
    name: "onChange",
    type: "(page, pageSize?) => void",
    default: "-",
    description: "页码/条数变化回调",
  },
  {
    name: "showPrevNext",
    type: "boolean",
    default: "true",
    description: "是否显示上一页/下一页",
  },
  {
    name: "showPageNumbers",
    type: "boolean",
    default: "true",
    description: "是否显示页码",
  },
  {
    name: "showQuickJumper",
    type: "boolean",
    default: "false",
    description: "是否显示快速跳转",
  },
  {
    name: "showTotal",
    type: "boolean | ((total, range) => unknown)",
    default: "-",
    description: "是否显示总条数/范围",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "是否禁用",
  },
  {
    name: "syncUrl",
    type: "boolean",
    default: "false",
    description:
      "为 true 时，页码/每页条数变化会写入 URL（?page=1&pageSize=10），不刷新页面",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
];

const importCode = `import { Pagination } from "@dreamer/ui-preact";

<Pagination
  defaultCurrent={1}
  defaultPageSize={10}
  total={120}
  onChange={() => {}}
  showPrevNext
  showTotal
/>`;

const exampleFull = `<Pagination
  defaultCurrent={1}
  defaultPageSize={10}
  total={120}
  pageSizeOptions={[10, 20, 50]}
  onChange={handleChange}
  showPrevNext
  showTotal
  showQuickJumper
/>`;

const exampleTotalPages = `<Pagination
  defaultCurrent={1}
  totalPages={5}
  onChange={() => {}}
  showPrevNext
/>`;

const exampleMinimal = `<Pagination
  defaultCurrent={1}
  total={120}
  defaultPageSize={10}
  onChange={() => {}}
  showPrevNext
  showPageNumbers={false}
  showTotal
/>`;

const exampleDisabled = `<Pagination
  defaultCurrent={2}
  total={50}
  defaultPageSize={10}
  onChange={() => {}}
  disabled
/>`;

const exampleSyncUrl = `<Pagination
  defaultCurrent={initial.page}
  defaultPageSize={initial.pageSize}
  total={120}
  pageSizeOptions={[10, 20, 50]}
  onChange={handleChange}
  showPrevNext
  showTotal
  showQuickJumper
  syncUrl
/>`;

/** 从当前 URL 读取 page / pageSize（用于 syncUrl 场景的初始值） */
function getPageFromUrl(): { page: number; pageSize: number } {
  if (typeof globalThis.location === "undefined") {
    return { page: 1, pageSize: 10 };
  }
  const u = new URL(globalThis.location.href);
  const page = Math.max(
    1,
    parseInt(u.searchParams.get("page") ?? "1", 10) || 1,
  );
  const pageSize = Math.max(
    1,
    parseInt(u.searchParams.get("pageSize") ?? "10", 10) || 10,
  );
  return { page, pageSize };
}

export default function NavigationPagination() {
  const initial = getPageFromUrl();

  const handleChange = (_p: number, _ps?: number) => {
    // 可选：根据业务处理页码/每页条数变化
  };

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Pagination 分页</Title>
        <Paragraph class="mt-2">
          分页：current、total、totalPages、pageSize、pageSizeOptions、onChange、showPrevNext、showPageNumbers、showQuickJumper、showTotal、disabled、syncUrl、class。
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
          <Title level={3}>
            完整（total + pageSizeOptions + showTotal + showQuickJumper）
          </Title>
          <Pagination
            defaultCurrent={1}
            defaultPageSize={10}
            total={120}
            pageSizeOptions={[10, 20, 50]}
            onChange={handleChange}
            showPrevNext
            showTotal
            showQuickJumper
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

        <div class="space-y-4">
          <Title level={3}>totalPages 直接指定总页数</Title>
          <Pagination
            defaultCurrent={1}
            totalPages={5}
            onChange={() => {}}
            showPrevNext
          />
          <CodeBlock
            title="代码示例"
            code={exampleTotalPages}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>极简模式（showPageNumbers=false）</Title>
          <Pagination
            defaultCurrent={1}
            total={120}
            defaultPageSize={10}
            onChange={() => {}}
            showPrevNext
            showPageNumbers={false}
            showTotal
          />
          <CodeBlock
            title="代码示例"
            code={exampleMinimal}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>disabled</Title>
          <Pagination
            current={2}
            total={50}
            pageSize={10}
            onChange={() => {}}
            disabled
          />
          <CodeBlock
            title="代码示例"
            code={exampleDisabled}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>syncUrl（与 URL ?page=1&pageSize=10 同步）</Title>
          <Pagination
            defaultCurrent={initial.page}
            defaultPageSize={initial.pageSize}
            total={120}
            pageSizeOptions={[10, 20, 50]}
            onChange={handleChange}
            showPrevNext
            showTotal
            showQuickJumper
            syncUrl
          />
          <CodeBlock
            title="代码示例"
            code={exampleSyncUrl}
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
              {PAGINATION_API.map((row) => (
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
