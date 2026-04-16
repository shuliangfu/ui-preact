/**
 * Notification 消息通知框容器（Preact）。
 */

import { createPortal } from "preact/compat";
import type { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { IconAlertCircle } from "../basic/icons/AlertCircle.tsx";
import { IconBell } from "../basic/icons/Bell.tsx";
import { IconCheckCircle } from "../basic/icons/CheckCircle.tsx";
import { IconInfo } from "../basic/icons/Info.tsx";
import { IconXCircle } from "../basic/icons/XCircle.tsx";
import { getBrowserBodyPortalHost } from "./portal-host.ts";
import {
  closeNotification,
  type NotificationItem,
  notificationList,
  type NotificationPlacement,
  type NotificationType,
} from "./notification-store.ts";

const typeIconClasses: Record<NotificationType, string> = {
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
  info: "text-blue-600 dark:text-blue-400",
  default: "text-slate-600 dark:text-slate-400",
};

function NotificationIcon({ type }: { type: NotificationType }) {
  const iconCls = typeIconClasses[type];
  const base = "shrink-0 w-5 h-5";
  if (type === "success") {
    return <IconCheckCircle class={twMerge(base, iconCls)} />;
  }
  if (type === "error") return <IconXCircle class={twMerge(base, iconCls)} />;
  if (type === "warning") {
    return <IconAlertCircle class={twMerge(base, iconCls)} />;
  }
  if (type === "info") return <IconInfo class={twMerge(base, iconCls)} />;
  return <IconBell class={twMerge(base, iconCls)} />;
}

function handleNotificationWrapClick(e: Event) {
  const target = e.target as Element | null;
  const btn = target?.closest?.(
    "[data-notification-close]",
  ) as HTMLElement | null | undefined;
  if (!btn) return;
  const id = btn.getAttribute?.("data-notification-id");
  if (id) closeNotification(id);
}

function NotificationItemEl({ item }: { item: NotificationItem }) {
  return (
    <div
      role="alert"
      class="flex gap-3 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 min-w-[320px] max-w-[420px] select-text"
    >
      <div class="shrink-0 pt-0.5">
        <NotificationIcon type={item.type} />
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-semibold text-sm text-slate-900 dark:text-slate-100">
          {item.title}
        </div>
        {item.description != null && item.description !== "" && (
          <div class="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {item.description}
          </div>
        )}
        {item.btnText != null && item.btnText !== "" &&
          item.onBtnClick != null && (
          <button
            type="button"
            class="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            onClick={() => item.onBtnClick?.()}
          >
            {item.btnText}
          </button>
        )}
      </div>
      <button
        type="button"
        aria-label="关闭"
        class="shrink-0 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
        data-notification-close=""
        data-notification-id={item.id}
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
    </div>
  );
}

const PLACEMENTS: NotificationPlacement[] = [
  "top-right",
  "top-center",
  "top-left",
  "bottom-right",
  "bottom-center",
  "bottom-left",
];

const placementContainerClasses: Record<NotificationPlacement, string> = {
  "top-right": "top-4 right-4 pl-4 items-end",
  "top-center": "top-4 left-1/2 -translate-x-1/2 px-4 items-center",
  "top-left": "top-4 left-4 pr-4 items-start",
  "bottom-right": "bottom-4 right-4 pl-4 items-end",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 px-4 items-center",
  "bottom-left": "bottom-4 left-4 pr-4 items-start",
};

const NOTIFICATION_Z_INDEX = 2147483647;

function NotificationOverlayInner(): JSX.Element | null {
  const list = notificationList();
  if (list.length === 0) return null;
  const byPlacement = new Map<NotificationPlacement, NotificationItem[]>();
  for (const item of list) {
    const p = item.placement ?? "top-right";
    if (!byPlacement.has(p)) byPlacement.set(p, []);
    byPlacement.get(p)!.push(item);
  }
  let attachLiveRegion = true;
  return (
    <>
      {PLACEMENTS.map((placement) => {
        const items = byPlacement.get(placement) ?? [];
        if (items.length === 0) return null;
        const isBottom = placement === "bottom-right" ||
          placement === "bottom-center" ||
          placement === "bottom-left";
        const placementStyle = isBottom
          ? { top: "auto", bottom: "1rem", zIndex: NOTIFICATION_Z_INDEX }
          : { top: "1rem", bottom: "auto", zIndex: NOTIFICATION_Z_INDEX };
        const withLive = attachLiveRegion;
        attachLiveRegion = false;
        return (
          <div
            key={placement}
            class={twMerge(
              "fixed flex flex-col gap-3 max-w-full pointer-events-none",
              placementContainerClasses[placement],
            )}
            style={placementStyle}
            aria-live={withLive ? "polite" : undefined}
          >
            <div
              class="flex flex-col gap-3 pointer-events-auto"
              onClick={handleNotificationWrapClick as (e: Event) => void}
            >
              {items.map((item: NotificationItem) => (
                <div key={item.id}>
                  <NotificationItemEl item={item} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

export function NotificationContainer(): JSX.Element | null {
  const list = notificationList();
  const host = getBrowserBodyPortalHost();
  if (host != null) {
    return (
      <>
        <span
          style="display:none;width:0;height:0;overflow:hidden;position:absolute;clip:rect(0,0,0,0)"
          aria-hidden="true"
          data-dreamer-notification-portal-anchor=""
        />
        {list.length > 0
          ? createPortal(<NotificationOverlayInner />, host)
          : null}
      </>
    );
  }
  return list.length > 0 ? <NotificationOverlayInner /> : null;
}
