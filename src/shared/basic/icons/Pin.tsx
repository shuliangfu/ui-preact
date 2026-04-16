/**
 * 图钉/固定图标，24×24 stroke。
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
    <path d="M12 17v5M9 10.76a2 2 0 01-1.11 3.56l-1.39 2.77a2 2 0 01-2.67.83 2 2 0 01-.83-2.67l1.39-2.77a2 2 0 013.56-1.11" />
    <path d="M12 17l-1.5-1.5a2 2 0 01.83-3.27L15 10l3.27.67a2 2 0 013.27-.83 2 2 0 01.83 3.27L17 12l1.5 1.5" />
    <path d="M19 7V4a1 1 0 00-1-1H6a1 1 0 00-1 1v3" />
  </svg>
);

export function IconPin(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
