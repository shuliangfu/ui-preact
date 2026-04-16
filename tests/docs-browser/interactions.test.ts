/**
 * @fileoverview docs 深度交互：按路由分 `describe`，**共享单一 docs dev**（一次 `start`），
 * 仅 `goto` 换页；避免每块各起子进程导致首轮冷启动极慢、易被误判为卡住。
 * 与 `page-tests/page_*.test.ts` 按路由拆分的用例互补；请直接在本文件维护横切场景。
 */
import {
  afterAll,
  beforeAll,
  cleanupAllBrowsers,
  describe,
  expect,
  it,
} from "@dreamer/test";
import {
  createDocsBrowserTestEnv,
  DOCS_BROWSER_CONFIG,
  isUiPreactDocsSiteRunnable,
} from "./helpers.ts";

/**
 * 以下函数仅服务本测试文件：点击/输入等逻辑写在当前脚本内，不抽到 helpers.ts。
 */
type BrowserCtx = {
  browser?: {
    goto?: (url: string) => Promise<unknown>;
    evaluate: (fn: () => unknown) => Promise<unknown>;
  };
};

/** 在 main 内点击文案包含 `text` 的 button/a */
async function clickButtonByText(
  t: BrowserCtx,
  text: string,
): Promise<boolean> {
  if (!t?.browser) return false;
  const escaped = JSON.stringify(text);
  const ok = await t.browser.evaluate(
    new Function(
      "var btnText=" + escaped +
        ";var main=document.querySelector('main');if(!main)return false;var buttons=main.querySelectorAll('button[type=\"button\"],button:not([type]),a');for(var i=0;i<buttons.length;i++){var btn=buttons[i];if(btn.textContent&&btn.textContent.trim().indexOf(btnText)!==-1){btn.click();return true;}}return false;",
    ) as () => boolean,
  );
  await new Promise((r) => setTimeout(r, 150));
  return ok as boolean;
}

/** main 内首个可写 input/textarea 赋值并触发 input */
async function typeInFirstInput(
  t: BrowserCtx,
  value: string,
): Promise<boolean> {
  if (!t?.browser) return false;
  const escaped = JSON.stringify(value);
  const ok = await t.browser.evaluate(
    new Function(
      "var value=" + escaped +
        ";var main=document.querySelector('main');if(!main)return false;var el=main.querySelector('input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=file]):not([type=checkbox]):not([type=radio]), textarea');if(!el){return false;}el.focus();el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));return true;",
    ) as () => boolean,
  );
  await new Promise((r) => setTimeout(r, 100));
  return ok as boolean;
}

/** 点击 main 内第一个可用 checkbox */
async function clickFirstCheckbox(t: BrowserCtx): Promise<boolean> {
  if (!t?.browser) return false;
  const ok = await t.browser.evaluate(() => {
    const main = document.querySelector("main");
    if (!main) return false;
    const cb = main.querySelector<HTMLInputElement>('input[type="checkbox"]');
    if (!cb || cb.disabled) return false;
    cb.click();
    return true;
  });
  await new Promise((r) => setTimeout(r, 150));
  return ok as boolean;
}

/** 点击 main 内第一个开关控件 */
async function clickFirstSwitch(t: BrowserCtx): Promise<boolean> {
  if (!t?.browser) return false;
  const ok = await t.browser.evaluate(() => {
    const main = document.querySelector("main");
    if (!main) return false;
    const sw = main.querySelector(
      "[role='switch'], button[class*='switch'], .rounded-full",
    );
    if (!sw) return false;
    (sw as HTMLElement).click();
    return true;
  });
  await new Promise((r) => setTimeout(r, 150));
  return ok as boolean;
}

/** 点击第一个可用 radio */
async function clickFirstRadio(t: BrowserCtx): Promise<boolean> {
  if (!t?.browser) return false;
  const ok = await t.browser.evaluate(() => {
    const main = document.querySelector("main");
    if (!main) return false;
    const radio = main.querySelector<HTMLInputElement>(
      'input[type="radio"]:not([disabled])',
    );
    if (!radio) return false;
    radio.click();
    return true;
  });
  await new Promise((r) => setTimeout(r, 120));
  return ok as boolean;
}

