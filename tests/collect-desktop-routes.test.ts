/**
 * @fileoverview `desktopFileRelToPath` 与空目录扫描行为（无 docs 依赖）
 */

import { describe, expect, it } from "@dreamer/test";
import {
  collectDesktopDocsRoutes,
  desktopFileRelToPath,
} from "./collect-desktop-routes.ts";

describe("collect-desktop-routes", () => {
  it("desktopFileRelToPath：index → /desktop", () => {
    expect(desktopFileRelToPath("index.tsx")).toBe("/desktop");
  });

  it("desktopFileRelToPath：嵌套 index", () => {
    expect(desktopFileRelToPath("form/index.tsx")).toBe("/desktop/form");
  });

  it("desktopFileRelToPath：叶子页", () => {
    expect(desktopFileRelToPath("form/input.tsx")).toBe("/desktop/form/input");
  });

  it("desktopFileRelToPath：动态段占位", () => {
    expect(desktopFileRelToPath("user/[id].tsx")).toBe("/desktop/user/e2e-1");
  });

  it("collectDesktopDocsRoutes：无 desktop 目录时返回空数组", async () => {
    const routes = await collectDesktopDocsRoutes("/nonexistent/docs-path-xyz");
    expect(routes).toEqual([]);
  });
});
