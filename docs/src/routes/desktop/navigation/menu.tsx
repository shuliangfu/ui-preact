/**
 * Menu 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/navigation/menu
 */

import { CodeBlock, Menu, Paragraph, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const MENU_API: ApiRow[] = [
  {
    name: "items",
    type: "MenuItem[]",
    default: "-",
    description: "菜单项（支持多级 children）",
  },
  {
    name: "onClick",
    type: "(key: string) => void",
    default: "-",
    description: "点击项回调",
  },
  {
    name: "mode",
    type: "vertical | horizontal",
    default: "vertical",
    description: "垂直或水平",
  },
  {
    name: "usePopoverSubmenu",
    type: "boolean",
    default: "false",
    description: "水平模式下子菜单是否弹出层展示",
  },
  {
    name: "defaultOpenKeys",
    type: "string[]",
    default: "-",
    description: "默认展开的子菜单 key",
  },
  {
    name: "openKeys",
    type: "string[] | (() => string[])",
    default: "-",
    description: "受控展开的 key 列表；传 getter 可与 Signal 联动",
  },
  {
    name: "onOpenChange",
    type: "(openKeys: string[]) => void",
    default: "-",
    description: "展开/收起回调",
  },
  {
    name: "focusedKey",
    type: "string | (() => string | undefined)",
    default: "-",
    description: "键盘导航当前焦点 key；传 getter 可与 Signal 联动",
  },
  {
    name: "onFocusChange",
    type: "(key: string) => void",
    default: "-",
    description: "焦点变化回调",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
];

const importCode = `import { signal } from "@preact/signals";
import { Menu } from "@dreamer/ui-preact";

const openKeys = signal<string[]>(["sub1"]);
const items = [
  { key: "1", label: "选项一" },
  { key: "2", label: "选项二" },
  { key: "sub1", label: "子菜单", children: [{ key: "3", label: "子项 3" }, { key: "4", label: "子项 4" }] },
];
<Menu
  items={items}
  onClick={(k) => {}}
  openKeys={() => openKeys.value}
  onOpenChange={(keys) => { openKeys.value = keys; }}
  mode="vertical"
/>`;

const exampleVertical = `import { signal } from "@preact/signals";

const openKeysVertical = signal<string[]>(["sub1"]);
const focusedKey = signal<string | undefined>("1");

<Menu
  items={items}
  onClick={(k) => {}}
  mode="vertical"
  openKeys={() => openKeysVertical.value}
  onOpenChange={(keys) => (openKeysVertical.value = keys)}
  focusedKey={() => focusedKey.value}
  onFocusChange={(k) => (focusedKey.value = k)}
/>`;

const exampleHorizontal = `import { signal } from "@preact/signals";

const openKeysHorizontal = signal<string[]>([]);

<Menu
  items={items}
  onClick={(k) => {}}
  mode="horizontal"
  openKeys={() => openKeysHorizontal.value}
  onOpenChange={(keys) => (openKeysHorizontal.value = keys)}
  usePopoverSubmenu
/>`;

export default function NavigationMenu() {
  const items = [
    { key: "1", label: "选项一" },
    { key: "2", label: "选项二" },
    {
      key: "sub1",
      label: "子菜单",
      children: [
        { key: "3", label: "子项 3" },
        { key: "4", label: "子项 4" },
      ],
    },
  ];

  /**
   * 示例区用 defaultOpenKeys / 非受控展开，避免根级 `return () =>` 与深层 Menu 受控 state 在 SSR/文档壳下偶发不挂载；
   * 受控写法见下方 CodeBlock。
   */
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Menu 菜单列表</Title>
        <Paragraph class="mt-2">
          菜单：items、onClick、mode、defaultOpenKeys、openKeys、onOpenChange、usePopoverSubmenu、focusedKey、onFocusChange、class。选中态由组件内部维护。
          展开某子树时，若当前选中项落在该子树外会自动清除；带子菜单的触发器在展开或子树内有选中时高亮。
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
          <Title level={3}>mode=vertical（垂直）</Title>
          <div class="flex flex-col gap-8 min-h-[120px]">
            <Menu
              items={items}
              onClick={() => {}}
              mode="vertical"
              defaultOpenKeys={["sub1"]}
            />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleVertical}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>mode=horizontal + usePopoverSubmenu</Title>
          <div class="min-h-[48px]">
            <Menu
              items={items}
              onClick={() => {}}
              mode="horizontal"
              usePopoverSubmenu
            />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleHorizontal}
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
          MenuItem：key、label、disabled、children。Menu 属性如下。
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
              {MENU_API.map((row) => (
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
