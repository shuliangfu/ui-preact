/**
 * @module @dreamer/ui-preact/navigation
 * @description
 * **JSR**：`import … from "@dreamer/ui-preact/navigation"`。桌面端**导航**：侧边栏、分页、菜单、步骤条、页头、固钉、锚点、回到顶部、下拉菜单、面包屑、顶栏等。
 *
 * **初始化函数**：`initDropdownEsc()` 在客户端注册一次 Esc 关闭当前下拉；`initAnchorSpy(setActiveKey, options?)` 实现滚动高亮锚点（返回可选清理函数）。
 * 详见对应 `.tsx` 内 JSDoc。
 *
 * @see {@link ./Dropdown.tsx} 下拉与 Esc
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

export {
  Dropdown,
  type DropdownPlacement,
  type DropdownProps,
  initDropdownEsc,
} from "./Dropdown.tsx";
export { Breadcrumb, type BreadcrumbProps } from "./Breadcrumb.tsx";
export { NavBar, type NavBarProps } from "./NavBar.tsx";
