/**
 * 天平/公正图标，24×24 stroke，用于合规/法律。
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
    <path d="M12 3v18" />
    <path d="M5 9l7 3 7-3" />
    <path d="M5 15l7 3 7-3" />
    <path d="M12 3l-3 6 3 6 3-6-3-6z" />
  </svg>
);

export function IconScale(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
