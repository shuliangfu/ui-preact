/**
 * Alert 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/feedback/alert
 */

import { signal } from "@preact/signals";
import { Alert, Button, CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const ALERT_API: ApiRow[] = [
  {
    name: "type",
    type: "success | info | warning | error",
    default: "info",
    description: "语义类型",
  },
  {
    name: "message",
    type: "string",
    default: "-",
    description: "主文案（必填）",
  },
  {
    name: "description",
    type: "string",
    default: "-",
    description: "补充描述",
  },
  {
    name: "showIcon",
    type: "boolean",
    default: "true",
    description: "是否显示左侧图标",
  },
  {
    name: "closable",
    type: "boolean",
    default: "false",
    description: "是否显示关闭按钮",
  },
  {
    name: "onClose",
    type: "() => void",
    default: "-",
    description:
      "关闭回调；Alert 不内置隐藏状态，须在回调里改 state/signal 并不再渲染本组件",
  },
  {
    name: "banner",
    type: "boolean",
    default: "false",
    description: "是否横幅样式",
  },
  {
    name: "action",
    type: "unknown",
    default: "-",
    description: "自定义操作区",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description:
      "额外 class；根节点默认 w-full，需窄条时可传 w-auto max-w-* 等覆盖",
  },
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "子节点（可选，作为主内容）",
  },
];

const importCode = `import { Alert } from "@dreamer/ui-preact";

<Alert
  type="success"
  message="操作成功"
/>
<Alert
  type="info"
  message="这是一条信息提示"
/>
<Alert
  type="warning"
  message="请注意"
/>
<Alert
  type="error"
  message="操作失败，请重试"
/>`;

const exampleTypes = `<Alert
  type="success"
  message="操作成功"
/>
<Alert
  type="info"
  message="这是一条信息提示"
/>
<Alert
  type="warning"
  message="请注意当前操作可能影响数据"
/>
<Alert
  type="error"
  message="操作失败，请重试"
/>`;

const exampleDescription = `<Alert
  type="info"
  message="提示标题"
  description="这里是补充描述，可多行说明当前状态或后续操作建议。"
/>`;

const exampleClosable = `import { signal } from "@preact/signals";

/** 若页面函数会因 data-view-dynamic 等重跑，勿在函数体内每次 new Signal；见文档页实现（模块级 visible）。 */
const visible = signal(true);

{visible.value && (
  <Alert
    type="warning"
    message="可关闭的提示"
    closable
    onClose={() => { visible.value = false; }}
  />
)}`;

const exampleAction = `<Alert
  type="info"
  message="有新版本可用"
  description="当前为 v1.0，可升级至 v2.0。"
  action={<Button variant="primary" size="sm">立即升级</Button>}
/>`;

const exampleShowIcon = `<Alert
  type="info"
  message="仅文案，不显示左侧图标"
  showIcon={false}
/>`;

const exampleBanner = `<Alert
  type="warning"
  message="整行横幅提示，常用于页面顶部"
  banner
/>`;

/**
 * 「可关闭」演示用显隐状态：必须模块级。
 * 页面组件若随父级 getter 重跑而再次执行，函数体内的 signal(true) 每次都是新实例，
 * 关闭钮仍闭包旧 signal → 点击无视觉反馈；与 Upload / MarkdownEditor tabs 同类问题。
 */
const closableAlertDemoVisible = signal(true);

export default function FeedbackAlert() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Alert 静态提示条</Title>
        <Paragraph class="mt-2">
          静态提示条，支持成功/信息/警告/错误四种类型；可配标题、描述、可关闭、自定义操作、横幅样式。
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
          <Title level={3}>类型</Title>
          <div class="space-y-3">
            <Alert type="success" message="操作成功" />
            <Alert type="info" message="这是一条信息提示" />
            <Alert type="warning" message="请注意当前操作可能影响数据" />
            <Alert type="error" message="操作失败，请重试" />
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
          <Title level={3}>带描述</Title>
          <Alert
            type="info"
            message="提示标题"
            description="这里是补充描述，可多行说明当前状态或后续操作建议。"
          />
          <CodeBlock
            title="代码示例"
            code={exampleDescription}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>可关闭</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            点击关闭仅触发{" "}
            <code class="rounded bg-slate-200/80 px-1 font-mono text-xs dark:bg-slate-600/80">
              onClose
            </code>
            ，须由父级（如{" "}
            <code class="rounded bg-slate-200/80 px-1 font-mono text-xs dark:bg-slate-600/80">
              createSignal
            </code>
            ）控制是否继续渲染。父级若会整页重跑，请把该 signal 放在
            <strong class="font-medium">模块作用域</strong>
            （勿在页面函数内每次新建），否则关闭只更新旧实例，界面不消失。
          </Paragraph>
          {/* 容器 w-full，与 Alert 默认 w-full 一致，占满文档内容区 */}
          <div class="flex w-full flex-wrap items-stretch gap-2">
            {closableAlertDemoVisible.value
              ? (
                <Alert
                  type="warning"
                  message="可关闭的提示"
                  closable
                  onClose={() => {
                    closableAlertDemoVisible.value = false;
                  }}
                />
              )
              : (
                <Button
                  type="button"
                  variant="default"
                  onClick={() => {
                    closableAlertDemoVisible.value = true;
                  }}
                >
                  重新显示提示
                </Button>
              )}
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleClosable}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>自定义操作</Title>
          <Alert
            type="info"
            message="有新版本可用"
            description="当前为 v1.0，可升级至 v2.0。"
            action={
              <Button type="button" variant="primary" size="sm">
                立即升级
              </Button>
            }
          />
          <CodeBlock
            title="代码示例"
            code={exampleAction}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>不显示图标（showIcon=false）</Title>
          <Alert
            type="info"
            message="仅文案，不显示左侧图标"
            showIcon={false}
          />
          <CodeBlock
            title="代码示例"
            code={exampleShowIcon}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>横幅样式（banner）</Title>
          <Alert
            type="warning"
            message="整行横幅提示，常用于页面顶部"
            banner
          />
          <CodeBlock
            title="代码示例"
            code={exampleBanner}
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
          组件接收以下属性，message 为必填。
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
              {ALERT_API.map((row) => (
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
