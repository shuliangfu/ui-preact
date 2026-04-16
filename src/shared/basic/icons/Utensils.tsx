/**
 * 餐具/餐饮图标，24×24 stroke，用于餐饮/生活。
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
    <path d="M3 2v7h3V2z" />
    <path d="M8 2v20" />
    <path d="M12 2v20" />
    <path d="M17 2v7h3V2z" />
    <path d="M8 14h4" />
  </svg>
);

export function IconUtensils(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
