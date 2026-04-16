/**
 * Spinner 加载指示器（Preact）。
 * Tailwind v4 + light/dark 主题。
 */

import type { JSX } from "preact";
import type { SizeVariant } from "../types.ts";
import { twMerge } from "tailwind-merge";

export interface SpinnerProps {
  size?: SizeVariant;
  /** 额外 class */
  class?: string;
}

const sizeClasses: Record<SizeVariant, string> = {
  xs: "w-4 h-4 border-2",
  sm: "w-5 h-5 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-10 h-10 border-[3px]",
};

export function Spinner(props: SpinnerProps): JSX.Element {
  const { size = "md", class: className } = props;
  const base =
    "inline-block rounded-full border-current border-t-transparent animate-spin text-blue-600 dark:text-blue-400";
  return (
    <span
      class={twMerge(base, sizeClasses[size], className)}
      role="status"
      aria-label="Loading"
    />
  );
}
