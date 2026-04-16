/**
 * BottomSheet 文档页（概述、引入、示例、API）。路由: /mobile/feedback/bottom-sheet
 */

import { BottomSheet, MobilePortalHostScope } from "@dreamer/ui-preact/mobile";
import { Button, CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";
import {
  DocsApiTable,
  type DocsApiTableRow,
} from "../../../components/DocsApiTable.tsx";
import { MobileDocDemo } from "../../../components/MobileDocDemo.tsx";

/** BottomSheet 主 props API */
const BOTTOM_SHEET_API: DocsApiTableRow[] = [
  {
    name: "open",
    type: "Signal | () => boolean",
    default: "-",
    description:
      "是否打开；须 `open={sig}` 或 `open={() => sig()}`，勿仅传 `sig.value`（Hybrid 下可能不更新）",
  },
  {
    name: "title",
    type: "string",
    default: "-",
    description: "标题栏文案",
  },
  {
    name: "onClose",
    type: "() => void",
    default: "-",
    description: "关闭时回调（遮罩、关闭按钮）",
  },
  {
    name: "heightMode",
    type: `"half" | "full" | number`,
    default: "half",
    description:
      "half：固定约 50% 锚点/视口高度（内容多时在面板内滚动）；full：铺满；number：仅 max-height（px），高度随内容至上限",
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
    description: "关闭时是否卸载子树",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "根容器（遮罩+面板）额外 class",
  },
  {
    name: "panelClass",
    type: "string",
    default: "-",
    description: "面板内容区额外 class",
  },
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "面板内子内容",
  },
];

const importCode = `import { BottomSheet } from "@dreamer/ui-preact/mobile";
import { signal } from "@preact/signals";

const open = signal(false);

<BottomSheet
  open={open}
  onClose={() => (open.value = false)}
  title="标题"
  heightMode="half"
>
  内容
</BottomSheet>`;

const exampleHalf = `<BottomSheet
  open={open}
  onClose={() => (open.value = false)}
  title="示例标题"
  heightMode="half"
>
  <p>面板内容</p>
</BottomSheet>`;

const exampleFull = `<BottomSheet
  open={open}
  onClose={() => (open.value = false)}
  title="全屏"
  heightMode="full"
>
  全屏内容
</BottomSheet>`;

const examplePortalScope = `import {
  BottomSheet,
  MobilePortalHostScope,
} from "@dreamer/ui-preact/mobile";

/** 在嵌入容器内：浮层 Portal 到 Scope 锚点，而非整页 body */
<MobilePortalHostScope class="min-h-[200px]">
  <Button type="button" onClick={() => (open.value = true)}>打开</Button>
  <BottomSheet open={open} onClose={() => (open.value = false)} title="机内">
    遮罩限制在本容器内
  </BottomSheet>
</MobilePortalHostScope>`;

export default function MobileBottomSheetDoc() {
  const open = signal(false);
  const openFull = signal(false);
  const openScoped = signal(false);

  return (
    <div class="w-full max-w-3xl space-y-10">
      <section>
        <Title level={1}>BottomSheet 底部抽屉</Title>
        <Paragraph class="mt-2">
          自底部滑出的半屏/全屏面板，用于表单、详情、列表等移动场景。与桌面{" "}
          <code class="text-sm">Modal</code> /{" "}
          <code class="text-sm">Drawer</code> 一致使用{" "}
          <code class="text-sm">open</code> 受控（Signal）。默认 Portal 到{" "}
          <code class="text-sm">document.body</code>；若在{" "}
          <code class="text-sm">MobilePortalHostScope</code>{" "}
          内则挂到机内锚点，避免被业务根 <code class="text-sm">overflow</code>
          {" "}
          裁切。
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
          <Title level={3}>半屏（heightMode=&quot;half&quot;）</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            未包 MobilePortalHostScope 时，遮罩会盖满浏览器视口。
          </Paragraph>
          <MobileDocDemo>
            <Button type="button" onClick={() => (open.value = true)}>
              打开 BottomSheet
            </Button>
            <BottomSheet
              open={open}
              onClose={() => (open.value = false)}
              title="示例标题"
              heightMode="half"
            >
              <Paragraph>面板内容区域，可放表单或列表。</Paragraph>
            </BottomSheet>
          </MobileDocDemo>
          <CodeBlock
            title="代码示例"
            code={exampleHalf}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>全屏（heightMode=&quot;full&quot;）</Title>
          <MobileDocDemo>
            <Button type="button" onClick={() => (openFull.value = true)}>
              打开全屏
            </Button>
            <BottomSheet
              open={openFull}
              onClose={() => (openFull.value = false)}
              title="全屏示例"
              heightMode="full"
            >
              <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
                全屏高度占满可视区域。
              </Paragraph>
            </BottomSheet>
          </MobileDocDemo>
          <CodeBlock
            title="代码示例"
            code={exampleFull}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>MobilePortalHostScope（机内 Portal）</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            内嵌预览时用 Scope 包住内容，BottomSheet
            遮罩与面板相对于该容器铺满。
          </Paragraph>
          <MobileDocDemo class="flex min-h-[220px] flex-col p-4">
            <MobilePortalHostScope class="flex min-h-0 flex-1 flex-col">
              <Button type="button" onClick={() => (openScoped.value = true)}>
                机内打开
              </Button>
              <BottomSheet
                open={openScoped}
                onClose={() => (openScoped.value = false)}
                title="机内抽屉"
                heightMode="half"
              >
                <Paragraph class="text-sm">遮罩限制在 Scope 容器内。</Paragraph>
              </BottomSheet>
            </MobilePortalHostScope>
          </MobileDocDemo>
          <CodeBlock
            title="代码示例"
            code={examplePortalScope}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>
      </section>

      <section class="space-y-4">
        <Title level={2}>API</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          组件接收以下属性（均为可选，除交互上通常需配置{" "}
          <code class="text-sm">open</code>）。
        </Paragraph>
        <DocsApiTable rows={BOTTOM_SHEET_API} />
      </section>
    </div>
  );
}
