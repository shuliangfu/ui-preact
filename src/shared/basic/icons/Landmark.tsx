/**
 * 银行/地标建筑图标，24×24 stroke，用于金融/机构。
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
    <path d="M3 21h18" />
    <path d="M5 21V9l7-4 7 4v12" />
    <path d="M9 21v-6h6v6" />
    <path d="M9 9h.01" />
    <path d="M15 9h.01" />
  </svg>
);

export function IconLandmark(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
