/**
 * 水平滑块/筛选图标，24×24 stroke。门户筛选场景。
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
    <line x1="5" x2="19" y1="12" y2="12" />
    <line x1="5" x2="19" y1="6" y2="6" />
    <line x1="5" x2="19" y1="18" y2="18" />
  </svg>
);

export function IconSlidersHorizontal(
  props?: IconComponentProps,
): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
