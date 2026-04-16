/**
 * Adobe Acrobat 品牌 Logo，24×24。
 * 红底 #EE1F24 + 白色 “A”，与官方 Acrobat 图标一致（Commons 同款圆角矩形 + 字母）。
 */
import { Icon } from "../../Icon.tsx";
import type { JSX } from "preact";
import type { IconComponentProps } from "../../Icon.tsx";

const svg = (
  <svg viewBox="0 0 240 234" fill="none" class="w-full h-full" aria-hidden>
    <path
      fill="#EE1F24"
      d="M42.5,0h155C221,0,240,19,240,42.5v149c0,23.5-19,42.5-42.5,42.5h-155C19,234,0,215,0,191.5v-149C0,19,19,0,42.5,0z"
    />
    {/* 白色 “A”：左斜杠、右斜杠、横杠 */}
    <path
      fill="#fff"
      d="M120 62v12l-42 86h18l8-20h48l8 20h18L138 74h-6v38h-14V62h2zm-6 54l18-44 18 44h-36z"
    />
  </svg>
);

/** Adobe Acrobat 品牌 Logo 图标 */
export function IconBrandAcrobat(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
