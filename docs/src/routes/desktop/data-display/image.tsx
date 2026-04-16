/**
 * Image 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/data-display/image
 */

import { CodeBlock, Image, Paragraph, Title } from "@dreamer/ui-preact";
import { useMemo } from "preact/hooks";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const IMAGE_API: ApiRow[] = [
  { name: "src", type: "string", default: "-", description: "图片地址" },
  { name: "alt", type: "string", default: "-", description: "替代文案" },
  { name: "width", type: "number | string", default: "-", description: "宽度" },
  {
    name: "height",
    type: "number | string",
    default: "-",
    description: "高度",
  },
  {
    name: "fit",
    type: "contain | cover | fill | none",
    default: "-",
    description: "填充方式",
  },
  { name: "placeholder", type: "unknown", default: "-", description: "占位图" },
  {
    name: "fallback",
    type: "string | unknown",
    default: "-",
    description: "兼容保留，组件内不再渲染文案",
  },
  {
    name: "fallbackSrc",
    type: "string",
    default: "内置 SVG",
    description: "非空时覆盖组件内置缺省图（CDN/站内资源/data URI）",
  },
  {
    name: "lazy",
    type: "boolean",
    default: "false",
    description: "是否懒加载",
  },
  {
    name: "preview",
    type: "boolean",
    default: "false",
    description: "是否支持点击预览",
  },
  {
    name: "previewDisabled",
    type: "boolean",
    default: "false",
    description: "是否禁用预览",
  },
  {
    name: "rounded",
    type: "boolean | string",
    default: "false",
    description: "圆角，默认 false",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
];

const importCode = `import { Image } from "@dreamer/ui-preact";

<Image
  src="https://example.com/photo.jpg"
  alt="示例"
  width={200}
  height={150}
  fit="cover"
  preview
/>`;

const exampleBasicPreview = `<Image
  src="..."
  alt="示例图"
  width={200}
  height={150}
  fit="cover"
  rounded
  preview
/>`;

const exampleFallbackLazy = `<Image
  src="invalid"
  alt="失败"
  width={120}
  height={120}
/>
<!-- 可选 fallbackSrc="/static/error.png" 覆盖内置山水占位图 -->
<Image
  src="..."
  alt="lazy"
  width={120}
  height={120}
  lazy
  rounded="lg"
/>`;

/** 宽扁 / 高窄容器下内置失败占位（object-contain）演示，供 CodeBlock 展示 */
const exampleErrorWideAndTall = `<Image
  src="https://invalid-url-404"
  alt="失败占位 · 横向"
  width={320}
  height={100}
/>
<Image
  src="https://invalid-url-404"
  alt="失败占位 · 纵向"
  width={100}
  height={280}
/>`;

export default function DataDisplayImage() {
  /**
   * 与 ui-view 文档一致使用 picsum；`random` 仅在挂载时拼一次，刷新整页会换新图，
   * 且不会在每次 render 改 src（否则 Image 会反复 loading、灰块不消失）。
   */
  const { picsumDemoSrc, picsumLazySrc } = useMemo(() => {
    const t = Date.now();
    return {
      picsumDemoSrc: `https://picsum.photos/200/150?random=${t}`,
      picsumLazySrc: `https://picsum.photos/120/120?random=${t}-lazy`,
    };
  }, []);

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Image 图片</Title>
        <Paragraph class="mt-2">
          图片：src、alt、width、height、fit、placeholder、fallback（兼容）、fallbackSrc、lazy、preview、previewDisabled、rounded。
          加载失败时主图换成内置灰调山水占位（无网络、无「加载失败」条）；非空
          fallbackSrc 可覆盖。使用 Tailwind v4，支持 light/dark
          主题。下方在线示例使用 picsum.photos，需本机可访问该外网服务。
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
          <Title level={3}>基础 + fit + preview + rounded</Title>
          <div class="flex gap-4 flex-wrap">
            <Image
              src={picsumDemoSrc}
              alt="示例图"
              width={200}
              height={150}
              fit="cover"
              rounded
              preview
            />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleBasicPreview}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>fallback / lazy</Title>
          {/* 两图统一 120×120，避免原先 120 与 100 并排造成一高一低 */}
          <div class="flex gap-4 flex-wrap">
            <Image
              src="https://invalid-url-404"
              alt="失败"
              width={120}
              height={120}
            />
            <Image
              src={picsumLazySrc}
              alt="lazy"
              width={120}
              height={120}
              lazy
              rounded="lg"
            />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleFallbackLazy}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>失败占位 · 宽扁 / 高窄（分两行）</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            无效 src 触发内置 SVG；失败态为{" "}
            <code class="text-xs">object-contain</code>
            ，宽高比不变，非正方形容器内会上下或左右留白。
          </Paragraph>
          <div class="space-y-6">
            <div class="space-y-2">
              <Paragraph class="text-xs font-medium text-slate-500 dark:text-slate-400">
                横向容器 320×100
              </Paragraph>
              <Image
                src="https://invalid-url-404"
                alt="失败占位 · 横向"
                width={320}
                height={100}
              />
            </div>
            <div class="space-y-2">
              <Paragraph class="text-xs font-medium text-slate-500 dark:text-slate-400">
                纵向容器 100×280
              </Paragraph>
              <Image
                src="https://invalid-url-404"
                alt="失败占位 · 纵向"
                width={100}
                height={280}
              />
            </div>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleErrorWideAndTall}
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
          组件接收以下属性，src 为必填。
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
              {IMAGE_API.map((row) => (
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
