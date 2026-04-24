/**
 * Table 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/data-display/table
 */

import {
  Button,
  ButtonGroup,
  CodeBlock,
  Paragraph,
  Table,
  type TableColumn,
  Title,
} from "@dreamer/ui-preact";
import { useSignal } from "@preact/signals";

type Row = { key: string; name: string; age: number; address: string };

/** API 属性行类型（extends Record 以满足 Table 泛型约束） */
interface ApiRow extends Record<string, unknown> {
  name: string;
  type: string;
  default: string;
  description: string;
}

const TABLE_API: ApiRow[] = [
  {
    name: "columns",
    type: "TableColumn<T>[]",
    default: "-",
    description:
      "列定义；列可设 editable（双击进入编辑；text/InputNumber 数字/email/url/tel/date/time/select/checkbox/radio），与 render 互斥",
  },
  { name: "dataSource", type: "T[]", default: "-", description: "数据源" },
  {
    name: "rowKey",
    type: "keyof T | string | ((record, index) => string)",
    default: "-",
    description: "行 key 字段或函数",
  },
  {
    name: "bordered",
    type: "boolean",
    default: "false",
    description: "是否显示边框",
  },
  { name: "size", type: "SizeVariant", default: "-", description: "尺寸" },
  {
    name: "striped",
    type: "boolean",
    default: "false",
    description: "是否条纹行",
  },
  { name: "loading", type: "boolean", default: "false", description: "加载态" },
  {
    name: "onRow",
    type: "(record, index) => { onClick? }",
    default: "-",
    description: "行点击",
  },
  {
    name: "expandable",
    type: "object",
    default: "-",
    description: "可展开行配置",
  },
  {
    name: "summary",
    type: "(data) => unknown",
    default: "-",
    description: "表尾合计行",
  },
  {
    name: "locale",
    type: "{ emptyText?: string }",
    default: "-",
    description: "文案配置，如空状态文案 emptyText",
  },
  {
    name: "renderEmpty",
    type: "() => unknown",
    default: "-",
    description:
      "自定义空状态渲染（无数据时）；不传则用 locale.emptyText 或「暂无数据」",
  },
  {
    name: "title",
    type: "unknown",
    default: "-",
    description: "表格上方标题",
  },
  {
    name: "extra",
    type: "unknown",
    default: "-",
    description: "表格上方右侧区域（筛选、导出等）",
  },
  {
    name: "pagination",
    type: "false | { current?, pageSize?, total?, onChange? }",
    default: "-",
    description:
      "分页配置；false 不显示；对象时显示分页条并支持 current/pageSize/total/onChange",
  },
  {
    name: "onSelectChange",
    type: "(selectedRows: T[]) => void",
    default: "-",
    description: "选中变化时回调选中的整行数据；传了则显示选择列",
  },
  {
    name: "selectedRowKeys",
    type: "string[]",
    default: "-",
    description: "受控时的选中行 key 列表",
  },
  {
    name: "selectionType",
    type: '"checkbox" | "radio"',
    default: "checkbox",
    description: "选择列类型",
  },
  {
    name: "getCheckboxProps",
    type: "(record: T) => { disabled?: boolean }",
    default: "-",
    description: "某行是否禁用勾选",
  },
  {
    name: "rowClassName",
    type: "(record, index) => string",
    default: "-",
    description: "行 class",
  },
  {
    name: "hoverable",
    type: "boolean",
    default: "false",
    description: "是否开启行悬停高亮",
  },
  {
    name: "headerClass",
    type: "string",
    default: "-",
    description: "表头 class",
  },
  { name: "class", type: "string", default: "-", description: "表格 class" },
  {
    name: "onCellChange",
    type: "(payload: TableCellChangePayload<T>) => void",
    default: "-",
    description:
      "可编辑列变更（双击单元格进入编辑、失焦退出）；父组件受控更新 dataSource。不传则不可进入编辑",
  },
];

