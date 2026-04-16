/**
 * 根布局：顶栏 + 子路由 + 全局 Toast/Message/Notification（页脚在各页主栏/首页滚动区内，见 SiteFooter）。
 * **Preact** 实现（由 ui-view + `@dreamer/view` 文档站同源迁移）：`useSignal` + `createPortal` + `useEffect` 替代 `Show`/`Portal`/`createEffect`。
 */

import type { LoadContext } from "@dreamer/dweb";
import {
  Divider,
  IconBrandGithub,
  IconExternalLink,
  IconMenu,
  IconMoreHorizontal,
  Link,
  MessageContainer,
  NavBar,
  NotificationContainer,
  ToastContainer,
} from "@dreamer/ui-preact";
import type { ComponentChildren } from "preact";
import { createPortal } from "preact/compat";
import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import DocsSiteBrand from "../components/DocsSiteBrand.tsx";
import { ThemeToggle } from "../components/ThemeToggle.tsx";
import {
  docsNavDrawerOpen,
  docsNavSidebarAttached,
} from "../state/docs-nav-drawer.ts";

/** 根 `_layout` 的 `load()` 注入字段 */
interface RootLayoutData {
  /** 当前请求的 pathname（与 `location.pathname` 对齐，供 SSR 顶栏与 hydrate 一致） */
  docsRequestPathname?: string;
}

interface RootLayoutProps {
  children?: ComponentChildren | ComponentChildren[];
  /** dweb 将各层 `load()` 返回值合并为 `data` 传入布局 */
  data?: RootLayoutData;
}

/**
 * 服务端为根布局注入请求路径，使 SSR 输出的顶栏 `start` 与客户端首帧一致，避免 hybrid 刷新时 hydration 与 pathname 兜底打架、徽标闪动。
 *
 * @param ctx - dweb {@link LoadContext}
 * @returns 供布局 `props.data` 使用的 `{ docsRequestPathname }`（不显式标注返回类型，见下行注释）
 */
/**
 * 注意：勿写显式返回类型为对象字面量 `{ ... }`，否则 dweb 客户端 `strip-load-plugin`
 * 会把类型里的 `{` 误判为函数体起始，剔除 `load` 后残留顶层 `return` 导致 esbuild 报错。
 */
export function load(ctx: LoadContext) {
  let pathname = "/";
  try {
    pathname = new URL(ctx.url).pathname;
  } catch {
    pathname = "/";
  }
  return { docsRequestPathname: pathname };
}

/** 宽屏顶栏分区链接 */
const docsNavPartitionLinkClass =
  "rounded-lg px-1.5 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-teal-300 transition-colors sm:px-2 sm:py-2 sm:text-xs md:px-3.5 md:text-sm";

/** 小屏全宽顶栏菜单内：分区入口行 */
const docsMobileSheetRowLinkClass =
  "flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-medium text-slate-800 hover:bg-teal-50 active:bg-teal-100 dark:text-slate-100 dark:hover:bg-slate-800 dark:active:bg-slate-700 transition-colors";

/** 小屏菜单底部：仅图标的 JSR、GitHub 外链按钮 */
const docsMobileSheetIconLinkClass =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800";

/**
 * 小屏顶栏「更多」全宽菜单；内容经 {@link createPortal} 挂到 `document.body`。
 */
