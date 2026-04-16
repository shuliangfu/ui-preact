/**
 * @module @dreamer/ui-preact/mobile/feedback
 * @description
 * **JSR**：`import … from "@dreamer/ui-preact/mobile/feedback"`。移动端**反馈**：Toast/Message/Notification 容器与命令式 API（薄 re-export）；**BottomSheet**、**ActionSheet**、**PullRefresh**、**SwipeCell** 等移动交互实现。
 *
 * @see {@link ./BottomSheet.tsx} 底部抽屉
 */
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

export { BottomSheet } from "./BottomSheet.tsx";
export type {
  BottomSheetHeightMode,
  BottomSheetProps,
} from "./BottomSheet.tsx";
export { ActionSheet } from "./ActionSheet.tsx";
export type { ActionSheetAction, ActionSheetProps } from "./ActionSheet.tsx";
export { PullRefresh } from "./PullRefresh.tsx";
export type { PullRefreshProps, PullRefreshStatus } from "./PullRefresh.tsx";
export { SwipeCell } from "./SwipeCell.tsx";
export type { SwipeCellAction, SwipeCellProps } from "./SwipeCell.tsx";
