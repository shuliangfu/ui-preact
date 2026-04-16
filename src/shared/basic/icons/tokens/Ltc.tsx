/**
 * Litecoin (LTC) 代币 Logo，24×24，来源 @web3icons/core (MIT)。
 */
import { Icon } from "../../Icon.tsx";
import type { JSX } from "preact";
import type { IconComponentProps } from "../../Icon.tsx";

const svg = (
  <svg viewBox="0 0 24 24" fill="none" class="w-full h-full" aria-hidden>
    <path
      fill="#345D9D"
      d="m5.734 15.611-1.609.63.776-3.116 1.62-.652L8.86 3h5.772l-1.71 6.975 1.586-.642-.765 3.083-1.598.653-.956 4.074h8.685L18.895 21H4.406z"
    />
  </svg>
);

export function IconTokenLtc(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
