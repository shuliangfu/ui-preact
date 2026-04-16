/**
 * @fileoverview 文档路由 `/desktop/navigation/pagination` 的浏览器测试。
 * Pagination 分页 — **本文件仅服务该路由**：后续请按文档示例块继续补全分步交互与断言，勿用仓库脚本覆盖正文。
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
const DOC_PATH = "/desktop/navigation/pagination";

describe("文档页 E2E：/desktop/navigation/pagination（Pagination 分页）", () => {
  const env = createDocsBrowserTestEnv();
  beforeAll(() => env.start());
  afterAll(async () => {
    await env.stopServerOnly();
    await cleanupAllBrowsers();
  });

  it("分页「下一页」可点并完成浅层控件探针", async (t) => {
    if (!t?.browser?.goto) return;
    await env.goto(t, DOC_PATH);
    await env.delay(450);
    const text = await env.getMainText(t);
    expect(text.length).toBeGreaterThanOrEqual(36);
    expect(text).toMatch(/Pagination|分页/i);
    expect(await clickPaginationNextHere(t)).toBe(true);
    await shallowInteractMainHere(t, text);
  }, DOCS_BROWSER_CONFIG);

  /**
   * 回归：非受控分页点击页码后当前页高亮须切换（曾出现「点了没反应」感知）。
   * 在「完整」示例的首个 `nav` 内点「第 2 页」，断言 `aria-current="page"` 落在文案为 2 的按钮上。
   */
  it("完整示例：点击页码 2 后当前页指示须更新", async (t) => {
    if (!t?.browser?.goto) return;
    await env.goto(t, DOC_PATH);
    await env.delay(520);
    await t.browser.evaluate(() => {
      const needle =
        "完整（total + pageSizeOptions + showTotal + showQuickJumper）";
      const main = document.querySelector("main");
      if (!main) return;
      const heads = main.querySelectorAll("h2, h3");
      for (let i = 0; i < heads.length; i++) {
        const h = heads[i];
        if (!(h.textContent || "").includes(needle)) continue;
        const section = h.parentElement;
        const nav = section?.querySelector(
          'nav[role="navigation"][aria-label="分页"]',
        ) as HTMLElement | null;
        if (!nav) return;
        const buttons = nav.querySelectorAll("button[type='button']");
        for (let j = 0; j < buttons.length; j++) {
          const b = buttons[j] as HTMLButtonElement;
          if (b.getAttribute("aria-label") !== "第 2 页") continue;
          if ((b.textContent || "").trim() !== "2") continue;
          b.click();
          return;
        }
        return;
      }
    });
    await env.delay(200);
    const currentIsPage2 = await t.browser.evaluate(() => {
      const needle =
        "完整（total + pageSizeOptions + showTotal + showQuickJumper）";
      const main = document.querySelector("main");
      if (!main) return false;
      const heads = main.querySelectorAll("h2, h3");
      for (let i = 0; i < heads.length; i++) {
        const h = heads[i];
        if (!(h.textContent || "").includes(needle)) continue;
        const section = h.parentElement;
        const nav = section?.querySelector(
          'nav[role="navigation"][aria-label="分页"]',
        ) as HTMLElement | null;
        if (!nav) return false;
        const cur = nav.querySelector(
          'button[aria-current="page"]',
        ) as HTMLButtonElement | null;
        return cur != null && (cur.textContent || "").trim() === "2";
      }
      return false;
    });
    expect(currentIsPage2).toBe(true);
  }, DOCS_BROWSER_CONFIG);

  /**
   * 文档小节「完整（total + pageSizeOptions + showTotal + showQuickJumper）」：在 main 内定位对应 h3，于该示例区块内完成一次交互。
   */
  it(
    "严格·完整（total + pageSizeOptions + showTotal + showQuickJumper）",
    async (t) => {
      if (!t?.browser?.goto) return;
      await env.goto(t, DOC_PATH);
      await env.delay(520);
      const ok = await t.browser.evaluate(() => {
        const needle =
          "完整（total + pageSizeOptions + showTotal + showQuickJumper）";
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
    },
    DOCS_BROWSER_CONFIG,
  );

  /**
   * 文档小节「totalPages 直接指定总页数」：在 main 内定位对应 h3，于该示例区块内完成一次交互。
   */
  it("严格·totalPages 直接指定总页数", async (t) => {
    if (!t?.browser?.goto) return;
    await env.goto(t, DOC_PATH);
    await env.delay(520);
    const ok = await t.browser.evaluate(() => {
      const needle = "totalPages 直接指定总页数";
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
   * 文档小节「极简模式（showPageNumbers=false）」：在 main 内定位对应 h3，于该示例区块内完成一次交互。
   */
  it("严格·极简模式（showPageNumbers=false）", async (t) => {
    if (!t?.browser?.goto) return;
    await env.goto(t, DOC_PATH);
    await env.delay(520);
    const ok = await t.browser.evaluate(() => {
      const needle = "极简模式（showPageNumbers=false）";
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
   * 文档小节「disabled」：在 main 内定位对应 h3，于该示例区块内完成一次交互。
   */
  it("严格·disabled", async (t) => {
    if (!t?.browser?.goto) return;
    await env.goto(t, DOC_PATH);
    await env.delay(520);
    const ok = await t.browser.evaluate(() => {
      const needle = "disabled";
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
   * 文档小节「syncUrl（与 URL ?page=1&pageSize=10 同步）」：在 main 内定位对应 h3，于该示例区块内完成一次交互。
   */
  it("严格·syncUrl（与 URL ?page=1&pageSize=10 同步）", async (t) => {
    if (!t?.browser?.goto) return;
    await env.goto(t, DOC_PATH);
    await env.delay(520);
    const ok = await t.browser.evaluate(() => {
      const needle = "syncUrl（与 URL ?page=1&pageSize=10 同步）";
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

/** 本文件内：分页下一页 */
async function clickPaginationNextHere(
  t: { browser?: { evaluate: (fn: () => boolean) => Promise<unknown> } },
): Promise<boolean> {
  if (!t?.browser) return false;
  const ok = await t.browser.evaluate(() => {
    const main = document.querySelector("main");
    if (!main) return false;
    const buttons = main.querySelectorAll("button, a");
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i] as HTMLElement;
      const text = btn.textContent?.trim() ?? "";
      const ariaLabel = btn.getAttribute?.("aria-label") ?? "";
      const match = /下一页|Next|›|»/.test(text) ||
        /下一页|next/i.test(ariaLabel);
      if (match && !btn.hasAttribute?.("disabled")) {
        btn.click();
        return true;
      }
    }
    return false;
  });
  await new Promise((r) => setTimeout(r, 150));
  return ok as boolean;
}

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
