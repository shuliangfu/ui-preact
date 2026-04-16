/**
 * NavBar 顶栏导航（Preact，桌面/通用）。
 * 用于页面顶部：左侧品牌、中间/右侧导航链接、右侧操作区；支持 sticky、边框、毛玻璃。
 * 内部使用 Container 控制最大宽度，适合与 Link、Divider、图标等组合。
 * 布局与 ui-view 文档站所用 NavBar 一致：`flex` + 可选 `center` 绝对居中层。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { Container } from "../../shared/layout/Container.tsx";
import type { ContainerSize } from "../../shared/layout/Container.tsx";

export interface NavBarProps {
  /**
   * 顶栏最左侧区域（如小屏「打开侧栏」按钮），位于 `brand` 与 `nav` 之前。
   * 文档站可与 {@link Sidebar} 的 `drawerOpen` 联动。
   */
  start?: ComponentChildren;
  /**
   * 相对整条顶栏（内层 Container）水平、垂直居中；默认仅 `md` 以下显示。
   * 用于小屏左侧有菜单钮时仍把品牌放在视觉中心；`md+` 请在 `brand` / `nav` 内自行放置并通常配 `hidden md:flex` 避免重复。
   */
  center?: ComponentChildren;
  /**
   * 与 `center` 配合：纯 `left:50%` + `-translate-x-1/2` 在左右不对称（右侧常有更多链接/图标）时徽标会显偏右；
   * 传入 CSS 长度作额外左移：`translate(calc(-50% - nudge), -50%)`。左侧 `w-10` 钮可先试 `2.5rem`～`3rem` 按视觉微调。
   */
  centerNudgeX?: string;
  /** 左侧品牌区（如 logo + 名称） */
  brand?: ComponentChildren;
  /** 导航区（主链接、可选 Divider + 控件） */
  nav?: ComponentChildren;
  /** 菜单对齐方式：左 / 中 / 右，默认 "right" */
  menuAlign?: "left" | "center" | "right";
  /** 右侧操作区（如主题切换、外链图标） */
  end?: ComponentChildren;
  /** 内层容器最大宽度，默认 "xl" */
  containerMaxWidth?: ContainerSize;
  /** 是否粘性顶栏，默认 true */
  sticky?: boolean;
  /** 是否显示下边框，默认 true */
  border?: boolean;
  /** 是否毛玻璃背景，默认 true */
  blur?: boolean;
  /** 额外 class（应用在 <header> 上） */
  class?: string;
  /** 内层容器额外 class（应用在 Container 内的 flex 容器上） */
  containerClass?: string;
}

const defaultHeaderClass =
  "z-50 border-slate-200 bg-white/98 dark:border-slate-700/80 dark:bg-slate-900/98 shadow-sm shadow-slate-200/50 dark:shadow-slate-950/50 backdrop-blur-md";
/** 小屏收紧间距；`relative` 供可选 {@link NavBarProps.center} 绝对定位居中层 */
const defaultContainerInnerClass =
  "relative flex h-16 w-full items-center justify-between gap-2 sm:gap-4 lg:gap-6";

/**
 * 顶栏导航组件。渲染语义化 <header>，内层为 Container + 多区布局：start | center（可选）| brand | nav | end。
 *
 * @param props - 各槽位与容器样式
 */
export function NavBar(props: NavBarProps): JSX.Element {
  const {
    start,
    center,
    centerNudgeX,
    brand,
    nav,
    menuAlign = "right",
    end,
    containerMaxWidth = "xl",
    sticky = true,
    border = true,
    blur = true,
    class: className,
    containerClass,
  } = props;

  const menuJustifyClass = menuAlign === "center"
    ? "justify-center"
    : menuAlign === "right"
    ? "justify-end"
    : "justify-start";

  const headerClass = twMerge(
    "border-b",
    border && "border-slate-200 dark:border-slate-700/80",
    sticky && "sticky top-0",
    blur && defaultHeaderClass,
    className,
  );

  const innerClass = twMerge(defaultContainerInnerClass, containerClass);

  return (
    <header class={headerClass} role="banner">
      <Container maxWidth={containerMaxWidth} class={innerClass}>
        {start != null && (
          <div class="relative z-[2] flex shrink-0 items-center">{start}</div>
        )}
        {center != null && (
          <div class="pointer-events-none absolute inset-x-0 top-0 bottom-0 z-[1] md:hidden">
            <div
              class={twMerge(
                "pointer-events-auto absolute left-1/2 top-1/2",
                centerNudgeX == null || centerNudgeX === ""
                  ? "-translate-x-1/2 -translate-y-1/2"
                  : "",
              )}
              style={centerNudgeX != null && centerNudgeX !== ""
                ? {
                  transform: `translate(calc(-50% - ${centerNudgeX}), -50%)`,
                }
                : undefined}
            >
              {center}
            </div>
          </div>
        )}
        {brand != null && <div class="flex shrink-0 items-center">{brand}</div>}
        {nav != null && (
          <nav
            class={twMerge(
              "flex flex-1 min-w-0 items-center gap-1",
              menuJustifyClass,
            )}
            aria-label="主导航"
          >
            {nav}
          </nav>
        )}
        {end != null && (
          <div class="relative z-[2] flex shrink-0 items-center gap-1">
            {end}
          </div>
        )}
      </Container>
    </header>
  );
}
