/**
 * WiFi 关闭图标，24×24 stroke。
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
    <path d="M1 1l22 22M8.72 4.69a16 16 0 0121.16 0M2 9a16 16 0 012.78 2.16M5 12.55a11 11 0 017.17 4.47M9.53 16.11a6 6 0 012.22-1.22M15 9.34a4 4 0 012.25-1.9M12 20h.01" />
  </svg>
);

export function IconWifiOff(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
