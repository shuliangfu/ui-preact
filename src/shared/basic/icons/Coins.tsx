/**
 * 硬币/金币图标，24×24 stroke，用于金融/代币场景。
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
    <circle cx="8" cy="8" r="4" />
    <circle cx="16" cy="12" r="4" />
    <path d="M8 12v4a4 4 0 004 4h4" />
  </svg>
);

export function IconCoins(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
