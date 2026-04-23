/**
 * @module @dreamer/ui-preact/plugin
 * @packageDocumentation
 *
 * @description
 * **JSR**：`import … from "@dreamer/ui-preact/plugin"`。为 **Tailwind CSS v4** 提供按需 **content** 扫描：在 dweb `onInit` 中解析项目对 `@dreamer/ui-preact` 的引用，生成仅含 `@source "相对路径";` 的 CSS 片段文件。
 *
 * ### 行为概要
 * - 输出文件路径由 **`outputPath`** 指定；业务在 `tailwind.css` 中 `@import` 该文件即可让 Tailwind 扫描实际用到的组件源路径。
 * - **`scanPath`** 可为单个目录或目录数组（相对 cwd），按需只扫 `frontend`、`common` 等子树，避免扫 backend/mobile。
 * - `@source` 路径相对于生成文件所在目录书写，避免把本机绝对路径写入仓库。
 * - 插件入口：**{@link uiPreactTailwindPlugin}**（返回 `Plugin`，含 `onInit`）。
 *
 * ### 使用顺序
 * 先注册本插件，再注册 Tailwind 官方/封装插件；并在样式入口 `@import` 生成的 `@source` 文件。
 *
 * @see {@link uiPreactTailwindPlugin} 工厂函数与选项说明
 */

import { createLogger, Logger } from "@dreamer/logger";
import type { Plugin } from "@dreamer/plugin";
import type { ServiceContainer } from "@dreamer/service";
import {
  createCommand,
  cwd,
  dirname,
  existsSync,
  fromFileUrl,
  getEnv,
  IS_DENO,
  join,
  mkdir,
  readdir,
  readdirSync,
  readTextFile,
  relative,
  writeTextFile,
} from "@dreamer/runtime-adapter";

/** 用于判定「是否为 @dreamer/ui-preact 包根」的标记文件（相对包根） */
const PACKAGE_ROOT_MARKER = "src/mod.ts";

/**
 * dweb `deno task build` 会把应用打进 `dist/server.js`，插件代码里的 `import.meta.url` 会落在 `…/dist/`，
 * 不再是 `ui-preact/plugin.ts`。若仍用 `dirname(import.meta.url)` 作为包根，会得到 `docs/dist`，
 * 只会扫到构建产物里零散的 `dist/src/**`，`mergeIntrinsicIconSources` 也扫不全 icons，最终 @source 仅百余行。
 * 从进程 cwd 逐级向上查找同时存在 `plugin.ts` 与 `src/mod.ts` 的目录，即可在 dev 与 build 下都得到真实包根。
 *
 * @returns 包根绝对路径；未找到时返回 null
 */
