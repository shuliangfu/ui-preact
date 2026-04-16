/**
 * Upload 组件文档页
 * 路由: /desktop/form/upload
 */

import {
  CodeBlock,
  DEFAULT_UPLOAD_CHUNK_SIZE,
  Form,
  FormItem,
  Paragraph,
  Title,
  Upload,
} from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const UPLOAD_API: ApiRow[] = [
  {
    name: "action",
    type: "string",
    default: "-",
    description:
      "与 requestUpload 至少其一。整文件 multipart；大文件同 URL 使用 ?phase=init|chunk|complete",
  },
  {
    name: "requestUpload",
    type: "(file, signal) => Promise<string>",
    default: "-",
    description:
      "自定义上传，返回值写入隐藏域；若与 action 同时存在则优先用此函数",
  },
  {
    name: "method / headers / withCredentials",
    type: "…",
    default: "POST / - / false",
    description: "内置 fetch 时的请求选项",
  },
  {
    name: "fileFieldName",
    type: "string",
    default: "file",
    description: "非分片时 multipart 字段名",
  },
  {
    name: "maxFileSize / maxCount",
    type: "number",
    default: "-",
    description: "单文件最大字节；多选最大条数",
  },
  {
    name: "chunked",
    type: 'boolean | "auto"',
    default: "auto",
    description: "分片策略；auto 表示大于 chunkThreshold 走 phase 分片",
  },
  {
    name: "chunkThreshold / chunkSize",
    type: "number",
    default: "2MiB / 2MiB",
    description: "auto 阈值与单片大小",
  },
  {
    name: "getValueFromResponse",
    type: "(res) => Promise<string>",
    default: "内置",
    description: "从响应解析隐藏域字符串（仅 action 内置路径）",
  },
  {
    name: "multipleValueMode",
    type: '"json" | "comma"',
    default: "json",
    description: "多文件隐藏域格式",
  },
  {
    name: "value / defaultValue / onValueChange",
    type: "…",
    default: "-",
    description: "隐藏域受控与回调",
  },
  {
    name: "onUploadSuccess / onUploadError",
    type: "…",
    default: "-",
    description: "单文件成功或失败",
  },
  {
    name: "multiple",
    type: "boolean",
    default: "false",
    description: "是否多选",
  },
  {
    name: "accept",
    type: "string",
    default: "-",
    description: "类型限制（选择 + 拖拽均校验）",
  },
  {
    name: "drag",
    type: "boolean",
    default: "true",
    description: "是否显示拖拽区；false 时仅文件选择按钮",
  },
  {
    name: "dragPlaceholder",
    type: "string",
    default: "-",
    description: "拖拽模式占位文案（图标在上）",
  },
  {
    name: "showTriggerIcon",
    type: "boolean",
    default: "true",
    description: "是否显示 IconUpload（拖拽区 / 非拖拽触发条）",
  },
  {
    name: "triggerLabel",
    type: "string",
    default: "选择文件",
    description: "drag=false 时触发条文案，如「上传图片」",
  },
  {
    name: "hideFocusRing",
    type: "boolean",
    default: "false",
    description: "关闭 focus-within 蓝色 ring",
  },
  {
    name: "preview",
    type: "boolean",
    default: "false",
    description:
      "上传成功且 URL 可判为图片时展示缩略图；accept 含 image 时放宽判定",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "禁用",
  },
  {
    name: "name",
    type: "string",
    default: "-",
    description: "隐藏域 name（可见 file input 无 name）",
  },
  {
    name: "id",
    type: "string",
    default: "-",
    description: "可见 file input id；隐藏域为 `${id}-value`",
  },
  { name: "class", type: "string", default: "-", description: "容器 class" },
];

const importCode = `import { Upload, Form, FormItem } from "@dreamer/ui-preact";

<FormItem label="头像">
  <Upload name="avatarUrl" action="/api/upload" maxFileSize={5 * 1024 * 1024} />
</FormItem>`;

