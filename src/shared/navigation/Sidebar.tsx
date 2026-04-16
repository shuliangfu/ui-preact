/**
 * Sidebar 侧栏折叠菜单（Preact）。
 * 与 ui-view 行为一致：`<details name>` 手风琴、当前路径高亮、可选小屏 Drawer。
 */

import type { Signal } from "@preact/signals";
import type { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { Drawer } from "../feedback/Drawer.tsx";
import { Link } from "../basic/Link.tsx";
/** 按需：单文件图标，避免经 icons/mod 拉入全表 */
import { IconChevronRight } from "../basic/icons/ChevronRight.tsx";

/** 二级子项：path、label、desc（展示为 "label — desc"） */
export interface SidebarSubItem {
  path: string;
  label: string;
  desc: string;
}

/** 一级项：无 children 为单链接，有 children 为可折叠分组 */
export interface SidebarItem {
  path: string;
  label: string;
  children?: ReadonlyArray<SidebarSubItem>;
}

export interface SidebarProps {
  /** 顶部概览链接（如「组件概览」-> /desktop） */
  overview?: { path: string; label: string };
  /** 分组标题（如「组件」），不跳转 */
  sectionTitle?: string;
  /** 菜单项：有 children 的为折叠分组，无则为单链接 */
  items: ReadonlyArray<SidebarItem>;
  /** 获取当前路径用于 active 高亮，默认读 location.pathname 并去掉末尾斜杠 */
  getCurrentPath?: () => string;
  /** 根节点（aside）额外 class */
  class?: string;
  className?: string;
  /**
   * 有子菜单的一级项使用 `<details name={accordionGroupName}>` 互斥展开；
   * 同一页若会挂载多个 Sidebar，请传入不同字符串以免两组 details 互相牵连。
   */
  accordionGroupName?: string;
  /**
   * 与顶栏「菜单」等共用：为真时 max-md 下将导航收入左侧 Drawer，固定侧栏仅 md+ 显示。
   */
  drawerOpen?: Signal<boolean>;
  /** Drawer 标题；不传则用 `overview.label`，再无则「导航」 */
  drawerTitle?: string;
  /**
   * 抽屉内 details 的 `name`，须与 `accordionGroupName` 不同；
   * 默认在 `accordionGroupName` 后追加 `-drawer`。
   */
  drawerAccordionGroupName?: string;
}

/**
 * 默认取当前路径：优先 `location.pathname`；无 location（SSR）时读 dweb hybrid 注入的 `globalThis.__DATA__.pathname`，
 * 以便 `<details open>` 与当前路由一致、首屏即展开对应分组。
 */
const defaultGetCurrentPath = (): string => {
  const loc = typeof globalThis.location !== "undefined"
    ? globalThis.location
    : null;
  if (loc?.pathname != null && loc.pathname !== "") {
    return loc.pathname.replace(/\/$/, "") || "/";
  }
  try {
    const injected = (globalThis as unknown as { __DATA__?: { pathname?: string } })
      .__DATA__?.pathname;
    if (typeof injected === "string" && injected !== "") {
      return injected.replace(/\/$/, "") || "/";
    }
  } catch {
    /* 非浏览器环境忽略 */
  }
  return "/";
};

const linkBase =
  "block rounded-md py-2 pl-3 pr-3 text-sm transition-colors whitespace-nowrap ";
const linkNormal = linkBase +
  "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 ";
/** active 仅保留字体颜色，无背景色 */
const linkActive = linkBase +
  "text-teal-700 dark:text-teal-300 font-medium ";
const overviewBase =
  "block rounded-md py-2 pl-3 pr-3 text-sm font-medium transition-colors ";
const overviewNormal = overviewBase +
  "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-100 ";
const overviewActive = overviewBase +
  "text-teal-700 dark:text-teal-300 ";
/** summary 本体用 block；flex 排布放在唯一子节点上 */
const categoryBtnNormal =
  "block w-full cursor-pointer list-none rounded-md py-1.5 pl-3 pr-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors [&::-webkit-details-marker]:hidden";
const categoryBtnActive =
  "block w-full cursor-pointer list-none rounded-md py-1.5 pl-3 pr-3 text-left text-sm font-medium text-teal-700 dark:text-teal-300 [&::-webkit-details-marker]:hidden";
/** 图标 + 文案的 flex 行（作为 summary 的唯一直接子元素） */
const summaryInnerRow = "flex w-full min-w-0 items-center gap-1";

/**
 * 侧栏与文档主区常用底纹（与 docs 根布局一致），
 * 固定 `aside` 与小屏 {@link Drawer} 共用。
 */
const sidebarChromeBg = "bg-slate-50 dark:bg-slate-950";

/** 抽屉内导航：去块间距 */
const drawerNavExtras = {
  nav:
    "min-h-0 w-full flex-1 space-y-0 overflow-y-auto overscroll-y-contain py-0",
  overviewWrap:
    "mb-0 shrink-0 border-b border-slate-200 dark:border-slate-700/90",
  overviewLink: "rounded-none px-4 py-3",
  sectionTitle: "m-0 px-4 py-2",
  ul: "m-0 space-y-0 p-0 pl-0",
  summary: "rounded-none py-2 pl-4 pr-4",
  subUl: "m-0 space-y-0 border-0 p-0 py-0 pl-4",
  leafLink: "rounded-none px-4 py-2.5",
} as const;

/** 导航树（不含 aside），供固定侧栏与抽屉内复用 */
function SidebarNavigation(props: {
  overview?: { path: string; label: string };
  sectionTitle?: string;
  items: ReadonlyArray<SidebarItem>;
  getCurrentPath: () => string;
  accordionGroupName: string;
  /** `drawer`：全宽铺满、无块级间距，用于小屏 {@link Drawer} */
  variant?: "default" | "drawer";
}): JSX.Element {
  const {
    overview,
    sectionTitle,
    items,
    getCurrentPath,
    accordionGroupName,
    variant = "default",
  } = props;

  const pathNorm = getCurrentPath();
  const norm = (p: string) => p.replace(/\/$/, "") || "/";

  const isActiveExact = (path: string) => pathNorm === norm(path);
  const isCategoryActive = (path: string) => {
    const base = norm(path);
    return pathNorm === base || pathNorm.startsWith(base + "/");
  };

  const d = variant === "drawer";

  return (
    <nav
      class={twMerge("space-y-3", d ? drawerNavExtras.nav : "")}
      aria-label="侧栏导航"
    >
      {overview != null && (
        <div class={d ? drawerNavExtras.overviewWrap : "mb-4"}>
          <Link
            href={overview.path}
            class={twMerge(
              pathNorm === norm(overview.path)
                ? overviewActive
                : overviewNormal,
              d ? drawerNavExtras.overviewLink : "",
            )}
          >
            {overview.label}
          </Link>
        </div>
      )}
      {sectionTitle != null && (
        <p
          class={twMerge(
            "px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400",
            d ? drawerNavExtras.sectionTitle : "",
          )}
        >
          {sectionTitle}
        </p>
      )}
      <ul
        class={twMerge(
          "m-0 list-none space-y-1 p-0 pl-3",
          d ? drawerNavExtras.ul : "",
        )}
        role="list"
      >
        {items.map((item) => (
          <li key={item.path} class="min-w-0">
            {item.children != null && item.children.length > 0
              ? (
                <details
                  name={accordionGroupName}
                  class="group min-w-0"
                  open={isCategoryActive(item.path)}
                >
                  <summary
                    class={twMerge(
                      isCategoryActive(item.path)
                        ? categoryBtnActive
                        : categoryBtnNormal,
                      d ? drawerNavExtras.summary : "",
                    )}
                  >
                    <span class={summaryInnerRow}>
                      <span
                        class="shrink-0 w-4 h-4 flex items-center justify-center text-slate-500 transition-transform group-open:rotate-90 dark:text-slate-400"
                        aria-hidden
                      >
                        <IconChevronRight class="w-4 h-4" />
                      </span>
                      <span class="min-w-0 truncate">{item.label}</span>
                    </span>
                  </summary>
                  <ul
                    class={twMerge(
                      "m-0 list-none space-y-0.5 p-0 pl-6 pt-0.5",
                      d ? drawerNavExtras.subUl : "",
                    )}
                    role="list"
                  >
                    {item.children.map((sub) => (
                      <li key={sub.path}>
                        <Link
                          href={sub.path}
                          class={twMerge(
                            isActiveExact(sub.path) ? linkActive : linkNormal,
                            d ? drawerNavExtras.leafLink : "",
                          )}
                        >
                          {sub.label} — {sub.desc}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              )
              : (
                <Link
                  href={item.path}
                  class={twMerge(
                    isActiveExact(item.path) ? linkActive : linkNormal,
                    d ? drawerNavExtras.leafLink : "",
                  )}
                >
                  {item.label}
                </Link>
              )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * 侧栏：概览链接、分组标题、可折叠分类（details）与叶子链接；可选小屏 Drawer。
 */
export function Sidebar(props: SidebarProps): JSX.Element {
  const {
    overview,
    sectionTitle,
    items,
    getCurrentPath = defaultGetCurrentPath,
    class: classProp,
    className: classNameProp,
    accordionGroupName = "dreamer-ui-view-sidebar",
    drawerOpen,
    drawerTitle: drawerTitleProp,
    drawerAccordionGroupName,
  } = props;

  const asideClass = twMerge(
    sidebarChromeBg,
    "w-72 shrink-0 border-r border-slate-100 dark:border-slate-700 py-8 pl-6 pr-4",
    classProp ?? classNameProp,
  );

  const navShared = {
    overview,
    sectionTitle,
    items,
    getCurrentPath,
  };

  if (drawerOpen != null) {
    const drawerTitle = drawerTitleProp ?? overview?.label ?? "导航";
    const drawerGroup = drawerAccordionGroupName ??
      `${accordionGroupName}-drawer`;

    const closeDrawerOnLink = (ev: Event) => {
      const t = ev.target;
      if (t == null || typeof t !== "object") return;
      const el = t as HTMLElement;
      if (el.closest?.("a[href]")) {
        drawerOpen.value = false;
      }
    };

    return (
      <div class="relative h-full min-h-0 w-0 shrink-0 overflow-visible md:w-72 md:shrink-0">
        <aside
          class={twMerge(
            asideClass,
            "hidden h-full min-h-0 overflow-y-auto overscroll-y-contain md:block",
          )}
        >
          <SidebarNavigation
            {...navShared}
            accordionGroupName={accordionGroupName}
          />
        </aside>
        <div class="md:hidden">
          <Drawer
            open={drawerOpen}
            onClose={() => {
              drawerOpen.value = false;
            }}
            placement="left"
            width="calc(100vw - 8rem)"
            title={drawerTitle}
            destroyOnClose
            class={twMerge(
              "rounded-none border-0 shadow-none",
              sidebarChromeBg,
            )}
            titleBarClass="shrink-0 border-slate-200 px-3 py-3 dark:border-slate-700"
            contentClass="min-h-0 flex-1 overflow-hidden p-0"
          >
            <div
              class="flex min-h-0 max-h-full min-w-0 flex-1 flex-col bg-inherit"
              onClick={closeDrawerOnLink}
            >
              <SidebarNavigation
                {...navShared}
                accordionGroupName={drawerGroup}
                variant="drawer"
              />
            </div>
          </Drawer>
        </div>
      </div>
    );
  }

  return (
    <aside class={asideClass}>
      <SidebarNavigation
        {...navShared}
        accordionGroupName={accordionGroupName}
      />
    </aside>
  );
}
