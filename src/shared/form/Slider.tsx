/**
 * Slider 滑块（Preact）。
 * 支持 min、max、step、value；竖排（vertical）、双滑块（range）；light/dark 主题。
 *
 * 原生 `input` **不写** `value` prop，由 `ref` + `useEffect` 在「非指针按下」时同步到 `el.value`；拖动期间跳过同步。
 * `onChange` 仅在松手时触发；拖动中**不得**在 `input` 同步帧内立刻 {@link commitMaybeSignal}（父级重绘会打断浏览器原生 range 拖动），改为 rAF 合并写回；`pointerup` 前 {@link flushSingleRaf} 再清拖动标记以防松手回弹。
 *
 * **受控 Signal**：传入的 `value` 须为**跨渲染稳定**的同一 Signal 实例（如 `useMemo(() => signal(0), [])`）。
 * 若在父组件 render 里每次执行 `signal()`，重渲染会换新实例（初值重置），本组件 `effect` 会用新实例上的初值写回 DOM，表现为拇指回弹、文案不跟。
 */

import type { JSX } from "preact";
import { effect } from "@preact/signals";
import { twMerge } from "tailwind-merge";
import { useEffect, useRef } from "preact/hooks";
import {
  commitMaybeSignal,
  type MaybeSignal,
  readMaybeSignal,
} from "./maybe-signal.ts";

export interface SliderProps {
  /** 当前值；见 {@link MaybeSignal}（单值或 range 元组） */
  value?: MaybeSignal<number | [number, number]>;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 步进 */
  step?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否竖排显示 */
  vertical?: boolean;
  /** 是否双滑块范围选择（value 为 [number, number]） */
  range?: boolean;
  /**
   * 变更回调：仅在原生 `change`（松手）时触发。拖动中不会调用，避免父级 signal 每帧更新导致子树重绘、换掉 input。
   */
  onChange?: (e: Event) => void;
  /** 拖动过程回调（经 rAF 合并）；需要拖动时同步父级 state 时请用本回调。range 时合成事件 target.value 为 [minVal, maxVal] */
  onInput?: (e: Event) => void;
  /** 额外 class（作用于容器） */
  class?: string;
  /** 原生 name */
  name?: string;
  /** 原生 id */
  id?: string;
}

/**
 * 在下一帧同步 DOM（双轨 ref 挂载时机）；浏览器用 rAF，SSR/Hybrid（Deno 等）无 rAF 时用 microtask，避免 `requestAnimationFrame is not a function`。
 */
function scheduleAfterPaint(fn: () => void): void {
  const raf = globalThis.requestAnimationFrame;
  if (typeof raf === "function") {
    raf.call(globalThis, fn);
  } else {
    queueMicrotask(fn);
  }
}

const trackCls =
  "rounded-full bg-slate-200 dark:bg-slate-600 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 dark:[&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 dark:[&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer";

/** 单滑块轨道：横向 */
const trackHorizontalCls = "h-2 w-full";

/**
 * 横向 range：原生轨道透明，由底层 div 画灰轨与蓝条，两枚 input 叠放只负责拇指交互。
 * - input 设 pointer-events-none，仅 thumb 设 pointer-events-auto，避免叠放时上层整条轨道抢走左侧拖动（误拖成另一枚）。
 * - WebKit 拇指相对 h-2 轨道易偏下，用 -mt-[6px] 与 track 高约对齐（h-5 thumb、h-2 track）。
 */
