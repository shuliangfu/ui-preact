/**
 * Toast 轻提示 — 全局状态与命令式 API（Preact `@preact/signals`）。
 */

import { signal } from "@preact/signals";

/** 单条 Toast 类型 */
export type ToastType = "success" | "error" | "info" | "warning";

/** 可选展示位置 */
export type ToastPlacement = "top" | "bottom" | "center";

export interface ToastItem {
  id: string;
  type: ToastType;
  content: string;
  duration: number;
  placement: ToastPlacement;
  createdAt: number;
}

/** 全局列表；`ToastContainer` 内读 `.value` 以订阅更新 */
const toastListRef = signal<ToastItem[]>([]);

/**
 * 供容器与外部读取当前列表（读 `.value` 建立订阅）。
 */
export function toastList(): ToastItem[] {
  return toastListRef.value;
}

function nextId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function push(item: Omit<ToastItem, "id" | "createdAt">): string {
  const id = nextId();
  const list = toastListRef.value;
  toastListRef.value = [
    ...list,
    {
      ...item,
      id,
      createdAt: Date.now(),
    },
  ];
  if (item.duration > 0) {
    setTimeout(() => removeToast(id), item.duration);
  }
  return id;
}

/** 移除指定 id */
export function removeToast(id: string): void {
  toastListRef.value = toastListRef.value.filter((t: ToastItem) => t.id !== id);
}

/** 清空 */
export function clearToasts(): void {
  toastListRef.value = [];
}

const DEFAULT_DURATION = 3000;

/** 命令式 API */
export const toast = {
  success: (
    content: string,
    duration = DEFAULT_DURATION,
    placement: ToastPlacement = "top",
  ): string => toast.show("success", content, duration, placement),
  error: (
    content: string,
    duration = DEFAULT_DURATION,
    placement: ToastPlacement = "top",
  ): string => toast.show("error", content, duration, placement),
  info: (
    content: string,
    duration = DEFAULT_DURATION,
    placement: ToastPlacement = "top",
  ): string => toast.show("info", content, duration, placement),
  warning: (
    content: string,
    duration = DEFAULT_DURATION,
    placement: ToastPlacement = "top",
  ): string => toast.show("warning", content, duration, placement),
  show: (
    type: ToastType,
    content: string,
    duration = DEFAULT_DURATION,
    placement: ToastPlacement = "top",
  ): string => push({ type, content, duration, placement }),
  dismiss: removeToast,
  destroy: clearToasts,
};
