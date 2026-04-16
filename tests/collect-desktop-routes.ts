/**
 * 从 docs 的 `src/routes/desktop` 扫描 `.tsx` 路由文件，生成与文件路由一致的 URL 列表（与 dweb 文件路由约定一致）。
 *
 * - 忽略 `_layout.tsx`
 * - `index.tsx` 映射为当前目录路由（根目录 `index` → `/desktop`）
 * - 动态段 `[id].tsx` → 用占位 `e2e-1` 便于浏览器访问
 *
 * 与 ui-view/tests/collect-desktop-routes.ts 行为一致；目录读取使用 {@link @dreamer/runtime-adapter}。
 */

import { join, readdir } from "@dreamer/runtime-adapter";

/**
 * 将动态路由段 `[param]` 替换为可访问的占位路径段。
 */
function segmentForFileName(seg: string): string {
  if (/^\[[^\]]+\]$/.test(seg)) return "e2e-1";
  return seg;
}

/**
 * 由相对路径（相对于 `desktop` 目录，含 `.tsx`）得到站点 path。
 *
 * @param rel - 如 `form/input.tsx`、`user/[id].tsx`、`index.tsx`
 * @returns 如 `/desktop/form/input`、`/desktop/user/e2e-1`、`/desktop`
 */
export function desktopFileRelToPath(rel: string): string {
  const norm = rel.replace(/\\/g, "/");
  if (norm === "_layout.tsx" || norm.endsWith("/_layout.tsx")) {
    throw new Error("layout should be skipped: " + rel);
  }
  const noExt = norm.replace(/\.tsx$/i, "");
  if (noExt === "index" || noExt.endsWith("/index")) {
    const parent = noExt.replace(/\/?index$/, "");
    const segs = parent ? parent.split("/").map(segmentForFileName) : [];
    return "/desktop" + (segs.length ? "/" + segs.join("/") : "");
  }
  const segs = noExt.split("/").map(segmentForFileName);
  return "/desktop/" + segs.join("/");
}

/**
 * 递归扫描目录，收集所有桌面端文档路由 URL（已去重、排序）。
 *
 * @param docsRoot - `ui-preact/docs` 等应用下的 `docs` 目录绝对路径
 * @returns 若 `desktop` 目录不存在则返回空数组
 */
export async function collectDesktopDocsRoutes(
  docsRoot: string,
): Promise<string[]> {
  const desktopDir = join(docsRoot, "src", "routes", "desktop");
  const seen = new Set<string>();

  async function walk(dir: string, relFromDesktop: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(dir);
    } catch {
      return;
    }
    for (const ent of entries) {
      if (ent.name.startsWith(".")) continue;
      const full = join(dir, ent.name);
      const rel = relFromDesktop ? `${relFromDesktop}/${ent.name}` : ent.name;
      if (ent.isDirectory) {
        await walk(full, rel);
        continue;
      }
      if (!ent.name.endsWith(".tsx")) continue;
      if (ent.name === "_layout.tsx") continue;
      try {
        const path = desktopFileRelToPath(rel);
        seen.add(path);
      } catch {
        // skip
      }
    }
  }

  try {
    await walk(desktopDir, "");
  } catch (e) {
    console.error("collectDesktopDocsRoutes: cannot read", desktopDir, e);
    return [];
  }

  return [...seen].sort((a, b) => a.localeCompare(b));
}
