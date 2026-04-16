/**
 * 火车/铁路图标，24×24 stroke，用于出行。
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
    <rect x="4" y="4" width="16" height="12" rx="2" />
    <path d="M4 12h16" />
    <path d="M4 8h16" />
    <path d="M8 16h.01" />
    <path d="M16 16h.01" />
  </svg>
);

export function IconTrain(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
