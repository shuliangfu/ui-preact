/**
 * ColorPicker 颜色选择（Preact + @preact/signals）。
 * 自绘饱和度/明度方格、色相条与 HEX/RGB 输入；打开面板后拖动等会派发 `input`；点「确定」再派发 `input`/`change` 收尾并关浮层，且跳过关闭瞬间用旧 `value` 回灌（避免颜色被冲回）。
 * 「取消」恢复打开前颜色并派发 `input`/`change`。
 * 常规打开：取色面板相对容器 **`absolute`**（`top-full`），与 {@link DatePicker} 一致；`openAtClientPoint` 等为视口 **`fixed`** + 命令式像素坐标。
 * `panelAttach="viewport"` 时由触发器打开的面板为视口 **`fixed`** + 几何同步（与 {@link DatePicker} `panelAttach` 一致），避免表格等 overflow 裁切；命令式 `openAt*` 仍为原 `floating` 坐标逻辑。
 * 通过隐藏 `input` 派发 `input`/`change` 事件，与原先基于 `type="color"` 的 `onChange`/`onInput` 签名兼容（`e.target.value` 为 `#rrggbb`）。
 */

import type { JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { type Signal, useSignal } from "@preact/signals";
import { twMerge } from "tailwind-merge";
import { IconDroplet } from "../basic/icons/Droplet.tsx";
import { IconPalette } from "../basic/icons/Palette.tsx";
import { controlBlueFocusRing } from "./input-focus-ring.ts";
import { Input } from "./Input.tsx";
import {
  pickerPortalZClass,
  registerPickerFixedOverlayPositionAndOutsideClick,
  registerPointerDownOutside,
} from "./picker-portal-utils.ts";
import {
  commitMaybeSignal,
  type MaybeSignal,
  readMaybeSignal,
} from "./maybe-signal.ts";

/**
 * 命令式打开/关闭取色面板（与 {@link ColorPickerProps.pickerRef} 配合）。
 */
export interface ColorPickerHandle {
  /**
   * 在视口坐标附近以 `fixed` 打开面板（会夹紧视口，避免溢出）。
   *
   * @param clientX - 指针 X（如 `PointerEvent.clientX`）
   * @param clientY - 指针 Y（如 `PointerEvent.clientY`）
   */
  openAtClientPoint(clientX: number, clientY: number): void;
  /**
   * 自指针事件读取坐标并打开（等价于 `openAtClientPoint(ev.clientX, ev.clientY)`）。
   *
   * @param ev - 至少含 `clientX` / `clientY` 的对象
   */
  openFromPointerEvent(ev: Pick<PointerEvent, "clientX" | "clientY">): void;
  /**
   * 关闭面板：`true` 为确定（提交并触发 `onApply`），`false` 为取消（恢复原色）。
   *
   * @param commit - 是否按「确定」语义关闭
   */
  close(commit: boolean): void;
}

export interface ColorPickerProps {
  /** 当前颜色 #rrggbb；见 {@link MaybeSignal} */
  value?: MaybeSignal<string>;
  /** 是否禁用 */
  disabled?: boolean;
  /** 变更回调（`e.target` 为隐藏 input，`value` 为 #rrggbb） */
  onChange?: (e: Event) => void;
  /** 拖拽/输入过程中的回调 */
  onInput?: (e: Event) => void;
  /**
   * 额外 class（作用于最外层 `relative` 容器）。
   * 默认带 `w-full`，传入 `max-w-*`、`w-*`、`w-auto` 等可与默认合并并由后者覆盖宽度。
   */
  class?: string;
  /** 随表单提交的隐藏域 `name` */
  name?: string;
  /** 触发器 `id`（用于 label；隐藏域为 `${id}-value`） */
  id?: string;
  /** 为 true 时隐藏聚焦激活态边框；默认 false */
  hideFocusRing?: boolean;
  /** 为 false 时不显示右侧调色板图标；默认 true */
  showSuffixIcon?: boolean;
  /**
   * 展示形态：`default` 为色块 + HEX 文案（+ 可选调色板图标）；`swatch` 仅渲染可点击色块，点击打开取色面板。
   */
  variant?: "default" | "swatch";
  /**
   * 为 true 时在取色面板顶部显示屏幕取色按钮、圆形预览与说明文案；默认 false 不显示。
   */
  showToolbar?: boolean;
  /**
   * 为 true 时不渲染可见触发按钮，仅保留隐藏域；由父级通过 {@link pickerRef} 调用 `openAtClientPoint` 等打开面板。
   */
  hideTrigger?: boolean;
  /**
   * 挂载后写入命令式 API；卸载时置回 `null`。
   */
  pickerRef?: { current: ColorPickerHandle | null };
  /**
   * 用户点击面板内「确定」并提交颜色后调用一次（参数为规范化后的 `#rrggbb`）。
   * 拖动过程中的变更仍只走 `onInput`/`onChange`；取消或点外部关闭不会调用。
   */
  onApply?: (hex: string) => void;
  /**
   * 取色面板打开/关闭时调用（与内部 `panelOpen` 同步）；供宿主禁止受控 `innerHTML` 在面板交互期间误回写。
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * 浮层挂载方式：`anchored`（默认）相对根 `absolute`；`viewport` 为触发器打开时视口 `fixed` + 几何同步，避免被 overflow 裁切。
   * 不影响 {@link ColorPickerHandle.openAtClientPoint} 等命令式打开（仍为独立坐标 `floating` 模式）。
   */
  panelAttach?: "anchored" | "viewport";
}

/** 与 DatePicker、Select 等共用 Esc 关闭（依赖应用侧 `initDropdownEsc` 全局监听） */
const DROPDOWN_ESC_KEY = "__lastDropdownClose" as const;

/**
 * 浮层打开时注册全局 Esc 回调（多浮层时后打开的覆盖前者）。
 *
 * @param close - 按下 Esc 时执行
 */
function registerDropdownEsc(close: () => void): void {
  if (typeof globalThis === "undefined") return;
  const g = globalThis as unknown as Record<
    string,
    (() => void) | undefined
  >;
  g[DROPDOWN_ESC_KEY] = close;
}

/**
 * 浮层关闭时移除 Esc 回调，避免残留到其它页面逻辑。
 */
function clearDropdownEsc(): void {
  if (typeof globalThis === "undefined") return;
  const g = globalThis as unknown as Record<
    string,
    (() => void) | undefined
  >;
  g[DROPDOWN_ESC_KEY] = undefined;
}

/**
 * 将通道限制在 0～255。
 *
 * @param n - 原始值
 */
function clamp255(n: number): number {
  return Math.min(255, Math.max(0, Math.round(n)));
}

/**
 * 解析 #rgb / #rrggbb 为 RGB；非法时返回 null。
 *
 * @param hex - 颜色字符串
 */
function parseHexRgb(hex: string): { r: number; g: number; b: number } | null {
  const s = hex.trim().replace(/^#/, "");
  if (s.length === 3) {
    const r = parseInt(s[0] + s[0], 16);
    const g = parseInt(s[1] + s[1], 16);
    const b = parseInt(s[2] + s[2], 16);
    if ([r, g, b].some((x) => Number.isNaN(x))) return null;
    return { r, g, b };
  }
  if (s.length === 6) {
    const r = parseInt(s.slice(0, 2), 16);
    const g = parseInt(s.slice(2, 4), 16);
    const b = parseInt(s.slice(4, 6), 16);
    if ([r, g, b].some((x) => Number.isNaN(x))) return null;
    return { r, g, b };
  }
  return null;
}

/**
 * RGB 转 #rrggbb。
 *
 * @param r - 红 0～255
 * @param g - 绿 0～255
 * @param b - 蓝 0～255
 */
function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => clamp255(n).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`.toLowerCase();
}

/**
 * RGB 转 HSV；h∈[0,360)，s、v∈[0,1]。
 *
 * @param r - 红 0～255
 * @param g - 绿 0～255
 * @param b - 蓝 0～255
 */
function rgbToHsv(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; v: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s, v };
}

/**
 * HSV 转 RGB。
 *
 * @param h - 色相 0～360
 * @param s - 饱和度 0～1
 * @param v - 明度 0～1
 */
function hsvToRgb(
  h: number,
  s: number,
  v: number,
): { r: number; g: number; b: number } {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (h >= 0 && h < 60) {
    rp = c;
    gp = x;
    bp = 0;
  } else if (h < 120) {
    rp = x;
    gp = c;
    bp = 0;
  } else if (h < 180) {
    rp = 0;
    gp = c;
    bp = x;
  } else if (h < 240) {
    rp = 0;
    gp = x;
    bp = c;
  } else if (h < 300) {
    rp = x;
    gp = 0;
    bp = c;
  } else {
    rp = c;
    gp = 0;
    bp = x;
  }
  return {
    r: clamp255((rp + m) * 255),
    g: clamp255((gp + m) * 255),
    b: clamp255((bp + m) * 255),
  };
}

/**
 * 归一化为 #rrggbb；无法解析时返回 `#000000`。
 *
 * @param hex - 输入字符串
 */
function normalizeHex(hex: string): string {
  const rgb = parseHexRgb(hex);
  if (!rgb) return "#000000";
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * 在隐藏 input 上写入颜色并派发事件，供受控表单与 `onInput`/`onChange` 使用。
 *
 * @param el - 隐藏域
 * @param hex - #rrggbb
 * @param type - `input` 或 `change`
 * @param handler - 可选回调
 */
function dispatchColorInputEvent(
  el: HTMLInputElement,
  hex: string,
  type: "input" | "change",
  handler?: (e: Event) => void,
): void {
  el.value = hex;
  const ev = new Event(type, { bubbles: true });
  Object.defineProperty(ev, "target", { value: el, enumerable: true });
  Object.defineProperty(ev, "currentTarget", { value: el, enumerable: true });
  handler?.(ev);
}

/** 色相条 CSS 渐变（与常见取色器一致） */
const HUE_STRIP_GRADIENT =
  "linear-gradient(to right,#f00 0%,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,#f00 100%)";

/** `fixed` 浮层预估宽度（与 `min-w-[288px]`、内边距一致，略放大留余量） */
const FLOAT_PANEL_EST_W = 304;
/** `fixed` 浮层预估高度（方格+色相条+RGB+HEX+按钮区近似） */
const FLOAT_PANEL_EST_H = 440;
/** 视口内边距（与 {@link computePickerPortalStyle} 默认一致） */
const FLOAT_VIEWPORT_INSET = 8;

/**
 * 将取色面板左上角夹在视口内，默认放在指针右下侧（`top = clientY + 8`），空间不足则翻到指针上方。
 *
 * @param clientX - 指针 X
 * @param clientY - 指针 Y
 */
function clampFloatingPanelPosition(
  clientX: number,
  clientY: number,
): { left: number; top: number } {
  const vw = typeof globalThis !== "undefined" &&
      typeof globalThis.innerWidth === "number"
    ? globalThis.innerWidth
    : 1024;
  const vh = typeof globalThis !== "undefined" &&
      typeof globalThis.innerHeight === "number"
    ? globalThis.innerHeight
    : 768;
  let left = clientX;
  let top = clientY + 8;
  const maxLeft = vw - FLOAT_VIEWPORT_INSET - FLOAT_PANEL_EST_W;
  if (left > maxLeft) left = Math.max(FLOAT_VIEWPORT_INSET, maxLeft);
  if (left < FLOAT_VIEWPORT_INSET) left = FLOAT_VIEWPORT_INSET;
  if (top + FLOAT_PANEL_EST_H > vh - FLOAT_VIEWPORT_INSET) {
    top = clientY - FLOAT_PANEL_EST_H - 8;
  }
  if (top < FLOAT_VIEWPORT_INSET) top = FLOAT_VIEWPORT_INSET;
  return { left: Math.round(left), top: Math.round(top) };
}

/** 取色面板内部 props：SV/色相条/RGB/HEX 与按钮均读 signal，须在内层渲染顶层解包 */
interface ColorPickerPanelInteriorProps {
  hue: Signal<number>;
  sat: Signal<number>;
  val: Signal<number>;
  hexDraft: Signal<string>;
  rDraft: Signal<number>;
  gDraft: Signal<number>;
  bDraft: Signal<number>;
  showToolbar: boolean;
  hideFocusRing: boolean;
  id?: string;
  pickSvFromPointer: (
    clientX: number,
    clientY: number,
    rect: DOMRect,
  ) => void;
  pickHueFromPointer: (clientX: number, rect: DOMRect) => void;
  tryEyeDropper: () => Promise<void>;
  applyHexToHsv: (hex: string) => void;
  emitDraftInput: () => void;
  /** SV/色相条 `pointerup` 时调用：取消悬而未决的 rAF 并立刻同步草稿，避免松手后父级少收末帧 */
  flushDraftInputAfterDrag: () => void;
  confirmPanel: () => void;
  cancelPanel: () => void;
}

/**
 * 取色面板内部（SV 方格、色相条、RGB/HEX 与确定/取消）。
 * 在渲染顶层读取各 {@link Signal}，与 {@link TimePickerTimeStrip} 一致，保证拖动时视图与草稿同步更新。
 */
function ColorPickerPanelInterior(
  props: ColorPickerPanelInteriorProps,
): JSX.Element {
  const {
    hue,
    sat,
    val,
    hexDraft,
    rDraft,
    gDraft,
    bDraft,
    showToolbar,
    hideFocusRing,
    id,
    pickSvFromPointer,
    pickHueFromPointer,
    tryEyeDropper,
    applyHexToHsv,
    emitDraftInput,
    flushDraftInputAfterDrag,
    confirmPanel,
    cancelPanel,
  } = props;

  const h = hue.value;
  const s = sat.value;
  const v = val.value;
  const preview = hsvToRgb(h, s, v);
  const previewHex = rgbToHex(preview.r, preview.g, preview.b);

  return (
    <>
      {showToolbar && (
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            title="取色器（需浏览器支持）"
            aria-label="屏幕取色"
            onClick={() => void tryEyeDropper()}
          >
            <IconDroplet
              size="sm"
              class="text-slate-600 dark:text-slate-300"
            />
          </button>
          <div
            class="h-9 w-9 shrink-0 rounded-full border-2 border-slate-200 shadow-inner dark:border-slate-500"
            style={{
              backgroundColor: previewHex,
            }}
            aria-hidden
          />
          <p class="text-xs text-slate-500 dark:text-slate-400">
            拖动方格与色相条选择颜色
          </p>
        </div>
      )}

      {
        /* 饱和度×明度：底为当前色相纯色，右向变白，上向变黑 */
      }
      <div
        class="relative h-40 w-full cursor-crosshair touch-none overflow-hidden rounded-lg select-none"
        onPointerDown={(e: Event) => {
          const pe = e as PointerEvent;
          const el = pe.currentTarget as HTMLElement;
          el.setPointerCapture(pe.pointerId);
          pickSvFromPointer(
            pe.clientX,
            pe.clientY,
            el.getBoundingClientRect(),
          );
        }}
        onPointerMove={(e: Event) => {
          const pe = e as PointerEvent;
          if (!pe.buttons) return;
          const el = pe.currentTarget as HTMLElement;
          pickSvFromPointer(
            pe.clientX,
            pe.clientY,
            el.getBoundingClientRect(),
          );
        }}
        onPointerUp={(e: Event) => {
          const pe = e as PointerEvent;
          (pe.currentTarget as HTMLElement).releasePointerCapture(
            pe.pointerId,
          );
          flushDraftInputAfterDrag();
        }}
      >
        <div
          class="absolute inset-0"
          style={{
            backgroundColor: `hsl(${Math.round(h)},100%,50%)`,
          }}
        />
        <div
          class="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgb(255,255,255), transparent)",
          }}
        />
        <div
          class="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgb(0,0,0), transparent)",
          }}
        />
        <div
          class="pointer-events-none absolute h-3 w-3 rounded-full border-2 border-white shadow-md"
          style={{
            left: `${s * 100}%`,
            top: `${(1 - v) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      <div
        class="relative h-3 w-full cursor-pointer touch-none rounded-full select-none"
        style={{ background: HUE_STRIP_GRADIENT }}
        onPointerDown={(e: Event) => {
          const pe = e as PointerEvent;
          const el = pe.currentTarget as HTMLElement;
          el.setPointerCapture(pe.pointerId);
          pickHueFromPointer(pe.clientX, el.getBoundingClientRect());
        }}
        onPointerMove={(e: Event) => {
          const pe = e as PointerEvent;
          if (!pe.buttons) return;
          const el = pe.currentTarget as HTMLElement;
          pickHueFromPointer(pe.clientX, el.getBoundingClientRect());
        }}
        onPointerUp={(e: Event) => {
          const pe = e as PointerEvent;
          (pe.currentTarget as HTMLElement).releasePointerCapture(
            pe.pointerId,
          );
          flushDraftInputAfterDrag();
        }}
      >
        <div
          class="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: `${(h / 360) * 100}%` }}
        />
      </div>

      <div class="grid grid-cols-3 gap-2">
        <div>
          <label
            class="mb-0.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
            for={id ? `${id}-cp-r` : undefined}
          >
            R
          </label>
          <Input
            id={id ? `${id}-cp-r` : undefined}
            type="text"
            size="sm"
            hideFocusRing={hideFocusRing}
            class="w-full min-w-0"
            value={String(rDraft.value)}
            onInput={(e: Event) => {
              const n = parseInt(
                (e.target as HTMLInputElement).value,
                10,
              );
              if (Number.isFinite(n)) {
                rDraft.value = clamp255(n);
                const hex = rgbToHex(
                  rDraft.value,
                  gDraft.value,
                  bDraft.value,
                );
                applyHexToHsv(hex);
                emitDraftInput();
              }
            }}
          />
        </div>
        <div>
          <label
            class="mb-0.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
            for={id ? `${id}-cp-g` : undefined}
          >
            G
          </label>
          <Input
            id={id ? `${id}-cp-g` : undefined}
            type="text"
            size="sm"
            hideFocusRing={hideFocusRing}
            class="w-full min-w-0"
            value={String(gDraft.value)}
            onInput={(e: Event) => {
              const n = parseInt(
                (e.target as HTMLInputElement).value,
                10,
              );
              if (Number.isFinite(n)) {
                gDraft.value = clamp255(n);
                const hex = rgbToHex(
                  rDraft.value,
                  gDraft.value,
                  bDraft.value,
                );
                applyHexToHsv(hex);
                emitDraftInput();
              }
            }}
          />
        </div>
        <div>
          <label
            class="mb-0.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
            for={id ? `${id}-cp-b` : undefined}
          >
            B
          </label>
          <Input
            id={id ? `${id}-cp-b` : undefined}
            type="text"
            size="sm"
            hideFocusRing={hideFocusRing}
            class="w-full min-w-0"
            value={String(bDraft.value)}
            onInput={(e: Event) => {
              const n = parseInt(
                (e.target as HTMLInputElement).value,
                10,
              );
              if (Number.isFinite(n)) {
                bDraft.value = clamp255(n);
                const hex = rgbToHex(
                  rDraft.value,
                  gDraft.value,
                  bDraft.value,
                );
                applyHexToHsv(hex);
                emitDraftInput();
              }
            }}
          />
        </div>
      </div>

      <div>
        <label
          class="mb-0.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
          for={id ? `${id}-cp-hex` : undefined}
        >
          HEX
        </label>
        <Input
          id={id ? `${id}-cp-hex` : undefined}
          type="text"
          size="sm"
          hideFocusRing={hideFocusRing}
          class="w-full font-mono"
          value={hexDraft}
          onBlur={() => {
            const n = normalizeHex(hexDraft.value);
            applyHexToHsv(n);
            emitDraftInput();
          }}
        />
      </div>

      <div class="mt-1 flex justify-end gap-2 border-t border-slate-200 pt-2 dark:border-slate-600">
        <button
          type="button"
          class="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          onClick={() => confirmPanel()}
        >
          确定
        </button>
        <button
          type="button"
          class="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
          onClick={() => cancelPanel()}
        >
          取消
        </button>
      </div>
    </>
  );
}

/**
 * ColorPicker：颜色选择器。
 */
export function ColorPicker(props: ColorPickerProps): JSX.Element {
  const {
    disabled = false,
    onChange,
    onInput,
    class: className,
    name,
    id,
    hideFocusRing = false,
    showSuffixIcon = true,
    variant = "default",
    showToolbar = false,
    hideTrigger = false,
  } = props;

  /**
   * 当前受控颜色（#rrggbb）。
   * **禁止**在组件 setup 里 `const { value } = props`：`value` 会变成一次性快照，父级 `signal` 更新后触发器仍显示旧色（与 `InputNumber` 等受控组件一致，须反复读 `props.value`）。
   */
  const controlledHex = () =>
    normalizeHex(readMaybeSignal(props.value) ?? "#000000");

  /** 与 props 同步的标量，供 `useEffect` 在父级传入非 Signal 字符串时也能触发关闭态回灌 */
  const committedHexScalar = controlledHex();

  const panelOpen = useSignal(false);
  /**
   * `anchored`：相对根 `absolute`；`floating`：命令式 `openAt*` 的视口 `fixed` + 手填坐标；
   * `viewport`：触发器打开且 `panelAttach="viewport"` 时的视口 `fixed` + {@link registerPickerFixedOverlayPositionAndOutsideClick} 几何同步。
   */
  const panelLayout = useSignal<"anchored" | "floating" | "viewport">(
    "anchored",
  );
  /** `floating` 时面板的 `left`（px） */
  const panelFloatX = useSignal(0);
  /** `floating` 时面板的 `top`（px） */
  const panelFloatY = useSignal(0);

  /** 内部 HSV，与打开面板或外部 `value` 同步 */
  const hue = useSignal(0);
  const sat = useSignal(1);
  const val = useSignal(1);
  /**
   * HEX 文本框草稿（可含未完成的输入）。
   * 初值仅挂载时取一次受控 `value`（避免在 setup 中订阅 `props.value` 导致受控父级 `onInput` 更新时整树重挂载、面板闪关）。
   */
  const hexDraft = useSignal(
    normalizeHex(readMaybeSignal(props.value) ?? "#000000"),
  );
  const rDraft = useSignal(0);
  const gDraft = useSignal(0);
  const bDraft = useSignal(0);

  /**
   * 触发按钮 DOM 引用（须用函数 ref，勿对对象式 `ref={triggerRef}`）。
   */
  const triggerRef: { current: HTMLButtonElement | null } = {
    current: null,
  };
  const hiddenRef = useRef<HTMLInputElement | null>(null);
  /** 点击面板外关闭：document 捕获监听，须在关闭 / 卸载时 dispose */
  const outsidePointerCleanup: { dispose: (() => void) | null } = {
    dispose: null,
  };
  /** 锚定模式：`fixed` 几何与滚动同步 */
  const pickerAnchorScrollCleanup: { dispose: (() => void) | null } = {
    dispose: null,
  };
  /** 避免同一 DOM 节点重复 registerPointerDownOutside */
  const outsidePanelEl: { current: HTMLElement | null } = { current: null };
  /** 拖动 SV/色相时合并 `emitDraftInput` 的 rAF id；关闭浮层时须 cancel，避免卸载后仍回调 */
  const draftInputRafId: { current: number } = { current: 0 };
  /**
   * 打开面板瞬间的外部 `value` 快照（#rrggbb）；取消 / 点外部 / Esc 时恢复并派发事件。
   */
  const panelOriginHex: { current: string } = { current: "#000000" };
  /**
   * 关闭浮层后同步 effect 可能**连续执行多次**（`panelOpen` 与 `props.value` 各触发一次）；
   * 单次布尔跳过会在第二次执行时仍用**尚未更新的旧 `value`** 调用 `applyHexToHsv`，把颜色冲回默认。
   * 此处为剩余跳过次数（通常设为 2）。
   */
  const skipClosedPropSyncRemaining: { current: number } = { current: 0 };
  /**
   * 确定/取消关闭瞬间 `props.value` 常滞后；在父级追上之前，触发器与隐藏域用此色展示，避免闪回默认色。
   * 当 `controlledHex()` 与该值一致时于 effect 内清回 `null`。
   */
  const closedOptimisticHexRef: { current: string | null } = { current: null };

  /**
   * 命令式 API 实现引用：始终指向最新闭包，避免 `useEffect` 依赖项膨胀。
   */
  const implRef = useRef({
    openFloatingAt: (_cx: number, _cy: number) => {},
    confirmPanel: () => {},
    cancelPanel: () => {},
  });

  /** 移除「点外部关闭」监听，避免泄漏或重复注册 */
  const clearOutsidePointerDismiss = () => {
    outsidePointerCleanup.dispose?.();
    outsidePointerCleanup.dispose = null;
    pickerAnchorScrollCleanup.dispose?.();
    pickerAnchorScrollCleanup.dispose = null;
    outsidePanelEl.current = null;
    const caf = globalThis.cancelAnimationFrame;
    if (draftInputRafId.current !== 0 && typeof caf === "function") {
      caf.call(globalThis, draftInputRafId.current);
    }
    draftInputRafId.current = 0;
  };

  /** 从当前 HSV 写回 RGB 草稿与 hex 草稿 */
  const syncDraftsFromHsv = () => {
    const { r, g, b } = hsvToRgb(hue.value, sat.value, val.value);
    const hex = rgbToHex(r, g, b);
    hexDraft.value = hex;
    rDraft.value = r;
    gDraft.value = g;
    bDraft.value = b;
    return hex;
  };

  /**
   * 用 HEX 更新 HSV 与草稿（解析失败则忽略）。
   *
   * @param hex - 颜色字符串
   */
  const applyHexToHsv = (hex: string) => {
    const n = normalizeHex(hex);
    const rgb = parseHexRgb(n);
    if (!rgb) return;
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    hue.value = hsv.h;
    sat.value = hsv.s;
    val.value = hsv.v;
    hexDraft.value = n;
    rDraft.value = rgb.r;
    gDraft.value = rgb.g;
    bDraft.value = rgb.b;
  };

  /**
   * 提交当前 HSV 到隐藏域并向父级派发事件。
   *
   * @param fireChange - 是否同时派发 `change`（取消恢复时需 `true` 以便只绑 `onChange` 的表单也能回退）
   */
  const commitColor = (fireChange: boolean) => {
    const hex = syncDraftsFromHsv();
    commitMaybeSignal(props.value, hex);
    const el = hiddenRef.current;
    if (!el) return;
    dispatchColorInputEvent(el, hex, "input", onInput);
    if (fireChange) dispatchColorInputEvent(el, hex, "change", onChange);
  };

  /**
   * 将当前草稿同步到父级（仅 `input`）；打开面板期间拖动/输入时调用。
   */
  const emitDraftInput = () => commitColor(false);

  /**
   * 拖动 SV/色相条：`pointermove` 极密，每帧至多派发一次 `input`，减轻父级重绘把浮层子树换掉后点外监听误判。
   */
  const scheduleEmitDraftInputFromDrag = () => {
    if (draftInputRafId.current !== 0) return;
    const raf = globalThis.requestAnimationFrame;
    if (typeof raf !== "function") {
      emitDraftInput();
      return;
    }
    draftInputRafId.current = raf.call(globalThis, () => {
      draftInputRafId.current = 0;
      emitDraftInput();
    });
  };

  /**
   * `pointerup`：取消未执行的 rAF 并立即同步，保证松手后受控值与草稿一致。
   */
  const flushDraftInputAfterDrag = () => {
    const caf = globalThis.cancelAnimationFrame;
    if (draftInputRafId.current !== 0 && typeof caf === "function") {
      caf.call(globalThis, draftInputRafId.current);
      draftInputRafId.current = 0;
    }
    emitDraftInput();
  };

  /**
   * 确定：`input`+`change` 提交当前色，记录乐观色、跳过多次 props 回灌，再关浮层。
   */
  const confirmPanel = () => {
    if (!panelOpen.value) return;
    clearOutsidePointerDismiss();
    clearDropdownEsc();
    commitColor(true);
    const appliedHex = syncDraftsFromHsv();
    closedOptimisticHexRef.current = appliedHex;
    skipClosedPropSyncRemaining.current = 2;
    panelLayout.value = "anchored";
    panelOpen.value = false;
    /** 须先于 `onApply`：宿主据此关闭「取色中」门禁，避免确认当帧仍禁止/误同步受控 `value` */
    props.onOpenChange?.(false);
    props.onApply?.(appliedHex);
  };

  /**
   * 取消：恢复打开前颜色并通知父级（`input` + `change`），再关闭浮层。
   */
  const cancelPanel = () => {
    if (!panelOpen.value) return;
    clearOutsidePointerDismiss();
    clearDropdownEsc();
    const origin = panelOriginHex.current;
    applyHexToHsv(origin);
    const n = normalizeHex(origin);
    commitMaybeSignal(props.value, n);
    const el = hiddenRef.current;
    if (el) {
      dispatchColorInputEvent(el, origin, "input", onInput);
      dispatchColorInputEvent(el, origin, "change", onChange);
    }
    closedOptimisticHexRef.current = normalizeHex(origin);
    skipClosedPropSyncRemaining.current = 2;
    panelLayout.value = "anchored";
    panelOpen.value = false;
    props.onOpenChange?.(false);
  };

  /**
   * 在微任务中置 `panelOpen`：与 {@link DatePicker} 等一致，减轻 document 委托 `click` 同帧误关浮层。
   */
  const openFloatingAt = (clientX: number, clientY: number) => {
    if (props.disabled) return;
    if (panelOpen.value) cancelPanel();
    globalThis.queueMicrotask(() => {
      if (props.disabled) return;
      closedOptimisticHexRef.current = null;
      const origin = controlledHex();
      panelOriginHex.current = origin;
      applyHexToHsv(origin);
      const p = clampFloatingPanelPosition(clientX, clientY);
      panelFloatX.value = p.left;
      panelFloatY.value = p.top;
      panelLayout.value = "floating";
      panelOpen.value = true;
      registerDropdownEsc(cancelPanel);
      props.onOpenChange?.(true);
    });
  };

  /**
   * 打开面板：记录快照、灌入 HSV，并注册 Esc 为取消（与 DatePicker 浮层一致）。
   * `queueMicrotask` 同 {@link openFloatingAt}。
   */
  const openPanel = () => {
    if (props.disabled) return;
    globalThis.queueMicrotask(() => {
      if (props.disabled) return;
      closedOptimisticHexRef.current = null;
      /** 与 DatePicker `panelAttach` 对齐：表格等场景避免 absolute 浮层被裁切 */
      panelLayout.value = (props.panelAttach ?? "anchored") === "viewport"
        ? "viewport"
        : "anchored";
      const origin = controlledHex();
      panelOriginHex.current = origin;
      applyHexToHsv(origin);
      panelOpen.value = true;
      registerDropdownEsc(cancelPanel);
      props.onOpenChange?.(true);
    });
  };

  implRef.current.openFloatingAt = openFloatingAt;
  implRef.current.confirmPanel = confirmPanel;
  implRef.current.cancelPanel = cancelPanel;

  /**
   * 向父级暴露命令式打开/关闭（与 {@link ColorPickerProps.pickerRef} 同步）。
   */
  useEffect(() => {
    const pr = props.pickerRef;
    if (!pr) return;
    const handle: ColorPickerHandle = {
      openAtClientPoint(cx, cy) {
        implRef.current.openFloatingAt(cx, cy);
      },
      openFromPointerEvent(ev) {
        implRef.current.openFloatingAt(ev.clientX, ev.clientY);
      },
      close(commit) {
        if (commit) implRef.current.confirmPanel();
        else implRef.current.cancelPanel();
      },
    };
    pr.current = handle;
    return () => {
      if (pr.current === handle) pr.current = null;
    };
  }, [props.pickerRef]);

  /**
   * 面板关闭后用 `props.value` 同步内部 HSV；先消耗跳过计数，再在「乐观色与 props 不一致」时拒绝用旧 props 回灌。
   */
  useEffect(() => {
    if (panelOpen.value) return;
    const v = committedHexScalar;
    if (skipClosedPropSyncRemaining.current > 0) {
      skipClosedPropSyncRemaining.current -= 1;
      return;
    }
    const opt = closedOptimisticHexRef.current;
    if (opt != null) {
      if (normalizeHex(v) !== normalizeHex(opt)) {
        return;
      }
      closedOptimisticHexRef.current = null;
    }
    applyHexToHsv(v);
    const el = hiddenRef.current;
    if (el && el.value !== v) el.value = v;
  }, [committedHexScalar, panelOpen.value]);

  /**
   * 根据指针在 SV 平面上的位置更新饱和度与明度（比例按平面宽高 0～1 夹取），并 `emitDraftInput`。
   */
  const pickSvFromPointer = (
    clientX: number,
    clientY: number,
    rect: DOMRect,
  ) => {
    const w = rect.width || 1;
    const h = rect.height || 1;
    const x = (clientX - rect.left) / w;
    const y = (clientY - rect.top) / h;
    sat.value = Math.min(1, Math.max(0, x));
    val.value = Math.min(1, Math.max(0, 1 - y));
    syncDraftsFromHsv();
    scheduleEmitDraftInputFromDrag();
  };

  /** 拖拽色相条并同步父级 `onInput` */
  const pickHueFromPointer = (clientX: number, rect: DOMRect) => {
    const t = (clientX - rect.left) / rect.width;
    hue.value = Math.min(360, Math.max(0, t * 360));
    syncDraftsFromHsv();
    scheduleEmitDraftInputFromDrag();
  };

  /**
   * 浏览器支持时打开系统取色器（Chromium EyeDropper API）。
   */
  const tryEyeDropper = async () => {
    const Ed = (globalThis as {
      EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
    }).EyeDropper;
    if (!Ed) return;
    try {
      const result = await new Ed().open();
      if (result?.sRGBHex) {
        applyHexToHsv(result.sRGBHex);
        emitDraftInput();
      }
    } catch {
      /* 用户取消 */
    }
  };

  /**
   * 触发器与隐藏域展示用 HEX：打开时用当前 HSV 预览；关闭后若 props 未追上确定/取消则用乐观色。
   */
  const triggerDisplayHexNow = (): string => {
    const propHex = controlledHex();
    const preview = hsvToRgb(hue.value, sat.value, val.value);
    const previewHex = rgbToHex(preview.r, preview.g, preview.b);
    const closedSurfaceHex =
      !panelOpen.value && closedOptimisticHexRef.current != null &&
        normalizeHex(propHex) !== normalizeHex(closedOptimisticHexRef.current)
        ? closedOptimisticHexRef.current
        : propHex;
    return panelOpen.value ? previewHex : closedSurfaceHex;
  };

  /** 仅色块触发：窄布局，无 HEX 文案与后缀图标 */
  const swatchOnly = variant === "swatch";

  const rootClass = twMerge(
    hideTrigger
      ? "pointer-events-none fixed top-0 left-0 z-0 m-0 h-0 w-0 overflow-visible border-0 p-0"
      : "relative",
    !hideTrigger &&
      (swatchOnly ? "inline-block w-auto min-w-0" : "w-full min-w-[80px]"),
    className,
  );

  const layout = panelLayout.value;
  const floatingStyle = layout === "floating"
    ? {
      left: `${panelFloatX.value}px`,
      top: `${panelFloatY.value}px`,
    }
    : undefined;

  const panelClass = twMerge(
    "pointer-events-auto flex min-w-[288px] max-w-[min(100vw-1rem,20rem)] flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-600 dark:bg-slate-800",
    layout === "floating" || layout === "viewport"
      ? twMerge("fixed", pickerPortalZClass)
      : "absolute left-0 top-full z-1070 mt-1",
  );

  const displayHex = triggerDisplayHexNow();

  /**
   * 勿再包一层仅返回子树的函数且在内层读 `panelOpen`：与 {@link DatePicker} 相同，否则会替换根节点、卸下触发器。
   * 浮层在 `panelOpen` 时挂载；面板内交互区见 {@link ColorPickerPanelInterior}。
   */
  return (
    <div class={rootClass} data-ui-colorpicker-root="">
      <input
        ref={hiddenRef}
        type="hidden"
        name={name}
        id={id ? `${id}-value` : undefined}
        value={displayHex}
        disabled={disabled}
        tabindex={-1}
        aria-hidden
      />
      {!hideTrigger && (
        <button
          /**
           * 触发器 DOM：点外关闭与几何同步用；须用函数 ref，勿对 `triggerRef` 使用对象式 `ref`。
           */
          ref={(el: HTMLButtonElement | null) => {
            triggerRef.current = el;
          }}
          type="button"
          id={id}
          disabled={disabled}
          class={twMerge(
            swatchOnly
              ? "box-border flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white p-1 text-left dark:border-slate-600 dark:bg-slate-800"
              : "flex h-10 w-full min-w-[80px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 text-left text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100",
            !swatchOnly && showSuffixIcon && "pr-9",
            disabled && "cursor-not-allowed opacity-50",
            !disabled &&
              "cursor-pointer hover:border-slate-400 dark:hover:border-slate-500",
            controlBlueFocusRing(!hideFocusRing),
          )}
          aria-expanded={panelOpen.value}
          aria-haspopup="dialog"
          aria-label={swatchOnly ? `选择颜色，当前 ${displayHex}` : undefined}
          title={swatchOnly ? displayHex : ""}
          /**
           * 打开后不在触发器上「再点即确定」：选色仅改草稿，须点面板内「确定」或点外部/Esc 关闭（与 DatePicker 等一致）。
           */
          onClick={() => {
            if (panelOpen.value) return;
            openPanel();
          }}
        >
          <span
            class={swatchOnly
              ? "block h-full w-full min-h-0 min-w-0 rounded border border-slate-200 dark:border-slate-600"
              : "h-6 w-6 shrink-0 rounded border border-slate-200 dark:border-slate-600"}
            style={{ backgroundColor: displayHex }}
            aria-hidden
          />
          {!swatchOnly && (
            <span class="min-w-0 flex-1 truncate font-mono text-xs uppercase">
              {displayHex}
            </span>
          )}
        </button>
      )}
      {!hideTrigger && !swatchOnly && showSuffixIcon && (
        <span
          class="pointer-events-none absolute inset-y-0 right-0 flex w-9 shrink-0 items-center justify-center text-slate-500 dark:text-slate-400"
          aria-hidden
        >
          <IconPalette size="sm" />
        </span>
      )}
      {/* 取色主面板：`anchored` 相对根；`floating` 命令式坐标；`viewport` 触发器打开 + 视口几何同步 */}
      {panelOpen.value && (
        <div
          role="dialog"
          aria-label="颜色选择"
          class={panelClass}
          style={floatingStyle}
          ref={(el: HTMLElement | null) => {
            if (el == null) {
              clearOutsidePointerDismiss();
              return;
            }
            if (el === outsidePanelEl.current) return;
            clearOutsidePointerDismiss();
            outsidePanelEl.current = el;
            /**
             * 延后注册：避免打开同一次 pointerdown 误关；锚定模式另订阅滚动以贴齐触发器。
             */
            globalThis.queueMicrotask(() => {
              if (outsidePanelEl.current !== el) return;
              const lay = panelLayout.value;
              if (lay === "floating") {
                outsidePointerCleanup.dispose = registerPointerDownOutside(
                  el,
                  cancelPanel,
                  hideTrigger ? undefined : triggerRef,
                );
              } else if (lay === "viewport") {
                registerPickerFixedOverlayPositionAndOutsideClick(
                  el,
                  triggerRef,
                  cancelPanel,
                  outsidePointerCleanup,
                  pickerAnchorScrollCleanup,
                  { panelMinWidth: 288 },
                  undefined,
                );
              } else {
                registerPickerFixedOverlayPositionAndOutsideClick(
                  el,
                  triggerRef,
                  cancelPanel,
                  outsidePointerCleanup,
                  pickerAnchorScrollCleanup,
                  { panelMinWidth: 288 },
                  { fixedToViewport: false },
                );
              }
            });
          }}
        >
          <ColorPickerPanelInterior
            hue={hue}
            sat={sat}
            val={val}
            hexDraft={hexDraft}
            rDraft={rDraft}
            gDraft={gDraft}
            bDraft={bDraft}
            showToolbar={showToolbar}
            hideFocusRing={hideFocusRing}
            id={id}
            pickSvFromPointer={pickSvFromPointer}
            pickHueFromPointer={pickHueFromPointer}
            tryEyeDropper={tryEyeDropper}
            applyHexToHsv={applyHexToHsv}
            emitDraftInput={emitDraftInput}
            flushDraftInputAfterDrag={flushDraftInputAfterDrag}
            confirmPanel={confirmPanel}
            cancelPanel={cancelPanel}
          />
        </div>
      )}
    </div>
  );
}
