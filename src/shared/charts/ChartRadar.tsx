/**
 * 雷达图（Chart Radar）
 * 多维度对比
 */

import { ChartBase } from "./ChartBase.tsx";
import type { JSX } from "preact";
import type { ChartData, ChartOptions } from "./types.ts";

export interface ChartRadarProps {
  data: ChartData<"radar">;
  options?: ChartOptions<"radar">;
  class?: string;
  width?: number;
  height?: number;
}

/** 雷达图组件 */
export function ChartRadar(props: ChartRadarProps): JSX.Element {
  return <ChartBase type="radar" {...props} />;
}
