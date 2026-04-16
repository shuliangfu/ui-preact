/**
 * Carousel 轮播图/幻灯片（Preact + @preact/signals）。
 * 多张内容横向/纵向轮播；自动播放、指示点、箭头、一屏多图、循环（`slide` 为 CSS `transform` 轨道平移，非 overflow 手指滑动）。
 *
 * **SSR / 无 document：** 浏览器下根节点为静态 `div`，仅**内部**渲染轨道与控件，避免与 Preact 协调冲突；受控 `current` 变更时应通过 signal/重渲染保持单实例。
 * {@link getDocument} 为 `null` 时同步展开内层，不注册 autoplay；浏览器内为**单链 `setTimeout` + 代次失效**，避免 `setInterval` 在 effect 重挂/HMR 后叠加导致久播乱闪；下一次切页按 {@link carouselAutoplayDelayToWallBoundaryMs} 对齐墙钟周期，便于同页多实例共 `interval` 时相位趋同（与仅 `setInterval` 的栈相比更不易越播越岔）。
 *
 * **受控与父级结构：** `current` 请传 `() => sig.value` 等 getter 即可；避免不必要的整棵子树替换导致轮播根重挂、切换动画失效。
 *
 * **`effect="slide"`：** 轨道用 `transform: translateX/Y` + 行内 `transition` 平移；切页在 `requestAnimationFrame` 后再提交索引。不用 `scrollTo(smooth)`（易与 patch、snap 冲突，表现为闪切或邻页露边）。
 * **`infinite` + `slide` + `slidesToShow===1`（≥2 张）：** 轨道首尾各克隆一页，末→首继续同向平移后再无过渡对齐真首帧，避免环形时整轨百分比从「最后一格」跳回「第一格」产生反向滑动感。
 *
 * **`images` + `lazySlides=false`：** 幻灯片内用原生 `<img>`（`loading="eager"`），不用 {@link Image}，避免其 loading 时 `opacity-0` 与卸载清空 `src` 在切页重绘时出现长时间黑块。
 *
 * **层叠效果（fade / zoom / flip / mosaic）**：与图片查看器（`ImageViewer`）相同思路——切页时上一张垫底；`mosaic` 为小方格随机渐入（仅 `images` 模式），`children` 模式下降级为 `fade`。
 * **`effect="random"`**：每次切页在 slide / fade / zoom / flip / mosaic 中随机择一（仅 `children` 时不含 mosaic）；首帧固定按 slide 布局以兼顾 SSR。
 *
 * **勿把轨道与箭头、指示点放进会被整段替换的同一子列表片段**：否则轨道 DOM 可能在切页时重建，过渡无效；应让轨道与指示点、箭头分层渲染，箭头静态 + `goRef`。
 *
 * **`arrows` / `swipe`：** `arrows` 控制是否显示左右切换按钮；`swipe` 控制是否在轮播区域用鼠标拖移或手指滑动切页（与 `touch-action` 配合，横向轮播保留纵向滚动手势）。二者独立，例如移动端可 `arrows={false} swipe` 仅手势切换。
 *
 * **滑动跟手：** `effect="slide"` 时在轨道百分比平移上叠加像素偏移；层叠效果（`fade` / `zoom` / `flip` / `mosaic`）无横向长条轨道，跟手阶段对**整轨容器**做同向 `translate`，松手后仍走各自 CSS 过渡切页；非 `infinite` 时在首尾阻尼为单向位移。
 *
 * **状态持久化：** 内部页码、层叠垫底索引、马赛克代次等须用 {@link useSignal}/{@link useRef}；**勿**在每次渲染里 `signal()` 或 `let` 重置，否则每帧丢失「上一页」与代次，层叠/马赛克在环形末张→首张等处表现为瞬切或无动画（与 `Collapse` / `ImageViewer` 同类问题）。
 */

import { effect, useSignal } from "@preact/signals";
import type { ComponentChildren, JSX } from "preact";
import { useRef } from "preact/hooks";
import { twMerge } from "tailwind-merge";

/**
 * 在浏览器或带 DOM 的 SSR 影子环境中返回 `document`，否则为 `null`（纯 SSR 无宿主文档）。
 */
function getDocument(): Document | null {
  return typeof globalThis.document !== "undefined"
    ? globalThis.document
    : null;
}
/** 按需：单文件图标，避免经 icons/mod 拉入全表 */
import { IconChevronLeft } from "../basic/icons/ChevronLeft.tsx";
import { IconChevronRight } from "../basic/icons/ChevronRight.tsx";
import { IMAGE_BUILTIN_FALLBACK_SRC } from "./Image.tsx";

/**
 * 轮播切换动画：`slide` 为轨道平移；`fade` / `zoom` / `flip` / `mosaic` 为层叠（`slidesToShow>1` 时仍建议用 slide）；
 * `random` 为每次切页在若干种效果中随机择一（`children` 时池内不含 `mosaic`，与单项 `mosaic` 降级一致）。
 */
export type CarouselTransitionEffect =
  | "slide"
  | "fade"
  | "zoom"
  | "flip"
  | "mosaic"
  | "random";

/** 实际参与布局/CSS 的切换类型（不含 `random`） */
export type CarouselConcreteTransitionEffect = Exclude<
  CarouselTransitionEffect,
  "random"
>;

/** `effect="random"` 时参与抽签的候选（`mosaic` 在仅 `children` 时由 {@link carouselPickRandomConcreteEffect} 剔除） */
const CAROUSEL_RANDOM_EFFECT_POOL: readonly CarouselConcreteTransitionEffect[] =
  [
    "slide",
    "fade",
    "zoom",
    "flip",
    "mosaic",
  ];

/**
 * 从候选池中随机一条具体效果；无 `images` 时不抽 `mosaic`，避免与 children 降级规则冲突。
 *
 * @param p - 轮播 props
 */
function carouselPickRandomConcreteEffect(
  p: CarouselProps,
): CarouselConcreteTransitionEffect {
  const slides = carouselSlidesInfo(p);
  const pool = slides.useImages
    ? [...CAROUSEL_RANDOM_EFFECT_POOL]
    : CAROUSEL_RANDOM_EFFECT_POOL.filter((e) => e !== "mosaic");
  const n = pool.length;
  if (n === 0) return "slide";
  return pool[Math.floor(Math.random() * n)]!;
}

/**
 * 将 `random` 解析为当前用于渲染的具体效果（由内部 signal 保存每次切页抽签结果）。
 *
 * @param p - 轮播 props
 * @param randomPick - `effect="random"` 时使用的具体效果
 */
function carouselResolveRenderEffect(
  p: CarouselProps,
  randomPick: CarouselConcreteTransitionEffect,
): CarouselConcreteTransitionEffect {
  const raw = (p.effect ?? "slide") as CarouselTransitionEffect;
  if (raw !== "random") return raw as CarouselConcreteTransitionEffect;
  return randomPick;
}

/** 层叠位效果子集（与 {@link carouselIsStackedEffect} 一致） */
type CarouselStackedKind = "fade" | "zoom" | "flip" | "mosaic";

/**
 * 层叠模式下每一页必须叠在同一矩形内；若仍为 `relative` 块级流式排列，多页会纵向堆高，
 * 在 `overflow:hidden` 的轨道里只能看到错误一截（空白、压住指示点、上下错位等）。
 */
const carouselStackedSlideLayoutStyle: Record<string, string | number> = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
};

/**
 * 是否为层叠切换（绝对定位叠放、不移动整条轨道）。
 *
 * @param e - 已解析的具体效果（不含 `random`）
 */
function carouselIsStackedEffect(
  e: CarouselConcreteTransitionEffect,
): e is CarouselStackedKind {
  return (
    e === "fade" ||
    e === "zoom" ||
    e === "flip" ||
    e === "mosaic"
  );
}

/** 与 ImageViewer 一致的马赛克网格参数 */
const CAROUSEL_MOSAIC_COLS = 8;
const CAROUSEL_MOSAIC_ROWS = 6;
const CAROUSEL_MOSAIC_CELL_MS = 260;
const CAROUSEL_MOSAIC_STAGGER_MS = 14;

/**
 * 移除轨道上 `mosaic` 叠层，避免换图或改 `effect` 后残留方格。
 *
 * @param mount - 轨道根节点（`data-carousel-track-root`）；SSR / 虚拟节点上可能无 DOM API，需跳过。
 */
function carouselRemoveMosaicOverlays(
  mount: HTMLElement | null | undefined,
): void {
  if (mount == null) return;
  // Hybrid SSR 清理时 ref 可能不是真实 Element（无 querySelectorAll），避免抛错导致整页 500
  if (typeof mount.querySelectorAll !== "function") return;
  mount.querySelectorAll("[data-dreamer-carousel-mosaic]").forEach((el) => {
    el.remove();
  });
}

/**
 * 系统是否开启「减少动态效果」。
 *
 * @returns 为 `true` 时马赛克降级为瞬时切换
 */
function carouselPrefersReducedMotion(): boolean {
  try {
    return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")
      ?.matches === true;
  } catch {
    return false;
  }
}

/**
 * 按单项 `contentFit` 计算图片在容器内的绘制框（马赛克 `background-*` 与真实 `img` 对齐；`cover`/`contain`/`fill`）。
 *
 * @param containerW - 容器内容宽
 * @param containerH - 容器内容高
 * @param naturalW - 位图宽
 * @param naturalH - 位图高
 * @param fit - 与 {@link CarouselProps.contentFit} 一致
 */
function carouselObjectFitDrawRect(
  containerW: number,
  containerH: number,
  naturalW: number,
  naturalH: number,
  fit: NonNullable<CarouselProps["contentFit"]>,
): { drawW: number; drawH: number; offX: number; offY: number } {
  const cw = Math.max(0, containerW);
  const ch = Math.max(0, containerH);
  let iw = naturalW;
  let ih = naturalH;
  if (!Number.isFinite(iw) || iw <= 0) iw = cw > 0 ? cw : 1;
  if (!Number.isFinite(ih) || ih <= 0) ih = ch > 0 ? ch : 1;
  if (cw <= 0 || ch <= 0) {
    return { drawW: cw, drawH: ch, offX: 0, offY: 0 };
  }
  if (fit === "fill") {
    return { drawW: cw, drawH: ch, offX: 0, offY: 0 };
  }
  if (fit === "contain") {
    const s = Math.min(cw / iw, ch / ih);
    const drawW = iw * s;
    const drawH = ih * s;
    return { drawW, drawH, offX: (cw - drawW) / 2, offY: (ch - drawH) / 2 };
  }
  const s = Math.max(cw / iw, ch / ih);
  const drawW = iw * s;
  const drawH = ih * s;
  return { drawW, drawH, offX: (cw - drawW) / 2, offY: (ch - drawH) / 2 };
}

/**
 * 判断两 URL 是否指向同一资源（`img.currentSrc` 与 `nextSrc`；相对/绝对写法归一）。
 *
 * @param a - 当前地址
 * @param b - 目标地址
 */
function carouselSameResourceUrl(a: string, b: string): boolean {
  if (a === b) return true;
  try {
    const base = globalThis.location?.href ?? "http://carousel.local/";
    return new URL(a, base).href === new URL(b, base).href;
  } catch {
    return false;
  }
}

/**
 * 轨道内 `data-carousel-slide-inner` 相对轨道根的内容盒原点与宽高。
 * 马赛克叠层必须用 **inner 的 client 尺寸 + {@link carouselObjectFitDrawRect}** 对齐 `object-fit`，
 * 切换瞬间勿信 `img.getBoundingClientRect()`（新图未解码时常仍为上一张的布局尺寸）。
 *
 * @param mount - `data-carousel-track-root`
 * @param inner - 单项内容容器
 */
function carouselMosaicInnerContentBoxInTrack(
  mount: HTMLElement,
  inner: HTMLElement,
): { left: number; top: number; cw: number; ch: number } {
  const mbr = mount.getBoundingClientRect();
  const ir = inner.getBoundingClientRect();
  return {
    left: ir.left - mbr.left + inner.clientLeft,
    top: ir.top - mbr.top + inner.clientTop,
    cw: inner.clientWidth,
    ch: inner.clientHeight,
  };
}

/**
 * `images` 且 `lazySlides=false` 时用原生 img 的 object-fit 类。
 * 不用 {@link Image}：其 loading 态为 `opacity-0`，且卸载时会清空 `src`；内层随 `current` 重跑若重建子树，会反复进入 loading，切页长时间只见灰/黑底。
 *
 * @param fit - 与 {@link CarouselProps.contentFit} 一致
 */
