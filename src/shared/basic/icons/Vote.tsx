/**
 * 投票/治理图标，24×24 stroke。Web3 治理/社区场景。
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
    <path d="m9 12 2 2 4-4" />
    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Z" />
    <path d="M12 3v2" />
    <path d="M12 19v2" />
    <path d="m3 12 2 0" />
    <path d="m19 12 2 0" />
    <path d="m5.64 5.64 1.42 1.42" />
    <path d="m16.94 16.94 1.42 1.42" />
    <path d="m5.64 18.36 1.42-1.42" />
    <path d="m16.94 7.06 1.42-1.42" />
  </svg>
);

export function IconVote(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
