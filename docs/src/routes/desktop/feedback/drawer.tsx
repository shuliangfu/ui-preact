/**
 * Drawer 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/feedback/drawer
 *
 * `open` 须传 **`Signal<boolean>`**（`createSignal` 返回值）：`open={sig}`，勿 `open={sig.value}`（Hybrid/compileSource）。
 */

import { signal } from "@preact/signals";
import {
  Button,
  CodeBlock,
  Drawer,
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

const DRAWER_API: ApiRow[] = [
  {
    name: "open",
    type: "boolean | (() => boolean) | Signal<boolean>",
    default: "-",
    description: "是否打开；推荐 open={sig}，勿 open={sig.value}",
  },
  {
    name: "onClose",
    type: "() => void",
    default: "-",
    description: "关闭回调",
  },
  {
    name: "placement",
    type: "left | right",
    default: "right",
    description: "从左侧或右侧滑出",
  },
  {
    name: "width",
    type: "string | number",
    default: "360px",
    description: "抽屉宽度",
  },
  {
    name: "title",
    type: "DrawerTitleInput",
    default: "-",
    description:
      "标题：字符串/数字、TSX、null/false/空串不显示；可 () => … 订阅 signal",
  },
  {
    name: "titleAlign",
    type: '"left" | "center"',
    default: "left",
    description: "标题区对齐；center 时文案居中、关闭钮贴右",
  },
  { name: "children", type: "unknown", default: "-", description: "抽屉内容" },
  {
    name: "footer",
    type: "unknown",
    default: "-",
    description: "底部区域；null 不显示",
  },
  {
    name: "closable",
    type: "boolean",
    default: "true",
    description: "是否显示关闭按钮",
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
    description: "关闭后是否销毁子节点",
  },
  {
    name: "keyboard",
    type: "boolean",
    default: "true",
    description: "是否支持 Esc 关闭",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "抽屉面板 class",
  },
];

const importCode = `import { signal } from "@preact/signals";
import { Button, Drawer } from "@dreamer/ui-preact";

const open = signal(false);

<Button type="button" onClick={() => open.value = true}>打开抽屉</Button>
<Drawer
  open={open}
  onClose={() => open.value = false}
  placement="right"
  title="标题"
  titleAlign="left"
  footer={<Button type="button" onClick={() => open.value = false}>确定</Button>}
>
  <p>抽屉内容</p>
</Drawer>`;

const exampleRight = `<Drawer
  open={openRight}
  onClose={() => openRight.value = false}
  placement="right"
  title="右侧抽屉"
  footer={<Button type="button" variant="primary" onClick={() => openRight.value = false}>确定</Button>}
>
  <p>抽屉内容区域，可放置表单或列表。</p>
</Drawer>`;

const exampleLeft = `<Drawer
  open={openLeft}
  onClose={() => openLeft.value = false}
  placement="left"
  width={320}
  title="左侧抽屉"
  titleAlign="center"
>
  <p>从左侧滑出的面板，宽度 320px。</p>
</Drawer>`;

const exampleCustomTitle = `<Drawer
  open={openCustom}
  onClose={() => openCustom.value = false}
  placement="right"
  titleAlign="center"
  title={
    <span class="flex flex-col items-center gap-0.5 sm:flex-row sm:gap-2">
      <strong class="text-lg">自定义标题</strong>
      <span class="text-xs font-normal text-slate-500 dark:text-slate-400">
        支持 TSX
      </span>
    </span>
  }
>
  <p>title 可传入任意 ComponentChildren，不限于纯文本。</p>
</Drawer>`;

export default function FeedbackDrawer() {
  const openRight = signal(false);
  const openLeft = signal(false);
  const openCustom = signal(false);

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Drawer 侧边抽屉</Title>
        <Paragraph class="mt-2">
          侧边抽屉：从左侧或右侧滑出；支持 placement、width、title（含自定义
          TSX）、titleAlign、footer、closable、maskClosable、destroyOnClose、keyboard。
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
          <div class="flex gap-2">
            <Button
              type="button"
              variant="default"
              onClick={() => openLeft.value = true}
            >
              左侧抽屉
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => openRight.value = true}
            >
              右侧抽屉
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => openCustom.value = true}
            >
              自定义标题（TSX）
            </Button>
          </div>
          <Drawer
            open={openRight}
            onClose={() => openRight.value = false}
            placement="right"
            title="右侧抽屉"
            footer={
              <Button
                type="button"
                variant="primary"
                onClick={() => openRight.value = false}
              >
                确定
              </Button>
            }
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              抽屉内容区域，可放置表单或列表。
            </p>
          </Drawer>
          <Drawer
            open={openLeft}
            onClose={() => openLeft.value = false}
            placement="left"
            width={320}
            title="左侧抽屉"
            titleAlign="center"
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              从左侧滑出的面板，宽度 320px。
            </p>
          </Drawer>
          <Drawer
            open={openCustom}
            onClose={() => openCustom.value = false}
            placement="right"
            titleAlign="center"
            title={
              <span class="flex flex-col items-center gap-0.5 sm:flex-row sm:gap-2">
                <strong class="text-lg">自定义标题</strong>
                <span class="text-xs font-normal text-slate-500 dark:text-slate-400">
                  支持 TSX
                </span>
              </span>
            }
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              title 可传入任意 ComponentChildren，不限于纯文本。
            </p>
          </Drawer>
          <CodeBlock
            title="代码示例"
            code={exampleRight}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
          <CodeBlock
            title="代码示例（左侧 + width + titleAlign）"
            code={exampleLeft}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
          <CodeBlock
            title="代码示例（自定义 title TSX）"
            code={exampleCustomTitle}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          其他用法：closable（默认 true 显示关闭按钮）、maskClosable（默认 true
          点击遮罩关闭）、destroyOnClose（关闭后销毁内容）、keyboard（默认 true
          支持 Esc 关闭）。
        </Paragraph>
      </section>

      <section class="space-y-3">
        <Title level={2}>API</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          组件接收以下属性，open / onClose 受控显隐。
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
              {DRAWER_API.map((row) => (
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
