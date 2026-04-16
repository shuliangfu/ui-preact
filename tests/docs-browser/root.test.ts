/**
 * @fileoverview docs 站点根路径 `/` 浏览器验收（独立 dev，与各路由探针文件一致）
 */

import {
  afterAll,
  beforeAll,
  cleanupAllBrowsers,
  describe,
  expect,
  it,
} from "@dreamer/test";
import { createDocsBrowserTestEnv, DOCS_BROWSER_CONFIG } from "./helpers.ts";

describe("docs 浏览器：根路径 /", () => {
  const env = createDocsBrowserTestEnv();
  beforeAll(() => env.start());
  afterAll(async () => {
    await env.stopServerOnly();
    await cleanupAllBrowsers();
  });

  it("/ 根路径可加载", async (t) => {
    if (!t?.browser?.goto) return;
    await env.goto(t, "/");
    await env.delay(200);
    const rootOk = (await t.browser!.evaluate(() => {
      const hasNav = document.querySelector('a[href="/desktop"]') != null;
      const bodyText = document.body?.innerText ?? "";
      const hasFooter = /@dreamer\/ui-preact|@dreamer|dweb|桌面版|移动版/.test(
        bodyText,
      );
      return hasNav || hasFooter || bodyText.length > 20;
    })) as boolean;
    expect(rootOk).toBe(true);
  }, DOCS_BROWSER_CONFIG);
});
