/**
 * MobilePortalHostScope 文档页（概述、引入、示例、API）。路由: /mobile/other/mobile-portal-host-scope
 */

import { BottomSheet, MobilePortalHostScope } from "@dreamer/ui-preact/mobile";
import { Button, CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";
import {
  DocsApiTable,
  type DocsApiTableRow,
} from "../../../components/DocsApiTable.tsx";
import { MobileDocDemo } from "../../../components/MobileDocDemo.tsx";

const SCOPE_API: DocsApiTableRow[] = [
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "业务内容 + 其内的 BottomSheet / ActionSheet 等",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description:
      "包裹层 class；建议保留纵向 flex + min-h-0，便于在 flex 布局中占满剩余高度",
  },
];

const importCode = `import {
  BottomSheet,
  MobilePortalHostScope,
} from "@dreamer/ui-preact/mobile";
import { signal } from "@preact/signals";

const open = signal(false);

<MobilePortalHostScope class="min-h-0 flex flex-1 flex-col">
  <button type="button" onClick={() => (open.value = true)}>打开</button>
  <BottomSheet open={open} onClose={() => (open.value = false)} title="机内">
    遮罩相对于本 Scope
  </BottomSheet>
</MobilePortalHostScope>`;

export default function MobilePortalHostScopeDoc() {
  const open = signal(false);

  return (
    <div class="w-full max-w-3xl space-y-10">
      <section>
        <Title level={1}>MobilePortalHostScope 机内 Portal 锚点</Title>
        <Paragraph class="mt-2">
          通过 <code class="text-sm">transform: translateZ(0)</code> 形成{" "}
          <code class="text-sm">position: fixed</code>{" "}
          的包含块，使子树内的 BottomSheet、ActionSheet 等{" "}
          Portal 挂到本容器底部锚点，而不是整页{" "}
          <code class="text-sm">
            document.body
          </code>。适用于文档站手机框、嵌入式预览、分屏内的「机内全屏遮罩」。
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
          <Title level={3}>与 BottomSheet 组合</Title>
          <MobileDocDemo class="flex min-h-[220px] flex-col p-4">
            <MobilePortalHostScope class="flex min-h-0 flex-1 flex-col">
              <Button type="button" onClick={() => (open.value = true)}>
                打开（机内遮罩）
              </Button>
              <BottomSheet
                open={open}
                onClose={() => (open.value = false)}
                title="Portal 在容器内"
                heightMode="half"
              >
                <Paragraph class="text-sm">
                  遮罩与面板限制在 Scope 容器内。
                </Paragraph>
              </BottomSheet>
            </MobilePortalHostScope>
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
      </section>

      <section class="space-y-4">
        <Title level={2}>API</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          另导出 <code class="text-sm">MobilePortalHostContext</code>{" "}
          供高阶用法读取锚点 getter。
        </Paragraph>
        <DocsApiTable rows={SCOPE_API} />
      </section>
    </div>
  );
}
