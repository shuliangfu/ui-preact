/**
 * Tree 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/data-display/tree
 */

import { signal } from "@preact/signals";
import { CodeBlock, Paragraph, Title, Tree } from "@dreamer/ui-preact";
import type { TreeNode } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const TREE_API: ApiRow[] = [
  { name: "treeData", type: "TreeNode[]", default: "-", description: "树数据" },
  {
    name: "expandedKeys",
    type: "string[]",
    default: "-",
    description: "当前展开 key（受控）",
  },
  {
    name: "defaultExpandedKeys",
    type: "string[]",
    default: "-",
    description: "默认展开 key",
  },
  {
    name: "onExpand",
    type: "(expandedKeys: string[]) => void",
    default: "-",
    description: "展开/收起回调",
  },
  {
    name: "selectedKeys",
    type: "string[]",
    default: "-",
    description: "当前选中 key",
  },
  {
    name: "onSelect",
    type: "(keys, info) => void",
    default: "-",
    description: "选中回调",
  },
  {
    name: "checkedKeys",
    type: "string[]",
    default: "-",
    description: "当前勾选 key（checkable 时）",
  },
  {
    name: "onCheck",
    type: "(checkedKeys: string[]) => void",
    default: "-",
    description: "勾选回调",
  },
  {
    name: "checkable",
    type: "boolean",
    default: "false",
    description: "是否显示 checkbox",
  },
  { name: "multiple", type: "boolean", default: "-", description: "是否多选" },
  {
    name: "blockNode",
    type: "boolean",
    default: "false",
    description: "是否块级",
  },
  {
    name: "showLine",
    type: "boolean",
    default: "false",
    description: "是否显示连接线",
  },
  { name: "class", type: "string", default: "-", description: "容器 class" },
];

const importCode = `import { signal } from "@preact/signals";
import { Tree } from "@dreamer/ui-preact";
import type { TreeNode } from "@dreamer/ui-preact";

const expandedKeys = signal<string[]>(["1"]);
const selectedKeys = signal<string[]>([]);
const treeData: TreeNode[] = [{ key: "1", title: "节点 1", children: [...] }, ...];
<Tree
  treeData={treeData}
  expandedKeys={() => expandedKeys.value}
  onExpand={(keys) => expandedKeys.value = keys}
  selectedKeys={() => selectedKeys.value}
  onSelect={(keys) => selectedKeys.value = keys}
/>`;

const exampleCheckable = `<Tree
  treeData={treeData}
  expandedKeys={() => expandedKeys.value}
  onExpand={(keys) => expandedKeys.value = keys}
  selectedKeys={() => selectedKeys.value}
  onSelect={(keys) => selectedKeys.value = keys}
  checkable
  checkedKeys={() => checkedKeys.value}
  onCheck={(keys) => checkedKeys.value = keys}
/>`;

const exampleShowLine = `<Tree
  treeData={treeData}
  expandedKeys={() => expandedKeys.value}
  onExpand={(keys) => expandedKeys.value = keys}
  showLine
/>`;

/** 仅展示已选/已勾选文案，单独读 signal 避免父组件重渲染导致整树闪动 */
function KeysDisplay(props: {
  getSelectedKeys: () => string[];
  getCheckedKeys: () => string[];
}) {
  const { getSelectedKeys, getCheckedKeys } = props;
  return (
    <p class="text-sm text-slate-500">
      已选: {getSelectedKeys().join(", ") || "-"} | 已勾选:{" "}
      {getCheckedKeys().join(", ") || "-"}
    </p>
  );
}

/** 树示例用的展开/选中/勾选 state 提到模块级，避免 state 更新时页面组件重跑导致整树重渲染 */
const expandedKeys = signal<string[]>(["1"]);
const selectedKeys = signal<string[]>([]);
const checkedKeys = signal<string[]>([]);

const treeData: TreeNode[] = [
  {
    key: "1",
    title: "节点 1",
    children: [
      { key: "1-1", title: "节点 1-1" },
      {
        key: "1-2",
        title: "节点 1-2",
        children: [{ key: "1-2-1", title: "节点 1-2-1" }],
      },
    ],
  },
  { key: "2", title: "节点 2" },
];

export default function DataDisplayTree() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Tree 树形</Title>
        <Paragraph class="mt-2">
          树形：treeData、expandedKeys、onExpand、selectedKeys、onSelect、checkedKeys、onCheck、checkable、multiple、blockNode、showLine。
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
          <Title level={3}>展开 / 选中 / 勾选</Title>
          <Tree
            treeData={treeData}
            defaultExpandedKeys={["1"]}
            expandedKeys={() => expandedKeys.value}
            onExpand={(keys) => expandedKeys.value = keys}
            selectedKeys={() => selectedKeys.value}
            onSelect={(keys) => selectedKeys.value = keys}
            checkable
            checkedKeys={() => checkedKeys.value}
            onCheck={(keys) => checkedKeys.value = keys}
          />
          {/* 包成 getter，使 KeysDisplay 在独立 effect 中渲染并读 signal，避免整页 effect 订阅 signal 导致 DataDisplayTree 重跑、Tree 的 data-view-dynamic 槽被 replaceChildren 整树闪动 */}
          {() => (
            <KeysDisplay
              getSelectedKeys={() => selectedKeys.value}
              getCheckedKeys={() => checkedKeys.value}
            />
          )}
          <CodeBlock
            title="代码示例"
            code={exampleCheckable}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>showLine 连接线</Title>
          <Tree
            treeData={treeData}
            expandedKeys={() => expandedKeys.value}
            onExpand={(keys) => expandedKeys.value = keys}
            showLine
          />
          <CodeBlock
            title="代码示例"
            code={exampleShowLine}
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
          TreeNode：key、title、disabled、selectable、checkable、isLeaf、children。Tree
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
              {TREE_API.map((row) => (
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