export default function FormUpload() {
  const hiddenPreview = signal("");

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Upload 文件上传</Title>
        <Paragraph class="mt-2">
          必须提供 <code class="text-xs">action</code> 或{" "}
          <code class="text-xs">requestUpload</code>
          ：选文件后自动校验并上传；触发区使用内置{" "}
          <code class="text-xs">IconUpload</code>
          （可用 <code class="text-xs">{"showTriggerIcon={false}"}</code>{" "}
          关闭），结果写入{" "}
          <code class="text-xs">type="hidden"</code>。本文档示例默认{" "}
          <code class="text-xs">action="/api/upload"</code>{" "}
          对接本站 docs 后台演示接口。大文件可走同 URL 的{" "}
          <code class="text-xs">phase</code>{" "}
          分片协议（与 @dreamer/upload/server
          一致）。需要完全自定义协议时可使用包内{" "}
          <code class="text-xs">runChunkedUpload</code> 自行接{" "}
          <code class="text-xs">fetch</code>（不必经过本组件）。
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

        <Form layout="vertical" class="w-full space-y-6">
          <section class="space-y-4">
            <Title level={3}>action：后台演示 API</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              使用同源 <code class="text-xs">POST /api/upload</code>
              （docs 在 <code class="text-xs">src/routes/api/upload</code>{" "}
              提供，基于 @dreamer/upload）。需先在本目录{" "}
              <code class="text-xs">deno task dev</code>{" "}
              启动站点后上传才可成功。隐藏域{" "}
              <code class="text-xs">name="fileUrl"</code>
              ，当前值：
              <code class="ml-1 text-xs">
                {hiddenPreview.value || "（空）"}
              </code>
            </Paragraph>
            <FormItem label="图片 ≤5MB（整文件 multipart + preview）">
              <Upload
                name="fileUrl"
                id="doc-upload"
                action="/api/upload"
                maxFileSize={5 * 1024 * 1024}
                accept="image/*"
                chunked={false}
                preview
                multiple
                onValueChange={(v) => hiddenPreview.value = v}
              />
            </FormItem>
          </section>

          <section class="space-y-4">
            <Title level={3}>
              action + 分片（与 @dreamer/upload/server 一致）
            </Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              同一 <code class="text-xs">action</code>：{" "}
              <code class="text-xs">POST ?phase=init</code>，JSON{" "}
              <code class="text-xs">
                filename, fileSize, mimeType, chunks
              </code>{" "}
              → <code class="text-xs">uploadId, key</code>；{" "}
              <code class="text-xs">POST ?phase=chunk</code>，FormData{" "}
              <code class="text-xs">uploadId, key, index, file</code>；{" "}
              <code class="text-xs">POST ?phase=complete</code>，JSON{" "}
              <code class="text-xs">
                {"uploadId, key, chunks: [{ index, etag }], filename"}
              </code>{" "}
              → 响应含 <code class="text-xs">url</code> 或{" "}
              <code class="text-xs">data.url</code>。大文件示例见下方{" "}
              <code class="text-xs">chunked="auto"</code>。
            </Paragraph>
            <FormItem
              label={`大文件分片（auto，阈值 ${DEFAULT_UPLOAD_CHUNK_SIZE} 字节）`}
            >
              <Upload
                name="largeFileUrl"
                action="/api/upload"
                multiple
                chunked="auto"
                chunkThreshold={DEFAULT_UPLOAD_CHUNK_SIZE}
                chunkSize={DEFAULT_UPLOAD_CHUNK_SIZE}
                maxFileSize={50 * 1024 * 1024}
              />
            </FormItem>
            <CodeBlock
              title="典型用法"
              code={`<Upload
  name="fileUrl"
  action="/api/upload"
  chunked="auto"
  chunkThreshold={${DEFAULT_UPLOAD_CHUNK_SIZE}}
  headers={{ Authorization: "Bearer ..." }}
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>多选 + 关闭拖拽区（IconUpload + 上传图片）</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              <code class="text-xs">{"drag={false}"}</code> 时为图标 +{" "}
              <code class="text-xs">triggerLabel</code>{" "}
              触发条，不再使用浏览器原生「选择文件」按钮样式。
            </Paragraph>
            <FormItem label="multiple、drag=false、accept=image/*">
              <Upload
                name="files"
                action="/api/upload"
                multiple
                maxCount={3}
                drag={false}
                accept="image/*"
                triggerLabel="上传图片"
              />
            </FormItem>
          </section>

          <section class="space-y-4">
            <Title level={3}>disabled</Title>
            <FormItem label="禁用">
              <Upload
                disabled
                action="/api/upload"
                name="disabledDemo"
              />
            </FormItem>
          </section>
        </Form>
      </section>

      <section class="space-y-3">
        <Title level={2}>进阶</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          若后端不是上述 phase 协议，可实现{" "}
          <code class="text-xs">requestUpload</code>，或在包外使用{" "}
          <code class="text-xs">runChunkedUpload</code> 自行更新 UI 状态。
        </Paragraph>
        <CodeBlock
          title="runChunkedUpload（自建请求）"
          code={`import { runChunkedUpload, DEFAULT_UPLOAD_CHUNK_SIZE } from "@dreamer/ui-preact";

await runChunkedUpload({
  file,
  chunkSize: DEFAULT_UPLOAD_CHUNK_SIZE,
  signal,
  onProgress: (loaded, total) => { /* 更新进度 */ },
  uploadChunk: async ({ chunk, chunkIndex }) => {
    // await fetch(...);
  },
  complete: async () => { /* await fetch 合并 */ },
});`}
          language="tsx"
          showLineNumbers
          copyable
          wrapLongLines
        />
      </section>

      <section class="space-y-3">
        <Title level={2}>API</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          类型 <code class="text-xs">UploadProps</code> 要求{" "}
          <code class="text-xs">action</code> 与{" "}
          <code class="text-xs">requestUpload</code> 至少其一。另导出{" "}
          <code class="text-xs">UploadFile</code>、
          <code class="text-xs">UploadCoreProps</code>、
          <code class="text-xs">formatUploadFileSize</code> 等。
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
              {UPLOAD_API.map((row) => (
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
