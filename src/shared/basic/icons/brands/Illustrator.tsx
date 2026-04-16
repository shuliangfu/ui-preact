/**
 * Adobe Illustrator 品牌 Logo，24×24。
 * Path 来自 Wikimedia Commons (Adobe Illustrator CC icon.svg)，橙 #FF9A00。
 */
import { Icon } from "../../Icon.tsx";
import type { JSX } from "preact";
import type { IconComponentProps } from "../../Icon.tsx";

const svg = (
  <svg viewBox="0 0 250 250" fill="none" class="w-full h-full" aria-hidden>
    <rect width="250" height="250" rx="42.74" ry="42.74" fill="#300" />
    <path
      fill="#FF9A00"
      d="M122.11,66.15h-37.41l-42.97,115.62h33.48l5.58-17.27h42.98l5.58,17.27h34.5l-41.73-115.62ZM102.27,135.65h-12.17l12.17-37.69,12.17,37.69h-12.17Z"
    />
    <rect x="168.12" y="90.74" width="30.98" height="91.03" fill="#FF9A00" />
    <path
      fill="#FF9A00"
      d="M200.12,74.28c.09,8.49-6.78,14.49-16.5,14.41-9.73.08-16.59-5.92-16.5-14.41-.09-8.49,6.78-14.49,16.5-14.41,9.73-.08,16.59,5.92,16.5,14.41Z"
    />
  </svg>
);

/** Adobe Illustrator 品牌 Logo 图标 */
export function IconBrandIllustrator(
  props?: IconComponentProps,
): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