function findUiPreactPackageRootFromCwd(): string | null {
  let dir = cwd();
  const visited = new Set<string>();
  for (let i = 0; i < 20; i++) {
    if (visited.has(dir)) break;
    visited.add(dir);
    const pluginFile = join(dir, "plugin.ts");
    const marker = join(dir, PACKAGE_ROOT_MARKER);
    if (existsSync(pluginFile) && existsSync(marker)) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * 本插件文件所在目录：仅当 `import.meta.url` 为 `file:` 时可转为本地路径。
 * 从 **JSR** 加载时 URL 为 `https:`，若调用 `fromFileUrl(import.meta.url)` 会抛出 `ERR_INVALID_URL_SCHEME`，故必须先判断协议。
 *
 * @returns `file:` 时为目录绝对路径，否则 `undefined`
 */
function dirnameOfThisPluginIfFileUrl(): string | undefined {
  try {
    const u = new URL(import.meta.url);
    if (u.protocol !== "file:") {
      return undefined;
    }
    return dirname(fromFileUrl(u));
  } catch {
    return undefined;
  }
}

/**
 * 去掉 Deno CLI 写入 stdout 的 ANSI 颜色序列（如 `deno info` 首行常为 `\x1b[1mlocal:\x1b[0m`），
 * 否则 `^local:` 正则无法匹配，`parseFirstLocalLineFromDenoInfo` 会得到 `null`。
 *
 * @param text - 子进程捕获的原始输出
 */
function stripAnsiSequences(text: string): string {
  /** ESC (0x1B) + `[` + SGR 序列；用 `RegExp` 构造避免 deno lint `no-control-regex` */
  const esc = String.fromCharCode(0x1b);
  return text.replace(new RegExp(`${esc}\\[[\\d;]*m`, "g"), "");
}

/**
 * `deno info <https://jsr.io/...>` 输出首行 `local: /path` 的本地缓存路径（多为 `remote/https/jsr.io/<hash>`）。
 * 调用方须先经 {@link stripAnsiSequences}（由 {@link runDenoInfo} 统一处理）。
 *
 * @param text - `deno info` 标准输出全文（已无 ANSI）
 * @returns 去掉首尾空白的绝对路径；未匹配时返回 `null`
 */
function parseFirstLocalLineFromDenoInfo(text: string): string | null {
  const m = text.match(/^local:\s*(.+)$/m);
  return m?.[1]?.trim() ?? null;
}

/**
 * 从 `deno info jsr:@dreamer/ui-preact` 依赖树文本中解析**应用当前解析到的**包版本（与 deno.json / lock 一致）。
 *
 * @param text - `deno info jsr:@dreamer/ui-preact` 的 stdout
 */
function parseUiPreactVersionFromDenoInfoStdout(text: string): string | null {
  const m = text.match(/https:\/\/jsr\.io\/@dreamer\/ui-preact\/([^/\s]+)\//);
  return m?.[1] ?? null;
}

/** 避免同一 `onInit` 内对同一 `https://jsr.io/...` URL 重复执行 `deno info` */
const denoInfoHttpsToLocalCache = new Map<string, string>();

/**
 * 在应用根目录下执行 `deno info`，供解析 JSR 模块在 `$DENO_DIR` 中的真实路径。
 *
 * @param projectRoot - `cwd()` 应用根（须能加载该应用的 deno.json）
 * @param args - 一般为 `["info", "jsr:@dreamer/ui-preact"]` 或 `["info", "https://jsr.io/..."]`
 */
async function runDenoInfo(
  projectRoot: string,
  args: string[],
): Promise<string | null> {
  if (!IS_DENO) {
    return null;
  }
  const cmd = createCommand("deno", {
    args,
    cwd: projectRoot,
    stdout: "piped",
    stderr: "piped",
  });
  const out = await cmd.output();
  if (!out.success) {
    return null;
  }
  return stripAnsiSequences(new TextDecoder().decode(out.stdout));
}

/**
 * 解析宿主应用当前使用的 `@dreamer/ui-preact` **版本号**（优先 `deno info jsr:@dreamer/ui-preact` 依赖树，其次插件 `import.meta.url`）。
 *
 * @param projectRoot - 应用根
 * @param pluginImportMetaUrl - 本插件 `import.meta.url`
 */
async function getUiPreactJsrVersionResolvedByApp(
  projectRoot: string,
  pluginImportMetaUrl: string,
): Promise<string | null> {
  const tree = await runDenoInfo(projectRoot, [
    "info",
    "jsr:@dreamer/ui-preact",
  ]);
  if (tree) {
    const v = parseUiPreactVersionFromDenoInfoStdout(tree);
    if (v) {
      return v;
    }
  }
  return extractJsrIoDreamerUiPreactVersion(pluginImportMetaUrl);
}

/**
 * 将 `https://jsr.io/@dreamer/ui-preact/<version>/<rel>` 对应模块解析为 Deno 缓存中的本地绝对路径。
 *
 * **背景**：Deno 文档中 `import.meta.resolve` **仅支持单参数**，且对 `jsr:` 裸说明符不会解析为 `file:`；
 * 双参数在 Deno 中会 `TypeError: Invalid arguments`。故采用与 CLI 一致的 `deno info <https URL>` 解析 `local:` 行。
 *
 * @param projectRoot - 应用根（`deno info` 的 cwd）
 * @param rel - 包内相对路径，如 `src/shared/basic/Link.tsx`
 * @param version - `getUiPreactJsrVersionResolvedByApp` 结果；为 `null` 时本函数直接返回 `null`
 */
async function tryResolveUiPreactRelViaDenoInfo(
  projectRoot: string,
  rel: string,
  version: string | null,
): Promise<string | null> {
  if (!version) return null;
  const httpsUrl = `https://jsr.io/@dreamer/ui-preact/${version}/${rel}`;
  const cached = denoInfoHttpsToLocalCache.get(httpsUrl);
  if (cached && existsSync(cached)) {
    return cached;
  }
  const stdout = await runDenoInfo(projectRoot, ["info", httpsUrl]);
  if (!stdout) return null;
  const local = parseFirstLocalLineFromDenoInfo(stdout);
  if (local && existsSync(local)) {
    denoInfoHttpsToLocalCache.set(httpsUrl, local);
    return local;
  }
  return null;
}

/**
 * 根据用到的组件名，得到应加入 @source 的**已解析**绝对路径列表（去重排序）。
 * 优先使用「显式 packageRoot / 自动探测包根」下 `join(rel)` **且文件存在**的路径；
 * 否则在 Deno 下通过 {@link tryResolveUiPreactRelViaDenoInfo} 解析哈希缓存路径。
 *
 * @param usedNames - 从业务源码解析出的组件符号
 * @param ctx - 项目根、可选包根、自动解析的包根、JSR 版本
 */
async function gatherResolvedContentPaths(
  usedNames: string[],
  ctx: {
    projectRoot: string;
    optionPackageRoot: string | undefined;
    resolvedPackageRoot: string;
    jsrVersion: string | null;
  },
): Promise<string[]> {
  const seen = new Set<string>();
  const out: string[] = [];

  const tryJoinIfExists = (root: string, rel: string): string | null => {
    const trimmed = root.replace(/\/+$/, "");
    const full = join(trimmed, rel);
    return existsSync(full) ? full : null;
  };

  const optRoot = ctx.optionPackageRoot
    ? (ctx.optionPackageRoot.startsWith("/")
      ? ctx.optionPackageRoot
      : join(ctx.projectRoot, ctx.optionPackageRoot))
    : undefined;

  for (const name of usedNames) {
    const rels = COMPONENT_PATHS[name];
    if (!rels) continue;
    for (const rel of rels) {
      let abs: string | null = null;
      if (optRoot) {
        abs = tryJoinIfExists(optRoot, rel);
      }
      if (!abs) {
        abs = tryJoinIfExists(ctx.resolvedPackageRoot, rel);
      }
      if (!abs) {
        abs = await tryResolveUiPreactRelViaDenoInfo(
          ctx.projectRoot,
          rel,
          ctx.jsrVersion,
        );
      }
      if (!abs) {
        continue;
      }
      if (seen.has(abs)) continue;
      seen.add(abs);
      out.push(abs);
    }
  }
  return out.sort();
}

/**
 * 从本插件的 `import.meta.url`（如 `https://jsr.io/@dreamer/ui-preact/1.0.2-beta.1/plugin.ts`）解析出版本号，
 * 用于拼接 Deno 在 `node_modules/.deno` 下常见的目录名（如 `dreamer__ui-preact@1.0.2-beta.1`）。
 *
 * @param pluginImportMetaUrl - `plugin.ts` 的 `import.meta.url`
 * @returns 版本字符串；非 jsr.io 或非本包路径时返回 `null`
 */
function extractJsrIoDreamerUiPreactVersion(
  pluginImportMetaUrl: string,
): string | null {
  try {
    const u = new URL(pluginImportMetaUrl);
    if (u.hostname !== "jsr.io") return null;
    const m = u.pathname.match(/^\/@dreamer\/ui-preact\/([^/]+)\//);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * 宽松包根判定：Tailwind 扫描至少需要 `src/mod.ts` 与典型组件路径。
 * 部分 `node_modules` 安装树里可能没有包根的 `plugin.ts`（与 `looksLikeUiPreactSourceRoot` 区分）。
 *
 * @param dir - 待检测的绝对路径
 */
function looksLikeUiPreactTailwindContentRoot(dir: string): boolean {
  return existsSync(join(dir, PACKAGE_ROOT_MARKER)) &&
    existsSync(join(dir, "src/shared/basic/Icon.tsx"));
}

/**
 * 猜测本机 Deno 缓存根目录（`deno info` 里的 DENO_DIR），用于尽力从 `registries` 下解析已缓存的 JSR 包树。
 * **非公开稳定 API**：不同 Deno 版本目录结构可能变化；仅作无 `vendor` / 无完整 `node_modules` 时的补充手段。
 */
function collectDenoDirGuesses(): string[] {
  const out: string[] = [];
  const push = (p: string | undefined) => {
    if (p && !out.includes(p)) out.push(p);
  };
  push(getEnv("DENO_DIR"));
  const home = getEnv("HOME") ?? getEnv("USERPROFILE");
  if (home) {
    push(join(home, "Library", "Caches", "deno"));
    push(join(home, ".cache", "deno"));
  }
  const xdg = getEnv("XDG_CACHE_HOME");
  if (xdg) push(join(xdg, "deno"));
  const local = getEnv("LOCALAPPDATA");
  if (local) push(join(local, "deno"));
  return out;
}

/**
 * 在 `$DENO_DIR/registries` 下做有预算的 DFS，查找含 `src/mod.ts` 的 ui-preact 包根。
 * 供「纯 jsr、不开 vendor」时尽力命中本机已缓存的源码树；不保证每台机器都能命中。
 *
 * @returns 包根绝对路径；未找到返回 `null`
 */
function tryResolveUiPreactFromDenoRegistriesCache(): string | null {
  const isHit = (p: string): boolean =>
    looksLikeUiPreactSourceRoot(p) || looksLikeUiPreactTailwindContentRoot(p);

  for (const denoDir of collectDenoDirGuesses()) {
    const reg = join(denoDir, "registries");
    if (!existsSync(reg)) continue;
    let budget = 8000;
    /** 使用箭头函数避免 `no-inner-declarations`（内层 `function dfs` 违反 lint） */
    const dfs = (dir: string, depth: number): string | null => {
      if (budget <= 0 || depth > 14) return null;
      budget--;
      if (isHit(dir)) return dir;
      const low = dir.toLowerCase();
      /** 浅层全展开；深处仅跟进路径上像 JSR / dreamer / ui-preact 的目录，控制遍历量 */
      const broad = depth <= 3;
      const narrow = low.includes("dreamer") ||
        low.includes("ui-preact") ||
        low.includes("jsr.io") ||
        low.includes("@dreamer");
      if (!broad && !narrow) return null;
      try {
        for (const e of readdirSync(dir)) {
          if (!e.isDirectory || e.name === ".bin") continue;
          const h = dfs(join(dir, e.name), depth + 1);
          if (h) return h;
        }
      } catch {
        return null;
      }
      return null;
    };
    const hit = dfs(reg, 0);
    if (hit) return hit;
  }
  return null;
}

/**
 * 在单个 `node_modules/.deno/<存根>/` 子树下做有预算的深度优先搜索，命中 `looksLikeUiPreactSourceRoot` 或 {@link looksLikeUiPreactTailwindContentRoot} 即返回。
 * Deno 可能把 `@jsr/dreamer__ui-preact` 挂在多层 `node_modules` 之下，仅靠固定两级路径会失败（与你日志里「.deno 子目录多但仍 null」一致）。
 *
 * @param stashRoot - 一般为 `node_modules/.deno/<某个子目录>`
 * @param budget - 共享递减计数，防止整盘 `node_modules` 遍历过久
 * @param maxDepth - 单链最大深度
 * @returns 包根目录；未找到返回 `null`
 */
function tryFindUiPreactPackageInDenoStashSubtree(
  stashRoot: string,
  budget: { n: number },
  maxDepth: number,
): string | null {
  const isHit = (dir: string): boolean =>
    looksLikeUiPreactSourceRoot(dir) ||
    looksLikeUiPreactTailwindContentRoot(dir);

  function walk(dir: string, depth: number): string | null {
    if (budget.n <= 0 || depth > maxDepth) return null;
    budget.n--;
    if (isHit(dir)) return dir;
    let list;
    try {
      list = readdirSync(dir);
    } catch {
      return null;
    }
    /** 优先进入与 ui-preact / JSR 相关的目录名，更快命中 */
    const dirs = list.filter((e) => e.isDirectory && e.name !== ".bin").sort(
      (a, b) => {
        const rank = (name: string): number =>
          /ui-preact|dreamer__ui-preact|@jsr|@dreamer|jsr/i.test(name)
            ? 0
            : name === "node_modules"
            ? 1
            : 2;
        return rank(a.name) - rank(b.name);
      },
    );
    for (const e of dirs) {
      const hit = walk(join(dir, e.name), depth + 1);
      if (hit) return hit;
    }
    return null;
  }
  return walk(stashRoot, 0);
}

/**
 * 在应用根目录的 `node_modules` / `vendor` 下解析 `@dreamer/ui-preact` 包根（存在 `src/mod.ts`）。
 *
 * **背景**：纯 `jsr:` 依赖在 Deno 2 中往往**不会**在顶层出现带完整 `src/` 的 `node_modules/@jsr/dreamer__ui-preact`；
 * `nodeModulesDir: "auto"` 时更常见的是 `node_modules/.deno/<包说明@版本>/node_modules/@jsr/dreamer__ui-preact`。
 * 因此除顶层两路径外，还须按版本拼 `.deno` 候选目录，并**枚举** `.deno` 下各子目录的 `node_modules/@jsr|@dreamer`。
 *
 * @param projectRoot - 一般为应用 `cwd()`
 * @param pluginImportMetaUrl - 本插件模块的 `import.meta.url`（https 时用于解析版本）
 * @returns 包根绝对路径；未找到时 `null`
 */
function tryResolveUiPreactPackageRootFromNodeModules(
  projectRoot: string,
  pluginImportMetaUrl: string,
): string | null {
  /** 严格或宽松包根均可（见 {@link looksLikeUiPreactTailwindContentRoot}） */
  const tryDir = (dir: string): string | null =>
    looksLikeUiPreactSourceRoot(dir) ||
      looksLikeUiPreactTailwindContentRoot(dir)
      ? dir
      : null;

  const direct = [
    join(projectRoot, "node_modules", "@jsr", "dreamer__ui-preact"),
    join(projectRoot, "node_modules", "@dreamer", "ui-preact"),
  ];
  for (const dir of direct) {
    const hit = tryDir(dir);
    if (hit) return hit;
  }

  /**
   * `deno.json` 设 `vendor: true` 时，常见布局是 `vendor/jsr.io/@dreamer/ui-preact`（包根下直接是 `src/`，**未必**还有 `/<version>` 子目录）。
   * 须先于仅带版本号的路径探测，否则会一直「无标记」。
   */
  const vendorEarly = [
    join(projectRoot, "vendor", "jsr.io", "@dreamer", "ui-preact"),
    join(projectRoot, "vendor", "@dreamer", "ui-preact"),
  ];
  for (const vr of vendorEarly) {
    const hitRoot = tryDir(vr);
    if (hitRoot) return hitRoot;
    if (!existsSync(vr)) continue;
    try {
      for (const e of readdirSync(vr)) {
        if (!e.isDirectory) continue;
        const hitChild = tryDir(join(vr, e.name));
        if (hitChild) return hitChild;
      }
    } catch {
      /** 忽略无读权限 */
    }
  }

  const ver = extractJsrIoDreamerUiPreactVersion(pluginImportMetaUrl);
  if (ver) {
    const versionedHints = [
      join(
        projectRoot,
        "node_modules",
        ".deno",
        `dreamer__ui-preact@${ver}`,
        "node_modules",
        "@jsr",
        "dreamer__ui-preact",
      ),
      join(
        projectRoot,
        "node_modules",
        ".deno",
        `@jsr+dreamer__ui-preact@${ver}`,
        "node_modules",
        "@jsr",
        "dreamer__ui-preact",
      ),
      join(
        projectRoot,
        "node_modules",
        ".deno",
        `dreamer__ui-preact@${ver}`,
        "node_modules",
        "@dreamer",
        "ui-preact",
      ),
      join(projectRoot, "vendor", "jsr.io", "@dreamer", "ui-preact", ver),
      join(projectRoot, "vendor", "@dreamer", "ui-preact", ver),
    ];
    for (const dir of versionedHints) {
      const hit = tryDir(dir);
      if (hit) return hit;
    }
  }

  const denoNm = join(projectRoot, "node_modules", ".deno");
  if (!existsSync(denoNm)) return null;
  try {
    for (const entry of readdirSync(denoNm)) {
      if (!entry.isDirectory) continue;
      const nested = [
        join(denoNm, entry.name, "node_modules", "@jsr", "dreamer__ui-preact"),
        join(denoNm, entry.name, "node_modules", "@dreamer", "ui-preact"),
      ];
      for (const dir of nested) {
        const hit = tryDir(dir);
        if (hit) return hit;
      }
    }
    /** 固定两级仍找不到时：在每个 `.deno` 子目录下做有限 DFS（Deno 实际嵌套可能更深） */
    const budget = { n: 28000 };
    const tops = readdirSync(denoNm).filter((e) => e.isDirectory);
    tops.sort((a, b) => {
      const rank = (name: string): number =>
        /ui-preact|dreamer__ui-preact/i.test(name)
          ? 0
          : /jsr|dreamer/i.test(name)
          ? 1
          : 2;
      return rank(a.name) - rank(b.name);
    });
    for (const entry of tops) {
      if (budget.n <= 0) break;
      const hit = tryFindUiPreactPackageInDenoStashSubtree(
        join(denoNm, entry.name),
        budget,
        20,
      );
      if (hit) return hit;
    }
  } catch {
    /** 无读权限或目录中途变化时忽略 */
  }
  return null;
}

/**
 * 解析到的目录是否像真实的 ui-preact 源码根（含完整 `src/shared`），而非误选的 `dist`。
 *
 * @param dir - 待检测的绝对路径
 */
function looksLikeUiPreactSourceRoot(dir: string): boolean {
  /** `dist/` 下通常没有 `plugin.ts`，可区分「打包产物目录」与真实包根 */
  return existsSync(join(dir, "plugin.ts")) &&
    existsSync(join(dir, PACKAGE_ROOT_MARKER)) &&
    existsSync(join(dir, "src/shared/basic/Icon.tsx"));
}

/** 插件配置 */
export interface UiPreactTailwindContentPluginOptions {
  /** 生成的 @source 文件路径（相对 cwd 或绝对），用户需在 tailwind.css 中 @import */
  outputPath: string;
  /**
   * 扫描应用源码、解析 `import … from "@dreamer/ui-preact"` 的根目录（相对 cwd）。
   * 可传单个字符串，或传只读数组只扫若干子树（如 `["src/frontend","src/common"]`），避免遍历 backend/mobile、降低扫描量。
   * 省略时默认为 `["src"]`（与旧版默认 `"src"` 一致）。
   */
  scanPath?: string | readonly string[];
  /** @dreamer/ui-preact 包根目录（可选；不传则用插件所在包根） */
  packageRoot?: string;
}

/**
 * 将 {@link UiPreactTailwindContentPluginOptions.scanPath} 规范为非空相对路径列表。
 *
 * @param scanPath - 来自插件选项；`undefined` 时使用默认 `src`
 * @returns 规范化后的目录列表（相对 cwd）
 */
function normalizeTailwindScanPaths(
  scanPath?: string | readonly string[],
): string[] {
  if (scanPath === undefined) {
    return ["src"];
  }
  const raw = typeof scanPath === "string" ? [scanPath] : [...scanPath];
  const trimmed = raw.map((s) => String(s).trim()).filter((s) => s.length > 0);
  return trimmed.length > 0 ? trimmed : ["src"];
}

/**
 * 组件名 → 相对包根的源码路径列表（新增组件时需在本对象中补全对应路径）。
 *
 * 注意：
 * - 导出组件名与「文件导出名」不一致时须多键指向同一文件（如 Title 与 Typography、Toast 与 ToastContainer）。
 * - `Icon*` 单品过多：任意 `Icon` 前缀导入会触发 mergeIntrinsicIconSources 递归扫描 `icons/`。
 * - Button / ButtonGroup / Link 依赖 `button-variants.ts` 中的类名字符串，映射中须同时列出该文件。
 * - Input、Select、DatePicker 等依赖 `input-focus-ring.ts` 中的 `focus:ring-*`、`has-[input:focus]:*`、`pickerTriggerSurface` 等类名字符串，映射中须同时列出该文件（与 button-variants 同理）。
 * - DatePicker / DateTimePicker / TimePicker 依赖 `picker-portal-utils.ts` 中的 `pickerTimeListScrollClass`（含隐藏滚动条、列宽等任意类），须一并扫描，否则按需构建会丢样式。
 * - RichTextEditor 从同文件引用 `getFormPortalBodyHost`，若需该文件内其它类名亦须映射。
 * - MarkdownEditor 使用 `@dreamer/markdown` 的 `parse` 与桌面 `Tooltip`；须映射 `MarkdownEditor.tsx`、`Tooltip.tsx`、`input-focus-ring.ts`。
 * - 单文件图标（`icons/*.tsx`）、`Calendar.tsx`、`ChartBase.tsx` 等被组件 import 时须写入对应组件的路径列表；`gatherResolvedContentPaths` 会去重。
 * - 纯函数 / store（message、toast、getConfig 等）不含 Tailwind class，无需映射。
 * - `desktop/form`、`mobile/form` 下若仅为 `export * from ../../shared/form/...` 的薄再导出，只列 **shared 实现文件** 即可，不必重复写 D/M 路径。
 */

const COMPONENT_PATHS: Record<string, string[]> = {
  "Table": [
    "src/desktop/data-display/Table.tsx",
    "src/shared/form/DatePicker.tsx",
    "src/shared/form/TimePicker.tsx",
    "src/shared/form/picker-portal-utils.ts",
    "src/shared/form/picker-trigger-icon.ts",
    "src/shared/form/picker-calendar-nav.tsx",
    "src/shared/data-display/Calendar.tsx",
    "src/shared/data-display/calendar-utils.ts",
    "src/shared/basic/icons/Calendar.tsx",
    "src/shared/basic/icons/ChevronLeft.tsx",
    "src/shared/basic/icons/ChevronRight.tsx",
    "src/shared/basic/icons/Clock.tsx",
    "src/shared/form/input-focus-ring.ts",
    "src/shared/basic/icons/ChevronDown.tsx",
    "src/shared/basic/icons/ChevronUp.tsx",
  ],
  "Dialog": [
    "src/desktop/feedback/Dialog.tsx",
    "src/mobile/feedback/Dialog.tsx",
    "src/shared/basic/Button.tsx",
    "src/shared/basic/button-variants.ts",
    "src/desktop/feedback/Modal.tsx",
    "src/shared/basic/icons/Close.tsx",
    "src/shared/basic/icons/ExitFullscreen.tsx",
    "src/shared/basic/icons/Maximize2.tsx",
  ],
  "Modal": [
    "src/desktop/feedback/Modal.tsx",
    "src/shared/feedback/Modal.tsx",
    "src/shared/basic/icons/Close.tsx",
    "src/shared/basic/icons/ExitFullscreen.tsx",
    "src/shared/basic/icons/Maximize2.tsx",
  ],
  "Popconfirm": [
    "src/desktop/feedback/Popconfirm.tsx",
    "src/shared/basic/Button.tsx",
    "src/shared/basic/button-variants.ts",
    "src/shared/basic/icons/HelpCircle.tsx",
  ],
  "Popover": [
    "src/desktop/feedback/Popover.tsx",
  ],
  "Tooltip": [
    "src/desktop/feedback/Tooltip.tsx",
  ],
  "Cascader": [
    "src/shared/form/Cascader.tsx",
    "src/shared/basic/icons/ChevronDown.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "DatePicker": [
    "src/shared/form/DatePicker.tsx",
    "src/shared/form/picker-portal-utils.ts",
    "src/shared/form/picker-trigger-icon.ts",
    "src/shared/form/picker-calendar-nav.tsx",
    "src/shared/data-display/Calendar.tsx",
    "src/shared/data-display/calendar-utils.ts",
    "src/shared/basic/icons/Calendar.tsx",
    "src/shared/basic/icons/ChevronLeft.tsx",
    "src/shared/basic/icons/ChevronRight.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "DateTimePicker": [
    "src/shared/form/DateTimePicker.tsx",
    "src/shared/form/picker-portal-utils.ts",
    "src/shared/form/picker-trigger-icon.ts",
    "src/shared/form/picker-calendar-nav.tsx",
    "src/shared/data-display/Calendar.tsx",
    "src/shared/data-display/calendar-utils.ts",
    "src/shared/basic/icons/Calendar.tsx",
    "src/shared/basic/icons/ChevronLeft.tsx",
    "src/shared/basic/icons/ChevronRight.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "MultiSelect": [
    "src/shared/form/MultiSelect.tsx",
    "src/shared/basic/icons/ChevronDown.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "Select": [
    "src/shared/form/Select.tsx",
    "src/shared/basic/icons/ChevronDown.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "Transfer": [
    "src/shared/form/Transfer.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "TreeSelect": [
    "src/shared/form/TreeSelect.tsx",
    "src/shared/basic/icons/ChevronDown.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "Breadcrumb": [
    "src/desktop/navigation/Breadcrumb.tsx",
    "src/shared/basic/Link.tsx",
    "src/shared/basic/button-variants.ts",
    "src/shared/basic/icons/ChevronRight.tsx",
  ],
  "Dropdown": [
    "src/desktop/navigation/Dropdown.tsx",
  ],
  "ActionSheet": [
    "src/mobile/MobilePortalHostScope.tsx",
    "src/mobile/feedback/ActionSheet.tsx",
  ],
  "BottomSheet": [
    "src/mobile/MobilePortalHostScope.tsx",
    "src/mobile/feedback/BottomSheet.tsx",
    "src/shared/basic/icons/Close.tsx",
  ],
  "PullRefresh": [
    "src/mobile/feedback/PullRefresh.tsx",
  ],
  "SwipeCell": [
    "src/mobile/feedback/SwipeCell.tsx",
  ],
  /** D/M 均有 NavBar 实现，按需扫描两处源码 */
  "NavBar": [
    "src/desktop/navigation/NavBar.tsx",
    "src/mobile/navigation/NavBar.tsx",
    "src/shared/layout/Container.tsx",
    "src/shared/basic/icons/ChevronLeft.tsx",
  ],
  "TabBar": [
    "src/mobile/navigation/TabBar.tsx",
  ],
  "MobilePortalHostScope": [
    "src/mobile/MobilePortalHostScope.tsx",
  ],
  "Avatar": [
    "src/shared/basic/Avatar.tsx",
  ],
  "Badge": [
    "src/shared/basic/Badge.tsx",
  ],
  /**
   * Button 与 {@link ButtonGroup} 共用源码；尺寸/变体类在 `button-variants.ts`，须一并扫描否则按需构建会丢类。
   */
  "Button": [
    "src/shared/basic/Button.tsx",
    "src/shared/basic/button-variants.ts",
  ],
  /** 与 Button 同文件导出，仅映射 Button 时按需会漏扫 ButtonGroup 内的 class */
  "ButtonGroup": [
    "src/shared/basic/Button.tsx",
    "src/shared/basic/button-variants.ts",
  ],
  "Icon": [
    "src/shared/basic/Icon.tsx",
  ],
  /**
   * 链接按钮模式与 Button 共用 `button-variants.ts` 中的 Tailwind 片段，须纳入 @source。
   */
  "Link": [
    "src/shared/basic/Link.tsx",
    "src/shared/basic/button-variants.ts",
  ],
  "Skeleton": [
    "src/shared/basic/Skeleton.tsx",
  ],
  "Spinner": [
    "src/shared/basic/Spinner.tsx",
  ],
  /**
   * 实际导出名为 Title / Paragraph / Text；若只映射 Typography，按需 @source 会漏扫，
   * 导致如 dark:text-gray-200 等仅写在 Typography.tsx 内的工具类不会进入最终 CSS。
   */
  "Title": [
    "src/shared/basic/Typography.tsx",
  ],
  "Paragraph": [
    "src/shared/basic/Typography.tsx",
  ],
  "Text": [
    "src/shared/basic/Typography.tsx",
  ],
  "Typography": [
    "src/shared/basic/Typography.tsx",
  ],
  "ChartBar": [
    "src/shared/charts/ChartBar.tsx",
    "src/shared/charts/ChartBase.tsx",
    "src/shared/charts/types.ts",
  ],
  "ChartBase": [
    "src/shared/charts/ChartBase.tsx",
    "src/shared/charts/types.ts",
  ],
  "ChartBubble": [
    "src/shared/charts/ChartBubble.tsx",
    "src/shared/charts/ChartBase.tsx",
    "src/shared/charts/types.ts",
  ],
  "ChartDoughnut": [
    "src/shared/charts/ChartDoughnut.tsx",
    "src/shared/charts/ChartBase.tsx",
    "src/shared/charts/types.ts",
  ],
  "ChartLine": [
    "src/shared/charts/ChartLine.tsx",
    "src/shared/charts/ChartBase.tsx",
    "src/shared/charts/types.ts",
  ],
  "ChartPie": [
    "src/shared/charts/ChartPie.tsx",
    "src/shared/charts/ChartBase.tsx",
    "src/shared/charts/types.ts",
  ],
  "ChartPolarArea": [
    "src/shared/charts/ChartPolarArea.tsx",
    "src/shared/charts/ChartBase.tsx",
    "src/shared/charts/types.ts",
  ],
  "ChartRadar": [
    "src/shared/charts/ChartRadar.tsx",
    "src/shared/charts/ChartBase.tsx",
    "src/shared/charts/types.ts",
  ],
  "ChartScatter": [
    "src/shared/charts/ChartScatter.tsx",
    "src/shared/charts/ChartBase.tsx",
    "src/shared/charts/types.ts",
  ],
  "ConfigProvider": [
    "src/shared/config-provider/ConfigProvider.tsx",
  ],
  "Calendar": [
    "src/shared/data-display/Calendar.tsx",
    "src/shared/data-display/calendar-utils.ts",
  ],
  "Card": [
    "src/shared/data-display/Card.tsx",
  ],
  "Carousel": [
    "src/shared/data-display/Carousel.tsx",
    "src/shared/data-display/Image.tsx",
    "src/shared/basic/icons/ChevronLeft.tsx",
    "src/shared/basic/icons/ChevronRight.tsx",
  ],
  "CodeBlock": [
    "src/shared/data-display/CodeBlock.tsx",
    "src/shared/basic/icons/Copy.tsx",
  ],
  "Collapse": [
    "src/shared/data-display/Collapse.tsx",
    "src/shared/basic/icons/ChevronDown.tsx",
  ],
  "Comment": [
    "src/shared/data-display/Comment.tsx",
  ],
  "Descriptions": [
    "src/shared/data-display/Descriptions.tsx",
  ],
  "Empty": [
    "src/shared/data-display/Empty.tsx",
  ],
  "Image": [
    "src/shared/data-display/Image.tsx",
  ],
  "ImageViewer": [
    "src/shared/data-display/ImageViewer.tsx",
    "src/shared/basic/icons/ChevronLeft.tsx",
    "src/shared/basic/icons/ChevronRight.tsx",
    "src/shared/basic/icons/Close.tsx",
    "src/shared/basic/icons/RotateCcw.tsx",
    "src/shared/basic/icons/RotateCw.tsx",
    "src/shared/basic/icons/ZoomIn.tsx",
    "src/shared/basic/icons/ZoomOut.tsx",
  ],
  "List": [
    "src/shared/data-display/List.tsx",
  ],
  "ScrollList": [
    "src/mobile/data-display/ScrollList.tsx",
    "src/mobile/feedback/PullRefresh.tsx",
    "src/shared/data-display/List.tsx",
    "src/shared/feedback/controlled-open.ts",
  ],
  "Segmented": [
    "src/shared/data-display/Segmented.tsx",
  ],
  "Statistic": [
    "src/shared/data-display/Statistic.tsx",
  ],
  "Tag": [
    "src/shared/data-display/Tag.tsx",
  ],
  "Timeline": [
    "src/shared/data-display/Timeline.tsx",
  ],
  "Tree": [
    "src/shared/data-display/Tree.tsx",
    "src/shared/basic/icons/ChevronRight.tsx",
  ],
  "Alert": [
    "src/shared/feedback/Alert.tsx",
    "src/shared/basic/icons/AlertCircle.tsx",
    "src/shared/basic/icons/CheckCircle.tsx",
    "src/shared/basic/icons/Info.tsx",
    "src/shared/basic/icons/XCircle.tsx",
  ],
  "Drawer": [
    "src/shared/feedback/Drawer.tsx",
    "src/shared/basic/icons/Close.tsx",
  ],
  "Notification": [
    "src/shared/feedback/Notification.tsx",
    "src/shared/basic/icons/AlertCircle.tsx",
    "src/shared/basic/icons/Bell.tsx",
    "src/shared/basic/icons/CheckCircle.tsx",
    "src/shared/basic/icons/Info.tsx",
    "src/shared/basic/icons/XCircle.tsx",
  ],
  "Progress": [
    "src/shared/feedback/Progress.tsx",
  ],
  "Result": [
    "src/shared/feedback/Result.tsx",
    "src/shared/basic/icons/AlertCircle.tsx",
    "src/shared/basic/icons/CheckCircle.tsx",
    "src/shared/basic/icons/HelpCircle.tsx",
    "src/shared/basic/icons/Info.tsx",
    "src/shared/basic/icons/ShieldAlert.tsx",
    "src/shared/basic/icons/XCircle.tsx",
  ],
  "Toast": [
    "src/shared/feedback/Toast.tsx",
  ],
  /** 包内 JSX 导出名为 *Container，须单独映射否则只用 Toast 时不会扫 Toast.tsx */
  "ToastContainer": [
    "src/shared/feedback/Toast.tsx",
  ],
  "MessageContainer": [
    "src/shared/feedback/Message.tsx",
    "src/shared/basic/icons/AlertCircle.tsx",
    "src/shared/basic/icons/CheckCircle.tsx",
    "src/shared/basic/icons/Info.tsx",
    "src/shared/basic/icons/XCircle.tsx",
  ],
  "NotificationContainer": [
    "src/shared/feedback/Notification.tsx",
    "src/shared/basic/icons/AlertCircle.tsx",
    "src/shared/basic/icons/Bell.tsx",
    "src/shared/basic/icons/CheckCircle.tsx",
    "src/shared/basic/icons/Info.tsx",
    "src/shared/basic/icons/XCircle.tsx",
  ],
  "AutoComplete": [
    "src/shared/form/AutoComplete.tsx",
  ],
  "Checkbox": [
    "src/shared/form/Checkbox.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "CheckboxGroup": [
    "src/shared/form/CheckboxGroup.tsx",
    "src/shared/form/Checkbox.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "ColorPicker": [
    "src/shared/form/ColorPicker.tsx",
    "src/shared/form/input-focus-ring.ts",
    "src/shared/basic/icons/Palette.tsx",
  ],
  "Form": [
    "src/shared/form/Form.tsx",
  ],
  "FormItem": [
    "src/shared/form/FormItem.tsx",
  ],
  "FormList": [
    "src/shared/form/FormList.tsx",
  ],
  "Input": [
    "src/shared/form/Input.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "InputNumber": [
    "src/shared/form/InputNumber.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "Mentions": [
    "src/shared/form/Mentions.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  /** 工具栏与 RichTextEditor 同款样式类 + Tooltip；运行时依赖 `jsr:@dreamer/markdown` */
  "MarkdownEditor": [
    "src/shared/form/MarkdownEditor.tsx",
    "src/desktop/feedback/Tooltip.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "Password": [
    "src/shared/form/Password.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "Radio": [
    "src/shared/form/Radio.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "RadioGroup": [
    "src/shared/form/RadioGroup.tsx",
    "src/shared/form/Radio.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "Rate": [
    "src/shared/form/Rate.tsx",
  ],
  "RichTextEditor": [
    "src/shared/form/RichTextEditor.tsx",
    "src/shared/form/picker-portal-utils.ts",
    "src/shared/form/input-focus-ring.ts",
    "src/desktop/feedback/Modal.tsx",
    "src/shared/basic/icons/Close.tsx",
    "src/shared/basic/icons/ExitFullscreen.tsx",
    "src/shared/basic/icons/Maximize2.tsx",
    "src/shared/basic/Button.tsx",
    "src/shared/basic/button-variants.ts",
    "src/shared/basic/icons/Type.tsx",
    "src/shared/form/Input.tsx",
  ],
  "Search": [
    "src/shared/form/Search.tsx",
    "src/shared/form/input-focus-ring.ts",
    "src/shared/basic/icons/Search.tsx",
  ],
  "Slider": [
    "src/shared/form/Slider.tsx",
  ],
  "Switch": [
    "src/shared/form/Switch.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "Textarea": [
    "src/shared/form/Textarea.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "TimePicker": [
    "src/shared/form/TimePicker.tsx",
    "src/shared/form/picker-portal-utils.ts",
    "src/shared/form/picker-trigger-icon.ts",
    "src/shared/basic/icons/Clock.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "Upload": [
    "src/shared/form/Upload.tsx",
    "src/shared/form/chunked-upload.ts",
    "src/shared/form/upload-http.ts",
    "src/shared/basic/Icon.tsx",
    "src/shared/basic/icons/Upload.tsx",
  ],
  "Accordion": [
    "src/shared/layout/Accordion.tsx",
    "src/shared/basic/icons/ChevronDown.tsx",
  ],
  "Container": [
    "src/shared/layout/Container.tsx",
  ],
  "Divider": [
    "src/shared/layout/Divider.tsx",
  ],
  "Grid": [
    "src/shared/layout/Grid.tsx",
  ],
  "Hero": [
    "src/shared/layout/Hero.tsx",
  ],
  "Stack": [
    "src/shared/layout/Stack.tsx",
  ],
  "Tabs": [
    "src/shared/layout/Tabs.tsx",
  ],
  "Affix": [
    "src/shared/navigation/Affix.tsx",
  ],
  "Anchor": [
    "src/shared/navigation/Anchor.tsx",
  ],
  "BackTop": [
    "src/shared/navigation/BackTop.tsx",
    "src/shared/basic/icons/ChevronUp.tsx",
  ],
  "Menu": [
    "src/shared/navigation/Menu.tsx",
    "src/shared/basic/icons/ChevronRight.tsx",
  ],
  "PageHeader": [
    "src/shared/navigation/PageHeader.tsx",
    "src/shared/basic/icons/ArrowLeft.tsx",
  ],
  "Pagination": [
    "src/shared/navigation/Pagination.tsx",
    "src/shared/basic/icons/ChevronLeft.tsx",
    "src/shared/basic/icons/ChevronRight.tsx",
  ],
  "Sidebar": [
    "src/shared/navigation/Sidebar.tsx",
    "src/shared/basic/Link.tsx",
    "src/shared/basic/button-variants.ts",
    "src/shared/basic/icons/ChevronDown.tsx",
    "src/shared/basic/icons/ChevronRight.tsx",
  ],
  "Steps": [
    "src/shared/navigation/Steps.tsx",
    "src/shared/basic/icons/Check.tsx",
  ],
};

/**
 * 匹配具名导入：主包、子路径（如 @dreamer/ui-preact/mobile、/form）、jsr: spec。
 * 注意：仅 `@dreamer/ui-preact` 不含后续路径时，`/mobile` 会留在引号内导致整段匹配失败，故必须允许 `/…`。
 */
const RE_NAMED_IMPORT =
  /import\s*(?:type\s*)?\{\s*([^}]+)\}\s*from\s*["'](?:@dreamer\/ui-preact(?:\/[^"']*)?|jsr:[^"']*ui-preact[^"']*)["']/g;

function parseNamedImportSpecifiers(specifiers: string): string[] {
  return specifiers
    .split(",")
    .map((s) => s.trim().split(/\s+as\s+/i)[0].trim())
    .filter(Boolean);
}

async function collectTsTsx(
  dir: string,
  baseDir: string,
  out: string[],
): Promise<void> {
  const entries = await readdir(dir);
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      await collectTsTsx(full, baseDir, out);
    } else if (
      entry.isFile &&
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))
    ) {
      out.push(full);
    }
  }
}

function extractUsedNames(content: string): string[] {
  const names = new Set<string>();
  let m: RegExpExecArray | null;
  RE_NAMED_IMPORT.lastIndex = 0;
  while ((m = RE_NAMED_IMPORT.exec(content)) !== null) {
    for (const name of parseNamedImportSpecifiers(m[1])) {
      names.add(name);
    }
  }
  return Array.from(names);
}

/**
 * 内置图标以 `IconXxx` 单独导出、文件分散在 icons/ 子目录；不可能在 COMPONENT_PATHS 中逐一手写。
 * 若扫描结果中出现任意 `Icon` 前缀组件名，则递归加入 `src/shared/basic/icons` 下全部 `.tsx` 供 Tailwind 收集 class。
 *
 * **注意**：仅当 `packageRoot` 下存在真实的 `src/shared/basic/icons/Icon.tsx`（可列目录）时才递归；
 * JSR 哈希缓存下无「icons 目录」语义，递归会失败或误扫海量无关文件，此时跳过整目录合并。
 *
 * @param usedNames - 从项目源码提取的具名导入符号
 * @param packageRoot - ui-preact 包根绝对路径（可能来自探测，未必为真实磁盘树）
 * @param paths - gatherResolvedContentPaths 结果，本函数会原地追加并重新排序
 */
async function mergeIntrinsicIconSources(
  usedNames: Iterable<string>,
  packageRoot: string,
  paths: string[],
): Promise<void> {
  let anyIcon = false;
  for (const n of usedNames) {
    if (/^Icon[A-Z]/.test(n)) {
      anyIcon = true;
      break;
    }
  }
  if (!anyIcon) return;

  const iconRoot = join(packageRoot, "src/shared/basic/icons");
  const iconEntry = join(iconRoot, "Icon.tsx");
  if (!existsSync(iconEntry)) {
    return;
  }

  const iconFiles: string[] = [];
  try {
    await collectTsTsx(iconRoot, iconRoot, iconFiles);
  } catch {
    return;
  }
  const seen = new Set(paths);
  for (const f of iconFiles) {
    if (seen.has(f)) continue;
    seen.add(f);
    paths.push(f);
  }
  paths.sort();
}

/**
 * 将组件源码绝对路径转为写入 `ui-preact-sources.css`（或业务自定义 outputPath）的 `@source` 引用串。
 * Tailwind v4 按「当前 CSS 文件所在目录」解析相对路径；若写入本机绝对路径（如 `/Users/...`），
 * 在其它机器或 CI（路径不同）上 `deno task build` 会找不到文件或 Tailwind 报错。
 *
 * @param sourcesCssDir - 生成的 `@source` 聚合 CSS 所在目录（绝对路径）
 * @param absFilePath - 待扫描的 `.ts`/`.tsx` 绝对路径
 * @returns 以 `./` 或 `../` 开头的相对路径（正斜杠）
 */
function toAtSourceSpecifier(
  sourcesCssDir: string,
  absFilePath: string,
): string {
  let rel = relative(sourcesCssDir, absFilePath);
  if (rel === "" || rel === ".") {
    return ".";
  }
  rel = rel.replace(/\\/g, "/");
  /** Windows 跨盘符时 relative 可能返回 `D:/...` 绝对路径，勿再加 `./` 前缀 */
  if (/^[A-Za-z]:\//.test(rel) || rel.startsWith("/")) {
    return rel;
  }
  if (!rel.startsWith(".")) {
    return `./${rel}`;
  }
  return rel;
}

/**
 * 将异常转为可读的纯文本，便于日志里出现「message + stack」，避免宿主只 `JSON.stringify(error)` 得到 `{}`。
 *
 * @param e - 任意 throw 值
 * @returns 多行字符串，含 `Error.message` 与 `stack`（若有）
 */
function formatPluginError(e: unknown): string {
  if (e instanceof Error) {
    return e.stack ?? `${e.name}: ${e.message}`;
  }
  if (e !== null && typeof e === "object") {
    try {
      return JSON.stringify(e);
    } catch {
      return Object.prototype.toString.call(e);
    }
  }
  return String(e);
}

/**
 * 从容器取出 `@dreamer/logger` 的 `Logger`（仅 `instanceof Logger` 时视为官方实例）
 *
 * @param container - dweb 等服务容器
 */
function tryGetDreamerLoggerFromContainer(
  container: ServiceContainer,
): Logger | undefined {
  try {
    if (container.has("logger")) {
      const raw = container.get("logger");
      if (raw instanceof Logger) return raw;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

/**
 * 非 `@dreamer/logger` 注入时，`onInit` 失败仍可通过宿主自定义 `error` 输出
 */
type TailwindPluginLegacyLogger = {
  error?: (msg: string, ...args: unknown[]) => void;
};

/**
 * Tailwind 步骤日志：**统一走 `@dreamer/logger`**——容器内有 `Logger` 时用 `child({ tags })` 打 debug；
 * 否则独立 `createLogger`（level 为 `debug`）。
 *
 * @param container - 服务容器
 * @returns 仅含 `debug` 的封装
 */
function createUiPreactTailwindPluginLog(
  container: ServiceContainer,
): { debug: (msg: string) => void } {
  const tag = "ui-preact-tailwind";
  const base = tryGetDreamerLoggerFromContainer(container);
  /** 子 Logger 带 tag；无应用级 Logger 时使用独立实例 */
  const dl: Logger = base ? base.child({ tags: [tag] }) : createLogger({
    level: "debug",
    format: "text",
    tags: [tag],
    output: { console: true },
  });
  return {
    /** Tailwind 扫描 / 写入 @source CSS 等步骤信息 */
    debug(msg: string): void {
      dl.debug(msg);
    },
  };
}

/**
 * 创建 ui-preact Tailwind 按需 content 插件
 *
 * 参数：outputPath（生成文件路径）、scanPath（单个或数组扫描目录）、packageRoot（可选）。
 * 在 onInit 时即扫描导入的 ui-preact 组件，生成只含 @source 的 CSS，Tailwind 扫描该文件即可收集 class。
 */
export function uiPreactTailwindPlugin(
  options: UiPreactTailwindContentPluginOptions,
): Plugin {
  const {
    outputPath,
    scanPath: scanPathOpt,
    packageRoot: optionPackageRoot,
  } = options;

  /**
   * 解析 @dreamer/ui-preact 包根：本地 file → cwd 向上找仓库 → `node_modules/@jsr/dreamer__ui-preact`（JSR 安装树）。
   */
  const resolvePackageRoot = (): string => {
    const root = cwd();

    if (optionPackageRoot) {
      return optionPackageRoot.startsWith("/")
        ? optionPackageRoot
        : join(root, optionPackageRoot);
    }
    /** 本地 file 映射 / 工作区：`import.meta.url` 为 file:// */
    const fromFileDir = dirnameOfThisPluginIfFileUrl();
    if (fromFileDir != null && looksLikeUiPreactSourceRoot(fromFileDir)) {
      return fromFileDir;
    }
    /** 在 ui-preact 仓库内跑 docs：cwd 向上能碰到 plugin.ts + src/mod.ts */
    const fromCwd = findUiPreactPackageRootFromCwd();
    if (fromCwd != null) {
      return fromCwd;
    }
    /** 从 JSR + `nodeModulesDir: auto`：完整树常在 `node_modules/.deno/.../node_modules/@jsr/dreamer__ui-preact` */
    const fromNm = tryResolveUiPreactPackageRootFromNodeModules(
      root,
      import.meta.url,
    );
    if (fromNm != null) {
      return fromNm;
    }
    /** 无 `vendor: true` 时：尽力从本机 `DENO_DIR/registries` 命中已缓存的 JSR 源码树（不保证每台机器都有） */
    const fromReg = tryResolveUiPreactFromDenoRegistriesCache();
    if (fromReg != null) {
      return fromReg;
    }
    if (fromFileDir != null) {
      return fromFileDir;
    }
    /**
     * Deno 下纯 JSR 且无源码树时：`gatherResolvedContentPaths` 会用 `deno info https://jsr.io/...` 解析各文件的哈希缓存路径，
     * 此处仅需一个用于 `join(rel)` 尝试与 `mergeIntrinsicIconSources` 的占位根；用 cwd 即可（icons 全量扫描会因无 Icon.tsx 而跳过）。
     */
    if (IS_DENO) {
      return root;
    }
    throw new Error(
      `[ui-preact-tailwind] 无法解析 @dreamer/ui-preact 包根（cwd=${root}）。请设置 packageRoot、使用 vendor/npm 安装树，或在 Deno 下使用 jsr: 依赖。import.meta.url=${import.meta.url}`,
    );
  };

  return {
    name: "ui-preact-tailwind",
    version: "0.1.0",

    async onInit(container: ServiceContainer): Promise<void> {
      const dreamer = tryGetDreamerLoggerFromContainer(container);
      const log = createUiPreactTailwindPluginLog(container);

      /**
       * 输出 onInit 失败：优先 `@dreamer/logger.error`；否则宿主注入的 `error`；再无则 `console.error`。
       *
       * @param phase - 阶段说明
       * @param e - 异常对象
       * @param ctx - 额外上下文（cwd、路径等）
       */
      const logInitFailure = (
        phase: string,
        e: unknown,
        ctx?: Record<string, string>,
      ): void => {
        const ctxLines = ctx
          ? Object.entries(ctx).map(([k, v]) => `${k}=${v}`).join("\n")
          : "";
        const text = `[ui-preact-tailwind] ${phase}${
          ctxLines ? `\n上下文:\n${ctxLines}` : ""
        }\n${formatPluginError(e)}`;
        if (dreamer) {
          dreamer.error(text);
          return;
        }
        const legacy = container.tryGet<TailwindPluginLegacyLogger>("logger");
        if (legacy?.error) {
          legacy.error(text);
          return;
        }
        console.error(text);
      };

      const root = cwd();
      const scanDirs = normalizeTailwindScanPaths(scanPathOpt);

      try {
        const files: string[] = [];
        for (const rel of scanDirs) {
          const scanDirAbs = join(root, rel);
          try {
            await collectTsTsx(scanDirAbs, scanDirAbs, files);
          } catch (e) {
            log.debug(
              `扫描目录失败，已跳过该目录（不会抛错）。scanDir=${scanDirAbs}\n${
                formatPluginError(e)
              }`,
            );
          }
        }
        if (files.length === 0) {
          log.debug(
            `未发现可扫描的源码文件（目录为空或全部失败）。scanDirs=${
              scanDirs.join(",")
            }`,
          );
          return;
        }

        const usedNames = new Set<string>();
        let readFailCount = 0;
        for (const filePath of files) {
          try {
            const content = await readTextFile(filePath);
            for (const name of extractUsedNames(content)) {
              usedNames.add(name);
            }
          } catch {
            readFailCount++;
          }
        }
        if (readFailCount > 0) {
          log.debug(`解析导入时共有 ${readFailCount} 个文件读取失败（已忽略）`);
        }

        const names = Array.from(usedNames).sort();
        if (names.length === 0) {
          log.debug(
            `未发现从 @dreamer/ui-preact 解析出的已映射组件名，跳过生成（请确认业务代码使用 import { X } from "@dreamer/ui-preact/..." 且 X 在插件映射表中）`,
          );
          return;
        }

        /** 每次 onInit 清空，避免跨应用/版本误用缓存 */
        denoInfoHttpsToLocalCache.clear();

        const jsrVersion = await getUiPreactJsrVersionResolvedByApp(
          root,
          import.meta.url,
        );

        const pkgRoot = resolvePackageRoot();

        const paths = await gatherResolvedContentPaths(names, {
          projectRoot: root,
          optionPackageRoot: optionPackageRoot,
          resolvedPackageRoot: pkgRoot,
          jsrVersion,
        });
        if (paths.length === 0) {
          log.debug(
            "未解析到任何可扫描的 ui-preact 源文件路径，跳过写入（请检查 deno.json、deno cache、outputPath 与组件映射）",
          );
          return;
        }
        await mergeIntrinsicIconSources(names, pkgRoot, paths);
        /** 与 gatherResolvedContentPaths / mergeIntrinsicIconSources 内去重双保险，保证写入的 @source 路径唯一 */
        const uniqueSortedPaths = Array.from(new Set(paths)).sort();

        const outAbs = outputPath.startsWith("/")
          ? outputPath
          : join(root, outputPath);
        const sourcesCssDir = dirname(outAbs);

        const cssContent = uniqueSortedPaths
          .map((p) => `@source "${toAtSourceSpecifier(sourcesCssDir, p)}";`)
          .join("\n") + "\n";

        /** 与历史版本一致：写入前后各一条 debug（相对路径，避免绝对路径刷屏） */
        const outRel = relative(root, outAbs);
        log.debug(`准备写入 ${outRel}（${cssContent.length} 字节）`);
        await mkdir(sourcesCssDir, { recursive: true });
        await writeTextFile(outAbs, cssContent);
        log.debug(`已写入 ${outRel}`);
      } catch (e) {
        logInitFailure("onInit 失败", e, {
          cwd: root,
          scanDirs: normalizeTailwindScanPaths(scanPathOpt).join(","),
          outputPath,
          scanPath: JSON.stringify(scanPathOpt ?? "default:[src]"),
          packageRootOption: optionPackageRoot ?? "(未传)",
          importMetaUrl: import.meta.url,
        });
        throw e;
      }
    },
  };
}