/** TableColumn 列级 API 文档行 */
const TABLE_COLUMN_API: ApiRow[] = [
  { name: "key", type: "string", default: "-", description: "列 key" },
  { name: "title", type: "unknown", default: "-", description: "列标题" },
  {
    name: "dataIndex",
    type: "keyof T | string",
    default: "key",
    description: "数据字段",
  },
  {
    name: "render",
    type: "function",
    default: "-",
    description: "单元格自定义渲染",
  },
  {
    name: "align",
    type: '"left" | "center" | "right"',
    default: "left",
    description: "单元格（td）水平对齐",
  },
  {
    name: "headerAlign",
    type: '"left" | "center" | "right"',
    default: "同 align 或 left",
    description:
      '表头（th）标题对齐；可单独与 `align` 不同，例如表头居中而金额列 `align: "right"`',
  },
  { name: "width", type: "number | string", default: "-", description: "列宽" },
  { name: "fixed", type: '"left"', default: "-", description: "左固定列" },
  {
    name: "sorter",
    type: "boolean | 比较函数",
    default: "-",
    description: "可排序",
  },
  { name: "ellipsis", type: "boolean", default: "-", description: "过长收缩" },
  {
    name: "editable",
    type: "TableColumnEditable",
    default: "-",
    description: "可编辑列配置，与 render 二选一",
  },
];

/** API 表格列定义（属性、类型、默认值、说明） */
const apiColumns = [
  {
    key: "name",
    title: "属性",
    dataIndex: "name" as const,
    render: (_: unknown, r: ApiRow) => (
      <span class="font-mono text-slate-700 dark:text-slate-300">{r.name}</span>
    ),
  },
  {
    key: "type",
    title: "类型",
    dataIndex: "type" as const,
    render: (_: unknown, r: ApiRow) => (
      <span class="text-slate-600 dark:text-slate-400">{r.type}</span>
    ),
  },
  {
    key: "default",
    title: "默认值",
    dataIndex: "default" as const,
    render: (_: unknown, r: ApiRow) => (
      <span class="text-slate-600 dark:text-slate-400">{r.default}</span>
    ),
  },
  {
    key: "description",
    title: "说明",
    dataIndex: "description" as const,
    render: (_: unknown, r: ApiRow) => (
      <span class="text-slate-600 dark:text-slate-400">{r.description}</span>
    ),
  },
];

const importCode = `import { Table } from "@dreamer/ui-preact";

const columns = [{ key: "name", title: "姓名", dataIndex: "name" }, ...];
const dataSource = [{ key: "1", name: "张三", age: 28 }, ...];
<Table
  columns={columns}
  dataSource={dataSource}
  bordered
/>`;

/**
 * 展开行示例代码字符串：首行勿写 `<Table<Row>`，否则 Prism TSX 会把 `Table` 后的 `<` 误判为嵌套标签，高亮失败整段发白。
 * 泛型在注释里说明即可，与页面 `type Row` 一致。
 */
const exampleBasic = `// Table<Row>，Row 见上文 type 定义
<Table
  columns={columns}
  dataSource={dataSource}
  bordered
  expandable={{
    expandedRowKeys,
    onExpand,
    expandedRowRender: (record) => <p>详情：{record.address}</p>,
  }}
/>`;

const exampleSizeStripedLoading = `<Table
  columns={columns}
  dataSource={dataSource}
  size="sm"
  striped
/>
<Table columns={columns} dataSource={[]} loading />`;

const exampleRowSelection = `<Table
  columns={columns}
  dataSource={dataSource}
  onSelectChange={(rows) => selectedRows.value = rows}
/>`;

const exampleEmpty = `<Table
  columns={columns}
  dataSource={[]}
  locale={{ emptyText: "暂无数据" }}
/>
<Table columns={columns} dataSource={[]} renderEmpty={() => <span>自定义空状态</span>} />`;

const exampleTitleExtra = `<Table
  columns={columns}
  dataSource={dataSource}
  title="用户列表"
  extra={
    <ButtonGroup>
      <Button variant="default" size="sm" onClick={() => refresh()}>刷新</Button>
      <Button variant="primary" size="sm" onClick={() => exportData()}>导出</Button>
    </ButtonGroup>
  }
/>`;

const examplePagination = `<Table
  columns={columns}
  dataSource={dataSource}
  pagination={{ pageSize: 5, onChange: (page) => console.log(page) }}
/>`;

