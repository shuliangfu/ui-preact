/**
 * 服务端入口：@dreamer/dweb + Preact；**仅**扫描/展示本包 `@dreamer/ui-preact`，不依赖 ui-view。
 */

import { App } from "@dreamer/dweb";
import { staticPlugin } from "@dreamer/plugins/static";
import { themePlugin } from "@dreamer/plugins/theme";
import { tailwindPlugin } from "@dreamer/plugins/tailwindcss";
import { uiPreactTailwindPlugin } from "@dreamer/ui-preact/plugin";

const app = new App();

/** 收集对 `@dreamer/ui-preact` 的引用，生成 Tailwind `@source` 片段 */
app.registerPlugin(uiPreactTailwindPlugin({
  outputPath: "src/assets/ui-preact-sources.css",
  scanPath: "src",
}));

app.registerPlugin(tailwindPlugin({
  output: "dist/client/assets",
  cssEntry: "src/assets/tailwind.css",
  assetsPath: "/assets",
}));

/** cookieName 与 ThemeToggle 中 storageKey 策略一致 */
app.registerPlugin(themePlugin({
  defaultMode: "light",
  strategy: "class",
  darkClass: "dark",
  cookieName: "ui-preact-docs-theme",
  injectScript: true,
}));

app.registerPlugin(staticPlugin({
  statics: [
    { root: "src/assets", prefix: "/assets" },
    { root: "dist/client/assets", prefix: "/assets" },
  ],
}));

void app.start();
