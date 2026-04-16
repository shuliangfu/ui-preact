/**
 * Segmented 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/data-display/segmented
 */

import { signal } from "@preact/signals";
import { CodeBlock, Paragraph, Segmented, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const SEGMENTED_API: ApiRow[] = [
  {
    name: "options",
    type: "SegmentedOption<T>[]",
    default: "-",
    description: "选项（value、label、disabled）",
  },
  { name: "value", type: "T", default: "-", description: "当前选中值（受控）" },
  {
    name: "onChange",
    type: "(value: T) => void",
    default: "-",
    description: "变更回调",
  },
  {
    name: "block",
    type: "boolean",
    default: "false",
    description: "是否块级撑满",
  },
  { name: "size", type: "SizeVariant", default: "-", description: "尺寸" },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "是否禁用整组",
  },
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "自定义子节点",
  },
  {
    name: "stateKey",
    type: "string",
    default: "-",
    description:
      "可选。传值时非受控选中状态按 key 缓存，整树重渲染后仍保留，避免点击无反应",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
];

const importCode = `import { signal } from "@preact/signals";
import { Segmented } from "@dreamer/ui-preact";

const value = signal("列表");
const options = [{ value: "列表", label: "列表" }, { value: "网格", label: "网格" }];
{() => (
  <>
    <Segmented
      options={options}
      value={() => value.value}
      onChange={(v) => value.value = v}
    />
    <p>当前: {value.value}</p>
  </>
)}`;

const exampleBasic = `{() => (
  <>
    <Segmented
      options={options}
      value={() => value.value}
      onChange={(v) => value.value = v}
    />
    <p>当前: {value.value}</p>
  </>
)}`;

const exampleBlockSize = `{() => (
  <Segmented
    options={options}
    value={() => value.value}
    onChange={(v) => value.value = v}
    block
    size="lg"
  />
)}`;

const exampleDisabled = `{() => (
  <Segmented
    options={options}
    value={() => value.value}
    onChange={(v) => value.value = v}
  />
)}
// options 中某项设置 disabled: true 即可禁用该项`;

export default function DataDisplaySegmented() {
  /** 各示例使用独立 signal，互不影响 */
  const valueBasic = signal("列表");
  const valueBlock = signal("列表");
  const valueDisabled = signal("列表");

  const options = [
    { value: "列表", label: "列表" },
    { value: "网格", label: "网格" },
    { value: "卡片", label: "卡片" },
  ];

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Segmented 分段控制器</Title>
        <Paragraph class="mt-2">
          分段控制器：options、value、onChange、block、size、disabled、stateKey。
          整树渲染时建议传 stateKey 保留非受控状态；使用 Tailwind v4，支持
          light/dark 主题。
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

        {
          /*
           * 与 Table 文档一致：Segmented 放在 getter 外，仅「当前值」用函数子。
           * 若把 Segmented 与 CodeBlock 夹在同一个 `{() => <></>}` 里，更新时兄弟节点重排会导致示例与代码块上下对调。
           */
        }
        <div class="space-y-4">
          <Title level={3}>基础</Title>
          <Segmented
            options={options}
            value={() => valueBasic.value}
            onChange={(v) => valueBasic.value = v}
            stateKey="segmented-doc-basic"
          />
          {() => <p class="text-sm text-slate-500">当前: {valueBasic.value}</p>}
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
          <Title level={3}>block / size=lg</Title>
          <Segmented
            options={options}
            value={() => valueBlock.value}
            onChange={(v) => valueBlock.value = v}
            block
            size="lg"
            stateKey="segmented-doc-block"
          />
          <CodeBlock
            title="代码示例"
            code={exampleBlockSize}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>options 含 disabled</Title>
          <Segmented
            options={[...options, {
              value: "禁用",
              label: "禁用",
              disabled: true,
            }]}
            value={() => valueDisabled.value}
            onChange={(v) => valueDisabled.value = v}
            stateKey="segmented-doc-disabled"
          />
          <CodeBlock
            title="代码示例"
            code={exampleDisabled}
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
          SegmentedOption：value、label、disabled。Segmented 属性如下。
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
              {SEGMENTED_API.map((row) => (
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
