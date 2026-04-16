/**
 * TreeSelect 组件文档页（桌面）
 * 路由: /desktop/form/tree-select
 */

import {
  CodeBlock,
  Form,
  FormItem,
  Paragraph,
  Title,
  TreeSelect,
} from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** 与 {@link TreeSelectProps} 一致的 API 表 */
const TREESELECT_API: ApiRow[] = [
  {
    name: "options",
    type: "TreeSelectOption[]",
    default: "-",
    description:
      "树形数据；节点含 value、label，可选 children。任意深度；子节点在下拉里缩进展示",
  },
  {
    name: "value",
    type: "string | (() => string) | Signal<string>",
    default: '""',
    description:
      "当前选中节点 value；空串表示未选。与全库表单一致为 MaybeSignal：字面量、`() => T`、`createSignal` 返回值；勿直接绑 `sig.value`（快照失步或误订阅）。",
  },
  {
    name: "onChange",
    type: "(e: Event) => void",
    default: "-",
    description:
      "变更时触发；取选中值用 (e.target as HTMLInputElement).value，与 Select 自绘下拉一致",
  },
  {
    name: "placeholder",
    type: "string",
    default: '"请选择"',
    description: "未选时触发条文案；浮层首项同文案，用于清空选择",
  },
  {
    name: "size",
    type: "SizeVariant",
    default: "md",
    description: "尺寸：xs、sm、md、lg，与 Input / Select 映射一致",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "为 true 时不可展开、不可选",
  },
  {
    name: "hideFocusRing",
    type: "boolean",
    default: "false",
    description: "为 true 时隐藏触发条聚焦蓝色 ring",
  },
  {
    name: "name",
    type: "string",
    default: "-",
    description: "表单提交：渲染隐藏域 name，值为当前选中 value",
  },
  {
    name: "id",
    type: "string",
    default: "-",
    description: "触发按钮 id，便于 label 关联",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "根容器额外 class，常用 w-full",
  },
];

/** 文档基础示例树：二级部门 */
const TREE_OPTIONS = [
  {
    value: "dev",
    label: "研发",
    children: [
      { value: "fe", label: "前端" },
      { value: "be", label: "后端" },
    ],
  },
  { value: "ops", label: "运维" },
];

/** 三级结构，用于演示多层缩进 */
const TREE_DEEP = [
  {
    value: "corp",
    label: "总公司",
    children: [
      {
        value: "east",
        label: "华东区",
        children: [
          { value: "sh", label: "上海办" },
          { value: "hz", label: "杭州办" },
        ],
      },
      { value: "north", label: "华北区" },
    ],
  },
];

const importCode =
  `import { TreeSelect, Form, FormItem } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

const tree = [
  {
    value: "dev",
    label: "研发",
    children: [
      { value: "fe", label: "前端" },
      { value: "be", label: "后端" },
    ],
  },
];
const val = signal("");

<FormItem label="部门">
  <TreeSelect
    options={tree}
    value={val}
    class="w-full"
  />
</FormItem>`;

