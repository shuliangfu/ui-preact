/**
 * 环形图（Chart Doughnut）
 * 与饼图类似，中间留空，常用于占比
 */

import { ChartBase } from "./ChartBase.tsx";
import type { JSX } from "preact";
import type { ChartData, ChartOptions } from "./types.ts";

export interface ChartDoughnutProps {
  data: ChartData<"doughnut">;
  options?: ChartOptions<"doughnut">;
  class?: string;
  width?: number;
  height?: number;
}

/** 环形图组件 */
export function ChartDoughnut(props: ChartDoughnutProps): JSX.Element {
  return <ChartBase type="doughnut" {...props} />;
}
