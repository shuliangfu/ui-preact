/**
 * 停车场/P 图标，24×24 stroke，用于停车/地图。
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
    <circle cx="12" cy="12" r="10" />
    <path d="M9 8h4a2 2 0 012 2v4a2 2 0 01-2 2H9V8z" />
    <path d="M9 12h4" />
  </svg>
);

export function IconParkingCircle(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
