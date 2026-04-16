/**
 * 文档站顶栏「菜单」与分区 {@link Sidebar} 小屏抽屉共用状态。
 * 根 `_layout` 的 {@link DocsSiteTopBar} 内读取 `docsNavDrawerOpen` / `docsNavSidebarAttached`，
 * `desktop`/`mobile` 的 `_layout` 在 `useEffect` 内置位侧栏已挂上（与 ui-view 文档站 `onMount`/`onCleanup` 对齐）。
 */
import { signal } from "@preact/signals";

/** 小屏侧栏抽屉是否打开（由顶栏按钮置 true，Drawer 内点链接或关闭钮置 false） */
export const docsNavDrawerOpen = signal(false);

/**
 * 当前是否处于带侧栏的文档分区（/desktop/*、/mobile/*），为 true 时顶栏才显示汉堡按钮。
 */
export const docsNavSidebarAttached = signal(false);
