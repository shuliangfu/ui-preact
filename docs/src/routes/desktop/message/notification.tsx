/**
 * Notification 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/message/notification
 */

import {
  Button,
  CodeBlock,
  notification,
  Paragraph,
  Title,
  toast,
} from "@dreamer/ui-preact";

/** API 方法/选项行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const NOTIFICATION_METHODS: ApiRow[] = [
  {
    name: "notification.open(options)",
    type: "void",
    default: "-",
    description: "打开一条通知；options 见下表",
  },
  {
    name: "notification.close(id)",
    type: "void",
    default: "-",
    description: "关闭指定 id 的通知",
  },
  {
    name: "notification.destroy()",
    type: "void",
    default: "-",
    description: "关闭全部通知",
  },
];

const NOTIFICATION_OPTIONS: ApiRow[] = [
  {
    name: "key",
    type: "string",
    default: "-",
    description: "唯一 key，相同 key 会替换旧通知",
  },
  {
    name: "type",
    type: "success | error | info | warning | default",
    default: "default",
    description: "语义类型",
  },
  { name: "title", type: "string", default: "-", description: "标题" },
  {
    name: "description",
    type: "string",
    default: "-",
    description: "描述文案",
  },
  {
    name: "icon",
    type: "string | unknown",
    default: "-",
    description: "自定义图标",
  },
  {
    name: "duration",
    type: "number",
    default: "约 4500",
    description: "显示时长（ms），0 表示不自动关闭",
  },
  {
    name: "btnText",
    type: "string",
    default: "-",
    description: "操作按钮文案",
  },
  {
    name: "onBtnClick",
    type: "() => void",
    default: "-",
    description: "操作按钮点击回调",
  },
  {
    name: "onClose",
    type: "() => void",
    default: "-",
    description: "关闭时回调",
  },
  {
    name: "placement",
    type: "string",
    default: "top-right",
    description:
      "位置：top-right/top-center/top-left/bottom-right/bottom-center/bottom-left",
  },
];

const importCode = `import { notification } from "@dreamer/ui-preact";

notification.open({
  title: "任务完成",
  description: "您的文件已上传成功。",
  type: "success",
});
notification.close(id);
notification.destroy();`;

const exampleTypes = `notification.open({
  title: "任务完成",
  description: "您的文件已上传成功。",
  type: "success",
});
notification.open({
  title: "请求失败",
  description: "请检查网络后重试。",
  type: "error",
});
notification.open({
  title: "系统通知",
  description: "新版本已发布，建议尽快更新。",
  type: "info",
});`;

const exampleBtn = `notification.open({
  title: "系统通知",
  description: "新版本已发布，建议尽快更新。",
  type: "info",
  btnText: "查看详情",
  onBtnClick: () => toast.info("点击了「查看详情」"),
});`;

const exampleKey = `notification.open({
  key: "unique-key",
  title: "同 key 会替换",
  description: "多次点击此按钮，只会保留一条（key 去重）。",
  type: "default",
});`;

const examplePlacement = `notification.open({
  title: "top-right",
  description: 'placement="top-right"',
  type: "info",
  placement: "top-right",
});`;

const exampleDuration = `notification.open({
  title: "2 秒后关闭",
  description: "duration=2000，关闭时触发 onClose。",
  type: "info",
  duration: 2000,
  onClose: () => toast.info("通知已关闭"),
});
notification.destroy();`;

/** 不自动关闭：duration 设为 0，仅用户点击关闭按钮或 destroy 时关闭 */
const exampleDurationZero = `notification.open({
  title: "系统通知",
  description: "此条不自动关闭，需点击右侧 X 或调用 destroy 关闭。",
  type: "info",
  duration: 0,
});`;

export default function MessageNotification() {
  return (
    <div class="space-y-10">
      {/* 1. 概述 */}
      <section>
        <Title level={1}>Notification 消息通知框</Title>
        <Paragraph class="mt-2">
          消息通知框，支持标题、描述、类型（success/error/info/warning/default）、操作按钮、key
          去重、placement 位置、duration 与 onClose。使用
          notification.open(options)、notification.close(id)、notification.destroy()。
          Tailwind v4，支持 light/dark 主题。
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
            success、error、info、warning、default 五种类型。
          </Paragraph>
          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              onClick={() =>
                notification.open({
                  title: "任务完成",
                  description: "您的文件已上传成功。",
                  type: "success",
                })}
            >
              成功通知
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() =>
                notification.open({
                  title: "请求失败",
                  description: "请检查网络后重试。",
                  type: "error",
                })}
            >
              错误通知
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                notification.open({
                  title: "系统通知",
                  description: "新版本已发布，建议尽快更新。",
                  type: "info",
                })}
            >
              信息通知
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
          <Title level={3}>操作按钮</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            btnText、onBtnClick 可配置操作按钮。
          </Paragraph>
          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                notification.open({
                  title: "系统通知",
                  description: "新版本已发布，建议尽快更新。",
                  type: "info",
                  btnText: "查看详情",
                  onBtnClick: () => toast.info("点击了「查看详情」"),
                })}
            >
              带操作按钮
            </Button>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleBtn}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>key 去重</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            相同 key 会替换旧通知，只保留一条。
          </Paragraph>
          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                notification.open({
                  key: "unique-key",
                  title: "同 key 会替换",
                  description: "多次点击此按钮，只会保留一条（key 去重）。",
                  type: "default",
                })}
            >
              同 key 去重
            </Button>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleKey}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>placement 弹出位置</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            top-right、top-center、top-left、bottom-right、bottom-center、bottom-left。
          </Paragraph>
          <div class="flex flex-wrap gap-2">
            {([
              "top-right",
              "top-center",
              "top-left",
              "bottom-right",
              "bottom-center",
              "bottom-left",
            ] as const).map((p) => (
              <span key={p}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    notification.open({
                      title: p,
                      description: `placement="${p}"`,
                      type: "info",
                      placement: p,
                    })}
                >
                  {p}
                </Button>
              </span>
            ))}
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
          <Title level={3}>duration 与 onClose / destroy</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            自定义 duration、关闭时 onClose；duration 设为 0
            表示不自动关闭，需用户点击右侧 X 或调用 destroy
            关闭。notification.destroy() 关闭全部。
          </Paragraph>
          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                notification.open({
                  title: "2 秒后关闭",
                  description: "duration=2000，关闭时触发 onClose。",
                  type: "info",
                  duration: 2000,
                  onClose: () => toast.info("通知已关闭"),
                })}
            >
              自定义 duration + onClose
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                notification.open({
                  title: "系统通知",
                  description:
                    "此条不自动关闭，需点击右侧 X 或调用 destroy 关闭。",
                  type: "info",
                  duration: 0,
                })}
            >
              不自动关闭（duration=0）
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => notification.destroy()}
            >
              notification.destroy()
            </Button>
          </div>
          <CodeBlock
            title="代码示例（自定义 duration + onClose）"
            code={exampleDuration}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
          <CodeBlock
            title="代码示例（不自动关闭，duration=0）"
            code={exampleDurationZero}
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
          notification 为命令式 API。方法如下，open(options) 的 options 见下表。
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
              {NOTIFICATION_METHODS.map((row) => (
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
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400 mt-4">
          notification.open(options) 的 options：
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
              {NOTIFICATION_OPTIONS.map((row) => (
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
