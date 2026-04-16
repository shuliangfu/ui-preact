/**
 * 应用配置：Preact hybrid，文档站仅引用本仓库 `ui-preact/src`。
 */
import type { AppConfig } from "@dreamer/dweb";

const config: AppConfig = {
  name: "ui-preact-docs",
  version: "1.0.0",
  language: "zh-CN",
  hotReload: true,

  router: {
    routesDir: "./src/routes",
  },

  render: {
    engine: "preact",
    mode: "hybrid",
  },

  build: {
    server: {
      useNativeCompile: false,
    },
  },

  logger: {
    level: "info",
    format: "text",
    output: {
      console: true,
      file: {
        path: "runtime/logs/app.log",
        rotate: true,
        strategy: "size",
        maxSize: 10 * 1024 * 1024,
        maxFiles: 5,
      },
    },
  },
};

export default config;
