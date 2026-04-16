/**
 * 移动版文档布局：侧栏 + 主内容（与 desktop/_layout 结构对齐，菜单项对应 @dreamer/ui-preact/mobile）。
 * aside 与 main 各自纵向滚动，不共用整页滚动。
 */

import type { LoadContext } from "@dreamer/dweb";
import { Sidebar } from "@dreamer/ui-preact";
import type { ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";
import SiteFooter from "../../components/SiteFooter.tsx";
import {
  docsNavDrawerOpen,
  docsNavSidebarAttached,
} from "../../state/docs-nav-drawer.ts";

/** 反馈与浮层 */
const FEEDBACK_SUBMENU = [
  {
    path: "/mobile/feedback/bottom-sheet",
    label: "BottomSheet",
    desc: "底部抽屉",
  },
  {
    path: "/mobile/feedback/action-sheet",
    label: "ActionSheet",
    desc: "操作表",
  },
  {
    path: "/mobile/feedback/pull-refresh",
    label: "PullRefresh",
    desc: "下拉刷新",
  },
  {
    path: "/mobile/feedback/swipe-cell",
    label: "SwipeCell",
    desc: "滑动单元格",
  },
] as const;

/** 导航 */
const NAVIGATION_SUBMENU = [
  { path: "/mobile/navigation/tab-bar", label: "TabBar", desc: "底部标签栏" },
  { path: "/mobile/navigation/navbar", label: "NavBar", desc: "顶栏" },
] as const;

/** 数据展示（移动 data-display 子集文档） */
const DATA_DISPLAY_SUBMENU = [
  {
    path: "/mobile/data-display/scroll-list",
    label: "ScrollList",
    desc: "列表·下拉刷新·加载更多",
  },
] as const;

/** 表单（移动入口；Select 等与桌面默认一致，Cascader 等差异见各页） */
const FORM_SUBMENU = [
  { path: "/mobile/form/select", label: "Select", desc: "单选" },
  { path: "/mobile/form/multiselect", label: "MultiSelect", desc: "多选" },
  { path: "/mobile/form/tree-select", label: "TreeSelect", desc: "树选择" },
  { path: "/mobile/form/date-picker", label: "DatePicker", desc: "日期" },
  {
    path: "/mobile/form/datetime-picker",
    label: "DateTimePicker",
    desc: "日期时间",
  },
  { path: "/mobile/form/cascader", label: "Cascader", desc: "级联" },
] as const;

/** 其它（移动专用工具） */
const OTHER_SUBMENU = [
  {
    path: "/mobile/other/mobile-portal-host-scope",
    label: "MobilePortalHostScope",
    desc: "机内 Portal 锚点",
  },
] as const;

const MENU: ReadonlyArray<{
  path: string;
  label: string;
  children?: ReadonlyArray<{ path: string; label: string; desc: string }>;
}> = [
  { path: "/mobile/feedback", label: "反馈与浮层", children: FEEDBACK_SUBMENU },
  { path: "/mobile/navigation", label: "导航", children: NAVIGATION_SUBMENU },
  {
    path: "/mobile/data-display",
    label: "数据展示",
    children: DATA_DISPLAY_SUBMENU,
  },
  { path: "/mobile/form", label: "表单", children: FORM_SUBMENU },
  { path: "/mobile/other", label: "其它", children: OTHER_SUBMENU },
];

/** `load()` 注入，供侧栏 SSR 与当前路由对齐 */
interface MobileDocsLayoutData {
  docsSidebarPathname?: string;
}

interface LayoutProps {
  children?: ComponentChildren | ComponentChildren[];
  data?: MobileDocsLayoutData;
}

/**
 * 为侧栏提供请求路径（同 desktop/_layout）；勿写返回类型为 `{ ... }` 字面量，避免 strip-load 误删。
 */
export function load(ctx: LoadContext) {
  let pathname = "/";
  try {
    pathname = new URL(ctx.url).pathname;
  } catch {
    pathname = "/";
  }
  return { docsSidebarPathname: pathname };
}

export default function MobileDocsLayout({ children, data }: LayoutProps) {
  /**
   * 同 desktop/_layout：effect 内置位 {@link docsNavSidebarAttached}，卸载时关抽屉（与 ui-view 文档站一致）。
   */
  useEffect(() => {
    docsNavSidebarAttached.value = true;
    return () => {
      docsNavSidebarAttached.value = false;
      docsNavDrawerOpen.value = false;
    };
  }, []);

  const pathHint = (data?.docsSidebarPathname ?? "").replace(/\/$/, "") || "";
  const getSidebarCurrentPath = (): string => {
    if (
      typeof globalThis.location !== "undefined" &&
      typeof globalThis.location.pathname === "string" &&
      globalThis.location.pathname !== ""
    ) {
      return globalThis.location.pathname.replace(/\/$/, "") || "/";
    }
    return pathHint !== "" ? pathHint : "/";
  };

  /* 占满根布局中间 flex-1 区域高度；max-w-[1800px] mx-auto 与顶栏同宽居中（同 desktop/_layout） */
  return (
    <div class="relative mx-auto flex h-full min-h-0 w-full max-w-[1800px] flex-1 overflow-hidden">
      {
        /*
         * 侧栏仅菜单；回首页见顶栏，与 desktop/_layout 一致；小屏抽屉与顶栏共用 docsNavDrawerOpen。
         */
      }
      <Sidebar
        overview={{ path: "/mobile", label: "移动版概览" }}
        sectionTitle="移动端组件"
        items={MENU}
        getCurrentPath={getSidebarCurrentPath}
        accordionGroupName="docs-mobile-sidebar"
        drawerOpen={docsNavDrawerOpen}
        drawerTitle="移动端组件"
        drawerAccordionGroupName="docs-mobile-drawer"
        class="min-h-0 overscroll-y-contain"
      />
      {
        /*
         * 正文区用 flex-auto，避免 flex-1 固定高度导致长文溢出叠在页脚上（同 desktop/_layout）。
         */
      }
      <main class="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-y-auto overscroll-y-contain px-3 py-6 sm:px-6 sm:py-8 lg:px-10">
        <div class="flex flex-auto flex-col">{children}</div>
        <SiteFooter />
      </main>
    </div>
  );
}
