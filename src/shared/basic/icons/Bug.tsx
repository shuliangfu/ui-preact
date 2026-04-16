/**
 * 虫子/调试图标，24×24 stroke，用于开发/调试。
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
    <path d="M8 2h8v4H8V2z" />
    <path d="M12 6v4" />
    <path d="M4 10h16" />
    <path d="M6 10v8a2 2 0 002 2h8a2 2 0 002-2v-8" />
    <path d="M10 14h4" />
    <path d="M9 18h6" />
  </svg>
);

export function IconBug(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
