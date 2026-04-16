/**
 * Binance 币安品牌 Logo，24×24，品牌金 #F3BA2F。
 */
import { Icon } from "../../Icon.tsx";
import type { JSX } from "preact";
import type { IconComponentProps } from "../../Icon.tsx";

const svg = (
  <svg viewBox="0 0 24 24" fill="none" class="w-full h-full" aria-hidden>
    <path
      fill="#F3BA2F"
      d="M12 0L7.5 4.5 12 9l4.5-4.5L12 0zM4.5 7.5L0 12l4.5 4.5L9 12 4.5 7.5zm15 0L15 12l4.5 4.5L24 12l-4.5-4.5zM12 15l-4.5 4.5L12 24l4.5-4.5L12 15zm0-3l2.5-2.5L12 7 9.5 9.5 12 12z"
    />
  </svg>
);

/** Binance 币安品牌 Logo 图标 */
export function IconBrandBinance(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
