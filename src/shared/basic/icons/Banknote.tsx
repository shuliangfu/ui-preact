/**
 * 纸币图标，24×24 stroke，用于金融/支付场景。
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
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M12 10v4" />
    <path d="M8 12h8" />
  </svg>
);

export function IconBanknote(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
