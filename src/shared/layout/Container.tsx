/**
 * Container 最大宽度容器（Preact）。
 * 响应式 max-width，内容居中。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

export interface ContainerProps {
  /** 最大宽度预设，默认 "xl" */
  maxWidth?: ContainerSize;
  /** 是否水平居中，默认 true */
  centered?: boolean;
  /** 内边距，默认 true */
  padded?: boolean;
  /** 额外 class */
  class?: string;
  /** 子节点 */
  children?: ComponentChildren;
}

const maxWidthClasses: Record<ContainerSize, string> = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
};

/**
 * 居中限宽容器。
 */
export function Container(props: ContainerProps): JSX.Element {
  const {
    maxWidth = "xl",
    centered = true,
    padded = true,
    class: className,
    children,
  } = props;

  return (
    <div
      class={twMerge(
        "w-full",
        maxWidthClasses[maxWidth],
        centered && "mx-auto",
        padded && "px-4 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
