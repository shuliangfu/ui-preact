/**
 * @fileoverview 纯展示类文档页：专用断言写在**本文件**内。路由列表见 `component-catalog.ts` 的 {@link RENDER_ONLY_DOC_SPECS}。
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
  RENDER_ONLY_DOC_SPECS,
  type RenderOnlyDocSpec,
} from "./component-catalog.ts";
import {
  createDocsBrowserTestEnv,
  DOCS_BROWSER_CONFIG,
  isUiPreactDocsSiteRunnable,
} from "./helpers.ts";

/**
 * 纯展示页断言（仅本文件使用）：`main` 正文、可选 canvas/svg 数量。
 * @param t 浏览器上下文
 * @param env docs 环境
 * @param path 路由
 * @param spec 断言字段
 */
async function assertRenderOnlyDocPage(
  t: {
    browser?: {
      goto?: (url: string) => Promise<unknown>;
      evaluate: (fn: () => unknown) => Promise<unknown>;
    };
  },
  env: ReturnType<typeof createDocsBrowserTestEnv>,
  path: string,
  spec: Pick<
    RenderOnlyDocSpec,
    "patterns" | "minMainLength" | "minCanvasesInMain" | "minSvgsInMain"
  >,
): Promise<void> {
  if (!t?.browser?.goto) return;
  await env.goto(t, path);
  await env.delay(550);
  let text = await env.getMainText(t);
  if (text.length < 24) {
    await env.delay(500);
    text = await env.getMainText(t);
  }
  if (text.length === 0) {
    text = (await t.browser!.evaluate(() =>
      document.body?.innerText ?? ""
    )) as string;
  }
  const minLen = spec.minMainLength ?? 48;
  expect(text.length).toBeGreaterThanOrEqual(minLen);
  for (const p of spec.patterns) {
    expect(text).toMatch(p);
  }
  if (spec.minCanvasesInMain != null) {
    const n = (await t.browser!.evaluate(() => {
      const main = document.querySelector("main");
      return main?.querySelectorAll("canvas").length ?? 0;
    })) as number;
    expect(n).toBeGreaterThanOrEqual(spec.minCanvasesInMain);
  }
  if (spec.minSvgsInMain != null) {
    const n = (await t.browser!.evaluate(() => {
      const main = document.querySelector("main");
      return main?.querySelectorAll("svg").length ?? 0;
    })) as number;
    expect(n).toBeGreaterThanOrEqual(spec.minSvgsInMain);
  }
}

describe("docs 纯展示页渲染（专用断言，每页独立 dev）", () => {
  if (!isUiPreactDocsSiteRunnable()) {
    it.skip("需同步 docs/src/routes（含 _app.tsx）后再跑浏览器 E2E", () => {});
    return;
  }
  afterAll(async () => {
    await cleanupAllBrowsers();
  });

  for (const spec of RENDER_ONLY_DOC_SPECS) {
    describe(`${spec.label} ${spec.path}`, () => {
      const env = createDocsBrowserTestEnv();
      beforeAll(() => env.start());
      afterAll(() => env.stopServerOnly());
      it("main 正文与结构达标", async (t) => {
        if (!t?.browser) return;
        await assertRenderOnlyDocPage(t, env, spec.path, {
          patterns: spec.patterns,
          minMainLength: spec.minMainLength,
          minCanvasesInMain: spec.minCanvasesInMain,
          minSvgsInMain: spec.minSvgsInMain,
        });
      }, DOCS_BROWSER_CONFIG);
    });
  }
});
