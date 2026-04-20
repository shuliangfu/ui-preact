/**
 * Dropdown 经 `createPortal` 挂到 `body` 且 `position:fixed` 时的视口坐标计算（与 `ui-view` 同源）。
 * 小箭头菱形 class 也集中在此，便于与 {@link ./Dropdown.tsx} 共用。
 */

import { twMerge } from "tailwind-merge";

/** 与 `Dropdown` 的 `placement` 取值同构，不 import 组件文件以免循环依赖 */
type DropdownPlacementParam =
  | "bottom"
  | "bottomLeft"
  | "bottomRight"
  | "bottomAuto";

/** 与 Tailwind `mt-1`/`mb-1` 默认间距一致（px） */
const GAP_Y_COMPACT_PX = 4;
/** 与 Tailwind `mt-2`/`mb-2` 一致（带箭头时竖向间隙） */
const GAP_Y_ARROW_PX = 8;

/** 与 {@link getDropdownArrowProps} 内箭头 inset 一致（px）；带箭头时 `bottomLeft`/`bottomRight` 锚定浮层使尖角对准触发器竖边 */
const ARROW_INSET_PX = 12;

export type ResolvedPopPlacement =
  | "bottom"
  | "bottomLeft"
  | "bottomRight";

/**
 * 竖向间距：带箭头时略大，与 ui-view 一致。
 */
function gapYPixels(
  arrowEnabled: boolean,
  _eff: ResolvedPopPlacement,
): number {
  return arrowEnabled ? GAP_Y_ARROW_PX : GAP_Y_COMPACT_PX;
}

/**
 * 根据触发器外接矩形与有效 placement 计算 `fixed` 内联 style。
 */
export function computeDropdownFixedStyle(
  triggerRect: DOMRect,
  eff: ResolvedPopPlacement,
  arrowEnabled: boolean,
): Record<string, string> {
  const gap = gapYPixels(arrowEnabled, eff);
  const w = globalThis.window;
  const iw = w.innerWidth;
  const tr = triggerRect;
  /**
   * 每次**写全**可参与定位的 5 个量；未用的轴为 `auto`、`transform: none`。
   * 否则在 Preact/浏览器里，若上一条 inline 留下 `left` 或 `translateX(-50%)`（如刚从 `placement=bottom` 同节点更新），
   * 新对象只有 `right`+`top` 时，旧 `left` 不一定会被清掉，导致 `bottomRight` 视觉上像「下左」。
   */
  const C = {
    left: "auto",
    right: "auto",
    top: "auto",
    bottom: "auto",
    transform: "none",
  } as const;

  switch (eff) {
    case "bottom":
      return {
        ...C,
        top: `${tr.bottom + gap}px`,
        left: `${tr.left + tr.width / 2}px`,
        right: "auto",
        transform: "translateX(-50%)",
      };
    case "bottomLeft":
      /**
       * 与 `bottomRight` 对称：箭头在面板右侧 inset 时，`right: iw - tr.left - inset` 使尖角对准 `tr.left`。
       */
      if (arrowEnabled) {
        return {
          ...C,
          top: `${tr.bottom + gap}px`,
          right: `${iw - tr.left - ARROW_INSET_PX}px`,
          left: "auto",
          bottom: "auto",
          transform: "none",
        };
      }
      return {
        ...C,
        top: `${tr.bottom + gap}px`,
        left: `${tr.left}px`,
        right: "auto",
        transform: "none",
      };
    case "bottomRight":
      /**
       * 带箭头且箭头在面板左侧 inset：菱形中心距浮层左缘 {@link ARROW_INSET_PX}px，故 `left: tr.right - inset` 整块右移，使尖角落在触发器**右缘**。
       * 无箭头时浮层右缘贴 `tr.right`。
       */
      if (arrowEnabled) {
        return {
          ...C,
          top: `${tr.bottom + gap}px`,
          left: `${tr.right - ARROW_INSET_PX}px`,
          right: "auto",
          bottom: "auto",
          transform: "none",
        };
      }
      return {
        ...C,
        top: `${tr.bottom + gap}px`,
        right: `${iw - tr.right}px`,
        left: "auto",
        bottom: "auto",
        transform: "none",
      };
    default:
      return { ...C };
  }
}

/**
 * 解析后 placement：`bottomAuto` 时用 `auto`；否则若写 `bottomAuto` 作 props 时视为 `bottom`。
 */
export function resolvePlacement(
  isAuto: boolean,
  auto: ResolvedPopPlacement,
  placement: DropdownPlacementParam,
): ResolvedPopPlacement {
  if (isAuto) return auto;
  if (placement === "bottomAuto") return "bottom";
  return placement;
}

/**
 * 菱形箭头：`rotate(45deg)` 与 `translate` 必须在**同一条** `transform` 里。
 * 下拉仅出现在触发器**下方**，箭头始终在面板**顶边**。
 *
 * @param eff - 已解析的 placement
 * @returns `className`（尺寸与缺角边框）+ `style`（位移与合一 transform）
 */
export function getDropdownArrowProps(
  eff: ResolvedPopPlacement,
): { className: string; style: Record<string, string> } {
  const shell =
    "absolute w-2 h-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800";

  const cut = twMerge(shell, "border-b-0 border-r-0");
  let style: Record<string, string>;
  switch (eff) {
    case "bottom":
      style = {
        top: "0",
        left: "50%",
        transform: "translate(-50%, -50%) rotate(45deg)",
      };
      break;
    case "bottomLeft":
      style = {
        top: "0",
        left: "auto",
        right: `${ARROW_INSET_PX}px`,
        transform: "translate(50%, -50%) rotate(45deg)",
      };
      break;
    case "bottomRight":
      style = {
        top: "0",
        left: `${ARROW_INSET_PX}px`,
        right: "auto",
        transform: "translate(-50%, -50%) rotate(45deg)",
      };
      break;
    default:
      style = {
        top: "0",
        left: "50%",
        transform: "translate(-50%, -50%) rotate(45deg)",
      };
  }
  return { className: cut, style };
}
