/**
 * Algorand (ALGO) 代币 Logo，24×24，来源 @web3icons/core (MIT)。
 */
import { Icon } from "../../Icon.tsx";
import type { JSX } from "preact";
import type { IconComponentProps } from "../../Icon.tsx";

const svg = (
  <svg viewBox="0 0 24 24" fill="none" class="w-full h-full" aria-hidden>
    <path
      fill="#fff"
      d="m6.142 21 8.221-14.227.99 3.683L9.268 21h3.115l3.953-6.844L18.181 21h2.792l-2.729-10.166L20.18 7.2h-2.836L16.138 3h-2.72L3.028 21z"
    />
  </svg>
);

export function IconTokenAlgo(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