/** 在 document 内点击文案完全匹配的 button/a */
async function clickInDocumentByExactText(
  t: BrowserCtx,
  exactText: string,
): Promise<boolean> {
  if (!t?.browser) return false;
  const escaped = JSON.stringify(exactText);
  const ok = await t.browser.evaluate(
    new Function(
      "var exact=" + escaped +
        ";var all=document.body.querySelectorAll('button,a');for(var i=0;i<all.length;i++){var b=all[i];if(b.textContent&&b.textContent.trim()===exact){b.click();return true;}}return false;",
    ) as () => boolean,
  );
  await new Promise((r) => setTimeout(r, 120));
  return ok as boolean;
}

/** 点击分页「下一页」 */
async function clickPaginationNext(t: BrowserCtx): Promise<boolean> {
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

/** 点击第二个可点 tab */
async function clickSecondTab(t: BrowserCtx): Promise<boolean> {
  if (!t?.browser) return false;
  const ok = await t.browser.evaluate(() => {
    const main = document.querySelector("main");
    if (!main) return false;
    const tabs = main.querySelectorAll(
      '[role="tab"], [data-state], .cursor-pointer',
    );
    for (let i = 0; i < tabs.length; i++) {
      const el = tabs[i] as HTMLElement;
      if (
        el.getAttribute?.("role") === "tab" ||
        el.classList?.contains("cursor-pointer")
      ) {
        if (i >= 1) {
          el.click();
          return true;
        }
      }
    }
    return false;
  });
  await new Promise((r) => setTimeout(r, 150));
  return ok as boolean;
}

/** 点击第一个折叠头 */
async function clickFirstCollapseHeader(t: BrowserCtx): Promise<boolean> {
  if (!t?.browser) return false;
  const ok = await t.browser.evaluate(() => {
    const main = document.querySelector("main");
    if (!main) return false;
    const header = main.querySelector(
      "[data-state], [aria-expanded], .flex.items-center.justify-between",
    );
    if (header) {
      (header as HTMLElement).click();
      return true;
    }
    return false;
  });
  await new Promise((r) => setTimeout(r, 200));
  return ok as boolean;
}

describe("docs 浏览器深度交互（共享单一 docs dev）", () => {
  if (!isUiPreactDocsSiteRunnable()) {
    it.skip("需同步 docs/src/routes（含 _app.tsx）后再跑浏览器 E2E", () => {});
    return;
  }
  /** 全文件共用：一次拉起 docs dev，各用例只 `goto` 不同 path */
  const env = createDocsBrowserTestEnv();
  beforeAll(() => env.start());
  afterAll(async () => {
    await env.stopServerOnly();
    await cleanupAllBrowsers();
  });

  describe("Input 页：首个输入框可输入", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/input");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await typeInFirstInput(t, "e2e-test");
      expect(ok).toBe(true);
      const text = await env.getMainText(t);
      expect(text).toMatch(/Input|单行|输入|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Checkbox 页：可勾选第一个复选框", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/checkbox");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickFirstCheckbox(t);
      expect(ok).toBe(true);
      const text = await env.getMainText(t);
      expect(text).toMatch(/Checkbox|勾选|禁用|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Switch 页：可点击开关", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/switch");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickFirstSwitch(t);
      expect(ok).toBe(true);
      const text = await env.getMainText(t);
      expect(text).toMatch(/Switch|开关|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("RadioGroup 页：有单选选项且页面正常", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/radio-group");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/RadioGroup|单选|选项|代码示例/);
      const hasRadio = await t.browser!.evaluate(() => {
        const main = document.querySelector("main");
        return main?.querySelector('input[type="radio"]') != null;
      });
      expect(hasRadio).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Select 页：可点击打开并选择选项", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/select");
      await new Promise((r) => setTimeout(r, 300));
      const opened = await t.browser!.evaluate(() => {
        const trigger = document.querySelector(
          "main button[aria-haspopup='listbox']",
        ) as HTMLButtonElement | null;
        if (trigger) {
          trigger.click();
          return true;
        }
        return false;
      });
      expect(opened).toBe(true);
      await new Promise((r) => setTimeout(r, 200));
      const selected = await t.browser!.evaluate(() => {
        const opt = document.querySelector(
          'main [role="listbox"] [role="option"]',
        ) as HTMLElement | null;
        if (opt && !(opt as HTMLButtonElement).disabled) {
          opt.click();
          return true;
        }
        return false;
      });
      expect(selected).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("BackTop 页：滚动后可点击回到顶部按钮", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/other/back-top");
      await new Promise((r) => setTimeout(r, 300));
      await t.browser!.evaluate(() => {
        globalThis.scrollTo(0, 300);
      });
      await new Promise((r) => setTimeout(r, 400));
      const clicked = await t.browser!.evaluate(() => {
        const btn = document.querySelector(
          'button[aria-label="回到顶部"], .back-top-host button',
        ) as HTMLButtonElement | null;
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });
      expect(clicked).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Textarea 页：首个多行框可输入", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/textarea");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await typeInFirstInput(t, "e2e textarea");
      expect(ok).toBe(true);
      const text = await env.getMainText(t);
      expect(text).toMatch(/Textarea|多行|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Slider 页：可改变滑块值", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/slider");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await t.browser!.evaluate(() => {
        const main = document.querySelector("main");
        const range = main?.querySelector('input[type="range"]') as
          | HTMLInputElement
          | null;
        if (!range) return false;
        const v = Math.min(
          Number(range.max) || 100,
          (Number(range.value) || 0) + 10,
        );
        range.value = String(v);
        range.dispatchEvent(new Event("input", { bubbles: true }));
        return true;
      });
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Rate 页：有星级控件", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/rate");
      await new Promise((r) => setTimeout(r, 300));
      const hasRate = await t.browser!.evaluate(() => {
        const main = document.querySelector("main");
        return main?.querySelector('[role="img"], button') != null;
      });
      expect(hasRate).toBe(true);
      const text = await env.getMainText(t);
      expect(text).toMatch(/Rate|评分|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("CheckboxGroup 页：可勾选第一个选项", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/checkbox-group");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickFirstCheckbox(t);
      expect(ok).toBe(true);
      const text = await env.getMainText(t);
      expect(text).toMatch(/CheckboxGroup|勾选组|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Pagination 页：有分页且可点下一页", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/navigation/pagination");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Pagination|分页|代码示例/);
      const ok = await clickPaginationNext(t);
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Tabs 页：有标签可点击切换", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/layout/tabs");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Tabs|标签|代码示例/);
      const ok = await clickSecondTab(t);
      if (ok) await new Promise((r) => setTimeout(r, 150));
      expect(text.length).toBeGreaterThan(50);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Collapse 页：有折叠项可点击", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/collapse");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Collapse|折叠|代码示例/);
      const ok = await clickFirstCollapseHeader(t);
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Modal 页：有弹窗说明或触发按钮", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/feedback/modal");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Modal|模态|弹窗|代码示例/);
      const clicked = await clickButtonByText(t, "打开");
      if (clicked) await new Promise((r) => setTimeout(r, 300));
      expect(text.length).toBeGreaterThan(50);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Toast 页：进入页面确认渲染", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/message/toast");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Toast|轻提示|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Tree 页：进入页面确认树形结构渲染", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/tree");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Tree|树|代码示例/);
      const hasTree = await t.browser!.evaluate(() => {
        const main = document.querySelector("main");
        return main?.querySelector('[role="tree"], [role="treeitem"], .tree') !=
            null || (main?.innerText?.length ?? 0) > 100;
      });
      expect(hasTree).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Table 页：进入页面确认表格渲染", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/table");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Table|表格|代码示例/);
      const hasTable = await t.browser!.evaluate(() =>
        document.querySelector("main table") != null
      );
      expect(hasTable).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Alert 页：进入页面确认提示渲染", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/feedback/alert");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Alert|提示|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Link 页：进入页面确认链接渲染", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/basic/link");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Link|链接|代码示例/);
      const hasLink = await t.browser!.evaluate(() =>
        document.querySelector("main a[href]") != null
      );
      expect(hasLink).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Link 页：可点击「返回桌面」", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/basic/link");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "返回桌面");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Search 页：输入并存在搜索控件", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/search");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await typeInFirstInput(t, "e2e search");
      expect(ok).toBe(true);
      const text = await env.getMainText(t);
      expect(text).toMatch(/Search|搜索|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Password 页：有密码框，若有显隐按钮则点击验证", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/password");
      await new Promise((r) => setTimeout(r, 300));
      const hasPwd = await t.browser!.evaluate(() =>
        document.querySelector(
          "main input[type=password], main input[type=text]",
        ) != null
      );
      expect(hasPwd).toBe(true);
      await t.browser!.evaluate(() => {
        const btn = document.querySelector(
          "main button[aria-label*='显示'], main button[aria-label*='隐藏']",
        ) as HTMLButtonElement | null;
        if (btn) btn.click();
      });
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Input-number 页：可点击步进加", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/input-number");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await t.browser!.evaluate(() => {
        const btn = document.querySelector('main button[aria-label="增加"]') as
          | HTMLButtonElement
          | null;
        if (btn && !btn.disabled) {
          btn.click();
          return true;
        }
        return false;
      });
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("RadioGroup 页：可点击第一个单选", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/radio-group");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickFirstRadio(t);
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Rate 页：可点击星级", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/rate");
      await new Promise((r) => setTimeout(r, 300));
      const clicked = await t.browser!.evaluate(() => {
        const main = document.querySelector("main");
        const rate = main?.querySelector(
          '[role="img"], [class*="rate"] button, button',
        );
        if (rate) {
          (rate as HTMLElement).click();
          return true;
        }
        return false;
      });
      expect(clicked).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("MultiSelect 页：展开浮层后可点击全选", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/multiselect");
      await new Promise((r) => setTimeout(r, 300));
      const opened = await t.browser.evaluate(() => {
        const main = document.querySelector("main");
        const trigger = main?.querySelector(
          'button[aria-haspopup="listbox"]',
        ) as HTMLButtonElement | null;
        if (!trigger) return false;
        trigger.click();
        return true;
      });
      expect(opened).toBe(true);
      await new Promise((r) => setTimeout(r, 150));
      const clicked = await clickButtonByText(t, "全选");
      expect(clicked).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Date-picker 页：可点击输入框打开选择器", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/date-picker");
      await new Promise((r) => setTimeout(r, 300));
      const clicked = await t.browser!.evaluate(() => {
        const main = document.querySelector("main");
        const input = main?.querySelector(
          'input[type="text"], input[placeholder*="日期"], input',
        ) as HTMLInputElement | null;
        if (input) {
          input.click();
          return true;
        }
        return false;
      });
      expect(clicked).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Time-picker 页：可点击输入框打开选择器", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/time-picker");
      await new Promise((r) => setTimeout(r, 300));
      const clicked = await t.browser!.evaluate(() => {
        const main = document.querySelector("main");
        const input = main?.querySelector(
          'input[type="text"], input[placeholder*="时间"], input',
        ) as HTMLInputElement | null;
        if (input) {
          input.click();
          return true;
        }
        return false;
      });
      expect(clicked).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Upload 页：可点击上传区域", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/upload");
      await new Promise((r) => setTimeout(r, 300));
      const clicked = await t.browser!.evaluate(() => {
        const main = document.querySelector("main");
        const zone = main?.querySelector(
          'input[type="file"], [class*="upload"], label',
        );
        if (zone) {
          (zone as HTMLElement).click();
          return true;
        }
        return false;
      });
      expect(clicked).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Transfer 页：可点击穿梭框移动按钮或列表项", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/transfer");
      await new Promise((r) => setTimeout(r, 300));
      const clicked = await t.browser!.evaluate(() => {
        const main = document.querySelector("main");
        const btn = main?.querySelector(
          'button[aria-label*="右"], button[aria-label*="右移"], .transfer button',
        );
        if (btn) {
          (btn as HTMLElement).click();
          return true;
        }
        const item = main?.querySelector(
          '[class*="transfer"] li, [class*="list"] li',
        );
        if (item) {
          (item as HTMLElement).click();
          return true;
        }
        return false;
      });
      expect(clicked).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Mentions 页：可输入内容", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/mentions");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await typeInFirstInput(t, "test @");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("RichTextEditor 页：可输入内容", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/rich-text-editor");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await typeInFirstInput(t, "e2e rich text");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Toast 页：点击 success 触发轻提示", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/message/toast");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "success");
      expect(ok).toBe(true);
      await new Promise((r) => setTimeout(r, 400));
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Message 页：有全局提示触发按钮", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/message/message");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Message|全局提示|代码示例/);
      const ok = await clickButtonByText(t, "message.success");
      if (ok) await new Promise((r) => setTimeout(r, 300));
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Notification 页：点击触发通知", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/message/notification");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "成功通知");
      expect(ok).toBe(true);
      await new Promise((r) => setTimeout(r, 400));
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Alert 页：可点击「立即升级」", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/feedback/alert");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "立即升级");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Modal 页：打开后点击确定", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/feedback/modal");
      await new Promise((r) => setTimeout(r, 300));
      const opened = await clickButtonByText(t, "打开 Modal");
      if (opened) {
        await new Promise((r) => setTimeout(r, 400));
        const closed = await clickInDocumentByExactText(t, "确定");
        expect(closed).toBe(true);
      }
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Dialog 页：打开 Dialog 并确定", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/feedback/dialog");
      await new Promise((r) => setTimeout(r, 300));
      const opened = await clickButtonByText(t, "打开 Dialog");
      if (opened) {
        await new Promise((r) => setTimeout(r, 400));
        const ok = await clickInDocumentByExactText(t, "确定");
        if (ok) await new Promise((r) => setTimeout(r, 200));
      }
      const text = await env.getMainText(t);
      expect(text).toMatch(/Dialog|对话框|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Drawer 页：可点击打开抽屉", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/feedback/drawer");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "右侧抽屉");
      if (ok) await new Promise((r) => setTimeout(r, 400));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Drawer|抽屉|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Popconfirm 页：可点击触发确认", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/feedback/popconfirm");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "普通确认");
      if (ok) await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Popconfirm|气泡|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Result 页：可点击「返回列表」", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/feedback/result");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "返回列表");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Hero 页：可点击「立即开始」", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/layout/hero");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "立即开始");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Tabs 页：点击「标签 B」", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/layout/tabs");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "标签 B");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Accordion 页：点击「第一项」展开", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/layout/accordion");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "第一项");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Breadcrumb 页：可点击面包屑链接", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/navigation/breadcrumb");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "首页");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Menu 页：可点击菜单项", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/navigation/menu");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "选项一");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Dropdown 页：点击展开下拉", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/navigation/dropdown");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "点击展开");
      expect(ok).toBe(true);
      await new Promise((r) => setTimeout(r, 300));
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Steps 页：可点击「下一步」", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/navigation/steps");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "下一步");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Page-header 页：可点击「操作」", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/navigation/page-header");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "操作");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Anchor 页：有锚点链接", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/navigation/anchor");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "第一节");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Card 页：可点击「更多」", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/card");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "更多");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Empty 页：可点击「新建」", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/empty");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "新建");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("ImageViewer 页：可点击打开查看器", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/image-viewer");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "打开查看器");
      if (!ok) await clickButtonByText(t, "打开图片预览");
      if (ok) await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/ImageViewer|查看器|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Segmented 页：可点击分段选项", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/segmented");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "网格");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Collapse 页：点击「面板 1」", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/collapse");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "面板 1");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Carousel 页：可点击下一张或指示点", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/carousel");
      await new Promise((r) => setTimeout(r, 300));
      const clicked = await t.browser!.evaluate(() => {
        const main = document.querySelector("main");
        const next = main?.querySelector(
          'button[aria-label*="下一"], button[aria-label*="next"], [class*="arrow"]',
        );
        if (next) {
          (next as HTMLElement).click();
          return true;
        }
        const dot = main?.querySelector('[class*="dot"]');
        if (dot) {
          (dot as HTMLElement).click();
          return true;
        }
        return false;
      });
      expect(clicked).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Calendar 页：可点击日期格", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/calendar");
      await new Promise((r) => setTimeout(r, 300));
      const clicked = await t.browser!.evaluate(() => {
        const cal = document.querySelector("main .calendar");
        const cell = cal?.querySelector("button:not([disabled])");
        if (cell) {
          (cell as HTMLElement).click();
          return true;
        }
        return false;
      });
      expect(clicked).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Tree 页：可点击展开/选中节点", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/tree");
      await new Promise((r) => setTimeout(r, 300));
      /** 用 data-tree-select-key 定位首节点，避免多示例树或文案节点拆分导致 .tree-node span 匹配失败 */
      const clicked = await t.browser!.evaluate(() => {
        const el = document.querySelector(
          "main [data-tree-select-key='1']",
        ) as HTMLElement | null;
        if (el) {
          el.click();
          return true;
        }
        return false;
      });
      expect(clicked).toBe(true);
      await new Promise((r) => setTimeout(r, 200));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Tree|树|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Tree 页：可勾选节点（点击 checkbox 后已勾选更新）", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/tree");
      await new Promise((r) => setTimeout(r, 300));
      const clicked = await t.browser!.evaluate(() => {
        const main = document.querySelector("main");
        const checkbox = main?.querySelector(
          '.tree-node input[type="checkbox"]',
        ) as HTMLInputElement | null;
        if (checkbox && !checkbox.disabled) {
          checkbox.click();
          return true;
        }
        return false;
      });
      expect(clicked).toBe(true);
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/已勾选/);
      expect(text).toMatch(/已勾选:\s*[0-9\-]+/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Code-block 页：可点击复制按钮", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/code-block");
      await new Promise((r) => setTimeout(r, 300));
      const clicked = await t.browser!.evaluate(() => {
        const btn = document.querySelector(
          "main button[title='复制'], main [aria-label='复制']",
        ) as HTMLButtonElement | null;
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });
      expect(clicked).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("ConfigProvider 页：可点击切换 theme", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/other/config-provider");
      await new Promise((r) => setTimeout(r, 300));
      const ok = await clickButtonByText(t, "切换 theme");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Badge 页：有角标展示", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/basic/badge");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Badge|角标|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Avatar 页：有头像展示", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/basic/avatar");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Avatar|头像|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Progress 页：有进度条", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/feedback/progress");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Progress|进度|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Tooltip 页：有悬停说明", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/feedback/tooltip");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Tooltip|提示|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Popover 页：有弹出面板", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/feedback/popover");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Popover|弹出|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("List 页：有列表", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/list");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/List|列表|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Tag 页：有标签", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/tag");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Tag|标签|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Image 页：有图片", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/image");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Image|图片|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Descriptions 页：有描述列表", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/descriptions");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Descriptions|描述|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Timeline 页：有时间轴", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/timeline");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Timeline|时间轴|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Statistic 页：有统计数值", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/statistic");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Statistic|统计|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Comment 页：有评论", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/data-display/comment");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Comment|评论|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Affix 页：有固钉", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/navigation/affix");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Affix|固钉|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Container / Grid / Stack / Divider 页：有布局内容", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/layout/container");
      await new Promise((r) => setTimeout(r, 300));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Container|容器|代码示例/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("DateTimePicker：点击输入打开面板", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/datetime-picker");
      await new Promise((r) => setTimeout(r, 350));
      const clicked = await t.browser!.evaluate(() => {
        const main = document.querySelector("main");
        const input = main?.querySelector(
          'input[type="text"], input[readonly], input',
        ) as HTMLInputElement | null;
        if (input) {
          input.click();
          return true;
        }
        return false;
      });
      expect(clicked).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("TreeSelect：展开下拉并可选第一项", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/tree-select");
      await new Promise((r) => setTimeout(r, 350));
      const opened = await t.browser!.evaluate(() => {
        const trigger = document.querySelector(
          "main button[aria-haspopup='listbox']",
        ) as HTMLButtonElement | null;
        if (trigger) {
          trigger.click();
          return true;
        }
        return false;
      });
      expect(opened).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("ColorPicker：点击触发区", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/color-picker");
      await new Promise((r) => setTimeout(r, 350));
      const ok = await t.browser!.evaluate(() => {
        const main = document.querySelector("main");
        const el = main?.querySelector("button, input") as HTMLElement | null;
        if (el) {
          el.click();
          return true;
        }
        return false;
      });
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("AutoComplete：可输入", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/autocomplete");
      await new Promise((r) => setTimeout(r, 350));
      const ok = await typeInFirstInput(t, "a");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Cascader：点击展开", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/cascader");
      await new Promise((r) => setTimeout(r, 350));
      const ok = await t.browser!.evaluate(() => {
        const main = document.querySelector("main");
        const trigger = main?.querySelector(
          'button[aria-haspopup="listbox"], button',
        ) as HTMLButtonElement | null;
        if (trigger) {
          trigger.click();
          return true;
        }
        return false;
      });
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("MarkdownEditor：可输入", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/markdown-editor");
      await new Promise((r) => setTimeout(r, 350));
      const ok = await typeInFirstInput(t, "# e2e");
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Form 容器：含表单项", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/form-containers");
      await new Promise((r) => setTimeout(r, 350));
      const text = await env.getMainText(t);
      expect(text).toMatch(/Form|表单|代码示例/);
      const hasField = await t.browser!.evaluate(() =>
        document.querySelector("main input, main button") != null
      );
      expect(hasField).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("主题颜色：色板文档", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/other/theme-colors");
      await new Promise((r) => setTimeout(r, 350));
      const text = await env.getMainText(t);
      expect(text).toMatch(/主题|primary|default|色|@theme|Tailwind/);
    }, DOCS_BROWSER_CONFIG);
  });

  describe("Check 合订页：可勾选", () => {
    it("main", async (t) => {
      if (!t?.browser) return;
      await env.goto(t, "/desktop/form/check");
      await new Promise((r) => setTimeout(r, 350));
      const ok = await clickFirstCheckbox(t);
      expect(ok).toBe(true);
    }, DOCS_BROWSER_CONFIG);
  });
});
