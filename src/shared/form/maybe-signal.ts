/**
 * @module shared/form/maybe-signal
 * @description
 * 表单受控 props 与 **Preact** {@link Signal}（`@preact/signals`）的统一类型与读值工具。
 * 标量或 `signal()` 返回值可作为 `value` / `checked` / `targetKeys` 等传入（与 Preact `Signalish` 一致）；**不支持**任意 `() => T` getter。
 *
 * **跨包识别**：文档/应用与组件库可能各解析一份 `@preact/signals`，`instanceof Signal` 会失效。
 * 对「非数组 object + 原型链上可读 `.value`」按 Signal 读写；字面量 `value={60}` 为原始类型不走对象分支。
 */

import type { Signal } from "@preact/signals";

/**
 * 标量或 `signal()` 返回的 {@link Signal}；用于 `value` / `checked` / `targetKeys` 等受控 props。
 *
 * @template T 数据形态
 */
export type MaybeSignal<T> = T | Signal<T>;

/**
 * 同步读取 {@link MaybeSignal}：未传时返回 `undefined`；Signal（含跨包副本）则读 `.value`。
 *
 * @template T 值类型
 * @param v - 受控 prop
 * @returns 解包后的值，或 `undefined`
 */
export function readMaybeSignal<T>(
  v: MaybeSignal<T> | undefined,
): T | undefined {
  if (v === undefined) return undefined;
  if (v === null || typeof v !== "object") return v as T;
  // range 字面量元组 `value={[a,b]}`：整段即值，不是 Signal 包装
  if (Array.isArray(v)) return v as T;
  if ("value" in v) {
    try {
      return (v as { value: T }).value;
    } catch {
      return undefined;
    }
  }
  return v as T;
}

/**
 * 若受控源为可写的 Signal（含跨 npm 副本），将 `next` 写入 `.value`；标量 / 数组字面量则忽略。
 * 只读 computed 等赋值失败时吞掉异常，与旧行为一致。
 *
 * @typeParam T - 与 {@link MaybeSignal} 一致的数据类型
 * @param v - `value` / `checked` / `targetKeys` 等 prop
 * @param next - 新值
 */
export function commitMaybeSignal<T>(
  v: MaybeSignal<T> | undefined,
  next: T,
): void {
  if (v === undefined) return;
  if (v === null || typeof v !== "object") return;
  if (Array.isArray(v)) return;
  if (!("value" in v)) return;
  try {
    (v as { value: T }).value = next;
  } catch {
    // 只读 computed 等：赋值失败则忽略
  }
}
