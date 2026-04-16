/**
 * @fileoverview 文档站 E2E 组件策略：哪些路由走「纯渲染断言」、哪些走「交互矩阵」。
 *
 * - **纯展示**：无文档内可重复、可断言的业务交互（如图标墙、Chart.js 静态画布），由 `render-only.test.ts`
 *   内联断言验证书面与 DOM 结构。
 * - **可交互**：每路由在 `page-tests/page_*.test.ts` 中**单独**维护断言与交互；`interactions.test.ts` 等为横切 baseline；
 *   深度场景在 `interactive-*-full.test.ts`（如 Button）按文档区块补全。
 *
 * 「全交互」指与文档示例一一对应的操作（variant/size/disabled/…），非单一 smoke。其余组件当前为 baseline，
 * 升级时在 {@link INTERACTION_DEPTH_BY_PATH} 中把路径改为 `full` 并增加对应用例文件。
 */

/** 纯展示页：正文模式 + 可选 main 内 canvas/svg 数量下限 */
export type RenderOnlyDocSpec = {
  /** 文档 path */
  path: string;
  /** 测试标题用短名 */
  label: string;
  /** `main` 内文本至少匹配这些正则之一（用于验证书面） */
  patterns: RegExp[];
  /** `main` 内文本最小长度（默认 48） */
  minMainLength?: number;
  /** Chart 等：`main` 内 canvas 数量下限 */
  minCanvasesInMain?: number;
  /** Icon 等：`main` 内 svg 数量下限 */
  minSvgsInMain?: number;
};

/**
 * 走专用渲染套件的路由（无 `page-tests` 探针文件，避免误点无关控件）
 */
export const RENDER_ONLY_DOC_SPECS: readonly RenderOnlyDocSpec[] = [
  {
    path: "/desktop/basic/icon",
    label: "Icon",
    patterns: [/Icon\s+图标/],
    minMainLength: 120,
    minSvgsInMain: 24,
  },
  {
    path: "/desktop/basic/typography",
    label: "Typography",
    patterns: [/Typography\s+排版/],
    minMainLength: 80,
  },
  {
    path: "/desktop/basic/skeleton",
    label: "Skeleton",
    patterns: [/Skeleton\s+骨架屏/],
    minMainLength: 80,
  },
  {
    path: "/desktop/basic/spinner",
    label: "Spinner",
    patterns: [/Spinner\s+加载/],
    minMainLength: 60,
  },
  {
    path: "/desktop/charts/line",
    label: "ChartLine",
    patterns: [/ChartLine|折线图|Chart\.js/i],
    minMainLength: 80,
    minCanvasesInMain: 1,
  },
  {
    path: "/desktop/charts/bar",
    label: "ChartBar",
    patterns: [/ChartBar|柱状图/i],
    minMainLength: 80,
    minCanvasesInMain: 1,
  },
  {
    path: "/desktop/charts/pie",
    label: "ChartPie",
    patterns: [/ChartPie|饼图/i],
    minMainLength: 80,
    minCanvasesInMain: 1,
  },
  {
    path: "/desktop/charts/doughnut",
    label: "ChartDoughnut",
    patterns: [/ChartDoughnut|环形图/i],
    minMainLength: 80,
    minCanvasesInMain: 1,
  },
  {
    path: "/desktop/charts/radar",
    label: "ChartRadar",
    patterns: [/ChartRadar|雷达图/i],
    minMainLength: 80,
    minCanvasesInMain: 1,
  },
  {
    path: "/desktop/charts/polar-area",
    label: "ChartPolarArea",
    patterns: [/ChartPolarArea|极区图/i],
    minMainLength: 80,
    minCanvasesInMain: 1,
  },
  {
    path: "/desktop/charts/bubble",
    label: "ChartBubble",
    patterns: [/ChartBubble|气泡图/i],
    minMainLength: 80,
    minCanvasesInMain: 1,
  },
  {
    path: "/desktop/charts/scatter",
    label: "ChartScatter",
    patterns: [/ChartScatter|散点图/i],
    minMainLength: 80,
    minCanvasesInMain: 1,
  },
];

/** 交互深度：`baseline` = interactions 中单条 smoke；`partial` = 多步但未覆盖文档全部；`full` = 与文档示例块对齐 */
export type InteractionDepth = "baseline" | "partial" | "full";

/**
 * 侧栏组件 path → 期望深度（未列出的默认可视为 baseline，由 `interactions.test.ts` 等覆盖）。
 * 新增「全交互」套件时把对应项改为 `full`。
 */
export const INTERACTION_DEPTH_BY_PATH: Readonly<
  Record<string, InteractionDepth>
> = {
  "/desktop/basic/button": "full",
};
