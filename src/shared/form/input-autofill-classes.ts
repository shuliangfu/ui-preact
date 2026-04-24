/**
 * 与 `ui-view/src/shared/form/input-autofill-classes.ts` 保持内容一致；改一处请双端同步。
 *
 * 浏览器自动填充（尤其 Chrome `:-webkit-autofill`）会强改输入框背景，需 inset 大阴影 + 字色 + 固定 `border-color` 与 `outline-none`。
 * 由 `Input` / `Password` 共用；勿用 `dark:!` + 复合 ` [&:-webkit-autofill]` 任意类（见 Tailwind v4 不产出 CSS 的风险）。
 * 精减为 4 组变体（无 :hover/:active 重复）+ outline；`:-webkit-autofill:focus` / `:autofill:focus` 用于「已填充且聚焦」的 UA 样式。
 *
 * **重要（Tailwind @source 扫描）**：这些类须以**完整字面量**出现在本文件中。若用运行期拼接，扫描器**看不到**完整 class，**不会生成 CSS**。
 */
const AUTOFILL_CLASS_PARTS: readonly string[] = [
  "[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(15_23_42)]",
  "dark:[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(241_245_249)]",
  "[&:-webkit-autofill]:[box-shadow:0_0_0_1000px_rgb(255_255_255)_inset]",
  "dark:[&:-webkit-autofill]:[box-shadow:0_0_0_1000px_rgb(30_41_59)_inset]",
  "[&:-webkit-autofill]:[border-color:rgb(203_213_225)]",
  "dark:[&:-webkit-autofill]:[border-color:rgb(71_85_105)]",
  "[&:-webkit-autofill:focus]:[-webkit-text-fill-color:rgb(15_23_42)]",
  "dark:[&:-webkit-autofill:focus]:[-webkit-text-fill-color:rgb(241_245_249)]",
  "[&:-webkit-autofill:focus]:[box-shadow:0_0_0_1000px_rgb(255_255_255)_inset]",
  "dark:[&:-webkit-autofill:focus]:[box-shadow:0_0_0_1000px_rgb(30_41_59)_inset]",
  "[&:-webkit-autofill:focus]:[border-color:rgb(203_213_225)]",
  "dark:[&:-webkit-autofill:focus]:[border-color:rgb(71_85_105)]",
  "[&:autofill]:[-webkit-text-fill-color:rgb(15_23_42)]",
  "dark:[&:autofill]:[-webkit-text-fill-color:rgb(241_245_249)]",
  "[&:autofill]:[box-shadow:0_0_0_1000px_rgb(255_255_255)_inset]",
  "dark:[&:autofill]:[box-shadow:0_0_0_1000px_rgb(30_41_59)_inset]",
  "[&:autofill]:[border-color:rgb(203_213_225)]",
  "dark:[&:autofill]:[border-color:rgb(71_85_105)]",
  "[&:autofill:focus]:[-webkit-text-fill-color:rgb(15_23_42)]",
  "dark:[&:autofill:focus]:[-webkit-text-fill-color:rgb(241_245_249)]",
  "[&:autofill:focus]:[box-shadow:0_0_0_1000px_rgb(255_255_255)_inset]",
  "dark:[&:autofill:focus]:[box-shadow:0_0_0_1000px_rgb(30_41_59)_inset]",
  "[&:autofill:focus]:[border-color:rgb(203_213_225)]",
  "dark:[&:autofill:focus]:[border-color:rgb(71_85_105)]",
  "[&:-webkit-autofill]:outline-none",
  "[&:-webkit-autofill:focus]:outline-none",
  "[&:autofill]:outline-none",
  "[&:autofill:focus]:outline-none",
];

export const inputAutofillOverride = AUTOFILL_CLASS_PARTS.join(" ");

/**
 * 显式关闭自动完成、不应合并 :webkit 覆盖类的 token（小写比较）。
 */
const NO_AUTOFILL_VISUAL = new Set(["off", "nope"]);

/**
 * 是否合并 `inputAutofillOverride`：`true` 或（非 `off`/`nope` 的）非空字符串；`false` / 未传 / 空 / `off` 为否。
 */
export function shouldMergeAutofillVisual(
  autoComplete: boolean | string | undefined,
): boolean {
  if (autoComplete == null || autoComplete === false) return false;
  if (autoComplete === true) return true;
  const t = String(autoComplete).trim().toLowerCase();
  if (t === "" || NO_AUTOFILL_VISUAL.has(t)) return false;
  return true;
}

/**
 * 为 `true` 或非关断字符串时返回 {@link inputAutofillOverride}，否则 `undefined` 供 `twMerge` 忽略。
 */
export function autofillVisualClass(
  autoComplete: boolean | string | undefined,
): string | undefined {
  return shouldMergeAutofillVisual(autoComplete)
    ? inputAutofillOverride
    : undefined;
}

/**
 * 将 `Input` 的 `autoComplete` 解析为原生 `autocomplete` 属性。`true` 时按 `type` 给常见 token，其余为 `on`；字符串则原样（含 `off`）。
 *
 * @param type - 与 `Input` 的 `type` 一致
 */
export function inputNativeAutoComplete(
  autoComplete: boolean | string | undefined,
  type: string | undefined,
): string | undefined {
  if (autoComplete == null || autoComplete === false) return undefined;
  if (typeof autoComplete === "string") {
    return autoComplete === "" ? undefined : autoComplete;
  }
  const t = (type ?? "text").toLowerCase();
  if (t === "email") return "email";
  if (t === "password") return "current-password";
  if (t === "tel") return "tel";
  if (t === "url") return "url";
  if (t === "search") return "search";
  return "on";
}

/**
 * 将 `Password` 的 `autoComplete` 解析为原生 `autocomplete`。`true` 时：注册场景 `newPassword` 为真则 `new-password`，否则 `current-password`。
 */
export function passwordNativeAutoComplete(
  autoComplete: boolean | string | undefined,
  newPassword?: boolean,
): string | undefined {
  if (autoComplete == null || autoComplete === false) return undefined;
  if (typeof autoComplete === "string") {
    return autoComplete === "" ? undefined : autoComplete;
  }
  return newPassword ? "new-password" : "current-password";
}
