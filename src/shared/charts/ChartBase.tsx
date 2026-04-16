/**
 * 图表基座组件：基于 Chart.js 与 canvas，统一处理创建/更新/销毁
 * 供 ChartLine、ChartBar 等具体类型复用
 */

import Chart from "chart.js/auto";
import type { JSX } from "preact";
import type { BaseChartProps } from "./types.ts";

/** canvas 元素上挂载的 Chart 实例（用于更新与销毁） */
interface CanvasWithChart extends HTMLCanvasElement {
  _chart?: InstanceType<typeof Chart>;
}

/**
 * 通用图表组件：根据 type / data / options 渲染 Chart.js 图表
 * 在 canvas 挂载时创建 Chart，在 data/options 变化时 update，在 unmount 时 destroy
 * 使用闭包保存当前实例的 canvas，以便 unmount 时正确 destroy 对应图表
 */
/** 图表基座组件（内部使用），对外使用 ChartLine / ChartBar 等 */
export function ChartBase<T extends BaseChartProps["type"]>(
  props: BaseChartProps<T>,
): JSX.Element {
  const { type, data, options = {}, class: className, width, height } = props;

  /** 当前实例对应的 canvas，用于 ref(null) 时销毁 */
  let myCanvas: HTMLCanvasElement | null = null;

  const refCb = (el: HTMLCanvasElement | null) => {
    if (el) {
      myCanvas = el;
      const ext = el as CanvasWithChart;
      if (ext._chart) {
        ext._chart.data = data;
        ext._chart.options = { ...ext._chart.options, ...options };
        ext._chart.update();
      } else {
        ext._chart = new Chart(el, {
          type,
          data,
          options,
        }) as CanvasWithChart["_chart"];
      }
    } else {
      if (myCanvas) {
        const ext = myCanvas as CanvasWithChart;
        ext._chart?.destroy();
        ext._chart = undefined;
        myCanvas = null;
      }
    }
  };

  /** 直接返回 Preact VNode（与 shared/basic 等组件一致） */
  return (
    <div
      class={className ?? "w-full h-64"}
      style={width != null || height != null
        ? { width: width ?? "100%", height: height ?? 256 }
        : undefined}
    >
      <canvas
        ref={refCb as (el: unknown) => void}
        width={width}
        height={height}
        aria-label={`Chart: ${type}`}
      />
    </div>
  );
}
