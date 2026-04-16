/**
 * Figma 品牌 Logo，24×24。
 * Path 与色值来自 Wikimedia Commons (Figma-logo.svg)，与官方多色 F 一致。
 */
import { Icon } from "../../Icon.tsx";
import type { JSX } from "preact";
import type { IconComponentProps } from "../../Icon.tsx";

const svg = (
  <svg viewBox="0 0 200 300" fill="none" class="w-full h-full" aria-hidden>
    <path
      fill="#0ACF83"
      d="M50 300c27.6 0 50-22.4 50-50v-50H50c-27.6 0-50 22.4-50 50s22.4 50 50 50z"
    />
    <path
      fill="#A259FF"
      d="M0 150c0-27.6 22.4-50 50-50h50v100H50c-27.6 0-50-22.4-50-50z"
    />
    <path
      fill="#F24E1E"
      d="M0 50C0 22.4 22.4 0 50 0h50v100H50C22.4 100 0 77.6 0 50z"
    />
    <path
      fill="#FF7262"
      d="M100 0h50c27.6 0 50 22.4 50 50s-22.4 50-50 50h-50V0z"
    />
    <path
      fill="#1ABCFE"
      d="M200 150c0 27.6-22.4 50-50 50s-50-22.4-50-50 22.4-50 50-50 50 22.4 50 50z"
    />
  </svg>
);

/** Figma 品牌 Logo 图标 */
export function IconBrandFigma(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