function carouselNativeImgClass(
  fit: NonNullable<CarouselProps["contentFit"]>,
): string {
  const fitCls = fit === "contain"
    ? "object-contain"
    : fit === "fill"
    ? "object-fill"
    : "object-cover";
  return twMerge(
    "block w-full h-full min-w-0 min-h-0",
    fitCls,
  );
}

/** 层叠切换时单张 slide 的角色（与 ImageViewer 双缓冲：underlay = 旧图垫底） */
type CarouselStackedSlideRole = "active" | "underlay" | "hidden";

/**
 * 解析层叠模式下第 `i` 张的角色。
 *
 * @param i - slide 下标
 * @param cur - 当前页
 * @param underlayIdx - 过渡期内垫在下面的上一页；`null` 表示无过渡
 */
function carouselStackedSlideRoleOf(
  i: number,
  cur: number,
  underlayIdx: number | null,
): CarouselStackedSlideRole {
  if (i === cur) return "active";
  if (underlayIdx !== null && i === underlayIdx) return "underlay";
  return "hidden";
}

/**
 * 层叠布局下单张 slide 的**目标** opacity / transform（与 {@link carouselStackedSlideRole} 配合）。
 * fade：仅透明度叠化，无位移（对齐 ImageViewer `fade`）；underlay / active 在过渡期内均保持不透明。
 *
 * @param kind - fade / zoom / flip / mosaic
 * @param role - active | underlay | hidden
 */
function carouselStackedSlideAnimatedStyle(
  kind: CarouselStackedKind,
  role: CarouselStackedSlideRole,
): Record<string, string | number> {
  if (kind === "fade" || kind === "mosaic") {
    if (role === "hidden") {
      return { opacity: 0, transform: "none" };
    }
    return { opacity: 1, transform: "none" };
  }
  // zoom：hidden 态缩得足够小，切入时「由小放大」才明显（0.88 仅约 12%，肉眼偏弱）
  if (kind === "zoom") {
    if (role === "hidden") {
      return { opacity: 0, transform: "scale(0.72)" };
    }
    return { opacity: 1, transform: "scale(1)" };
  }
  if (role === "hidden") {
    return {
      opacity: 0,
      transform: "rotateY(-86deg) scale(0.88) translateZ(-20px)",
    };
  }
  return {
    opacity: 1,
    transform: "rotateY(0deg) scale(1) translateZ(0)",
  };
}

/**
 * 层叠模式下单张 slide 的**完整**行内样式：transition longhand + 动画终态。
 * **不依赖** Tailwind 是否生成 `transition-*` 任意类；文档站若未打进对应 CSS，原先会表现为完全瞬切。
 *
 * @param kind - fade / zoom / flip / mosaic
 * @param i - slide 下标
 * @param cur - 当前页
 * @param underlayIdx - 过渡期内垫底上一页
 * @param speedMs - 与 {@link CarouselProps.speed} 一致
 * @param mosaicHideActive - `mosaic` 且叠层播放中：当前页先透明，避免与方格叠层重复绘制
 */
function carouselStackedSlideStyle(
  kind: CarouselStackedKind,
  i: number,
  cur: number,
  underlayIdx: number | null,
  speedMs: number,
  mosaicHideActive = false,
): Record<string, string | number> {
  const role = carouselStackedSlideRoleOf(i, cur, underlayIdx);
  if (kind === "mosaic" && role === "active" && mosaicHideActive) {
    return {
      ...carouselStackedSlideLayoutStyle,
      opacity: 0,
      transitionProperty: "none",
      transitionDuration: "0ms",
      transitionTimingFunction: "linear",
      willChange: "auto",
    };
  }
  // 方格结束揭开时：当前页须**瞬时**不透明；若仍用 `speed` 的 opacity 过渡，叠层一撤会从 0 缓到 1，肉眼像闪一下/发灰
  if (kind === "mosaic" && role === "active" && !mosaicHideActive) {
    return {
      ...carouselStackedSlideLayoutStyle,
      ...carouselStackedSlideAnimatedStyle(kind, role),
      transitionProperty: "none",
      transitionDuration: "0ms",
      transitionTimingFunction: "linear",
      willChange: "auto",
    };
  }
  const timing = kind === "fade" || kind === "mosaic"
    ? "cubic-bezier(0.45, 0, 0.55, 1)"
    : kind === "zoom"
    // 略抬高贝塞尔控制点 y，收尾略带「弹出感」，配合更小起始 scale 强化「缩小再放大」
    ? "cubic-bezier(0.28, 1.18, 0.55, 1.02)"
    : "cubic-bezier(0.45, 0, 0.2, 1)";
  const anim = carouselStackedSlideAnimatedStyle(kind, role);
  const transitionProperty = kind === "fade" || kind === "mosaic"
    ? "opacity"
    : "opacity, transform";
  const out: Record<string, string | number> = {
    transitionProperty,
    transitionDuration: `${speedMs}ms`,
    transitionTimingFunction: timing,
    willChange: kind === "fade" || kind === "mosaic"
      ? "opacity"
      : "opacity, transform",
    ...anim,
  };
  if (kind === "flip") {
    out.transformOrigin = "center center";
    out.backfaceVisibility = "hidden";
  } else if (kind === "zoom") {
    // 从中心缩放，避免贴边裁切时「往一角缩」看起来像在平移
    out.transformOrigin = "center center";
  }
  return out;
}

export interface CarouselProps {
  /** 图片地址列表；传此项时轮播内部渲染 img，无需传 children */
  images?: string[];
  /** 轮播项（每项一屏或与 slidesToShow 配合）；不传 images 时使用此项 */
  children?: unknown[];
  /**
   * 当前页（从 0 开始）：可传 number、getter（推荐 `() => sig.value`，勿只传快照）；
   * 不传则由组件内部维护（无需再传 `onChange` 也可切换，传了则仍可通知外部）。
   */
  current?: number | (() => number);
  /** 切换回调 */
  onChange?: (index: number) => void;
  /** 是否自动播放 */
  autoplay?: boolean;
  /** 自动播放间隔（ms），默认 5000 */
  interval?: number;
  /** 方向：horizontal | vertical */
  direction?: "horizontal" | "vertical";
  /** 一屏显示几张（默认 1） */
  slidesToShow?: number;
  /** 是否循环，默认 true */
  infinite?: boolean;
  /** 是否显示指示点 */
  dots?: boolean;
  /** 是否显示左右/上下箭头切换按钮，默认 true */
  arrows?: boolean;
  /**
   * 是否允许在轮播区域通过鼠标拖移或手指滑动切换（Pointer Events，移动端与桌面均可）。
   * 默认 true；设为 false 时仅箭头、指示点、自动播放可切换。
   */
  swipe?: boolean;
  /** 指示点位置 */
  dotPosition?: "bottom" | "top" | "left" | "right";
  /**
   * 切换效果：slide 轨道平移；fade / zoom / flip / mosaic 为层叠（mosaic 为小方格随机渐入，仅 `images`；思路同 `ImageViewer`）；
   * random 为每次切页在 slide/fade/zoom/flip/mosaic 中随机择一（仅 children 时不含 mosaic）。
   */
  effect?: CarouselTransitionEffect;
  /** 切换动画时长（ms），默认 300 */
  speed?: number;
  /** 容器高度，如 "200px"、"16rem"、"50%"；不传时横向默认 h-48、纵向默认 h-64；也可通过 class 覆盖（如 class="h-64"） */
  height?: string;
  /**
   * 单项内图片等内容的显示方式（对直接子元素 img 生效）：
   * - cover: 铺满裁切，默认；
   * - contain: 完整显示不裁切，可能留白；
   * - fill: 自动宽高铺满显示，可能拉伸变形以填满区域。
   */
  contentFit?: "contain" | "cover" | "fill";
  /** 额外 class（宽度随容器，高度可用 class 或 height 覆盖） */
  class?: string;
  /** 单项 class */
  slideClass?: string;
  /**
   * 是否按需加载图片（仅当前及相邻 slide 加载大图，其余用占位以降低内存）。
   * 默认 false，保证所有 slide 均能正常显示；设为 true 可省内存但依赖 patch 替换占位，部分环境下第 2/3 张可能不显示。
   */
  lazySlides?: boolean;
}

/**
 * 计算到「下一 `period` 毫秒墙钟边界」的延时，用于自动播链式 `setTimeout` 的**下一次**调度。
 *
 * 同页多个 Carousel 若仅各自 `setTimeout(ms)`，挂载时刻与 wrap/层叠的 40ms 重试会把相位拉开；对齐到
 * `Date.now()` 的 `period` 整数倍后，相同 `period`（由 `interval` 与 `speed` 推得的 `ms`）的实例会趋同。
 *
 * @param period - 已含 `Math.max(400, interval, speed+160)` 的周期（毫秒）
 */
function carouselAutoplayDelayToWallBoundaryMs(period: number): number {
  if (!Number.isFinite(period) || period < 1) return 1;
  const now = Date.now();
  const nextSlot = Math.floor(now / period) * period + period;
  return Math.max(1, nextSlot - now);
}

/**
 * 从 `props` 解析轮播数据来源与张数；在渲染 getter 内调用，避免 images/children 变更后仍用旧 count。
 */
function carouselSlidesInfo(p: CarouselProps): {
  useImages: boolean;
  images: string[] | undefined;
  slides: unknown[];
  count: number;
} {
  const useImages = Array.isArray(p.images) && p.images.length > 0;
  if (useImages) {
    return {
      useImages: true,
      images: p.images,
      slides: [],
      count: p.images!.length,
    };
  }
  const ch = p.children;
  const slides = Array.isArray(ch) ? ch : ch != null ? [ch] : [];
  return { useImages: false, images: undefined, slides, count: slides.length };
}

/**
 * 将原始索引归一化到 `[0, count)`。
 *
 * @param raw - 原始下标
 * @param count - 张数
 */
function carouselNormalizeIndex(raw: number, count: number): number {
  if (count === 0) return 0;
  const n = Math.trunc(raw);
  if (!Number.isFinite(n)) return 0;
  return ((n % count) + count) % count;
}

/**
 * 层叠垫底与马赛克 `effect` 使用的「已提交到轮播内部的页码」：仅对内部页码 signal 的取值做归一化。
 *
 * **勿在 `effect` 内用 {@link carouselResolveCurrentIndex} 取 `cur`：** 受控时它会读 `current()`，
 * 从而订阅外层 signal；父级每次写同一索引（或无关 bump）都会重跑 effect，cleanup 打断马赛克定时器，
 * 表现为 `mosaic:arm` / `mosaic:finalize` 刷屏、似卡在某张。`commitCarouselIndex` 已保证先 `onChange` 再写 internal，
 * 故此处与视觉页码一致。**`go` / autoplay / 箭头** 计算「从哪一页再 ±1」时也应以此为准，勿单独用
 * {@link carouselResolveCurrentIndex}（受控时只认 `current()`）：否则 `commit` 已把 `internal` 推到 1，而
 * `current()` 仍短暂为 0 时，`go(1)` 会反复提交 1，表现为卡在第二张、进不了第三张。
 *
 * @param internalVal - 组件内 `useSignal` 保存的当前页（与 commit 写入同步）
 * @param count - 张数
 */
function carouselEffectCommittedSlideIndex(
  internalVal: number,
  count: number,
): number {
  if (count === 0) return 0;
  return carouselNormalizeIndex(internalVal, count);
}

/**
 * 解析当前页（受控 getter 或 `internalVal`），供轨道、指示点、手势等共用；层叠垫底与马赛克 `effect` 请用
 * {@link carouselEffectCommittedSlideIndex}，避免在 `effect` 内订阅受控 `current()`。
 *
 * @param p - 轮播 props
 * @param internalVal - 非受控时内部 signal 的 `.value`
 * @param count - 张数
 */
function carouselResolveCurrentIndex(
  p: CarouselProps,
  internalVal: number,
  count: number,
): number {
  if (count === 0) return 0;
  if (p.current === undefined) {
    return carouselNormalizeIndex(internalVal, count);
  }
  const v = typeof p.current === "function" ? p.current() : p.current;
  const num = typeof v === "number" ? v : Number(v);
  return carouselNormalizeIndex(num, count);
}

