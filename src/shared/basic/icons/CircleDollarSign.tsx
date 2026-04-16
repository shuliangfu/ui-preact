/**
 * 圆形美元/代币图标，24×24 stroke。Web3/代币场景。
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
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v12" />
    <path d="M15 9.5a3 3 0 0 0-3-3h-1v3" />
    <path d="M9 14.5a3 3 0 0 0 3 3h1v-3" />
  </svg>
);

export function IconCircleDollarSign(
  props?: IconComponentProps,
): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
