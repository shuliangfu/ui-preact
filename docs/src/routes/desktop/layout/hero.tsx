/**
 * Hero 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/layout/hero
 */

import { Button, CodeBlock, Hero, Paragraph, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const HERO_API: ApiRow[] = [
  {
    name: "title",
    type: "string | unknown",
    default: "-",
    description: "主标题",
  },
  {
    name: "subtitle",
    type: "string | unknown",
    default: "-",
    description: "副标题",
  },
  {
    name: "description",
    type: "string | unknown",
    default: "-",
    description: "描述文案",
  },
  {
    name: "extra",
    type: "unknown",
    default: "-",
    description: "主操作区（CTA 等）",
  },
  {
    name: "media",
    type: "string | unknown",
    default: "-",
    description: "全幅背景图（URL 或节点，cover 铺满）",
  },
  {
    name: "layout",
    type: "center | left | right",
    default: "center",
    description:
      "居中 / 左（右侧 pr 40% 留白）/ 右（左侧 pl 40%）；块内字与按钮仍居中（同 center）",
  },
  {
    name: "fullScreen",
    type: "boolean",
    default: "false",
    description: "是否全屏高（min-h-screen）",
  },
  {
    name: "background",
    type: "string | unknown",
    default: "-",
    description: "无 media 时为底层背景；与 media 并存时叠在 media 之上",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "最外层 section class",
  },
  {
    name: "contentClass",
    type: "string",
    default: "-",
    description: "文案外包层 class",
  },
  {
    name: "overlayClass",
    type: "string",
    default: "（默认半透明）",
    description: "背景与文案间遮罩；传空字符串可关闭默认遮罩",
  },
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "子节点（extra 下方）",
  },
];

const importCode = `import { Button, Hero } from "@dreamer/ui-preact";

<Hero
  layout="center"
  title="欢迎使用"
  subtitle="副标题"
  description="描述"
  extra={<Button variant="primary">立即开始</Button>}
/>`;

const exampleCenter = `<Hero
  layout="center"
  title="欢迎使用产品"
  subtitle="副标题文案"
  description="这里是描述段落。"
  extra={<><Button variant="primary">立即开始</Button><Button variant="default">了解更多</Button></>}
/>`;

const bgUrl =
  "https://placehold.co/1600x640/334155/94a3b8?text=Hero+Background";

const exampleLeft = `<Hero
  layout="left"
  title="文案左对齐"
  description="整块在左侧区域，字与按钮在块内仍居中（与 center 一致）。"
  extra={<Button variant="primary">主操作</Button>}
  media="${bgUrl}"
/>`;

const exampleRight = `<Hero
  layout="right"
  title="文案右对齐"
  description="整块在右侧区域，块内仍为居中排版。"
  extra={<Button variant="primary">主操作</Button>}
  media="${bgUrl}"
/>`;

export default function LayoutHero() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Hero 英雄区 / 首屏</Title>
        <Paragraph class="mt-2">
          英雄区：`media` 作为**整幅背景**（cover）；`layout`
          只决定文案块在左/中/右：`left` 靠左、右侧约 40%
          留白（`pr-[40%]`）；`right` 靠右、左侧约 40%
          留白（`pl-[40%]`）。块内标题与按钮仍**居中排版**（与 center
          一致）。可与 `background` 叠层、`overlayClass` 控制读字遮罩。使用
          Tailwind v4，支持 light/dark。
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
          <Title level={3}>layout=center（无背景图）</Title>
          <div class="rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
            <Hero
              layout="center"
              title="欢迎使用产品"
              subtitle="副标题文案"
              description="这里是描述段落，可多行说明产品价值或引导操作。"
              extra={
                <>
                  <Button type="button" variant="primary">立即开始</Button>
                  <Button type="button" variant="default">了解更多</Button>
                </>
              }
            />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleCenter}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>layout=left（文案左对齐 + 背景图）</Title>
          <div class="rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
            <Hero
              layout="left"
              title="文案左对齐"
              description="整块在左侧区域，字与按钮在块内仍居中（与 center 一致）。"
              extra={<Button type="button" variant="primary">主操作</Button>}
              media={bgUrl}
            />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleLeft}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>layout=right（文案右对齐 + 背景图）</Title>
          <div class="rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
            <Hero
              layout="right"
              title="文案右对齐"
              description="整块在右侧区域，块内仍为居中排版。"
              extra={<Button type="button" variant="primary">主操作</Button>}
              media={bgUrl}
            />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleRight}
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
          组件接收以下属性，title 常用。
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
              {HERO_API.map((row) => (
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
