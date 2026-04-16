/**
 * Cascader（移动版）文档页（概述、引入、示例、API）。路由: /mobile/form/cascader
 */

import { Cascader } from "@dreamer/ui-preact/mobile";
import { CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";
import {
  DocsApiTable,
  type DocsApiTableRow,
} from "../../../components/DocsApiTable.tsx";
import { MobileDocDemo } from "../../../components/MobileDocDemo.tsx";

const OPTIONS = [
  {
    value: "zhejiang",
    label: "浙江",
    children: [
      { value: "hangzhou", label: "杭州" },
      { value: "ningbo", label: "宁波" },
    ],
  },
  {
    value: "jiangsu",
    label: "江苏",
    children: [{ value: "nanjing", label: "南京" }],
  },
];

const CASCADER_API: DocsApiTableRow[] = [
  {
    name: "appearance",
    type: `"dropdown" | "native"`,
    default: `"dropdown"`,
    description:
      "默认多列浮层；`native` 为浅层双原生 select。移动入口与 shared 同源",
  },
  {
    name: "options",
    type: "CascaderOption[]",
    default: "-",
    description: "静态树；每项 value、label、可选 children / isLeaf",
  },
  {
    name: "value",
    type: "MaybeSignal<string[]>",
    default: "-",
    description: "选中路径；Signal 时组件内自动写回，可不写 onChange",
  },
  {
    name: "onChange",
    type: "(value: string[]) => void",
    default: "-",
    description: "非 Signal 受控时必须更新外部数据",
  },
  {
    name: "loadChildren",
    type: "(path: string[]) => Promise<CascaderOption[]>",
    default: "-",
    description: "异步加载子节点",
  },
  {
    name: "onLoadError",
    type: "(path, error) => void",
    default: "-",
    description: "加载失败回调",
  },
  {
    name: "placeholder",
    type: "string",
    default: "-",
    description: "未选时占位",
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
  { name: "name", type: "string", default: "-", description: "原生 name" },
  { name: "id", type: "string", default: "-", description: "原生 id" },
];

const importCode = `import { Cascader } from "@dreamer/ui-preact/mobile";
import { signal } from "@preact/signals";

const val = signal<string[]>([]);

<Cascader options={tree} value={val} class="w-full" />`;

/** 模块级 Signal，与桌面 Cascader 文档受控约定一致 */
const mobileCascaderVal = signal<string[]>([]);

export default function MobileCascaderDoc() {
  return (
    <div class="w-full max-w-3xl space-y-10">
      <section>
        <Title level={1}>Cascader 级联（移动）</Title>
        <Paragraph class="mt-2">
          <code class="text-sm">@dreamer/ui-preact/mobile</code> 再导出{" "}
          <code class="text-sm">
            shared/form/Cascader
          </code>，与桌面包一致；数据结构为嵌套{" "}
          <code class="text-sm">CascaderOption[]</code>。
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
          <Title level={3}>静态树 + Signal</Title>
          <MobileDocDemo>
            <Cascader
              options={OPTIONS}
              value={mobileCascaderVal}
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
          详细行为（动态加载、列数、浮层定位）见桌面 Cascader 文档与源码注释。
        </Paragraph>
        <DocsApiTable rows={CASCADER_API} />
      </section>
    </div>
  );
}
