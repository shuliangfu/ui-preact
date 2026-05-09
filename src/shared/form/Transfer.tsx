/**
 * Transfer 穿梭框（Preact）。
 * 双列选择；`MaybeSignal` 与 `@preact/signals` 的 `Signal` 用于搜索与多选态。
 */

import type { ComponentChildren, JSX } from "preact";
import type { Signal } from "@preact/signals";
import { useSignal } from "@preact/signals";
import { twMerge } from "tailwind-merge";
import {
  commitMaybeSignal,
  type MaybeSignal,
  readMaybeSignal,
} from "./maybe-signal.ts";

export interface TransferItem {
  key: string;
  title: string | unknown;
  disabled?: boolean;
}

/** Transfer 内置文案 */
export interface TransferMessages {
  /** 左侧标题默认文案；与 {@link TransferProps.titles}[0] 同义，后者优先 */
  sourceTitle: string;
  /** 右侧标题默认文案；与 {@link TransferProps.titles}[1] 同义，后者优先 */
  targetTitle: string;
  /** 搜索框默认占位；与 {@link TransferProps.searchPlaceholder} 每项同义，后者优先 */
  searchPlaceholder: string;
  /** 列表底部「N 项」文案，参数为过滤后总数 */
  count: (n: number) => string;
  /** 列表底部「，已选 N」文案，参数为已选数；要求开头自带分隔符 */
  selectedSuffix: (n: number) => string;
  /** 中间向右移动按钮 `aria-label` */
  moveRight: string;
  /** 中间向左移动按钮 `aria-label` */
  moveLeft: string;
}

/** 默认中文文案 */
export const defaultTransferMessages: TransferMessages = {
  sourceTitle: "源列表",
  targetTitle: "目标列表",
  searchPlaceholder: "搜索",
  count: (n) => `${n} 项`,
  selectedSuffix: (n) => `，已选 ${n}`,
  moveRight: "右移",
  moveLeft: "左移",
};

export interface TransferProps {
  dataSource: TransferItem[];
  targetKeys: MaybeSignal<string[]>;
  onChange?: (targetKeys: string[]) => void;
  titles?: [string, string];
  showSearch?: boolean;
  searchPlaceholder?: [string, string];
  searchValue?: [string, string];
  onSearch?: (direction: "left" | "right", value: string) => void;
  filterOption?: (inputValue: string, item: TransferItem) => boolean;
  render?: (item: TransferItem) => ComponentChildren;
  listStyle?: { width?: number; height?: number };
  disabled?: boolean;
  class?: string;
  /** 多语言/自定义文案；未传字段走 {@link defaultTransferMessages} */
  messages?: Partial<TransferMessages>;
}

/** 列表底部统计用到的文案字段 */
type TransferColumnFooterMessages = Pick<
  TransferMessages,
  "count" | "selectedSuffix"
>;

function filterTransferItems(
  items: TransferItem[],
  q: string,
  filterOption?: (inputValue: string, item: TransferItem) => boolean,
): TransferItem[] {
  if (!q.trim()) return items;
  const fn = filterOption ??
    ((input: string, item: TransferItem) =>
      String(item.title).toLowerCase().includes(input.toLowerCase()));
  return items.filter((i) => fn(q, i));
}

const transferListShellCls =
  "border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden flex flex-col";

type TransferColumnProps = {
  title: string;
  items: TransferItem[];
  searchPlaceholder: string;
  showSearch: boolean;
  searchRef: Signal<string>;
  listVersion: Signal<number>;
  selectedKeysRef: Signal<string[]>;
  filterOption?: (inputValue: string, item: TransferItem) => boolean;
  onSearch?: (value: string) => void;
  render?: (item: TransferItem) => ComponentChildren;
  listStyle: { width?: number; height?: number };
  onToggleSelect: (key: string) => void;
  onTransfer: (keys: string[]) => void;
  disabled?: boolean;
  /** 列表底部「N 项 / 已选」文案 */
  footerMessages: TransferColumnFooterMessages;
};

/**
 * 单列：标题、搜索、列表。
 */
