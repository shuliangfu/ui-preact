/**
 * 收据/发票图标，24×24 stroke，用于订单/支付凭证。
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
    <path d="M4 2v20l2-2 2 2 2-2 2 2 2-2 2 2 2-2V2l-2 2-2-2-2 2-2-2-2 2-2-2z" />
    <path d="M8 6h8" />
    <path d="M8 10h8" />
    <path d="M8 14h5" />
  </svg>
);

export function IconReceipt(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
