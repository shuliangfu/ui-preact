/**
 * @fileoverview 纯展示类文档页：专用断言写在**本文件**内。路由列表见 `component-catalog.ts` 的 {@link RENDER_ONLY_DOC_SPECS}。
 * 所有测试共享全局单例 dev server。
 */

import { describe, expect, it } from "@dreamer/test";
import {
  RENDER_ONLY_DOC_SPECS,
  type RenderOnlyDocSpec,
} from "./component-catalog.ts";
import { DOCS_BROWSER_CONFIG, sharedEnv } from "./helpers.ts";

/**
 * 纯展示页断言（仅本文件使用）：`main` 正文、可选 canvas/svg 数量。
 */
async function assertRenderOnlyDocPage(
  t: {
    browser?: {
      goto?: (url: string) => Promise<unknown>;
      evaluate: (fn: () => unknown) => Promise<unknown>;
    };
  },
  path: string,
  spec: Pick<
    RenderOnlyDocSpec,
    "patterns" | "minMainLength" | "minCanvasesInMain" | "minSvgsInMain"
  >,
): Promise<void> {
  if (!t?.browser?.goto) return;
  await sharedEnv.goto(t, path);
  await sharedEnv.delay(550);
  let text = await sharedEnv.getMainText(t);
  if (text.length < 24) {
    await sharedEnv.delay(500);
    text = await sharedEnv.getMainText(t);
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

describe("docs 纯展示页渲染（共享 dev）", () => {
  for (const spec of RENDER_ONLY_DOC_SPECS) {
    it(`${spec.label} ${spec.path}`, async (t) => {
      if (!t?.browser) return;
      await assertRenderOnlyDocPage(t, spec.path, {
        patterns: spec.patterns,
        minMainLength: spec.minMainLength,
        minCanvasesInMain: spec.minCanvasesInMain,
        minSvgsInMain: spec.minSvgsInMain,
      });
    }, DOCS_BROWSER_CONFIG);
  }

  it("cleanup", async () => {
    await sharedEnv.cleanup();
  }, {
    sanitizeOps: false,
    sanitizeResources: false,
  });
});
