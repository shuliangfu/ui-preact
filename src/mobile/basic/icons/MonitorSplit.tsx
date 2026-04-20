/**
 * 显示器屏面竖直对分（左黑右白），与 `@dreamer/ui-view` IconMonitorSplit 同源几何。
 */
import { Icon } from "../Icon.tsx";
import type { JSX } from "preact";
import type { IconComponentProps } from "../Icon.tsx";

const SCREEN_LEFT = { x: 96, y: 128, w: 416, h: 544 } as const;
const SCREEN_RIGHT = { x: 512, y: 128, w: 384, h: 544 } as const;
const FILL_LEFT = "#171717";
const FILL_RIGHT = "#ffffff";

const STROKE_OUTER =
  "M928 64H96c-17.7 0-32 14.3-32 32v608c0 17.7 14.3 32 32 32h288L304 896h416L672 736h288c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32z";

const svg = (
  <svg
    viewBox="0 0 1024 1024"
    fill="none"
    class="w-full h-full"
    aria-hidden
  >
    <rect
      x={SCREEN_LEFT.x}
      y={SCREEN_LEFT.y}
      width={SCREEN_LEFT.w}
      height={SCREEN_LEFT.h}
      fill={FILL_LEFT}
    />
    <rect
      x={SCREEN_RIGHT.x}
      y={SCREEN_RIGHT.y}
      width={SCREEN_RIGHT.w}
      height={SCREEN_RIGHT.h}
      fill={FILL_RIGHT}
    />
    <path
      d={STROKE_OUTER}
      fill="none"
      stroke="currentColor"
      stroke-width="32"
      stroke-linejoin="round"
    />
  </svg>
);

/**
 * 显示器半分主题图标（屏面左黑右白）。
 *
 * @param props - `size`、`class`
 */
export function IconMonitorSplit(props?: IconComponentProps): JSX.Element {
  return <Icon size={props?.size} class={props?.class}>{svg}</Icon>;
}
