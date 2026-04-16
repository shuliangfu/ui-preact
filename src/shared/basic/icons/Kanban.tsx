/**
 * 看板/卡片墙图标，24×24 stroke，用于办公/协作。
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
    <path d="M6 4v16" />
    <path d="M12 8v12" />
    <path d="M18 2v20" />
    <rect x="4" y="2" width="4" height="6" rx="1" />
    <rect x="10" y="6" width="4" height="8" rx="1" />
    <rect x="16" y="4" width="4" height="10" rx="1" />
  </svg>
);

export function IconKanban(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
