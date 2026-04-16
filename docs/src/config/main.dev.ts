import { getEnv } from "@dreamer/runtime-adapter";

/**
 * 开发环境增量配置。`UI_PREACT_DOCS_BROWSER_E2E=1` 时可关闭 HMR/watch。
 */
const docsBrowserE2e = getEnv("UI_PREACT_DOCS_BROWSER_E2E") === "1";

const portRaw = getEnv("PORT")?.trim();
const serverPort =
  portRaw !== undefined && /^\d+$/.test(portRaw) && Number(portRaw) > 0
    ? Number(portRaw)
    : 3000;

export default {
  server: {
    host: "127.0.0.1",
    port: serverPort,
    dev: docsBrowserE2e
      ? {
        hmr: { enabled: false },
        watch: { paths: [] },
      }
      : {
        hmr: { enabled: true, path: "/__hmr" },
        watch: {
          /** 文档源码 + 本包组件源码（上一级 `ui-preact/src`） */
          paths: ["./src", "../src"],
          ignore: [
            "node_modules",
            ".git",
            "dist",
            "ui-preact-sources.css",
          ],
        },
      },
  },
  logger: {
    level: docsBrowserE2e ? "error" : "debug",
    format: "text",
  },
  hotReload: !docsBrowserE2e,
};
