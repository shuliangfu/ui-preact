/**
 * Descriptions 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/data-display/descriptions
 */

import { CodeBlock, Descriptions, Paragraph, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const DESCRIPTIONS_API: ApiRow[] = [
  {
    name: "items",
    type: "DescriptionsItem[]",
    default: "-",
    description:
      "描述项（label、children、span）；`span` 为跨列数，若本行末尾仍剩空列会自动并入该行最右项铺满，不留空白格",
  },
  {
    name: "title",
    type: "string | unknown",
    default: "-",
    description: "标题",
  },
  {
    name: "column",
    type: "number",
    default: "3",
    description:
      "栅格列数：每行排几个描述项；要「整行一组 label+内容」用 1，要一行并排多组用 2/3",
  },
  {
    name: "bordered",
    type: "boolean",
    default: "false",
    description: "是否带边框",
  },
  { name: "size", type: "SizeVariant", default: "-", description: "尺寸" },
  {
    name: "layout",
    type: "horizontal | vertical",
    default: "-",
    description: "布局",
  },
  {
    name: "colon",
    type: "boolean",
    default: "true",
    description: "标签后是否显示冒号",
  },
  {
    name: "labelColPercent",
    type: "number",
    default: "38",
    description:
      "仅横向：标签列占「单列栅格槽位」宽度的百分比（12～85）；项 span>1 时自动换算，与只占一槽时首列竖线对齐；与 labelMinWidth 组成 minmax",
  },
  {
    name: "labelMinWidth",
    type: "string | number",
    default: '"13.5rem"',
    description:
      "仅横向：标签列最小宽度（CSS 长度或像素数字）；适当增大可减少长标签换行",
  },
  {
    name: "labelClass",
    type: "string",
    default: "-",
    description: "标签列 class",
  },
  {
    name: "contentClass",
    type: "string",
    default: "-",
    description: "内容列 class",
  },
  { name: "class", type: "string", default: "-", description: "容器 class" },
];

const importCode = `import { Descriptions } from "@dreamer/ui-preact";

const items = [{ label: "姓名", children: "张三" }, { label: "年龄", children: "28" }, ...];
<Descriptions
  title="用户信息"
  items={items}
  column={3}
  bordered
/>`;

/** 每行仅一组：左标签、右内容 → API 里用 column={1}（label 长短不一示例） */
const exampleLabelValueOnePerRow = `<Descriptions
  title="用户信息"
  items={[
    { label: "ID", children: "U-1024-8573" },
    { label: "状态", children: "正常 · 已实名认证 · 企业账户" },
    {
      label: "注册地详细通信地址（含省市区）",
      children: "上海市浦东新区张江高科园区科苑路 88 号某大厦 12 层 1208 室（邮编 201203）",
    },
    {
      label: "紧急联系人手机号码（异地）",
      children: "+86 138 **** 9210（工作日 9:00–18:00 可接通）",
    },
    {
      label: "最近一次登录时间",
      children: "2026-03-28 14:32:07（UTC+8）· IP 203.0.113.42 · Chrome 124 / Windows 11",
    },
    {
      label: "备注与内部说明",
      children:
        "长文案示例：可含多句说明、编号列表意图、以及「引号」与 URL https://example.com/path?x=1 等混排；右侧与左侧标签列独立换行。",
    },
  ]}
  column={1}
  labelColPercent={42}
  labelMinWidth="15rem"
  bordered
/>`;

/** 每行并排两组描述项 → column={2}（label 长短混排） */
const exampleTwoItemsPerRow = `<Descriptions
  title="用户信息"
  items={[
    { label: "工号", children: "E-00912" },
    { label: "入职日期", children: "2024-06-01" },
    { label: "直属上级（含虚线汇报）", children: "李四 / 王五（虚线）" },
    { label: "城市", children: "杭州" },
    {
      label: "备注",
      children: "column=2 时一行两组；本行 span:2 占满整行，可写较长说明。",
      span: 2,
    },
  ]}
  column={2}
  bordered
/>`;

const exampleBordered = `<Descriptions
  title="用户信息"
  items={items}
  column={3}
  bordered
/>`;

const exampleLayout = `<Descriptions
  items={items.slice(0, 3)}
  layout="vertical"
/>`;

const exampleSizeColon = `<Descriptions
  items={items}
  size="sm"
  title="小尺寸"
/>
<Descriptions
  items={items}
  colon={false}
  title="无冒号"
/>`;

export default function DataDisplayDescriptions() {
  /** column=1：每行一组；label 故意长短不一，内容偏复杂 */
  const itemsOneCol = [
    { label: "ID", children: "U-1024-8573" },
    { label: "状态", children: "正常 · 已实名认证 · 企业账户" },
    {
      label: "注册地详细通信地址（含省市区）",
      children:
        "上海市浦东新区张江高科园区科苑路 88 号某大厦 12 层 1208 室（邮编 201203）",
    },
    {
      label: "紧急联系人手机号码（异地）",
      children: "+86 138 **** 9210（工作日 9:00–18:00 可接通）",
    },
    {
      label: "最近一次登录时间",
      children:
        "2026-03-28 14:32:07（UTC+8）· IP 203.0.113.42 · Chrome 124 / Windows 11",
    },
    {
      label: "备注与内部说明",
      children:
        "长文案示例：可含多句说明、编号列表意图、以及「引号」与 URL https://example.com/path?x=1 等混排；右侧与左侧标签列独立换行。",
    },
  ];

  /** column=2：每行两个描述项并排，label 长短混排 */
  const itemsTwoCol = [
    { label: "工号", children: "E-00912" },
    { label: "入职日期", children: "2024-06-01" },
    {
      label: "直属上级（含虚线汇报）",
      children: "李四 / 王五（虚线）",
    },
    { label: "城市", children: "杭州" },
    {
      label: "备注",
      children: "column=2 时一行两组；本行 span:2 占满整行，可写较长说明。",
      span: 2,
    },
  ];

  const items = [
    { label: "编码", children: "SKU-9281" },
    {
      label: "商品全称（含规格）",
      children: "无线降噪耳机 · 黑色 · USB-C 快充盒",
    },
    { label: "单价", children: "¥ 1,299.00（含税）" },
    {
      label: "说明",
      children:
        "三列栅格示例：短 label / 长 label / 数值混排；本项写 span=2，行尾空出一列会自动并入本项铺满整行。",
      span: 2,
    },
  ];

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Descriptions 描述列表</Title>
        <Paragraph class="mt-2">
          描述列表：items、title、column、bordered、size、layout、colon、labelColPercent、labelMinWidth、labelClass、contentClass。
          使用 Tailwind v4，支持 light/dark 主题。`column` 表示<strong>
            每行排几个描述项
          </strong>，不是「标签列数 + 内容列数」：要整行只展示一组 label +
          数据请用 `column={1}`。
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
          <Title level={3}>标签一列、内容一列（每行一组 → column=1）</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            每个描述项内部已是横向：左侧标签、右侧内容。若希望<strong>
              每一整行只出现一组
            </strong>键值（而不是一行里并排多组），请传
            `column={1}`。横向时左侧标签列由 `labelColPercent`（相对<strong>
              单列槽位
            </strong>宽度的占比）与 `labelMinWidth`（最小宽度）共同决定，
            <strong>
              右对齐
            </strong>，各行竖线齐、冒号易对齐；可适当加大最小宽度减少长标签换行，右侧内容左对齐并支持长文案。
          </Paragraph>
          <Descriptions
            title="用户信息"
            items={itemsOneCol}
            column={1}
            labelColPercent={30}
            labelMinWidth="15rem"
            bordered
          />
          <CodeBlock
            title="代码示例"
            code={exampleLabelValueOnePerRow}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>每行两组并排（column=2）</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            `column={2}` 表示栅格里<strong>
              每行放两个描述项
            </strong>，因此会看到「姓名+年龄」同一行、「城市+部门」同一行；与上面「每行一组」不同。
            若某行使用 `span` 占满整行，标签列仍与上方<strong>
              首列槽位
            </strong>对齐，不会出现整行项标签区突然变宽。
          </Paragraph>
          <Descriptions
            title="用户信息"
            items={itemsTwoCol}
            column={2}
            bordered
          />
          <CodeBlock
            title="代码示例"
            code={exampleTwoItemsPerRow}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>标题 + 列数 + 边框</Title>
          <Descriptions title="用户信息" items={items} column={3} bordered />
          <CodeBlock
            title="代码示例"
            code={exampleBordered}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>layout=vertical</Title>
          <Descriptions items={items.slice(0, 3)} layout="vertical" />
          <CodeBlock
            title="代码示例"
            code={exampleLayout}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>size=sm / colon=false</Title>
          <Descriptions items={items.slice(0, 3)} size="sm" title="小尺寸" />
          <Descriptions
            items={items.slice(0, 2)}
            colon={false}
            title="无冒号"
          />
          <CodeBlock
            title="代码示例"
            code={exampleSizeColon}
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
          DescriptionsItem：label、children、span。Descriptions 属性如下。
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
              {DESCRIPTIONS_API.map((row) => (
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
