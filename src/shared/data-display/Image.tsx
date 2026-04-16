/**
 * Image 图片（Preact）。
 * 懒加载、占位、预览（点击放大）、object-fit、fallback。
 */

import type { ComponentChildren, JSX } from "preact";
import { useEffect, useLayoutEffect, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

export interface ImageProps {
  /** 列表渲染时的 key（用于 map 等场景） */
  key?: string | number;
  /** 图片地址 */
  src: string;
  /** 替代文案 */
  alt?: string;
  /** 宽度（px 或 string） */
  width?: number | string;
  /** 高度（px 或 string） */
  height?: number | string;
  /** 填充方式：contain | cover | fill | none */
  fit?: "contain" | "cover" | "fill" | "none";
  /** 占位图（加载中或懒加载未加载时） */
  placeholder?: ComponentChildren;
  /**
   * 保留兼容；**不再在组件内渲染**任何「加载失败」类文案层，失败时仅显示 {@link IMAGE_BUILTIN_FALLBACK_SRC} 或 `fallbackSrc`。
   */
  fallback?: string | ComponentChildren;
  /**
   * 加载失败时的占位图 URL（覆盖 {@link IMAGE_BUILTIN_FALLBACK_SRC}）。
   * 非空字符串才生效；未传或空白则使用内置缺省图。
   */
  fallbackSrc?: string;
  /** 是否懒加载（需 IntersectionObserver） */
  lazy?: boolean;
  /** 是否支持点击预览（弹层大图） */
  preview?: boolean;
  /** 是否禁用预览 */
  previewDisabled?: boolean;
  /** 圆角，默认 false */
  rounded?: boolean | "sm" | "md" | "lg" | "full";
  /** 额外 class */
  class?: string;
}

const roundedClasses: Record<string, string> = {
  true: "rounded",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

const objectFitClasses: Record<NonNullable<ImageProps["fit"]>, string> = {
  contain: "object-contain",
  cover: "object-cover",
  fill: "object-fill",
  none: "object-none",
};

/**
 * 加载失败时使用的内置占位图（SVG data URI，无网络请求）：**山水剪影 + 纵向撕裂缝**（灰青色系，无红色）。
 * 未传 `fallbackSrc` 或空串时用本图；非空 `fallbackSrc` 由业务覆盖。
 */
export const IMAGE_BUILTIN_FALLBACK_SRC: string = "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">' +
      '<rect x="7" y="9" width="66" height="62" rx="8" fill="rgba(148,163,184,0.2)" stroke="#64748b" stroke-width="2.2"/>' +
      '<rect x="11" y="13" width="58" height="26" rx="3" fill="#a8b8cc"/>' +
      '<circle cx="56" cy="26" r="6.5" fill="#e2e8f0" opacity="0.95"/>' +
      '<path d="M11 48 L26 30 L38 38 L54 22 L69 40 V57 H11 Z" fill="#5b6b7f"/>' +
      '<path d="M11 52 L24 34 L40 44 L58 26 L69 44 V57 H11 Z" fill="#475569"/>' +
      '<path d="M36 14 L39 22 L34 31 L40 39 L35 48 L39 56 L36 64 L39 72" fill="none" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.72"/>' +
      '<path d="M35 14 L37 22 L33 31 L38 39 L34 48 L37 56 L35 64 L37 72" fill="none" stroke="#cbd5e1" stroke-width="1.1" stroke-linecap="round" opacity="0.45"/>' +
      "</svg>",
  );

export function Image(props: ImageProps): JSX.Element {
  const {
    key: keyProp,
    src,
    alt = "",
    width,
    height,
    fit = "cover",
    placeholder: _placeholder,
    fallbackSrc,
    lazy = false,
    preview = false,
    previewDisabled = false,
    rounded = false,
    class: className,
  } = props;

  /**
   * 加载态必须用 {@link useSignal}：若在函数体内每次执行 `signal("loading")`，
   * 父级重渲染会新建 Signal，`onLoad` 刚把状态设为 `loaded` 下一帧又变回 `loading`，
   * 主图会永远带 `opacity-0`（只见外层灰底）。
   */
  const statusRef = useSignal<"loading" | "loaded" | "error">("loading");
  const imgElRef = useRef<HTMLImageElement | null>(null);
  const prevSrcRef = useRef(src);
  /** `src` 变化时同步回到 loading，避免短时仍显示上一张的 loaded 态 */
  if (prevSrcRef.current !== src) {
    prevSrcRef.current = src;
    statusRef.value = "loading";
  }

  /** 卸载时清空 img.src 以释放解码位图内存，减轻轮播等多图场景占用 */
  useEffect(() => {
    return () => {
      const el = imgElRef.current;
      if (el && el.src) el.src = "";
    };
  }, []);

  /**
   * 重定向后 onLoad 可能不触发，定时检查 `complete` + `naturalWidth` 作为补救。
   * 破损图也会 `complete === true`，须用 `naturalWidth > 0` 区分，否则会误判为 loaded；
   * 且不可仅用 `complete`，否则与 onError 竞态时行为混乱。
   * 在 layout 阶段之后读 ref，保证 `<img>` 已挂载。
   */
  useLayoutEffect(() => {
    const el = imgElRef.current;
    if (!el || statusRef.value !== "loading") return;
    const t = setTimeout(() => {
      if (el.complete && el.naturalWidth > 0) statusRef.value = "loaded";
      /** 少数环境错误 URL 不触发 onError，长期 loading + opacity-0 会像空白块 */
      else if (el.complete && el.naturalWidth <= 0) statusRef.value = "error";
    }, 2000);
    return () => clearTimeout(t);
  }, [src]);

  const style: Record<string, string> = {};
  if (width != null) {
    style.width = typeof width === "number" ? `${width}px` : width;
  }
  if (height != null) {
    style.height = typeof height === "number" ? `${height}px` : height;
  }

  const roundedCls = typeof rounded === "boolean"
    ? rounded ? "rounded" : ""
    : roundedClasses[rounded] ?? "rounded";

  /**
   * 失败层展示用图片地址：用户显式传入非空 `fallbackSrc` 时优先，否则用内置 SVG。
   */
  const errorPlaceholderSrc =
    typeof fallbackSrc === "string" && fallbackSrc.trim() !== ""
      ? fallbackSrc.trim()
      : IMAGE_BUILTIN_FALLBACK_SRC;

  /**
   * 主资源成功解码为 `loaded`。失败态下主图 `src` 已换成 {@link errorPlaceholderSrc}，其 `load` 不得把状态改回 loaded。
   *
   * @param ev - 原生 load 事件（取 `currentTarget` 读解码结果）
   */
  const handleLoad = (ev: Event) => {
    if (statusRef.value === "error") return;
    const el = ev.currentTarget as HTMLImageElement;
    if (el.naturalWidth <= 0 && el.naturalHeight <= 0) return;
    statusRef.value = "loaded";
  };

  /**
   * 主 `src` 加载失败：随后由响应式绑定把主图 `src` 换成内置/自定义占位图（同一 `<img>`）。
   * 已在 `error` 时再触发（例如用户 `fallbackSrc` 也无效）则不再写入，避免 onError 抖动循环。
   */
  const handleError = () => {
    if (statusRef.value === "error") return;
    statusRef.value = "error";
  };

  const handleClick = () => {
    if (
      statusRef.value === "error" ||
      (preview && !previewDisabled &&
        typeof globalThis.document !== "undefined")
    ) {
      if (statusRef.value === "error") return;
      const wrap = globalThis.document.createElement("div");
      wrap.className =
        "fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4";
      wrap.setAttribute("aria-modal", "true");
      wrap.setAttribute("role", "dialog");
      const img = globalThis.document.createElement("img");
      img.src = src;
      img.alt = alt ?? "";
      img.className = "max-w-full max-h-full object-contain";
      wrap.appendChild(img);
      const close = () => {
        wrap.removeEventListener("click", close);
        wrap.remove();
      };
      wrap.addEventListener("click", close);
      globalThis.document.body.appendChild(wrap);
    }
  };

  const st = statusRef.value;
  const imgSrc = st === "error" ? errorPlaceholderSrc : src;
  const imgLoading = st === "error" || !lazy ? "eager" : "lazy";
  const imgAriaHidden = st === "loading" ? true : undefined;
  const imgClass = twMerge(
    "w-full h-full transition-opacity duration-300",
    /**
     * 失败态用 `object-contain`：内置 SVG 与自定义 `fallbackSrc` 均保持宽高比居中，
     * 非正方形容器下不裁切、不拉伸；主图仍由 `fit`（默认 cover）控制。
     */
    st === "error" ? "object-contain opacity-100" : objectFitClasses[fit],
    st === "loading" ? "opacity-0" : "opacity-100",
    preview && !previewDisabled && st === "loaded" &&
      "cursor-zoom-in",
  );

  return (
    <div
      key={keyProp}
      class={twMerge(
        "relative inline-block overflow-hidden bg-slate-100 dark:bg-slate-800",
        roundedCls,
        className,
      )}
      style={style}
    >
      <img
        ref={(el: HTMLImageElement | null) => {
          imgElRef.current = el;
        }}
        src={imgSrc}
        loading={imgLoading as "eager" | "lazy"}
        referrerPolicy="no-referrer"
        aria-hidden={imgAriaHidden}
        alt={alt}
        class={imgClass}
        onLoad={handleLoad}
        onError={handleError}
        onClick={handleClick}
      />
      {_placeholder
        ? (
          <div
            class={twMerge(
              "absolute inset-0 z-[1] flex items-center justify-center text-slate-400",
              st === "loading" ? "" : "hidden",
            )}
          >
            {_placeholder}
          </div>
        )
        : null}
    </div>
  );
}
