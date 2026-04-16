/**
 * Dropbox 品牌 Logo，24×24，品牌蓝 #0061FF。
 */
import { Icon } from "../../Icon.tsx";
import type { JSX } from "preact";
import type { IconComponentProps } from "../../Icon.tsx";

const svg = (
  <svg viewBox="0 0 24 24" fill="none" class="w-full h-full" aria-hidden>
    <path
      fill="#0061FF"
      d="M6 2L2 5l4 3 4-3-4-3zm12 0l-4 3 4 3 4-3-4-3zM2 13l4 3 4-3-4-3-4 3zm12 0l4 3 4-3-4-3-4 3zm-6 4l4 3 4-3-4-3-4 3z"
    />
  </svg>
);

/** Dropbox 品牌 Logo 图标 */
export function IconBrandDropbox(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
