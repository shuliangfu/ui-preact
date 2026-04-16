/**
 * Modal 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/feedback/modal
 * `Modal` 的 `open`：请传 **`createSignal` 返回值**或零参 getter；**`width`/`title`** 随 signal 变时请用 **`width={() => …}`**、**`title={() => …}`**（Modal 内 memo 订阅，勿只写 `width={sig.value}` 快照）。**`children`** 普通写 `<p>…</p>` 即可；仅当弹窗**已打开**时仍要正文随同一 signal 刷新，再传 **`children={() => …}`**。客户端浮层通过 **`@dreamer/view` 的 `createPortal`** 挂到 `globalThis.document.body`（hybrid/SSR 下需存在真实 document）。
 */
import { Button, CodeBlock, Modal, Paragraph, Title } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const MODAL_API: ApiRow[] = [
  {
    name: "open",
    type: "boolean | (() => boolean) | Signal<boolean>",
    default: "-",
    description:
      "是否打开；推荐 open={x}（Signal，createSignal 返回值），勿 open={x.value}；嵌套 state 用 open={() => x.value.open}",
  },
  {
    name: "onClose",
    type: "() => void",
    default: "-",
    description: "关闭回调",
  },
  {
    name: "title",
    type: "string | null | false | (() => string | null | false)",
    default: "-",
    description: "标题；null/false 不显示；随 signal 变用 `title={() => …}`",
  },
  {
    name: "titleAlign",
    type: '"left" | "center"',
    default: "center",
    description:
      "标题对齐：center 相对弹层居中（关闭等仍贴右）；left 与操作区两端排布",
  },
  {
    name: "children",
    type: "unknown | (() => unknown)",
    default: "-",
    description:
      "弹层内容；通常直接写子节点即可；打开态下正文也要随 signal 变时用 `children={() => …}`",
  },
  {
    name: "footer",
    type: "unknown",
    default: "-",
    description: "底部区域；不传则无 footer",
  },
  {
    name: "closable",
    type: "boolean",
    default: "true",
    description: "是否显示右上角关闭按钮",
  },
  {
    name: "maskClosable",
    type: "boolean",
    default: "true",
    description: "点击遮罩是否关闭",
  },
  {
    name: "mask",
    type: "boolean",
    default: "true",
    description:
      "是否显示半透明遮罩；false 时不渲染遮罩，maskClosable 无效，请用关闭按钮或 keyboard",
  },
  {
    name: "width",
    type: "预设 | string | number | (() => 同上)",
    default: "520px（sm）",
    description:
      "弹层宽度；随 signal 变时请用 `width={() => sig.value.preset}`（Modal 内订阅），勿只写 `width={sig.value}`",
  },
  {
    name: "centered",
    type: "boolean",
    default: "true",
    description: "是否垂直居中",
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
    default: "false",
    description:
      "默认 false；传 keyboard 或 keyboard={true} 时支持按 Esc 触发 onClose",
  },
  {
    name: "draggable",
    type: "boolean",
    default: "false",
    description: "默认不拖动；传 true 时标题栏可拖动",
  },
  {
    name: "fullscreen",
    type: "boolean",
    default: "false",
    description:
      "为 true 时每次打开弹层即全屏布局；关闭后重置，与 fullscreenable 独立",
  },
  {
    name: "fullscreenable",
    type: "boolean",
    default: "false",
    description:
      "是否在标题栏显示全屏切换按钮；一开打是否全屏由 fullscreen 决定",
  },
  {
    name: "maskClass",
    type: "string",
    default: "-",
    description: "遮罩 class；仅 `mask` 为 true（默认）时生效",
  },
  {
    name: "wrapClass",
    type: "string",
    default: "-",
    description: "弹层容器 class",
  },
  {
    name: "bodyClass",
    type: "string",
    default: "-",
    description: "内容区 class",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "弹层盒子 class",
  },
];

const importCode = `import { signal } from "@preact/signals";
import { Button, Modal } from "@dreamer/ui-preact";

const open = signal(false);

<Button type="button" variant="primary" onClick={() => open.value = true}>
  打开
</Button>
<Modal
  open={open}
  onClose={() => open.value = false}
  title="弹窗标题"
  footer={
    <>
      <Button type="button" variant="primary" onClick={() => open.value = false}>
        确定
      </Button>
      <Button type="button" variant="default" onClick={() => open.value = false}>
        取消
      </Button>
    </>
  }
>
  <p>弹层内容</p>
</Modal>`;

