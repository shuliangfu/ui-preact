/**
 * Result 结果页（Preact）。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { IconAlertCircle } from "../basic/icons/AlertCircle.tsx";
import { IconCheckCircle } from "../basic/icons/CheckCircle.tsx";
import { IconHelpCircle } from "../basic/icons/HelpCircle.tsx";
import { IconInfo } from "../basic/icons/Info.tsx";
import { IconShieldAlert } from "../basic/icons/ShieldAlert.tsx";
import { IconXCircle } from "../basic/icons/XCircle.tsx";

export type ResultStatus =
  | "success"
  | "error"
  | "info"
  | "warning"
  | "403"
  | "404";

export interface ResultProps {
  status?: ResultStatus;
  title?: string;
  subTitle?: string;
  icon?: ComponentChildren;
  extra?: ComponentChildren;
  children?: ComponentChildren;
  class?: string;
}

const statusIconMap = {
  success: IconCheckCircle,
  error: IconXCircle,
  warning: IconAlertCircle,
  info: IconInfo,
  "403": IconShieldAlert,
  "404": IconHelpCircle,
} as const;

const statusIconClasses: Record<ResultStatus, string> = {
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
  info: "text-blue-600 dark:text-blue-400",
  "403": "text-slate-500 dark:text-slate-400",
  "404": "text-slate-500 dark:text-slate-400",
};

/**
 * 居中结果态展示。
 */
export function Result(props: ResultProps): JSX.Element {
  const {
    status = "info",
    title,
    subTitle,
    icon: customIcon,
    extra,
    children,
    class: className,
  } = props;

  const IconComponent = statusIconMap[status];
  const iconCls = statusIconClasses[status];

  return (
    <div
      class={twMerge(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className,
      )}
    >
      {customIcon != null
        ? (
          <div class="mb-4 text-6xl text-slate-400 dark:text-slate-500">
            {customIcon}
          </div>
        )
        : (
          <span
            class={twMerge(
              "shrink-0 w-16 h-16 mb-4 flex items-center justify-center",
              iconCls,
            )}
          >
            <IconComponent class="w-full h-full" />
          </span>
        )}
      {title != null && title !== "" && (
        <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {title}
        </h2>
      )}
      {subTitle != null && subTitle !== "" && (
        <p class="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6">
          {subTitle}
        </p>
      )}
      {extra != null && (
        <div class="flex flex-wrap gap-2 justify-center mb-4">{extra}</div>
      )}
      {children != null && <div class="w-full max-w-md">{children}</div>}
    </div>
  );
}
