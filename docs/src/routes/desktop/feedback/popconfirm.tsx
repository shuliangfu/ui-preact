/**
 * Popconfirm 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/feedback/popconfirm
 */

import { signal } from "@preact/signals";
import {
  Button,
  CodeBlock,
  Paragraph,
  Popconfirm,
  Title,
} from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const POPCONFIRM_API: ApiRow[] = [
  {
    name: "open",
    type: "boolean | (() => boolean) | Signal<boolean>",
    default: "-",
    description:
      "是否打开；推荐 open={sig}，勿 open={sig.value}（手写 JSX 快照）",
  },
  {
    name: "onOpenChange",
    type: "(open: boolean) => void",
    default: "-",
    description: "打开/关闭回调",
  },
  { name: "title", type: "string", default: "-", description: "确认标题/描述" },
  {
    name: "onConfirm",
    type: "() => void",
    default: "-",
    description:
      "确定后回调；关闭浮层由组件内部完成（写回 open / onOpenChange(false)），此处只写业务逻辑",
  },
  {
    name: "onCancel",
    type: "() => void",
    default: "-",
    description: "取消后回调；关闭由组件内部完成，此处只写业务逻辑（可不传）",
  },
  {
    name: "okText",
    type: "string",
    default: "确定",
    description: "确定按钮文案",
  },
  {
    name: "cancelText",
    type: "string",
    default: "取消",
    description: "取消按钮文案",
  },
  {
    name: "danger",
    type: "boolean",
    default: "false",
    description: "危险操作（确定按钮红色）；与 warning 同时为 true 时优先本项",
  },
  {
    name: "warning",
    type: "boolean",
    default: "false",
    description: "警告类确认（确定按钮琥珀色）；与 danger 互斥语义二选一",
  },
  {
    name: "showIcon",
    type: "boolean",
    default: "true",
    description: "是否显示问号图标",
  },
  {
    name: "placement",
    type: "string",
    default: "top",
    description:
      "气泡相对触发器的位置：top / topLeft / topRight / bottom / bottomLeft / bottomRight / left / right",
  },
  {
    name: "arrow",
    type: "boolean",
    default: "true",
    description: "是否显示指向触发器的小箭头（与 Popover 同向）",
  },
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "触发元素（需在 onClick 中打开）",
  },
  { name: "class", type: "string", default: "-", description: "包装器 class" },
];

const importCode = `import { signal } from "@preact/signals";
import { Button, Popconfirm } from "@dreamer/ui-preact";

const open = signal(false);

<Popconfirm
  open={open}
  onOpenChange={(o) => {
    open.value = o;
  }}
  title="确定要执行吗？"
  onConfirm={() => {
    console.log("确认");
  }}
  onCancel={() => {
    console.log("取消");
  }}
>
  <Button type="button" onClick={() => {
    open.value = true;
  }}>打开</Button>
</Popconfirm>`;

const exampleBasic = `<Popconfirm
  open={open}
  onOpenChange={(o) => {
    open.value = o;
  }}
  title="确定要执行该操作吗？"
  placement="bottom"
  okText="确定"
  cancelText="取消"
  onConfirm={() => {
    console.log("普通确认：已确定");
  }}
  onCancel={() => {
    console.log("普通确认：已取消");
  }}
>
  <Button type="button" variant="default" onClick={() => {
    open.value = true;
  }}>普通确认</Button>
</Popconfirm>`;

const exampleWarning = `<Popconfirm
  open={openWarning}
  onOpenChange={(o) => {
    openWarning.value = o;
  }}
  title="该操作可能影响性能或产生额外费用，是否继续？"
  warning
  okText="继续"
  cancelText="取消"
  showIcon
  onConfirm={() => {
    console.log("警告确认：已继续");
  }}
  onCancel={() => {
    console.log("警告确认：已取消");
  }}
>
  <Button type="button" variant="warning" onClick={() => {
    openWarning.value = true;
  }}>warning</Button>
</Popconfirm>`;

const exampleDanger = `<Popconfirm
  open={openDanger}
  onOpenChange={(o) => {
    openDanger.value = o;
  }}
  title="删除后无法恢复，确定删除吗？"
  danger
  okText="删除"
  cancelText="取消"
  showIcon
  onConfirm={() => {
    console.log("危险操作：已确认删除");
  }}
  onCancel={() => {
    console.log("危险操作：已取消删除");
  }}
>
  <Button type="button" variant="danger" onClick={() => {
    openDanger.value = true;
  }}>删除</Button>
</Popconfirm>`;