function TransferColumn(props: TransferColumnProps): JSX.Element {
  const {
    title,
    items,
    searchPlaceholder,
    showSearch,
    searchRef,
    listVersion,
    selectedKeysRef,
    filterOption,
    onSearch,
    render,
    listStyle,
    onToggleSelect,
    onTransfer,
    disabled = false,
    footerMessages,
  } = props;

  listVersion.value;
  const filtered = filterTransferItems(
    items,
    searchRef.value,
    filterOption,
  );
  const selectedKeys = selectedKeysRef.value;
  const listHeight = listStyle.height ?? 200;

  return (
    <div
      class={twMerge(transferListShellCls, "min-w-0 shrink-0")}
      style={{ width: `${listStyle.width ?? 200}px` }}
    >
      <div class="px-3 py-2 border-b border-slate-200 dark:border-slate-600 font-medium text-slate-700 dark:text-slate-300">
        {title}
      </div>
      {showSearch && (
        <input
          type="text"
          role="searchbox"
          autocomplete="off"
          class="m-2 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 w-[calc(100%-1rem)]"
          placeholder={searchPlaceholder}
          value={searchRef.value}
          onInput={(e: Event) => {
            const v = (e.target as HTMLInputElement).value;
            searchRef.value = v;
            listVersion.value = listVersion.value + 1;
            if (onSearch != null) {
              queueMicrotask(() => onSearch(v));
            }
          }}
        />
      )}
      <div class="flex flex-col flex-1 min-h-0">
        <div class="contents">
          <ul
            class="overflow-auto flex-1 min-h-0 list-none m-0 p-1"
            style={{ height: listHeight }}
          >
            {filtered.map((item) => {
              const selected = selectedKeys.includes(item.key);
              return (
                <li key={item.key} class="list-none m-0 p-0">
                  <button
                    type="button"
                    class={twMerge(
                      "w-full text-left px-2 py-1.5 rounded text-sm cursor-pointer border-0 bg-transparent",
                      item.disabled || disabled
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-slate-100 dark:hover:bg-slate-700",
                      selected &&
                        "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200",
                    )}
                    data-key={item.key}
                    disabled={item.disabled || disabled}
                    onClick={() => {
                      if (item.disabled || disabled) return;
                      onToggleSelect(item.key);
                    }}
                    onDblClick={() => {
                      if (item.disabled || disabled) return;
                      onTransfer([item.key]);
                    }}
                  >
                    {(render ? render(item) : item.title) as ComponentChildren}
                  </button>
                </li>
              );
            })}
          </ul>
          <div class="px-2 py-1 text-xs text-slate-500 dark:text-slate-400">
            {footerMessages.count(filtered.length)}
            {selectedKeys.length > 0
              ? footerMessages.selectedSuffix(selectedKeys.length)
              : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Transfer：双列穿梭选择。
 */
export function Transfer(props: TransferProps): JSX.Element | null {
  const {
    dataSource,
    targetKeys,
    onChange,
    showSearch = false,
    searchValue,
    onSearch,
    filterOption,
    render,
    listStyle = { width: 200, height: 200 },
    disabled = false,
    class: className,
    messages,
  } = props;

  /** 合并默认中文文案与外部传入 messages */
  const m = { ...defaultTransferMessages, ...messages };
  const titlesResolved: [string, string] = [
    props.titles?.[0] ?? m.sourceTitle,
    props.titles?.[1] ?? m.targetTitle,
  ];
  const searchPlaceholderResolved: [string, string] = [
    props.searchPlaceholder?.[0] ?? m.searchPlaceholder,
    props.searchPlaceholder?.[1] ?? m.searchPlaceholder,
  ];

  const leftSearchRef = useSignal(searchValue?.[0] ?? "");
  const rightSearchRef = useSignal(searchValue?.[1] ?? "");
  const leftListVersion = useSignal(0);
  const rightListVersion = useSignal(0);
  const leftSelectedKeysRef = useSignal<string[]>([]);
  const rightSelectedKeysRef = useSignal<string[]>([]);

  const getTargetKeys = (): string[] => readMaybeSignal(targetKeys) ?? [];

  const moveToRight = (keys: string[]) => {
    if (keys.length === 0) return;
    const current = getTargetKeys();
    const next = [...new Set([...current, ...keys])];
    commitMaybeSignal(targetKeys, next);
    onChange?.(next);
    leftSelectedKeysRef.value = [];
  };

  const moveToLeft = (keys: string[]) => {
    if (keys.length === 0) return;
    const current = getTargetKeys();
    const next = current.filter((k) => !keys.includes(k));
    commitMaybeSignal(targetKeys, next);
    onChange?.(next);
    rightSelectedKeysRef.value = [];
  };

  const btnCls =
    "px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed";

  if (typeof globalThis.document === "undefined") {
    return <span class="hidden" aria-hidden="true" />;
  }

  const currentTargetKeys = getTargetKeys();
  const targetSet = new Set(currentTargetKeys);
  const leftRaw = dataSource.filter((i) => !targetSet.has(i.key));
  const rightRaw = dataSource.filter((i) => targetSet.has(i.key));

  const toggleLeft = (key: string) => {
    const prev = leftSelectedKeysRef.value;
    leftSelectedKeysRef.value = prev.includes(key)
      ? prev.filter((k: string) => k !== key)
      : [...prev, key];
  };

  const toggleRight = (key: string) => {
    const prev = rightSelectedKeysRef.value;
    rightSelectedKeysRef.value = prev.includes(key)
      ? prev.filter((k: string) => k !== key)
      : [...prev, key];
  };

  /** 左右列列表底部统计共用合并后的 count / selectedSuffix */
  const columnFooterMessages: TransferColumnFooterMessages = {
    count: m.count,
    selectedSuffix: m.selectedSuffix,
  };

  return (
    <div
      class={twMerge(
        "transfer flex items-stretch gap-4",
        disabled && "opacity-60 pointer-events-none",
        className,
      )}
    >
      <TransferColumn
        title={titlesResolved[0]}
        items={leftRaw}
        searchPlaceholder={searchPlaceholderResolved[0]}
        showSearch={showSearch}
        searchRef={leftSearchRef}
        listVersion={leftListVersion}
        selectedKeysRef={leftSelectedKeysRef}
        filterOption={filterOption}
        onSearch={(v) => onSearch?.("left", v)}
        render={render}
        listStyle={listStyle}
        onToggleSelect={toggleLeft}
        onTransfer={(keys) => moveToRight(keys)}
        disabled={disabled}
        footerMessages={columnFooterMessages}
      />
      <div class="flex shrink-0 flex-col justify-center gap-2">
        <button
          type="button"
          class={btnCls}
          disabled={disabled}
          aria-label={m.moveRight}
          onClick={() => {
            moveToRight(
              leftSelectedKeysRef.value.length > 0
                ? leftSelectedKeysRef.value
                : filterTransferItems(
                  leftRaw,
                  leftSearchRef.value,
                  filterOption,
                )
                  .filter((i) => !i.disabled)
                  .map((i) => i.key),
            );
          }}
        >
          →
        </button>
        <button
          type="button"
          class={btnCls}
          disabled={disabled}
          aria-label={m.moveLeft}
          onClick={() => {
            moveToLeft(
              rightSelectedKeysRef.value.length > 0
                ? rightSelectedKeysRef.value
                : filterTransferItems(
                  rightRaw,
                  rightSearchRef.value,
                  filterOption,
                )
                  .filter((i) => !i.disabled)
                  .map((i) => i.key),
            );
          }}
        >
          ←
        </button>
      </div>
      <TransferColumn
        title={titlesResolved[1]}
        items={rightRaw}
        searchPlaceholder={searchPlaceholderResolved[1]}
        showSearch={showSearch}
        searchRef={rightSearchRef}
        listVersion={rightListVersion}
        selectedKeysRef={rightSelectedKeysRef}
        filterOption={filterOption}
        onSearch={(v) => onSearch?.("right", v)}
        render={render}
        listStyle={listStyle}
        onToggleSelect={toggleRight}
        onTransfer={(keys) => moveToLeft(keys)}
        disabled={disabled}
        footerMessages={columnFooterMessages}
      />
    </div>
  );
}
