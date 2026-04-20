/**
 * 正圆 **竖直对分**（左/右各半圆）：左半固定深黑、右半纯白，与 {@link IconSun}、{@link IconMoon} 并列作「自动/系统」主题。
 * 与 `@dreamer/ui-view` 的 IconCircleSplit 矢量一致。
 */
import { Icon } from "../Icon.tsx";
import type { JSX } from "preact";
import type { IconComponentProps } from "../Icon.tsx";

/** 24×24：圆心 (12,12)，半径 9 */
const svg = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    class="w-full h-full"
    aria-hidden
  >
    <path
      d="M12 3 A 9 9 0 0 0 12 21 Z"
      fill="#171717"
    />
    <path
      d="M12 3 A 9 9 0 0 1 12 21 Z"
      fill="#ffffff"
    />
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      stroke-width="1"
      fill="none"
    />
  </svg>
);

/**
 * 圆竖直对分（左黑右白），多用于主题「自动」。
 *
 * @param props - `size`、`class`
 */
export function IconCircleSplit(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
