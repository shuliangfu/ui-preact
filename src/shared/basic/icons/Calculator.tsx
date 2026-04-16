/**
 * 计算器图标，24×24 stroke，用于金融/工具。
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
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 6h8" />
    <path d="M8 10h1" />
    <path d="M11 10h1" />
    <path d="M14 10h1" />
    <path d="M8 14h1" />
    <path d="M11 14h1" />
    <path d="M14 14h1" />
    <path d="M8 18h1" />
    <path d="M11 18h1" />
    <path d="M14 18h1" />
  </svg>
);

export function IconCalculator(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
