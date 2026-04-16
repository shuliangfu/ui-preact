/**
 * NavBar 顶栏（Preact）。
 * 移动端页面顶部导航：标题、左侧返回/文案、右侧操作；支持固定、安全区、边框。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
/** 按需：单文件图标，避免经 icons/mod 拉入全表 */
import { IconChevronLeft } from "../../shared/basic/icons/ChevronLeft.tsx";

/** NavBar 组件 props */
export interface NavBarProps {
  /** 标题文案 */
  title?: string | null;
  /** 左侧文案（如「返回」）；与 leftArrow 常一起使用 */
  leftText?: string | null;
  /** 右侧文案 */
  rightText?: string | null;
  /** 是否显示左侧箭头图标，默认 false */
  leftArrow?: boolean;
  /** 左侧自定义内容（覆盖 leftText/leftArrow） */
  left?: ComponentChildren;
  /** 右侧自定义内容（覆盖 rightText） */
  right?: ComponentChildren;
  /** 点击左侧 */
  onClickLeft?: () => void;
  /** 点击右侧 */
  onClickRight?: () => void;
  /** 是否禁用左侧按钮（透明度降低、不可点击） */
  leftDisabled?: boolean;
  /** 是否禁用右侧按钮 */
  rightDisabled?: boolean;
  /** 是否固定在顶部，默认 false */
  fixed?: boolean;
  /** 固定时是否在文档流中生成等高的占位，避免内容被遮挡，默认 false */
  placeholder?: boolean;
  /** 是否开启顶部安全区适配（如刘海屏），默认 false */
  safeAreaInsetTop?: boolean;
  /** 是否显示下边框，默认 true */
  border?: boolean;
  /** 自定义 z-index */
  zIndex?: number;
  /** 额外 class */
  class?: string;
}

/**
 * 移动端顶部导航栏。
 *
 * @param props - 标题、左右槽、固定与安全区等
 */
export function NavBar(props: NavBarProps): JSX.Element {
  const {
    title,
    leftText,
    rightText,
    leftArrow = false,
    left: leftSlot,
    right: rightSlot,
    onClickLeft,
    onClickRight,
    leftDisabled = false,
    rightDisabled = false,
    fixed = false,
    placeholder = false,
    safeAreaInsetTop = false,
    border = true,
    zIndex = 1,
    class: className,
  } = props;

  const hasLeft = leftSlot != null || leftText != null || leftArrow;
  const hasRight = rightSlot != null || rightText != null;

  /**
   * 顶栏主体；无内部 signal，直接返回 VNode。
   * 非 `fixed` 时必须 `relative`，否则居中 `h1`（absolute）会相对更外层定位，文档嵌入时标题易飘到视口中部。
   */
  const bar = (
    <div
      class={twMerge(
        "flex items-center justify-between h-12 px-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100",
        safeAreaInsetTop && "pt-safe",
        border && "border-b border-slate-200 dark:border-slate-600",
        fixed ? "fixed left-0 right-0 top-0 z-30" : "relative",
        className,
      )}
      style={fixed ? { zIndex } : undefined}
      role="banner"
    >
      <div class="flex min-w-0 flex-1 items-center justify-start">
        {leftSlot != null
          ? <span class="flex items-center">{leftSlot}</span>
          : hasLeft
          ? (
            <button
              type="button"
              class={twMerge(
                "flex items-center gap-1 py-2 pr-2 text-base font-medium text-blue-600 dark:text-blue-400 active:opacity-80",
                leftDisabled && "opacity-50 cursor-not-allowed",
              )}
              disabled={leftDisabled}
              onClick={() => !leftDisabled && onClickLeft?.()}
              aria-label={leftText ?? "返回"}
            >
              {leftArrow && <IconChevronLeft class="w-5 h-5 shrink-0" />}
              {leftText != null && leftText !== "" && <span>{leftText}</span>}
            </button>
          )
          : null}
      </div>
      <h1 class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-semibold truncate max-w-[50%]">
        {title != null && title !== "" ? title : "\u00A0"}
      </h1>
      <div class="flex min-w-0 flex-1 items-center justify-end">
        {rightSlot != null
          ? <span class="flex items-center">{rightSlot}</span>
          : hasRight
          ? (
            <button
              type="button"
              class={twMerge(
                "py-2 pl-2 text-base font-medium text-blue-600 dark:text-blue-400 active:opacity-80",
                rightDisabled && "opacity-50 cursor-not-allowed",
              )}
              disabled={rightDisabled}
              onClick={() => !rightDisabled && onClickRight?.()}
            >
              {rightText}
            </button>
          )
          : null}
      </div>
    </div>
  );

  if (fixed && placeholder) {
    return (
      <>
        <div
          class={twMerge(
            "h-12",
            safeAreaInsetTop && "pt-safe",
            border && "border-b border-transparent",
          )}
          aria-hidden
        />
        {bar}
      </>
    );
  }
  return bar;
}
