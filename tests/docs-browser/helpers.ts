/**
 * @fileoverview docs 浏览器 E2E：全局单例 dev server + 浏览器 context。
 * 所有测试共用一个 dev server，省去重复启停开销。
 *
 * 用法：`import { sharedEnv, DOCS_BROWSER_CONFIG } from "./helpers.ts"`
 * 测试文件不需要自己启停 server，直接用 `sharedEnv.goto / getMainText / delay`。
 */

import {
  connect,
  createCommand,
  dirname,
  execPath,
  getEnv,
  getEnvAll,
  IS_DENO,
  join,
  platform,
} from "@dreamer/runtime-adapter";
import type { SpawnedProcess } from "@dreamer/runtime-adapter";
import { cleanupAllBrowsers } from "@dreamer/test";

/** 绑定宿主 `fetch`，健康检查走 Deno/Bun 网络栈 */
const hostFetch = globalThis.fetch.bind(globalThis);

/** 与 `docs/src/config/main.dev.ts` 默认一致；实际端口在 `start()` 内探测 */
const PREFERRED_DOCS_PORT = 3000;

/**
 * docs dev 子进程从 spawn 到根路径 `GET /` 成功的最长等待（毫秒）。
 * CI 或本机可调大：`UI_PREACT_DOCS_DEV_START_MS=180000`。
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
 * 按进程 PID 偏移首选端口，减轻多 worker / 并行 `deno test --jobs>1` 时同时抢 3000 的竞态。
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
 * 在**本进程**尝试 `listen` 该端口，判断子进程 docs dev 能否成功绑定。
 *
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
 * 从起始端口起查找第一个**本机可 bind** 的端口
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

/** ui-preact 包根（`tests/docs-browser` 的上两级） */
const UI_PREACT_PKG_ROOT = normalizeAbsolutePath(join(_helpersDir, "..", ".."));
/** docs 应用根目录 */
export const DOCS_ROOT = join(UI_PREACT_PKG_ROOT, "docs");

/**
 * 浏览器子进程入口：与 `tests/browser-stub.js` 一致
 */
function entryPointForBrowser(): string {
  return join(UI_PREACT_PKG_ROOT, "tests", "browser-stub.js");
}

/**
 * 传给 `it(..., DOCS_BROWSER_CONFIG)` 的浏览器选项
 */
export const DOCS_BROWSER_CONFIG = {
  sanitizeOps: false,
  sanitizeResources: false,
  timeout: 60_000,
  browser: {
    enabled: true,
    headless: true,
    browserSource: "test" as const,
    entryPoint: entryPointForBrowser(),
    bodyContent: '<div id="root"></div>',
    browserMode: true,
    moduleLoadTimeout: 20_000,
  },
};

// ─── 全局单例 dev server ─────────────────────────────────────────────

let _singletonPort = PREFERRED_DOCS_PORT;
let _singletonBaseUrl = `http://127.0.0.1:${_singletonPort}`;
let _singletonProcess: SpawnedProcess | null = null;
let _singletonStarted = false;
let _singletonStartPromise: Promise<void> | null = null;

