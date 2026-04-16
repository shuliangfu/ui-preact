/**
 * 已打开邮件图标，24×24 stroke。
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
    <path d="M2 8.5V19a2 2 0 002 2h16a2 2 0 002-2V8.5" />
    <path d="M22 8.5l-10-6-10 6" />
    <path d="M2 8.5l10 6 10-6" />
  </svg>
);

export function IconMailOpen(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