/**
 * 轨道布局、指示点、跟手首尾钳制用的逻辑页下标。
 *
 * **为何与 {@link carouselResolveCurrentIndex} 分流：** 层叠（fade / zoom / flip / mosaic）的
 * 视觉状态由 {@link commitCarouselIndex} 写入的 `internal` 与垫底 signal 驱动；马赛克还在 DOM 上
 * 按 `[data-carousel-slide="${cur}"]` 锚定当前格。若此处仍读受控 `current()`，父级晚一拍更新时会
 * 出现「方格已跟 internal 指到新页、下方 slide 的 z-index/opacity 仍按旧页算」——唯独 mosaic 明显，
 * 其他效果多为整轨 opacity/transform，错位不如方格+真节点双层明显。
 *
 * **`slide` 轨道平移** 与 {@link commitCarouselIndex} / 无限首尾克隆 wrap 一致，须用已提交 internal；
 * 若仍读受控 `current()`，wrap 收尾已写 `internal=0` 而父级晚一帧仍为末张时，`translate` 会从末格插值到首格，
 * 表现为自动播末张→首张时整轨从右向左扫过中间张；手动点击往往已同步故不易见。
 *
 * @param p - 轮播 props
 * @param internalVal - 内部 signal 当前值（与 commit 同步）
 * @param count - 张数
 * @param effectResolved - 当前帧解析后的具体过渡（含 `random` 抽签）
 */
function carouselTrackDisplaySlideIndex(
  p: CarouselProps,
  internalVal: number,
  count: number,
  effectResolved: CarouselConcreteTransitionEffect,
): number {
  if (count === 0) return 0;
  if (carouselIsStackedEffect(effectResolved)) {
    return carouselEffectCommittedSlideIndex(internalVal, count);
  }
  if (effectResolved === "slide") {
    return carouselEffectCommittedSlideIndex(internalVal, count);
  }
  return carouselResolveCurrentIndex(p, internalVal, count);
}

/**
 * 指示点高亮下标：`mosaic` 播放中方格叠层替代当前页真节点（active 被置透明），肉眼主画面仍是
 * 垫底上一张图；若指示点仍按已提交 `internal`（下一页）高亮，会出现「大图还是
 * 上一张、点已指向下一张」——fade/zoom/flip 的 active 仍参与叠化，无此「只见旧图」阶段。
 *
 * @param p - 轮播 props
 * @param internalVal - 内部已提交页
 * @param count - 张数
 * @param effectResolved - 当前帧解析后的具体过渡
 * @param mosaicSuppress - 是否处于马赛克叠层替代 active 阶段
 * @param underIdx - 垫底上一页；非 mosaic 或未播放时可传 `null`
 */
function carouselDotsActiveSlideIndex(
  p: CarouselProps,
  internalVal: number,
  count: number,
  effectResolved: CarouselConcreteTransitionEffect,
  mosaicSuppress: boolean,
  underIdx: number | null,
): number {
  if (count === 0) return 0;
  if (
    effectResolved === "mosaic" &&
    mosaicSuppress &&
    underIdx !== null
  ) {
    return carouselEffectCommittedSlideIndex(underIdx, count);
  }
  return carouselTrackDisplaySlideIndex(
    p,
    internalVal,
    count,
    effectResolved,
  );
}

