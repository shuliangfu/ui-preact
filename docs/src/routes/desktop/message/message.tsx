/**
 * Message 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/message/message
 */

import {
  Button,
  CodeBlock,
  message,
  Paragraph,
  Title,
} from "@dreamer/ui-preact";

/** API 方法/属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const MESSAGE_API: ApiRow[] = [
  {
    name: "message.success(content, duration?, placement?)",
    type: "void",
    default: "placement 默认 top",
    description:
      "成功提示；duration 默认 3000ms；placement 为 top | center（居中）",
  },
  {
    name: "message.error(content, duration?, placement?)",
    type: "void",
    default: "placement 默认 top",
    description: "错误提示",
  },
  {
    name: "message.info(content, duration?, placement?)",
    type: "void",
    default: "placement 默认 top",
    description: "信息提示",
  },
  {
    name: "message.warning(content, duration?, placement?)",
    type: "void",
    default: "placement 默认 top",
    description: "警告提示",
  },
  {
    name: "message.destroy()",
    type: "void",
    default: "-",
    description: "关闭全部全局提示",
  },
];

const importCode = `import { message } from "@dreamer/ui-preact";

message.success("保存成功");
message.error("网络错误");
message.info("已复制到剪贴板");
message.warning("请先登录");
message.destroy(); // 关闭全部`;

const exampleTypes = `message.success("保存成功");
message.error("网络错误");
message.info("已复制到剪贴板");
message.warning("请先登录");`;

const examplePlacement = `message.info("顶部（默认）", 3000);
message.info("居中", 3000, "center");`;

const exampleDuration = `message.info("5 秒后关闭", 5000);`;

const exampleDestroy = `message.destroy();`;

export default function MessageMessage() {
  return (
    <div class="space-y-10">
      {/* 1. 概述 */}
      <section>
        <Title level={1}>Message 全局提示</Title>
        <Paragraph class="mt-2">
          全局提示，支持顶部居中（top，默认）与视口绝对居中（center，水平+垂直居中）。
          支持 success、error、info、warning 四种类型，可配置 duration（默认
          3000ms）， 调用 message.destroy() 可关闭全部。使用 Tailwind v4，支持
          light/dark 主题。
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
              onClick={() => message.success("保存成功")}
            >
              成功
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => message.error("网络错误")}
            >
              错误
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => message.info("已复制到剪贴板")}
            >
              信息
            </Button>
            <Button
              type="button"
              variant="warning"
              onClick={() => message.warning("请先登录")}
            >
              警告
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
          <Title level={3}>placement 显示位置</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            第三参数为
            placement：top（顶部居中，默认）、center（视口水平+垂直居中）。
          </Paragraph>
          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => message.info("顶部（默认）", 3000)}
            >
              顶部
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => message.info("居中", 3000, "center")}
            >
              居中
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

        <div class="space-y-4">
          <Title level={3}>duration 自定义时长</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            第二个参数为显示时长（毫秒），默认 3000。
          </Paragraph>
          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => message.info("5 秒后关闭", 5000)}
            >
              5 秒后关闭
            </Button>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleDuration}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>destroy 关闭全部</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            调用 message.destroy() 关闭当前所有全局提示。
          </Paragraph>
          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => message.destroy()}
            >
              message.destroy()
            </Button>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleDestroy}
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
          message 为命令式 API，通过方法调用展示提示。
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
              {MESSAGE_API.map((row) => (
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
