/**
 * Icon 图标容器/占位。用于包裹 SVG 或图标字体，统一尺寸与颜色。
 * Tailwind v4 + light/dark。
 *
 * 内置图标：见 ./icons/，按名称单独导出（如 IconClose、IconSearch），
 * 按需引入以控制包体积；每个图标文件独立，无大包依赖。
 */
import type { ComponentChildren } from "preact";
import type { JSX } from "preact";
import type { SizeVariant } from "../types.ts";
import { twMerge } from "tailwind-merge";

export interface IconProps {
  size?: SizeVariant;
  /** 额外 class（View / compileSource 惯用） */
  class?: string;
  /**
   * 与 `class` 等价；部分工具链更常生成 `className`（Preact 亦支持 `class`）。
   */
  className?: string;
  /** 子节点（SVG 或 span 等） */
  children?: ComponentChildren;
}

/** 内置图标组件使用的 props（无 children） */
export type IconComponentProps = Pick<
  IconProps,
  "size" | "class" | "className"
>;

const sizeClasses: Record<SizeVariant, string> = {
  xs: "w-4 h-4",
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

const base =
  "inline-flex shrink-0 items-center justify-center text-current text-gray-700 dark:text-gray-300";

/**
 * 图标外层容器：统一 `size` 对应的 Tailwind 宽高类、文本色与 flex 居中，并合并 `class` / `className`。
 *
 * @param props - `size` 默认 `md`；`children` 一般为内联 SVG 或文字图标
 * @returns 带 `role="img"` 的 `span` 包装节点
 */
export function Icon(props: IconProps): JSX.Element {
  const { size = "md", class: classProp, className, children } = props;
  /** class 优先于 className，与业务里混写两种属性时行为确定 */
  const extraClass = classProp ?? className;
  return (
    <span
      class={twMerge(base, sizeClasses[size], extraClass)}
      role="img"
      aria-hidden
    >
      {children}
    </span>
  );
}
