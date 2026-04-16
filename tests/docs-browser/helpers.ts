/**
 * @fileoverview docs 浏览器 E2E：独立 dev 子进程、`goto`、`getMainText`、`delay`。
 * 与 ui-view/tests/docs-browser/helpers.ts 同源；包根与进程环境变量改为 **ui-preact**。
 *
 * Monorepo 下 `ui-preact/deno.json` 将 `@dreamer/test` 指到 `../test/src/mod.ts` 以便联调
 * `test` 包改动；发布 `@dreamer/ui-preact` 到 JSR 前请改回 `jsr:@dreamer/test@^x.y.z`，并删去
 * 仅为解析本地 `test` 而并入的 `imports`（`@dreamer/i18n`、`playwright` 等）。
 */

import {
  connect,
  createCommand,
  dirname,
  execPath,
  existsSync,
  getEnv,
  getEnvAll,
  IS_DENO,
  join,
  platform,
} from "@dreamer/runtime-adapter";
import type { SpawnedProcess } from "@dreamer/runtime-adapter";

/** 绑定宿主 `fetch`，健康检查走 Deno/Bun 网络栈 */
const hostFetch = globalThis.fetch.bind(globalThis);

/** 与 `docs/src/config/main.dev.ts` 默认一致；实际端口在 `start()` 内探测 */
const PREFERRED_DOCS_PORT = 3000;

/**
 * docs dev 子进程从 spawn 到根路径 `GET /` 成功的最长等待（毫秒）。
 * 可调大：`UI_PREACT_DOCS_DEV_START_MS=180000`。
 */
function docsDevStartupDeadlineMs(): number {
  const raw = getEnv("UI_PREACT_DOCS_DEV_START_MS");
  if (raw != null && raw !== "") {
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 15_000) return n;
  }
  return 120_000;
}

/**
 * 按进程 PID 偏移首选端口，减轻并行 `deno test --jobs>1` 时抢同一端口的竞态。
 *
 * @returns 起始探测端口（落在 [3000, 3179] 一带）
 */
function preferredPortStart(): number {
  try {
    const pid = (globalThis as { Deno?: { pid?: number } }).Deno?.pid;
    if (typeof pid === "number" && Number.isFinite(pid)) {
      return PREFERRED_DOCS_PORT + Math.abs(pid % 180);
    }
  } catch {
    /* 非 Deno 环境 */
  }
  return PREFERRED_DOCS_PORT;
}

/**
 * 检测端口是否已有**活跃监听**（对端 accept 新连接）
 * @param host 主机
 * @param port 端口
 */
async function isPortInUse(host: string, port: number): Promise<boolean> {
  try {
    const conn = await connect({ host, port });
    conn.close();
    return true;
  } catch {
    return false;
  }
}

/**
 * 在本进程尝试 `listen` 该端口，判断子进程 docs dev 能否成功绑定。
 * @param host 与 docs `main.dev` 一致，一般为 `127.0.0.1`
 * @param port 待测端口
 */
