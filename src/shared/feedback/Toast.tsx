/**
 * Toast 轻提示容器（Preact）。
 * 根节点挂载 `<ToastContainer />`，通过 `toast.*` 触发；有 `document.body` 时用 `createPortal`。
 */

import { createPortal } from "preact/compat";
import type { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { getBrowserBodyPortalHost } from "./portal-host.ts";
import type { ToastItem, ToastType } from "./toast-store.ts";
import { toastList } from "./toast-store.ts";

const PLACEMENTS = ["top", "bottom", "center"] as const;

const placementContainerClasses: Record<(typeof PLACEMENTS)[number], string> = {
  "top": "items-center",
  "bottom": "items-center",
  "center": "items-center justify-center",
};

const toastTypeClasses: Record<ToastType, string> = {
  success: "bg-green-600 text-white dark:bg-green-500",
  error: "bg-red-600 text-white dark:bg-red-500",
  info: "bg-blue-600 text-white dark:bg-blue-500",
  warning: "bg-amber-500 text-white dark:bg-amber-500",
};

function ToastItemEl({ item }: { item: ToastItem }) {
  return (
    <div
      role="alert"
      class={twMerge(
        "px-4 py-3 rounded-lg text-sm shadow-md backdrop-blur-sm",
        toastTypeClasses[item.type],
      )}
    >
      {item.content}
    </div>
  );
}

/**
 * 浮层内容：读 `toastList()` 订阅列表变化。
 */
function ToastOverlayInner(): JSX.Element | null {
  const list = toastList();
  if (list.length === 0) return null;
  const byPlacement = new Map<string, ToastItem[]>();
  for (const item of list) {
    const key = item.placement;
    if (!byPlacement.has(key)) byPlacement.set(key, []);
    byPlacement.get(key)!.push(item);
  }

  return (
    <div
      class="fixed inset-0 pointer-events-none flex flex-col"
      style={{ zIndex: 2147483647 }}
      aria-live="polite"
    >
      {PLACEMENTS.map((placement) => {
        const items = byPlacement.get(placement) ?? [];
        if (items.length === 0) return null;
        const isCenter = placement === "center";
        const placementStyle = isCenter
          ? {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            transform: "translate(-50%, -50%)",
            width: "max-content",
            maxWidth: "24rem",
            margin: 0,
          }
          : placement === "top"
          ? {
            top: "3rem",
            bottom: "auto",
            left: 0,
            right: 0,
            marginLeft: "auto",
            marginRight: "auto",
            width: "max-content",
            maxWidth: "24rem",
          }
          : {
            top: "auto",
            bottom: "1rem",
            left: 0,
            right: 0,
            marginLeft: "auto",
            marginRight: "auto",
            width: "max-content",
            maxWidth: "24rem",
          };
        return (
          <div
            key={placement}
            class={twMerge(
              "absolute flex flex-col gap-2 px-4 pointer-events-none items-center",
              placementContainerClasses[placement],
            )}
            style={placementStyle}
          >
            <div class="flex flex-col gap-2 items-center min-w-0 pointer-events-auto">
              {items.map((item) => (
                <div key={item.id}>
                  <ToastItemEl item={item} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <style>
        {`
          @keyframes toast-in {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          `}
      </style>
    </div>
  );
}

/**
 * Toast 容器：有 `body` 时 Portal 到 body。
 */
export function ToastContainer(): JSX.Element | null {
  const list = toastList();
  const host = getBrowserBodyPortalHost();
  const portalHostOk = host != null;

  if (portalHostOk) {
    return (
      <>
        <span
          style="display:none;width:0;height:0;overflow:hidden;position:absolute;clip:rect(0,0,0,0)"
          aria-hidden="true"
          data-dreamer-toast-portal-anchor=""
        />
        {list.length > 0 ? createPortal(<ToastOverlayInner />, host) : null}
      </>
    );
  }
  return list.length > 0 ? <ToastOverlayInner /> : null;
}
