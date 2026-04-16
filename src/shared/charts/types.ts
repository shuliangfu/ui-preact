/**
 * Chart 组件通用类型
 * 与 Chart.js 的 data / options 结构对齐，便于业务传入
 */

/** Chart.js 支持的图表类型 */
export type ChartType =
  | "line"
  | "bar"
  | "pie"
  | "doughnut"
  | "radar"
  | "polarArea"
  | "bubble"
  | "scatter";

/** 图表 data 结构（Chart.js ChartData） */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ChartData<T extends ChartType = ChartType> = any;

/** 图表 options（Chart.js ChartOptions） */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ChartOptions<T extends ChartType = ChartType> = any;

export interface BaseChartProps<T extends ChartType = ChartType> {
  /** 图表类型 */
  type: T;
  /** Chart.js data 结构 */
  data: ChartData<T>;
  /** Chart.js options，可选 */
  options?: ChartOptions<T>;
  /** 容器 class，用于控制尺寸与布局 */
  class?: string;
  /** 画布宽度（可选，也可用 class 控制） */
  width?: number;
  /** 画布高度（可选） */
  height?: number;
}
