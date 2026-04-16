/**
 * RichTextEditor 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/form/rich-text-editor
 */

import {
  CodeBlock,
  Form,
  FormItem,
  Paragraph,
  RichTextEditor,
  Title,
} from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const RICH_TEXT_EDITOR_API: ApiRow[] = [
  {
    name: "value",
    type: "string | (() => string) | Signal<string>",
    default: "-",
    description:
      "HTML 内容。与全库表单一致为 MaybeSignal：字面量、`() => T`、`createSignal` 返回值；勿直接绑 `sig.value`（快照失步或误订阅）。",
  },
  {
    name: "onChange",
    type: "(html: string) => void",
    default: "-",
    description: "内容变更回调",
  },
  {
    name: "toolbarPreset",
    type: "default | simple | full",
    default: "default",
    description:
      "工具栏预设：default / simple（撤销/重做/加粗/斜体/下划线/链接）/ full（含表格、代码块、图片等）",
  },
  {
    name: "toolbar",
    type: "string[] | (() => string[])",
    default: "-",
    description: "自定义工具栏按钮 key 列表",
  },
  {
    name: "placeholder",
    type: "string",
    default: "-",
    description: "占位文案",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "是否禁用",
  },
  {
    name: "hideFocusRing",
    type: "boolean",
    default: "false",
    description:
      "为 true 时隐藏编辑区、工具栏与查找条的聚焦蓝色 ring；默认 false 显示",
  },
  {
    name: "readOnly",
    type: "boolean",
    default: "false",
    description: "是否只读",
  },
  {
    name: "minHeight",
    type: "string",
    default: "-",
    description: "最小高度（如 200px）",
  },
  {
    name: "onInsertImage",
    type: "() => string | Promise<string>",
    default: "-",
    description: "插入图片时回调，返回图片 URL",
  },
  {
    name: "onUploadImage",
    type: "(file: File) => string | Promise<string>",
    default: "-",
    description: "上传图片回调，返回 URL",
  },
  {
    name: "onPasteImage",
    type: "(file: File) => string | Promise<string>",
    default: "-",
    description: "粘贴图片回调，返回 URL",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
  { name: "name", type: "string", default: "-", description: "原生 name" },
  { name: "id", type: "string", default: "-", description: "原生 id" },
];

const importCode =
  `import { RichTextEditor, Form, FormItem } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

const html = signal("<p>初始</p>");
<FormItem label="富文本">
  <RichTextEditor
    value={html}
    toolbarPreset="default"
    placeholder="输入内容…"
    minHeight="200px"
  />
</FormItem>`;

export default function FormRichTextEditor() {
  const val = signal("<p>初始内容</p>");
  const valSimple = signal("");
  const valFull = signal("");

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>RichTextEditor 富文本</Title>
        <Paragraph class="mt-2">
          富文本编辑器：value、onChange、toolbarPreset（default/simple/full）、toolbar、placeholder、disabled、readOnly、minHeight、onInsertImage、onUploadImage、onPasteImage。宽度由
          class 控制，表单中需占满一列时传 class="w-full"。Tailwind v4 +
          light/dark。
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
            <Title level={3}>toolbarPreset：default</Title>
            <FormItem label="默认工具栏">
              <RichTextEditor
                value={val}
                toolbarPreset="default"
                placeholder="输入内容…"
                minHeight="200px"
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<RichTextEditor
  value={val}
  toolbarPreset="default"
  minHeight="200px"
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>toolbarPreset：simple</Title>
            <FormItem label="简单工具栏（撤销/重做/加粗/斜体/下划线/链接）">
              <RichTextEditor
                value={valSimple}
                toolbarPreset="simple"
                placeholder="简单模式"
                minHeight="160px"
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<RichTextEditor toolbarPreset="simple" />`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>toolbarPreset：full</Title>
            <FormItem label="完整工具栏（含表格、代码块、图片等）">
              <RichTextEditor
                value={valFull}
                toolbarPreset="full"
                placeholder="完整模式"
                minHeight="240px"
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<RichTextEditor
  toolbarPreset="full"
  onInsertImage={async () => {
    /* 自定义图片来源，例如 await fetchUploadUrl() */
    return "";
  }}
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>readOnly / disabled</Title>
            <FormItem label="只读">
              <RichTextEditor
                value="<p>只读内容，不可编辑</p>"
                readOnly
                toolbarPreset="simple"
                minHeight="120px"
              />
            </FormItem>
            <FormItem label="禁用">
              <RichTextEditor
                value="<p>禁用</p>"
                disabled
                toolbarPreset="simple"
                minHeight="120px"
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<RichTextEditor readOnly /> / <RichTextEditor disabled />`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>
        </Form>
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
              {RICH_TEXT_EDITOR_API.map((row) => (
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