function canBindPortLocally(host: string, port: number): boolean {
  const DenoRef = (globalThis as {
    Deno?: {
      listen: (
        o: { hostname: string; port: number },
      ) => { close: () => void };
    };
  })
    .Deno;
  if (DenoRef?.listen) {
    try {
      const listener = DenoRef.listen({ hostname: host, port });
      listener.close();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * 从起始端口起查找第一个本机可 bind 的端口（Deno 下与 docs 子进程行为一致）
 * @param host 主机
 * @param startPort 首选端口
 * @param maxAttempts 最大尝试次数
 */
async function findAvailablePort(
  host: string,
  startPort: number,
  maxAttempts = 50,
): Promise<number> {
  const DenoRef = (globalThis as { Deno?: { listen: unknown } }).Deno;
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (DenoRef?.listen) {
      if (canBindPortLocally(host, port)) return port;
      continue;
    }
    if (!(await isPortInUse(host, port))) return port;
  }
  throw new Error(
    `docs e2e: 从端口 ${startPort} 起尝试 ${maxAttempts} 次均无法 bind 或均被占用，无法启动 dev`,
  );
}

/** 规整绝对路径 */
function normalizeAbsolutePath(p: string): string {
  const isAbsolute = p.startsWith("/") || /^[A-Za-z]:[\\/]/.test(p);
  const parts = p.replace(/\\/g, "/").split("/").filter(Boolean);
  const out: string[] = [];
  for (const part of parts) {
    if (part === "..") out.pop();
    else if (part !== ".") out.push(part);
  }
  const joined = out.join("/");
  if (!isAbsolute) return joined;
  if (out[0] && /^[A-Za-z]:$/.test(out[0])) return joined;
  return "/" + joined;
}

const _helpersDir = dirname(
  typeof import.meta.url !== "undefined" && import.meta.url.startsWith("file:")
    ? new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")
    : join(".", "tests", "docs-browser", "helpers.ts"),
);

/** @dreamer/ui-preact 包根（`tests/docs-browser` 的上两级） */
const UI_PREACT_PKG_ROOT = normalizeAbsolutePath(join(_helpersDir, "..", ".."));

/** docs 应用根目录（`ui-preact/docs`） */
export const DOCS_ROOT = join(UI_PREACT_PKG_ROOT, "docs");

/**
 * 判断文档站是否具备启动 dweb dev 的最小文件（与 ui-view 侧栏 E2E 前置一致）。
 * 未同步 `src/routes` 时返回 false，避免 `beforeAll` 长时间挂起。
 *
 * @returns 存在 `docs/deno.json` 且存在 `docs/src/routes/_app.tsx` 时为 true
 */
export function isUiPreactDocsSiteRunnable(): boolean {
  const appTsx = join(DOCS_ROOT, "src", "routes", "_app.tsx");
  const denoJson = join(DOCS_ROOT, "deno.json");
  return existsSync(denoJson) && existsSync(appTsx);
}

/**
 * 浏览器子进程入口：与 `tests/browser-stub.js` 一致
 * @returns 绝对路径
 */
function entryPointForBrowser(): string {
  return join(UI_PREACT_PKG_ROOT, "tests", "browser-stub.js");
}

/**
 * 传给 `it(..., DOCS_BROWSER_CONFIG)` 的浏览器选项。
 * `timeout`：单用例上限（含 docs dev 冷启动 + Playwright；`interactions.test.ts` 已共享单 dev）。
 * `protocolTimeout`：与 `@dreamer/test` 内 `launch({ timeout })` 上限对齐。
 * 不传 `browserSource`：与 `@dreamer/test` 默认一致，**优先系统 Chrome**，避免部分环境下
 * Playwright `chrome-headless-shell` 已起进程但 CDP 长期连不上导致超时。
 */
export const DOCS_BROWSER_CONFIG = {
  sanitizeOps: false,
  sanitizeResources: false,
  timeout: 210_000,
  browser: {
    enabled: true,
    headless: true,
    entryPoint: entryPointForBrowser(),
    bodyContent: '<div id="root"></div>',
    browserMode: true,
    moduleLoadTimeout: 20_000,
    protocolTimeout: 180_000,
  },
};

/**
 * 单次测试套件环境：独立端口、独立 dev 子进程。
 */
export function createDocsBrowserTestEnv() {
  let docsDevPort = PREFERRED_DOCS_PORT;
  let BASE_URL = `http://127.0.0.1:${docsDevPort}`;
  let serverProcess: SpawnedProcess | null = null;

  /**
   * 对根路径发 GET，判断 dev 是否仍存活。
   * @param timeoutMs - fetch 超时（毫秒）
   * @returns 是否 HTTP 200
   */
  async function probeDocsDevOk(timeoutMs: number): Promise<boolean> {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await hostFetch(`${BASE_URL.replace(/\/$/, "")}/`, {
        signal: controller.signal,
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(tid);
    }
  }

  /**
   * 确认 dev 可访问；失败时结束子进程并重新 start。
   * @param timeoutMs - 单次探测超时毫秒
   */
  async function ensureDocsDevAlive(timeoutMs = 5000): Promise<void> {
    if (await probeDocsDevOk(timeoutMs)) return;

    await stopServerOnly();
    await new Promise((r) => setTimeout(r, 400));
    await start();

    if (await probeDocsDevOk(timeoutMs)) return;

    throw new Error(`docs dev 健康检查失败（已尝试重启）：${BASE_URL}`);
  }

  /**
   * 启动 docs dev：探测端口、spawn、`PORT` 与 `UI_PREACT_DOCS_BROWSER_E2E`、轮询就绪、settle
   */
  async function start(): Promise<void> {
    if (!isUiPreactDocsSiteRunnable()) {
      throw new Error(
        "[@dreamer/ui-preact tests] 文档站无法启动：缺少 docs/src/routes/_app.tsx（或 docs/deno.json）。请同步 ui-view/docs 的路由与页面后再跑浏览器 E2E。",
      );
    }

    docsDevPort = await findAvailablePort(
      "127.0.0.1",
      preferredPortStart(),
    );
    BASE_URL = `http://127.0.0.1:${docsDevPort}`;
    const cmd = createCommand(execPath(), {
      args: IS_DENO ? ["run", "-A", "src/main.ts"] : ["run", "dev"],
      cwd: DOCS_ROOT,
      env: {
        ...getEnvAll(),
        PORT: String(docsDevPort),
        UI_PREACT_DOCS_BROWSER_E2E: "1",
      },
      stdout: "inherit",
      stderr: "inherit",
    });
    serverProcess = cmd.spawn();

    const deadlineMs = docsDevStartupDeadlineMs();
    const deadline = Date.now() + deadlineMs;
    let ready = false;
    while (Date.now() < deadline) {
      try {
        const r = await hostFetch(BASE_URL + "/");
        if (r.ok) {
          ready = true;
          break;
        }
      } catch {
        // 服务尚未就绪
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    if (!ready) {
      throw new Error(
        `Docs dev server did not start within ${deadlineMs}ms (set UI_PREACT_DOCS_DEV_START_MS to override).`,
      );
    }
    const settleMs = platform() === "windows" ? 2000 : 4000;
    await new Promise((r) => setTimeout(r, settleMs));
  }

  /**
   * 仅结束 dev 子进程（SIGKILL + 等待 status），不清理浏览器；由外层 `describe` 统一 `cleanupAllBrowsers`。
   */
  async function stopServerOnly(): Promise<void> {
    if (!serverProcess) return;
    const child = serverProcess;
    serverProcess = null;
    try {
      child.kill(9);
    } catch {
      // ignore
    }
    const STATUS_WAIT_MS = 15_000;
    try {
      await Promise.race([
        child.status,
        new Promise<never>((_, rej) =>
          setTimeout(() => rej(new Error("timeout")), STATUS_WAIT_MS)
        ),
      ]);
    } catch {
      // ignore
    }
    try {
      child.unref?.();
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  /**
   * 导航到 docs 下路径（相对 `BASE_URL`）
   * @param t 测试上下文
   * @param path 以 `/` 开头的 path
   */
  async function goto(
    t: { browser?: { goto?: (url: string) => Promise<unknown> } },
    path: string,
  ): Promise<void> {
    if (!t?.browser?.goto) return;
    await ensureDocsDevAlive();
    const url = BASE_URL + (path.startsWith("/") ? path : "/" + path);
    await t.browser.goto(url);
    await new Promise((r) => setTimeout(r, 400));
  }

  /**
   * 读取 `main` 内文本
   * @param t 测试上下文
   */
  async function getMainText(
    t: { browser?: { evaluate: (fn: () => string) => Promise<unknown> } },
  ): Promise<string> {
    if (!t?.browser) return "";
    return (await t.browser.evaluate(() => {
      const main = document.querySelector("main");
      return main?.innerText ?? "";
    })) as string;
  }

  /** 固定暂停（毫秒） */
  function delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  return {
    start,
    stopServerOnly,
    ensureDocsDevAlive,
    goto,
    getMainText,
    delay,
  };
}
