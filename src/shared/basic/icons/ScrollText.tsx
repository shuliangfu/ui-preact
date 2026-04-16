/**
 * 卷轴/长文档图标，24×24 stroke，用于合同/文档。
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
    <path d="M8 2h8v4H8V2z" />
    <path d="M6 6h12v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6z" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
  </svg>
);

export function IconScrollText(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