const exampleFixedColumn = `<Table
  columns={[
    { key: "name", title: "姓名", dataIndex: "name", width: 100, fixed: "left" },
    { key: "age", title: "年龄", dataIndex: "age" },
    { key: "address", title: "地址", dataIndex: "address" },
  ]}
  dataSource={dataSource}
/>`;

/** 可编辑示例行：覆盖全部 editable 类型（无 textarea） */
type EditableDocRow = {
  key: string;
  name: string;
  age: number;
  email: string;
  website: string;
  phone: string;
  birth: string;
  workStart: string;
  city: string;
  active: boolean;
  level: string;
};

const exampleEditable = `import type { TableColumn } from "@dreamer/ui-preact";
import { useSignal } from "@preact/signals";
import { Table } from "@dreamer/ui-preact";

type EditableRow = {
  key: string;
  name: string;
  age: number;
  email: string;
  website: string;
  phone: string;
  birth: string;
  workStart: string;
  city: string;
  active: boolean;
  level: string;
};

const editableColumns: TableColumn<EditableRow>[] = [
  { key: "name", title: "文本 text", dataIndex: "name", editable: { type: "text", placeholder: "姓名" } },
  { key: "age", title: "数字 number", dataIndex: "age", editable: { type: "number", min: 0, max: 150, step: 1 } },
  { key: "email", title: "email", dataIndex: "email", editable: { type: "email", placeholder: "a@b.c" } },
  { key: "website", title: "url", dataIndex: "website", editable: { type: "url", placeholder: "https://" } },
  { key: "phone", title: "tel", dataIndex: "phone", editable: { type: "tel", placeholder: "手机号" } },
  { key: "birth", title: "date", dataIndex: "birth", editable: { type: "date" } },
  { key: "workStart", title: "time", dataIndex: "workStart", editable: { type: "time" } },
  {
    key: "city",
    title: "select",
    dataIndex: "city",
    editable: {
      type: "select",
      placeholder: "请选择",
      options: [
        { label: "北京", value: "北京" },
        { label: "上海", value: "上海" },
        { label: "广州", value: "广州" },
      ],
    },
  },
  { key: "active", title: "checkbox", dataIndex: "active", editable: { type: "checkbox" } },
  {
    key: "level",
    title: "radio",
    dataIndex: "level",
    editable: {
      type: "radio",
      options: [
        { label: "高", value: "高" },
        { label: "中", value: "中" },
        { label: "低", value: "低" },
      ],
    },
  },
];

/** 在函数组件内须用 useSignal 持有行数据；勿每次 render 执行 signal()，否则受控 Table 会每帧回到初值、无法键入。 */
function EditableRowsDemo() {
  const rows = useSignal<EditableRow[]>([
    {
      key: "1",
      name: "张三",
      age: 28,
      email: "zhang@example.com",
      website: "https://example.com",
      phone: "13800138000",
      birth: "1990-01-15",
      workStart: "09:00",
      city: "北京",
      active: true,
      level: "高",
    },
    {
      key: "2",
      name: "李四",
      age: 32,
      email: "li@example.com",
      website: "https://demo.org",
      phone: "13900139000",
      birth: "1992-06-01",
      workStart: "10:30",
      city: "上海",
      active: false,
      level: "中",
    },
  ]);
  return (
    <Table
      bordered
      striped
      size="sm"
      columns={editableColumns}
      dataSource={rows.value}
      onCellChange={({ dataIndex, value, record }) => {
        const rk = record.key;
        rows.value = rows.value.map((row) =>
          row.key === rk ? { ...row, [dataIndex as keyof EditableRow]: value as never } : row,
        );
      }}
    />
  );
}`;

