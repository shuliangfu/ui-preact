/**
 * 雪花/雪天图标，24×24 stroke，用于天气。
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
    <path d="M12 2v20" />
    <path d="M12 2l3 3-3 3-3-3 3-3z" />
    <path d="M12 22l3-3-3-3-3 3 3 3z" />
    <path d="M2 12h20" />
    <path d="M2 12l3 3 3-3-3-3-3 3z" />
    <path d="M22 12l-3 3 3 3 3-3z" />
    <path d="M4.93 4.93l14.14 14.14" />
    <path d="M4.93 19.07l14.14-14.14" />
  </svg>
);

export function IconSnowflake(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
