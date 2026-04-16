/**
 * 散点图（Chart Scatter）
 * 二维分布、相关性展示
 */

import { ChartBase } from "./ChartBase.tsx";
import type { JSX } from "preact";
import type { ChartData, ChartOptions } from "./types.ts";

export interface ChartScatterProps {
  data: ChartData<"scatter">;
  options?: ChartOptions<"scatter">;
  class?: string;
  width?: number;
  height?: number;
}

/** 散点图组件 */
export function ChartScatter(props: ChartScatterProps): JSX.Element {
  return <ChartBase type="scatter" {...props} />;
}
