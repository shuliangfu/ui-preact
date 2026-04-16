/**
 * Steps 步骤条（Preact）。
 * `current` 可传 `Signal<number>`、`number` 或零参 getter。
 */

import { Signal } from "@preact/signals";
import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { IconCheck } from "../basic/icons/Check.tsx";

export type StepStatus = "wait" | "process" | "finish" | "error";

export interface StepItem {
  title: string | ComponentChildren;
  description?: string | ComponentChildren;
  status?: StepStatus;
}

export interface StepsProps {
  items: StepItem[];
  current?: number | (() => number) | Signal<number>;
  direction?: "horizontal" | "vertical";
  onChange?: (current: number) => void;
  class?: string;
}

function getStatus(
  index: number,
  current: number,
  override?: StepStatus,
  itemsLength?: number,
): StepStatus {
  if (override != null) return override;
  if (itemsLength != null && current >= itemsLength) return "finish";
  if (index < current) return "finish";
  if (index === current) return "process";
  return "wait";
}

/**
 * 解析受控 `current`。
 */
function readStepsCurrent(
  v: number | (() => number) | Signal<number> | undefined,
): number {
  if (v === undefined) return 0;
  if (v instanceof Signal) return Number(v.value);
  if (typeof v === "function") {
    if ((v as () => unknown).length !== 0) return 0;
    return Number((v as () => number)());
  }
  return Number(v);
}

/**
 * 步骤条。
 */
export function Steps(props: StepsProps): JSX.Element {
  const {
    items,
    direction = "horizontal",
    onChange,
    class: className,
  } = props;

  const currentVal = readStepsCurrent(props.current);

  return (
    <div
      class={twMerge(
        "flex w-full min-w-0 max-w-full",
        direction === "horizontal" ? "flex-row items-flex-start" : "flex-col",
        className,
      )}
      role="list"
      aria-label="步骤"
    >
      {items.map((item, index) => {
        const status = getStatus(
          index,
          currentVal,
          item.status,
          items.length,
        );
        const isLast = index === items.length - 1;
        const isFinish = status === "finish";
        const isProcess = status === "process";
        const isError = status === "error";

        const iconCls = twMerge(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 shrink-0",
          isFinish &&
            "border-green-500 bg-green-50 text-green-600 dark:border-green-400 dark:bg-slate-800 dark:text-green-400",
          isProcess &&
            "border-blue-600 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-slate-800 dark:text-blue-400",
          isError &&
            "border-red-500 bg-red-50 text-red-600 dark:border-red-400 dark:bg-slate-800 dark:text-red-400",
          status === "wait" &&
            "border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500",
        );

        const titleCls = twMerge(
          "text-sm font-medium",
          isProcess && "text-blue-600 dark:text-blue-400",
          isFinish && "text-slate-700 dark:text-slate-300",
          status === "wait" && "text-slate-500 dark:text-slate-400",
          isError && "text-red-600 dark:text-red-400",
        );

        const canClick = onChange != null;

        return (
          <div
            key={index}
            role="listitem"
            class={twMerge(
              "flex",
              direction === "horizontal" &&
                "flex-1 flex-col items-center min-w-20",
              direction === "vertical" && "flex-row gap-3",
              canClick && "cursor-pointer",
            )}
            onClick={canClick ? () => onChange?.(index) : undefined}
          >
            <div
              class={twMerge(
                "flex relative",
                direction === "horizontal"
                  ? "flex-col items-center w-full min-h-12.5"
                  : "flex-row gap-3",
              )}
            >
              <span
                class={twMerge(
                  iconCls,
                  direction === "vertical" && "relative z-10",
                )}
              >
                {isFinish
                  ? (
                    <IconCheck class="w-4 h-4 text-green-600 dark:text-green-400" />
                  )
                  : (
                    index + 1
                  )}
              </span>
              {direction === "horizontal" && (
                <>
                  {!isLast
                    ? (
                      <div
                        class={twMerge(
                          "w-full min-w-[24px] h-0.5 mt-4 shrink-0",
                          isFinish
                            ? "bg-green-500 dark:bg-green-400"
                            : "bg-slate-200 dark:bg-slate-600",
                        )}
                      />
                    )
                    : (
                      <div
                        class={twMerge(
                          "mt-4 h-0.5 w-full min-w-[24px] shrink-0",
                          isFinish
                            ? "bg-green-500 dark:bg-green-400"
                            : "bg-slate-200 dark:bg-slate-600",
                        )}
                        aria-hidden
                      />
                    )}
                </>
              )}
              {direction === "vertical" && !isLast && (
                <div
                  class={twMerge(
                    "absolute left-4 top-8 z-0 w-0.5 bg-slate-200 dark:bg-slate-600",
                    isFinish && "bg-green-500 dark:bg-green-400",
                  )}
                  style={{ height: "calc(100% - 2rem)" }}
                  aria-hidden
                />
              )}
              {direction === "vertical" && (
                <div class="flex-1 pb-6">
                  <div class={titleCls}>{item.title}</div>
                  {item.description != null && (
                    <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.description}
                    </div>
                  )}
                </div>
              )}
            </div>
            {direction === "horizontal" && (
              <div class="mt-2 w-full text-center px-1">
                <div class={titleCls}>{item.title}</div>
                {item.description != null && (
                  <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.description}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
