/**
 * ActionSheet 文档页（概述、引入、示例、API）。路由: /mobile/feedback/action-sheet
 */

import { ActionSheet } from "@dreamer/ui-preact/mobile";
import { Button, CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";
import {
  DocsApiTable,
  type DocsApiTableRow,
} from "../../../components/DocsApiTable.tsx";
import { MobileDocDemo } from "../../../components/MobileDocDemo.tsx";

const ACTION_SHEET_API: DocsApiTableRow[] = [
  {
    name: "open",
    type: "Signal | () => boolean",
    default: "-",
    description: "是否打开；须传 Signal 或 getter，勿仅传 `.value`",
  },
  {
    name: "onClose",
    type: "() => void",
    default: "-",
    description: "取消行或遮罩关闭时触发",
  },
  {
    name: "title",
    type: "string | null",
    default: "-",
    description: "动作列表上方标题；null 可隐藏标题区",
  },
  {
    name: "actions",
    type: "ActionSheetAction[]",
    default: "-",
    description: "动作项列表（必填）",
  },
  {
    name: "cancelText",
    type: "string | null",
    default: `"取消"`,
    description: "底部取消文案；null 或空串则不显示取消区",
  },
  {
    name: "maskClosable",
    type: "boolean",
    default: "true",
    description: "点击遮罩是否关闭",
  },
  {
    name: "destroyOnClose",
    type: "boolean",
    default: "false",
    description: "关闭后是否销毁子树",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "容器额外 class",
  },
];

const ACTION_ITEM_API: DocsApiTableRow[] = [
  { name: "label", type: "string", default: "-", description: "主文案" },
  {
    name: "onClick",
    type: "() => void",
    default: "-",
    description: "点击回调",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "是否禁用",
  },
  {
    name: "danger",
    type: "boolean",
    default: "false",
    description: "危险操作（红色文案）",
  },
  {
    name: "description",
    type: "string",
    default: "-",
    description: "副标题/描述",
  },
  {
    name: "icon",
    type: "ComponentChildren",
    default: "-",
    description: "左侧图标节点",
  },
];

const importCode = `import { ActionSheet } from "@dreamer/ui-preact/mobile";
import { signal } from "@preact/signals";

const open = signal(false);

<ActionSheet
  open={open}
  onClose={() => (open.value = false)}
  title="请选择操作"
  actions={[
    { label: "分享", onClick: () => {} },
    { label: "删除", danger: true, onClick: () => {} },
  ]}
  cancelText="取消"
/>`;

export default function MobileActionSheetDoc() {
  const open = signal(false);
  const openDanger = signal(false);

  const actions = [
    { label: "分享", onClick: () => {} },
    { label: "删除", danger: true, onClick: () => {} },
  ];

  return (
    <div class="w-full max-w-3xl space-y-10">
      <section>
        <Title level={1}>ActionSheet 操作表</Title>
        <Paragraph class="mt-2">
          底部弹出的动作列表，常见于分享、删除等二次操作；支持危险样式、取消行与标题。
          {" "}
          <code class="text-sm">open</code>{" "}
          用法与 BottomSheet 相同；Portal 规则同 BottomSheet。
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
          <Title level={3}>基础（标题 + 动作 + 取消）</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            遮罩走全页 Portal 时会盖满浏览器视口。
          </Paragraph>
          <MobileDocDemo>
            <Button type="button" onClick={() => (open.value = true)}>
              打开 ActionSheet
            </Button>
            <ActionSheet
              open={open}
              onClose={() => (open.value = false)}
              title="请选择操作"
              actions={actions}
              cancelText="取消"
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
          <Title level={3}>无标题（title 省略）</Title>
          <MobileDocDemo>
            <Button type="button" onClick={() => (openDanger.value = true)}>
              打开（无标题）
            </Button>
            <ActionSheet
              open={openDanger}
              onClose={() => (openDanger.value = false)}
              title={null}
              actions={[{ label: "仅一项", onClick: () => {} }]}
              cancelText="关闭"
            />
          </MobileDocDemo>
        </div>
      </section>

      <section class="space-y-6">
        <Title level={2}>API</Title>

        <div class="space-y-3">
          <Title level={3}>ActionSheet</Title>
          <DocsApiTable rows={ACTION_SHEET_API} />
        </div>

        <div class="space-y-3">
          <Title level={3}>ActionSheetAction</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            <code class="text-sm">actions</code> 数组每一项的形态。
          </Paragraph>
          <DocsApiTable rows={ACTION_ITEM_API} />
        </div>
      </section>
    </div>
  );
}
