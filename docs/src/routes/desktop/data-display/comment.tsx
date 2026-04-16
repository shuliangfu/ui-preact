/**
 * Comment 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/data-display/comment
 */

import {
  Avatar,
  CodeBlock,
  Comment,
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

const COMMENT_API: ApiRow[] = [
  {
    name: "author",
    type: "string | unknown",
    default: "-",
    description: "作者名或节点",
  },
  { name: "avatar", type: "unknown", default: "-", description: "头像" },
  { name: "children", type: "unknown", default: "-", description: "主内容" },
  {
    name: "datetime",
    type: "string | unknown",
    default: "-",
    description: "时间/日期文案",
  },
  {
    name: "actions",
    type: "unknown[]",
    default: "-",
    description: "操作区（如回复、点赞）",
  },
  { name: "replies", type: "unknown", default: "-", description: "嵌套回复" },
  { name: "class", type: "string", default: "-", description: "容器 class" },
  {
    name: "contentClass",
    type: "string",
    default: "-",
    description: "内容区 class",
  },
];

const importCode = `import { Avatar, Comment } from "@dreamer/ui-preact";

<Comment
  author="用户 A"
  avatar={<Avatar size="sm">A</Avatar>}
  datetime="2024-01-15 10:00"
  actions={[<span key="reply">回复</span>]}
>
  <p>评论内容。</p>
</Comment>`;

const exampleBasic = `<Comment
  author="用户 A"
  avatar={<Avatar size="sm">A</Avatar>}
  datetime="2024-01-15 10:00"
  actions={[<span key="reply">回复</span>, <span key="like">点赞</span>]}
>
  <p>这是一条评论内容。</p>
</Comment>`;

const exampleReplies = `<Comment
  author="用户 B"
  datetime="2024-01-15 11:00"
  replies={<Comment author="用户 A" datetime="..."><p>回复内容。</p></Comment>}
>
  <p>带回复的评论。</p>
</Comment>`;

export default function DataDisplayComment() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Comment 评论</Title>
        <Paragraph class="mt-2">
          评论：author、avatar、datetime、children、actions、replies、contentClass。
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
          <Title level={3}>基础（author / avatar / datetime / actions）</Title>
          <Comment
            author="用户 A"
            avatar={<Avatar size="sm">A</Avatar>}
            datetime="2024-01-15 10:00"
            actions={[
              <span key="reply">回复</span>,
              <span key="like">点赞</span>,
            ]}
          >
            <p>这是一条评论内容。</p>
          </Comment>
          <CodeBlock
            title="代码示例"
            code={exampleBasic}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>replies 嵌套回复</Title>
          <Comment
            author="用户 B"
            datetime="2024-01-15 11:00"
            replies={
              <Comment author="用户 A" datetime="2024-01-15 12:00">
                <p>回复内容。</p>
              </Comment>
            }
          >
            <p>带回复的评论。</p>
          </Comment>
          <CodeBlock
            title="代码示例"
            code={exampleReplies}
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
              {COMMENT_API.map((row) => (
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
