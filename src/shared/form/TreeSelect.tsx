/**
 * TreeSelect 树选择（Preact，共享实现，桌面/移动由 `appearance` 区分）。
 *
 * **和 {@link Select} 的差别：**
 * - **Select**：`options` 已是**平铺**列表。
 * - **TreeSelect**：`options` 是**嵌套树**（`children`）；下拉内用缩进表现层级；触发条显示完整路径。
 */

import { useSignal, useSignalEffect } from "@preact/signals";
import type { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { IconChevronDown } from "../basic/icons/ChevronDown.tsx";
import {
  controlBlueFocusRing,
  nativeSelectSurface,
  pickerTriggerSurface,
} from "./input-focus-ring.ts";
import {
  commitMaybeSignal,
  type MaybeSignal,
  readMaybeSignal,
} from "./maybe-signal.ts";
import type { SizeVariant } from "../types.ts";

/** 树选择展示形态：`dropdown` 缩进浮层；`native` 单原生 select，选项文案为完整路径 */
export type TreeSelectAppearance = "dropdown" | "native";

export interface TreeSelectOption {
  value: string;
  label: string;
  children?: TreeSelectOption[];
}

export interface TreeSelectProps {
  options: TreeSelectOption[];
  /** 当前选中节点的 value；见 {@link MaybeSignal} */
  value?: MaybeSignal<string>;
  size?: SizeVariant;
  disabled?: boolean;
  onChange?: (e: Event) => void;
  placeholder?: string;
  class?: string;
  name?: string;
  id?: string;
  /** 为 true 时隐藏聚焦激活态边框；默认 false 显示 ring */
  hideFocusRing?: boolean;
  /** `native` 时用原生 select + 大触控区，选项文案为展平后的完整路径 */
  appearance?: TreeSelectAppearance;
}

/** 展平后的每一项：下拉里用 nodeLabel + depth，触发条用 fullPath */
interface FlatTreeItem {
  value: string;
  nodeLabel: string;
  fullPath: string;
  depth: number;
}

/**
 * 前序展平树：记录深度供缩进，并生成完整路径供触发条与无障碍文案。
 */
function flattenTreeSelectOptions(
  opts: TreeSelectOption[],
  ancestors: string[] = [],
): FlatTreeItem[] {
  const out: FlatTreeItem[] = [];
  const depth = ancestors.length;
  for (const o of opts) {
    const fullPath = ancestors.length > 0
      ? `${ancestors.join(" / ")} / ${o.label}`
      : o.label;
    out.push({
      value: o.value,
      nodeLabel: o.label,
      fullPath,
      depth,
    });
    if (o.children?.length) {
      out.push(
        ...flattenTreeSelectOptions(o.children, [...ancestors, o.label]),
      );
    }
  }
  return out;
}

const sizeClassesDropdown: Record<SizeVariant, string> = {
  xs: "px-2.5 py-1 text-xs rounded-md",
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-3 py-2 text-sm rounded-lg",
  lg: "px-4 py-2.5 text-base rounded-lg",
};

const sizeClassesNative: Record<SizeVariant, string> = {
  xs: "px-3 py-2 text-sm rounded-md min-h-[44px]",
  sm: "px-4 py-2.5 text-sm rounded-lg min-h-[44px]",
  md: "px-4 py-3 text-base rounded-lg min-h-[48px]",
  lg: "px-5 py-3.5 text-base rounded-lg min-h-[52px]",
};

const optionRowCls =
  "py-2 pr-3 text-sm text-left w-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed first:rounded-t-lg last:rounded-b-lg";

/** 与 Select / Dropdown 共用 Esc 关闭 */
const DROPDOWN_ESC_KEY = "__lastDropdownClose" as const;

/**
 * 原生单 select：展平树为 option，展示完整路径。
 */
function TreeSelectNativeBranch(
  props: Omit<TreeSelectProps, "appearance">,
): JSX.Element {
  const {
    options,
    size = "md",
    disabled = false,
    onChange,
    placeholder = "请选择",
    class: className,
    name,
    id,
    hideFocusRing = false,
    value,
  } = props;
  const flat = flattenTreeSelectOptions(options);
  const sizeCls = sizeClassesNative[size];
  const resolvedValue = readMaybeSignal(value) ?? "";

  /**
   * 选中值变更：写回 Signal 并触发 `onChange`。
   */
  const handleChange = (e: Event) => {
    const v = (e.target as HTMLSelectElement).value;
    commitMaybeSignal(value, v);
    onChange?.(e);
  };

  return (
    <select
      id={id}
      name={name}
      value={resolvedValue}
      disabled={disabled}
      class={twMerge(
        "w-full touch-manipulation",
        nativeSelectSurface,
        controlBlueFocusRing(!hideFocusRing),
        sizeCls,
        className,
      )}
      onChange={handleChange}
    >
      <option value="">{placeholder}</option>
      {flat.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.fullPath}
        </option>
      ))}
    </select>
  );
}