export function Carousel(props: CarouselProps): JSX.Element {
  /** 非受控（未传 `current`）时的内部当前页；须 {@link useSignal}，勿用每次渲染新建的 `signal()`。 */
  const internalIndexRef = useSignal(0);
  /**
   * `effect="random"` 时当前这一次切页使用的具体效果；首帧固定为 slide，便于 SSR 与客户端首屏一致，首次切页起才抽签。
   */
  const randomEffectPickRef = useSignal<CarouselConcreteTransitionEffect>(
    "slide",
  );
  /** 与 `resolveCurrent` 同步，供定时器 tick 读取 */
  const currentRef = { current: 0 };
  /**
   * `setInterval` 内调用最新 `go`；若闭包捕获初次挂载的 `go`，受控下 `onChange` 已更新但 `currentRef` 不前进，会反复请求同一页。
   */
  const goRef: { current: (delta: number) => void } = { current: () => {} };

  /** 轨道根 DOM，供 `mosaic` 叠层 `appendChild` */
  const carouselTrackMountRef: { current: HTMLElement | null } = {
    current: null,
  };
  /** `mosaic` 播放中方格叠层替代当前页，避免与下层 `img` 叠画 */
  const mosaicSuppressActiveRef = useSignal(false);
  /** 防止快速连点时旧马赛克 `finalize` 误清状态；须跨渲染持久 */
  const carouselMosaicRunIdRef = useRef(0);

  /** 最外层轮播容器：挂载滑动切换的指针监听 */
  const carouselRootRef: { current: HTMLElement | null } = { current: null };
  /**
   * ref 每次写入时 bump，使滑动 `effect` 在 DOM 就绪或容器替换后重新 `addEventListener`。
   */
  const carouselRootMountTick = useSignal(0);

  /**
   * 滑动跟手：沿主方向（横为 `clientX` 差、纵为 `clientY` 差）的像素偏移。
   * - `slide`：写入 `translate(calc(-索引% + 偏移))`；
   * - 层叠效果：整轨 `translate`，仅预览位移，切页仍由层叠 opacity/transform 动画承担。
   */
  const carouselSwipeDragPxRef = useSignal(0);
  /**
   * 指针按下后是否已产生跟手位移会话；为真时轨道 `transform` 关闭 transition，避免逐帧与 CSS 过渡打架。
   */
  const carouselSwipeDraggingRef = useSignal(false);

  /**
   * 手动切换时 bump `.value`，让 autoplay 的 effect 重跑并清除旧定时器、重新计时，
   * 避免与 setInterval 叠加导致乱跳。
   */
  const resetAutoplayTokenRef = useSignal(0);

  /**
   * 层叠模式下「已稳定提交的上一页」索引与垫底层；须在**所有** `effect` 之前用 hook/ref 声明，
   * 否则每帧 `let` 归零会导致永远走「首帧初始化」分支、叠化/马赛克整段不跑。
   */
  const stackedUnderlayIdxRef = useSignal<number | null>(null);
  const stackedPrevCommittedRef = useRef(-1);
  const stackedUnderlayClearTimerRef = useRef<
    ReturnType<typeof globalThis.setTimeout> | undefined
  >(undefined);

  /**
   * `infinite` + 平移 `slide` + `slidesToShow===1`：轨道首尾各克隆一页；本索引驱动 `transform`（0..count+1），
   * 末张→首张继续向左滑入尾侧「首图克隆」，再无过渡对齐真首屏，避免 `-66%→0%` 的反向滑动感。
   */
  const carouselSlideVisualIdxRef = useSignal(1);
  const carouselSlideWrapLockRef = useSignal(false);
  const carouselSlideSnapNoTransRef = useSignal(false);
  const carouselSlideWrapGenRef = useRef(0);
  const carouselSlideWrapTimerRef = useRef<
    ReturnType<typeof globalThis.setTimeout> | undefined
  >(undefined);

  const resetAutoplay = () => {
    resetAutoplayTokenRef.value = resetAutoplayTokenRef.value + 1;
  };

  /**
   * 自动播放链式 `setTimeout` 的代次：effect 清理或重挂时递增，使已排队的回调变为 no-op，避免与旧计时器叠用。
   * （`setInterval` 在 HMR、父级重渲染导致 effect 异常重跑、或清理未跑满时更易出现多实例叠加、乱闪。）
   */
  const autoplayLaneGenRef = useRef(0);
  /** 当前自动播放唯一挂起的 `setTimeout` id，便于清理与替换 */
  const autoplayNextTimerRef = useRef<
    ReturnType<typeof globalThis.setTimeout> | undefined
  >(undefined);

  /**
   * `scheduleCarouselIndexCommit` 合帧：同一帧内多次 `schedule` 时只保留**最后一次**目标索引、共用一条 RAF，
   * 避免排队多个 `commitCarouselIndex`（例如手势与 autoplay 同帧、或连点）依次提交 1→2 再 2→1，mosaic/层叠会在 1、2 间来回闪。
   */
  const pendingCarouselIndexCommitRef = useRef<number | undefined>(undefined);
  const carouselIndexCommitRafRef = useRef<number | undefined>(undefined);

  /**
   * 提交页码：在浏览器端延后到下一 animation frame 再写入 signal / onChange，
   * 让上一帧 paint 后再 patch 轨道的 `transform` 或层叠 `opacity`，CSS `transition` 才能从旧值插值。
   *
   * **受控与非受控均同步 `internalIndexRef`：** 须把归一化后的索引写回 `internalIndexRef`，以便依赖
   * `void internalIndexRef.value` 的 effect（mosaic、层叠垫底）随切页重跑。
   *
   * **顺序：**须先 `onChange`、再写 `internalIndexRef`。若先 bump `internalIndexRef`，受控下会立刻触发上述
   * effect，而此时尚未 `onChange`，`current()` 仍为旧页，`carouselResolveCurrentIndex` 与 `internal` 不一致，
   * 会写错 `stackedUnderlayIdxRef`、马赛克用错 `cur`，表现为指示点与画面错位、只在 1↔2 间闪。
   */
  const commitCarouselIndex = (next: number) => {
    const { count } = carouselSlidesInfo(props);
    const normalized = count === 0 ? 0 : carouselNormalizeIndex(next, count);
    if (
      count > 0 && (props.effect ?? "slide") === "random"
    ) {
      /** 与 `go` 一致：用已提交 internal，避免受控 `current()` 滞后导致 random 抽签误判 */
      const prevCur = carouselEffectCommittedSlideIndex(
        internalIndexRef.value,
        count,
      );
      if (
        carouselNormalizeIndex(prevCur, count) !== normalized
      ) {
        randomEffectPickRef.value = carouselPickRandomConcreteEffect(props);
      }
    }
    props.onChange?.(normalized);
    internalIndexRef.value = normalized;
    currentRef.current = normalized;
  };

  /**
   * 将目标页排队到下一帧提交；同帧内多次调用会**覆盖**为最后一次 `next`，且只注册**一个** RAF。
   *
   * @param next - 归一化前的目标下标（与 {@link go} 中算出的 `next` 一致，提交时再 normalize）
   */
  const scheduleCarouselIndexCommit = (next: number) => {
    const hadPendingRaf = carouselIndexCommitRafRef.current !== undefined;
    pendingCarouselIndexCommitRef.current = next;
    if (hadPendingRaf) {
      return;
    }
    if (
      getDocument() != null &&
      typeof globalThis.requestAnimationFrame === "function"
    ) {
      carouselIndexCommitRafRef.current = globalThis.requestAnimationFrame(
        () => {
          carouselIndexCommitRafRef.current = undefined;
          const v = pendingCarouselIndexCommitRef.current;
          pendingCarouselIndexCommitRef.current = undefined;
          if (v !== undefined) commitCarouselIndex(v);
        },
      );
    } else {
      const v = pendingCarouselIndexCommitRef.current;
      pendingCarouselIndexCommitRef.current = undefined;
      if (v !== undefined) commitCarouselIndex(v);
    }
  };

  /** 卸载时取消未执行的合帧提交，避免组件已销毁仍 `commit` */
  effect(() => {
    return () => {
      const id = carouselIndexCommitRafRef.current;
      if (
        id !== undefined &&
        typeof globalThis.cancelAnimationFrame === "function"
      ) {
        globalThis.cancelAnimationFrame(id);
      }
      carouselIndexCommitRafRef.current = undefined;
      pendingCarouselIndexCommitRef.current = undefined;
    };
  });

  /**
   * 清除环形平移 wrap 的延时收尾，避免与下一次切页叠用。
   */
  const clearCarouselSlideWrapTimer = () => {
    const t = carouselSlideWrapTimerRef.current;
    if (t !== undefined) {
      globalThis.clearTimeout(t);
      carouselSlideWrapTimerRef.current = undefined;
    }
  };

  /**
   * 中断进行中的 infinite-slide 克隆过渡，把视觉索引拉回与当前逻辑页一致。
   */
  const abortInfiniteSlideWrapAnim = () => {
    clearCarouselSlideWrapTimer();
    if (!carouselSlideWrapLockRef.value) return;
    carouselSlideWrapLockRef.value = false;
    carouselSlideSnapNoTransRef.value = false;
    const { count: n } = carouselSlidesInfo(props);
    if (n < 2) {
      carouselSlideVisualIdxRef.value = 1;
      return;
    }
    /** 与 {@link go} 一致：wrap 中断时须对齐已提交 internal，勿读滞后 `current()` 误设视觉格 */
    const L = carouselEffectCommittedSlideIndex(
      internalIndexRef.value,
      n,
    );
    carouselSlideVisualIdxRef.value = L + 1;
  };

  /**
   * 尾克隆滑完后：无过渡对齐到真首屏索引 1，并提交逻辑页 0。
   *
   * `setTimeout` 与合成层绘制可能不同步：若在同一宏任务内立刻改 `translate` + `commit`，
   * 浏览器仍可能用「带 transition 的上一帧」插值到中间格，表现为整轨往回拖或闪一下。
   * 故先 `requestAnimationFrame` 再执行无过渡对齐，保证克隆位最后一帧已提交后再瞬移到真首。
   */
  const finishSlideForwardWrap = () => {
    clearCarouselSlideWrapTimer();
    globalThis.requestAnimationFrame(() => {
      carouselSlideSnapNoTransRef.value = true;
      carouselSlideVisualIdxRef.value = 1;
      commitCarouselIndex(0);
      globalThis.requestAnimationFrame(() => {
        carouselSlideSnapNoTransRef.value = false;
        carouselSlideWrapLockRef.value = false;
      });
    });
  };

  /**
   * 首克隆滑完后：无过渡对齐到真末屏，并提交逻辑页 count-1。
   *
   * 与 {@link finishSlideForwardWrap} 同理：在下一帧再无过渡对齐，避免首克隆过渡末帧与瞬移打架。
   *
   * @param count - 真实张数
   */
  const finishSlideBackwardWrap = (count: number) => {
    clearCarouselSlideWrapTimer();
    globalThis.requestAnimationFrame(() => {
      carouselSlideSnapNoTransRef.value = true;
      carouselSlideVisualIdxRef.value = count;
      commitCarouselIndex(count - 1);
      globalThis.requestAnimationFrame(() => {
        carouselSlideSnapNoTransRef.value = false;
        carouselSlideWrapLockRef.value = false;
      });
    });
  };

  /**
   * 切换页码（供箭头、autoplay、指示点调用）；每次读取最新 `count` / `current`，无需依赖函数子重挂。
   *
   * @param delta - 相对当前页的位移（±1）
   */
  const go = (delta: number) => {
    const { count } = carouselSlidesInfo(props);
    if (count === 0) return;
    /** 箭头 / autoplay 切页时丢弃跟手位移，避免 `calc(% + px)` 与逻辑页错位（受控 `current` 下同理）。 */
    carouselSwipeDraggingRef.value = false;
    carouselSwipeDragPxRef.value = 0;
    /**
     * 克隆首尾过渡中：`finishSlideForwardWrap` 会清 timer，并在 RAF 内完成无过渡对齐；`wrapLock` 直至收尾 RAF 才解除。
     * 仅判断 timer 会漏掉「timer 已空、锁仍在」的窗口，叠用 `go` 会叠 RAF/视觉与下一次切页，表现为猛闪、乱切。
     */
    if (
      carouselSlideWrapTimerRef.current !== undefined ||
      carouselSlideWrapLockRef.value
    ) {
      abortInfiniteSlideWrapAnim();
    }
    const infinite = props.infinite !== false;
    /**
     * 相对位移的「当前页」必须以已向内部提交的 {@link internalIndexRef} 为准（与层叠/马赛克一致）；
     * 受控下若用 {@link carouselResolveCurrentIndex} 只读 `current()`，易与 `internal` 短暂错位，反复算成仍在 0、只向 1 走。
     */
    const c = carouselEffectCommittedSlideIndex(
      internalIndexRef.value,
      count,
    );
    let next = c + delta;
    if (infinite) next = ((next % count) + count) % count;
    else next = Math.max(0, Math.min(count - 1, next));

    const eff = carouselResolveRenderEffect(props, randomEffectPickRef.value);
    const slidesToShow = props.slidesToShow ?? 1;
    const slideInfiniteStrip = count >= 2 &&
      infinite &&
      !carouselIsStackedEffect(eff) &&
      eff === "slide" &&
      slidesToShow === 1;

    if (slideInfiniteStrip && delta === 1 && c === count - 1 && next === 0) {
      const g = ++carouselSlideWrapGenRef.current;
      carouselSlideWrapLockRef.value = true;
      carouselSlideVisualIdxRef.value = count + 1;
      const ms = props.speed ?? 300;
      carouselSlideWrapTimerRef.current = globalThis.setTimeout(() => {
        carouselSlideWrapTimerRef.current = undefined;
        if (g !== carouselSlideWrapGenRef.current) return;
        finishSlideForwardWrap();
      }, ms);
      return;
    }
    if (slideInfiniteStrip && delta === -1 && c === 0 && next === count - 1) {
      const g = ++carouselSlideWrapGenRef.current;
      carouselSlideWrapLockRef.value = true;
      carouselSlideVisualIdxRef.value = 0;
      const ms = props.speed ?? 300;
      carouselSlideWrapTimerRef.current = globalThis.setTimeout(() => {
        carouselSlideWrapTimerRef.current = undefined;
        if (g !== carouselSlideWrapGenRef.current) return;
        finishSlideBackwardWrap(count);
      }, ms);
      return;
    }

    scheduleCarouselIndexCommit(next);
  };

  goRef.current = go;

  effect(() => {
    return () => clearCarouselSlideWrapTimer();
  });

  /**
   * 在根容器上注册拖移/滑动切页：水平轮播以横向位移为主判据，纵向轮播以纵向为主；忽略从 `button` 开始的指针。
   * `document` 捕获阶段监听 `pointermove` / `pointerup` / `pointercancel`，避免在 `<img>` 上拖移结束时指针落在根节点外导致收不到抬起；轮播内 `img` 另设 `draggable={false}` 防止浏览器默认拖图抢走指针。
   */
  effect(() => {
    void carouselRootMountTick.value;
    if (getDocument() == null) return;
    if (props.swipe === false) return;
    const root = carouselRootRef.current;
    if (root == null) return;
    const { count } = carouselSlidesInfo(props);
    if (count <= 1) return;

    const doc = globalThis.document;
    const horizontal = (props.direction ?? "horizontal") === "horizontal";
    /** 超过该位移（px）且为主方向分量时记为一次切换 */
    const thresholdPx = 48;

    let tracking = false;
    let pointerId = -1;
    let startX = 0;
    let startY = 0;

    /**
     * 立即清零跟手偏移（切页或无需回弹动画时调用，避免与下一帧索引动画叠化冲突）。
     */
    const clearSwipeDragInstant = () => {
      carouselSwipeDraggingRef.value = false;
      carouselSwipeDragPxRef.value = 0;
    };

    /**
     * 松手未切页时：先结束 dragging 态以恢复 transition，再在下一帧把位移归零，触发轨道回弹动画。
     */
    const clearSwipeDragAnimated = () => {
      carouselSwipeDraggingRef.value = false;
      if (
        getDocument() != null &&
        typeof globalThis.requestAnimationFrame === "function"
      ) {
        globalThis.requestAnimationFrame(() => {
          carouselSwipeDragPxRef.value = 0;
        });
      } else {
        carouselSwipeDragPxRef.value = 0;
      }
    };

    /**
     * 结束跟手：移除 document 监听并释放 capture。
     */
    const stopTracking = () => {
      if (!tracking) return;
      tracking = false;
      doc.removeEventListener("pointermove", onDocumentPointerMove, true);
      doc.removeEventListener("pointerup", onDocumentPointerUp, true);
      doc.removeEventListener("pointercancel", onDocumentPointerCancel, true);
      try {
        root.releasePointerCapture(pointerId);
      } catch {
        /* ignore */
      }
      pointerId = -1;
    };

    /**
     * document 捕获阶段 `pointermove`：更新跟手像素；非循环时在首尾钳制单向预览，避免拉出空白。
     */
    const onDocumentPointerMove = (ev: PointerEvent) => {
      if (!tracking || ev.pointerId !== pointerId) return;
      const infinite = props.infinite !== false;
      /** 与轨道 {@link readCur} 一致：层叠下钳制位移以 internal 为准 */
      const cur = carouselTrackDisplaySlideIndex(
        props,
        internalIndexRef.value,
        count,
        carouselResolveRenderEffect(props, randomEffectPickRef.value),
      );
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let primary = horizontal ? dx : dy;
      if (!infinite) {
        if (cur <= 0) primary = Math.min(0, primary);
        if (cur >= count - 1) primary = Math.max(0, primary);
      }
      carouselSwipeDraggingRef.value = true;
      carouselSwipeDragPxRef.value = primary;
    };

    /**
     * 在 document 上收到抬起/取消：统一在这里算位移并切页。
     */
    const onDocumentPointerUp = (ev: PointerEvent) => {
      if (!tracking || ev.pointerId !== pointerId) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      stopTracking();
      const movedEnough = horizontal
        ? Math.abs(dx) > 2 || Math.abs(dy) > 2
        : Math.abs(dy) > 2 || Math.abs(dx) > 2;
      if (horizontal) {
        if (Math.abs(dx) < thresholdPx || Math.abs(dx) <= Math.abs(dy)) {
          if (movedEnough) clearSwipeDragAnimated();
          else clearSwipeDragInstant();
          return;
        }
        clearSwipeDragInstant();
        resetAutoplay();
        if (dx < 0) goRef.current(1);
        else goRef.current(-1);
      } else {
        if (Math.abs(dy) < thresholdPx || Math.abs(dy) <= Math.abs(dx)) {
          if (movedEnough) clearSwipeDragAnimated();
          else clearSwipeDragInstant();
          return;
        }
        clearSwipeDragInstant();
        resetAutoplay();
        if (dy < 0) goRef.current(1);
        else goRef.current(-1);
      }
    };

    const onDocumentPointerCancel = (ev: PointerEvent) => {
      if (!tracking || ev.pointerId !== pointerId) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      stopTracking();
      const movedEnough = horizontal
        ? Math.abs(dx) > 2 || Math.abs(dy) > 2
        : Math.abs(dy) > 2 || Math.abs(dx) > 2;
      if (movedEnough) clearSwipeDragAnimated();
      else clearSwipeDragInstant();
    };

    /**
     * 仅主键；从按钮起手的不当滑动；按下后在 document 上捕获抬起。
     */
    const onPointerDown = (ev: PointerEvent) => {
      if (ev.button !== 0) return;
      const el = ev.target;
      if (
        el instanceof globalThis.Element &&
        el.closest("button") != null
      ) {
        return;
      }
      if (tracking) return;
      tracking = true;
      pointerId = ev.pointerId;
      startX = ev.clientX;
      startY = ev.clientY;
      doc.addEventListener("pointermove", onDocumentPointerMove, true);
      doc.addEventListener("pointerup", onDocumentPointerUp, true);
      doc.addEventListener("pointercancel", onDocumentPointerCancel, true);
      try {
        root.setPointerCapture(ev.pointerId);
      } catch {
        /* 无 capture 时仍依赖 document 冒泡捕获 */
      }
    };

    root.addEventListener("pointerdown", onPointerDown);

    return () => {
      stopTracking();
      clearSwipeDragInstant();
      root.removeEventListener("pointerdown", onPointerDown);
      doc.removeEventListener("pointermove", onDocumentPointerMove, true);
      doc.removeEventListener("pointerup", onDocumentPointerUp, true);
      doc.removeEventListener("pointercancel", onDocumentPointerCancel, true);
    };
  });

  /**
   * 跳到指定索引（指示点）。
   *
   * @param i - 目标下标
   */
  const goToIndex = (i: number) => {
    const { count } = carouselSlidesInfo(props);
    if (count === 0) return;
    carouselSwipeDraggingRef.value = false;
    carouselSwipeDragPxRef.value = 0;
    abortInfiniteSlideWrapAnim();
    const ni = carouselNormalizeIndex(i, count);
    scheduleCarouselIndexCommit(ni);
  };

  /** 自动播放：仅在有 document（浏览器或 SSR 影子）时注册，避免纯 SSR flush 时无宿主文档 */
  effect(() => {
    if (getDocument() == null) return;
    if (!props.autoplay) return;
    const { count } = carouselSlidesInfo(props);
    if (count <= 1) return;
    void resetAutoplayTokenRef.value;
    const rawInterval = props.interval ?? 5000;
    const parsedInterval =
      typeof rawInterval === "number" && Number.isFinite(rawInterval)
        ? rawInterval
        : 5000;
    const speedMs = props.speed ?? 300;
    /**
     * 间隔不得短于单次切换动画 + 余量；非法 interval 回退，避免 0ms 连发。
     */
    const ms = Math.max(
      400,
      parsedInterval,
      speedMs + 160,
    );

    const lane = ++autoplayLaneGenRef.current;

    /**
     * 撤掉当前 lane 上挂起的单次延时，避免链式 setTimeout 与 effect 清理打架。
     */
    const clearAutoplayTimer = () => {
      const t = autoplayNextTimerRef.current;
      if (t !== undefined) {
        globalThis.clearTimeout(t);
        autoplayNextTimerRef.current = undefined;
      }
    };

    /**
     * 在 `delay` 后执行 `fn`（仅当 lane 仍为当前代次）；先清旧定时器，保证任意时刻最多一个挂起。
     *
     * @param delay - 毫秒
     * @param fn - 回调
     */
    const armAutoplay = (delay: number, fn: () => void) => {
      clearAutoplayTimer();
      if (lane !== autoplayLaneGenRef.current) return;
      autoplayNextTimerRef.current = globalThis.setTimeout(() => {
        autoplayNextTimerRef.current = undefined;
        if (lane !== autoplayLaneGenRef.current) return;
        fn();
      }, delay);
    };

    /**
     * 单次自动切页并在间隔后排队下一次；wrap 进行中则短延迟重试，避免与 `go` 内 abort 叠用。
     */
    const autoplayStep = () => {
      if (lane !== autoplayLaneGenRef.current) return;
      if (
        carouselSlideWrapTimerRef.current !== undefined ||
        carouselSlideWrapLockRef.value
      ) {
        armAutoplay(40, autoplayStep);
        return;
      }
      /**
       * 层叠（含 mosaic）过渡期内 `stackedUnderlayIdxRef` 非空：此时再 `go` 会与垫底/马赛克 effect
       * 交错，易在相邻张之间反复 arm/cleanup。slide 无限首尾克隆由 wrap 定时器单独处理。
       */
      const apEff = carouselResolveRenderEffect(
        props,
        randomEffectPickRef.value,
      );
      if (
        carouselIsStackedEffect(apEff) &&
        stackedUnderlayIdxRef.value !== null
      ) {
        armAutoplay(40, autoplayStep);
        return;
      }
      goRef.current(1);
      /** 成功切页后按墙钟对齐下一拍，减轻多实例间漂移 */
      armAutoplay(
        carouselAutoplayDelayToWallBoundaryMs(ms),
        autoplayStep,
      );
    };

    armAutoplay(carouselAutoplayDelayToWallBoundaryMs(ms), autoplayStep);

    return () => {
      autoplayLaneGenRef.current += 1;
      clearAutoplayTimer();
    };
  });

  /**
   * 层叠 fade/zoom/flip：`current` 变化时把**上一索引**记入垫底层，在 `speed` 毫秒内保持不透明，
   * 再清空（与 `ImageViewer` 新层淡入、旧层暂留的思路一致）。
   */
  effect(() => {
    void randomEffectPickRef.value;
    void stackedUnderlayIdxRef.value;
    const eff = carouselResolveRenderEffect(
      props,
      randomEffectPickRef.value,
    );
    if (!carouselIsStackedEffect(eff)) {
      stackedUnderlayIdxRef.value = null;
      stackedPrevCommittedRef.current = -1;
      if (stackedUnderlayClearTimerRef.current !== undefined) {
        globalThis.clearTimeout(stackedUnderlayClearTimerRef.current);
        stackedUnderlayClearTimerRef.current = undefined;
      }
      return;
    }
    const { count } = carouselSlidesInfo(props);
    if (count <= 1) return;
    /** 仅用 internal，避免 `effect` 内读受控 `current()` 订阅外层 signal 导致反复垫底 / 马赛克重入 */
    const cur = carouselEffectCommittedSlideIndex(
      internalIndexRef.value,
      count,
    );
    const speedMs = props.speed ?? 300;

    if (stackedPrevCommittedRef.current < 0) {
      stackedPrevCommittedRef.current = cur;
      return;
    }
    if (stackedPrevCommittedRef.current === cur) return;

    /** 同值不写回，避免部分运行时重复 notify，马赛克 effect 仅依赖 `under` 时被无意义二次触发 */
    const nextUnderIdx = stackedPrevCommittedRef.current;
    if (stackedUnderlayIdxRef.peek() !== nextUnderIdx) {
      stackedUnderlayIdxRef.value = nextUnderIdx;
    }
    stackedPrevCommittedRef.current = cur;
    if (stackedUnderlayClearTimerRef.current !== undefined) {
      globalThis.clearTimeout(stackedUnderlayClearTimerRef.current);
    }
    const slidesMeta = carouselSlidesInfo(props);
    const mosaicUsesDom = eff === "mosaic" &&
      slidesMeta.useImages &&
      getDocument() != null &&
      !carouselPrefersReducedMotion();
    // mosaic 由方格动画结束回调清空垫底层，不用 `speed` 定时器
    if (mosaicUsesDom) {
      stackedUnderlayClearTimerRef.current = undefined;
    } else {
      stackedUnderlayClearTimerRef.current = globalThis.setTimeout(() => {
        stackedUnderlayIdxRef.value = null;
        stackedUnderlayClearTimerRef.current = undefined;
      }, speedMs);
    }
  });

  /**
   * `effect="mosaic"`：在轨道内叠小方格网格（与 {@link ImageViewer} 同参），旧页垫底、新图分块渐入。
   */
  effect(() => {
    let fallbackTimer: ReturnType<typeof globalThis.setTimeout> | undefined;
    /** 取消挂起的 `runMosaic` 双 RAF，避免 HMR / effect 重跑后旧回调与新的 `runId` 交错 */
    let armMosaicRaf0: number | undefined;
    let armMosaicRaf1: number | undefined;
    /** effect 重跑或卸载时清理定时器、未执行的 RAF 与叠层 DOM */
    const cleanupMosaic = () => {
      if (fallbackTimer !== undefined) {
        globalThis.clearTimeout(fallbackTimer);
      }
      if (
        armMosaicRaf0 !== undefined &&
        typeof globalThis.cancelAnimationFrame === "function"
      ) {
        globalThis.cancelAnimationFrame(armMosaicRaf0);
        armMosaicRaf0 = undefined;
      }
      if (
        armMosaicRaf1 !== undefined &&
        typeof globalThis.cancelAnimationFrame === "function"
      ) {
        globalThis.cancelAnimationFrame(armMosaicRaf1);
        armMosaicRaf1 = undefined;
      }
      carouselRemoveMosaicOverlays(carouselTrackMountRef.current);
      mosaicSuppressActiveRef.value = false;
    };

    /**
     * **仅此**订阅 `stackedUnderlayIdxRef`；`randomEffectPickRef` / `internalIndexRef` 一律用 `peek()`，
     * 避免把本 effect 绑到无关 signal 更新导致 arm/finalize 死循环。轨道上的「当前页」样式已改用
     * {@link carouselTrackDisplaySlideIndex}（层叠时与 internal 一致），此处 `peek()` 与方格锚定的
     * slide DOM 不再与下方 CSS 打架。
     */
    const under = stackedUnderlayIdxRef.value;

    if (getDocument() == null) {
      return cleanupMosaic;
    }
    const eff = carouselResolveRenderEffect(
      props,
      randomEffectPickRef.peek(),
    );
    const info = carouselSlidesInfo(props);
    if (eff !== "mosaic" || !info.useImages || info.count <= 1) {
      return cleanupMosaic;
    }

    const cur = carouselEffectCommittedSlideIndex(
      internalIndexRef.peek(),
      info.count,
    );
    const contentFit = props.contentFit ?? "cover";

    if (under === null) {
      mosaicSuppressActiveRef.value = false;
      carouselRemoveMosaicOverlays(carouselTrackMountRef.current);
      return cleanupMosaic;
    }

    const nextSrc = info.images![cur];
    if (nextSrc === undefined || nextSrc === "") {
      mosaicSuppressActiveRef.value = false;
      if (stackedUnderlayIdxRef.peek() !== null) {
        stackedUnderlayIdxRef.value = null;
      }
      return cleanupMosaic;
    }

    if (carouselPrefersReducedMotion()) {
      mosaicSuppressActiveRef.value = false;
      if (stackedUnderlayIdxRef.peek() !== null) {
        stackedUnderlayIdxRef.value = null;
      }
      return cleanupMosaic;
    }

    const runId = ++carouselMosaicRunIdRef.current;
    mosaicSuppressActiveRef.value = true;

    const totalMs = (CAROUSEL_MOSAIC_COLS * CAROUSEL_MOSAIC_ROWS - 1) *
        CAROUSEL_MOSAIC_STAGGER_MS +
      CAROUSEL_MOSAIC_CELL_MS +
      140;

    /**
     * 叠层结束：**同一同步块**内撤方格、清垫底、关 suppress。
     *
     * 若先 `mosaicSuppressActiveRef = false` 再在下一帧才清 `stackedUnderlayIdxRef`，会出现一帧
     * `suppress=false` 且 `under` 仍非 `null`：指示点在两种算法间跳、自动播 `go` 可能与马赛克抢跑，
     * 表现为相邻张之间反复闪。
     */
    const finalize = () => {
      if (runId !== carouselMosaicRunIdRef.current) return;
      if (fallbackTimer !== undefined) {
        globalThis.clearTimeout(fallbackTimer);
        fallbackTimer = undefined;
      }
      carouselRemoveMosaicOverlays(carouselTrackMountRef.current);
      if (stackedUnderlayIdxRef.peek() !== null) {
        stackedUnderlayIdxRef.value = null;
      }
      mosaicSuppressActiveRef.value = false;
    };

    /**
     * 挂载马赛克：绘制框**只用** `data-carousel-slide-inner` 的 client 尺寸 + {@link carouselObjectFitDrawRect}，
     * 与 `img` 的 `object-fit` 一致；natural 尺寸来自已解码的 DOM `img` 或 `Image()` 预载（切换瞬间勿用 `img` 的 `getBoundingClientRect()` 作主路径，易残留上一张的布局尺寸）。
     */
    const runMosaic = () => {
      if (runId !== carouselMosaicRunIdRef.current) return;
      const doc = globalThis.document;
      if (doc == null) {
        finalize();
        return;
      }

      const mount0 = carouselTrackMountRef.current;
      if (mount0 == null) {
        finalize();
        return;
      }

      carouselRemoveMosaicOverlays(mount0);

      const slideStart = mount0.querySelector(
        `[data-carousel-slide="${String(cur)}"]`,
      ) as HTMLElement | null;
      const imgStart = slideStart?.querySelector("img") as
        | HTMLImageElement
        | null;
      const innerStart = slideStart?.querySelector(
        "[data-carousel-slide-inner]",
      ) as HTMLElement | null;
      if (slideStart == null || imgStart == null || innerStart == null) {
        finalize();
        return;
      }

      if (mount0.clientWidth < 4 || mount0.clientHeight < 4) {
        finalize();
        return;
      }

      /**
       * 在已知位图宽高后挂网；异步回调内重新查询 slide/inner，保证与 DOM `img` 换图后位置一致。
       *
       * @param naturalW - 目标图 naturalWidth
       * @param naturalH - 目标图 naturalHeight
       */
      const appendMosaic = (naturalW: number, naturalH: number) => {
        if (runId !== carouselMosaicRunIdRef.current) return;
        const mount = carouselTrackMountRef.current;
        if (mount == null) {
          finalize();
          return;
        }
        carouselRemoveMosaicOverlays(mount);

        const slideEl = mount.querySelector(
          `[data-carousel-slide="${String(cur)}"]`,
        ) as HTMLElement | null;
        const innerNow = slideEl?.querySelector(
          "[data-carousel-slide-inner]",
        ) as HTMLElement | null;
        if (slideEl == null || innerNow == null) {
          finalize();
          return;
        }

        const box = carouselMosaicInnerContentBoxInTrack(mount, innerNow);
        if (box.cw < 2 || box.ch < 2) {
          finalize();
          return;
        }

        const fb = carouselObjectFitDrawRect(
          box.cw,
          box.ch,
          naturalW,
          naturalH,
          contentFit,
        );
        const offX = box.left + fb.offX;
        const offY = box.top + fb.offY;
        const drawW = fb.drawW;
        const drawH = fb.drawH;
        if (drawW < 2 || drawH < 2) {
          finalize();
          return;
        }

        const cols = CAROUSEL_MOSAIC_COLS;
        const rows = CAROUSEL_MOSAIC_ROWS;
        const cellW = drawW / cols;
        const cellH = drawH / rows;

        const overlay = doc.createElement("div");
        overlay.setAttribute("data-dreamer-carousel-mosaic", "");
        overlay.setAttribute("aria-hidden", "true");
        overlay.style.position = "absolute";
        overlay.style.left = `${offX}px`;
        overlay.style.top = `${offY}px`;
        overlay.style.width = `${drawW}px`;
        overlay.style.height = `${drawH}px`;
        overlay.style.zIndex = "25";
        overlay.style.display = "grid";
        overlay.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        overlay.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        overlay.style.pointerEvents = "none";
        overlay.style.overflow = "hidden";

        const totalCells = rows * cols;
        const order = Array.from({ length: totalCells }, (_, idx) => idx);
        for (let oi = order.length - 1; oi > 0; oi--) {
          const j = Math.floor(Math.random() * (oi + 1));
          const tmp = order[oi]!;
          order[oi] = order[j]!;
          order[j] = tmp;
        }

        const bgUrl = `url(${JSON.stringify(nextSrc)})`;
        let k = 0;
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const cell = doc.createElement("div");
            cell.style.backgroundImage = bgUrl;
            cell.style.backgroundSize = `${drawW}px ${drawH}px`;
            cell.style.backgroundPosition = `-${col * cellW}px -${
              row * cellH
            }px`;
            cell.style.backgroundRepeat = "no-repeat";
            cell.style.opacity = "0";
            cell.style.transition =
              `opacity ${CAROUSEL_MOSAIC_CELL_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            cell.style.transitionDelay = `${
              order[k]! * CAROUSEL_MOSAIC_STAGGER_MS
            }ms`;
            overlay.appendChild(cell);
            k++;
          }
        }

        mount.appendChild(overlay);
        void overlay.offsetWidth;
        globalThis.requestAnimationFrame(() => {
          if (runId !== carouselMosaicRunIdRef.current) {
            carouselRemoveMosaicOverlays(mount);
            return;
          }
          for (let c = 0; c < overlay.children.length; c++) {
            const el = overlay.children[c] as HTMLElement;
            el.style.opacity = "1";
          }
        });

        fallbackTimer = globalThis.setTimeout(() => finalize(), totalMs);
      };

      const domReady = imgStart.naturalWidth > 0 &&
        imgStart.naturalHeight > 0 &&
        carouselSameResourceUrl(
          imgStart.currentSrc || imgStart.src,
          nextSrc,
        );

      if (domReady) {
        appendMosaic(imgStart.naturalWidth, imgStart.naturalHeight);
        return;
      }

      const probeBox = carouselMosaicInnerContentBoxInTrack(
        mount0,
        innerStart,
      );
      const cwFb = Math.max(1, probeBox.cw);
      const chFb = Math.max(1, probeBox.ch);

      const probe = new Image();
      probe.referrerPolicy = "no-referrer";
      probe.onload = () => {
        if (runId !== carouselMosaicRunIdRef.current) return;
        appendMosaic(
          probe.naturalWidth > 0 ? probe.naturalWidth : cwFb,
          probe.naturalHeight > 0 ? probe.naturalHeight : chFb,
        );
      };
      probe.onerror = () => {
        if (runId !== carouselMosaicRunIdRef.current) return;
        appendMosaic(cwFb, chFb);
      };
      probe.src = nextSrc;
    };

    armMosaicRaf0 = globalThis.requestAnimationFrame(() => {
      armMosaicRaf0 = undefined;
      armMosaicRaf1 = globalThis.requestAnimationFrame(() => {
        armMosaicRaf1 = undefined;
        runMosaic();
      });
    });
    return cleanupMosaic;
  });

  /**
   * 构建轨道。浏览器分支在渲染中读取 signal，使 class/style/data 随状态更新；SSR 分支输出静态快照。
   * 避免在子树中频繁替换整段 DOM，否则轨道与图片节点重建会导致 CSS transition 不连续。
   *
   * @param reactiveBrowser - `true` 为浏览器（响应式）；`false` 为 SSR 快照
   */
  const buildCarouselTrackElement = (reactiveBrowser: boolean) => {
    const {
      direction = "horizontal",
      slidesToShow = 1,
      contentFit = "cover",
      slideClass,
      lazySlides = false,
    } = props;

    const { useImages, images: imagesList, slides, count } = carouselSlidesInfo(
      props,
    );

    if (count === 0) return null;

    const infinite = props.infinite !== false;
    const speed = props.speed ?? 300;
    const isHorizontal = direction === "horizontal";

    /**
     * 读取当前帧用于布局的具体效果（订阅 `randomEffectPickRef` 以便 `effect="random"` 时轨道在 slide/层叠间切换）。
     */
    const readEffectResolved = (): CarouselConcreteTransitionEffect =>
      carouselResolveRenderEffect(props, randomEffectPickRef.value);

    const readLayoutStacked = (): boolean =>
      carouselIsStackedEffect(readEffectResolved());

    /** 层叠与马赛克与 internal 对齐；slide 轨与受控 `current()` 对齐（见 {@link carouselTrackDisplaySlideIndex}） */
    const readCur = () =>
      carouselTrackDisplaySlideIndex(
        props,
        internalIndexRef.value,
        count,
        readEffectResolved(),
      );

    const readUnderlay = (): number | null =>
      readLayoutStacked() ? stackedUnderlayIdxRef.value : null;

    const contentFitClass = contentFit === "contain"
      ? "[&>img]:object-contain [&>img]:w-full [&>img]:h-full"
      : contentFit === "cover"
      ? "[&>img]:object-cover [&>img]:w-full [&>img]:h-full"
      : "[&>img]:object-fill [&>img]:w-full [&>img]:h-full [&>img]:min-w-full [&>img]:min-h-full";

    /**
     * 扩展轨道下标 `ext`（0 = 末张克隆，1..count = 真实页，count+1 = 首张克隆）映射到逻辑页下标。
     *
     * @param ext - 扩展轨道单元下标（0..count+1）
     * @param n - 真实张数
     */
    const logicalFromExtIdx = (ext: number, n: number): number => {
      if (ext === 0) return n - 1;
      if (ext <= n) return ext - 1;
      return 0;
    };

    /**
     * 是否启用「首尾克隆 + 视觉索引」的 infinite 平移条（仅 `slide` 且一屏一张且至少两张）。
     *
     * @param eff - 已解析的具体切换效果
     */
    const readSlideInfiniteStrip = (
      eff: CarouselConcreteTransitionEffect,
    ): boolean =>
      count >= 2 &&
      infinite &&
      !carouselIsStackedEffect(eff) &&
      eff === "slide" &&
      slidesToShow === 1;

    /**
     * @param eff - 已解析的具体效果
     */
    const extCountFor = (eff: CarouselConcreteTransitionEffect): number =>
      readSlideInfiniteStrip(eff) ? count + 2 : count;

    /**
     * 每个轨道单元占整条轨道的百分比（100 / 单元数）。
     *
     * @param eff - 已解析的具体效果
     */
    const cellPercentFor = (eff: CarouselConcreteTransitionEffect): number =>
      100 / extCountFor(eff);

    const slideStyleSlideModeFor = (
      eff: CarouselConcreteTransitionEffect,
    ): Record<string, string | number> => {
      const cp = cellPercentFor(eff);
      return isHorizontal
        ? { width: `${cp}%`, flexShrink: 0, minHeight: 0 }
        : { height: `${cp}%`, flexShrink: 0 };
    };

    /**
     * @param index - 当前轨道索引（层叠或非 infinite-strip 平移用）
     * @param stacked - 是否层叠布局（与 {@link readLayoutStacked} 一致）
     * @param extCount - 平移模式下轨道上的单元数（含克隆时为 count+2）
     */
    const trackStyleFor = (
      index: number,
      stacked: boolean,
      extCount: number,
    ) =>
      stacked
        ? {
          position: "relative" as const,
          width: "100%",
          height: "100%",
        }
        : isHorizontal
        ? {
          transform: `translateX(-${index * (100 / extCount)}%)`,
          display: "flex",
          width: `${extCount * (100 / slidesToShow)}%`,
          minHeight: "100%",
        }
        : {
          transform: `translateY(-${index * (100 / extCount)}%)`,
          display: "flex",
          flexDirection: "column" as const,
          height: `${extCount * 100}%`,
        };

    const isSlideActiveFor = (activeIndex: number, i: number) => {
      if (!lazySlides || !useImages) return true;
      if (i === activeIndex) return true;
      if (!infinite || count <= 2) return false;
      const prev = (activeIndex - 1 + count) % count;
      const next = (activeIndex + 1) % count;
      return i === prev || i === next;
    };

    /**
     * `lazySlides` 下扩展轨道某一格是否应加载图片（按逻辑页及其环形邻页）。
     *
     * @param activeLogical - 当前逻辑页
     * @param ext - 扩展轨道下标
     * @param n - 真实张数
     */
    const isSlideActiveForExtended = (
      activeLogical: number,
      ext: number,
      n: number,
    ): boolean => {
      const logical = logicalFromExtIdx(ext, n);
      return isSlideActiveFor(activeLogical, logical);
    };

    /** 层叠模式下松手回弹：与 `speed` 对齐上限，避免比切页动画慢太多 */
    const stackedSwipeSnapTransition: Record<string, string> = {
      transitionProperty: "transform",
      transitionDuration: `${Math.min(240, speed)}ms`,
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    };

    const swipeDragTransitionNone: Record<string, string> = {
      transitionProperty: "none",
      transitionDuration: "0ms",
    };

    /**
     * 合并轨道根行内样式：读 `carouselSwipeDragPxRef` / `carouselSwipeDraggingRef`（浏览器端渲染中订阅）。
     * - 平移 `slide`：`calc(-百分比 + 像素)`；
     * - 层叠：整轨额外 `translate`，与单页 fade/zoom/flip 的 transform 叠加在父子层，互不覆盖。
     *
     * @param curIdx - 当前页索引
     */
    const mergeTrackStyle = (
      curIdx: number,
    ): Record<string, string | number | undefined> => {
      void randomEffectPickRef.value;
      void carouselSlideSnapNoTransRef.value;
      void carouselSlideWrapLockRef.value;
      const wrapLocked = carouselSlideWrapLockRef.value;
      const dragPx = carouselSwipeDragPxRef.value;
      const dragging = carouselSwipeDraggingRef.value;
      const effectResolved = readEffectResolved();
      const stacked = carouselIsStackedEffect(effectResolved);
      const extCount = extCountFor(effectResolved);
      const strip = readSlideInfiniteStrip(effectResolved);
      const trackBase = trackStyleFor(curIdx, stacked, extCount);
      const slideTrackTransition: Record<string, string> = !stacked
        ? {
          transitionProperty: "transform",
          transitionDuration: `${speed}ms`,
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }
        : {};

      if (!stacked) {
        /**
         * 非 wrap 时用 `curIdx+1` 与扩展轨道对齐；`curIdx` 经 {@link readCur} → {@link carouselTrackDisplaySlideIndex}，
         * `slide` 时已与 internal 同步，避免无限末→首收尾后 `current()` 滞后导致整轨反向扫过中间张。
         */
        if (strip) void carouselSlideVisualIdxRef.value;
        const visualIdx = strip
          ? (wrapLocked ? carouselSlideVisualIdxRef.value : curIdx + 1)
          : curIdx;
        const cellPct = 100 / extCount;
        const pct = visualIdx * cellPct;
        const trans = isHorizontal
          ? `translateX(calc(-${pct}% + ${dragPx}px))`
          : `translateY(calc(-${pct}% + ${dragPx}px))`;
        const snapNoTrans = strip && carouselSlideSnapNoTransRef.value;
        return {
          ...trackBase,
          transform: trans,
          ...(
            dragging || snapNoTrans
              ? swipeDragTransitionNone
              : slideTrackTransition
          ),
        };
      }

      const dragActive = dragPx !== 0 || dragging;
      const dragTransform = isHorizontal
        ? `translateX(${dragPx}px)`
        : `translateY(${dragPx}px)`;
      const stackedDragBlock = dragActive
        ? {
          transform: dragTransform,
          ...(dragging ? swipeDragTransitionNone : stackedSwipeSnapTransition),
        }
        : {};

      if (effectResolved === "flip") {
        return {
          ...trackBase,
          isolation: "isolate",
          perspective: "1000px",
          transformStyle: "preserve-3d",
          ...stackedDragBlock,
        };
      }
      return {
        ...trackBase,
        isolation: "isolate",
        ...stackedDragBlock,
      };
    };

    const slideImgOuterSlideModeClass = twMerge(
      "overflow-hidden bg-slate-200 dark:bg-slate-700 flex",
      "relative",
      isHorizontal && "h-full",
      slideClass,
    );

    const stackedZClass = (i: number, curIdx: number, under: number | null) =>
      i === curIdx
        ? "z-[3]"
        : under !== null && i === under
        ? "z-[2]"
        : "z-0 pointer-events-none";

    const slideChildSlideModeClass = twMerge(
      "flex items-center justify-center overflow-hidden",
      contentFitClass,
      "relative",
      isHorizontal && "h-full",
      slideClass,
    );

    /**
     * 层叠模式下行内样式；`effect` 为 slide 时不应调用（由 slide 模式 width/轨道负责）。
     *
     * @param i - slide 下标
     * @param curIdx - 当前页
     * @param under - 垫底层索引
     * @param hideMosaicActive - mosaic 播放中是否隐藏当前页真节点
     */
    const slideStackedStyle = (
      i: number,
      curIdx: number,
      under: number | null,
      hideMosaicActive: boolean,
    ) => {
      const er = readEffectResolved();
      const stackedKindForCss: CarouselStackedKind =
        er === "mosaic" && !useImages
          ? "fade"
          : carouselIsStackedEffect(er)
          ? er
          : "fade";
      if (!carouselIsStackedEffect(er)) {
        return {
          ...carouselStackedSlideLayoutStyle,
        };
      }
      return {
        ...carouselStackedSlideLayoutStyle,
        ...carouselStackedSlideStyle(
          stackedKindForCss,
          i,
          curIdx,
          under,
          speed,
          stackedKindForCss === "mosaic" && hideMosaicActive,
        ),
      };
    };

    if (reactiveBrowser) {
      /** 浏览器端渲染：订阅相关 signal，使轨道 class/style 随状态更新 */
      void randomEffectPickRef.value;
      void internalIndexRef.value;
      void stackedUnderlayIdxRef.value;
      void mosaicSuppressActiveRef.value;
      void carouselSlideVisualIdxRef.value;
      void carouselSlideSnapNoTransRef.value;
      const curTrack = readCur();
      const stTrack = readLayoutStacked();
      const effectResolvedTrack = readEffectResolved();
      const stripR = readSlideInfiniteStrip(effectResolvedTrack);
      const slideStripStyle = slideStyleSlideModeFor(effectResolvedTrack);
      const extLen = extCountFor(effectResolvedTrack);
      const trackClassReactive = twMerge(
        !stTrack &&
          (isHorizontal ? "flex h-full min-h-0" : "flex flex-col h-full"),
        stTrack && "h-full w-full relative",
        !stTrack && "will-change-transform",
      );
      return (
        <div
          key="@dreamer/carousel-track"
          ref={(el: HTMLElement | null) => {
            carouselTrackMountRef.current = el;
          }}
          data-carousel-track-root=""
          class={trackClassReactive}
          style={mergeTrackStyle(curTrack)}
          data-current={String(curTrack)}
          data-effect={effectResolvedTrack}
        >
          {useImages
            ? stripR
              ? Array.from({ length: extLen }, (_, ext) => {
                void randomEffectPickRef.value;
                void mosaicSuppressActiveRef.value;
                const st = readLayoutStacked();
                const cur = readCur();
                const under = readUnderlay();
                const er = readEffectResolved();
                const logical = logicalFromExtIdx(ext, count);
                const src = imagesList![logical]!;
                const stableKey = ext === 0
                  ? `__carousel_clone_tail_${logical}`
                  : ext === count + 1
                  ? `__carousel_clone_head_${logical}`
                  : src;
                const outerClass = st
                  ? twMerge(
                    "overflow-hidden bg-slate-200 dark:bg-slate-700 flex",
                    isHorizontal && "h-full",
                    stackedZClass(logical, cur, under),
                    slideClass,
                  )
                  : slideImgOuterSlideModeClass;
                const outerStyle = st
                  ? slideStackedStyle(
                    logical,
                    cur,
                    under,
                    er === "mosaic" && mosaicSuppressActiveRef.value,
                  )
                  : slideStripStyle;
                const slideActive = isSlideActiveForExtended(cur, ext, count);
                return (
                  <div
                    key={stableKey}
                    data-carousel-slide={String(logical)}
                    data-carousel-slide-ext={String(ext)}
                    class={outerClass}
                    style={outerStyle}
                    role="img"
                    aria-label=""
                  >
                    <div
                      class="w-full h-full min-w-0 min-h-0 flex-1"
                      data-carousel-slide-inner=""
                    >
                      {!lazySlides
                        ? (
                          <img
                            src={src}
                            alt=""
                            draggable={false}
                            class={carouselNativeImgClass(contentFit)}
                            loading="eager"
                            referrerPolicy="no-referrer"
                            onDragStart={(e: Event) => {
                              e.preventDefault();
                            }}
                            onError={(ev: Event) => {
                              const el = ev.currentTarget as HTMLImageElement;
                              if (el.dataset.carouselFb === "1") return;
                              el.dataset.carouselFb = "1";
                              el.src = IMAGE_BUILTIN_FALLBACK_SRC;
                            }}
                          />
                        )
                        : (
                          <img
                            src={slideActive ? src : ""}
                            alt=""
                            draggable={false}
                            class={carouselNativeImgClass(contentFit)}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            aria-hidden={!slideActive}
                            onDragStart={(e: Event) => {
                              e.preventDefault();
                            }}
                            onError={(ev: Event) => {
                              const el = ev.currentTarget as HTMLImageElement;
                              if (el.dataset.carouselFb === "1") return;
                              el.dataset.carouselFb = "1";
                              el.src = IMAGE_BUILTIN_FALLBACK_SRC;
                            }}
                          />
                        )}
                    </div>
                  </div>
                );
              })
              : imagesList!.map((src, i) => {
                void randomEffectPickRef.value;
                void mosaicSuppressActiveRef.value;
                const st = readLayoutStacked();
                const cur = readCur();
                const under = readUnderlay();
                const er = readEffectResolved();
                const outerClass = st
                  ? twMerge(
                    "overflow-hidden bg-slate-200 dark:bg-slate-700 flex",
                    isHorizontal && "h-full",
                    stackedZClass(i, cur, under),
                    slideClass,
                  )
                  : slideImgOuterSlideModeClass;
                const outerStyle = st
                  ? slideStackedStyle(
                    i,
                    cur,
                    under,
                    er === "mosaic" && mosaicSuppressActiveRef.value,
                  )
                  : slideStripStyle;
                const slideActive = isSlideActiveFor(cur, i);
                return (
                  <div
                    key={src}
                    data-carousel-slide={String(i)}
                    class={outerClass}
                    style={outerStyle}
                    role="img"
                    aria-label=""
                  >
                    <div
                      class="w-full h-full min-w-0 min-h-0 flex-1"
                      data-carousel-slide-inner=""
                    >
                      {
                        /*
                         * lazySlides：保持同一 `<img>`，仅用 `src` 在「可加载邻页」时赋真实 URL，避免整节点替换与层叠 fade 冲突。
                         */
                      }
                      {!lazySlides
                        ? (
                          <img
                            src={src}
                            alt=""
                            draggable={false}
                            class={carouselNativeImgClass(contentFit)}
                            loading="eager"
                            referrerPolicy="no-referrer"
                            onDragStart={(e: Event) => {
                              e.preventDefault();
                            }}
                            onError={(ev: Event) => {
                              const el = ev.currentTarget as HTMLImageElement;
                              if (el.dataset.carouselFb === "1") return;
                              el.dataset.carouselFb = "1";
                              el.src = IMAGE_BUILTIN_FALLBACK_SRC;
                            }}
                          />
                        )
                        : (
                          <img
                            src={slideActive ? src : ""}
                            alt=""
                            draggable={false}
                            class={carouselNativeImgClass(contentFit)}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            aria-hidden={!slideActive}
                            onDragStart={(e: Event) => {
                              e.preventDefault();
                            }}
                            onError={(ev: Event) => {
                              const el = ev.currentTarget as HTMLImageElement;
                              if (el.dataset.carouselFb === "1") return;
                              el.dataset.carouselFb = "1";
                              el.src = IMAGE_BUILTIN_FALLBACK_SRC;
                            }}
                          />
                        )}
                    </div>
                  </div>
                );
              })
            : stripR
            ? Array.from({ length: extLen }, (_, ext) => {
              void randomEffectPickRef.value;
              const st = readLayoutStacked();
              const cur = readCur();
              const under = readUnderlay();
              const logical = logicalFromExtIdx(ext, count);
              const slide = slides[logical]!;
              const stableKey = ext === 0
                ? `__carousel_clone_tail_${logical}`
                : ext === count + 1
                ? `__carousel_clone_head_${logical}`
                : String(logical);
              const childOuterClass = st
                ? twMerge(
                  "flex items-center justify-center overflow-hidden",
                  contentFitClass,
                  slideClass,
                  stackedZClass(logical, cur, under),
                )
                : slideChildSlideModeClass;
              const childOuterStyle = st
                ? slideStackedStyle(
                  logical,
                  cur,
                  under,
                  false,
                )
                : slideStripStyle;
              return (
                <div
                  key={stableKey}
                  data-carousel-slide={String(logical)}
                  data-carousel-slide-ext={String(ext)}
                  class={childOuterClass}
                  style={childOuterStyle}
                >
                  {slide as ComponentChildren}
                </div>
              );
            })
            : slides.map((slide, i) => {
              void randomEffectPickRef.value;
              const st = readLayoutStacked();
              const cur = readCur();
              const under = readUnderlay();
              const childOuterClass = st
                ? twMerge(
                  "flex items-center justify-center overflow-hidden",
                  contentFitClass,
                  slideClass,
                  stackedZClass(i, cur, under),
                )
                : slideChildSlideModeClass;
              const childOuterStyle = st
                ? slideStackedStyle(
                  i,
                  cur,
                  under,
                  false,
                )
                : slideStripStyle;
              return (
                <div
                  key={i}
                  data-carousel-slide={String(i)}
                  class={childOuterClass}
                  style={childOuterStyle}
                >
                  {slide as ComponentChildren}
                </div>
              );
            })}
        </div>
      );
    }

    const effectForStatic = carouselResolveRenderEffect(
      props,
      randomEffectPickRef.value,
    );
    const isStackedStatic = carouselIsStackedEffect(effectForStatic);
    const stackedKindStatic: CarouselStackedKind =
      effectForStatic === "mosaic" && !useImages
        ? "fade"
        : carouselIsStackedEffect(effectForStatic)
        ? effectForStatic
        : "fade";

    const trackClassNameStatic = twMerge(
      !isStackedStatic &&
        (isHorizontal ? "flex h-full min-h-0" : "flex flex-col h-full"),
      isStackedStatic && "h-full w-full relative",
      !isStackedStatic && "will-change-transform",
    );

    const slideImgOuterStaticClass = twMerge(
      "overflow-hidden bg-slate-200 dark:bg-slate-700 flex",
      !isStackedStatic && "relative",
      isHorizontal && !isStackedStatic && "h-full",
      slideClass,
    );

    const slideChildStaticClass = twMerge(
      "flex items-center justify-center overflow-hidden",
      contentFitClass,
      !isStackedStatic && "relative",
      isHorizontal && !isStackedStatic && "h-full",
      slideClass,
    );

    /**
     * SSR 快照用层叠行内样式（无 `random` 订阅，读 signal 当前值即可）。
     */
    const slideStackedStyleStatic = (
      i: number,
      curIdx: number,
      under: number | null,
      hideMosaicActive: boolean,
    ) => {
      if (!carouselIsStackedEffect(effectForStatic)) {
        return {
          ...carouselStackedSlideLayoutStyle,
        };
      }
      return {
        ...carouselStackedSlideLayoutStyle,
        ...carouselStackedSlideStyle(
          stackedKindStatic,
          i,
          curIdx,
          under,
          speed,
          stackedKindStatic === "mosaic" && hideMosaicActive,
        ),
      };
    };

    const stripStatic = readSlideInfiniteStrip(effectForStatic);
    const slideStaticStripStyle = slideStyleSlideModeFor(effectForStatic);
    const extLenStatic = extCountFor(effectForStatic);

    const cur0 = readCur();
    const u0 = readUnderlay();
    return (
      <div
        key="@dreamer/carousel-track"
        class={trackClassNameStatic}
        style={mergeTrackStyle(cur0)}
        data-current={String(cur0)}
        data-effect={effectForStatic}
      >
        {useImages
          ? stripStatic
            ? Array.from({ length: extLenStatic }, (_, ext) => {
              const logical = logicalFromExtIdx(ext, count);
              const src = imagesList![logical]!;
              const stableKey = ext === 0
                ? `__carousel_clone_tail_${logical}`
                : ext === count + 1
                ? `__carousel_clone_head_${logical}`
                : src;
              const activeExt = isSlideActiveForExtended(cur0, ext, count);
              return (
                <div
                  key={stableKey}
                  data-carousel-slide={String(logical)}
                  data-carousel-slide-ext={String(ext)}
                  class={twMerge(
                    slideImgOuterStaticClass,
                    isStackedStatic && stackedZClass(logical, cur0, u0),
                  )}
                  style={isStackedStatic
                    ? slideStackedStyleStatic(logical, cur0, u0, false)
                    : slideStaticStripStyle}
                  role="img"
                  aria-label=""
                >
                  <div
                    class="w-full h-full min-w-0 min-h-0 flex-1"
                    data-carousel-slide-inner=""
                  >
                    {!lazySlides
                      ? (
                        <img
                          src={src}
                          alt=""
                          draggable={false}
                          class={carouselNativeImgClass(contentFit)}
                          loading="eager"
                          referrerPolicy="no-referrer"
                          onDragStart={(e: Event) => {
                            e.preventDefault();
                          }}
                          onError={(ev: Event) => {
                            const el = ev.currentTarget as HTMLImageElement;
                            if (el.dataset.carouselFb === "1") return;
                            el.dataset.carouselFb = "1";
                            el.src = IMAGE_BUILTIN_FALLBACK_SRC;
                          }}
                        />
                      )
                      : (
                        <img
                          src={activeExt ? src : ""}
                          alt=""
                          draggable={false}
                          class={carouselNativeImgClass(contentFit)}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          aria-hidden={!activeExt}
                          onDragStart={(e: Event) => {
                            e.preventDefault();
                          }}
                          onError={(ev: Event) => {
                            const el = ev.currentTarget as HTMLImageElement;
                            if (el.dataset.carouselFb === "1") return;
                            el.dataset.carouselFb = "1";
                            el.src = IMAGE_BUILTIN_FALLBACK_SRC;
                          }}
                        />
                      )}
                  </div>
                </div>
              );
            })
            : imagesList!.map((src, i) => (
              <div
                key={src}
                data-carousel-slide={String(i)}
                class={twMerge(
                  slideImgOuterStaticClass,
                  isStackedStatic && stackedZClass(i, cur0, u0),
                )}
                style={isStackedStatic
                  ? slideStackedStyleStatic(i, cur0, u0, false)
                  : slideStaticStripStyle}
                role="img"
                aria-label=""
              >
                <div
                  class="w-full h-full min-w-0 min-h-0 flex-1"
                  data-carousel-slide-inner=""
                >
                  {!lazySlides
                    ? (
                      <img
                        src={src}
                        alt=""
                        draggable={false}
                        class={carouselNativeImgClass(contentFit)}
                        loading="eager"
                        referrerPolicy="no-referrer"
                        onDragStart={(e: Event) => {
                          e.preventDefault();
                        }}
                        onError={(ev: Event) => {
                          const el = ev.currentTarget as HTMLImageElement;
                          if (el.dataset.carouselFb === "1") return;
                          el.dataset.carouselFb = "1";
                          el.src = IMAGE_BUILTIN_FALLBACK_SRC;
                        }}
                      />
                    )
                    : (
                      <img
                        src={isSlideActiveFor(cur0, i) ? src : ""}
                        alt=""
                        draggable={false}
                        class={carouselNativeImgClass(contentFit)}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        aria-hidden={!isSlideActiveFor(cur0, i)}
                        onDragStart={(e: Event) => {
                          e.preventDefault();
                        }}
                        onError={(ev: Event) => {
                          const el = ev.currentTarget as HTMLImageElement;
                          if (el.dataset.carouselFb === "1") return;
                          el.dataset.carouselFb = "1";
                          el.src = IMAGE_BUILTIN_FALLBACK_SRC;
                        }}
                      />
                    )}
                </div>
              </div>
            ))
          : stripStatic
          ? Array.from({ length: extLenStatic }, (_, ext) => {
            const logical = logicalFromExtIdx(ext, count);
            const slide = slides[logical]!;
            const stableKey = ext === 0
              ? `__carousel_clone_tail_${logical}`
              : ext === count + 1
              ? `__carousel_clone_head_${logical}`
              : String(logical);
            return (
              <div
                key={stableKey}
                data-carousel-slide={String(logical)}
                data-carousel-slide-ext={String(ext)}
                class={twMerge(
                  slideChildStaticClass,
                  isStackedStatic && stackedZClass(logical, cur0, u0),
                )}
                style={isStackedStatic
                  ? slideStackedStyleStatic(logical, cur0, u0, false)
                  : slideStaticStripStyle}
              >
                {slide as ComponentChildren}
              </div>
            );
          })
          : slides.map((slide, i) => (
            <div
              key={i}
              data-carousel-slide={String(i)}
              class={twMerge(
                slideChildStaticClass,
                isStackedStatic && stackedZClass(i, cur0, u0),
              )}
              style={isStackedStatic
                ? slideStackedStyleStatic(i, cur0, u0, false)
                : slideStaticStripStyle}
            >
              {slide as ComponentChildren}
            </div>
          ))}
      </div>
    );
  };

  const {
    direction: rootDirection = "horizontal",
    height: rootHeightProp,
    class: rootClassName,
  } = props;
  const rootIsHorizontal = rootDirection === "horizontal";
  const rootDefaultHeightClass = rootIsHorizontal ? "h-48" : "h-64";
  const rootContainerStyle = rootHeightProp
    ? { height: rootHeightProp }
    : undefined;
  /** 开启滑动时：横向轮播用 `pan-y` 把竖滑交给页面，横向由指针逻辑切页；纵向轮播反之 */
  const swipeOn = props.swipe !== false;
  const rootSwipeTouchClass = swipeOn
    ? (rootIsHorizontal ? "touch-pan-y select-none" : "touch-pan-x select-none")
    : "";

  const rootDivClass = twMerge(
    "carousel group relative overflow-hidden box-border shrink-0 w-full",
    rootSwipeTouchClass,
    !rootHeightProp && rootDefaultHeightClass,
    rootClassName,
  );

  const { count: rootCount } = carouselSlidesInfo(props);
  const showArrows = (props.arrows ?? true) && rootCount > 1;
  const showDots = (props.dots ?? true) && rootCount > 1;

  /**
   * 左右箭头三级透明度：默认更淡；鼠标在轮播区域内时 `group-hover` 略提亮；指在圆形按钮上、键盘聚焦或触摸时用 `!opacity` 盖过 group，保证完全不透明。
   */
  const arrowBtnClass =
    "absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center z-20 shadow-md border border-white/20 opacity-20 group-hover:opacity-50 hover:!opacity-100 focus-visible:!opacity-100 active:!opacity-100 transition-[opacity,background-color] duration-200 ease-out";

  const dotPosition = props.dotPosition ?? "bottom";
  const dotsWrapClass = twMerge(
    "absolute flex gap-2 z-20 items-center",
    dotPosition === "bottom" && "bottom-4 left-1/2 -translate-x-1/2",
    dotPosition === "top" && "top-4 left-1/2 -translate-x-1/2",
    dotPosition === "left" &&
      "left-4 top-1/2 -translate-y-1/2 flex-col",
    dotPosition === "right" &&
      "right-4 top-1/2 -translate-y-1/2 flex-col",
  );

  /**
   * 指示点：浏览器端在渲染中读取 `internalIndexRef` 等，使 class/aria-current 随当前页更新。
   *
   * @param reactiveBrowser - 是否使用响应式（浏览器）分支
   */
  const buildCarouselDots = (reactiveBrowser: boolean) => {
    if (!showDots || rootCount <= 1) return null;
    if (reactiveBrowser) {
      void internalIndexRef.value;
      void randomEffectPickRef.value;
      void stackedUnderlayIdxRef.value;
      void mosaicSuppressActiveRef.value;
      const effDots = carouselResolveRenderEffect(
        props,
        randomEffectPickRef.value,
      );
      const curDots = carouselDotsActiveSlideIndex(
        props,
        internalIndexRef.value,
        rootCount,
        effDots,
        mosaicSuppressActiveRef.value,
        stackedUnderlayIdxRef.value,
      );
      return (
        <div key="@dreamer/carousel-dots" class={dotsWrapClass}>
          {Array.from({ length: rootCount }, (_, i) => (
            <button
              key={i}
              type="button"
              class={twMerge(
                "rounded-full transition-all duration-200 shrink-0",
                i === curDots
                  ? "w-6 h-2 bg-white dark:bg-white/90 shadow"
                  : "w-2 h-2 bg-white/50 hover:bg-white/70 dark:bg-white/40 dark:hover:bg-white/60",
              )}
              onClick={() => {
                resetAutoplay();
                goToIndex(i);
              }}
              aria-label={`第 ${i + 1} 张`}
              aria-current={i === curDots ? "true" : undefined}
            />
          ))}
        </div>
      );
    }
    const effDots0 = carouselResolveRenderEffect(
      props,
      randomEffectPickRef.value,
    );
    const cur0 = carouselDotsActiveSlideIndex(
      props,
      internalIndexRef.value,
      rootCount,
      effDots0,
      mosaicSuppressActiveRef.value,
      stackedUnderlayIdxRef.value,
    );
    return (
      <div key="@dreamer/carousel-dots" class={dotsWrapClass}>
        {Array.from({ length: rootCount }, (_, i) => (
          <button
            key={i}
            type="button"
            class={twMerge(
              "rounded-full transition-all duration-200 shrink-0",
              i === cur0
                ? "w-6 h-2 bg-white dark:bg-white/90 shadow"
                : "w-2 h-2 bg-white/50 hover:bg-white/70 dark:bg-white/40 dark:hover:bg-white/60",
            )}
            onClick={() => {
              resetAutoplay();
              goToIndex(i);
            }}
            aria-label={`第 ${i + 1} 张`}
            aria-current={i === cur0 ? "true" : undefined}
          />
        ))}
      </div>
    );
  };

  /**
   * 根容器 ref：供滑动 `effect` 绑定；浏览器下挂载后 bump `carouselRootMountTick`。
   */
  const setCarouselRootRef = (el: HTMLElement | null) => {
    carouselRootRef.current = el;
    if (getDocument() != null) {
      carouselRootMountTick.value = carouselRootMountTick.value + 1;
    }
  };

  if (getDocument() != null) {
    return (
      <div
        class={rootDivClass}
        style={rootContainerStyle}
        ref={setCarouselRootRef}
      >
        {buildCarouselTrackElement(true)}
        {showArrows
          ? (
            <button
              type="button"
              key="@dreamer/carousel-prev"
              class={twMerge(arrowBtnClass, "left-2")}
              onClick={() => {
                resetAutoplay();
                goRef.current(-1);
              }}
              aria-label="上一张"
            >
              <IconChevronLeft class="w-5 h-5" />
            </button>
          )
          : null}
        {showArrows
          ? (
            <button
              type="button"
              key="@dreamer/carousel-next"
              class={twMerge(arrowBtnClass, "right-2")}
              onClick={() => {
                resetAutoplay();
                goRef.current(1);
              }}
              aria-label="下一张"
            >
              <IconChevronRight class="w-5 h-5" />
            </button>
          )
          : null}
        {buildCarouselDots(true)}
      </div>
    );
  }
  return (
    <div
      class={rootDivClass}
      style={rootContainerStyle}
      ref={setCarouselRootRef}
    >
      {buildCarouselTrackElement(false)}
      {showArrows
        ? (
          <button
            type="button"
            key="@dreamer/carousel-prev"
            class={twMerge(arrowBtnClass, "left-2")}
            onClick={() => {
              resetAutoplay();
              goRef.current(-1);
            }}
            aria-label="上一张"
          >
            <IconChevronLeft class="w-5 h-5" />
          </button>
        )
        : null}
      {showArrows
        ? (
          <button
            type="button"
            key="@dreamer/carousel-next"
            class={twMerge(arrowBtnClass, "right-2")}
            onClick={() => {
              resetAutoplay();
              goRef.current(1);
            }}
            aria-label="下一张"
          >
            <IconChevronRight class="w-5 h-5" />
          </button>
        )
        : null}
      {buildCarouselDots(false)}
    </div>
  );
}
