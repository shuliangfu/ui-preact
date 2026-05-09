/**
 * @fileoverview 文档站「文案 messages」独立区块：与 API 属性表分开，单独一张表。
 */

import { Paragraph, Title } from "@dreamer/ui-preact";
import { DocsApiTable, type DocsApiTableRow } from "./DocsApiTable.tsx";

/**
 * 在 API 章节之上渲染「文案（messages）」+ 独立表格。
 *
 * @param props.interfaceName - TS 接口名
 * @param props.defaultExportName - 默认文案导出名
 * @param props.rows - messages 字段逐行说明
 */
export function DocsMessagesSection(props: {
  interfaceName: string;
  defaultExportName: string;
  rows: readonly DocsApiTableRow[];
}) {
  const { interfaceName, defaultExportName, rows } = props;
  return (
    <section class="space-y-3">
      <Title level={2}>文案（messages）</Title>
      <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
        通过{" "}
        <code class="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs dark:bg-slate-800">
          messages
        </code>{" "}
        传入{" "}
        <code class="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs dark:bg-slate-800">
          Partial&lt;{interfaceName}&gt;
        </code>
        ；未覆盖字段使用{" "}
        <code class="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs dark:bg-slate-800">
          {defaultExportName}
        </code>
        。嵌套对象一般为<strong>一层浅合并</strong>。下表<strong>
          仅列文案字段
        </strong>，与下方 API 表分开。
      </Paragraph>
      <DocsApiTable rows={rows} nameColumnHeader="字段" />
    </section>
  );
}
