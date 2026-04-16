/**
 * @fileoverview Button 文档页：按「variant / size / disabled / loading / type / ButtonGroup」等示例区块做分步交互，
 * 与 `interactions.test.ts` 中单条「点 button」互补，满足「可交互组件全交互」策略的第一批落地。
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

const BUTTON_PATH = "/desktop/basic/button";

/**
 * 在 `main` 内查找 `type=button` 且 `textContent` 去空格等于 `text` 的按钮并点击（先出现的优先）
 */
async function clickButtonInMainByExactLabel(
  t: { browser?: { evaluate: (fn: () => unknown) => Promise<unknown> } },
  text: string,
): Promise<boolean> {
  if (!t?.browser) return false;
  const escaped = JSON.stringify(text);
  return (await t.browser.evaluate(
    new Function(
      `var text=${escaped};var main=document.querySelector('main');if(!main)return false;var bs=main.querySelectorAll('button[type="button"]');for(var i=0;i<bs.length;i++){var b=bs[i];if(b.textContent&&b.textContent.trim()===text){b.click();return true;}}return false;`,
    ) as () => boolean,
  )) as boolean;
}

describe("Button 文档：按示例区块全交互（每块独立 dev）", () => {
  afterAll(async () => {
    await cleanupAllBrowsers();
  });

  describe("variant：依次点击 default、primary、ghost", () => {
    const env = createDocsBrowserTestEnv();
    beforeAll(() => env.start());
    afterAll(() => env.stopServerOnly());
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, BUTTON_PATH);
      await env.delay(450);
      for (const label of ["default", "primary", "ghost"]) {
        const ok = await clickButtonInMainByExactLabel(t, label);
        expect(ok).toBe(true);
        await env.delay(80);
      }
    }, DOCS_BROWSER_CONFIG);
  });

  describe("size：点击 xs 尺寸示例按钮", () => {
    const env = createDocsBrowserTestEnv();
    beforeAll(() => env.start());
    afterAll(() => env.stopServerOnly());
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, BUTTON_PATH);
      await env.delay(450);
      expect(await clickButtonInMainByExactLabel(t, "xs")).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("disabled：存在带 disabled 的变体按钮", () => {
    const env = createDocsBrowserTestEnv();
    beforeAll(() => env.start());
    afterAll(() => env.stopServerOnly());
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, BUTTON_PATH);
      await env.delay(450);
      const n = (await t.browser!.evaluate(() => {
        const main = document.querySelector("main");
        return main?.querySelectorAll('button[type="button"][disabled]')
          .length ??
          0;
      })) as number;
      expect(n).toBeGreaterThanOrEqual(4);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("loading：存在加载中文案按钮", () => {
    const env = createDocsBrowserTestEnv();
    beforeAll(() => env.start());
    afterAll(() => env.stopServerOnly());
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, BUTTON_PATH);
      await env.delay(450);
      const ok = await clickButtonInMainByExactLabel(t, "加载中");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("type：点击原生 type 示例中的 button 标签按钮", () => {
    const env = createDocsBrowserTestEnv();
    beforeAll(() => env.start());
    afterAll(() => env.stopServerOnly());
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, BUTTON_PATH);
      await env.delay(450);
      expect(await clickButtonInMainByExactLabel(t, "button")).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("ButtonGroup 紧凑：点击「刷新」", () => {
    const env = createDocsBrowserTestEnv();
    beforeAll(() => env.start());
    afterAll(() => env.stopServerOnly());
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, BUTTON_PATH);
      await env.delay(450);
      expect(await clickButtonInMainByExactLabel(t, "刷新")).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("ButtonGroup 间距：attached=false 区「刷新」可点", () => {
    const env = createDocsBrowserTestEnv();
    beforeAll(() => env.start());
    afterAll(() => env.stopServerOnly());
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, BUTTON_PATH);
      await env.delay(450);
      /** 页面上有两个「刷新」，取最后一次出现（attached=false 区块在文档下方） */
      const clicked = (await t.browser!.evaluate(() => {
        const main = document.querySelector("main");
        if (!main) return false;
        const bs = main.querySelectorAll('button[type="button"]');
        let last: HTMLButtonElement | null = null;
        for (let i = 0; i < bs.length; i++) {
          const b = bs[i] as HTMLButtonElement;
          if (b.textContent?.trim() === "刷新") last = b;
        }
        if (last) {
          last.click();
          return true;
        }
        return false;
      })) as boolean;
      expect(clicked).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });
});
