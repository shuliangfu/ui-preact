/**
 * {@link Form} 向下注入的控件统一尺寸。
 *
 * 未包裹在 Form 内时上下文为 `undefined`，控件回落到 `props.size ?? "md"`。
 */

import { createContext } from "preact";
import { useContext } from "preact/hooks";
import type { SizeVariant } from "../types.ts";

/** 由 {@link import("./Form.tsx").Form} 提供；值为当前表单约定的控件尺寸。 */
export const FormControlSizeContext = createContext<SizeVariant | undefined>(
  undefined,
);

/**
 * 合并表单容器尺寸与控件自身 `size`：显式 prop 优先，其次 Form 注入，最后 `md`。
 *
 * @param prop - 控件上传入的 size
 * @returns 最终采用的尺寸
 */
export function resolveFormControlSize(
  prop: SizeVariant | undefined,
): SizeVariant {
  const fromForm = useContext(FormControlSizeContext);
  return prop ?? fromForm ?? "md";
}
