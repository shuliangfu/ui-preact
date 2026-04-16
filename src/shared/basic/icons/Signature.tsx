/**
 * 签名图标，24×24 stroke，用于签署/合同。
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
    <path d="M3 17c2.5-2.5 5-4 8-4 2 0 4 1 6 2" />
    <path d="M9 14l6-6" />
    <path d="M15 8l3 3-6 6-4 1 1-4 6-6z" />
  </svg>
);

export function IconSignature(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
