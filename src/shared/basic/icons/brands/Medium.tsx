/**
 * Medium 品牌 Logo，24×24，官方三圆重叠造型（左圆 + 中椭圆 + 右椭圆），currentColor。
 * 参考：Medium 官方 / Wikipedia Medium icon，viewBox 保持原始比例后居中缩放。
 */
import { Icon } from "../../Icon.tsx";
import type { JSX } from "preact";
import type { IconComponentProps } from "../../Icon.tsx";

const svg = (
  <svg
    viewBox="0 0 1770 1000"
    fill="currentColor"
    class="w-full h-full"
    aria-hidden
    preserveAspectRatio="xMidYMid meet"
  >
    <circle cx="500" cy="500" r="500" />
    <ellipse cx="1296" cy="501" rx="250" ry="475" />
    <ellipse cx="1682" cy="502" rx="88" ry="424" />
  </svg>
);

/** Medium 品牌 Logo 图标 */
export function IconBrandMedium(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