async function _probeDocsDevOk(timeoutMs: number): Promise<boolean> {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await hostFetch(`${_singletonBaseUrl.replace(/\/$/, "")}/`, {
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(tid);
  }
}

async function _startServer(): Promise<void> {
  if (_singletonStarted) {
    if (await _probeDocsDevOk(5000)) return;
    await _killServer();
  }

  _singletonPort = await findAvailablePort("127.0.0.1", preferredPortStart());
  _singletonBaseUrl = `http://127.0.0.1:${_singletonPort}`;
  const cmd = createCommand(execPath(), {
    args: IS_DENO ? ["run", "-A", "src/main.ts"] : ["run", "dev"],
    cwd: DOCS_ROOT,
    env: {
      ...getEnvAll(),
      PORT: String(_singletonPort),
      UI_PREACT_DOCS_BROWSER_E2E: "1",
    },
    stdout: "inherit",
    stderr: "inherit",
  });
  _singletonProcess = cmd.spawn();

  const deadlineMs = docsDevStartupDeadlineMs();
  const deadline = Date.now() + deadlineMs;
  let ready = false;
  while (Date.now() < deadline) {
    try {
      const r = await hostFetch(_singletonBaseUrl + "/");
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
  _singletonStarted = true;
}

async function _killServer(): Promise<void> {
  if (!_singletonProcess) return;
  const child = _singletonProcess;
  _singletonProcess = null;
  try {
    child.kill(9);
  } catch {
    // ignore
  }
  try {
    await Promise.race([
      child.status,
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error("timeout")), 15_000)
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
  _singletonStarted = false;
}

/**
 * 确保 dev server 存活；失败时自动重启。
 */
async function _ensureAlive(timeoutMs = 5000): Promise<void> {
  if (await _probeDocsDevOk(timeoutMs)) return;
  await _killServer();
  await new Promise((r) => setTimeout(r, 400));
  await _startServer();
  if (await _probeDocsDevOk(timeoutMs)) return;
  throw new Error(`docs dev 健康检查失败（已尝试重启）：${_singletonBaseUrl}`);
}

/**
 * 全局单例 docs browser 测试环境。
 * 整个测试进程只启动一次 dev server，所有测试文件共享。
 *
 * 用法：
 * ```ts
 * import { sharedEnv, DOCS_BROWSER_CONFIG } from "./helpers.ts";
 *
 * describe("xxx", () => {
 *   it("test", async (t) => {
 *     await sharedEnv.goto(t, "/desktop/form/input");
 *     const text = await sharedEnv.getMainText(t);
 *     expect(text).toMatch(/Input/);
 *   }, DOCS_BROWSER_CONFIG);
 * });
 * ```
 *
 * 首次调用 `goto` 时自动启动 dev server；
 * `cleanup()` 在整个测试进程结束时调用一次。
 *
 * **线程安全**：并发 `start()` 只会启动一次（Promise 去重）。
 */
export const sharedEnv = {
  /**
   * 启动 dev server（幂等，已启动则跳过）。
   * 通常不需要手动调用——`goto` 内部会自动 `start`。
   */
  async start(): Promise<void> {
    if (_singletonStartPromise) return _singletonStartPromise;
    _singletonStartPromise = _startServer();
    try {
      await _singletonStartPromise;
    } catch (e) {
      _singletonStartPromise = null;
      throw e;
    }
  },

  /** 当前 dev server 的 BASE_URL */
  get baseUrl(): string {
    return _singletonBaseUrl;
  },

  /**
   * 导航到 docs 路径。首次调用自动启动 dev server。
   */
  async goto(
    t: { browser?: { goto?: (url: string) => Promise<unknown> } },
    path: string,
  ): Promise<void> {
    if (!t?.browser?.goto) return;
    await this.start();
    await _ensureAlive();
    const url = _singletonBaseUrl + (path.startsWith("/") ? path : "/" + path);
    await t.browser.goto(url);
    await new Promise((r) => setTimeout(r, 400));
  },

  /**
   * 读取 `main` 内文本
   */
  async getMainText(
    t: { browser?: { evaluate: (fn: () => string) => Promise<unknown> } },
  ): Promise<string> {
    if (!t?.browser) return "";
    return (await t.browser.evaluate(() => {
      const main = document.querySelector("main");
      return main?.innerText ?? "";
    })) as string;
  },

  /**
   * 等待 `main` 内正文长度达到阈值（替代固定 sleep），与 ui-view `waitDocMainReady` 行为对齐。
   *
   * @param options.minChars 最小字符数，默认 52
   * @param options.timeoutMs 轮询超时（毫秒），默认 18000
   */
  async waitDocMainReady(
    t: { browser?: { evaluate: (fn: () => unknown) => Promise<unknown> } },
    options?: { minChars?: number; timeoutMs?: number },
  ): Promise<void> {
    if (!t?.browser?.evaluate) return;
    const minChars = options?.minChars ?? 52;
    const timeoutMs = options?.timeoutMs ?? 18_000;
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const len = (await t.browser.evaluate(() => {
        const main = document.querySelector("main");
        return main?.innerText?.length ?? 0;
      })) as number;
      if (len >= minChars) return;
      await this.delay(40);
    }
  },

  /** 固定暂停（毫秒） */
  delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  },

  /** 确保 dev 存活（可手动调用做健康检查） */
  async ensureAlive(timeoutMs = 5000): Promise<void> {
    await this.start();
    await _ensureAlive(timeoutMs);
  },

  /**
   * 清理：关停 dev server + 清理浏览器。
   * 在最外层 describe 的 afterAll 调用一次即可。
   */
  async cleanup(): Promise<void> {
    await _killServer();
    await cleanupAllBrowsers();
    _singletonStartPromise = null;
  },
};

/** 类型导出，供测试文件做 ReturnType */
export type SharedDocsEnv = typeof sharedEnv;
