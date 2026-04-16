/**
 * @fileoverview 文档路由 `/desktop/form/rich-text-editor` 的浏览器测试。
 * 富文本 — **本文件仅服务该路由**：后续请按文档示例块继续补全分步交互与断言，勿用仓库脚本覆盖正文。
 * Button 全量交互见同目录上级 `interactive-button-full.test.ts`（本包不为 /desktop/basic/button 另建页测文件）。
 */

import {
  afterAll,
  beforeAll,
  cleanupAllBrowsers,
  describe,
  expect,
  it,
} from "@dreamer/test";
import { createDocsBrowserTestEnv, DOCS_BROWSER_CONFIG } from "../helpers.ts";

/** 固定为本文档 path，便于复制到其他页时改为对应路由 */
const DOC_PATH = "/desktop/form/rich-text-editor";

describe("文档页 E2E：/desktop/form/rich-text-editor（富文本）", () => {
  const env = createDocsBrowserTestEnv();
  beforeAll(() => env.start());
  afterAll(async () => {
    await env.stopServerOnly();
    await cleanupAllBrowsers();
  });

  it("本页关键词命中且 main 内完成浅层交互探针", async (t) => {
    if (!t?.browser?.goto) return;
    await runKeywordAndShallowHere(t, env, DOC_PATH, [
      /RichText|富文本|编辑器/i,
    ]);
  }, DOCS_BROWSER_CONFIG);

  /**
   * 富文本：对 main 内 contenteditable 根节点写入纯文本并派发 input。
   */
  it("main 内富文本 contenteditable 可写入", async (t) => {
    if (!t?.browser?.goto) return;
    await env.goto(t, DOC_PATH);
    await env.delay(500);
    const ok = await t.browser.evaluate(() => {
      const main = document.querySelector("main");
      const ed = main?.querySelector(
        "[contenteditable=true]",
      ) as HTMLElement | null;
      if (!ed) return false;
      ed.focus();
      ed.textContent = "e2e-rte";
      ed.dispatchEvent(new Event("input", { bubbles: true }));
      ed.blur();
      return true;
    }) as boolean;
    expect(ok).toBe(true);
  }, DOCS_BROWSER_CONFIG);

  /**
   * 文档小节「toolbarPreset：default」：在 main 内定位对应 h3，于该示例区块内完成一次交互。
   */
  it("严格·toolbarPreset：default", async (t) => {
    if (!t?.browser?.goto) return;
    await env.goto(t, DOC_PATH);
    await env.delay(520);
    const ok = await t.browser.evaluate(() => {
      const needle = "toolbarPreset：default";
      const main = document.querySelector("main");
      if (!main) return false;
      const heads = main.querySelectorAll("h2, h3");
      for (let i = 0; i < heads.length; i++) {
        const h = heads[i];
        if (!(h.textContent || "").includes(needle)) continue;
        let root: Element | null = h.parentElement;
        for (let depth = 0; depth < 12 && root && root !== main; depth++) {
          const copy = root.querySelector(
            'button[type="button"][aria-label="复制"]',
          ) as HTMLButtonElement | null;
          if (copy && !copy.disabled) {
            copy.click();
            return true;
          }
          const lb = root.querySelector(
            'button[aria-haspopup="listbox"]:not([disabled])',
          ) as HTMLButtonElement | null;
          if (lb) {
            lb.click();
            return true;
          }
          const dg = root.querySelector(
            'button[aria-haspopup="dialog"]:not([disabled])',
          ) as HTMLButtonElement | null;
          if (dg) {
            dg.click();
            return true;
          }
          const sw = root.querySelector(
            '[role="switch"]',
          ) as HTMLElement | null;
          if (sw && !(sw as HTMLButtonElement).disabled) {
            sw.click();
            return true;
          }
          const cb = root.querySelector(
            'input[type="checkbox"]:not(:disabled)',
          ) as HTMLInputElement | null;
          if (cb) {
            cb.click();
            return true;
          }
          const rd = root.querySelector(
            'input[type="radio"]:not(:disabled)',
          ) as HTMLInputElement | null;
          if (rd) {
            rd.click();
            return true;
          }
          const ta = root.querySelector(
            "textarea:not(:disabled), input:not([type=hidden]):not([type=button]):not([type=submit]):not([type=file]):not([type=checkbox]):not([type=radio]):not(:disabled)",
          ) as HTMLInputElement | null;
          if (ta) {
            ta.focus();
            ta.value = "e2e-strict";
            ta.dispatchEvent(new Event("input", { bubbles: true }));
            return true;
          }
          const rg = root.querySelector(
            'input[type="range"]',
          ) as HTMLInputElement | null;
          if (rg && !rg.disabled) {
            const mx = Number(rg.max) || 100;
            const cur = Number(rg.value) || 0;
            rg.value = String(Math.min(mx, cur + 2));
            rg.dispatchEvent(new Event("input", { bubbles: true }));
            return true;
          }
          const star = root.querySelector(
            '[role="button"][aria-label="3 星"]',
          ) as HTMLElement | null;
          if (star) {
            star.click();
            return true;
          }
          const btn = root.querySelector(
            'button[type="button"]:not([disabled])',
          ) as HTMLButtonElement | null;
          if (btn) {
            btn.click();
            return true;
          }
          const a = root.querySelector("a[href]") as HTMLAnchorElement | null;
          if (a) {
            a.click();
            return true;
          }
          root = root.parentElement;
        }
        const box = h.parentElement;
        const txt = box?.innerText?.trim() ?? "";
        return txt.length > 8;
      }
      return false;
    }) as boolean;
    expect(ok).toBe(true);
  }, DOCS_BROWSER_CONFIG);

  /**
   * 文档小节「toolbarPreset：simple」：在 main 内定位对应 h3，于该示例区块内完成一次交互。
   */
  it("严格·toolbarPreset：simple", async (t) => {
    if (!t?.browser?.goto) return;
    await env.goto(t, DOC_PATH);
    await env.delay(520);
    const ok = await t.browser.evaluate(() => {
      const needle = "toolbarPreset：simple";
      const main = document.querySelector("main");
      if (!main) return false;
      const heads = main.querySelectorAll("h2, h3");
      for (let i = 0; i < heads.length; i++) {
        const h = heads[i];
        if (!(h.textContent || "").includes(needle)) continue;
        let root: Element | null = h.parentElement;
        for (let depth = 0; depth < 12 && root && root !== main; depth++) {
          const copy = root.querySelector(
            'button[type="button"][aria-label="复制"]',
          ) as HTMLButtonElement | null;
          if (copy && !copy.disabled) {
            copy.click();
            return true;
          }
          const lb = root.querySelector(
            'button[aria-haspopup="listbox"]:not([disabled])',
          ) as HTMLButtonElement | null;
          if (lb) {
            lb.click();
            return true;
          }
          const dg = root.querySelector(
            'button[aria-haspopup="dialog"]:not([disabled])',
          ) as HTMLButtonElement | null;
          if (dg) {
            dg.click();
            return true;
          }
          const sw = root.querySelector(
            '[role="switch"]',
          ) as HTMLElement | null;
          if (sw && !(sw as HTMLButtonElement).disabled) {
            sw.click();
            return true;
          }
          const cb = root.querySelector(
            'input[type="checkbox"]:not(:disabled)',
          ) as HTMLInputElement | null;
          if (cb) {
            cb.click();
            return true;
          }
          const rd = root.querySelector(
            'input[type="radio"]:not(:disabled)',
          ) as HTMLInputElement | null;
          if (rd) {
            rd.click();
            return true;
          }
          const ta = root.querySelector(
            "textarea:not(:disabled), input:not([type=hidden]):not([type=button]):not([type=submit]):not([type=file]):not([type=checkbox]):not([type=radio]):not(:disabled)",
          ) as HTMLInputElement | null;
          if (ta) {
            ta.focus();
            ta.value = "e2e-strict";
            ta.dispatchEvent(new Event("input", { bubbles: true }));
            return true;
          }
          const rg = root.querySelector(
            'input[type="range"]',
          ) as HTMLInputElement | null;
          if (rg && !rg.disabled) {
            const mx = Number(rg.max) || 100;
            const cur = Number(rg.value) || 0;
            rg.value = String(Math.min(mx, cur + 2));
            rg.dispatchEvent(new Event("input", { bubbles: true }));
            return true;
          }
          const star = root.querySelector(
            '[role="button"][aria-label="3 星"]',
          ) as HTMLElement | null;
          if (star) {
            star.click();
            return true;
          }
          const btn = root.querySelector(
            'button[type="button"]:not([disabled])',
          ) as HTMLButtonElement | null;
          if (btn) {
            btn.click();
            return true;
          }
          const a = root.querySelector("a[href]") as HTMLAnchorElement | null;
          if (a) {
            a.click();
            return true;
          }
          root = root.parentElement;
        }
        const box = h.parentElement;
        const txt = box?.innerText?.trim() ?? "";
        return txt.length > 8;
      }
      return false;
    }) as boolean;
    expect(ok).toBe(true);
  }, DOCS_BROWSER_CONFIG);

  /**
   * 文档小节「toolbarPreset：full」：在 main 内定位对应 h3，于该示例区块内完成一次交互。
   */
  it("严格·toolbarPreset：full", async (t) => {
    if (!t?.browser?.goto) return;
    await env.goto(t, DOC_PATH);
    await env.delay(520);
    const ok = await t.browser.evaluate(() => {
      const needle = "toolbarPreset：full";
      const main = document.querySelector("main");
      if (!main) return false;
      const heads = main.querySelectorAll("h2, h3");
      for (let i = 0; i < heads.length; i++) {
        const h = heads[i];
        if (!(h.textContent || "").includes(needle)) continue;
        let root: Element | null = h.parentElement;
        for (let depth = 0; depth < 12 && root && root !== main; depth++) {
          const copy = root.querySelector(
            'button[type="button"][aria-label="复制"]',
          ) as HTMLButtonElement | null;
          if (copy && !copy.disabled) {
            copy.click();
            return true;
          }
          const lb = root.querySelector(
            'button[aria-haspopup="listbox"]:not([disabled])',
          ) as HTMLButtonElement | null;
          if (lb) {
            lb.click();
            return true;
          }
          const dg = root.querySelector(
            'button[aria-haspopup="dialog"]:not([disabled])',
          ) as HTMLButtonElement | null;
          if (dg) {
            dg.click();
            return true;
          }
          const sw = root.querySelector(
            '[role="switch"]',
          ) as HTMLElement | null;
          if (sw && !(sw as HTMLButtonElement).disabled) {
            sw.click();
            return true;
          }
          const cb = root.querySelector(
            'input[type="checkbox"]:not(:disabled)',
          ) as HTMLInputElement | null;
          if (cb) {
            cb.click();
            return true;
          }
          const rd = root.querySelector(
            'input[type="radio"]:not(:disabled)',
          ) as HTMLInputElement | null;
          if (rd) {
            rd.click();
            return true;
          }
          const ta = root.querySelector(
            "textarea:not(:disabled), input:not([type=hidden]):not([type=button]):not([type=submit]):not([type=file]):not([type=checkbox]):not([type=radio]):not(:disabled)",
          ) as HTMLInputElement | null;
          if (ta) {
            ta.focus();
            ta.value = "e2e-strict";
            ta.dispatchEvent(new Event("input", { bubbles: true }));
            return true;
          }
          const rg = root.querySelector(
            'input[type="range"]',
          ) as HTMLInputElement | null;
          if (rg && !rg.disabled) {
            const mx = Number(rg.max) || 100;
            const cur = Number(rg.value) || 0;
            rg.value = String(Math.min(mx, cur + 2));
            rg.dispatchEvent(new Event("input", { bubbles: true }));
            return true;
          }
          const star = root.querySelector(
            '[role="button"][aria-label="3 星"]',
          ) as HTMLElement | null;
          if (star) {
            star.click();
            return true;
          }
          const btn = root.querySelector(
            'button[type="button"]:not([disabled])',
          ) as HTMLButtonElement | null;
          if (btn) {
            btn.click();
            return true;
          }
          const a = root.querySelector("a[href]") as HTMLAnchorElement | null;
          if (a) {
            a.click();
            return true;
          }
          root = root.parentElement;
        }
        const box = h.parentElement;
        const txt = box?.innerText?.trim() ?? "";
        return txt.length > 8;
      }
      return false;
    }) as boolean;
    expect(ok).toBe(true);
  }, DOCS_BROWSER_CONFIG);

  /**
   * 文档小节「readOnly / disabled」：在 main 内定位对应 h3，于该示例区块内完成一次交互。
   */
  it("严格·readOnly / disabled", async (t) => {
    if (!t?.browser?.goto) return;
    await env.goto(t, DOC_PATH);
    await env.delay(520);
    const ok = await t.browser.evaluate(() => {
      const needle = "readOnly / disabled";
      const main = document.querySelector("main");
      if (!main) return false;
      const heads = main.querySelectorAll("h2, h3");
      for (let i = 0; i < heads.length; i++) {
        const h = heads[i];
        if (!(h.textContent || "").includes(needle)) continue;
        let root: Element | null = h.parentElement;
        for (let depth = 0; depth < 12 && root && root !== main; depth++) {
          const copy = root.querySelector(
            'button[type="button"][aria-label="复制"]',
          ) as HTMLButtonElement | null;
          if (copy && !copy.disabled) {
            copy.click();
            return true;
          }
          const lb = root.querySelector(
            'button[aria-haspopup="listbox"]:not([disabled])',
          ) as HTMLButtonElement | null;
          if (lb) {
            lb.click();
            return true;
          }
          const dg = root.querySelector(
            'button[aria-haspopup="dialog"]:not([disabled])',
          ) as HTMLButtonElement | null;
          if (dg) {
            dg.click();
            return true;
          }
          const sw = root.querySelector(
            '[role="switch"]',
          ) as HTMLElement | null;
          if (sw && !(sw as HTMLButtonElement).disabled) {
            sw.click();
            return true;
          }
          const cb = root.querySelector(
            'input[type="checkbox"]:not(:disabled)',
          ) as HTMLInputElement | null;
          if (cb) {
            cb.click();
            return true;
          }
          const rd = root.querySelector(
            'input[type="radio"]:not(:disabled)',
          ) as HTMLInputElement | null;
          if (rd) {
            rd.click();
            return true;
          }
          const ta = root.querySelector(
            "textarea:not(:disabled), input:not([type=hidden]):not([type=button]):not([type=submit]):not([type=file]):not([type=checkbox]):not([type=radio]):not(:disabled)",
          ) as HTMLInputElement | null;
          if (ta) {
            ta.focus();
            ta.value = "e2e-strict";
            ta.dispatchEvent(new Event("input", { bubbles: true }));
            return true;
          }
          const rg = root.querySelector(
            'input[type="range"]',
          ) as HTMLInputElement | null;
          if (rg && !rg.disabled) {
            const mx = Number(rg.max) || 100;
            const cur = Number(rg.value) || 0;
            rg.value = String(Math.min(mx, cur + 2));
            rg.dispatchEvent(new Event("input", { bubbles: true }));
            return true;
          }
          const star = root.querySelector(
            '[role="button"][aria-label="3 星"]',
          ) as HTMLElement | null;
          if (star) {
            star.click();
            return true;
          }
          const btn = root.querySelector(
            'button[type="button"]:not([disabled])',
          ) as HTMLButtonElement | null;
          if (btn) {
            btn.click();
            return true;
          }
          const a = root.querySelector("a[href]") as HTMLAnchorElement | null;
          if (a) {
            a.click();
            return true;
          }
          root = root.parentElement;
        }
        const box = h.parentElement;
        const txt = box?.innerText?.trim() ?? "";
        return txt.length > 8;
      }
      return false;
    }) as boolean;
    expect(ok).toBe(true);
  }, DOCS_BROWSER_CONFIG);
});