/**
 * 本页全部示例用 open / 复合 state：必须模块级。
 * 父级 data-view-dynamic 重跑时若在此函数内 `createSignal`，每次新实例，按钮只改旧 signal → 预设宽度等弹窗「打不开」。
 */
const open = signal(false);
const openNoFooter = signal(false);
const openNoTitle = signal(false);
const openNoClosable = signal(false);
const openNoMaskClose = signal(false);
/** 无遮罩：`mask={false}`，需按钮或 Esc 关闭 */
const openNoMask = signal(false);
const openWidth = signal(false);
/**
 * 预设宽度：单一对象 signal 一次写入 `{ open, preset }`。
 * `open` / `width` / `title` 用零参 getter；正文普通写即可（勿只传 `width={sig.value}` 快照）。
 */
const widthPresetDemo = signal<{
  open: boolean;
  preset: "xs" | "sm" | "md" | "lg" | "xl";
}>({
  open: false,
  preset: "md",
});
const openNotCentered = signal(false);
const openDestroy = signal(false);
const openDraggable = signal(false);
const openFullscreen = signal(false);
/** `fullscreen`：每次打开即为全屏布局 */
const openFullscreenInitial = signal(false);
const openKeyboard = signal(false);
const openCustomClass = signal(false);

export default function FeedbackModal() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Modal 模态弹窗</Title>
        <Paragraph class="mt-2">
          模态弹窗：遮罩、标题、内容、底部；支持关闭按钮、点击遮罩关闭；默认不按
          Esc 关闭，传 keyboard 可启用 Esc；自定义宽度与
          footer、居中/顶部对齐、关闭后销毁、自定义样式。使用 Tailwind v4，支持
          light/dark 主题。本页示例的{" "}
          <code class="rounded bg-slate-200/80 px-1 font-mono text-xs dark:bg-slate-600/80">
            open
          </code>{" "}
          等均在模块级创建，避免文档路由重跑后按钮无效。
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
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            open / onClose / title / children / footer
          </Paragraph>
          <div class="flex gap-2">
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                open.value = true;
              }}
            >
              打开 Modal
            </Button>
          </div>
          <Modal
            open={open}
            onClose={() => open.value = false}
            title="弹窗标题"
            footer={
              <>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => open.value = false}
                >
                  确定
                </Button>
                <Button
                  type="button"
                  variant="default"
                  onClick={() => open.value = false}
                >
                  取消
                </Button>
              </>
            }
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              这里是弹层内容区域，可放置表单、说明或自定义节点。
            </p>
          </Modal>
          <CodeBlock
            title="代码示例"
            code={`<Modal
  open={open}
  onClose={() => open.value = false}
  title="弹窗标题"
  footer={
    <>
      <Button type="button" variant="primary" onClick={() => open.value = false}>
        确定
      </Button>
      <Button type="button" variant="default" onClick={() => open.value = false}>
        取消
      </Button>
    </>
  }
>
  <p>弹层内容</p>
</Modal>`}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>无 Footer</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            不传 footer 或 footer=null 时不显示底部区域。
          </Paragraph>
          <div class="flex gap-2">
            <Button
              type="button"
              variant="default"
              onClick={() => openNoFooter.value = true}
            >
              无 Footer Modal
            </Button>
          </div>
          <Modal
            open={openNoFooter}
            onClose={() => openNoFooter.value = false}
            title="仅标题与内容"
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              不传 footer 时不显示底部按钮区。
            </p>
          </Modal>
          <CodeBlock
            title="代码示例"
            code={`<Modal
  open={openNoFooter}
  onClose={...}
  title="仅标题与内容"
>
  <p>内容</p>
</Modal>`}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>无标题</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            title 传 null 或空字符串时不显示标题栏，closable
            时关闭按钮在右上角。
          </Paragraph>
          <div class="flex gap-2">
            <Button
              type="button"
              variant="default"
              onClick={() => openNoTitle.value = true}
            >
              无标题 Modal
            </Button>
          </div>
          <Modal
            open={openNoTitle}
            onClose={() => openNoTitle.value = false}
            title={null}
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              无标题栏，仅内容与关闭按钮。
            </p>
          </Modal>
          <CodeBlock
            title="代码示例"
            code={`<Modal
  open={openNoTitle}
  onClose={...}
  title={null}
>
  <p>内容</p>
</Modal>`}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        {/* 4. closable={false} */}
        <section class="space-y-2">
          <Title level={2}>无关闭按钮</Title>
          <Paragraph>
            closable=false 时不显示右上角关闭按钮，需通过遮罩关闭。
          </Paragraph>
          <div class="flex gap-2">
            <Button
              type="button"
              variant="default"
              onClick={() => openNoClosable.value = true}
            >
              无关闭按钮
            </Button>
          </div>
          <Modal
            open={openNoClosable}
            onClose={() => openNoClosable.value = false}
            title="只能点遮罩关闭"
            closable={false}
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              未显示关闭按钮，请点击遮罩关闭。
            </p>
          </Modal>
        </section>

        <div class="space-y-4">
          <Title level={3}>点击遮罩不关闭</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            maskClosable=false 时点击遮罩不会触发 onClose。
          </Paragraph>
          <div class="flex gap-2">
            <Button
              type="button"
              variant="default"
              onClick={() => openNoMaskClose.value = true}
            >
              遮罩不可关闭
            </Button>
          </div>
          <Modal
            open={openNoMaskClose}
            onClose={() => openNoMaskClose.value = false}
            title="点击遮罩不关闭"
            maskClosable={false}
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              只能通过关闭按钮关闭。
            </p>
          </Modal>
          <CodeBlock
            title="代码示例"
            code={`<Modal
  ...
  maskClosable={false}
>
  ...
</Modal>`}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>无遮罩</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            传{" "}
            <code class="rounded bg-slate-200/80 px-1 font-mono text-xs dark:bg-slate-600/80">
              mask=&#123;false&#125;
            </code>{" "}
            不渲染遮罩层，背后可点击；宜配合{" "}
            <code class="rounded bg-slate-200/80 px-1 font-mono text-xs dark:bg-slate-600/80">
              keyboard
            </code>{" "}
            与关闭按钮。若仅要透明暗底仍占位，可保留默认 mask 并用{" "}
            <code class="rounded bg-slate-200/80 px-1 font-mono text-xs dark:bg-slate-600/80">
              maskClass
            </code>
            。
          </Paragraph>
          <div class="flex gap-2">
            <Button
              type="button"
              variant="default"
              onClick={() => openNoMask.value = true}
            >
              打开无遮罩 Modal
            </Button>
          </div>
          <Modal
            open={openNoMask}
            onClose={() => openNoMask.value = false}
            title="无遮罩"
            mask={false}
            keyboard
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              无遮罩层，可看到背后文档；请点右上角关闭或按 Esc。
            </p>
          </Modal>
          <CodeBlock
            title="代码示例"
            code={`<Modal
  open={open}
  onClose={() => open.value = false}
  title="无遮罩"
  mask={false}
  keyboard
>
  <p>无暗色底，请用关闭按钮或 Esc</p>
</Modal>`}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>自定义宽度</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            {`width 支持预设 xs/sm/md/lg/xl（400/520/640/800/960px）、字符串（如 "80%"、"400px"）或数字（视为 px）。须用 width={() => …}、title={() => …} 与 signal 同步；正文可照常写 <p>…</p>，只有「不关弹窗、连续切换预设还要改正文」时才需要 children={() => …}。`}
          </Paragraph>
          <div class="flex flex-wrap gap-2">
            <span class="text-sm text-slate-600 dark:text-slate-400 self-center mr-1">
              预设：
            </span>
            {(["xs", "sm", "md", "lg", "xl"] as const).map((w) => (
              <span key={w} class="contents">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    // 一次写入 open + preset，避免分两路 signal 时「已打开仍用上一档 width」的竞态
                    widthPresetDemo.value = { open: true, preset: w };
                  }}
                >
                  {w}
                </Button>
              </span>
            ))}
            <Button
              type="button"
              variant="default"
              onClick={() => openWidth.value = true}
            >
              80%
            </Button>
          </div>
          <Modal
            open={() => widthPresetDemo.value.open}
            onClose={() => {
              widthPresetDemo.value = {
                ...widthPresetDemo.value,
                open: false,
              };
            }}
            title={() => `宽度 ${widthPresetDemo.value.preset}`}
            width={() => widthPresetDemo.value.preset}
            footer={
              <>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    widthPresetDemo.value = {
                      ...widthPresetDemo.value,
                      open: false,
                    };
                  }}
                >
                  确定
                </Button>
                <Button
                  type="button"
                  variant="default"
                  onClick={() => {
                    widthPresetDemo.value = {
                      ...widthPresetDemo.value,
                      open: false,
                    };
                  }}
                >
                  取消
                </Button>
              </>
            }
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              width="{widthPresetDemo.value.preset}"：xs 400px / sm 520px / md
              640px / lg 800px / xl 960px。
            </p>
          </Modal>
          <Modal
            open={openWidth}
            onClose={() => openWidth.value = false}
            title="宽度 80%"
            width="80%"
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              width="80%" 时弹层占视口宽度 80%。
            </p>
          </Modal>
          <CodeBlock
            title="代码示例（预设）"
            code={`import { signal } from "@preact/signals";
// 页面会重跑时请把 demo 放在模块级，勿在组件函数内每次 new
const demo = signal({
  open: false,
  preset: "md" as "xs" | "sm" | "md" | "lg" | "xl",
});
demo.value = { open: true, preset: "lg" };
<Modal
  open={() => demo.value.open}
  onClose={() => { demo.value = { ...demo.value, open: false }; }}
  title={() => \`宽度 \${demo.value.preset}\`}
  width={() => demo.value.preset}
>
  <p>正文可静态写；宽度与标题已由 getter 同步</p>
</Modal>`}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
          <CodeBlock
            title="代码示例（百分比）"
            code={`<Modal
  open={open}
  onClose={() => { open.value = false; }}
  title="宽度 80%"
  width="80%"
>
  <p>占视口宽度 80%</p>
</Modal>`}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>不垂直居中</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            传{" "}
            <code class="rounded bg-slate-200/80 px-1 font-mono text-xs dark:bg-slate-600/80">
              centered=&#123;false&#125;
            </code>{" "}
            使弹层靠上（内置顶距）；仍可用{" "}
            <code class="rounded bg-slate-200/80 px-1 font-mono text-xs dark:bg-slate-600/80">
              wrapClass
            </code>{" "}
            微调。
          </Paragraph>
          <div class="flex gap-2">
            <Button
              type="button"
              variant="default"
              onClick={() => openNotCentered.value = true}
            >
              顶部对齐
            </Button>
          </div>
          <Modal
            open={openNotCentered}
            onClose={() => openNotCentered.value = false}
            title="顶部对齐"
            centered={false}
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              弹层在视口上方，非垂直居中。
            </p>
          </Modal>
          <CodeBlock
            title="代码示例"
            code={`<Modal
  open={open}
  onClose={() => open.value = false}
  title="顶部对齐"
  centered={false}
>
  <p>靠上展示</p>
</Modal>`}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        {/* 8. destroyOnClose={true} */}
        <section class="space-y-2">
          <Title level={2}>关闭后销毁</Title>
          <Paragraph>
            destroyOnClose=true 时关闭后子节点不挂载，再次打开为全新挂载。
          </Paragraph>
          <div class="flex gap-2">
            <Button
              type="button"
              variant="default"
              onClick={() => openDestroy.value = true}
            >
              关闭后销毁
            </Button>
          </div>
          <Modal
            open={openDestroy}
            onClose={() => openDestroy.value = false}
            title="关闭后销毁内容"
            destroyOnClose
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              关闭后此内容会被销毁，再次打开会重新挂载。
            </p>
          </Modal>
        </section>

        <div class="space-y-4">
          <Title level={3}>可移动</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            draggable=true 时可通过拖拽标题栏移动弹层位置。
          </Paragraph>
          <div class="flex gap-2">
            <Button
              type="button"
              variant="default"
              onClick={() => openDraggable.value = true}
            >
              可移动弹窗
            </Button>
          </div>
          <Modal
            open={openDraggable}
            onClose={() => openDraggable.value = false}
            title="可拖拽标题栏移动"
            draggable
            footer={
              <>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => openDraggable.value = false}
                >
                  确定
                </Button>
                <Button
                  type="button"
                  variant="default"
                  onClick={() => openDraggable.value = false}
                >
                  取消
                </Button>
              </>
            }
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              拖拽上方标题栏可移动弹层位置。
            </p>
          </Modal>
          <CodeBlock
            title="代码示例"
            code={`<Modal
  open={open}
  onClose={...}
  title="可拖拽标题栏移动"
  draggable
>
  <p>拖拽上方标题栏可移动弹层位置。</p>
</Modal>`}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>支持 ESC</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            默认 keyboard 为 false，不按 Esc 关闭；需要时加上属性{" "}
            <code class="rounded bg-slate-200/80 px-1 font-mono text-xs dark:bg-slate-600/80">
              keyboard
            </code>
            （布尔简写，等同 true）或显式{" "}
            <code class="rounded bg-slate-200/80 px-1 font-mono text-xs dark:bg-slate-600/80">
              {"keyboard={true}"}
            </code>
            ，按 Esc 触发 onClose。
          </Paragraph>
          <div class="flex gap-2">
            <Button
              type="button"
              variant="default"
              onClick={() => openKeyboard.value = true}
            >
              按 Esc 关闭
            </Button>
          </div>
          <Modal
            open={openKeyboard}
            onClose={() => openKeyboard.value = false}
            title="按 Esc 可关闭"
            keyboard
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              打开后按键盘 Esc 可关闭此弹窗。
            </p>
          </Modal>
          <CodeBlock
            title="代码示例"
            code={`<Modal
  open={open}
  onClose={...}
  title="按 Esc 可关闭"
  keyboard
>
  <p>打开后按键盘 Esc 可关闭此弹窗。</p>
</Modal>`}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>全屏</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            <code class="rounded bg-slate-200/80 px-1 font-mono text-xs dark:bg-slate-600/80">
              fullscreenable
            </code>{" "}
            为 true 时标题栏显示全屏切换按钮；{" "}
            <code class="rounded bg-slate-200/80 px-1 font-mono text-xs dark:bg-slate-600/80">
              fullscreen
            </code>{" "}
            为 true 时每次打开即为全屏布局，关闭后重置。
          </Paragraph>
          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="default"
              onClick={() => openFullscreen.value = true}
            >
              可全屏（标题栏切换）
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => openFullscreenInitial.value = true}
            >
              打开即全屏
            </Button>
          </div>
          <Modal
            open={openFullscreen}
            onClose={() => openFullscreen.value = false}
            title="可全屏"
            fullscreenable
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              点击标题栏右侧按钮可进入/退出全屏。
            </p>
          </Modal>
          <Modal
            open={openFullscreenInitial}
            onClose={() => openFullscreenInitial.value = false}
            title="打开即全屏"
            fullscreen
            fullscreenable
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              打开时已是全屏，仍可用标题栏按钮退出全屏。
            </p>
          </Modal>
          <CodeBlock
            title="代码示例"
            code={`<!-- 标题栏切换 -->
<Modal open={open} onClose={...} title="可全屏" fullscreenable>
  <p>点标题栏按钮切换全屏</p>
</Modal>
<!-- 每次打开即为全屏 -->
<Modal open={open2} onClose={...} title="打开即全屏" fullscreen fullscreenable>
  <p>关闭后再开仍从全屏起</p>
</Modal>`}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>自定义样式</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            maskClass、wrapClass、bodyClass、class
            可扩展遮罩、容器、内容区、弹层盒子样式。
          </Paragraph>
          <div class="flex gap-2">
            <Button
              type="button"
              variant="default"
              onClick={() => openCustomClass.value = true}
            >
              自定义 class
            </Button>
          </div>
          <Modal
            open={openCustomClass}
            onClose={() => openCustomClass.value = false}
            title="自定义样式"
            class="ring-2 ring-blue-500"
            bodyClass="bg-slate-50 dark:bg-slate-800/50"
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              弹层加了 ring，内容区加了背景色（bodyClass）。
            </p>
          </Modal>
          <CodeBlock
            title="代码示例"
            code={`<Modal
  ...
  class="ring-2 ring-blue-500"
  bodyClass="bg-slate-50"
>
  ...
</Modal>`}
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
              {MODAL_API.map((row) => (
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
