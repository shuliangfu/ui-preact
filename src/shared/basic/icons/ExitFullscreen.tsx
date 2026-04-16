/**
 * 退出全屏图标，24×24 stroke。
 * 四角向内箭头，与 Tabler Icons 的 arrows-minimize 一致，用于「退出全屏」按钮。
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
    <path d="M5 9l4 0l0 -4" />
    <path d="M3 3l6 6" />
    <path d="M5 15l4 0l0 4" />
    <path d="M3 21l6 -6" />
    <path d="M19 9l-4 0l0 -4" />
    <path d="M15 9l6 -6" />
    <path d="M19 15l-4 0l0 4" />
    <path d="M15 15l6 6" />
  </svg>
);

export function IconExitFullscreen(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
