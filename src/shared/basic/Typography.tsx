/**
 * Typography 排版：Title、Text、Paragraph。Tailwind v4 + light/dark。
 */
import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";

export interface TitleProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  class?: string;
  children?: ComponentChildren;
}

const titleSizeClasses: Record<number, string> = {
  1: "text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-200",
  2: "text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-200",
  3: "text-xl font-semibold text-gray-900 dark:text-gray-200",
  /** h4/h5：dark 与 h2/h3 同级亮度，避免小标题在深色底上过暗 */
  4: "text-lg font-medium text-gray-800 dark:text-gray-300",
  5: "text-base font-medium text-gray-800 dark:text-gray-300",
  6: "text-sm font-medium text-gray-700 dark:text-gray-300",
};

/** 标题，默认 h2 */
export function Title(props: TitleProps): JSX.Element {
  const { level = 2, class: className, children } = props;
  const base = titleSizeClasses[level];
  const cls = twMerge(base, className);
  if (level === 1) return <h1 class={cls}>{children}</h1>;
  if (level === 2) return <h2 class={cls}>{children}</h2>;
  if (level === 3) return <h3 class={cls}>{children}</h3>;
  if (level === 4) return <h4 class={cls}>{children}</h4>;
  if (level === 5) return <h5 class={cls}>{children}</h5>;
  return <h6 class={cls}>{children}</h6>;
}

export interface TextProps {
  class?: string;
  /** 是否省略号 */
  truncate?: boolean;
  children?: ComponentChildren;
}

/** 正文 */
export function Text(props: TextProps): JSX.Element {
  const { class: className, truncate, children } = props;
  const base = "text-gray-700 dark:text-gray-300";
  return (
    <span
      class={twMerge(base, truncate && "truncate block", className)}
    >
      {children}
    </span>
  );
}

export interface ParagraphProps {
  class?: string;
  children?: ComponentChildren;
}

/** 段落 */
export function Paragraph(props: ParagraphProps): JSX.Element {
  const { class: className, children } = props;
  const base = "text-gray-600 dark:text-gray-400 leading-relaxed";
  return <p class={twMerge(base, className)}>{children}</p>;
}
