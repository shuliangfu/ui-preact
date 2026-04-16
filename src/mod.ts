/**
 * @module @dreamer/ui-preact
 * @packageDocumentation
 *
 * @description
 * **Preact** UI 组件库（自 `ui-view` 同源拆分迁移）。`jsxImportSource` 为 `preact`。
 *
 * **已迁移**：`basic`；`form` 子集（含 Cascader、TreeSelect、Select、MultiSelect、**DatePicker**、PickerCalendarNav 等）；`layout`；`navigation`（Anchor、PageHeader、BackTop、Pagination、Steps、Menu、Sidebar、Affix）；`feedback`（portal、Toast/Message/Notification、Alert、Drawer、Progress、Result）；`data-display`（Calendar、Tag、Empty、Statistic、Segmented、Descriptions、Card、List、calendar-utils）；{@link ./mobile/MobilePortalHostScope.tsx}。
 * **仍待与 ui-view 对齐**：TimePicker、DateTimePicker、ColorPicker、Upload 链、Mentions、Transfer、RichText、Markdown、charts、data-display 其余（Carousel、Collapse、Tree、Image、Comment、CodeBlock 等）。
 *
 * ## 子路径（`deno.json` → `exports`）
 *
 * | 导入子路径 | 说明 |
 * |------------|------|
 * | `@dreamer/ui-preact` | 桌面聚合：shared + form |
 * | `@dreamer/ui-preact/basic` | 桌面 basic |
 * | `@dreamer/ui-preact/form` | 桌面表单 |
 * | `@dreamer/ui-preact/shared` | 类型 + basic + form + layout + navigation + feedback + data-display |
 * | `@dreamer/ui-preact/mobile` | shared + mobile/form + Portal Scope |
 * | `@dreamer/ui-preact/mobile/basic` | 移动 basic |
 * | `@dreamer/ui-preact/mobile/form` | 移动表单（同源 re-export） |
 * | `@dreamer/ui-preact/layout` | 布局组件 |
 * | `@dreamer/ui-preact/feedback` | 反馈与全局提示 |
 * | `@dreamer/ui-preact/navigation` | 导航组件 |
 * | `@dreamer/ui-preact/data-display` | Calendar 等 |
 */
/** 桌面默认入口：见 {@link ./desktop/mod.ts} */
export * from "./desktop/mod.ts";
