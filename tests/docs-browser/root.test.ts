/**
 * @fileoverview docs 站点根路径 `/` 浏览器验收
 */

import { describe, expect, it } from "@dreamer/test";
import { DOCS_BROWSER_CONFIG, sharedEnv } from "./helpers.ts";

describe("docs 浏览器：根路径 /", () => {
  it("/ 根路径可加载", async (t) => {
    if (!t?.browser?.goto) return;
    await sharedEnv.goto(t, "/");
    await sharedEnv.delay(200);
    const rootOk = (await t.browser!.evaluate(() => {
      const hasNav = document.querySelector('a[href="/desktop"]') != null;
      const bodyText = document.body?.innerText ?? "";
      const hasFooter = /@dreamer|dweb|桌面版|移动版/.test(bodyText);
      return hasNav || hasFooter || bodyText.length > 20;
    })) as boolean;
    expect(rootOk).toBe(true);
  }, DOCS_BROWSER_CONFIG);

  it("cleanup", async () => {
    await sharedEnv.cleanup();
  }, {
    sanitizeOps: false,
    sanitizeResources: false,
  });
});
