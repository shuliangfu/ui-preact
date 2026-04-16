/**
 * 柱状图（Chart Bar）
 * 用于分类对比，支持水平/垂直、堆叠
 */

import { ChartBase } from "./ChartBase.tsx";
import type { JSX } from "preact";
import type { ChartData, ChartOptions } from "./types.ts";

export interface ChartBarProps {
  data: ChartData<"bar">;
  options?: ChartOptions<"bar">;
  class?: string;
  width?: number;
  height?: number;
}

/** 柱状图组件 */
export function ChartBar(props: ChartBarProps): JSX.Element {
  return <ChartBase type="bar" {...props} />;
}
