/**
 * 加载/旋转图标，24×24 stroke，用于加载状态。
 * 矢量与 Lucide「Loader2」一致；本库导出为 {@link IconLoader}（无单独 Loader 图标，故不用 Loader2 命名）。
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
    class="w-full h-full animate-spin"
    aria-hidden
  >
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M4.93 4.93l2.83 2.83" />
    <path d="M16.24 16.24l2.83 2.83" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M4.93 19.07l2.83-2.83" />
    <path d="M16.24 7.76l2.83-2.83" />
  </svg>
);

export function IconLoader(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}

/** 旧名兼容：与 Lucide 文件名 Loader2 对齐时的导入习惯 */
export { IconLoader as IconLoader2 };
