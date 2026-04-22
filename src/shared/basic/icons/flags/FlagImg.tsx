/**
 * @fileoverview 单国 SVG 字符串 + {@link ../../Icon} 的通用渲染，供 `IconFlagXX`（`XX` = ISO 两字母大写，如 `IconFlagCN`）等短名独立文件内联
 * 单独引用，避免集中式大表，便于打包时按**文件**做摇树与分包（与 ui-view 同源，Preact 返回类型）。
 */
import type { JSX } from "preact";
import { Icon } from "../../Icon.tsx";
import { twMerge } from "tailwind-merge";

import type { CountryFlagComponentProps } from "./countryFlagTypes.ts";

/**
 * 根 props：`svg` 为**完整** 1:1 国旗 XML 内容（`flag-icons` 风格）；其余为图标尺寸/样式/无障碍。
 */
export type FlagImgProps = CountryFlagComponentProps & {
  /** 单国 SVG 全文（不与其他国合并） */
  svg: string;
};

/**
 * 用 `data:image/svg+xml` 驱动 `<img>`，不依赖全量 `COUNTRY_FLAG_*` 大对象。
 */
export function FlagImg(props: FlagImgProps): JSX.Element {
  const t = props.title;
  if (props.svg.length === 0) {
    return (
      <Icon
        size={props.size}
        class={twMerge(
          "rounded-sm border border-slate-300 dark:border-slate-600",
          props.class,
        )}
      >
        <span
          class="text-[0.5rem] font-bold leading-none text-slate-400"
          title={t ?? "空 SVG"}
          aria-hidden
        >
          ?
        </span>
      </Icon>
    );
  }
  const src = `data:image/svg+xml;charset=utf-8,${
    encodeURIComponent(props.svg)
  }`;
  return (
    <Icon
      size={props.size}
      class={twMerge(
        /**
         * 默认 `Icon` 为 `items-center justify-center`，子 `img` 不拉伸，配合 `data:` 源时
         * 部分环境下在布局完成前为 0×0，会呈现「空白白块」；需拉满以匹配 `w-* h-*` 容器。
         * `loading` 用 eager，避免 lazy 与首帧布局竞态导致短暂不可见。
         */
        "overflow-hidden rounded-sm p-0 !items-stretch !justify-stretch",
        props.class,
      )}
    >
      {
        /*
        有 title 时由 img 向读屏报读，否则为装饰
      */
      }
      <img
        class="block h-full w-full min-h-0 min-w-0 object-contain"
        src={src}
        alt={t != null && t.length > 0 ? t : ""}
        title={t}
        loading="eager"
        decoding="async"
        aria-hidden={t == null || t.length === 0}
        draggable={false}
      />
    </Icon>
  );
}

export type { IconComponentProps } from "../../Icon.tsx";
