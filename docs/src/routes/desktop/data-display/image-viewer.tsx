/**
 * ImageViewer 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/data-display/image-viewer
 */

import { useSignal } from "@preact/signals";
import {
  Button,
  CodeBlock,
  ImageViewer,
  type ImageViewerTransition,
  Paragraph,
  Title,
} from "@dreamer/ui-preact";

const DEMO_IMAGES = [
  "https://picsum.photos/id/1/800/600",
  "https://picsum.photos/id/10/800/600",
  "https://picsum.photos/id/100/800/600",
  "https://picsum.photos/id/1000/800/600",
  "https://picsum.photos/id/1001/800/600",
];

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const IMAGE_VIEWER_API: ApiRow[] = [
  {
    name: "open",
    type: "boolean | (() => boolean) | Signal<boolean>",
    default: "-",
    description:
      "是否打开（受控）；推荐传 Signal（useSignal 返回值）或 getter，勿仅依赖 open={sig.value} 以免 Hybrid 下不更新",
  },
  {
    name: "onClose",
    type: "() => void",
    default: "-",
    description: "关闭回调",
  },
  {
    name: "images",
    type: "string | string[]",
    default: "-",
    description: "图片列表（`imagesFromSelector` 无有效结果时的回退）",
  },
  {
    name: "imagesFromSelector",
    type: "string",
    default: "-",
    description:
      "打开时从 document 上匹配 `img` 读 currentSrc/src 作为列表，与页面缩略同源；空或无效则仍用 images",
  },
  {
    name: "currentIndex",
    type: "number",
    default: "-",
    description: "当前展示索引（受控）",
  },
  {
    name: "defaultIndex",
    type: "number",
    default: "-",
    description: "默认索引（非受控）",
  },
  {
    name: "onIndexChange",
    type: "(index: number) => void",
    default: "-",
    description: "索引变化回调",
  },
  {
    name: "maskClosable",
    type: "boolean",
    default: "true",
    description: "点击遮罩是否关闭",
  },
  {
    name: "keyboard",
    type: "boolean",
    default: "true",
    description: "Esc 关闭、左右键切换",
  },
  {
    name: "showThumbnails",
    type: "boolean",
    default: "true",
    description: "是否显示底部缩略图",
  },
  {
    name: "transition",
    type: "ImageViewerTransitionInput（字面量 | Signal | 零参 getter）",
    default: '"fade"',
    description:
      "主图切换动画：none / fade / slide / blur / zoom / mosaic；可与 open 一样传 Signal",
  },
];

const importCode = `import { useSignal } from "@preact/signals";
import { Button, ImageViewer } from "@dreamer/ui-preact";

const open = useSignal(false);
const index = useSignal(0);
<ImageViewer
  open={open}
  onClose={() => { open.value = false; }}
  images={images}
  currentIndex={index}
  onIndexChange={(i) => { index.value = i; }}
/>`;

const exampleBasic = `<ImageViewer
  open={open}
  onClose={() => { open.value = false; }}
  images={DEMO_IMAGES}
  imagesFromSelector="[data-image-viewer-demo-gallery] img"
  currentIndex={index}
  onIndexChange={(i) => { index.value = i; }}
  maskClosable
  keyboard
  showThumbnails
/>`;

/**
 * 文档示例：主图切换效果与按钮文案（对应 {@link ImageViewerTransition}）。
 */
const VIEWER_TRANSITION_DEMOS: readonly {
  label: string;
  value: ImageViewerTransition;
}[] = [
  { label: "无动画 (none)", value: "none" },
  { label: "叠化 (fade)", value: "fade" },
  { label: "滑动 (slide)", value: "slide" },
  { label: "模糊渐入 (blur)", value: "blur" },
  { label: "小方格 (mosaic)", value: "mosaic" },
  { label: "缩放切入 (zoom)", value: "zoom" },
];

const exampleTransitionButtons =
  `const viewerTransition = useSignal<ImageViewerTransition>("fade");

<div class="flex flex-wrap gap-2">
  {VIEWER_TRANSITION_DEMOS.map(({ label, value }) => (
    <Button
      type="button"
      key={value}
      onClick={() => {
        viewerTransition.value = value;
        index.value = 0;
        open.value = true;
      }}
    >
      {label}
    </Button>
  ))}
</div>

<ImageViewer
  open={open}
  transition={viewerTransition}
  ...
/>`;

export default function DataDisplayImageViewer() {
  /** Preact 须用 useSignal，勿在组件体内每次 signal()，否则状态每帧重置 */
  const open = useSignal(false);
  const index = useSignal(0);
  /** 当前示例使用的切图动画，与下方「按效果打开」按钮及缩略图共用同一查看器实例 */
  const viewerTransition = useSignal<ImageViewerTransition>("fade");

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>ImageViewer 图片查看器</Title>
        <Paragraph class="mt-2">
          全屏遮罩内大图查看，支持多图切换、缩放、旋转、底部缩略图；Esc
          关闭，左右键切换图片。示例通过{" "}
          <code class="text-xs">imagesFromSelector</code>{" "}
          从页面上缩略 `img` 读取已解析的
          `currentSrc`，与列表同源、利于缓存。使用 Tailwind v4，支持 light/dark
          主题。
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
          <Title level={3}>多图切换 + 缩略图</Title>
          <div
            class="flex flex-wrap gap-3"
            data-image-viewer-demo-gallery=""
          >
            {DEMO_IMAGES.map((src, i) => (
              <button
                type="button"
                key={src}
                class="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 hover:ring-2 hover:ring-teal-500 transition-shadow"
                onClick={() => {
                  index.value = i;
                  /** 缩略图沿用当前选中的 transition（默认 fade，或上次点的效果按钮） */
                  open.value = true;
                }}
              >
                <img
                  src={src}
                  alt={`预览 ${i + 1}`}
                  class="w-24 h-24 object-cover block"
                />
              </button>
            ))}
          </div>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            下方按钮从第一张起打开查看器，并分别设置不同的{" "}
            <code class="text-teal-600 dark:text-teal-400">transition</code>
            {" "}
            切图效果；在查看器内切换图片即可对比动画。点击上方缩略图也会打开，并沿用当前选中的效果。
          </Paragraph>
          <div class="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={() => {
                index.value = 0;
                open.value = true;
              }}
            >
              打开查看器（当前效果）
            </Button>
            {VIEWER_TRANSITION_DEMOS.map(({ label, value }) => (
              <Button
                type="button"
                key={value}
                variant="secondary"
                onClick={() => {
                  viewerTransition.value = value;
                  index.value = 0;
                  open.value = true;
                }}
              >
                {label}
              </Button>
            ))}
          </div>
          <ImageViewer
            open={open}
            onClose={() => {
              open.value = false;
            }}
            images={DEMO_IMAGES}
            imagesFromSelector="[data-image-viewer-demo-gallery] img"
            currentIndex={index}
            onIndexChange={(i) => {
              index.value = i;
            }}
            transition={viewerTransition}
            maskClosable
            keyboard
            showThumbnails
          />
          <CodeBlock
            title="代码示例（基础）"
            code={exampleBasic}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
          <CodeBlock
            title="代码示例（按 transition 打开）"
            code={exampleTransitionButtons}
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
              {IMAGE_VIEWER_API.map((row) => (
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
