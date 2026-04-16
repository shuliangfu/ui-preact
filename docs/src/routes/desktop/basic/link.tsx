/**
 * Link 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/basic/link
 */

import { CodeBlock, Link, Paragraph, Title } from "@dreamer/ui-preact";

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const LINK_API: ApiRow[] = [
  {
    name: "href",
    type: "string",
    default: "-",
    description: "链接地址（必填）",
  },
  {
    name: "target",
    type: "_blank | _self | _parent | _top",
    default: "-",
    description: "是否新窗口打开",
  },
  {
    name: "rel",
    type: "string",
    default: "target=_blank 时为 noopener noreferrer",
    description: "rel 属性，新窗口建议加 noopener noreferrer",
  },
  {
    name: "title",
    type: "string",
    default: "-",
    description: "悬停提示（原生 title）",
  },
  {
    name: "aria-label",
    type: "string",
    default: "-",
    description: "无障碍标签",
  },
  {
    name: "underline",
    type: "boolean",
    default: "false",
    description:
      "为 true 时鼠标悬停显示下划线；默认 false（常态与悬停均无下划线；文字链与 button 模式均适用）",
  },
  {
    name: "button",
    type: "boolean",
    default: "false",
    description:
      "为 true 时渲染链接按钮（与 Button 同源 variant/size 类名，仍用 <a href>）",
  },
  {
    name: "variant",
    type: "ColorVariant",
    default: "button 模式下 primary",
    description: "链接按钮语义配色；仅 button=true 时参与合并",
  },
  {
    name: "size",
    type: "SizeVariant",
    default: "button 模式下 md",
    description: "链接按钮尺寸；仅 button=true 时参与合并",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "禁用（阻止导航，建议仅在链接按钮上使用）",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "额外 class，与 Tailwind 合并",
  },
  {
    name: "onClick",
    type: "(e: Event) => void",
    default: "-",
    description: "点击回调",
  },
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "链接文案或子节点",
  },
];

const importCode = `import { Link } from "@dreamer/ui-preact";

<Link href="/desktop">返回桌面</Link>`;

const exampleDefault = `<Link href="/desktop">返回桌面</Link>`;

const exampleTarget = `<Link
  href="https://jsr.io"
  target="_blank"
  rel="noopener noreferrer"
  title="打开 JSR 官网"
>
  JSR 新窗口打开
</Link>`;

const exampleClass =
  `<Link href="/desktop" class="text-green-600 font-semibold">
  绿色加粗链接
</Link>`;

const exampleUnderline = `<Link href="/desktop" underline>
  带下划线的链接
</Link>`;

const exampleLinkButton =
  `<Link href="/desktop" button variant="primary" size="md">
  链接按钮（主色）
</Link>`;

export default function BasicLink() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Link 链接</Title>
        <Paragraph class="mt-2">
          {"基于 <a> 的链接组件，支持 href、target、rel、title、class、onClick 等，适用于导航、外链。使用 Tailwind v4，支持 light/dark 主题。"}
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
          <Title level={3}>默认</Title>
          <p>
            <Link href="/desktop">返回桌面</Link>
          </p>
          <CodeBlock
            title="代码示例"
            code={exampleDefault}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>新窗口 target / rel</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            新窗口打开建议加 rel="noopener noreferrer"；title 为悬停提示。
          </Paragraph>
          <p>
            <Link
              href="https://jsr.io"
              target="_blank"
              rel="noopener noreferrer"
              title="打开 JSR 官网"
            >
              JSR 新窗口打开
            </Link>
          </p>
          <CodeBlock
            title="代码示例"
            code={exampleTarget}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>自定义 class</Title>
          <p>
            <Link href="/desktop" class="text-green-600 font-semibold">
              绿色加粗链接
            </Link>
          </p>
          <CodeBlock
            title="代码示例"
            code={exampleClass}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>underline（下划线）</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            默认常态与悬停都无下划线；传 <code class="text-xs">underline</code>
            {" "}
            后仅在鼠标移上时显示下划线（文字链与{" "}
            <code class="text-xs">button</code> 模式均适用）。
          </Paragraph>
          <p class="flex flex-wrap items-center gap-4">
            <Link href="/desktop">默认（无下划线）</Link>
            <Link href="/desktop" underline>
              underline
            </Link>
          </p>
          <CodeBlock
            title="代码示例"
            code={exampleUnderline}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>链接按钮 button + variant + size</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            与 Button 共用 ColorVariant / SizeVariant；可用 class
            覆盖配色（如品牌色）。
          </Paragraph>
          <p class="flex flex-wrap items-center gap-3">
            <Link href="/desktop" button variant="primary" size="md">
              主色 md
            </Link>
            <Link href="/desktop" button variant="ghost" size="sm">
              幽灵 sm
            </Link>
          </p>
          <CodeBlock
            title="代码示例"
            code={exampleLinkButton}
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
          组件接收以下属性，href 为必填。
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
              {LINK_API.map((row) => (
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
