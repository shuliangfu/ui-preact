/**
 * 顶栏品牌：跳转首页 `/`，使用本包 {@link Link}。
 */

import { Link } from "@dreamer/ui-preact";

/** 展示 @dreamer/ui-preact 文档站徽标 */
export default function DocsSiteBrand() {
  return (
    <Link
      href="/"
      className="shrink-0 inline-flex items-center group no-underline hover:no-underline"
      aria-label="返回首页"
    >
      <span class="inline-flex items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-emerald-600 px-3 py-1.5 font-mono text-sm font-bold leading-none text-white shadow-md shadow-teal-500/20 group-hover:shadow-teal-500/35 transition-shadow">
        ui-preact
      </span>
    </Link>
  );
}
