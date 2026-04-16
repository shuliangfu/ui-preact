/**
 * 右下箭头图标，24×24 stroke。
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
    <path d="M7 7l10 10M17 7v6h-6" />
  </svg>
);

export function IconArrowDownRight(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
