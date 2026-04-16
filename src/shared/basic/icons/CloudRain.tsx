/**
 * 雨天/云雨图标，24×24 stroke，用于天气。
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
    <path d="M18 10h-2.5a4.5 4.5 0 11-4.5-4.5V4a6 6 0 016 6z" />
    <path d="M8 14v4" />
    <path d="M12 18v4" />
    <path d="M16 14v4" />
  </svg>
);

export function IconCloudRain(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
