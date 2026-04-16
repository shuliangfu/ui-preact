/**
 * 浮层受控开关解析：与桌面 `Modal` 等一致。
 * 支持 `open={signal()}`、快照 `boolean`、或零参 getter `() => boolean`（与旧 View 迁移兼容）。
 */

import { Signal } from "@preact/signals";

/**
 * 判断是否为 `@preact/signals` 的 `Signal`。
 * 打包工具若产生多份 `@preact/signals`，`instanceof Signal` 会失效，需用 `subscribe` + `value` 做 duck type。
 *
 * @param v - 任意值
 */
function isPreactSignalLike(v: unknown): v is Signal<boolean> | Signal<string> {
  if (v instanceof Signal) return true;
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return "value" in o && typeof o.subscribe === "function";
}

/** 是否打开：快照、`Signal<boolean>`、零参 getter */
export type ControlledOpenInput = boolean | (() => boolean) | Signal<boolean>;

/**
 * 「是否仍有更多」：未传视为 `true`；支持快照、`Signal<boolean>`、零参 getter（与 `hasMore` 一致）。
 */
export type HasMoreInput = boolean | (() => boolean) | Signal<boolean>;

/** 字符串受控：快照、`Signal<string>`、零参 getter */
export type ControlledStringInput = string | (() => string) | Signal<string>;

/**
 * 将 `open` prop 规范为 boolean；在组件渲染路径或 `computed` 内调用以订阅 `Signal`。
 *
 * @param v - 受控开关原始值
 */
export function readControlledOpenInput(
  v: ControlledOpenInput | undefined,
): boolean {
  if (v === undefined) return false;
  if (isPreactSignalLike(v)) return !!(v as Signal<boolean>).value;
  if (typeof v === "function") {
    if ((v as () => unknown).length !== 0) return false;
    return !!(v as () => boolean)();
  }
  return !!v;
}

/**
 * 解析 `hasMore`：未传或非法 getter 视为仍有更多；`false` / `Signal(false)` 视为无更多。
 *
 * @param v - 原始值
 */
export function readHasMoreInput(v: HasMoreInput | undefined): boolean {
  if (v === undefined) return true;
  if (isPreactSignalLike(v)) return !!(v as Signal<boolean>).value;
  if (typeof v === "function") {
    if ((v as () => unknown).length !== 0) return true;
    return !!(v as () => boolean)();
  }
  return !!v;
}

/**
 * 将字符串受控 prop 规范为 `string | undefined`。
 *
 * @param v - 原始值
 */
export function readControlledStringInput(
  v: ControlledStringInput | undefined,
): string | undefined {
  if (v === undefined) return undefined;
  if (isPreactSignalLike(v)) return (v as Signal<string>).value;
  if (typeof v === "function") {
    if ((v as () => unknown).length !== 0) return undefined;
    return (v as () => string)();
  }
  return v;
}
