/**
 * GitLab 品牌 Logo，24×24，品牌橙 #FC6D26。
 */
import { Icon } from "../../Icon.tsx";
import type { JSX } from "preact";
import type { IconComponentProps } from "../../Icon.tsx";

const svg = (
  <svg viewBox="0 0 24 24" fill="none" class="w-full h-full" aria-hidden>
    <path
      fill="#FC6D26"
      d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 00-.867 0L16.418 9.45H7.582L4.919 1.263C4.783.84 4.252.84 4.116 1.263L2.772 5.398.439 13.587a.924.924 0 00.331 1.023L12 23.054l11.23-8.444a.92.92 0 00.33-1.023"
    />
  </svg>
);

/** GitLab 品牌 Logo 图标 */
export function IconBrandGitlab(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
