/**
 * Message 全局提示 — 状态与命令式 API（Preact `@preact/signals`）。
 */

import { signal } from "@preact/signals";

export type MessageType = "success" | "error" | "info" | "warning";

export type MessagePlacement = "top" | "center";

export interface MessageItem {
  id: string;
  type: MessageType;
  content: string;
  duration: number;
  placement: MessagePlacement;
  createdAt: number;
}

const messageListRef = signal<MessageItem[]>([]);

export function messageList(): MessageItem[] {
  return messageListRef.value;
}

function nextId(): string {
  return `message-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function push(
  item: Omit<MessageItem, "id" | "createdAt" | "placement"> & {
    placement?: MessagePlacement;
  },
): string {
  const id = nextId();
  const list = messageListRef.value;
  messageListRef.value = [
    ...list,
    {
      ...item,
      placement: item.placement ?? "top",
      id,
      createdAt: Date.now(),
    },
  ];
  if (item.duration > 0) {
    setTimeout(() => removeMessage(id), item.duration);
  }
  return id;
}

export function removeMessage(id: string): void {
  messageListRef.value = messageListRef.value.filter((m: MessageItem) =>
    m.id !== id
  );
}

export function clearMessages(): void {
  messageListRef.value = [];
}

const DEFAULT_DURATION = 3000;

export const message = {
  success: (
    content: string,
    duration = DEFAULT_DURATION,
    placement: MessagePlacement = "top",
  ): string => message.show("success", content, duration, placement),
  error: (
    content: string,
    duration = DEFAULT_DURATION,
    placement: MessagePlacement = "top",
  ): string => message.show("error", content, duration, placement),
  info: (
    content: string,
    duration = DEFAULT_DURATION,
    placement: MessagePlacement = "top",
  ): string => message.show("info", content, duration, placement),
  warning: (
    content: string,
    duration = DEFAULT_DURATION,
    placement: MessagePlacement = "top",
  ): string => message.show("warning", content, duration, placement),
  show: (
    type: MessageType,
    content: string,
    duration = DEFAULT_DURATION,
    placement: MessagePlacement = "top",
  ): string => push({ type, content, duration, placement }),
  destroy: clearMessages,
};
