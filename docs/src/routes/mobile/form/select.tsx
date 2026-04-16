/**
 * Select（移动版）文档页（概述、引入、示例、API）。路由: /mobile/form/select
 */

import { Select } from "@dreamer/ui-preact/mobile";
import { CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";
import {
  DocsApiTable,
  type DocsApiTableRow,
} from "../../../components/DocsApiTable.tsx";
import { MobileDocDemo } from "../../../components/MobileDocDemo.tsx";

const OPTIONS = [
  { value: "a", label: "选项 A" },
  { value: "b", label: "选项 B" },
  { value: "c", label: "选项 C", disabled: true },
];

const SELECT_API: DocsApiTableRow[] = [
  {
    name: "appearance",
    type: `"dropdown" | "native"`,
    default: `"dropdown"`,
    description: "自绘浮层；详见 shared 源码（移动入口无包装，与桌面一致）",
  },
  {
    name: "options",
    type: "SelectOption[]",
    default: "-",
    description: "平铺选项；与 children 二选一场景见 shared 文档",
  },
  {
    name: "value",
    type: "MaybeSignal<string>",
    default: "-",
    description: "当前值；可为 Signal，变更时组件内可自动写回",
  },
  {
    name: "placeholder",
    type: "string",
    default: "-",
    description: "占位选项（value 为空时展示）",
  },
  {
    name: "size",
    type: "SizeVariant",
    default: "md",
    description: "xs | sm | md | lg",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "是否禁用",
  },
  {
    name: "hideFocusRing",
    type: "boolean",
    default: "false",
    description: "隐藏聚焦 ring",
  },
  { name: "class", type: "string", default: "-", description: "根节点 class" },
  {
    name: "onChange",
    type: "(e: Event) => void",
    default: "-",
    description: "变更回调",
  },
  { name: "name", type: "string", default: "-", description: "原生 name" },
  { name: "id", type: "string", default: "-", description: "原生 id" },
  {
    name: "children",
    type: "ComponentChildren",
    default: "-",
    description: "无 options 时用于原生 option 子节点",
  },
];

const importCode = `import { Select } from "@dreamer/ui-preact/mobile";
import { signal } from "@preact/signals";

/** 须绑定 value（Signal 或字面量）；仅 onChange 无法持久化选中项，与桌面文档一致 */
const val = signal("");
<Select
  class="w-full"
  options={[
    { value: "a", label: "选项 A" },
    { value: "b", label: "选项 B" },
  ]}
  value={val}
  placeholder="请选择"
/>`;

/**
 * 文档示例受控值须模块级：与桌面 Select 文档相同；页内 `createSignal` 在部分渲染路径下会导致子组件无法正确订阅/写回 `value`（选 B 仍显示 A）。
 */
const mobileSelectBasicVal = signal("");

/** 「受控 Signal」示例专用，勿放进页面函数体内 */
const mobileSelectControlledVal = signal("a");

export default function MobileSelectDoc() {
  return (
    <div class="w-full max-w-3xl space-y-10">
      <section>
        <Title level={1}>Select 单选（移动）</Title>
        <Paragraph class="mt-2">
          <code class="text-sm">@dreamer/ui-preact/mobile</code> 自{" "}
          <code class="text-sm">shared/form/Select</code>{" "}
          再导出，无移动层包装，与桌面包同一组件、同一默认自绘下拉。
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
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            自绘列表 + 全屏透明点击关闭，列表锚在触发条下方。须传{" "}
            <code class="text-sm">value</code>（常用{" "}
            <code class="text-sm">signal</code>
            ）；未传时选中后无法回显，与桌面 placeholder 示例相同写法。
          </Paragraph>
          <MobileDocDemo>
            <Select
              class="w-full"
              options={OPTIONS}
              value={mobileSelectBasicVal}
              placeholder="请选择"
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
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            <code class="text-sm">value</code>须为模块级{" "}
            <code class="text-sm">
              createSignal
            </code>；下方「当前」用函数子表达式订阅，勿只写{" "}
            <code class="text-sm">{"{sig.value}"}</code> 快照。
          </Paragraph>
          <MobileDocDemo>
            <Select
              class="w-full"
              options={OPTIONS}
              value={mobileSelectControlledVal}
            />
            <p class="mt-2 text-xs text-slate-500">
              当前：{mobileSelectControlledVal.value}
            </p>
          </MobileDocDemo>
        </div>
      </section>

      <section class="space-y-4">
        <Title level={2}>API</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          与 <code class="text-sm">@dreamer/ui-preact</code>{" "}
          中 Select API 完全相同（同源再导出）。
        </Paragraph>
        <DocsApiTable rows={SELECT_API} />
      </section>
    </div>
  );
}
