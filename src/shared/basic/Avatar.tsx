/**
 * Avatar 头像。支持图片 src 或子节点（首字、图标）。Tailwind v4 + light/dark。
 * 尺寸：xs / sm / md / lg / xl / 2xl（共 6 种，2xl 最大）。
 */
import type { ComponentChildren, JSX } from "preact";
import type { SizeVariant } from "../types.ts";
import { twMerge } from "tailwind-merge";

/** Avatar 尺寸：共用 SizeVariant + 头像专用 xl、2xl */
export type AvatarSize = SizeVariant | "xl" | "2xl";

export interface AvatarProps {
  /** 尺寸：xs(32px) / sm(40px) / md(48px) / lg(64px) / xl(80px) / 2xl(96px)，默认 md */
  size?: AvatarSize;
  /** 图片地址 */
  src?: string;
  /** 图片加载失败时的 alt */
  alt?: string;
  class?: string;
  /** 无 src 时显示内容（如首字） */
  children?: ComponentChildren;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: "w-8 h-8 text-xs",
  sm: "w-10 h-10 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-lg",
  xl: "w-20 h-20 text-xl",
  "2xl": "w-24 h-24 text-2xl",
};

const base =
  "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300 font-medium";

export function Avatar(props: AvatarProps): JSX.Element {
  const { size = "md", src, alt = "", class: className, children } = props;
  const sizeCls = sizeClasses[size];

  /** 直接返回 VNode，与 Button/Typography 等基础组件一致，避免多余 getter 层 */
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        class={twMerge(base, sizeCls, "object-cover", className)}
      />
    );
  }

  return (
    <span class={twMerge(base, sizeCls, className)} role="img" aria-hidden>
      {children}
    </span>
  );
}
