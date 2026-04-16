/**
 * 花括号/代码块图标，24×24 stroke，用于智能合约/代码。
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
    <path d="M8 3H7a2 2 0 00-2 2v4a2 2 0 01-2 2 2 2 0 012 2v4a2 2 0 002 2h1" />
    <path d="M16 21h1a2 2 0 002-2v-4a2 2 0 012-2 2 2 0 01-2 2V7a2 2 0 00-2-2h-1" />
  </svg>
);

export function IconBraces(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
