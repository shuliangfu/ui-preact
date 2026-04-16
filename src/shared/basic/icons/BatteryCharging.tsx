/**
 * 充电中电池图标，24×24 stroke。
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
    <path d="M5 18H3a2 2 0 01-2-2V8a2 2 0 012-2h3.34M15 6h2a2 2 0 012 2v8a2 2 0 01-2 2h-3.34" />
    <path d="M9 6v12M15 6v12M1 10h4l2-4 2 12 4-8h4" />
  </svg>
);

export function IconBatteryCharging(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
