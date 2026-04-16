/**
 * 文档站页脚：须放在主栏或首页的 overflow 滚动容器**内部**，随内容滚动，
 * 不放在根布局视口底部，避免长期占用一截固定高度。
 * 布局：两行居中（版权 + 外链）；padding 刻意收紧。
 * mt-*：与正文之间留白，避免 border-t 贴住上一块内容。
 * 父级 main 宜为 flex flex-col，本组件 shrink-0；正文外包 flex-auto（非 flex-1），避免长文溢出叠层。
 */

import { Link } from "@dreamer/ui-preact";

/** 站点页脚：版权与快捷链接，供 desktop/mobile 主栏及首页复用 */
export default function SiteFooter() {
  return (
    <footer
      class="mt-8 shrink-0 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90 py-2.5 sm:mt-10"
      aria-label="页脚"
    >
      <div class="flex flex-col items-center text-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
        <p class="text-balance px-2">
          © {new Date().getFullYear()}{" "}
          <span class="font-medium text-slate-700 dark:text-slate-300">
            @dreamer/ui-preact
          </span>
          · Dreamer 生态组件库
        </p>
        <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Link
            href="https://jsr.io/@dreamer/ui-preact"
            target="_blank"
            className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            JSR
          </Link>
          <Link
            href="https://github.com/shuliangfu/dreamer-jsr/tree/main/ui-preact"
            target="_blank"
            className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            GitHub
          </Link>
          <Link
            href="/desktop"
            className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            桌面文档
          </Link>
          <Link
            href="/mobile"
            className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            移动文档
          </Link>
        </div>
      </div>
    </footer>
  );
}
