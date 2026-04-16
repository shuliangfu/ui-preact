/**
 * Message 全局提示 — 独立于 Toast 的命令式 API。
 * 需挂载 <MessageContainer />，通过 message.success/error/info/warning 触发，固定顶部居中。
 */

export { message } from "./message-store.ts";
export type {
  MessageItem,
  MessagePlacement,
  MessageType,
} from "./message-store.ts";
export { clearMessages, removeMessage } from "./message-store.ts";
