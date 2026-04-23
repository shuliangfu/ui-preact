/**
 * 与桌面版实现一致：确认对话框（`@dreamer/ui-preact` desktop/feedback），含 `variant` / `mobileLayout` 等。
 * 在 **mobile/feedback** 下与 BottomSheet 等并列入口，便于从 `@dreamer/ui-preact/mobile` 同路径导入；
 * 底层经 Portal 挂到 `body` 或机内 `MobilePortalHostScope` 锚点（同 BottomSheet 等说明）。
 */
export * from "../../desktop/feedback/Dialog.tsx";
