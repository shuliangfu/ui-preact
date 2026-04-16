/**
 * @module @dreamer/ui-preact/desktop
 * @description
 * **包内路径**：`src/desktop/mod.ts`。桌面端 UI 聚合：**shared**（Preact 实现）+ **desktop** 下 form / feedback / navigation / data-display 等路径对齐。
 *
 * - **反馈**：Modal、Dialog、Tooltip、Popover、Popconfirm、Drawer 等与 Portal、`document.body` 协作。
 * - **导航**：Dropdown、Breadcrumb、NavBar 等；`initDropdownEsc` 用于 Esc 关闭下拉。
 * - **数据**：Table 等。
 *
 * @see {@link ../shared/mod.ts} 共享实现
 */
export * from "../shared/mod.ts";
export * from "./form/mod.ts";
export * from "./feedback/mod.ts";
export * from "./navigation/mod.ts";
export * from "./data-display/mod.ts";
