/**
 * @module @dreamer/ui-preact/charts
 * @description
 * **JSR**：`import … from "@dreamer/ui-preact/charts"`。基于 **Chart.js** 的图表：`ChartLine`、`ChartBar`、`ChartPie`、`ChartDoughnut`、`ChartRadar`、`ChartPolarArea`、`ChartBubble`、`ChartScatter` 及内部基座 `ChartBase`。
 *
 * 类型：`ChartData`、`ChartOptions`、`BaseChartProps`、`ChartType` 等从 `./types.ts` 导出。各图表组件 props 与画布生命周期见对应 `.tsx`。
 *
 * @see {@link ./ChartBase.tsx} 统一创建/更新/销毁
 */

export type {
  BaseChartProps,
  ChartData,
  ChartOptions,
  ChartType,
} from "./types.ts";
export { ChartBase } from "./ChartBase.tsx";
export { ChartLine } from "./ChartLine.tsx";
export type { ChartLineProps } from "./ChartLine.tsx";
export { ChartBar } from "./ChartBar.tsx";
export type { ChartBarProps } from "./ChartBar.tsx";
export { ChartPie } from "./ChartPie.tsx";
export type { ChartPieProps } from "./ChartPie.tsx";
export { ChartDoughnut } from "./ChartDoughnut.tsx";
export type { ChartDoughnutProps } from "./ChartDoughnut.tsx";
export { ChartRadar } from "./ChartRadar.tsx";
export type { ChartRadarProps } from "./ChartRadar.tsx";
export { ChartPolarArea } from "./ChartPolarArea.tsx";
export type { ChartPolarAreaProps } from "./ChartPolarArea.tsx";
export { ChartBubble } from "./ChartBubble.tsx";
export type { ChartBubbleProps } from "./ChartBubble.tsx";
export { ChartScatter } from "./ChartScatter.tsx";
export type { ChartScatterProps } from "./ChartScatter.tsx";
