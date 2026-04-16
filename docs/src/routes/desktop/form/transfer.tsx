/**
 * Transfer 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/form/transfer
 */

import {
  CodeBlock,
  Form,
  FormItem,
  Paragraph,
  Title,
  Transfer,
} from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const TRANSFER_API: ApiRow[] = [
  {
    name: "dataSource",
    type: "Array<{key, title, disabled?}>",
    default: "-",
    description: "数据源",
  },
  {
    name: "targetKeys",
    type: "MaybeSignal<string[]>",
    default: "-",
    description:
      "已选 key 列表。传 `createSignal` 返回值时组件内回写，可不写 onChange；静态数组仅适合禁用展示等不需穿梭场景",
  },
  {
    name: "onChange",
    type: "(keys: string[]) => void",
    default: "-",
    description:
      "可选。`targetKeys` 为 Signal 时组件已回写；需副作用（如打日志）时再传",
  },
  {
    name: "titles",
    type: "[string, string]",
    default: "-",
    description: "左右列标题",
  },
  {
    name: "showSearch",
    type: "boolean",
    default: "false",
    description: "是否显示搜索",
  },
  {
    name: "searchPlaceholder",
    type: "[string, string]",
    default: "-",
    description: "左右搜索框占位",
  },
  {
    name: "searchValue",
    type: "[string, string]",
    default: "-",
    description:
      "可选：左右搜索框初始文案（仅实例创建时生效）；勿做每键更新的受控绑定，以免失焦",
  },
  {
    name: "onSearch",
    type: "(dir: 'left'|'right', value: string) => void",
    default: "-",
    description: "用户输入搜索时的通知回调（筛选在组件内部完成）",
  },
  {
    name: "filterOption",
    type: "(inputValue: string, item: {key, title}) => boolean",
    default: "-",
    description: "自定义筛选",
  },
  {
    name: "render",
    type: "(item: {key, title}) => any",
    default: "-",
    description: "自定义渲染项",
  },
  {
    name: "listStyle",
    type: "CSSProperties",
    default: "-",
    description: "列表容器样式",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "整组禁用",
  },
  {
    name: "hideFocusRing",
    type: "boolean",
    default: "false",
    description:
      "为 true 时隐藏列头搜索框与穿梭操作按钮的聚焦蓝色 ring；默认 false 显示",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
];

const data = [
  { key: "1", title: "苹果" },
  { key: "2", title: "香蕉" },
  { key: "3", title: "橙子" },
  { key: "4", title: "葡萄" },
  { key: "5", title: "西瓜" },
  { key: "6", title: "草莓", disabled: true },
];

const importCode =
  `import { Transfer, Form, FormItem } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

const data = [{ key: "1", title: "选项1" }, { key: "2", title: "选项2" }];
const targetKeys = signal<string[]>([]);
<FormItem label="穿梭">
  <Transfer
    dataSource={data}
    targetKeys={targetKeys}
    titles={["待选", "已选"]}
  />
</FormItem>`;

export default function FormTransfer() {
  const targetKeys = signal<string[]>([]);
  const targetKeys2 = signal<string[]>(["2", "4"]);
  /** 含 disabled 项示例：受控请传 Signal；勿写死 targetKeys 否则无法穿梭 */
  const targetKeysWithDisabled = signal<string[]>(["1"]);

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Transfer 穿梭框</Title>
        <Paragraph class="mt-2">
          穿梭框：dataSource、targetKeys、onChange、titles、showSearch、searchPlaceholder、可选
          searchValue（仅初始文案）、onSearch（输入通知）、filterOption、render、listStyle、disabled。宽度由
          class 控制，表单中需占满一列时传 class="w-full"。Tailwind v4 +
          light/dark。
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

        <Form layout="vertical" class="w-full space-y-6">
          <section class="space-y-4">
            <Title level={3}>基础（无搜索）</Title>
            <FormItem label="穿梭">
              <Transfer
                dataSource={data}
                targetKeys={targetKeys}
                titles={["待选", "已选"]}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Transfer
  dataSource={data}
  targetKeys={targetKeys}
  titles={["待选", "已选"]}
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>showSearch 搜索筛选</Title>
            <FormItem label="左右列可搜索">
              <Transfer
                dataSource={data}
                targetKeys={targetKeys2}
                titles={["待选", "已选"]}
                showSearch
                searchPlaceholder={["筛选左侧", "筛选右侧"]}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<Transfer
  ...
  showSearch
  searchPlaceholder={["左", "右"]}
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>dataSource 含 disabled 项 / 整组 disabled</Title>
            <FormItem label="草莓为 disabled">
              <Transfer
                dataSource={data}
                targetKeys={targetKeysWithDisabled}
                titles={["源", "目标"]}
              />
            </FormItem>
            <FormItem label="整组禁用">
              <Transfer
                dataSource={data}
                targetKeys={["1", "2"]}
                disabled
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`// 项级 disabled：受控 targetKeys 用 Signal
const targetKeys = signal<string[]>(["1"]);
<Transfer
  dataSource={[{ key: "a", title: "可选" }, { key: "b", title: "禁用", disabled: true }]}
  targetKeys={targetKeys}
/>
// 整组：<Transfer disabled />`}
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
          组件接收以下属性（均为可选）。
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
              {TRANSFER_API.map((row) => (
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
