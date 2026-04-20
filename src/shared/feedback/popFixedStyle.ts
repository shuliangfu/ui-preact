/**
 * Portal + `position: fixed` 下 Popover / Popconfirm 的视口定位（与 `ui-view` 同源）。
 * 与原先在 `relative` 容器内 `absolute` + `top-full` 等类名一致（约 8px 间距）。
 */

/** 与 Tailwind `m-2` 与触发器外缘默认间距（px）一致 */
export const PORTAL_POP_GAP_PX = 8;

export type FullPopStylePlacement =
  | "top"
  | "topLeft"
  | "topRight"
  | "bottom"
  | "bottomLeft"
  | "bottomRight"
  | "left"
  | "leftTop"
  | "leftBottom"
  | "right"
  | "rightTop"
  | "rightBottom";

/**
 * 根据触发器外接矩形与 placement 计算 `fixed` 内联 style，供挂到 `document.body` 的浮层使用。
 *
 * @param tr - 触发器 `getBoundingClientRect()` 结果
 * @param placement - 与原先 Tailwind 方位类对应的语义
 * @returns 可赋给 `style` 的 plain object
 */
export function computePopFixedStyle(
  tr: DOMRect,
  placement: FullPopStylePlacement,
): Record<string, string> {
  if (typeof globalThis.window === "undefined") {
    return {};
  }
  const w = globalThis.window;
  const ih = w.innerHeight;
  const iw = w.innerWidth;
  const g = PORTAL_POP_GAP_PX;
  switch (placement) {
    case "top":
      return {
        bottom: `${ih - tr.top + g}px`,
        left: `${tr.left + tr.width / 2}px`,
        transform: "translateX(-50%)",
      };
    case "topLeft":
      return {
        bottom: `${ih - tr.top + g}px`,
        left: `${tr.left}px`,
      };
    case "topRight":
      return {
        bottom: `${ih - tr.top + g}px`,
        right: `${iw - tr.right}px`,
      };
    case "bottom":
      return {
        top: `${tr.bottom + g}px`,
        left: `${tr.left + tr.width / 2}px`,
        transform: "translateX(-50%)",
      };
    case "bottomLeft":
      return {
        top: `${tr.bottom + g}px`,
        left: `${tr.left}px`,
      };
    case "bottomRight":
      return {
        top: `${tr.bottom + g}px`,
        right: `${iw - tr.right}px`,
      };
    case "left":
      return {
        right: `${iw - tr.left + g}px`,
        top: `${tr.top + tr.height / 2}px`,
        transform: "translateY(-50%)",
      };
    case "leftTop":
      return {
        right: `${iw - tr.left + g}px`,
        top: `${tr.top}px`,
      };
    case "leftBottom":
      return {
        right: `${iw - tr.left + g}px`,
        bottom: `${ih - tr.bottom}px`,
      };
    case "right":
      return {
        top: `${tr.top + tr.height / 2}px`,
        left: `${tr.right + g}px`,
        transform: "translateY(-50%)",
      };
    case "rightTop":
      return {
        top: `${tr.top}px`,
        left: `${tr.right + g}px`,
      };
    case "rightBottom":
      return {
        bottom: `${ih - tr.bottom}px`,
        left: `${tr.right + g}px`,
      };
    default:
      return {};
  }
}

/** 每帧写回前清理上一条 `style` 可能留下的轴，避免 `left`+`right` 等残留 */
export const POP_FIXED_STYLE_RESET: Record<string, string> = {
  top: "auto",
  left: "auto",
  right: "auto",
  bottom: "auto",
  transform: "none",
};