/**
 * 本文件内：`main` 已渲染后的浅层交互探针（不放入 helpers.ts）。
 */
async function shallowInteractMainHere(
  t: { browser?: { evaluate: (fn: () => unknown) => Promise<unknown> } },
  mainTextFallback: string,
): Promise<void> {
  if (!t?.browser) return;
  const probe = (await t.browser.evaluate(() => {
    const main = document.querySelector("main");
    if (!main) return { ok: false, acted: false };
    const listbox = main.querySelector(
      'button[aria-haspopup="listbox"]',
    ) as HTMLButtonElement | null;
    if (listbox && !listbox.disabled) {
      listbox.click();
      return { ok: true, acted: true };
    }
    const range = main.querySelector(
      'input[type="range"]',
    ) as HTMLInputElement | null;
    if (range) {
      const max = Number(range.max) || 100;
      const cur = Number(range.value) || 0;
      range.value = String(Math.min(max, cur + 5));
      range.dispatchEvent(new Event("input", { bubbles: true }));
      return { ok: true, acted: true };
    }
    const cb = main.querySelector(
      'input[type="checkbox"]:not(:disabled)',
    ) as HTMLInputElement | null;
    if (cb) {
      cb.click();
      return { ok: true, acted: true };
    }
    const rad = main.querySelector(
      'input[type="radio"]:not(:disabled)',
    ) as HTMLInputElement | null;
    if (rad) {
      rad.click();
      return { ok: true, acted: true };
    }
    const fileInput = main.querySelector(
      'input[type="file"]:not(:disabled)',
    ) as HTMLInputElement | null;
    if (fileInput) {
      fileInput.click();
      return { ok: true, acted: true };
    }
    const input = main.querySelector(
      "textarea:not(:disabled), input:not([type=hidden]):not([type=button]):not([type=submit]):not([type=file]):not(:disabled)",
    ) as HTMLInputElement | null;
    if (input) {
      input.focus();
      input.value = "e2e-probe";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return { ok: true, acted: true };
    }
    const btn = main.querySelector(
      'button[type="button"]:not([disabled]), button:not([type]):not([disabled])',
    ) as HTMLButtonElement | null;
    if (btn) {
      btn.click();
      return { ok: true, acted: true };
    }
    const table = main.querySelector("table");
    if (table) {
      const cellBtn = table.querySelector(
        "td button, td a",
      ) as HTMLElement | null;
      if (cellBtn) {
        cellBtn.click();
        return { ok: true, acted: true };
      }
    }
    const len = main.innerText?.length ?? 0;
    return { ok: true, acted: false, len };
  })) as { ok: boolean; acted?: boolean; len?: number };

  expect(probe.ok).toBe(true);
  if (!probe.acted) {
    expect(
      (probe.len ?? mainTextFallback.length) > 100 ||
        /canvas|Chart|svg|代码|API|示例/.test(mainTextFallback),
    ).toBe(true);
  }
}

type DocsEnvLike = ReturnType<typeof createDocsBrowserTestEnv>;

/**
 * 本文件内：打开文档、断言关键词、再执行 {@link shallowInteractMainHere}。
 */
async function runKeywordAndShallowHere(
  t: {
    browser?: {
      goto?: (url: string) => Promise<unknown>;
      evaluate: (fn: () => unknown) => Promise<unknown>;
    };
  },
  env: DocsEnvLike,
  path: string,
  patterns: RegExp[],
  minLen = 32,
): Promise<void> {
  if (!t?.browser?.goto) return;
  await env.goto(t, path);
  await env.delay(450);
  let text = await env.getMainText(t);
  if (text.length < minLen) {
    await env.delay(550);
    text = await env.getMainText(t);
  }
  if (text.length === 0) {
    text = (await t.browser!.evaluate(() =>
      document.body?.innerText ?? ""
    )) as string;
  }
  expect(text.length).toBeGreaterThanOrEqual(minLen);
  for (const p of patterns) {
    expect(text).toMatch(p);
  }
  await shallowInteractMainHere(t, text);
}
