/**
 * Dropdown 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/navigation/dropdown
 */

import {
  Avatar,
  Button,
  CodeBlock,
  Divider,
  Dropdown,
  IconLogOut,
  IconSettings,
  IconUser,
  IconUserCog,
  Paragraph,
  Title,
} from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const DROPDOWN_API: ApiRow[] = [
  { name: "children", type: "unknown", default: "-", description: "触发元素" },
  { name: "overlay", type: "unknown", default: "-", description: "下拉内容" },
  {
    name: "onOpenChange",
    type: "(open: boolean) => void",
    default: "-",
    description: "打开/关闭时回调（可选，仅通知）",
  },
  {
    name: "trigger",
    type: "click | hover",
    default: "click",
    description: "触发方式",
  },
  {
    name: "hoverOpenDelay",
    type: "number",
    default: "150",
    description: "hover 展开延迟（ms）",
  },
  {
    name: "hoverCloseDelay",
    type: "number",
    default: "100",
    description: "hover 收起延迟（ms）",
  },
  {
    name: "placement",
    type:
      "bottom | bottomLeft | bottomRight | bottomAuto | top | topLeft | topRight",
    default: "bottom",
    description:
      "下拉位置；bottom 为正下方居中，bottomAuto 为正下方且根据左右空间自动左/右移",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "是否禁用",
  },
  {
    name: "overlayClass",
    type: "string",
    default: "-",
    description: "下拉层 class",
  },
  {
    name: "overlayId",
    type: "string",
    default: "-",
    description: "下拉层 id（无障碍）",
  },
  { name: "class", type: "string", default: "-", description: "包装器 class" },
];

const importCode = `import { Button, Dropdown } from "@dreamer/ui-preact";

const overlay = <ul class="list-none m-0">...</ul>;
<Dropdown overlay={overlay} trigger="click" placement="bottom">
  <Button variant="default">点击展开</Button>
</Dropdown>`;

const exampleClick = `<Dropdown
  open={open()}
  onOpenChange={(o) => open.value = o}
  overlay={overlay}
  trigger="click"
  placement="bottomLeft"
>
  <Button variant="default">点击展开</Button>
</Dropdown>`;

const exampleHover = `<Dropdown
  overlay={overlay}
  trigger="hover"
  placement="bottom"
>
  <span class="...">悬停展开</span>
</Dropdown>`;

const exampleDisabled = `<Dropdown
  overlay={overlay}
  trigger="click"
  disabled
>
  <Button variant="default" disabled>禁用下拉</Button>
</Dropdown>`;

/** overlay 复杂示例的代码字符串（带头像、分割线、图标菜单项） */
const exampleOverlayRichCode = `const overlayRich = (
  <div class="min-w-[200px]">
    {/* 头部：头像 + 名称 */}
    <div class="flex items-center gap-3 px-3 py-2">
      <Avatar size="sm" class="shrink-0">用</Avatar>
      <div class="truncate">
        <div class="text-sm font-medium text-slate-900 dark:text-slate-100">当前用户</div>
        <div class="text-xs text-slate-500 dark:text-slate-400">user@example.com</div>
      </div>
    </div>
    <Divider class="my-1" />
    <ul class="list-none m-0">
      <li>
        <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm ...">
          <IconUserCog class="w-4 h-4 shrink-0" /> 个人设置
        </a>
      </li>
      <li>
        <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm ...">
          <IconSettings class="w-4 h-4 shrink-0" /> 账户安全
        </a>
      </li>
    </ul>
    <Divider class="my-1" />
    <ul class="list-none m-0">
      <li>
        <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm ...">
          <IconLogOut class="w-4 h-4 shrink-0" /> 退出登录
        </a>
      </li>
    </ul>
  </div>
);
<Dropdown overlay={overlayRich} trigger="click" placement="bottom">
  <Button variant="default">用户菜单</Button>
</Dropdown>`;

/**
 * 下拉菜单项 hover / focus-visible：与 Menu 叶子项**选中态**同向（浅蓝底 + 主色字），
 * 便于与导航 Menu 视觉一致。
 */
/**
 * 使用 `dark:hover:` / `dark:focus-visible:`（勿写 `hover:dark:`），否则暗色主题下 hover 可能不生效。
 */
