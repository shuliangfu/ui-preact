/**
 * Dialog 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/feedback/dialog
 *
 * 示例含：基础确认、警告确认（warning）、危险（danger）、loading、自定义 footer。
 * `open` 须传 **`Signal<boolean>`**（`createSignal` 返回值，如 `open={dialogOpen}`），勿写 `open={dialogOpen.value}`；底层 Modal 在 Hybrid 下需订阅 `.value`。
 */

import { signal } from "@preact/signals";
import {
  Button,
  CodeBlock,
  Dialog,
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

const DIALOG_API: ApiRow[] = [
  {
    name: "open",
    type: "boolean | (() => boolean) | Signal<boolean>",
    default: "-",
    description:
      "是否打开；推荐 `open={sig}`（createSignal 返回值），勿 `open={sig.value}` 快照",
  },
  {
    name: "onClose",
    type: "() => void",
    default: "-",
    description: "关闭回调",
  },
  { name: "title", type: "string | null", default: "-", description: "标题" },
  {
    name: "content",
    type: "string | unknown",
    default: "-",
    description: "正文（与 children 二选一）",
  },
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "弹层内容（与 content 二选一）",
  },
  {
    name: "footer",
    type: "unknown",
    default: "-",
    description: "自定义底部；传 null 不显示",
  },
  {
    name: "confirmText",
    type: "string",
    default: "确定",
    description: "确定按钮文案",
  },
  {
    name: "cancelText",
    type: "string | null",
    default: "取消",
    description: "取消按钮文案；null 不显示",
  },
  {
    name: "onConfirm",
    type: "() => void | Promise<void>",
    default: "-",
    description: "确定回调",
  },
  {
    name: "onCancel",
    type: "() => void",
    default: "onClose",
    description: "取消回调",
  },
  {
    name: "danger",
    type: "boolean",
    default: "false",
    description:
      "危险操作（确定按钮 danger 红色）；与 warning 同时为 true 时优先 danger",
  },
  {
    name: "warning",
    type: "boolean",
    default: "false",
    description:
      "警告类确认（确定按钮 warning 橙色）；与 danger 同时为 true 时以 danger 为准",
  },
  {
    name: "confirmLoading",
    type: "boolean",
    default: "false",
    description:
      "确定 loading（转圈 + 主色）；为 true 时确定与取消均禁用，完成后置 false",
  },
  {
    name: "showFooter",
    type: "boolean",
    default: "true",
    description: "是否显示底部",
  },
];

const importCode = `import { signal } from "@preact/signals";
import { Button, Dialog } from "@dreamer/ui-preact";

const open = signal(false);

<Button type="button" variant="primary" onClick={() => open.value = true}>
  打开
</Button>
<Dialog
  open={open}
  onClose={() => open.value = false}
  title="确认操作"
  content="确定要执行该操作吗？"
  confirmText="确定"
  cancelText="取消"
  onConfirm={() => open.value = false}
  onCancel={() => open.value = false}
/>`;

const exampleBasic = `<Dialog
  open={open}
  onClose={() => open.value = false}
  title="确认操作"
  content="确定要执行该操作吗？"
  confirmText="确定"
  cancelText="取消"
  onConfirm={() => open.value = false}
  onCancel={() => open.value = false}
/>`;

const exampleWarning = `<Dialog
  open={openWarning}
  onClose={() => openWarning.value = false}
  title="警告"
  content="该操作可能影响其他用户，是否继续？"
  confirmText="仍要继续"
  cancelText="取消"
  warning
  onConfirm={() => openWarning.value = false}
  onCancel={() => openWarning.value = false}
/>`;

const exampleDanger = `<Dialog
  open={openDanger}
  onClose={() => openDanger.value = false}
  title="删除确认"
  content="删除后无法恢复，确定要删除吗？"
  confirmText="删除"
  cancelText="取消"
  danger
  onConfirm={() => openDanger.value = false}
  onCancel={() => openDanger.value = false}
/>`;

const exampleLoading = `<Dialog
  open={openLoading}
  onClose={() => openLoading.value = false}
  title="提交中"
  content="确定后将显示 loading 状态，常用于异步提交。"
  confirmText="确定"
  cancelText="取消"
  confirmLoading
  onConfirm={() => openLoading.value = false}
  onCancel={() => openLoading.value = false}
/>`;

export default function FeedbackDialog() {
  const open = signal(false);
  const openWarning = signal(false);
  const openDanger = signal(false);
  const openLoading = signal(false);

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Dialog 确认对话框</Title>
        <Paragraph class="mt-2">
          确认对话框，基于
          Modal：标题、正文；支持警告确认（橙色确定）、危险操作（红色确定）、确定按钮
          loading、自定义 footer。使用 Tailwind v4，支持 light/dark 主题。
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
          <Title level={3}>基础用法</Title>
          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              onClick={() => open.value = true}
            >
              打开 Dialog
            </Button>
          </div>
          <Dialog
            open={open}
            onClose={() => open.value = false}
            title="确认操作"
            content="确定要执行该操作吗？"
            confirmText="确定"
            cancelText="取消"
            onConfirm={() => {
              open.value = false;
            }}
            onCancel={() => {
              open.value = false;
            }}
          />
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
          <Title level={3}>警告确认（warning）</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            需要用户留意后果但非不可逆删除时，使用{" "}
            <code class="text-xs">warning</code>，确定按钮为橙色 warning 样式。
          </Paragraph>
          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="warning"
              onClick={() => openWarning.value = true}
            >
              警告确认
            </Button>
          </div>
          <Dialog
            open={openWarning}
            onClose={() => openWarning.value = false}
            title="警告"
            content="该操作可能影响其他用户，是否继续？"
            confirmText="仍要继续"
            cancelText="取消"
            warning
            onConfirm={() => {
              openWarning.value = false;
            }}
            onCancel={() => {
              openWarning.value = false;
            }}
          />
          <CodeBlock
            title="代码示例"
            code={exampleWarning}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>危险操作（danger）</Title>
          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="danger"
              onClick={() => openDanger.value = true}
            >
              危险操作
            </Button>
          </div>
          <Dialog
            open={openDanger}
            onClose={() => openDanger.value = false}
            title="删除确认"
            content="删除后无法恢复，确定要删除吗？"
            confirmText="删除"
            cancelText="取消"
            danger
            onConfirm={() => {
              openDanger.value = false;
            }}
            onCancel={() => {
              openDanger.value = false;
            }}
          />
          <CodeBlock
            title="代码示例"
            code={exampleDanger}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>确定 Loading（confirmLoading）</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            {`确定钮为 primary + 转圈；confirmLoading 为 true 时「确定」「取消」均不可点，提交结束后再置回 false。若还要禁止标题栏/Esc/点遮罩关闭，可透传 closable、keyboard、maskClosable。`}
          </Paragraph>
          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => openLoading.value = true}
            >
              确定 Loading
            </Button>
          </div>
          <Dialog
            open={openLoading}
            onClose={() => openLoading.value = false}
            title="提交中"
            content="确定后将显示 loading 状态，常用于异步提交。"
            confirmText="确定"
            cancelText="取消"
            confirmLoading
            onConfirm={() => {
              openLoading.value = false;
            }}
            onCancel={() => {
              openLoading.value = false;
            }}
          />
          <CodeBlock
            title="代码示例"
            code={exampleLoading}
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
          Dialog 继承 Modal 大部分属性（如
          closable、maskClosable、width、centered、destroyOnClose、keyboard
          等），下表仅列 Dialog 特有或常用属性。
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
              {DIALOG_API.map((row) => (
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