/** 与页面演示一致的列配置（可编辑全类型） */
const editableDocColumns: TableColumn<EditableDocRow>[] = [
  {
    key: "name",
    title: "文本 text",
    dataIndex: "name",
    editable: { type: "text", placeholder: "姓名" },
  },
  {
    key: "age",
    title: "数字 number",
    dataIndex: "age",
    editable: { type: "number", min: 0, max: 150, step: 1 },
  },
  {
    key: "email",
    title: "email",
    dataIndex: "email",
    editable: { type: "email", placeholder: "a@b.c" },
  },
  {
    key: "website",
    title: "url",
    dataIndex: "website",
    editable: { type: "url", placeholder: "https://" },
  },
  {
    key: "phone",
    title: "tel",
    dataIndex: "phone",
    editable: { type: "tel", placeholder: "手机号" },
  },
  {
    key: "birth",
    title: "date",
    dataIndex: "birth",
    editable: { type: "date" },
  },
  {
    key: "workStart",
    title: "time",
    dataIndex: "workStart",
    editable: { type: "time" },
  },
  {
    key: "city",
    title: "select",
    dataIndex: "city",
    editable: {
      type: "select",
      placeholder: "请选择",
      options: [
        { label: "北京", value: "北京" },
        { label: "上海", value: "上海" },
        { label: "广州", value: "广州" },
      ],
    },
  },
  {
    key: "active",
    title: "checkbox",
    dataIndex: "active",
    editable: { type: "checkbox" },
  },
  {
    key: "level",
    title: "radio",
    dataIndex: "level",
    editable: {
      type: "radio",
      options: [
        { label: "高", value: "高" },
        { label: "中", value: "中" },
        { label: "低", value: "低" },
      ],
    },
  },
];

/** 文档示例通用三列（根页 JSX 中勿绑定会频繁变的 signal，否则整页 **函数子响应式插入** 重挂 main 内大块 DOM） */
const DOC_TABLE_BASIC_COLUMNS: TableColumn<Row>[] = [
  { key: "name", title: "姓名", dataIndex: "name" as const },
  { key: "age", title: "年龄", dataIndex: "age" as const },
  { key: "address", title: "地址", dataIndex: "address" as const },
];

const DOC_TABLE_DEMO_ROWS: Row[] = [
  { key: "1", name: "张三", age: 28, address: "北京" },
  { key: "2", name: "李四", age: 32, address: "上海" },
];

const DOC_TABLE_PAGINATION_ROWS: Row[] = [
  ...DOC_TABLE_DEMO_ROWS,
  { key: "3", name: "王五", age: 25, address: "广州" },
  { key: "4", name: "赵六", age: 30, address: "深圳" },
  { key: "5", name: "钱七", age: 22, address: "杭州" },
];

const DOC_TABLE_EDITABLE_INITIAL: EditableDocRow[] = [
  {
    key: "e1",
    name: "张三",
    age: 28,
    email: "zhang@example.com",
    website: "https://example.com",
    phone: "13800138000",
    birth: "1990-01-15",
    workStart: "09:00",
    city: "北京",
    active: true,
    level: "高",
  },
  {
    key: "e2",
    name: "李四",
    age: 32,
    email: "li@example.com",
    website: "https://demo.org",
    phone: "13900139000",
    birth: "1992-06-01",
    workStart: "10:30",
    city: "上海",
    active: false,
    level: "中",
  },
];

/**
 * 分页示例独立子组件：将 `page` signal 关在本组件内，换页时只重渲染本段，避免整页大块重挂。
 *
 * **Preact 文档站勿用 `{() => <Table />}`：** 原生节点子节点若是函数，Preact **不会**调用它，
 * 表格会空白（与 `@dreamer/view` 的 `insert(parent, () => …)` 不同）。在此组件 render 内直接读
 * `page.value`，由 `@preact/signals` 订阅并在换页时重渲染即可。
 *
 * **须 `useSignal`：** 勿在组件函数体内每次 `signal(1)`，否则父级重渲染后页码会回到 1。
 */
function TableDocPaginationDemo() {
  const page = useSignal(1);
  return (
    <div class="contents">
      <Table<Row>
        columns={DOC_TABLE_BASIC_COLUMNS}
        dataSource={DOC_TABLE_PAGINATION_ROWS}
        pagination={{
          current: page.value,
          pageSize: 2,
          onChange: (p) => {
            page.value = p;
          },
        }}
      />
    </div>
  );
}

/**
 * 可编辑示例独立子组件：在此读取 `editableRows.value`，受控更新时仅重渲染本段。
 *
 * **Preact 文档站勿用 `{() => <Table />}`：** 原因同分页示例子组件；应在本组件
 * render 内直接写 `dataSource={editableRows.value}`，由 signals 驱动重渲染。
 *
 * **须 `useSignal`：** 勿在组件函数体内每次 `signal([...])`；否则每次父级重渲染都会新建
 * Signal、数据回到初值，受控单元格表现为无法输入。
 */
