/**
 * NavBar 文档页（概述、引入、示例、API）。路由: /mobile/navigation/navbar
 */

import { NavBar } from "@dreamer/ui-preact/mobile";
import { CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";
import {
  DocsApiTable,
  type DocsApiTableRow,
} from "../../../components/DocsApiTable.tsx";
import { MobileDocDemo } from "../../../components/MobileDocDemo.tsx";

const NAV_BAR_API: DocsApiTableRow[] = [
  {
    name: "title",
    type: "string | null",
    default: "-",
    description: "居中标题",
  },
  {
    name: "leftText",
    type: "string | null",
    default: "-",
    description: "左侧文案（常与 leftArrow 同用）",
  },
  {
    name: "rightText",
    type: "string | null",
    default: "-",
    description: "右侧文案",
  },
  {
    name: "leftArrow",
    type: "boolean",
    default: "false",
    description: "是否显示左侧返回箭头",
  },
  {
    name: "left",
    type: "ComponentChildren",
    default: "-",
    description: "左侧自定义区（覆盖 leftText/leftArrow）",
  },
  {
    name: "right",
    type: "ComponentChildren",
    default: "-",
    description: "右侧自定义区（覆盖 rightText）",
  },
  {
    name: "onClickLeft",
    type: "() => void",
    default: "-",
    description: "左侧点击",
  },
  {
    name: "onClickRight",
    type: "() => void",
    default: "-",
    description: "右侧点击",
  },
  {
    name: "leftDisabled",
    type: "boolean",
    default: "false",
    description: "左侧禁用态",
  },
  {
    name: "rightDisabled",
    type: "boolean",
    default: "false",
    description: "右侧禁用态",
  },
  {
    name: "fixed",
    type: "boolean",
    default: "false",
    description: "是否 fixed 贴顶",
  },
  {
    name: "placeholder",
    type: "boolean",
    default: "false",
    description: "fixed 时是否在文档流插入等高占位，避免内容被挡",
  },
  {
    name: "safeAreaInsetTop",
    type: "boolean",
    default: "false",
    description: "顶部安全区（刘海屏）",
  },
  {
    name: "border",
    type: "boolean",
    default: "true",
    description: "底部分割线",
  },
  {
    name: "zIndex",
    type: "number",
    default: "1",
    description: "fixed 时 style.zIndex",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "顶栏根节点 class",
  },
];

const importCode = `import { NavBar } from "@dreamer/ui-preact/mobile";

<NavBar
  title="页面标题"
  leftText="返回"
  leftArrow
  rightText="操作"
  onClickLeft={() => globalThis.history.back()}
  onClickRight={() => {}}
/>`;

export default function MobileNavBarDoc() {
  return (
    <div class="w-full max-w-3xl space-y-10">
      <section>
        <Title level={1}>NavBar 顶栏</Title>
        <Paragraph class="mt-2">
          移动端页面顶部导航：居中标题、左右操作区；支持固定顶栏与安全区。与桌面顶栏组件不同，专为单手触控与返回栈设计。
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
          <Title level={3}>基础（非 fixed）</Title>
          <MobileDocDemo class="overflow-hidden p-0">
            <NavBar
              title="页面标题"
              leftText="返回"
              leftArrow
              rightText="操作"
              onClickLeft={() => globalThis.history.back()}
              onClickRight={() => {}}
              border
            />
            <div class="p-4 text-sm text-slate-500 dark:text-slate-400">
              下方为页面内容区示意
            </div>
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
          <Title level={3}>fixed + placeholder</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            顶栏固定时开启{" "}
            <code class="text-sm">
              placeholder
            </code>，在流式布局中插入等高占位，避免首屏内容被遮挡。 真机页面上
            {" "}
            <code class="text-sm">fixed</code> 相对视口；文档站用带{" "}
            <code class="text-sm">transform</code>{" "}
            的容器包住示例，避免顶栏盖住整站正文。
          </Paragraph>
          <MobileDocDemo class="relative isolate min-h-[220px] overflow-hidden p-0 [transform:translateZ(0)]">
            <NavBar
              title="固定顶栏"
              leftArrow
              leftText="返回"
              fixed
              placeholder
              onClickLeft={() => globalThis.history.back()}
            />
            <div class="p-4 text-sm text-slate-600 dark:text-slate-400">
              正文从占位下方开始，不被 NavBar 盖住。
            </div>
          </MobileDocDemo>
        </div>
      </section>

      <section class="space-y-4">
        <Title level={2}>API</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          属性均为可选；无左右区时仅显示标题。
        </Paragraph>
        <DocsApiTable rows={NAV_BAR_API} />
      </section>
    </div>
  );
}
