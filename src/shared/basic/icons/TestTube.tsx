/**
 * 试管/测试图标，24×24 stroke，用于开发/测试。
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
    <path d="M9 2v4" />
    <path d="M9 6h6v14a2 2 0 01-2 2H9a2 2 0 01-2-2V6z" />
    <path d="M15 6V2" />
  </svg>
);

export function IconTestTube(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
