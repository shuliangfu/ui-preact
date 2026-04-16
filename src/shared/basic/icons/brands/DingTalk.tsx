/**
 * 钉钉 DingTalk 品牌 Logo，24×24，来源 Iconify (Tabler brand-dingtalk)，品牌蓝 #0086F6。
 */
import { Icon } from "../../Icon.tsx";
import type { JSX } from "preact";
import type { IconComponentProps } from "../../Icon.tsx";

const svg = (
  <svg viewBox="0 0 24 24" fill="none" class="w-full h-full" aria-hidden>
    <path
      stroke="#0086F6"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0"
    />
    <path
      stroke="#0086F6"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="m8 7.5l7.02 2.632a1 1 0 0 1 .567 1.33L14.5 14H16l-5 4l1-4c-3.1.03-3.114-3.139-4-6.5"
    />
  </svg>
);

/** 钉钉品牌 Logo 图标 */
export function IconBrandDingtalk(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
