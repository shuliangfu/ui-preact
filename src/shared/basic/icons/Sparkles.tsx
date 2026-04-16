/**
 * 闪光/稀有/NFT 图标，24×24 stroke，用于精选/特效。
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
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    <path d="M5 17l1.5 2.5L9 17l-2.5 1.5L5 21l-1.5-2.5L1 17l2.5-1.5L5 17z" />
    <path d="M19 17l1.5 2.5L23 17l-2.5 1.5L19 21l-1.5-2.5L15 17l2.5-1.5L19 17z" />
  </svg>
);

export function IconSparkles(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
