/**
 * @module @dreamer/ui-preact/mobile/navigation
 * @description
 * **JSR**：`import … from "@dreamer/ui-preact/mobile/navigation"`。移动端**导航**：**TabBar**、**NavBar** 为移动实现；菜单、分页、锚点等与桌面共用的组件为薄 re-export。
 *
 * `initAnchorSpy`、`initDropdownEsc` 等与桌面行为一致，见对应 `.tsx` JSDoc。
 */
export type { BreadcrumbItem } from "./breadcrumb-types.ts";
export {
  Sidebar,
  type SidebarItem,
  type SidebarProps,
  type SidebarSubItem,
} from "./Sidebar.tsx";
export { Pagination, type PaginationProps } from "./Pagination.tsx";
export { Menu, type MenuItem, type MenuProps } from "./Menu.tsx";
export {
  type StepItem,
  Steps,
  type StepsProps,
  type StepStatus,
} from "./Steps.tsx";
export { PageHeader, type PageHeaderProps } from "./PageHeader.tsx";
export { Affix, type AffixProps } from "./Affix.tsx";
export {
  Anchor,
  type AnchorLink,
  type AnchorProps,
  type AnchorSpyOptions,
  initAnchorSpy,
} from "./Anchor.tsx";
export { BackTop } from "./BackTop.tsx";
export type { BackTopProps, BackTopTarget } from "./BackTop.tsx";

export { TabBar, type TabBarItem, type TabBarProps } from "./TabBar.tsx";
export { NavBar, type NavBarProps } from "./NavBar.tsx";
