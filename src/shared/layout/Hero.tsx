/**
 * Hero 英雄区/首屏（Preact）。
 * 文案叠在全幅背景之上；`layout` 决定整块在左/中/右。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";

export type HeroLayout = "center" | "left" | "right";

export interface HeroProps {
  /** 主标题 */
  title: string | ComponentChildren;
  /** 副标题 */
  subtitle?: string | ComponentChildren;
  /** 描述文案 */
  description?: string | ComponentChildren;
  /** 主操作区（CTA 等） */
  extra?: ComponentChildren;
  /** 整幅背景：URL 或节点 */
  media?: string | ComponentChildren;
  /** 文案块水平位置 */
  layout?: HeroLayout;
  /** 是否全屏高 */
  fullScreen?: boolean;
  /** 无 media 时底层背景；与 media 同时存在时叠在 media 之上 */
  background?: string | ComponentChildren;
  /** 最外层 section class */
  class?: string;
  /** 文案区 class */
  contentClass?: string;
  /** 子节点（extra 下方） */
  children?: ComponentChildren;
  /** 遮罩层 class；空字符串关闭默认遮罩 */
  overlayClass?: string;
}

/**
 * 绝对定位、cover 铺满的背景层（URL）。
 */
function backgroundUrlLayer(url: string, zClass: string) {
  return (
    <div
      class={twMerge(
        "pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat",
        zClass,
      )}
      style={{ backgroundImage: `url(${url})` }}
      aria-hidden="true"
    />
  );
}

/**
 * Hero 首屏区块。
 */
export function Hero(props: HeroProps): JSX.Element {
  const {
    title,
    subtitle,
    description,
    extra,
    media,
    layout = "center",
    fullScreen = false,
    background,
    class: className,
    contentClass,
    children,
    overlayClass,
  } = props;

  const hasMedia = media != null && media !== "";
  const hasBackground = background != null && background !== "";

  const baseIsMedia = hasMedia;
  const baseString = baseIsMedia
    ? (typeof media === "string" ? media : null)
    : (typeof background === "string" ? background : null);
  const baseNode = baseIsMedia
    ? (typeof media !== "string" ? media : null)
    : (typeof background !== "string" && hasBackground ? background : null);

  const overlayBgString = hasMedia && hasBackground &&
      typeof background === "string"
    ? background
    : null;
  const overlayBgNode = hasMedia && hasBackground &&
      typeof background !== "string"
    ? background
    : null;

  const useDefaultScrim = hasMedia ||
    (!hasMedia && typeof background === "string" && hasBackground);
  const scrimClass = overlayClass !== undefined
    ? overlayClass
    : useDefaultScrim
    ? "bg-black/50"
    : "";

  const isCenter = layout === "center";
  const isLeft = layout === "left";
  const isRight = layout === "right";

  const textBody = (
    <>
      <h1 class="text-3xl font-bold tracking-tight text-slate-900 drop-shadow-sm md:text-4xl lg:text-5xl dark:text-slate-100">
        {title}
      </h1>
      {subtitle != null && (
        <p class="text-xl font-medium text-slate-700 drop-shadow-sm md:text-2xl dark:text-slate-200">
          {subtitle}
        </p>
      )}
      {description != null && (
        <p class="mx-auto max-w-prose text-base text-slate-800 drop-shadow-sm dark:text-slate-200">
          {description}
        </p>
      )}
      {extra != null && (
        <div class="flex flex-wrap justify-center gap-3 pt-2">
          {extra}
        </div>
      )}
      {children != null && <div class="mt-4">{children}</div>}
    </>
  );

  return (
    <section
      class={twMerge(
        "relative w-full overflow-hidden",
        fullScreen ? "min-h-screen" : "min-h-0",
        className,
      )}
    >
      {baseString != null && baseString !== "" &&
        backgroundUrlLayer(baseString, "z-0")}
      {baseNode != null && (
        <div class="absolute inset-0 z-0 overflow-hidden">{baseNode}</div>
      )}

      {overlayBgString != null && overlayBgString !== "" &&
        backgroundUrlLayer(overlayBgString, "z-[1]")}
      {overlayBgNode != null && (
        <div class="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
          {overlayBgNode}
        </div>
      )}

      {scrimClass !== "" && (
        <div
          class={twMerge(
            "pointer-events-none absolute inset-0 z-[5]",
            scrimClass,
          )}
          aria-hidden="true"
        />
      )}

      <div
        class={twMerge(
          "relative z-10 flex w-full flex-col justify-center py-16",
          isCenter && "items-center px-4 md:px-8",
          isLeft &&
            "items-start px-4 md:pl-8 md:pr-[40%]",
          isRight &&
            "items-end px-4 md:pr-8 md:pl-[40%]",
          !fullScreen && (hasMedia || hasBackground) &&
            "min-h-[280px] md:min-h-[320px]",
        )}
      >
        <div
          class={twMerge(
            "flex w-full max-w-2xl flex-col gap-4 text-center",
            contentClass,
          )}
        >
          {textBody}
        </div>
      </div>
    </section>
  );
}
