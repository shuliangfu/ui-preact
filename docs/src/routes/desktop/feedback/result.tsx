/**
 * Result 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/feedback/result
 */

import {
  Button,
  CodeBlock,
  Paragraph,
  Result,
  Title,
} from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const RESULT_API: ApiRow[] = [
  {
    name: "status",
    type: "success | error | info | warning | 403 | 404",
    default: "-",
    description: "结果状态（决定默认图标与配色）",
  },
  { name: "title", type: "string", default: "-", description: "主标题" },
  {
    name: "subTitle",
    type: "string",
    default: "-",
    description: "副标题/描述",
  },
  {
    name: "icon",
    type: "unknown",
    default: "-",
    description: "自定义图标（覆盖 status 默认）",
  },
  {
    name: "extra",
    type: "unknown",
    default: "-",
    description: "操作区（如按钮组）",
  },
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "额外内容（渲染在 extra 下方）",
  },
  { name: "class", type: "string", default: "-", description: "最外层 class" },
];

const importCode = `import { Button, Result } from "@dreamer/ui-preact";

<Result
  status="success"
  title="操作成功"
  subTitle="描述"
  extra={<Button variant="primary">返回</Button>}
/>`;

const exampleSuccess = `<Result
  status="success"
  title="操作成功"
  subTitle="您的申请已提交，我们将在 1-3 个工作日内处理。"
  extra={<Button variant="primary">返回列表</Button>}
/>`;

const exampleError = `<Result
  status="error"
  title="提交失败"
  subTitle="请检查网络后重试，或联系客服。"
  extra={<><Button variant="default">返回</Button><Button variant="primary">重试</Button></>}
/>`;

const exampleInfoWarning = `<Result
  status="info"
  title="提示"
  subTitle="当前为信息类结果页。"
  extra={<Button variant="primary">知道了</Button>}
/>
<Result
  status="warning"
  title="注意"
  subTitle="请确认后再继续操作。"
  extra={<Button variant="primary">确认</Button>}
/>`;

const example403404 = `<Result
  status="403"
  title="无权限"
  subTitle="您没有权限访问该页面。"
  extra={<Button variant="primary">返回首页</Button>}
/>
<Result
  status="404"
  title="页面不存在"
  subTitle="请检查链接或返回首页。"
  extra={<Button variant="primary">返回首页</Button>}
/>`;

export default function FeedbackResult() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Result 结果页</Title>
        <Paragraph class="mt-2">
          结果页：成功/失败/信息/警告/403/404
          等结果态；支持标题、副标题、自定义图标、操作区。 使用 Tailwind
          v4，支持 light/dark 主题。
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
          <Title level={3}>成功</Title>
          <Result
            status="success"
            title="操作成功"
            subTitle="您的申请已提交，我们将在 1-3 个工作日内处理。"
            extra={<Button type="button" variant="primary">返回列表</Button>}
          />
          <CodeBlock
            title="代码示例"
            code={exampleSuccess}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>失败</Title>
          <Result
            status="error"
            title="提交失败"
            subTitle="请检查网络后重试，或联系客服。"
            extra={
              <>
                <Button type="button" variant="default">返回</Button>
                <Button type="button" variant="primary">重试</Button>
              </>
            }
          />
          <CodeBlock
            title="代码示例"
            code={exampleError}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>信息 / 警告</Title>
          <Result
            status="info"
            title="提示"
            subTitle="当前为信息类结果页。"
            extra={<Button type="button" variant="primary">知道了</Button>}
          />
          <Result
            status="warning"
            title="注意"
            subTitle="请确认后再继续操作。"
            extra={<Button type="button" variant="primary">确认</Button>}
          />
          <CodeBlock
            title="代码示例"
            code={exampleInfoWarning}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>403 / 404</Title>
          <Result
            status="403"
            title="无权限"
            subTitle="您没有权限访问该页面。"
            extra={<Button type="button" variant="primary">返回首页</Button>}
          />
          <Result
            status="404"
            title="页面不存在"
            subTitle="请检查链接或返回首页。"
            extra={<Button type="button" variant="primary">返回首页</Button>}
          />
          <CodeBlock
            title="代码示例"
            code={example403404}
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
              {RESULT_API.map((row) => (
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
