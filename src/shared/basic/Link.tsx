/**
 * Link 链接组件（Preact）。
 * 基于 <a>，Tailwind v4 + light/dark 主题。
 * `button` 为 true 时使用与 {@link Button} 相同的尺寸/语义配色（`variant` / `size`），外观为链接按钮。
 * 文字链默认无下划线；`underline` 为 true 时在鼠标悬停时显示下划线。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import type { ColorVariant, SizeVariant } from "../types.ts";
import {
  BUTTON_SIZE_CLASSES,
  BUTTON_STANDALONE_INTERACTIVE_BASE,
  BUTTON_VARIANT_CLASSES,
} from "./button-variants.ts";

export interface LinkProps {
  href: string;
  /** 额外 class（View 下用 class，React 风格 JSX 下用 className） */
  class?: string;
  className?: string;
  /** 是否新窗口打开 */
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
  /** 悬停提示（对应原生 title） */
  title?: string;
  /** 无障碍标签（对应原生 aria-label） */
  "aria-label"?: string;
  /**
   * 为 true 时渲染为链接按钮样式（仍使用 `<a href>`），与 {@link Button} 共用 `variant` / `size` 定义。
   * 为 false 或未传时保持默认文字链接；此时传入的 `variant` / `size` 不参与合并。
   */
  button?: boolean;
  /** 链接按钮语义配色；仅 `button === true` 时生效，默认 `primary` */
  variant?: ColorVariant;
  /** 链接按钮尺寸；仅 `button === true` 时生效，默认 `md` */
  size?: SizeVariant;
  /**
   * 链接按钮禁用态（`<a>` 无原生 disabled）；阻止导航并合并禁用样式。
   * 仅建议在 `button === true` 时使用。
   */
  disabled?: boolean;
  /**
   * 为 true 时鼠标悬停显示下划线；默认 false（常态与悬停均无下划线）。
   */
  underline?: boolean;
  onClick?: (e: Event) => void;
  /** 子内容（图标 + 文案等可包在单个 span 内） */
  children?: ComponentChildren;
}

/** 默认文字链接：蓝字、焦点环（悬停下划线由 {@link LinkProps.underline} 控制） */
const textLinkColorClasses =
  "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded";

/** `<a>` 禁用态（无 `disabled` 属性时的视觉与交互，与 Button 禁用观感一致） */
const anchorDisabledClasses =
  "opacity-40 grayscale pointer-events-none cursor-not-allowed";

export function Link(props: LinkProps): JSX.Element {
  const {
    href,
    class: classProp,
    className: classNameProp,
    target,
    rel = target === "_blank" ? "noopener noreferrer" : undefined,
    title,
    "aria-label": ariaLabel,
    button = false,
    variant: variantProp,
    size: sizeProp,
    disabled = false,
    underline = false,
    onClick,
    children,
  } = props;

  const className = classProp ?? classNameProp;
  const isLinkButton = button === true;
  const variant: ColorVariant = variantProp ?? "primary";
  const size: SizeVariant = sizeProp ?? "md";

  /** 下划线：`underline === true` 时仅 `hover` 显示；否则常态与悬停均无 */
  const underlineClasses = underline
    ? "no-underline hover:underline"
    : "no-underline hover:no-underline";

  /**
   * 链接按钮：与 Button 同源类名；禁用态用 aria + tabindex + 合并类，避免误点导航。
   */
  const mergedClass = isLinkButton
    ? twMerge(
      BUTTON_STANDALONE_INTERACTIVE_BASE,
      underlineClasses,
      BUTTON_SIZE_CLASSES[size],
      BUTTON_VARIANT_CLASSES[variant],
      disabled ? anchorDisabledClasses : "",
      className,
    )
    : twMerge(textLinkColorClasses, underlineClasses, className);

  /**
   * 禁用时拦截默认导航；再调用用户 onClick（若需完全禁止可在外层判断 disabled）。
   */
  const handleClick = (e: Event) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <a
      href={href}
      class={mergedClass}
      target={target}
      rel={rel}
      title={title}
      aria-label={ariaLabel}
      aria-disabled={disabled ? "true" : undefined}
      tabIndex={disabled ? -1 : undefined}
      data-variant={isLinkButton ? variant : undefined}
      data-size={isLinkButton ? size : undefined}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
