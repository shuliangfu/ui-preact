/**
 * TabBar 文档页（概述、引入、示例、API）。路由: /mobile/navigation/tab-bar
 */

import { TabBar } from "@dreamer/ui-preact/mobile";
import {
  CodeBlock,
  IconHome,
  IconInbox,
  IconUser,
  Paragraph,
  Title,
} from "@dreamer/ui-preact";
import { signal } from "@preact/signals";
import {
  DocsApiTable,
  type DocsApiTableRow,
} from "../../../components/DocsApiTable.tsx";
import { MobileDocDemo } from "../../../components/MobileDocDemo.tsx";

const TAB_BAR_API: DocsApiTableRow[] = [
  {
    name: "items",
    type: "TabBarItem[]",
    default: "-",
    description: "标签项：key、label、可选 icon、badge",
  },
  {
    name: "activeKey",
    type: "Signal | () => string",
    default: "-",
    description: "当前选中 key；须 `activeKey={sig}` 或 getter",
  },
  {
    name: "onChange",
    type: "(key: string) => void",
    default: "-",
    description: "切换标签时回调",
  },
  {
    name: "fixed",
    type: "boolean",
    default: "true",
    description: "是否 fixed 贴底；文档示例常用 false 避免挡布局",
  },
  {
    name: "border",
    type: "boolean",
    default: "true",
    description: "是否显示顶部分割线",
  },
  {
    name: "safeAreaInsetBottom",
    type: "boolean",
    default: "true",
    description: "底部安全区占位（如 iPhone Home 指示条）",
  },
  { name: "class", type: "string", default: "-", description: "根节点 class" },
];

const TAB_BAR_ITEM_API: DocsApiTableRow[] = [
  { name: "key", type: "string", default: "-", description: "唯一标识" },
  {
    name: "label",
    type: "string | ComponentChildren",
    default: "-",
    description: "展示文案或节点",
  },
  {
    name: "icon",
    type: "ComponentChildren",
    default: "-",
    description: "图标（可选）",
  },
  {
    name: "badge",
    type: "number | string | ComponentChildren",
    default: "-",
    description: "角标",
  },
];

/**
 * 引入区与「文案标签」示例共用：与上方预览一致（三项 + fixed=false）。
 */
const introAndTextTabsCode =
  `import { TabBar } from "@dreamer/ui-preact/mobile";
import { signal } from "@preact/signals";

const activeKey = signal("home");

<TabBar
  fixed={false}
  items={[
    { key: "home", label: "首页" },
    { key: "list", label: "列表" },
    { key: "me", label: "我的" },
  ]}
  activeKey={activeKey}
  onChange={(k) => (activeKey.value = k)}
/>`;

/**
 * 「图标 + 角标」示例：与预览一致（IconHome / IconInbox / IconUser、badge）。
 */
const iconBadgeExampleCode =
  `import { TabBar } from "@dreamer/ui-preact/mobile";
import { IconHome, IconInbox, IconUser } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

const activeKey = signal("home");

<TabBar
  fixed={false}
  border
  items={[
    {
      key: "home",
      label: "首页",
      icon: <IconHome class="h-5 w-5" aria-hidden />,
      badge: 2,
    },
    {
      key: "inbox",
      label: "消息",
      icon: <IconInbox class="h-5 w-5" aria-hidden />,
    },
    {
      key: "me",
      label: "我的",
      icon: <IconUser class="h-5 w-5" aria-hidden />,
    },
  ]}
  activeKey={activeKey}
  onChange={(k) => (activeKey.value = k)}
/>`;

export default function MobileTabBarDoc() {
  const activeKey = signal("home");
  const activeKey2 = signal("home");

  return (
    <div class="w-full max-w-3xl space-y-10">
      <section>
        <Title level={1}>TabBar 底部标签栏</Title>
        <Paragraph class="mt-2">
          移动端底部主导航；默认 <code class="text-sm">fixed</code>{" "}
          贴底并适配安全区。文档示例中常设{" "}
          <code class="text-sm">fixed=false</code> 以免遮挡页面滚动布局。
        </Paragraph>
      </section>

      <section class="space-y-3">
        <Title level={2}>引入</Title>
        <CodeBlock
          title="代码示例"
          code={introAndTextTabsCode}
          language="tsx"
          showLineNumbers
          wrapLongLines
        />
      </section>

      <section class="space-y-8">
        <Title level={2}>示例</Title>

        <div class="space-y-4">
          <Title level={3}>文案标签（fixed=false）</Title>
          <MobileDocDemo class="relative flex min-h-[200px] flex-col p-4">
            <p class="mb-2 text-sm text-slate-500 dark:text-slate-400">
              当前：
              {
                /*
                 * 在 JSX 中直接嵌入 `activeKey`（@preact/signals），Preact 会订阅并随 Tab 切换更新。
                 */
              }
              <span class="font-mono">{activeKey}</span>
            </p>
            <div class="mt-auto">
              <TabBar
                fixed={false}
                items={[
                  { key: "home", label: "首页" },
                  { key: "list", label: "列表" },
                  { key: "me", label: "我的" },
                ]}
                activeKey={activeKey}
                onChange={(k) => (activeKey.value = k)}
              />
            </div>
          </MobileDocDemo>
          <CodeBlock
            title="代码示例"
            code={introAndTextTabsCode}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>图标 + 角标</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            <code class="text-sm">icon</code>、<code class="text-sm">
              badge
            </code>{" "}
            均为可选项；未传 <code class="text-sm">icon</code>{" "}
            时不会出现图标占位，并非渲染失败。
          </Paragraph>
          <MobileDocDemo class="relative flex min-h-[200px] flex-col p-4">
            <div class="mt-auto">
              <TabBar
                fixed={false}
                border
                items={[
                  {
                    key: "home",
                    label: "首页",
                    icon: <IconHome class="h-5 w-5" aria-hidden />,
                    badge: 2,
                  },
                  {
                    key: "inbox",
                    label: "消息",
                    icon: <IconInbox class="h-5 w-5" aria-hidden />,
                  },
                  {
                    key: "me",
                    label: "我的",
                    icon: <IconUser class="h-5 w-5" aria-hidden />,
                  },
                ]}
                activeKey={activeKey2}
                onChange={(k) => (activeKey2.value = k)}
              />
            </div>
          </MobileDocDemo>
          <CodeBlock
            title="代码示例"
            code={iconBadgeExampleCode}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>
      </section>

      <section class="space-y-6">
        <Title level={2}>API</Title>
        <div class="space-y-3">
          <Title level={3}>TabBar</Title>
          <DocsApiTable rows={TAB_BAR_API} />
        </div>
        <div class="space-y-3">
          <Title level={3}>TabBarItem</Title>
          <DocsApiTable rows={TAB_BAR_ITEM_API} />
        </div>
      </section>
    </div>
  );
}