function DocsMobileTopSheet() {
  const menuOpen = useSignal(false);
  const closeMenu = () => {
    menuOpen.value = false;
  };

  useEffect(() => {
    if (!menuOpen.value || typeof globalThis.document === "undefined") {
      return;
    }
    const doc = globalThis.document;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    doc.addEventListener("keydown", onKeyDown);
    return () => doc.removeEventListener("keydown", onKeyDown);
  }, [menuOpen.value]);

  const overlay = menuOpen.value
    ? (
      <div class="pointer-events-none fixed inset-0 z-[1000]">
        <button
          type="button"
          class="pointer-events-auto absolute inset-x-0 top-16 bottom-0 z-0 cursor-default border-0 bg-slate-900/35 p-0"
          aria-label="关闭顶栏菜单"
          onClick={closeMenu}
        />
        <div
          class="pointer-events-auto absolute inset-x-0 top-16 z-10 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
          role="menu"
          aria-label="站点菜单"
        >
          <Link
            href="/desktop"
            className={docsMobileSheetRowLinkClass}
            onClick={closeMenu}
          >
            桌面版
          </Link>
          <Link
            href="/mobile"
            className={docsMobileSheetRowLinkClass}
            onClick={closeMenu}
          >
            移动版
          </Link>
          <Divider
            type="horizontal"
            class="my-0 border-slate-200 dark:border-slate-700"
          />
          <div class="flex items-center justify-center gap-8 px-4 py-3.5">
            <ThemeToggle />
            <Link
              href="https://jsr.io/@dreamer/ui-preact"
              target="_blank"
              title="JSR 包页"
              aria-label="JSR 包页"
              className={docsMobileSheetIconLinkClass}
              onClick={closeMenu}
            >
              <IconExternalLink class="h-5 w-5" aria-hidden />
            </Link>
            <Link
              href="https://github.com/shuliangfu/dreamer-jsr/tree/main/ui-preact"
              target="_blank"
              title="GitHub 仓库"
              aria-label="GitHub 仓库"
              className={docsMobileSheetIconLinkClass}
              onClick={closeMenu}
            >
              <IconBrandGithub class="h-5 w-5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    )
    : null;

  return (
    <div class="relative md:hidden">
      <button
        type="button"
        class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        title="更多"
        aria-label="打开顶栏菜单"
        aria-expanded={menuOpen.value ? "true" : "false"}
        aria-haspopup="true"
        onClick={(e: Event) => {
          e.stopPropagation();
          menuOpen.value = !menuOpen.value;
        }}
      >
        <IconMoreHorizontal class="h-5 w-5" aria-hidden />
      </button>
      {typeof globalThis.document !== "undefined" && overlay
        ? createPortal(overlay, globalThis.document.body)
        : null}
    </div>
  );
}

/**
 * 读取浏览器 pathname；SSR 或无 `location` 时返回空串。
 *
 * @returns 当前 pathname 或 `""`
 */
function getClientPathnameForDocsNav(): string {
  if (typeof globalThis.location === "undefined") return "";
  const p = globalThis.location.pathname;
  return typeof p === "string" ? p : "";
}

/**
 * 判断 URL 是否处于文档桌面/移动分区（与 `desktop`/`mobile` 子布局覆盖范围一致）。
 *
 * @param pathname - 原始 pathname
 * @returns 属于 `/desktop`、`/mobile` 及其子路径时为 true
 */
function docsPathIndicatesSidebarNav(pathname: string): boolean {
  if (pathname === "") return false;
  const p = pathname.replace(/\/$/, "") || "/";
  return (
    p === "/desktop" ||
    p.startsWith("/desktop/") ||
    p === "/mobile" ||
    p.startsWith("/mobile/")
  );
}

/**
 * 文档站顶栏单独成组件：在此读取 {@link docsNavSidebarAttached}，把订阅限制在顶栏子树（与 ui-view 文档站一致）。
 * 小屏徽标用 NavBar `center` 绝对居中；`nav` 占位 `max-md:pointer-events-none` 避免挡点击。
 *
 * `start`（汉堡）：`docsNavSidebarAttached` **或** URL 落在文档分区。
 * URL：`layoutPathnameHint` 来自根 `load()`（SSR 与 hydrate 与服务器 HTML 一致）；客户端优先 `location.pathname`，避免 SPA 后 `data` 仍为首屏路径。
 */
function DocsSiteTopBar(props: { layoutPathnameHint?: string }) {
  const livePath = getClientPathnameForDocsNav();
  const pathForNav = livePath !== ""
    ? livePath
    : (props.layoutPathnameHint ?? "");
  const showHamburgerSlot = docsNavSidebarAttached.value ||
    docsPathIndicatesSidebarNav(pathForNav);

  return (
    <div class="shrink-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md supports-backdrop-filter:bg-white/70 dark:supports-backdrop-filter:bg-slate-900/70">
      <NavBar
        menuAlign="right"
        sticky={false}
        border={false}
        blur={false}
        containerMaxWidth="full"
        containerClass="max-w-[1800px] mx-auto !px-0 sm:!px-0 lg:!px-0 pr-3 sm:pr-6 lg:pr-8"
        class="border-0 bg-transparent shadow-none backdrop-blur-none dark:bg-transparent dark:shadow-none"
        center={
          <div class="md:hidden">
            <DocsSiteBrand />
          </div>
        }
        brand={
          <div class="hidden w-72 shrink-0 items-center justify-center md:flex md:-translate-x-8">
            <DocsSiteBrand />
          </div>
        }
        start={showHamburgerSlot
          ? (
            <button
              type="button"
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
              onClick={() => {
                docsNavDrawerOpen.value = true;
              }}
              aria-label="打开文档导航菜单"
            >
              <IconMenu class="h-6 w-6" aria-hidden />
            </button>
          )
          : null}
        nav={
          <div class="flex min-h-0 min-w-0 w-full flex-1 items-center max-md:pointer-events-none md:justify-end">
            <div class="hidden shrink-0 items-center gap-0.5 sm:gap-1 md:flex">
              <Link href="/desktop" className={docsNavPartitionLinkClass}>
                桌面版
              </Link>
              <Link href="/mobile" className={docsNavPartitionLinkClass}>
                移动版
              </Link>
            </div>
          </div>
        }
        end={
          <>
            <DocsMobileTopSheet />
            <div class="hidden md:contents">
              <Divider type="vertical" class="h-6 self-center" />
              <ThemeToggle />
              <Link
                href="https://jsr.io/@dreamer/ui-preact"
                target="_blank"
                title="JSR 包页"
                aria-label="JSR 包页"
                className="rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-teal-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-teal-300 transition-colors"
              >
                JSR
              </Link>
              <Link
                href="https://github.com/shuliangfu/dreamer-jsr/tree/main/ui-preact"
                target="_blank"
                title="GitHub 仓库"
                aria-label="GitHub 仓库"
                className="rounded-lg p-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors inline-flex items-center justify-center"
              >
                <IconBrandGithub class="w-5 h-5" />
              </Link>
            </div>
          </>
        }
      />
    </div>
  );
}

export default function RootLayout(
  { children, data }: RootLayoutProps,
) {
  return (
    <div class="h-full min-h-0 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <DocsSiteTopBar layoutPathnameHint={data?.docsRequestPathname} />

      <div class="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</div>

      <ToastContainer />
      <MessageContainer />
      <NotificationContainer />
    </div>
  );
}
