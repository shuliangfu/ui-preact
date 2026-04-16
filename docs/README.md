# @dreamer/ui-preact 组件文档站

本目录为 **Preact**
文档站（`render.engine: "preact"`，`mode: "hybrid"`），示例与页面均从
**`../src`**（`@dreamer/ui-preact`）引用，**不依赖** `@dreamer/ui-view` 或
`@dreamer/view`。

## 依赖与 import map

`deno.json` 将 `@dreamer/ui-preact` 映射到 **`../src/mod.ts`** 及各子路径；在
**`docs/`** 下执行 `deno task check`、`deno task dev`、`deno task build`。

**说明**：`ui-preact` 包根未将 `docs` 纳入 workspace，以避免与文档站独立的
JSX/任务配置冲突；开发请以本目录为准。

## 本地运行

```bash
cd docs
deno task dev
```

默认 `http://127.0.0.1:3000`（见 `src/config/main.dev.ts`）。

## 构建

```bash
deno task build
deno task start
```

## 与组件源码联调

修改组件时，开发模式下会监视 `./src`（文档站）与 `../src`（组件库）。Tailwind
按需内容由 `src/main.ts` 注册的 `uiPreactTailwindPlugin` 生成
`src/assets/ui-preact-sources.css`，与 `src/assets/tailwind.css` 一并参与构建。
