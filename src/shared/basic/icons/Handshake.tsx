/**
 * 握手/协作图标，24×24 stroke，用于合作/协议。
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
    <path d="M11 12h2" />
    <path d="M9 10v4l2-2 2 2v-4" />
    <path d="M12 8V6a2 2 0 00-2-2H8a2 2 0 00-2 2v4a2 2 0 002 2h2" />
    <path d="M12 8h4a2 2 0 012 2v2a2 2 0 01-2 2h-2" />
  </svg>
);

export function IconHandshake(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
