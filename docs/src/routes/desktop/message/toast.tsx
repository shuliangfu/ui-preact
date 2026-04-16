/**
 * Toast 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/message/toast
 */

import { Button, CodeBlock, Paragraph, Title, toast } from "@dreamer/ui-preact";

/** API 方法/属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const TOAST_API: ApiRow[] = [
  {
    name: "toast.success(content, duration?, placement?)",
    type: "void",
    default: "placement 默认 top",
    description:
      "成功轻提示；duration 默认 3000ms，0 表示不自动关闭；placement 为 top | bottom | center",
  },
  {
    name: "toast.error(content, duration?, placement?)",
    type: "void",
    default: "placement 默认 top",
    description: "错误轻提示",
  },
  {
    name: "toast.info(content, duration?, placement?)",
    type: "void",
    default: "placement 默认 top",
    description: "信息轻提示",
  },
  {
    name: "toast.warning(content, duration?, placement?)",
    type: "void",
    default: "placement 默认 top",
    description: "警告轻提示",
  },
  {
    name: "toast.show(type, content, duration?, placement?)",
    type: "void",
    default: "placement 默认 top",
    description:
      "通用展示；type 为 success/error/info/warning；placement 为 top | bottom | center",
  },
  {
    name: "toast.dismiss(id)",
    type: "void",
    default: "-",
    description: "关闭指定 id 的 Toast",
  },
  {
    name: "toast.destroy()",
    type: "void",
    default: "-",
    description: "关闭全部 Toast",
  },
];

const importCode = `import { toast } from "@dreamer/ui-preact";

toast.success("操作成功");
toast.error("操作失败");
toast.info("这是一条信息");
toast.warning("请注意");
toast.show("info", "下方 5 秒", 5000, "bottom");
toast.show("info", "居中", 3000, "center");
toast.destroy();`;

const exampleTypes = `toast.success("操作成功");
toast.error("操作失败");
toast.info("这是一条信息");
toast.warning("请注意");`;

const examplePlacement = `toast.info("上方（默认）", 3000);
toast.info("下方 5 秒", 5000, "bottom");
toast.show("info", "居中", 3000, "center");
toast.show("info", "不自动关闭", 0, "bottom");`;

const _exampleDestroy = `toast.destroy();`;

export default function MessageToast() {
  return (
    <div class="space-y-10">
      {/* 1. 概述 */}
      <section>
        <Title level={1}>Toast 轻提示</Title>
        <Paragraph class="mt-2">
          轻量级提示，支持上（top）、下（bottom）、居中（center，水平+垂直居中）三种位置，默认上。
          支持 success、error、info、warning 类型，可配置 duration（默认
          3000ms，0 表示不自动关闭）。使用 Tailwind v4，支持 light/dark 主题。
        </Paragraph>
      </section>

      {/* 2. 引入 */}
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

      {/* 3. 示例 */}
      <section class="space-y-8">
        <Title level={2}>示例</Title>

        <div class="space-y-4">
          <Title level={3}>类型</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            success、error、info、warning 四种语义类型。
          </Paragraph>
          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="success"
              onClick={() => toast.success("操作成功")}
            >
              success
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => toast.error("操作失败")}
            >
              error
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => toast.info("这是一条信息")}
            >
              info
            </Button>
            <Button
              type="button"
              variant="warning"
              onClick={() => toast.warning("请注意")}
            >
              warning
            </Button>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleTypes}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>placement 与 duration</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            仅支持上（top，默认）、下（bottom）；可指定显示时长，duration=0
            表示不自动关闭。
          </Paragraph>
          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => toast.info("上方（默认）", 3000)}
            >
              上（默认）
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => toast.show("info", "下方 5 秒", 5000, "bottom")}
            >
              下 5s
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => toast.show("info", "不自动关闭", 0, "bottom")}
            >
              duration=0 不自动关闭
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => toast.destroy()}
            >
              toast.destroy()
            </Button>
          </div>
          <CodeBlock
            title="代码示例"
            code={examplePlacement}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>
      </section>

      {/* 4. API */}
      <section class="space-y-3">
        <Title level={2}>API</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          toast 为命令式 API，通过方法调用展示轻提示。
        </Paragraph>
        <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-600">
          <table class="w-full min-w-lg text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/80">
                <th class="px-4 py-3 text-left font-medium text-slate-900 dark:text-slate-100">
                  方法
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
              {TOAST_API.map((row) => (
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