/**
 * 树形单选：内部展平 + 自绘下拉。
 */
function TreeSelectDropdownBranch(
  props: Omit<TreeSelectProps, "appearance">,
): JSX.Element {
  const {
    options,
    size = "md",
    disabled = false,
    onChange,
    placeholder = "请选择",
    class: className,
    name,
    id,
    hideFocusRing = false,
    value,
  } = props;

  const openState = useSignal(false);
  const sizeCls = sizeClassesDropdown[size];
  const flat = flattenTreeSelectOptions(options);
  const rv = readMaybeSignal(value) ?? "";

  const triggerChange = (newValue: string) => {
    commitMaybeSignal(value, newValue);
    const synthetic = { target: { value: newValue } } as unknown as Event;
    onChange?.(synthetic);
    openState.value = false;
  };

  const handleBackdropClick = () => {
    openState.value = false;
  };

  /** 下拉打开时注册 Esc 关闭；闭包固定避免 cleanup 引用漂移 */
  useSignalEffect(() => {
    if (!openState.value) return;
    const g = globalThis as unknown as Record<
      string,
      (() => void) | undefined
    >;
    const closeEsc = () => {
      openState.value = false;
    };
    g[DROPDOWN_ESC_KEY] = closeEsc;
    return () => {
      if (g[DROPDOWN_ESC_KEY] === closeEsc) {
        delete g[DROPDOWN_ESC_KEY];
      }
    };
  });

  const selectedOption = flat.find((o) => o.value === rv);
  /** 无障碍标签：有选中项用完整路径，否则占位或默认文案 */
  const ariaLabelText = (selectedOption?.fullPath ?? placeholder) ||
    "树形选择";

  return (
    <span class={twMerge("relative block w-full min-w-0", className)}>
      <input type="hidden" name={name} value={rv} />
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={openState.value}
        aria-label={ariaLabelText}
        class={twMerge(
          "w-full min-w-0",
          pickerTriggerSurface,
          controlBlueFocusRing(!hideFocusRing),
          sizeCls,
        )}
        onClick={() => {
          if (!disabled) openState.value = !openState.value;
        }}
      >
        <span
          class={twMerge(
            "truncate min-w-0 text-left",
            selectedOption
              ? "text-slate-900 dark:text-slate-100"
              : "text-slate-400 dark:text-slate-500",
          )}
        >
          {selectedOption?.fullPath ?? placeholder}
        </span>
        <span
          class={twMerge(
            "inline-flex shrink-0 text-slate-400 dark:text-slate-500 transition-transform",
            openState.value && "rotate-180",
          )}
        >
          <IconChevronDown size="sm" />
        </span>
      </button>
      {openState.value && (
        <>
          <div
            key="treeselect-dd-backdrop"
            class="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={handleBackdropClick}
          />
          <div
            key="treeselect-dd-list"
            role="listbox"
            aria-label="树形选项"
            class="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-800"
          >
            <button
              type="button"
              role="option"
              aria-selected={rv === ""}
              class={twMerge(
                optionRowCls,
                "pl-3",
                rv === "" &&
                  "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
              )}
              onClick={() => triggerChange("")}
            >
              {placeholder}
            </button>
            {flat.map((opt) => (
              <button
                type="button"
                key={opt.value}
                role="option"
                aria-selected={rv === opt.value}
                aria-label={opt.fullPath}
                title={opt.fullPath}
                class={twMerge(
                  optionRowCls,
                  opt.depth === 0 && "pl-3",
                  rv === opt.value &&
                    "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                )}
                style={opt.depth > 0
                  ? { paddingLeft: `${0.75 + opt.depth * 0.75}rem` }
                  : undefined}
                onClick={() => triggerChange(opt.value)}
              >
                {opt.nodeLabel}
              </button>
            ))}
          </div>
        </>
      )}
    </span>
  );
}

/**
 * 树形单选：默认自绘下拉；`appearance="native"` 时为原生大触控 select。
 */
export function TreeSelect(props: TreeSelectProps): JSX.Element {
  const { appearance = "dropdown", ...rest } = props;
  if (appearance === "native") {
    return TreeSelectNativeBranch(rest);
  }
  return TreeSelectDropdownBranch(rest);
}
