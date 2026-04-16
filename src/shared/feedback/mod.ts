/**
 * @dreamer/ui-preact 反馈与全局提示（与 `ui-view` shared/feedback 对齐，Preact 实现）。
 */
export type {
  ControlledOpenInput,
  ControlledStringInput,
} from "./controlled-open.ts";
export {
  readControlledOpenInput,
  readControlledStringInput,
} from "./controlled-open.ts";
export { getBrowserBodyPortalHost } from "./portal-host.ts";

export { ToastContainer } from "./Toast.tsx";
export { toast } from "./toast-store.ts";
export type { ToastItem, ToastPlacement, ToastType } from "./toast-store.ts";
export { clearToasts, removeToast } from "./toast-store.ts";

export { MessageContainer } from "./Message.tsx";
export { message } from "./message-store.ts";
export type {
  MessageItem,
  MessagePlacement,
  MessageType,
} from "./message-store.ts";
export { clearMessages, removeMessage } from "./message-store.ts";

export { NotificationContainer } from "./Notification.tsx";
export { notification } from "./notification-store.ts";
export type {
  NotificationItem,
  NotificationPlacement,
  NotificationType,
  OpenOptions,
} from "./notification-store.ts";
export {
  closeNotification,
  destroyNotifications,
  openNotification,
} from "./notification-store.ts";

export { Alert } from "./Alert.tsx";
export type { AlertProps, AlertType } from "./Alert.tsx";

export { Drawer } from "./Drawer.tsx";
export type {
  DrawerOpenInput,
  DrawerPlacement,
  DrawerProps,
  DrawerTitleAlign,
  DrawerTitleInput,
} from "./Drawer.tsx";

export { Progress } from "./Progress.tsx";
export type {
  ProgressPercentInput,
  ProgressProps,
  ProgressStatus,
  ProgressType,
} from "./Progress.tsx";

export { Result } from "./Result.tsx";
export type { ResultProps, ResultStatus } from "./Result.tsx";

export { Modal } from "./Modal.tsx";
export type {
  ModalOpenInput,
  ModalProps,
  ModalTitleAlign,
  ModalTitleInput,
  ModalWidthInput,
  ModalWidthPrimitive,
} from "./Modal.tsx";

export { Tooltip } from "./Tooltip.tsx";
export type { TooltipPlacement, TooltipProps } from "./Tooltip.tsx";
