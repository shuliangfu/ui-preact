/**
 * @module @dreamer/ui-preact/mobile/charts
 * @description
 * **JSR**：`import … from "@dreamer/ui-preact/mobile/charts"`。与桌面 **charts** 相同的 Chart.js 封装（re-export）。
 *
 * @see {@link ../../desktop/charts/mod.ts} 图表清单与类型
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
