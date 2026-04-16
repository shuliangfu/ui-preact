/**
 * 用户齿轮/账户设置图标，24×24 stroke。门户设置场景。
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
    <circle cx="12" cy="8" r="4" />
    <path d="M12 14c-4 0-6 2-6 4v2h12v-2c0-2-2-4-6-4Z" />
    <circle cx="18" cy="18" r="3" />
    <path d="M18 16v1" />
    <path d="M18 20v1" />
    <path d="M16.5 18h-1" />
    <path d="M19.5 18h-1" />
  </svg>
);

export function IconUserCog(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
