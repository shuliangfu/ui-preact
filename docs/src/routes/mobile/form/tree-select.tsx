/**
 * TreeSelect（移动版）文档页（概述、引入、示例、API）。路由: /mobile/form/tree-select
 */

import { TreeSelect } from "@dreamer/ui-preact/mobile";
import { CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";
import {
  DocsApiTable,
  type DocsApiTableRow,
} from "../../../components/DocsApiTable.tsx";
import { MobileDocDemo } from "../../../components/MobileDocDemo.tsx";

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

const TREE_API: DocsApiTableRow[] = [
  {
    name: "appearance",
    type: `"dropdown" | "native"`,
    default: `"dropdown"（与桌面一致）`,
    description: "默认缩进浮层；`native` 为单原生 select，选项文案为完整路径",
  },
  {
    name: "options",
    type: "TreeSelectOption[]",
    default: "-",
    description: "嵌套树；每项 value、label、可选 children",
  },
  {
    name: "value",
    type: "MaybeSignal<string>",
    default: "-",
    description: "选中节点 value（非路径串）",
  },
  {
    name: "placeholder",
    type: "string",
    default: "-",
    description: "未选占位",
  },
  { name: "size", type: "SizeVariant", default: "md", description: "尺寸" },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "禁用",
  },
  {
    name: "hideFocusRing",
    type: "boolean",
    default: "false",
    description: "隐藏聚焦 ring",
  },
  { name: "class", type: "string", default: "-", description: "根 class" },
  {
    name: "onChange",
    type: "(e: Event) => void",
    default: "-",
    description: "变更；与 Select 相同可取 target.value",
  },
  { name: "name", type: "string", default: "-", description: "原生 name" },
  { name: "id", type: "string", default: "-", description: "原生 id" },
];

const importCode = `import { TreeSelect } from "@dreamer/ui-preact/mobile";
import { signal } from "@preact/signals";

const val = signal("");

const options = [
  {
    value: "dev",
    label: "研发",
    children: [
      { value: "fe", label: "前端" },
      { value: "be", label: "后端" },
    ],
  },
];

<TreeSelect options={options} value={val} placeholder="请选择" class="w-full" />`;

/** 与 Select 移动文档相同：Signal 放模块级，保证受控写回与订阅正确 */
const mobileTreeSelectVal = signal("fe");

export default function MobileTreeSelectDoc() {
  return (
    <div class="w-full max-w-3xl space-y-10">
      <section>
        <Title level={1}>TreeSelect 树选择（移动）</Title>
        <Paragraph class="mt-2">
          选项为嵌套树，适合部门/类目；与桌面一致默认{" "}
          <code class="text-sm">dropdown</code>（缩进浮层）。需要单原生{" "}
          <code class="text-sm">select</code>、选项展示完整路径（如「研发 /
          前端」）时传{" "}
          <code class="text-sm">appearance=&quot;native&quot;</code>。
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
          <Title level={3}>基础</Title>
          <MobileDocDemo>
            <TreeSelect
              options={TREE_OPTIONS}
              value={mobileTreeSelectVal}
              placeholder="请选择部门"
              class="w-full"
            />
          </MobileDocDemo>
          <CodeBlock
            title="代码示例"
            code={importCode}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>
      </section>

      <section class="space-y-4">
        <Title level={2}>API</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          与 Select 的差异见 shared TreeSelect 文件头注释（平铺 options vs 树形
          options）。
        </Paragraph>
        <DocsApiTable rows={TREE_API} />
      </section>
    </div>
  );
}
