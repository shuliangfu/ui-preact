/**
 * 火焰/Gas 图标，24×24 stroke，用于 Web3 Gas/燃料。
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
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.08-2.08-.5-4 3-4 3.5 0 5 3 5 5.5 0 2.89-2.14 5.5-5 5.5A5.5 5.5 0 018.5 14.5z" />
    <path d="M12 22c4-2 7-5.5 7-10a7 7 0 00-14 0c0 4.5 3 8 7 10z" />
  </svg>
);

export function IconFlame(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
