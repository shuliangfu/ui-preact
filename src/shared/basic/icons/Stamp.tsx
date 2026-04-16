/**
 * 盖章/印章图标，24×24 stroke，用于政府/合同。
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
    <path d="M5 22h14" />
    <rect x="4" y="4" width="16" height="12" rx="1" />
    <path d="M8 10h8" />
    <path d="M8 14h4" />
  </svg>
);

export function IconStamp(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
