/**
 * Chainlink (LINK) 代币 Logo，24×24，来源 @web3icons/core (MIT)。
 */
import { Icon } from "../../Icon.tsx";
import type { JSX } from "preact";
import type { IconComponentProps } from "../../Icon.tsx";

const svg = (
  <svg viewBox="0 0 24 24" fill="none" class="w-full h-full" aria-hidden>
    <path
      fill="#2E61DE"
      d="m12 3 7.234 4.333V16.1L10.967 21v-1.235L4.784 16.07l-.017-8.685zm.01 14.98 5.157-3.054v-6.42l-5.166-3.092-5.167 3.132v6.35z"
    />
  </svg>
);

export function IconTokenLink(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
