/**
 * Avatar 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/basic/avatar
 */

import { Avatar, CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const AVATAR_API: ApiRow[] = [
  {
    name: "size",
    type: "AvatarSize",
    default: "md",
    description:
      "尺寸：xs(32px)、sm(40px)、md(48px)、lg(64px)、xl(80px)、2xl(96px)",
  },
  { name: "src", type: "string", default: "-", description: "图片地址" },
  {
    name: "alt",
    type: "string",
    default: "''",
    description: "图片加载失败时的替代文本（无障碍）",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "额外 class（如边框、阴影）",
  },
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "无 src 时显示内容（如首字）",
  },
];

const importCode = `import { Avatar } from "@dreamer/ui-preact";

<Avatar size="md">张</Avatar>
<Avatar size="lg" src="https://..." alt="用户" />`;

const exampleSize = `<Avatar size="xs">xs</Avatar>
<Avatar size="sm">sm</Avatar>
<Avatar size="md">md</Avatar>
<Avatar size="lg">lg</Avatar>
<Avatar size="xl">xl</Avatar>
<Avatar size="2xl">2xl</Avatar>`;

const exampleChildren = `<Avatar size="md">张</Avatar>
<Avatar size="md">李</Avatar>
<Avatar size="md">王</Avatar>`;

const exampleSrc = `<Avatar
  size="lg"
  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
  alt="Avatar"
/>`;

const exampleClass = `<Avatar
  size="md"
  class="ring-2 ring-blue-500"
>
  A
</Avatar>
<Avatar
  size="md"
  class="ring-2 ring-amber-400 ring-offset-2"
>
  B
</Avatar>`;

export default function BasicAvatar() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Avatar 头像</Title>
        <Paragraph class="mt-2">
          支持 size、src、alt、class；无 src 时用 children（如首字）显示。尺寸共
          6 档。Tailwind v4 + light/dark。
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
          <Title level={3}>size 尺寸</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            共 6 种：xs(32px) / sm(40px) / md(48px) / lg(64px) / xl(80px) /
            2xl(96px)。
          </Paragraph>
          <div class="flex flex-wrap items-end gap-4">
            <Avatar size="xs">xs</Avatar>
            <Avatar size="sm">sm</Avatar>
            <Avatar size="md">md</Avatar>
            <Avatar size="lg">lg</Avatar>
            <Avatar size="xl">xl</Avatar>
            <Avatar size="2xl">2xl</Avatar>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleSize}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>首字（children）</Title>
          <div class="flex flex-wrap gap-3">
            <Avatar size="md">张</Avatar>
            <Avatar size="md">李</Avatar>
            <Avatar size="md">王</Avatar>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleChildren}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>图片 src 与 alt</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            src 为图片地址，alt 为图片加载失败时的替代文本（无障碍）。
          </Paragraph>
          <div class="flex flex-wrap gap-3">
            <Avatar
              size="lg"
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="Avatar"
            />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleSrc}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>class 自定义样式</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            通过 class 可加边框、阴影等。
          </Paragraph>
          <div class="flex flex-wrap gap-3">
            <Avatar size="md" class="ring-2 ring-blue-500">A</Avatar>
            <Avatar size="md" class="ring-2 ring-amber-400 ring-offset-2">
              B
            </Avatar>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleClass}
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
          组件接收以下属性（均为可选）。
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
              {AVATAR_API.map((row) => (
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
