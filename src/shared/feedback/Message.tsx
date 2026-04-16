/**
 * Message 全局提示容器（Preact）。
 */

import { createPortal } from "preact/compat";
import type { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { IconAlertCircle } from "../basic/icons/AlertCircle.tsx";
import { IconCheckCircle } from "../basic/icons/CheckCircle.tsx";
import { IconInfo } from "../basic/icons/Info.tsx";
import { IconXCircle } from "../basic/icons/XCircle.tsx";
import { getBrowserBodyPortalHost } from "./portal-host.ts";
import type {
  MessageItem,
  MessagePlacement,
  MessageType,
} from "./message-store.ts";
import { messageList } from "./message-store.ts";

const MESSAGE_PLACEMENTS: MessagePlacement[] = ["top", "center"];

const messageIconClasses: Record<MessageType, string> = {
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
  warning: "text-amber-600 dark:text-amber-400",
};

function MessageIcon({ type }: { type: MessageType }) {
  const iconCls = messageIconClasses[type];
  const base = "shrink-0 w-5 h-5";
  if (type === "success") {
    return <IconCheckCircle class={twMerge(base, iconCls)} />;
  }
  if (type === "error") return <IconXCircle class={twMerge(base, iconCls)} />;
  if (type === "warning") {
    return <IconAlertCircle class={twMerge(base, iconCls)} />;
  }
  return <IconInfo class={twMerge(base, iconCls)} />;
}

function MessageItemEl({ item }: { item: MessageItem }) {
  return (
    <div
      role="alert"
      class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-max min-w-0 max-w-md text-sm"
    >
      <MessageIcon type={item.type} />
      <span class="min-w-0">{item.content}</span>
    </div>
  );
}

const MESSAGE_Z_INDEX = 2147483647;

function MessageOverlayInner(): JSX.Element | null {
  const list = messageList();
  if (list.length === 0) return null;
  const byPlacement = new Map<MessagePlacement, MessageItem[]>();
  for (const item of list) {
    const p = item.placement ?? "top";
    if (!byPlacement.has(p)) byPlacement.set(p, []);
    byPlacement.get(p)!.push(item);
  }
  return (
    <div
      class="fixed inset-0 pointer-events-none flex flex-col"
      style={{ zIndex: MESSAGE_Z_INDEX }}
      aria-live="polite"
    >
      {MESSAGE_PLACEMENTS.map((placement) => {
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
          : {
            top: "3rem",
            bottom: "auto",
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
            class="absolute flex flex-col gap-2 px-4 pointer-events-none items-center"
            style={placementStyle}
          >
            <div class="flex flex-col gap-2 items-center min-w-0 pointer-events-auto">
              {items.map((item) => (
                <div key={item.id}>
                  <MessageItemEl item={item} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MessageContainer(): JSX.Element | null {
  const list = messageList();
  const host = getBrowserBodyPortalHost();
  if (host != null) {
    return (
      <>
        <span
          style="display:none;width:0;height:0;overflow:hidden;position:absolute;clip:rect(0,0,0,0)"
          aria-hidden="true"
          data-dreamer-message-portal-anchor=""
        />
        {list.length > 0 ? createPortal(<MessageOverlayInner />, host) : null}
      </>
    );
  }
  return list.length > 0 ? <MessageOverlayInner /> : null;
}
