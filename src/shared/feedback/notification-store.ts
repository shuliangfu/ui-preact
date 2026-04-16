/**
 * Notification — 全局状态与命令式 API（Preact `@preact/signals`）。
 */

import { signal } from "@preact/signals";

export type NotificationType =
  | "success"
  | "error"
  | "info"
  | "warning"
  | "default";

export type NotificationPlacement =
  | "top-right"
  | "top-center"
  | "top-left"
  | "bottom-right"
  | "bottom-center"
  | "bottom-left";

export interface NotificationItem {
  id: string;
  key?: string;
  type: NotificationType;
  title: string;
  description?: string;
  icon?: unknown;
  duration: number;
  createdAt: number;
  btnText?: string;
  onBtnClick?: () => void;
  onClose?: () => void;
  placement?: NotificationPlacement;
}

const notificationListRef = signal<NotificationItem[]>([]);

export function notificationList(): NotificationItem[] {
  return notificationListRef.value;
}

function nextId(): string {
  return `notification-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const DEFAULT_DURATION = 4500;

export interface OpenOptions {
  key?: string;
  type?: NotificationType;
  title: string;
  description?: string;
  icon?: unknown;
  duration?: number;
  btnText?: string;
  onBtnClick?: () => void;
  onClose?: () => void;
  placement?: NotificationPlacement;
}

export function openNotification(options: OpenOptions): string {
  const key = options.key;
  let list = notificationListRef.value;
  if (key != null && key !== "") {
    list = list.filter((n: NotificationItem) => n.key !== key);
  }
  const id = nextId();
  const item: NotificationItem = {
    id,
    key: options.key,
    type: options.type ?? "default",
    title: options.title,
    description: options.description,
    icon: options.icon,
    duration: options.duration ?? DEFAULT_DURATION,
    createdAt: Date.now(),
    btnText: options.btnText,
    onBtnClick: options.onBtnClick,
    onClose: options.onClose,
    placement: options.placement ?? "top-right",
  };
  notificationListRef.value = [...list, item];
  if (item.duration > 0) {
    setTimeout(() => closeNotification(id), item.duration);
  }
  return id;
}

export function closeNotification(id: string): void {
  const item = notificationListRef.value.find((n: NotificationItem) =>
    n.id === id
  );
  item?.onClose?.();
  notificationListRef.value = notificationListRef.value.filter(
    (n: NotificationItem) => n.id !== id,
  );
}

export function destroyNotifications(): void {
  notificationListRef.value = [];
}

export const notification = {
  open: openNotification,
  close: closeNotification,
  destroy: destroyNotifications,
};
