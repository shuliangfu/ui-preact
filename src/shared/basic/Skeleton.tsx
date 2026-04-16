/**
 * Skeleton 骨架屏。加载占位。Tailwind v4 + light/dark。
 */
import type { JSX } from "preact";
import type { SizeVariant } from "../types.ts";
import { twMerge } from "tailwind-merge";

export interface SkeletonProps {
  size?: SizeVariant;
  /** 自定义宽高（如 "w-full h-4"） */
  class?: string;
}

const sizeClasses: Record<SizeVariant, string> = {
  xs: "h-4",
  sm: "h-5",
  md: "h-6",
  lg: "h-8",
};

const base = "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700";

export function Skeleton(props: SkeletonProps): JSX.Element {
  const { size = "md", class: className } = props;
  return (
    <span
      class={twMerge(base, sizeClasses[size], className)}
      role="status"
      aria-label="Loading"
    />
  );
}
