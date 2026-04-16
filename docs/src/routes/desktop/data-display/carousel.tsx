/**
 * Carousel 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/data-display/carousel
 */

import { Carousel, CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const CAROUSEL_API: ApiRow[] = [
  {
    name: "images",
    type: "string[]",
    default: "-",
    description: "图片地址列表，传此项时内部渲染 img，无需传 children",
  },
  {
    name: "children",
    type: "unknown[]",
    default: "-",
    description: "轮播项（不传 images 时使用）",
  },
  {
    name: "current",
    type: "number | () => number",
    default: "-",
    description:
      "当前页（从 0 开始）；推荐 getter。不传则非受控内部切换。勿只传 `sig.value` 快照以免细粒度下不更新",
  },
  {
    name: "onChange",
    type: "(index: number) => void",
    default: "-",
    description: "切换回调",
  },
  {
    name: "autoplay",
    type: "boolean",
    default: "false",
    description: "是否自动播放",
  },
  {
    name: "interval",
    type: "number",
    default: "5000",
    description: "自动播放间隔（ms），默认 5000",
  },
  {
    name: "direction",
    type: "horizontal | vertical",
    default: "horizontal",
    description: "方向",
  },
  {
    name: "slidesToShow",
    type: "number",
    default: "1",
    description: "一屏显示张数",
  },
  {
    name: "infinite",
    type: "boolean",
    default: "true",
    description: "是否循环",
  },
  {
    name: "dots",
    type: "boolean",
    default: "-",
    description: "是否显示指示点",
  },
  {
    name: "arrows",
    type: "boolean",
    default: "true",
    description: "是否显示上一张/下一张切换按钮",
  },
  {
    name: "swipe",
    type: "boolean",
    default: "true",
    description:
      "是否允许在轮播区域鼠标拖移或手指滑动切换；与 arrows 独立，移动端可关箭头只用手势",
  },
  {
    name: "dotPosition",
    type: "bottom | top | left | right",
    default: "-",
    description: "指示点位置",
  },
  {
    name: "effect",
    type: "slide | fade | zoom | flip | mosaic | random",
    default: "slide",
    description:
      "切换动画：slide 轨道平移；fade / zoom / flip 层叠；mosaic 小方格随机渐入（仅 images，与 ImageViewer 一致；children 时降级 fade）；random 每次切页在 slide/fade/zoom/flip/mosaic 中随机（仅 children 时不含 mosaic）。多图并排时建议 slide",
  },
  {
    name: "speed",
    type: "number",
    default: "300",
    description: "切换动画时长（ms）",
  },
  {
    name: "height",
    type: "string",
    default: "横向 h-48，纵向 h-64",
    description: "容器高度，如 200px、16rem、50%；也可用 class 覆盖",
  },
  {
    name: "contentFit",
    type: "contain | cover | fill",
    default: "contain",
    description:
      "单项内图片显示方式：contain 完整显示不裁切，cover 铺满裁切，fill 铺满可拉伸",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "容器 class（可覆盖默认高度，如 h-64）",
  },
  {
    name: "lazySlides",
    type: "boolean",
    default: "false",
    description:
      "是否按需加载图片（仅当前及相邻 slide 加载大图，其余占位以降低内存；默认 false 保证全部显示）",
  },
];

/**
 * 文档示例图片：使用 placehold.co 直接返回 200 图片（无重定向）。
 * 尺寸适中以控制解码内存（约 800×320 单张约 1MB 解码，避免多张叠加到 1G+）。
 */
const DEMO_IMAGE_WIDTH = 800;
const DEMO_IMAGE_HEIGHT = 320;
const DEMO_CAROUSEL_HEIGHT = "20rem";

/** 文档示例使用的网络图片 URL 列表（placehold.co 无重定向，直接返回图片） */
const DEMO_IMAGES = [
  `https://placehold.co/${DEMO_IMAGE_WIDTH}x${DEMO_IMAGE_HEIGHT}/1e3a5f/fff?text=1`,
  `https://placehold.co/${DEMO_IMAGE_WIDTH}x${DEMO_IMAGE_HEIGHT}/2d5016/fff?text=2`,
  `https://placehold.co/${DEMO_IMAGE_WIDTH}x${DEMO_IMAGE_HEIGHT}/4a1c4a/fff?text=3`,
];

const importCode = `import { signal } from "@preact/signals";
import { Carousel } from "@dreamer/ui-preact";

const current = signal(0);
const images = [
  "https://placehold.co/800x320/1e3a5f/fff?text=1",
  "https://placehold.co/800x320/2d5016/fff?text=2",
];
<Carousel
  current={() => current.value}
  onChange={(i) => (current.value = i)}
  images={images}
  height="20rem"
  dots
  arrows
/>`;

const exampleDotsArrows = `<Carousel
  current={() => current.value}
  onChange={(i) => (current.value = i)}
  images={images}
  height="20rem"
  dots
  arrows
/>`;

/** 本页所有带 autoplay 的示例统一使用 5000ms 间隔 */
const DEMO_AUTOPLAY_INTERVAL_MS = 5000;

const exampleAutoplay = `<Carousel
  current={() => current.value}
  onChange={(i) => (current.value = i)}
  height="20rem"
  dots
  autoplay
  interval={${DEMO_AUTOPLAY_INTERVAL_MS}}
>
  {slides}
</Carousel>`;

/** 切换效果示例高度（略矮便于一屏多列） */
const DEMO_FX_HEIGHT = "11rem";

/** 六种 effect 代码示例（与下方 2×3 预览一一对应；均 autoplay；mosaic / random 仅 images 有意义） */
const exampleEffects = `// 每种 effect 单独一份索引，避免多个轮播联动
const curSlide = signal(0);
const curFade = signal(0);
const curZoom = signal(0);
const curFlip = signal(0);
const curMosaic = signal(0);
const curRandom = signal(0);

<Carousel
  effect="slide"
  speed={550}
  current={() => curSlide.value}
  onChange={(i) => (curSlide.value = i)}
  images={images}
  height="11rem"
  dots
  arrows
  autoplay
  interval={${DEMO_AUTOPLAY_INTERVAL_MS}}
/>
// fade / zoom / flip / mosaic 同上结构，仅 effect、speed、current 信号不同
<Carousel
  effect="random"
  speed={700}
  current={() => curRandom.value}
  onChange={(i) => (curRandom.value = i)}
  images={images}
  height="11rem"
  dots
  arrows
  autoplay
  interval={${DEMO_AUTOPLAY_INTERVAL_MS}}
/>`;

export default function DataDisplayCarousel() {
  const current = signal(0);
  /** autoplay 示例用独立 current，避免与 dots+arrows 共用导致双份 patch、闪烁与乱跳 */
  const currentAutoplay = signal(0);
  /** 各 effect 示例独立 current，避免互相抢状态 */
  const currentFxSlide = signal(0);
  const currentFxFade = signal(0);
  const currentFxZoom = signal(0);
  const currentFxFlip = signal(0);
  const currentFxMosaic = signal(0);
  const currentFxRandom = signal(0);

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Carousel 轮播图</Title>
        <Paragraph class="mt-2">
          轮播图：children、current、onChange、height（可设置高度）、effect、speed、autoplay、direction、dots、arrows
          等。宽度随容器，高度通过 height 或 class（如 h-64）设置。示例使用
          placehold.co 网络图片（直接 200，无重定向），传 images 数组即可。
          受控时请将 <code class="text-xs">current</code> 写成{" "}
          <code class="text-xs">&#123;() =&gt; sig.value&#125;</code>，勿只传
          {" "}
          <code class="text-xs">sig.value</code>{" "}
          快照，否则箭头与 autoplay 可能不切换。 勿再用外层{" "}
          <code class="text-xs">&#123;() =&gt; &lt;Carousel /&gt;&#125;</code>
          {" "}
          包裹整组件：父级本征子列表会出现动态 getter，View 无法
          canPatch，轮播根 <code class="text-xs">div</code>{" "}
          会被整块重挂，切换动画会失效。
        </Paragraph>
        <Paragraph class="mt-1 text-sm text-slate-600 dark:text-slate-400">
          图片默认{" "}
          <code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
            contentFit="contain"
          </code>，完整显示不裁切；可传{" "}
          <code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
            cover
          </code>{" "}
          铺满裁切、<code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
            fill
          </code>{" "}
          铺满可拉伸，图片宽高由使用者自行控制。
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
          <Title level={3}>dots + arrows（网络图片，高度可设置）</Title>
          <div class="w-full">
            {/* current 用 getter 即可细粒度订阅；勿外层再包 {() => <Carousel/>}，以免父级不可 patch */}
            <Carousel
              current={() => current.value}
              onChange={(i) => (current.value = i)}
              images={DEMO_IMAGES}
              height={DEMO_CAROUSEL_HEIGHT}
              dots
              arrows
            />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleDotsArrows}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>autoplay</Title>
          <div class="w-full">
            <Carousel
              current={() => currentAutoplay.value}
              onChange={(i) => (currentAutoplay.value = i)}
              images={DEMO_IMAGES}
              height={DEMO_CAROUSEL_HEIGHT}
              dots
              autoplay
              interval={DEMO_AUTOPLAY_INTERVAL_MS}
            />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleAutoplay}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>
            切换效果 effect（slide / fade / zoom / flip / mosaic / random）
          </Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            下方六个轮播<strong>各自独立</strong>索引，均为<strong>
              自动播放
            </strong>
            （也可点箭头手动切）；共用同一 <code class="text-xs">interval</code>
            {" "}
            时，组件内已将下一拍对齐到墙钟周期，
            多实例相位会趋同（仍非逐帧锁相，极端负载下可有毫秒级差）。布局为<strong>
              两排三列
            </strong>（大屏
            <code class="text-xs">lg:grid-cols-3</code>）。{" "}
            <code class="text-xs">slide</code> 为整轨横向平移；{" "}
            <code class="text-xs">fade</code> 为上层淡入、旧图垫底（与{" "}
            <code class="text-xs">ImageViewer</code> 一致）；{" "}
            <code class="text-xs">zoom</code>、<code class="text-xs">flip</code>
            {" "}
            为缩放与 Y 轴 3D 翻面；<code class="text-xs">mosaic</code>{" "}
            为小方格渐入（仅{" "}
            <code class="text-xs">images</code>）；<code class="text-xs">
              random
            </code>{" "}
            为<strong>每次切页</strong>在 slide / fade / zoom / flip / mosaic
            中随机一种（同样仅 <code class="text-xs">images</code>{" "}
            时含 mosaic）。若仍觉得淡，可调高 <code class="text-xs">speed</code>
            （mosaic 单格时长为内置常量）。
          </Paragraph>
          <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div class="space-y-2 min-w-0">
              <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
                effect=&quot;slide&quot;（轨道滑动）
              </p>
              <Carousel
                current={() => currentFxSlide.value}
                onChange={(i) => (currentFxSlide.value = i)}
                images={DEMO_IMAGES}
                height={DEMO_FX_HEIGHT}
                dots
                arrows
                autoplay
                interval={DEMO_AUTOPLAY_INTERVAL_MS}
                effect="slide"
                speed={550}
              />
            </div>
            <div class="space-y-2 min-w-0">
              <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
                effect=&quot;fade&quot;（上层淡入 · 旧图垫底）
              </p>
              <Carousel
                current={() => currentFxFade.value}
                onChange={(i) => (currentFxFade.value = i)}
                images={DEMO_IMAGES}
                height={DEMO_FX_HEIGHT}
                dots
                arrows
                autoplay
                interval={DEMO_AUTOPLAY_INTERVAL_MS}
                effect="fade"
                speed={650}
              />
            </div>
            <div class="space-y-2 min-w-0">
              <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
                effect=&quot;zoom&quot;（缩小再放大）
              </p>
              <Carousel
                current={() => currentFxZoom.value}
                onChange={(i) => (currentFxZoom.value = i)}
                images={DEMO_IMAGES}
                height={DEMO_FX_HEIGHT}
                dots
                arrows
                autoplay
                interval={DEMO_AUTOPLAY_INTERVAL_MS}
                effect="zoom"
                speed={700}
              />
            </div>
            <div class="space-y-2 min-w-0">
              <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
                effect=&quot;flip&quot;（Y 轴 3D）
              </p>
              <Carousel
                current={() => currentFxFlip.value}
                onChange={(i) => (currentFxFlip.value = i)}
                images={DEMO_IMAGES}
                height={DEMO_FX_HEIGHT}
                dots
                arrows
                autoplay
                interval={DEMO_AUTOPLAY_INTERVAL_MS}
                effect="flip"
                speed={750}
              />
            </div>
            <div class="space-y-2 min-w-0">
              <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
                effect=&quot;mosaic&quot;（小方格渐入）
              </p>
              <Carousel
                current={() => currentFxMosaic.value}
                onChange={(i) => (currentFxMosaic.value = i)}
                images={DEMO_IMAGES}
                height={DEMO_FX_HEIGHT}
                dots
                arrows
                autoplay
                interval={DEMO_AUTOPLAY_INTERVAL_MS}
                effect="mosaic"
              />
            </div>
            <div class="space-y-2 min-w-0">
              <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
                effect=&quot;random&quot;（每次切页随机效果）
              </p>
              <Carousel
                current={() => currentFxRandom.value}
                onChange={(i) => (currentFxRandom.value = i)}
                images={DEMO_IMAGES}
                height={DEMO_FX_HEIGHT}
                dots
                arrows
                autoplay
                interval={DEMO_AUTOPLAY_INTERVAL_MS}
                effect="random"
                speed={700}
              />
            </div>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleEffects}
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
              {CAROUSEL_API.map((row) => (
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
