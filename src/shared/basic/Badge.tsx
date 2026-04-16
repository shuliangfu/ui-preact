/**
 * Badge 角标、数字徽章。Tailwind v4 + light/dark。
 */
import type { ComponentChildren, JSX } from "preact";
import type { ColorVariant, SizeVariant } from "../types.ts";
import { twMerge } from "tailwind-merge";

export interface BadgeProps {
  variant?: ColorVariant;
  size?: SizeVariant;
  /** 显示数字，超过 max 显示 max+ */
  count?: number;
  max?: number;
  /** 仅圆点不显示数字 */
  dot?: boolean;
  class?: string;
  children?: ComponentChildren;
}

const sizeClasses: Record<SizeVariant, string> = {
  xs: "min-w-4 h-4 text-[10px] px-1",
  sm: "min-w-5 h-5 text-xs px-1.5",
  md: "min-w-6 h-6 text-xs px-2",
  lg: "min-w-8 h-8 text-sm px-2.5",
};

const variantClasses: Record<ColorVariant, string> = {
  default: "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100",
  primary: "bg-blue-600 text-white dark:bg-blue-500",
  secondary: "bg-gray-500 text-white dark:bg-gray-400",
  success: "bg-green-600 text-white dark:bg-green-500",
  warning: "bg-amber-500 text-white dark:bg-amber-500",
  danger: "bg-red-600 text-white dark:bg-red-500",
  ghost:
    "bg-transparent text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600",
};

export function Badge(props: BadgeProps): JSX.Element {
  const {
    variant = "primary",
    size = "md",
    count,
    max = 99,
    dot = false,
    class: className,
    children,
  } = props;

  const base =
    "inline-flex items-center justify-center font-medium rounded-full border-0";
  const sizeCls = sizeClasses[size];
  const variantCls = variantClasses[variant];

  if (dot) {
    return (
      <span
        class={twMerge(
          base,
          "w-2 h-2 min-w-0 p-0",
          variantCls,
          className,
        )}
        role="status"
        aria-label={count != null ? `${count}` : undefined}
      />
    );
  }

  const text = count != null
    ? count > max ? `${max}+` : String(count)
    : children;

  return (
    <span
      class={twMerge(base, sizeCls, variantCls, className)}
      role="status"
      aria-label={typeof text === "string" ? text : undefined}
    >
      {text}
    </span>
  );
}
