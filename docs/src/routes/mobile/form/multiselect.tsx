/**
 * MultiSelect（移动版）文档页（概述、引入、示例、API）。路由: /mobile/form/multiselect
 */

import { MultiSelect } from "@dreamer/ui-preact/mobile";
import { CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";
import {
  DocsApiTable,
  type DocsApiTableRow,
} from "../../../components/DocsApiTable.tsx";
import { MobileDocDemo } from "../../../components/MobileDocDemo.tsx";

const OPTIONS = [
  { value: "x", label: "项 X" },
  { value: "y", label: "项 Y" },
  { value: "z", label: "项 Z" },
];

const MULTI_API: DocsApiTableRow[] = [
  {
    name: "appearance",
    type: `"dropdown" | "native"`,
    default: `"dropdown"（与桌面一致）`,
    description: "默认自绘浮层；`native` 为原生 multiple + 全选/清空 + 大触控",
  },
  {
    name: "options",
    type: "MultiSelectOption[]",
    default: "-",
    description: "选项列表（必填）",
  },
  {
    name: "value",
    type: "MaybeSignal<string[]>",
    default: "-",
    description: "已选 value 数组",
  },
  {
    name: "placeholder",
    type: "string",
    default: "-",
    description: "dropdown 模式下无选中时触发器占位",
  },
  {
    name: "size",
    type: "SizeVariant",
    default: "md",
    description: "尺寸",
  },
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
    description: "变更回调",
  },
  { name: "name", type: "string", default: "-", description: "原生 name" },
  { name: "id", type: "string", default: "-", description: "原生 id" },
];

const importCode = `import { MultiSelect } from "@dreamer/ui-preact/mobile";
import { signal } from "@preact/signals";

const val = signal<string[]>(["x"]);
<MultiSelect class="w-full" options={...} value={val} />`;

/**
 * 与桌面表单文档一致：示例用 Signal 须模块级，避免受控写回不生效。
 */
const mobileMultiSelectBasicVal = signal<string[]>(["x"]);
const mobileMultiSelectControlledVal = signal<string[]>(["x"]);

export default function MobileMultiSelectDoc() {
  return (
    <div class="w-full max-w-3xl space-y-10">
      <section>
        <Title level={1}>MultiSelect 多选（移动）</Title>
        <Paragraph class="mt-2">
          与桌面包一致默认{" "}
          <code class="text-sm">
            appearance=&quot;dropdown&quot;
          </code>（自绘浮层多选）；需要原生多选加高触控区时传{" "}
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
            <MultiSelect
              class="w-full"
              options={OPTIONS}
              value={mobileMultiSelectBasicVal}
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

        <div class="space-y-4">
          <Title level={3}>受控 Signal</Title>
          <MobileDocDemo>
            <MultiSelect
              class="w-full"
              options={OPTIONS}
              value={mobileMultiSelectControlledVal}
            />
            <p class="mt-2 text-xs text-slate-500">
              当前：{mobileMultiSelectControlledVal.value.join(", ") ||
                "（空）"}
            </p>
          </MobileDocDemo>
        </div>
      </section>

      <section class="space-y-4">
        <Title level={2}>API</Title>
        <DocsApiTable rows={MULTI_API} />
      </section>
    </div>
  );
}
