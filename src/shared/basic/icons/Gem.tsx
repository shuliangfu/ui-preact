/**
 * 宝石/NFT 图标，24×24 stroke，用于稀有/收藏。
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
    <path d="M6 3h12l4 6-10 13L2 9l4-6z" />
    <path d="M6 3l6 9 6-9" />
    <path d="M2 9h20" />
  </svg>
);

export function IconGem(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
