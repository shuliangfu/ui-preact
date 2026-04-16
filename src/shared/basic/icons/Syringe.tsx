/**
 * 注射器/医疗图标，24×24 stroke，用于医疗/疫苗。
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
    <path d="M18 2v4l-4 4 4 4v4" />
    <path d="M14 10l-4 4-4-4 4-4 4 4z" />
    <path d="M10 14l4-4" />
  </svg>
);

export function IconSyringe(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
