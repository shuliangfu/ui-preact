/**
 * Alert 静态提示条（Preact）。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { IconAlertCircle } from "../basic/icons/AlertCircle.tsx";
import { IconCheckCircle } from "../basic/icons/CheckCircle.tsx";
import { IconInfo } from "../basic/icons/Info.tsx";
import { IconXCircle } from "../basic/icons/XCircle.tsx";

export type AlertType = "success" | "info" | "warning" | "error";

export interface AlertProps {
  type?: AlertType;
  message: string;
  description?: string;
  showIcon?: boolean;
  closable?: boolean;
  onClose?: () => void;
  banner?: boolean;
  action?: ComponentChildren;
  class?: string;
  children?: ComponentChildren;
}

const typeIconMap = {
  success: IconCheckCircle,
  error: IconXCircle,
  warning: IconAlertCircle,
  info: IconInfo,
} as const;

const typeIconClasses: Record<AlertType, string> = {
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
  info: "text-blue-600 dark:text-blue-400",
};

const typeBorderClasses: Record<AlertType, string> = {
  success:
    "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-200",
  error:
    "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200",
  warning:
    "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200",
  info:
    "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200",
};

/**
 * 静态提示条：语义色、可选关闭与操作区。
 */
export function Alert(props: AlertProps): JSX.Element {
  const {
    type = "info",
    message,
    description,
    showIcon = true,
    closable = false,
    onClose,
    banner = false,
    action,
    class: className,
    children,
  } = props;

  const IconComponent = typeIconMap[type];
  const iconCls = typeIconClasses[type];
  const borderCls = typeBorderClasses[type];
  const baseCls =
    "flex w-full max-w-full gap-3 p-4 rounded-lg border border-l-4 transition-colors box-border";
  const bannerCls = banner ? "rounded-none border-l-4" : "";

  return (
    <div
      role="alert"
      class={twMerge(baseCls, borderCls, bannerCls, className)}
    >
      {showIcon && (
        <span class={twMerge("shrink-0 w-5 h-5 mt-0.5", iconCls)}>
          <IconComponent class="w-full h-full" />
        </span>
      )}
      <div class="flex-1 min-w-0">
        <div class="font-medium text-sm">{message}</div>
        {description != null && description !== "" && (
          <div class="mt-1 text-sm opacity-90">{description}</div>
        )}
        {children != null && <div class="mt-2">{children}</div>}
      </div>
      {action != null && <div class="shrink-0">{action}</div>}
      {closable && (
        <button
          type="button"
          aria-label="关闭"
          class="shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100"
          onClick={() => onClose?.()}
        >
          <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
