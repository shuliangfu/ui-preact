/**
 * BackTop 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/other/back-top
 */

import { signal } from "@preact/signals";
import { BackTop, CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const BACK_TOP_API: ApiRow[] = [
  {
    name: "visibilityHeight",
    type: "number",
    default: "200",
    description: "滚动超过该高度（px）后显示按钮",
  },
  {
    name: "target",
    type: "BackTopTarget",
    default: "-",
    description: "滚动容器；不传则使用 window",
  },
  {
    name: "visible",
    type: "boolean",
    default: "-",
    description: "是否显示（受控）",
  },
  {
    name: "onVisibilityChange",
    type: "(visible: boolean) => void",
    default: "-",
    description: "显示/隐藏变化回调",
  },
  {
    name: "onClick",
    type: "() => void",
    default: "-",
    description: "点击时先调用；之后仍会平滑滚顶（可与埋点等共用）",
  },
  {
    name: "right",
    type: "number",
    default: "24",
    description: "距离视口右侧（px）",
  },
  {
    name: "bottom",
    type: "number",
    default: "24",
    description: "距离视口底部（px）",
  },
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "自定义按钮内容",
  },
  { name: "class", type: "string", default: "-", description: "按钮 class" },
];

const importCode = `import { signal } from "@preact/signals";
import { BackTop } from "@dreamer/ui-preact";

const visible = signal(false);
<BackTop
  visibilityHeight={200}
  visible={visible.value}
  onVisibilityChange={(v) => visible.value = v}
  right={24}
  bottom={24}
/>`;

const exampleDefault = `<BackTop
  visibilityHeight={200}
  visible={visible.value}
  onVisibilityChange={(v) => visible.value = v}
  right={24}
  bottom={24}
/>`;

/** 不传 children 时使用内置箭头图标，仅调整显示阈值与位置 */
const examplePosition = `<BackTop
  visibilityHeight={150}
  right={24}
  bottom={80}
/>`;

export default function OtherBackTop() {
  const visible = signal(false);

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>BackTop 回到顶部</Title>
        <Paragraph class="mt-2">
          回到顶部：visibilityHeight、target、visible、onVisibilityChange、onClick（先回调再滚顶）、right、bottom、children（自定义按钮）、class。
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
          <Title level={3}>默认用法</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            向下滚动后，右下角会出现回到顶部按钮（visibilityHeight=200、right/bottom=24）。
          </Paragraph>
          <div class="space-y-4">
            <div class="h-28 rounded-lg bg-slate-100 dark:bg-slate-700 p-4">
              占位内容 1
            </div>
            <div class="h-28 rounded-lg bg-slate-100 dark:bg-slate-700 p-4">
              占位内容 2
            </div>
            <div class="h-28 rounded-lg bg-slate-100 dark:bg-slate-700 p-4">
              占位内容 3
            </div>
          </div>
          <BackTop
            visibilityHeight={200}
            visible={visible.value}
            onVisibilityChange={(v) => visible.value = v}
            right={24}
            bottom={24}
          />
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
          <Title level={3}>自定义位置</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            不传 children 时使用内置箭头图标，直接配置
            visibilityHeight、right、bottom 即可。
          </Paragraph>
          <div class="space-y-2">
            <div class="h-20 rounded-lg bg-slate-100 dark:bg-slate-700 p-3">
              占位滚动区 1
            </div>
            <div class="h-20 rounded-lg bg-slate-100 dark:bg-slate-700 p-3">
              占位滚动区 2
            </div>
          </div>
          <BackTop visibilityHeight={150} right={24} bottom={80} />
          <CodeBlock
            title="代码示例"
            code={examplePosition}
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
          组件接收以下属性。
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
              {BACK_TOP_API.map((row) => (
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
