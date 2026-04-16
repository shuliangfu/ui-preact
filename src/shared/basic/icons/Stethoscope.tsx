/**
 * 听诊器/医疗图标，24×24 stroke，用于健康/医疗场景。
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
    <path d="M11 2v2" />
    <path d="M5 2v2" />
    <path d="M5 4h6v4a6 6 0 01-6 6v0a6 6 0 016-6V4h2v4a6 6 0 016 6v0a6 6 0 01-6-6V4h1" />
    <circle cx="16" cy="16" r="4" />
  </svg>
);

export function IconStethoscope(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