const dropdownMenuItemInteractive =
  "rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-300 transition-colors hover:bg-blue-50 dark:hover:bg-blue-800/50 hover:text-blue-600 dark:hover:text-blue-300 focus:outline-none focus-visible:bg-blue-50 dark:focus-visible:bg-blue-800/50 focus-visible:text-blue-600 dark:focus-visible:text-blue-300";

/** 纯文案链（block） */
const dropdownMenuItemLinkClass = `block w-full ${dropdownMenuItemInteractive}`;

/** 带图标的行（flex） */
const itemClass = `flex items-center gap-2 ${dropdownMenuItemInteractive}`;

export default function NavigationDropdown() {
  const overlay = (
    <ul class="list-none m-0">
      <li>
        <a href="#" class={dropdownMenuItemLinkClass}>
          操作一
        </a>
      </li>
      <li>
        <a href="#" class={dropdownMenuItemLinkClass}>
          操作二
        </a>
      </li>
    </ul>
  );

  /** 复杂 overlay：头部头像 + 分割线 + 带图标的菜单项 */
  const overlayRich = (
    <div class="min-w-[200px]">
      <div class="flex items-center gap-3 px-3 py-2">
        <Avatar size="sm" class="shrink-0">
          用
        </Avatar>
        <div class="truncate min-w-0">
          <div class="text-sm font-medium text-slate-900 dark:text-slate-100">
            当前用户
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400">
            user@example.com
          </div>
        </div>
      </div>
      <Divider class="my-1" />
      <ul class="list-none m-0">
        <li>
          <a href="#" class={itemClass}>
            <IconUserCog class="w-4 h-4 shrink-0" />
            个人设置
          </a>
        </li>
        <li>
          <a href="#" class={itemClass}>
            <IconSettings class="w-4 h-4 shrink-0" />
            账户安全
          </a>
        </li>
      </ul>
      <Divider class="my-1" />
      <ul class="list-none m-0">
        <li>
          <a href="#" class={itemClass}>
            <IconLogOut class="w-4 h-4 shrink-0" />
            退出登录
          </a>
        </li>
      </ul>
    </div>
  );

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Dropdown 下拉菜单</Title>
        <Paragraph class="mt-2">
          下拉菜单：children、overlay、onOpenChange、trigger、hoverOpenDelay、hoverCloseDelay、placement、disabled、overlayClass、overlayId。展开状态由组件内部维护。
          overlay 内菜单项建议 hover/focus 样式与{" "}
          <a
            href="/desktop/navigation/menu"
            class="text-blue-600 dark:text-blue-400 underline"
          >
            Menu
          </a>
          叶子选中态一致（本页示例已对齐浅蓝底 + 主色字）。使用 Tailwind
          v4，支持 light/dark 主题。
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
          <Title level={3}>trigger=click</Title>
          <Dropdown
            overlay={overlay}
            trigger="click"
            placement="bottomLeft"
          >
            <Button type="button" variant="default">点击展开</Button>
          </Dropdown>
          <CodeBlock
            title="代码示例"
            code={exampleClick}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>trigger=hover</Title>
          <Dropdown
            overlay={overlay}
            trigger="hover"
            placement="bottom"
          >
            <span class="inline-block px-4 py-2 border border-slate-300 rounded cursor-pointer">
              悬停展开
            </span>
          </Dropdown>
          <CodeBlock
            title="代码示例"
            code={exampleHover}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>disabled</Title>
          <Dropdown overlay={overlay} trigger="click" disabled>
            <Button type="button" variant="default" disabled>禁用下拉</Button>
          </Dropdown>
          <CodeBlock
            title="代码示例"
            code={exampleDisabled}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>overlay 复杂示例（头像、分割线、图标菜单项）</Title>
          <Paragraph class="text-slate-600 dark:text-slate-400">
            overlay 接受任意 JSX，不限于简单列表。可在头部放头像与用户名、用
            Divider 分割、菜单项用 Icon + 文案，全部通过 overlay 传入即可。默认
            placement="bottom" 为正下方居中；贴边时可改用 placement="bottomAuto"
            根据左右空间自动左/右移。
          </Paragraph>
          <Dropdown
            overlay={overlayRich}
            trigger="click"
            placement="bottom"
          >
            <Button type="button" variant="default">
              <IconUser class="w-4 h-4 shrink-0 mr-1" />
              用户菜单
            </Button>
          </Dropdown>
          <CodeBlock
            title="代码示例"
            code={exampleOverlayRichCode}
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
          组件接收以下属性。
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
              {DROPDOWN_API.map((row) => (
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
