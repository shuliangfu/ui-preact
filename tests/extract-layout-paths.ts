/**
 * 从文档站桌面布局源码解析侧栏中的路由，用于与 `collectDesktopDocsRoutes` 结果对账。
 * 使用 {@link readTextFile}，兼容 Deno/Bun。
 */

import { join, readTextFile } from "@dreamer/runtime-adapter";

/**
 * 读取 `_layout.tsx` 中所有 `path: "/desktop/..."` 字面量（含分类占位路径如 `/desktop/form`）。
 *
 * @param docsRoot - `ui-preact/docs` 目录绝对路径
 * @returns 去重、排序后的 path 列表
 */
export async function extractDesktopSidebarPathsFromLayout(
  docsRoot: string,
): Promise<string[]> {
  const layoutPath = join(
    docsRoot,
    "src",
    "routes",
    "desktop",
    "_layout.tsx",
  );
  const src = await readTextFile(layoutPath);
  const out = new Set<string>();
  /** 匹配 MENU 与各 SUBMENU 中的 `path: "/desktop/..."` */
  const re = /path:\s*"(\/desktop[^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    out.add(m[1]);
  }
  return [...out].sort((a, b) => a.localeCompare(b));
}

/**
 * 侧栏中仅作分组、无独立 `xxx/index.tsx` 页面的路径。
 */
export const DESKTOP_SIDEBAR_GROUP_PATHS: ReadonlySet<string> = new Set([
  "/desktop/basic",
  "/desktop/form",
  "/desktop/message",
  "/desktop/feedback",
  "/desktop/layout",
  "/desktop/navigation",
  "/desktop/data-display",
  "/desktop/charts",
  "/desktop/other",
]);

/**
 * 从侧栏 path 列表中去掉分组占位，得到必须与 `collectDesktopDocsRoutes` 交集覆盖的组件页路径。
 */
export function sidebarComponentPathsOnly(
  allFromLayout: readonly string[],
): string[] {
  return allFromLayout.filter((p) => !DESKTOP_SIDEBAR_GROUP_PATHS.has(p));
}
