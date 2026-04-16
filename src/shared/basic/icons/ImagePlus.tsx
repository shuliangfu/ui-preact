/**
 * 图片加/铸造/NFT 图标，24×24 stroke，用于上传或 NFT 铸造。
 */
import { Icon } from "../Icon.tsx";
import type { JSX } from "preact";
import type { IconComponentProps } from "../Icon.tsx";

const svg = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="w-full h-full"
    aria-hidden
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <path d="M12 8v8" />
    <path d="M8 12h8" />
  </svg>
);

export function IconImagePlus(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