const rangeOverlayThumbCls =
  "pointer-events-none absolute inset-x-0 top-1/2 z-[3] h-10 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed disabled:opacity-50 " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:-mt-[6px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 dark:[&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow " +
  "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-blue-600 dark:[&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:-translate-y-1.5 " +
  "[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent";

/**
 * 横向 range 蓝色区间条：直接写 DOM，拖动中父级 committed 未变时也能跟手更新。
 */
function paintRangeFillBar(
  el: HTMLDivElement | null | undefined,
  low: number,
  high: number,
  min: number,
  max: number,
): void {
  if (el == null) return;
  const span = max - min || 1;
  const a = Math.min(max, Math.max(min, low));
  const b = Math.min(max, Math.max(min, high));
  const o0 = Math.min(a, b);
  const o1 = Math.max(a, b);
  const p0 = ((o0 - min) / span) * 100;
  const p1 = ((o1 - min) / span) * 100;
  el.style.left = `${Math.min(p0, p1)}%`;
  el.style.width = `${Math.abs(p1 - p0)}%`;
}

/**
 * 通知 range 受控方：合成事件 target.value 为 [a, b]（与文档示例一致）。
 */
function emitRangeTuple(
  payload: [number, number],
  handler?: (e: Event) => void,
) {
  if (!handler) return;
  const e = {
    target: { value: payload },
  } as unknown as Event;
  handler(e);
}

/**
 * 在捕获阶段监听全局 pointerup/cancel，松手后清除「正在拖动」标记（含在轨道外释放的情况）。
 *
 * **须先于 `flag = false` 调用 `beforeClear`**：捕获阶段 `pointerup` 往往早于原生 `change`，
 * 若先清标记，`useEffect` 会用尚未被最后一次 `input`/rAF 写入的 Signal 去同步 `input.value`，表现为松手回弹；
 * range 双轨叠放时更明显。`beforeClear` 内应 {@link flushSingleRaf} / {@link flushRangeRaf}，再允许 effect 同步 DOM。
 *
 * @param flag - 拖动中标记 ref
 * @param beforeClear - 在置 `flag` 为 false 之前执行（可选）
 */
function armPointerDragEnd(
  flag: { current: boolean },
  beforeClear?: () => void,
) {
  const end = () => {
    try {
      beforeClear?.();
    } finally {
      flag.current = false;
      globalThis.removeEventListener("pointerup", end, true);
      globalThis.removeEventListener("pointercancel", end, true);
    }
  };
  globalThis.addEventListener("pointerup", end, true);
  globalThis.addEventListener("pointercancel", end, true);
}

export function Slider(props: SliderProps): JSX.Element {
  const {
    value,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    vertical = false,
    range = false,
    onChange,
    onInput,
    class: className,
    name,
    id,
  } = props;

  const singleInputRef = useRef<HTMLInputElement>(null);
  const rangeLowRef = useRef<HTMLInputElement>(null);
  const rangeHighRef = useRef<HTMLInputElement>(null);
  /** 横向 range 中间蓝色填充（样式由 paintRangeFillBar 维护） */
  const rangeFillBarRef = useRef<HTMLDivElement>(null);
  /**
   * 始终指向最新 `value` prop，供 `requestAnimationFrame` 等异步路径使用。
   * 闭包里的 `value` 可能是旧渲染的引用；跨包 Signal 时写错对象会导致「文案不变、松手回弹」。
   */
  const valueRef = useRef(value);
  valueRef.current = value;

  /** 单滑块：指针在轨道上按下后为 true，直到全局 pointerup/cancel 或 change */
  const pointerDraggingSingle = useRef(false);
  /** range：任一枚拇指拖动中 */
  const pointerDraggingRange = useRef(false);

  /** 单滑块：合并「写 Signal + 可选 onInput」到下一帧，避免同步重绘导致拖不动。 */
  const singleRaf = useRef<number | null>(null);
  /** 最后一次 `input` 事件，供 rAF / flush 里调用可选 `onInput`（数值始终从 {@link singleInputRef} 读）。 */
  const pendingSingleEvent = useRef<Event | null>(null);
  /**
   * 每次 `input` 同步阶段写入的 clamp 后数值。
   * 捕获阶段 `pointerup` 早于浏览器把最终值写入 `input.value` 时，`flushSingleRaf` 读 DOM 会得到旧数（如 50），须用本 ref 兜底。
   */
  const lastSingleDragNumericRef = useRef<number | null>(null);
  const rangeRaf = useRef<number | null>(null);
  const pendingRangePayload = useRef<[number, number] | null>(null);
  /** range：与单滑块同理，pointerup 时 pending rAF 可能已空，用最后一次 onInput 算出的元组。 */
  const lastRangeDragTupleRef = useRef<[number, number] | null>(null);

  /**
   * 取消待处理 rAF：把当前数值 {@link commitMaybeSignal}，再补发挂起的 `onInput`。
   *
   * @param e - 若为原生 `change` 事件，**优先**用 `e.target.value`（浏览器认定的最终值）；
   *   此时 `singleInputRef` 上的字符串可能已被 `effect` 同步回旧 Signal，不能再只读 ref。
   */
  const flushSingleRaf = (e?: Event) => {
    const fromChange = e?.target instanceof HTMLInputElement
      ? clamp(parseFloat((e.target as HTMLInputElement).value) || min)
      : null;

    const el0 = singleInputRef.current;
    const fromDom = el0 != null ? clamp(parseFloat(el0.value) || min) : null;
    const fromLast = lastSingleDragNumericRef.current;

    /** 数值选用顺序：`change` 目标 > input/ref 与 ref 不一致时的「最后 input」> 拖动中 ref > 普通 DOM。 */
    let nCommit: number | null = null;
    if (fromChange !== null) {
      nCommit = fromChange;
    } else if (
      fromLast !== null &&
      fromDom !== null &&
      fromLast !== fromDom
    ) {
      nCommit = fromLast;
    } else if (pointerDraggingSingle.current && fromLast !== null) {
      nCommit = fromLast;
    } else {
      nCommit = fromDom ?? fromLast;
    }

    /**
     * `change` 先于捕获 `pointerup` 时：`handleSingleChange` 已 flush 并清 ref、清 dragging；
     * 随后 `armPointerDragEnd` 的 `beforeClear` 再 flush 时 DOM 可能仍被旧 Signal 的 effect 写回，勿用该旧字符串覆盖刚写入的 Signal。
     */
    const v0 = valueRef.current;
    const canCommitSignal = v0 != null &&
      typeof v0 === "object" &&
      !Array.isArray(v0) &&
      "value" in v0;
    if (
      canCommitSignal &&
      e === undefined &&
      fromChange === null &&
      fromLast === null &&
      !pointerDraggingSingle.current
    ) {
      const committed = readMaybeSignal(v0);
      if (
        typeof committed === "number" &&
        nCommit !== null &&
        nCommit !== committed
      ) {
        nCommit = committed;
      }
    }

    if (singleRaf.current !== null) {
      globalThis.cancelAnimationFrame(singleRaf.current);
      singleRaf.current = null;
    }
    if (nCommit !== null) {
      commitMaybeSignal(valueRef.current, nCommit);
    }
    /** 本次 flush 后不再沿用，避免与后续程序化 `value` 冲突。 */
    lastSingleDragNumericRef.current = null;
    const move = onInput;
    const ev = pendingSingleEvent.current;
    pendingSingleEvent.current = null;
    if (ev != null && move) move(ev);
  };

  /**
   * 单滑块拖动：`input` 只登记事件并 rAF 合并；**不在本 tick 同步 commit**，以免打断原生拖动。
   */
  const scheduleSingleNotify = (e: Event) => {
    const t = e.target as HTMLInputElement | undefined;
    if (t != null) {
      lastSingleDragNumericRef.current = clamp(parseFloat(t.value) || min);
    }
    if (onInput) pendingSingleEvent.current = e;
    if (singleRaf.current !== null) return;
    singleRaf.current = globalThis.requestAnimationFrame(() => {
      singleRaf.current = null;
      const inputEl = singleInputRef.current;
      if (inputEl != null) {
        const n = clamp(parseFloat(inputEl.value) || min);
        lastSingleDragNumericRef.current = n;
        commitMaybeSignal(valueRef.current, n);
      }
      const move = onInput;
      const ev = pendingSingleEvent.current;
      if (move && ev) {
        pendingSingleEvent.current = null;
        move(ev);
      }
    });
  };

  /**
   * range：合并写 Signal + `onInput`，避免同步重绘打断双轨拖动。
   */
  const scheduleRangeNotify = (
    payload: [number, number],
    userOnInput?: (e: Event) => void,
  ) => {
    pendingRangePayload.current = payload;
    if (rangeRaf.current !== null) return;
    rangeRaf.current = globalThis.requestAnimationFrame(() => {
      rangeRaf.current = null;
      const p = pendingRangePayload.current;
      pendingRangePayload.current = null;
      if (p) {
        commitMaybeSignal(valueRef.current, p);
        emitRangeTuple(p, userOnInput);
      }
    });
  };

  /**
   * 松手或 pointerup 前：把最后一帧 range 写入 Signal。
   */
  const flushRangeRaf = () => {
    if (rangeRaf.current !== null) {
      globalThis.cancelAnimationFrame(rangeRaf.current);
      rangeRaf.current = null;
    }
    const move = onInput;
    let p = pendingRangePayload.current;
    pendingRangePayload.current = null;
    if (
      p == null &&
      pointerDraggingRange.current &&
      lastRangeDragTupleRef.current != null
    ) {
      p = lastRangeDragTupleRef.current;
    }
    if (p) {
      commitMaybeSignal(valueRef.current, p);
      if (move) emitRangeTuple(p, move);
    }
  };

  /**
   * 用 `@preact/signals` 的 {@link effect} 读 `valueRef.current` 并同步 DOM。
   * `useComputed` + `useEffect` 仍可能在部分运行时拿不到 Signal 订阅；`effect` 在 signals 管线内读 `.value`，
   * Signal 更新后会用最新 `resolved` 写回，避免 `resolved:50 / dom:20` 的盖写。
   */
  useEffect(() => {
    const rangeEff = range;
    const verticalEff = vertical;
    const minEff = min;
    const maxEff = max;

    const dispose = effect(() => {
      const resolved = readMaybeSignal(valueRef.current) ??
        (0 as number | [number, number]);

      const clampLocal = (v: number) => Math.min(maxEff, Math.max(minEff, v));

      if (rangeEff) {
        if (pointerDraggingRange.current) return;
        const v0 = Array.isArray(resolved) ? resolved[0] : (resolved as number);
        const v1 = Array.isArray(resolved) ? resolved[1] : (resolved as number);
        const low = clampLocal(typeof v0 === "number" ? v0 : minEff);
        const high = clampLocal(typeof v1 === "number" ? v1 : maxEff);
        const ordered: [number, number] = low <= high
          ? [low, high]
          : [high, low];
        const s0 = String(ordered[0]);
        const s1 = String(ordered[1]);
        const applyRangeDom = () => {
          const lo = rangeLowRef.current;
          const hi = rangeHighRef.current;
          if (lo && lo.value !== s0) lo.value = s0;
          if (hi && hi.value !== s1) hi.value = s1;
          if (!verticalEff) {
            paintRangeFillBar(
              rangeFillBarRef.current,
              ordered[0],
              ordered[1],
              minEff,
              maxEff,
            );
          }
        };
        applyRangeDom();
        if (!rangeLowRef.current || !rangeHighRef.current) {
          scheduleAfterPaint(() => {
            if (pointerDraggingRange.current) return;
            applyRangeDom();
          });
        }
      } else {
        if (pointerDraggingSingle.current) return;
        const num = typeof resolved === "number"
          ? resolved
          : (resolved as [number, number])[0];
        const n = clampLocal(typeof num === "number" ? num : minEff);
        const s = String(n);
        const applySingleDom = () => {
          const el = singleInputRef.current;
          if (el && el.value !== s) el.value = s;
        };
        applySingleDom();
        if (!singleInputRef.current) {
          scheduleAfterPaint(() => {
            if (pointerDraggingSingle.current) return;
            applySingleDom();
          });
        }
      }
    });

    return () => dispose();
  }, [value, min, max, range, vertical]);

  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  /** 仅 onInput 参与拖动中的 rAF 通知；onChange 只在松手 change 时触发，避免父级重绘换节点。 */
  const rangeOnMove = onInput;

  if (range) {
    /**
     * 区间逻辑以两枚 input 的 DOM 为准（onInput/onChange），避免闭包滞后；蓝色条见 paintRangeFillBar。
     */
    const onLowInput = (e: Event) => {
      const el = e.target as HTMLInputElement;
      const newLow = clamp(parseFloat(el.value) || min);
      const other = clamp(
        parseFloat(rangeHighRef.current?.value ?? String(max)) || max,
      );
      const o0 = Math.min(newLow, other);
      const o1 = Math.max(newLow, other);
      if (!vertical) {
        paintRangeFillBar(rangeFillBarRef.current, o0, o1, min, max);
      }
      const next: [number, number] = [o0, o1];
      lastRangeDragTupleRef.current = next;
      scheduleRangeNotify(next, rangeOnMove);
    };
    const onLowChange = (e: Event) => {
      pointerDraggingRange.current = false;
      flushRangeRaf();
      const el = e.target as HTMLInputElement;
      const newLow = clamp(parseFloat(el.value) || min);
      const other = clamp(
        parseFloat(rangeHighRef.current?.value ?? String(max)) || max,
      );
      const o0 = Math.min(newLow, other);
      const o1 = Math.max(newLow, other);
      if (!vertical) {
        paintRangeFillBar(rangeFillBarRef.current, o0, o1, min, max);
      }
      const tuple: [number, number] = [o0, o1];
      commitMaybeSignal(valueRef.current, tuple);
      emitRangeTuple(tuple, onChange);
    };

    const onHighInput = (e: Event) => {
      const el = e.target as HTMLInputElement;
      const newHigh = clamp(parseFloat(el.value) || max);
      const other = clamp(
        parseFloat(rangeLowRef.current?.value ?? String(min)) || min,
      );
      const o0 = Math.min(other, newHigh);
      const o1 = Math.max(other, newHigh);
      if (!vertical) {
        paintRangeFillBar(rangeFillBarRef.current, o0, o1, min, max);
      }
      const next: [number, number] = [o0, o1];
      lastRangeDragTupleRef.current = next;
      scheduleRangeNotify(next, rangeOnMove);
    };
    const onHighChange = (e: Event) => {
      pointerDraggingRange.current = false;
      flushRangeRaf();
      const el = e.target as HTMLInputElement;
      const newHigh = clamp(parseFloat(el.value) || max);
      const other = clamp(
        parseFloat(rangeLowRef.current?.value ?? String(min)) || min,
      );
      const o0 = Math.min(other, newHigh);
      const o1 = Math.max(other, newHigh);
      if (!vertical) {
        paintRangeFillBar(rangeFillBarRef.current, o0, o1, min, max);
      }
      const tupleH: [number, number] = [o0, o1];
      commitMaybeSignal(valueRef.current, tupleH);
      emitRangeTuple(tupleH, onChange);
    };

    const onRangePointerDown = () => {
      if (disabled) return;
      lastRangeDragTupleRef.current = null;
      pointerDraggingRange.current = true;
      armPointerDragEnd(pointerDraggingRange, () => {
        flushRangeRaf();
      });
    };

    /** 竖向与横向单轨一致 h-2 细轨，拇指仍为 h-5，旋转后视觉上滑线细、滑点大于滑线 */
    const trackClsWithDir = vertical
      ? twMerge(trackCls, "w-40 h-2 -rotate-90")
      : twMerge(trackCls, trackHorizontalCls);
    const wrapperCls = vertical
      ? "flex flex-row gap-2 items-center min-h-40 min-w-0 h-40"
      : "";
    const singleWrapCls = vertical
      ? "flex items-center justify-center shrink-0"
      : "";

    if (!vertical) {
      return (
        <div class={twMerge("relative w-full py-1", className)}>
          <div class="relative h-10 w-full">
            <div
              class="pointer-events-none absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200 dark:bg-slate-600"
              aria-hidden="true"
            />
            <div
              ref={rangeFillBarRef}
              class="pointer-events-none absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-blue-600 dark:bg-blue-500"
              style={{ left: "0%", width: "0%" }}
              aria-hidden="true"
            />
            <input
              ref={rangeLowRef}
              type="range"
              aria-label="范围最小值"
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              class={rangeOverlayThumbCls}
              onPointerDown={onRangePointerDown}
              onInput={onLowInput}
              onChange={onLowChange}
            />
            <input
              ref={rangeHighRef}
              type="range"
              aria-label="范围最大值"
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              class={rangeOverlayThumbCls}
              onPointerDown={onRangePointerDown}
              onInput={onHighInput}
              onChange={onHighChange}
            />
          </div>
        </div>
      );
    }

    return (
      <div class={twMerge(wrapperCls, className)}>
        <div class={singleWrapCls}>
          <input
            ref={rangeLowRef}
            type="range"
            aria-label="范围最小值"
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            class={trackClsWithDir}
            onPointerDown={onRangePointerDown}
            onInput={onLowInput}
            onChange={onLowChange}
          />
        </div>
        <div class={singleWrapCls}>
          <input
            ref={rangeHighRef}
            type="range"
            aria-label="范围最大值"
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            class={trackClsWithDir}
            onPointerDown={onRangePointerDown}
            onInput={onHighInput}
            onChange={onHighChange}
          />
        </div>
      </div>
    );
  }

  /** 竖向：旋转前 w-40=轨长、h-2=与横向相同的细轨宽（旋转后即为竖条粗细） */
  const trackClsWithDir = vertical
    ? twMerge(trackCls, "w-40 h-2")
    : twMerge(trackCls, trackHorizontalCls);
  const wrapperCls = vertical
    ? "inline-flex justify-center items-center h-40 min-h-40 min-w-5 shrink-0 [&>input]:rotate-[-90deg] [&>input]:w-40 [&>input]:h-2"
    : "";

  /**
   * 拖动中只调度 rAF 写 Signal；不在 `input` 同步阶段 commit，避免父级重绘导致原生 range 拖不动。
   */
  const handleSingleInput = (e: Event) => {
    scheduleSingleNotify(e);
  };

  const handleSingleChange = (e: Event) => {
    /** 先 flush（传入 `change`，优先用 `e.target`），再清拖动；避免 `pointerup` 已把 dragging 清掉后无法走 ref 分支且 ref 读错。 */
    flushSingleRaf(e);
    pointerDraggingSingle.current = false;
    if (onChange) onChange(e);
  };

  const onSinglePointerDown = () => {
    if (disabled) return;
    /** 避免沿用上一次的 `pendingSingleEvent` 误触发 `onInput`。 */
    pendingSingleEvent.current = null;
    lastSingleDragNumericRef.current = null;
    pointerDraggingSingle.current = true;
    armPointerDragEnd(pointerDraggingSingle, () => {
      flushSingleRaf();
    });
  };

  const input = (
    <input
      ref={singleInputRef}
      type="range"
      id={id}
      name={name}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      class={twMerge(
        trackClsWithDir,
        !vertical && "w-full",
        !vertical && className,
      )}
      onPointerDown={onSinglePointerDown}
      onChange={handleSingleChange}
      onInput={handleSingleInput}
    />
  );

  if (vertical) {
    return (
      <div class={twMerge(wrapperCls, className)}>
        {input}
      </div>
    );
  }
  return input;
}
