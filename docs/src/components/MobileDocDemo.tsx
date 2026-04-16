/**
 * @fileoverview 移动端文档「示例」区容器：圆角边框浅底，用于替代已移除的 PhoneDeviceFrame。
 */

import type { ComponentChildren } from "preact";

/** {@link MobileDocDemo} 的 props */
export interface MobileDocDemoProps {
  /** 示例内容 */
  children?: ComponentChildren;
  /**
   * 追加在默认样式后的 class；默认带 `p-4`，若需无内边距可传 `p-0` 等覆盖（与 Tailwind 生成顺序有关时以项目为准）。
   */
  class?: string;
}

const BASE =
  "max-w-md rounded-xl border border-slate-200 bg-slate-50/80 dark:border-slate-600 dark:bg-slate-800/40";

/**
 * 与 {@link MobileDocDemo} 默认外壳一致；示例外框与内层 signal 拆分时可 import 本串，
 * 避免多一层 children 传递在部分更新路径下整块 reconcile（与 ui-view 文档一致）。
 */
export const MOBILE_DOC_DEMO_SHELL_BASE = BASE;

/**
 * 包裹交互示例，保持各页视觉一致。
 *
 * @param props - 子节点与可选 class
 */
export function MobileDocDemo(props: MobileDocDemoProps) {
  const cls = props.class != null && props.class !== ""
    ? `${BASE} ${props.class}`
    : `${BASE} p-4`;
  return <div class={cls}>{props.children}</div>;
}