function TableDocEditableDemo() {
  const editableRows = useSignal<EditableDocRow[]>(
    DOC_TABLE_EDITABLE_INITIAL,
  );
  return (
    <div class="max-w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-600">
      <Table<EditableDocRow>
        bordered
        striped
        size="sm"
        columns={editableDocColumns}
        dataSource={editableRows.value}
        stateKey="table-doc-editable"
        onCellChange={({ dataIndex, value, record }) => {
          const field = dataIndex as keyof EditableDocRow;
          const rowKey = record.key;
          /** 按行 key 写回，避免排序/分页后 `rowIndex` 与 dataSource 下标不一致导致受控值不更新 */
          editableRows.value = editableRows.value.map((row) =>
            row.key === rowKey ? { ...row, [field]: value as never } : row
          );
        }}
      />
    </div>
  );
}

export default function DataDisplayTable() {
  /** 页面级状态同样须稳定引用，勿每次 render `signal([])` */
  const expandedKeys = useSignal<string[]>([]);
  const selectedRows = useSignal<Row[]>([]);

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Table 表格</Title>
        <Paragraph class="mt-2">
          表格：columns、dataSource、rowKey、bordered、size、striped、loading、onRow、expandable、summary、locale、renderEmpty、title、extra、pagination、onSelectChange、rowClassName、headerClass、固定列、列级
          headerAlign fixed、列级可编辑 editable 与 onCellChange。使用 Tailwind
          v4，支持 light/dark 主题。
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
          <Title level={3}>基础 + 边框 + 展开行</Title>
          <Table<Row>
            columns={DOC_TABLE_BASIC_COLUMNS}
            dataSource={DOC_TABLE_DEMO_ROWS}
            bordered
            stateKey="table-doc-expand"
            expandable={{
              // 不传 expandedRowKeys 时使用 Table 内部展开态；stateKey 避免整树重渲染丢失展开态
              onExpand: (expanded, record) => {
                expandedKeys.value = expanded
                  ? [...expandedKeys.value, record.key]
                  : expandedKeys.value.filter((k) => k !== record.key);
              },
              expandedRowRender: (record) => (
                <p class="text-sm text-slate-500">详情：{record.address}</p>
              ),
            }}
          />
          <CodeBlock
            title="代码示例"
            code={exampleBasic}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>size / striped / loading</Title>
          <Table<Row>
            columns={DOC_TABLE_BASIC_COLUMNS}
            dataSource={DOC_TABLE_DEMO_ROWS}
            size="sm"
            striped
          />
          <Table<Row>
            columns={DOC_TABLE_BASIC_COLUMNS}
            dataSource={[]}
            loading
          />
          <CodeBlock
            title="代码示例"
            code={exampleSizeStripedLoading}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>行选择 onSelectChange</Title>
          <Table<Row>
            columns={DOC_TABLE_BASIC_COLUMNS}
            dataSource={DOC_TABLE_DEMO_ROWS}
            stateKey="table-doc-row-selection"
            onSelectChange={(rows) => selectedRows.value = rows}
          />
          {/* 已选摘要须直接渲染段落；勿用 `{() => <p>…}`，Preact 不会执行函数子。 */}
          <p class="text-sm text-slate-500">
            已选行: {selectedRows.value.length
              ? selectedRows.value.map((r) => r.name).join("、")
              : "-"}
          </p>
          <CodeBlock
            title="代码示例"
            code={exampleRowSelection}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>空状态 locale / renderEmpty</Title>
          <Table<Row>
            columns={DOC_TABLE_BASIC_COLUMNS}
            dataSource={[]}
            locale={{ emptyText: "暂无数据" }}
          />
          <Table<Row>
            columns={DOC_TABLE_BASIC_COLUMNS}
            dataSource={[]}
            renderEmpty={() => <span class="text-slate-500">自定义空状态</span>}
          />
          <CodeBlock
            title="代码示例"
            code={exampleEmpty}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>标题与工具栏 title / extra</Title>
          <Table<Row>
            columns={DOC_TABLE_BASIC_COLUMNS}
            dataSource={DOC_TABLE_DEMO_ROWS}
            title="用户列表"
            extra={
              <ButtonGroup attached>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => console.log("刷新")}
                >
                  刷新
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => console.log("导出")}
                >
                  导出
                </Button>
              </ButtonGroup>
            }
          />
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
          <Title level={3}>分页 pagination</Title>
          <TableDocPaginationDemo />
          <CodeBlock
            title="代码示例"
            code={examplePagination}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>固定列 fixed</Title>
          <div class="max-w-md overflow-x-auto border border-slate-200 dark:border-slate-600 rounded-lg">
            <Table<Row>
              columns={[
                {
                  key: "name",
                  title: "姓名",
                  dataIndex: "name" as const,
                  width: 100,
                  fixed: "left",
                },
                {
                  key: "age",
                  title: "年龄",
                  dataIndex: "age" as const,
                },
                {
                  key: "address",
                  title: "地址",
                  dataIndex: "address" as const,
                  width: 180,
                },
              ]}
              dataSource={DOC_TABLE_DEMO_ROWS}
              bordered
            />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleFixedColumn}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>可编辑列 editable + onCellChange</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            列上设置 <code class="text-xs">editable: {"{ type, ... }"}</code>
            {" "}
            后默认只读展示，<strong>双击</strong>进入编辑；控件<strong>
              失焦
            </strong>时提交当前输入并<strong>
              退回只读表格
            </strong>（不再显示表单控件）。忽略{" "}
            <code class="text-xs">render</code>。须传入{" "}
            <code class="text-xs">onCellChange</code>{" "}
            并不可变更新行数据，否则不可激活编辑。在<strong>
              函数组件
            </strong>内须用 <code class="text-xs">useSignal</code>（或{" "}
            <code class="text-xs">useMemo(() =&gt; signal(…), [])</code>
            ）持有行数组，<strong>禁止</strong>在每次 render 里执行{" "}
            <code class="text-xs">signal([…])</code>
            ，否则每帧都会换一个新 Signal、<code class="text-xs">
              dataSource
            </code>
            回到初值，表现为无法键入。不包含 textarea（长文建议弹层编辑）。radio
            为行内单选组，每行独立一组
            name。若编辑态异常或无法键入，可在控制台执行{" "}
            <code class="text-xs">globalThis.__TABLE_EDIT_DEBUG__ = true</code>
            {" "}
            查看 Table 可编辑格焦点判定日志。
          </Paragraph>
          <TableDocEditableDemo />
          <CodeBlock
            title="完整示例（含全部 editable 类型）"
            code={exampleEditable}
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
          列级类型 <code class="text-xs">TableColumn</code>{" "}
          含：key、title、 dataIndex、render、<strong>align</strong>、
          <strong>headerAlign</strong>
          （表头 th 与单元格可不同对齐，不传则与 align 或左对齐）、
          <strong>editable</strong>
          （
          <code class="text-xs">
            text | number（InputNumber）| email | url | tel | date | time |
            select | checkbox | radio
          </code>
          ，可选 <code class="text-xs">disabled</code>{" "}
          布尔或函数）、width、fixed、sorter、ellipsis。类型导出：
          <code class="text-xs">TableColumnEditable</code>、
          <code class="text-xs">TableCellChangePayload</code>、
          <code class="text-xs">
            TableEditableOption
          </code>。可编辑列默认只读，双击进入编辑。下表为
          <strong>Table</strong> 根级属性，列属性见后表。
        </Paragraph>
        <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-600">
          <Table<ApiRow>
            columns={apiColumns}
            dataSource={TABLE_API}
            rowKey="name"
            bordered
            striped
            hoverable
            size="md"
            class="min-w-lg text-sm"
            headerClass="border-b border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/80"
            rowClassName={() =>
              "border-b border-slate-100 dark:border-slate-700 last:border-b-0"}
          />
        </div>
        <Title class="!mt-8" level={3}>
          TableColumn
        </Title>
        <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-600">
          <Table<ApiRow>
            columns={apiColumns}
            dataSource={TABLE_COLUMN_API}
            rowKey="name"
            bordered
            striped
            hoverable
            size="md"
            class="min-w-lg text-sm"
            headerClass="border-b border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/80"
            rowClassName={() =>
              "border-b border-slate-100 dark:border-slate-700 last:border-b-0"}
          />
        </div>
      </section>
    </div>
  );
}
