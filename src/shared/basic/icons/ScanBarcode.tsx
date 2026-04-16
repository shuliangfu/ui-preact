/**
 * 扫码/条形码图标，24×24 stroke。扫码购/查验场景。
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
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <path d="M7 8h1" />
    <path d="M7 12h1" />
    <path d="M7 16h1" />
    <path d="M10 8h1" />
    <path d="M10 12h1" />
    <path d="M10 16h1" />
    <path d="M13 8h1" />
    <path d="M13 12h1" />
    <path d="M13 16h1" />
    <path d="M16 8h1" />
    <path d="M16 12h1" />
    <path d="M16 16h1" />
  </svg>
);

export function IconScanBarcode(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
