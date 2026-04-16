/**
 * Netflix 品牌 Logo，24×24，来源 Simple Icons，品牌红 #E50914。
 */
import { Icon } from "../../Icon.tsx";
import type { JSX } from "preact";
import type { IconComponentProps } from "../../Icon.tsx";

const svg = (
  <svg viewBox="0 0 24 24" fill="none" class="w-full h-full" aria-hidden>
    <path
      fill="#E50914"
      d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z"
    />
  </svg>
);

/** Netflix 品牌 Logo 图标 */
export function IconBrandNetflix(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
