/**
 * Vercel 品牌 Logo，24×24，黑白三角。
 */
import { Icon } from "../../Icon.tsx";
import type { JSX } from "preact";
import type { IconComponentProps } from "../../Icon.tsx";

const svg = (
  <svg viewBox="0 0 24 24" fill="none" class="w-full h-full" aria-hidden>
    <path
      fill="currentColor"
      d="M12 1L2 21h20L12 1zm0 4.5L18.5 19h-13L12 5.5z"
    />
  </svg>
);

/** Vercel 品牌 Logo 图标 */
export function IconBrandVercel(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