export default function FeedbackPopconfirm() {
  const open = signal(false);
  const openWarning = signal(false);
  const openDanger = signal(false);

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Popconfirm 气泡确认框</Title>
        <Paragraph class="mt-2">
          气泡确认框：title、onConfirm、onCancel、okText、cancelText；支持
          open/onOpenChange
          受控、danger、warning、showIcon、placement、arrow。点击确定或取消后
          {" "}
          <strong>关闭浮层由组件内部完成</strong>（写回{" "}
          <code class="text-xs">open</code>
          与 <code class="text-xs">onOpenChange(false)</code>
          ），<code class="text-xs">onConfirm</code> /{" "}
          <code class="text-xs">onCancel</code>
          中只需写业务逻辑，不必再设{" "}
          <code class="text-xs">open.value = false</code>
          。open 须传 createSignal 返回值（如{" "}
          <code class="text-xs">open={"{"}open{"}"}</code>
          ），勿写 <code class="text-xs">open.value</code>
          ，否则手写 JSX 只求一次快照、点击打不开。使用 Tailwind v4，支持
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

        <div class="space-y-4">
          <Title level={3}>受控示例：普通 / 警告 / 危险</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            「普通确认」使用{" "}
            <code class="text-xs">placement=&quot;bottom&quot;</code>
            ，气泡在按钮正下方；其余两个为默认 <code class="text-xs">top</code>
            。确定钮依次为
            primary、warning（琥珀色）、danger（红色）；问号图标颜色与语义略同向。
            默认带指向触发器的小箭头（<code class="text-xs">arrow</code>
            可关）。气泡挂在触发器外包的 <code class="text-xs">relative</code>
            内，用 <code class="text-xs">absolute</code>
            定位，与按钮同滚动子树。若祖先{" "}
            <code class="text-xs">overflow: hidden</code>
            可能裁切面板。演示条使用 <code class="text-xs">sticky</code> 与{" "}
            <code class="text-xs">overflow-visible</code>
            便于展示。
          </Paragraph>
          <div class="sticky top-3 z-20 flex flex-wrap gap-2 overflow-visible rounded-lg border border-slate-200 bg-white/90 px-3 py-3 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/90">
            <Popconfirm
              open={open}
              onOpenChange={(o) => {
                open.value = o;
              }}
              title="确定要执行该操作吗？"
              placement="bottom"
              okText="确定"
              cancelText="取消"
              onConfirm={() => {
                console.log("普通确认：已确定");
              }}
              onCancel={() => {
                console.log("普通确认：已取消");
              }}
            >
              <Button
                type="button"
                variant="default"
                onClick={() => {
                  open.value = true;
                }}
              >
                普通确认
              </Button>
            </Popconfirm>
            <Popconfirm
              open={openWarning}
              onOpenChange={(o) => {
                openWarning.value = o;
              }}
              title="该操作可能影响性能或产生额外费用，是否继续？"
              warning
              okText="继续"
              cancelText="取消"
              showIcon
              onConfirm={() => {
                console.log("警告确认：已继续");
              }}
              onCancel={() => {
                console.log("警告确认：已取消");
              }}
            >
              <Button
                type="button"
                variant="warning"
                onClick={() => {
                  openWarning.value = true;
                }}
              >
                warning
              </Button>
            </Popconfirm>
            <Popconfirm
              open={openDanger}
              onOpenChange={(o) => {
                openDanger.value = o;
              }}
              title="删除后无法恢复，确定删除吗？"
              danger
              okText="删除"
              cancelText="取消"
              showIcon
              onConfirm={() => {
                console.log("危险操作：已确认删除");
              }}
              onCancel={() => {
                console.log("危险操作：已取消删除");
              }}
            >
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  openDanger.value = true;
                }}
              >
                删除
              </Button>
            </Popconfirm>
          </div>
          <CodeBlock
            title="代码示例（普通 · 右侧 placement）"
            code={exampleBasic}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
          <CodeBlock
            title="代码示例（warning）"
            code={exampleWarning}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
          <CodeBlock
            title="代码示例（danger）"
            code={exampleDanger}
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
          组件接收以下属性，title 为必填；触发器 onClick 中设置 signal 为 true
          或调用 onOpenChange(true)；open 请传 Signal（createSignal
          返回值），勿传 .value。确定/取消关闭 由组件处理，onConfirm、onCancel
          仅作业务回调。
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
              {POPCONFIRM_API.map((row) => (
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
