/**
 * 笔记本/笔记图标，24×24 stroke，用于学习/记录。
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
    <path d="M12 2v4" />
    <path d="M4 6v14a2 2 0 002 2h12a2 2 0 002-2V6" />
    <path d="M4 6h16" />
    <path d="M15 12l2 2 4-4" />
  </svg>
);

export function IconNotebookPen(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
