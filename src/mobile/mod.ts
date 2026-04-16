/**
 * @module @dreamer/ui-preact/mobile
 * @description
 * **JSR**：`import … from "@dreamer/ui-preact/mobile"`。移动端 UI 聚合：**shared** + 本目录专用（浮层、顶栏、列表等）。
 *
 * **专用**：`MobilePortalHostScope` / `MobilePortalHostContext`（将 Portal 限制在预览视口内）；`ScrollList`；以及 `form` / `feedback` / `navigation` / `layout` / `charts` / `config-provider` / `data-display` 子路径的移动端入口。
 * 浮层组件通常要求 `open={Signal}`；在 `MobilePortalHostScope` 内时 Portal 到机内锚点，否则挂 `document.body`（见各组件说明）。
 *
 * @see {@link ./MobilePortalHostScope.tsx} 机内 Portal 范围
 */
export * from "../shared/mod.ts";
export {
  MobilePortalHostContext,
  MobilePortalHostScope,
} from "./MobilePortalHostScope.tsx";
export type {
  MobilePortalHostContextValue,
  MobilePortalHostScopeProps,
} from "./MobilePortalHostScope.tsx";
export * from "./form/mod.ts";
export * from "./feedback/mod.ts";
export * from "./navigation/mod.ts";
export {
  ScrollList,
  type ScrollListListProps,
  type ScrollListProps,
} from "./data-display/ScrollList.tsx";
