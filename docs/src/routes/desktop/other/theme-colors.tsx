/**
 * 文档站 @theme 色板预览：与 `src/assets/tailwind.css` 中 @theme 颜色变量一致。
 * 路由: /desktop/other/theme-colors
 */

import { CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";

/** 与 tailwind.css @theme 中各阶梯一致 */
const SHADES = [
  50,
  100,
  200,
  300,
  400,
  500,
  600,
  700,
  800,
  900,
  950,
  1000,
] as const;

/** 一组颜色在 @theme 中的名称（对应 --color-{name}-{shade}） */
const COLOR_GROUPS: ReadonlyArray<{
  /** 分组标题 */
  title: string;
  /** 简短说明 */
  desc?: string;
  /** 主题 token 名 */
  names: readonly string[];
}> = [
  {
    title: "默认 default",
    desc: "与 gray 同值，语义别名",
    names: ["default"],
  },
  {
    title: "主要 primary",
    desc: "语义主色阶梯（与 blue 段同值）",
    names: ["primary"],
  },
  {
    title: "次要 secondary",
    desc: "紫色系",
    names: ["secondary"],
  },
  {
    title: "语义：成功 / 警告 / 危险 / 信息",
    names: ["success", "warning", "danger", "info"],
  },
  {
    title: "绿色 / 红色 / 蓝色",
    names: ["green", "red", "blue"],
  },
  {
    title: "黄色 / 琥珀 / 紫色 / 灰色",
    names: ["yellow", "amber", "purple", "gray"],
  },
  {
    title: "棕色 / 橙色 / 粉色 / 靛蓝",
    names: ["brown", "orange", "pink", "indigo"],
  },
  {
    title: "翠绿 / 青 / 柠绿 / 青绿 teal",
    names: ["emerald", "cyan", "lime", "teal"],
  },
];

/**
 * 单个色块：用内联 style + var(--color-*) 取值（非动态 class）。
 * 依赖 tailwind.css 中 @source inline 预生成全套 bg-*，否则 v4 按需产物可能不含未引用过的 --color-*。
 */
function ColorSwatch(
  { tokenName, shade }: { tokenName: string; shade: (typeof SHADES)[number] },
) {
  const varName = `--color-${tokenName}-${shade}`;
  return (
    <div class="flex min-w-18 flex-col items-center gap-1.5">
      <div
        class="h-14 w-full max-w-18 rounded-lg border border-slate-300/80 dark:border-slate-600 shadow-sm"
        style={{ backgroundColor: `var(${varName})` }}
        title={`${tokenName}-${shade}`}
        role="img"
        aria-label={`色块 ${tokenName}-${shade}`}
      />
      <span class="text-[10px] sm:text-xs font-mono text-slate-500 dark:text-slate-400 text-center leading-tight break-all">
        {shade}
      </span>
    </div>
  );
}

/**
 * 一行展示某个 token 名下全部阶梯。
 */
function ColorRow({ tokenName }: { tokenName: string }) {
  return (
    <div class="space-y-2">
      <p class="text-sm font-medium text-slate-700 dark:text-slate-200">
        {tokenName}
      </p>
      <div class="flex flex-wrap gap-2">
        {SHADES.map((shade) => (
          <div key={`${tokenName}-${shade}`}>
            <ColorSwatch tokenName={tokenName} shade={shade} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** 主题颜色文档页 */
export default function OtherThemeColors() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>主题颜色</Title>
        <Paragraph class="mt-2">
          下列色块对应文档站{" "}
          <code class="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-sm">
            src/assets/tailwind.css
          </code>{" "}
          中{" "}
          <code class="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-sm">
            @theme
          </code>{" "}
          定义的{" "}
          <code class="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-sm">
            --color-*
          </code>{" "}
          变量；在工具类中可使用如{" "}
          <code class="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-sm">
            bg-teal-500
          </code>、
          <code class="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-sm">
            text-primary-600
          </code>{" "}
          等。色块用内联{" "}
          <code class="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-sm">
            var(--color-*)
          </code>{" "}
          而非动态 class；若构建未生成某色，变量为空——已在{" "}
          <code class="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-sm">
            tailwind.css
          </code>{" "}
          用{" "}
          <code class="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-sm">
            @source inline(...)
          </code>{" "}
          强制生成全套背景色工具类，最终 CSS 才会带上对应{" "}
          <code class="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-sm">
            --color-*
          </code>
          。
        </Paragraph>
      </section>

      <section class="space-y-3">
        <Title level={2}>说明</Title>
        <CodeBlock
          title="变量命名"
          code={`/* 示例 */
--color-default-500: #14b8a6;
/* 组件 / 页面 */
background: var(--color-default-500);
/* 或 Tailwind */
class="bg-default-500"`}
          language="css"
          copyable
        />
      </section>

      {COLOR_GROUPS.map((group) => (
        <div key={group.title}>
          <section class="space-y-4">
            <div>
              <Title level={2}>{group.title}</Title>
              {group.desc != null && group.desc !== "" && (
                <Paragraph class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {group.desc}
                </Paragraph>
              )}
            </div>
            <div class="space-y-8 pl-0 sm:pl-1">
              {group.names.map((name) => (
                <div key={name}>
                  <ColorRow tokenName={name} />
                </div>
              ))}
            </div>
          </section>
        </div>
      ))}
    </div>
  );
}
