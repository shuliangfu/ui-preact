/**
 * Fantom (FTM) 代币 Logo，24×24，来源 @web3icons/core (MIT)。
 */
import { Icon } from "../../Icon.tsx";
import type { JSX } from "preact";
import type { IconComponentProps } from "../../Icon.tsx";

const svg = (
  <svg viewBox="0 0 24 24" fill="none" class="w-full h-full" aria-hidden>
    <path
      fill="#26B6EA"
      d="M11.969 3 6.6 6.047v11.816L11.97 21l5.431-3.137V6.047zm.03.9L7.95 6.33 12 8.692l4.05-2.362zM7.5 7.05v4.05l3.6-2.016zm4.95 2.925v4.05l3.6-2.016zM16.5 7.05v4.05l-3.6-2.016zm-4.95 2.925v4.05l-3.6-2.016zM7.5 12.702V17.4l4.5 2.7 4.5-2.7v-4.698L12 15.15z"
      fill-rule="evenodd"
      clip-rule="evenodd"
    />
    <path
      fill="#26B6EA"
      d="M4.35 18.836V16.05h.9v2.34l2.25 1.161v1zm15.3-13.671V7.95h-.9V5.61L16.5 4.45v-1z"
    />
  </svg>
);

export function IconTokenFtm(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