export default function FormTreeSelectDoc() {
  const val = signal("");
  const valDeep = signal("");
  const valForm = signal("fe");

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>TreeSelect 树选择</Title>
        <Paragraph class="mt-2 leading-relaxed">
          <strong>适用场景：</strong>
          后端或状态里已经是<strong>
            树形结构
          </strong>（如部门树、权限树、类目树），表单里只需
          <strong>单选其中一个节点</strong>，提交该节点的{" "}
          <code class="text-xs">value</code>
          （字符串 id）。组件把树<strong>
            前序展平
          </strong>为列表项，无需你在业务里手写「展平 + 拼路径」。
        </Paragraph>
        <Paragraph class="mt-3 leading-relaxed">
          <strong>和 Select 的区别：</strong>
          <code class="text-xs">Select</code> 的{" "}
          <code class="text-xs">options</code>
          是平铺的{" "}
          <code class="text-xs">{"{ value, label }"}</code>；TreeSelect 的{" "}
          <code class="text-xs">options</code> 是{" "}
          <code class="text-xs">TreeSelectOption[]</code>
          ，节点可带{" "}
          <code class="text-xs">
            children
          </code>。若数据本来就是平铺列表，请直接用 Select。
        </Paragraph>
        <Paragraph class="mt-3 leading-relaxed">
          <strong>和 Cascader 的区别：</strong>
          Cascader 一次选<strong>
            一条路径
          </strong>（父子联动，<code class="text-xs">value</code>
          多为{" "}
          <code class="text-xs">string[]</code>）；TreeSelect
          一次只选一个节点，对外 <code class="text-xs">value</code>{" "}
          为<strong>单个</strong>
          <code class="text-xs">string</code>。若需要「省-市」两级联动路径，用
          Cascader 更合适。
        </Paragraph>
        <Paragraph class="mt-3 leading-relaxed">
          <strong>展示规则：</strong>
          下拉列表里按<strong>层级缩进</strong>，每行显示<strong>
            当前节点名
          </strong>
          （子节点如「前端」会右移）；鼠标悬停可看{" "}
          <code class="text-xs">title</code>
          中的<strong>完整路径</strong>（如「研发 /
          前端」）。触发条上显示完整路径，避免只显示「前端」时不知道属于哪个父节点。
        </Paragraph>
        <Paragraph class="mt-3 leading-relaxed">
          <strong>交互：</strong>
          自绘触发条 + 浮层（与 Select 一致），点击遮罩或再点触发条、Esc
          可关闭；非浏览器原生 <code class="text-xs">{"<select>"}</code>。
        </Paragraph>
      </section>

      <section class="space-y-3">
        <Title level={2}>数据结构 TreeSelectOption</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          每个节点至少包含{" "}
          <code class="text-xs">value</code>（唯一标识，会作为表单值）与{" "}
          <code class="text-xs">label</code>（展示名）；若有子节点则设{" "}
          <code class="text-xs">children: TreeSelectOption[]</code>。同一棵树内
          {" "}
          <code class="text-xs">value</code>{" "}
          建议全局唯一，以便选中态与隐藏域正确对应。
        </Paragraph>
        <CodeBlock
          title="类型示意"
          code={`export interface TreeSelectOption {
  value: string;
  label: string;
  children?: TreeSelectOption[];
}`}
          language="tsx"
          showLineNumbers
          copyable
          wrapLongLines
        />
      </section>

      <section class="space-y-3">
        <Title level={2}>引入</Title>
        <CodeBlock
          title="代码示例"
          code={importCode}
          language="tsx"
          showLineNumbers
          copyable
          wrapLongLines
        />
      </section>

      <section class="space-y-8">
        <Title level={2}>示例</Title>

        <Form layout="vertical" class="w-full space-y-8">
          <section class="space-y-4">
            <Title level={3}>基础用法</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              受控 <code class="text-xs">value</code> 建议传 getter{" "}
              <code class="text-xs">{"() => val.value"}</code>
              ，避免 View 整树重跑导致失焦。选「请选择」可清空为{" "}
              <code class="text-xs">""</code>。
            </Paragraph>
            <FormItem label="部门">
              <TreeSelect
                options={TREE_OPTIONS}
                value={val}
                class="w-full"
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<TreeSelect
  options={TREE_OPTIONS}
  value={val}
  class="w-full"
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>多层级（缩进）</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              超过两级时，子、孙节点依次增加左侧缩进；触发条仍显示从根到选中节点的完整路径。
            </Paragraph>
            <FormItem label="组织（三级）">
              <TreeSelect
                options={TREE_DEEP}
                value={valDeep}
                class="w-full"
                placeholder="选择组织节点"
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`const TREE_DEEP = [
  {
    value: "corp",
    label: "总公司",
    children: [
      {
        value: "east",
        label: "华东区",
        children: [
          { value: "sh", label: "上海办" },
          { value: "hz", label: "杭州办" },
        ],
      },
    ],
  },
];
<TreeSelect options={TREE_DEEP} value={v} onChange={...} placeholder="选择组织节点" />`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>name / id（表单）</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              传 <code class="text-xs">name</code>{" "}
              时渲染隐藏域，提交表单会得到当前选中的{" "}
              <code class="text-xs">value</code>。传{" "}
              <code class="text-xs">id</code> 可与 FormItem 的{" "}
              <code class="text-xs">id</code> 配合做{" "}
              <code class="text-xs">label for</code> 关联。
            </Paragraph>
            <FormItem label="带 name 的字段" id="tree-dept-field">
              <TreeSelect
                id="tree-dept-field"
                name="deptId"
                options={TREE_OPTIONS}
                value={valForm}
                class="w-full"
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<FormItem label="部门" id="tree-dept-field">
  <TreeSelect
    id="tree-dept-field"
    name="deptId"
    options={tree}
    value={val}
    class="w-full"
  />
</FormItem>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>disabled</Title>
            <FormItem label="禁用（有选中值）">
              <TreeSelect
                options={TREE_OPTIONS}
                value="fe"
                disabled
                onChange={() => {}}
                class="w-full"
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<TreeSelect options={tree} value="fe" disabled onChange={() => {}} />`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>size（xs / sm / md / lg）</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              与 Input、Select 相同四档，控制触发条内边距与字号。
            </Paragraph>
            <div class="w-full max-w-lg space-y-3">
              <FormItem label="xs">
                <TreeSelect
                  options={TREE_OPTIONS}
                  value=""
                  size="xs"
                  onChange={() => {}}
                  class="w-full"
                />
              </FormItem>
              <FormItem label="sm">
                <TreeSelect
                  options={TREE_OPTIONS}
                  value=""
                  size="sm"
                  onChange={() => {}}
                  class="w-full"
                />
              </FormItem>
              <FormItem label="md（默认）">
                <TreeSelect
                  options={TREE_OPTIONS}
                  value=""
                  size="md"
                  onChange={() => {}}
                  class="w-full"
                />
              </FormItem>
              <FormItem label="lg">
                <TreeSelect
                  options={TREE_OPTIONS}
                  value=""
                  size="lg"
                  onChange={() => {}}
                  class="w-full"
                />
              </FormItem>
            </div>
            <CodeBlock
              title="代码示例"
              code={`<TreeSelect options={tree} value="" size="xs" onChange={...} class="w-full" />
<TreeSelect ... size="sm" />
<TreeSelect ... size="md" />
<TreeSelect ... size="lg" />`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>
        </Form>
      </section>

      <section class="space-y-3">
        <Title level={2}>API</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          以下属性均为可选；<code class="text-xs">options</code>{" "}
          为必填（表中为强调语义单独说明）。
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
              {TREESELECT_API.map((row) => (
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
