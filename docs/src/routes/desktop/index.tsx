/**
 * 桌面版文档首页：说明、Tailwind 插件、与移动版关系。
 * 路由: /desktop
 */

import { CodeBlock, Link, Paragraph, Title } from "@dreamer/ui-preact";

/** 跳转到常用分类的快速链接 */
const QUICK = [
  { href: "/desktop/basic/button", label: "基础 · Button" },
  { href: "/desktop/form/form-containers", label: "表单 · Form 容器" },
  { href: "/desktop/feedback/modal", label: "反馈 · Modal" },
  { href: "/desktop/data-display/table", label: "数据 · Table" },
  { href: "/desktop/charts/line", label: "图表 · 折线图" },
] as const;

export default function DesktopIndex() {
  return (
    <div class="w-full max-w-4xl space-y-12">
      <header class="space-y-4 border-b border-slate-200 dark:border-slate-700 pb-10">
        <p class="text-sm font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
          Desktop
        </p>
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          桌面版组件
        </h1>
        <p class="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
          <code class="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-sm">
            @dreamer/ui-preact
          </code>{" "}
          默认入口，适用于后台、文档站等 PC 场景。左侧为分类导航；复杂组件（如
          Table、Modal）内部使用 <code class="text-sm">signal</code> 的{" "}
          <code class="text-sm">.value</code> 与渲染 getter 协同更新。
        </p>
        <div class="flex flex-wrap gap-2 pt-2">
          {QUICK.map((q) => (
            <span key={q.href} class="contents">
              <Link
                href={q.href}
                className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 hover:border-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
              >
                {q.label}
              </Link>
            </span>
          ))}
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          移动端专用组件见{" "}
          <Link
            href="/mobile"
            className="font-medium text-teal-600 dark:text-teal-400 hover:underline"
          >
            /mobile 文档
          </Link>
          。
        </p>
      </header>

      <section class="space-y-4">
        <Title level={2} class="text-xl sm:text-2xl">
          Tailwind 按需插件
        </Title>
        <Paragraph class="text-slate-600 dark:text-slate-400">
          注册{" "}
          <code class="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-sm">
            uiViewTailwindContentPlugin
          </code>
          后扫描项目中对本库的引用，生成仅含{" "}
          <code class="text-sm">@source</code> 的 CSS 文件；在{" "}
          <code class="text-sm">tailwind.css</code> 顶部{" "}
          <code class="text-sm">@import</code> 该文件即可（须在{" "}
          <code class="text-sm">tailwindPlugin</code> 之前注册插件）。
        </Paragraph>
        <CodeBlock
          language="ts"
          code={`import { uiViewTailwindContentPlugin } from "@dreamer/ui-preact/plugin";
import { tailwindPlugin } from "@dreamer/plugins/tailwindcss";

app.registerPlugin(uiViewTailwindContentPlugin({
  outputPath: "src/assets/ui-view-sources.css",
  scanPath: "src",
}));
app.registerPlugin(tailwindPlugin({ /* ... */ }));`}
        />
        <Paragraph class="text-sm text-slate-500 dark:text-slate-400">
          本站{" "}
          <code class="rounded px-1 bg-slate-100 dark:bg-slate-800">
            src/assets
          </code>{" "}
          下包含{" "}
          <code class="rounded px-1 bg-slate-100 dark:bg-slate-800">
            tailwind.css
          </code>{" "}
          与生成的{" "}
          <code class="rounded px-1 bg-slate-100 dark:bg-slate-800">
            ui-view-sources.css
          </code>。
        </Paragraph>
      </section>

      <section class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/40 p-6 space-y-2">
        <Title level={2} class="text-lg">
          提示
        </Title>
        <ul class="text-sm text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-5">
          <li>
            下拉类组件若需 Esc 关闭，可调用库导出的{" "}
            <code class="text-xs">initDropdownEsc</code>（详见 Dropdown
            文档页）。
          </li>
          <li>
            示例与 API 以各子页为准；与源码路径{" "}
            <code class="text-xs">ui-view/src/desktop/...</code> 对应。
          </li>
        </ul>
      </section>
    </div>
  );
}
