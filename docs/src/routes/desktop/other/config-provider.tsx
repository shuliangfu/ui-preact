/**
 * ConfigProvider 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/other/config-provider
 */

import { signal } from "@preact/signals";
import {
  Button,
  CodeBlock,
  ConfigProvider,
  getConfig,
  Paragraph,
  Title,
} from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const CONFIG_PROVIDER_API: ApiRow[] = [
  {
    name: "theme",
    type: "light | dark | system",
    default: "light",
    description: "主题；system 依 prefers-color-scheme",
  },
  {
    name: "locale",
    type: "string",
    default: "-",
    description: "语言/地区，如 zh-CN、en-US",
  },
  {
    name: "componentSize",
    type: "SizeVariant",
    default: "-",
    description: "组件默认尺寸",
  },
  {
    name: "prefixCls",
    type: "string",
    default: "-",
    description: "自定义 class 前缀",
  },
  { name: "children", type: "unknown", default: "-", description: "子节点" },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "包装 div 的 class",
  },
];

const importCode =
  `import { ConfigProvider, getConfig } from "@dreamer/ui-preact";

<ConfigProvider
  theme="light"
  locale="zh-CN"
  componentSize="md"
>
  <div>子树内组件可通过 getConfig() 读取 theme、locale、componentSize、prefixCls</div>
</ConfigProvider>`;

const exampleThemeLocale = `<ConfigProvider
  theme={theme.value}
  locale="zh-CN"
  componentSize="md"
>
  <div class="...">子树内（受 ConfigProvider 包裹）</div>
</ConfigProvider>`;

const exampleGetConfig =
  `子树外 getConfig(): theme={getConfig().theme ?? "-"}, locale={getConfig().locale ?? "-"}, componentSize={getConfig().componentSize ?? "-"}`;

export default function OtherConfigProvider() {
  const theme = signal<"light" | "dark">("light");

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>ConfigProvider 全局配置</Title>
        <Paragraph class="mt-2">
          全局配置：theme（light/dark/system）、locale、componentSize、prefixCls、children、class；子树内通过
          getConfig() 读取 theme、locale、componentSize、prefixCls。 使用
          Tailwind v4，支持 light/dark 主题。
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
          <Title level={3}>theme / locale / componentSize</Title>
          <div class="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => {
                const t = theme.value;
                theme.value = t === "light" ? "dark" : "light";
              }}
            >
              切换 theme（当前: {theme.value}）
            </Button>
          </div>
          <ConfigProvider theme={theme.value} locale="zh-CN" componentSize="md">
            <div class="rounded-lg border border-slate-200 dark:border-slate-600 p-4 space-y-3">
              <p class="text-sm font-medium">
                子树内（受 ConfigProvider 包裹）
              </p>
              <p class="text-sm text-slate-500">
                当前 theme={theme
                  .value}、locale=zh-CN、componentSize=md；子树内组件可
                getConfig() 读取。
              </p>
              <Button type="button" size="sm">小按钮</Button>
            </div>
          </ConfigProvider>
          <CodeBlock
            title="代码示例"
            code={exampleThemeLocale}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>getConfig()</Title>
          <div class="rounded-lg border border-slate-200 dark:border-slate-600 p-4">
            <p class="text-sm text-slate-500">
              子树外 getConfig(): theme={getConfig().theme ?? "-"},
              locale={getConfig().locale ?? "-"},
              componentSize={getConfig().componentSize ?? "-"}
            </p>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleGetConfig}
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
              {CONFIG_PROVIDER_API.map((row) => (
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
