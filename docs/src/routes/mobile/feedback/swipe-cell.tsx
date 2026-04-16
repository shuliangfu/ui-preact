/**
 * SwipeCell 文档页（概述、引入、示例、API）。路由: /mobile/feedback/swipe-cell
 */

import { SwipeCell } from "@dreamer/ui-preact/mobile";
import { CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";
import {
  DocsApiTable,
  type DocsApiTableRow,
} from "../../../components/DocsApiTable.tsx";
import { MobileDocDemo } from "../../../components/MobileDocDemo.tsx";

const SWIPE_CELL_API: DocsApiTableRow[] = [
  {
    name: "leftActions",
    type: "SwipeCellAction[]",
    default: "[]",
    description: "左侧操作（向右滑露出）",
  },
  {
    name: "rightActions",
    type: "SwipeCellAction[]",
    default: "[]",
    description: "右侧操作（向左滑露出）",
  },
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "单元格主内容",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "禁用滑动",
  },
  {
    name: "actionWidth",
    type: "number",
    default: "64",
    description: "单侧每个按钮宽度（px）",
  },
  {
    name: "onOpen",
    type: '(side: "left" | "right") => void',
    default: "-",
    description: "滑开一侧时回调",
  },
  {
    name: "onClose",
    type: "() => void",
    default: "-",
    description: "收回时回调",
  },
  { name: "class", type: "string", default: "-", description: "最外层 class" },
];

const ACTION_API: DocsApiTableRow[] = [
  { name: "text", type: "string", default: "-", description: "按钮文案" },
  {
    name: "onClick",
    type: "() => void",
    default: "-",
    description: "点击回调",
  },
  {
    name: "style",
    type: `"default" | "primary" | "danger"`,
    default: "default",
    description: "预设配色",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "覆盖按钮 class",
  },
];

const importCode = `import { SwipeCell } from "@dreamer/ui-preact/mobile";

<SwipeCell
  rightActions={[
    { text: "删除", style: "danger", onClick: () => {} },
    { text: "更多", style: "default", onClick: () => {} },
  ]}
>
  <div class="px-4 py-3">列表行内容</div>
</SwipeCell>`;

const exampleBothSides = `<SwipeCell
  leftActions={[{ text: "标为已读", style: "primary", onClick: () => {} }]}
  rightActions={[{ text: "删除", style: "danger", onClick: () => {} }]}
>
  <div class="px-4 py-3">左滑或右滑</div>
</SwipeCell>`;

export default function MobileSwipeCellDoc() {
  return (
    <div class="w-full max-w-3xl space-y-10">
      <section>
        <Title level={1}>SwipeCell 滑动单元格</Title>
        <Paragraph class="mt-2">
          列表行左右滑动露出操作按钮，适用于消息列表、购物车等；支持左右两侧多按钮与禁用。
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
          <Title level={3}>右侧操作（向左滑）</Title>
          <MobileDocDemo class="p-2">
            <SwipeCell
              rightActions={[
                { text: "删除", style: "danger", onClick: () => {} },
                { text: "更多", style: "default", onClick: () => {} },
              ]}
            >
              <div class="px-4 py-3 text-slate-800 dark:text-slate-100">
                向左滑动本条查看操作
              </div>
            </SwipeCell>
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
          <Title level={3}>左右双侧</Title>
          <MobileDocDemo class="p-2">
            <SwipeCell
              leftActions={[
                { text: "标为已读", style: "primary", onClick: () => {} },
              ]}
              rightActions={[{
                text: "删除",
                style: "danger",
                onClick: () => {},
              }]}
            >
              <div class="px-4 py-3 text-slate-800 dark:text-slate-100">
                向右滑露出左侧，向左滑露出右侧
              </div>
            </SwipeCell>
          </MobileDocDemo>
          <CodeBlock
            title="代码示例"
            code={exampleBothSides}
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
          <Title level={3}>SwipeCell</Title>
          <DocsApiTable rows={SWIPE_CELL_API} />
        </div>
        <div class="space-y-3">
          <Title level={3}>SwipeCellAction</Title>
          <DocsApiTable rows={ACTION_API} />
        </div>
      </section>
    </div>
  );
}
