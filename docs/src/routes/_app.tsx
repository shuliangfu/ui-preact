/**
 * App root component
 * 主题由 @dreamer/plugins/theme 在 onResponse 中注入防闪脚本并设置 html class，无需在此写脚本。
 */

import type { ComponentChildren } from "preact";

interface AppProps {
  children?: ComponentChildren | ComponentChildren[];
  title?: string;
  description?: string;
}

export default function App({
  children,
  title = "docs",
  description = "使用 @dreamer/dweb 构建",
}: AppProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={description} />
        <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
        <title>{title}</title>
      </head>
      <body className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 antialiased h-dvh overflow-hidden">
        {
          /*
           * 固定视口高度链：否则根布局 min-h-screen 会随内容无限增高，flex-1 min-h-0 无法收缩，
           * 侧栏/main 的 overflow-y-auto 不生效，滚轮只能作用在 body（表现为仅顶栏附近能滚动）。
           */
        }
        <div id="app" className="h-full min-h-0 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
