/**
 * Solana (SOL) 代币 Logo，24×24，来源 @web3icons/core (MIT)，品牌色三栏。
 */
import { Icon } from "../../Icon.tsx";
import type { JSX } from "preact";
import type { IconComponentProps } from "../../Icon.tsx";

const svg = (
  <svg viewBox="0 0 24 24" fill="none" class="w-full h-full" aria-hidden>
    <path
      fill="#00D4AA"
      d="M18.413 7.903a.62.62 0 0 1-.411.164H3.58c-.512 0-.77-.585-.416-.929l2.368-2.283a.6.6 0 0 1 .41-.169h14.479c.517 0 .77.59.41.934z"
    />
    <path
      fill="#9945FF"
      d="M18.413 19.157a.6.6 0 0 1-.411.157H3.58c-.512 0-.77-.58-.416-.923l2.368-2.289a.6.6 0 0 1 .41-.163h14.479c.517 0 .77.585.41.928z"
    />
    <path
      fill="#14F195"
      d="M18.413 10.472a.6.6 0 0 0-.411-.158H3.58c-.512 0-.77.58-.416.922l2.368 2.29a.62.62 0 0 0 .41.163h14.479c.517 0 .77-.585.41-.928z"
    />
  </svg>
);

export function IconTokenSol(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
