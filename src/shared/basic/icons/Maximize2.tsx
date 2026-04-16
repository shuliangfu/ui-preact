/**
 * 全屏/最大化图标，24×24 stroke。
 * 四角向外箭头，与 Tabler Icons 的 arrows-maximize 一致，用于「进入全屏」按钮。
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
    <path d="M16 4l4 0l0 4" />
    <path d="M14 10l6 -6" />
    <path d="M8 20l-4 0l0 -4" />
    <path d="M4 20l6 -6" />
    <path d="M16 20l4 0l0 -4" />
    <path d="M14 14l6 6" />
    <path d="M8 4l-4 0l0 4" />
    <path d="M4 4l6 6" />
  </svg>
);

export function IconMaximize2(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
