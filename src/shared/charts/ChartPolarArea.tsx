/**
 * 极区图（Chart Polar Area）
 * 极坐标下的扇形面积
 */

import { ChartBase } from "./ChartBase.tsx";
import type { JSX } from "preact";
import type { ChartData, ChartOptions } from "./types.ts";

export interface ChartPolarAreaProps {
  data: ChartData<"polarArea">;
  options?: ChartOptions<"polarArea">;
  class?: string;
  width?: number;
  height?: number;
}

/** 极区图组件 */
export function ChartPolarArea(props: ChartPolarAreaProps): JSX.Element {
  return <ChartBase type="polarArea" {...props} />;
}
