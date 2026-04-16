/**
 * @fileoverview 文档站 API 属性表：表头与样式与 `desktop/basic/button` 等页内嵌表格一致，供移动端文档复用。
 */

/** 单行：属性名、类型、默认值、说明 */
export interface DocsApiTableRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/**
 * 渲染四列表格（属性 / 类型 / 默认值 / 说明）。
 *
 * @param props.rows - 行数据
 */
export function DocsApiTable(props: { rows: readonly DocsApiTableRow[] }) {
  const { rows } = props;
  return (
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
          {rows.map((row) => (
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
  );
}
