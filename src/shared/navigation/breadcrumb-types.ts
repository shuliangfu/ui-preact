/**
 * 面包屑类型，供 PageHeader（shared）与 Breadcrumb（desktop）共用。
 */

import type { ComponentChildren } from "preact";

export interface BreadcrumbItem {
  /** 显示文案 */
  label: string | ComponentChildren;
  /** 链接（最后一项可不传） */
  href?: string;
  /** 无 href 时的点击回调 */
  onClick?: (e: Event) => void;
}
