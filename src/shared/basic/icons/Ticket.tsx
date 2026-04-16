/**
 * 票务/权益图标，24×24 stroke，用于门票/优惠券。
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
    <path d="M2 9a3 3 0 013-3h14a3 3 0 013 3v2a2 2 0 01-2 2 2 2 0 012 2v2a3 3 0 01-3 3H5a3 3 0 01-3-3v-2a2 2 0 012-2 2 2 0 01-2-2V9z" />
    <path d="M8 12h8" />
  </svg>
);

export function IconTicket(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
