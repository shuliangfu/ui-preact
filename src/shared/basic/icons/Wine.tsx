/**
 * 酒杯/酒类图标，24×24 stroke，用于餐饮/生活。
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
    <path d="M8 2h8v6c0 3.3-2.7 6-6 6s-6-2.7-6-6V2z" />
    <path d="M12 14v8" />
    <path d="M8 22h8" />
  </svg>
);

export function IconWine(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
