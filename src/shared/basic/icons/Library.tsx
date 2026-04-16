/**
 * 图书馆/资料库图标，24×24 stroke，用于教育/资源。
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
    <path d="M4 19v-2h16v2" />
    <path d="M4 15V9h16v6" />
    <path d="M4 5V3h16v2" />
    <path d="M6 7h2v4H6zM10 7h2v4h-2zM14 7h2v4h-2z" />
  </svg>
);

export function IconLibrary(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
