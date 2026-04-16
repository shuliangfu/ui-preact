/**
 * 回复图标，24×24 stroke。
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
    <path d="M9 10L4 15l5 5" />
    <path d="M20 4v7a4 4 0 01-4 4H4" />
  </svg>
);

export function IconReply(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
