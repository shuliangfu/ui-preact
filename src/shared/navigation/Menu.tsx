/**
 * Menu 菜单列表（Preact）。
 * 多级菜单、选中态、水平弹出子菜单、键盘上下键导航；与 ui-view 行为对齐。
 */

import type { ComponentChildren, JSX } from "preact";
import { Fragment } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { twMerge } from "tailwind-merge";
/** 按需：单文件图标，避免经 icons/mod 拉入全表 */
import { IconChevronRight } from "../basic/icons/ChevronRight.tsx";

export interface MenuItem {
  /** 唯一 key */
  key: string;
  /** 显示文案或节点 */
  label: ComponentChildren;
  /** 是否禁用 */
  disabled?: boolean;
  /** 子菜单（多级） */
  children?: MenuItem[];
}

export interface MenuProps {
  /** 菜单项（支持多级 children） */
  items: MenuItem[];
  /** 点击叶子项回调（key），仅对可点击项生效 */
  onClick?: (key: string) => void;
  /** 模式：垂直 或 水平，默认 "vertical" */
  mode?: "vertical" | "horizontal";
  /** 水平模式下子菜单是否以弹出层展示（否则内联），默认 false */
  usePopoverSubmenu?: boolean;
  /** 是否展开所有子菜单（vertical 时），默认 false */
  defaultOpenKeys?: string[];
  /** 受控展开的子菜单 key 列表；可为 getter */
  openKeys?: string[] | (() => string[]);
  /** 展开/收起子菜单回调（可选，受控时用） */
  onOpenChange?: (openKeys: string[]) => void;
  /** 键盘导航：当前焦点的 key（由父级维护）；可为 getter */
  focusedKey?: string | (() => string | undefined);
  /** 键盘上下键切换焦点时回调 */
  onFocusChange?: (key: string) => void;
  /** 额外 class */
  class?: string;
}

/** 扁平化可聚焦 key 顺序（先顶层，再各展开子菜单内项） */
function getOrderedKeys(items: MenuItem[], openKeys: Set<string>): string[] {
  const out: string[] = [];
  function walk(list: MenuItem[]) {
    for (const item of list) {
      out.push(item.key);
      if (item.children?.length && openKeys.has(item.key)) walk(item.children);
    }
  }
  walk(items);
  return out;
}

/**
 * 在菜单树中按 key 查找节点。
 *
 * @param list - 当前层 items
 * @param key - 目标 key
 * @returns 找到的节点，否则 undefined
 */
function findMenuItemByKey(
  list: MenuItem[],
  key: string,
): MenuItem | undefined {
  for (const n of list) {
    if (n.key === key) return n;
    if (n.children?.length) {
      const inner = findMenuItemByKey(n.children, key);
      if (inner != null) return inner;
    }
  }
  return undefined;
}

/**
 * 收集节点及其所有后代 key（含自身）。
 *
 * @param root - 子树根
 * @param out - 写入集合
 */
function collectMenuSubtreeKeys(root: MenuItem, out: Set<string>): void {
  out.add(root.key);
  if (root.children == null) return;
  for (const c of root.children) collectMenuSubtreeKeys(c, out);
}

/**
 * 选中集合是否命中该节点或其任一后代（带子菜单的触发器高亮，垂直/水平一致）。
 */
function menuSubtreeContainsSelectedKey(
  node: MenuItem,
  selected: Set<string>,
): boolean {
  if (selected.has(node.key)) return true;
  if (node.children == null) return false;
  return node.children.some((c) => menuSubtreeContainsSelectedKey(c, selected));
}

/**
 * 刚挂上 document `click` 监听后的忽略窗口（毫秒），减轻同手势误关。
 */
const MENU_DOC_CLICK_ARM_MS = 90;

/**
 * 判断 document 冒泡阶段的 `click` 是否应视为落在菜单根 `nav` 内。
 */
function clickEventTouchesMenuRoot(e: MouseEvent, root: HTMLElement): boolean {
  if (!root.isConnected) return false;
  const t = e.target;
  if (t instanceof Node && t.isConnected && root.contains(t)) {
    return true;
  }
  if (typeof e.composedPath === "function") {
    try {
      const path = e.composedPath();
      for (let i = 0; i < path.length; i++) {
        const n = path[i];
        if (n === root) return true;
        if (n instanceof Node && root.contains(n)) return true;
      }
    } catch {
      /* 个别环境 composedPath 抛错时走下方兜底 */
    }
  }
  if (t instanceof Node && !t.isConnected) {
    const x = e.clientX;
    const y = e.clientY;
    if (Number.isFinite(x) && Number.isFinite(y)) {
      const doc = root.ownerDocument ??
        (globalThis as { document?: Document }).document;
      const stackFn = doc &&
        (doc as Document & {
          elementsFromPoint?: (x: number, y: number) => Element[];
        }).elementsFromPoint;
      if (typeof stackFn === "function") {
        const stack = stackFn.call(doc, x, y);
        if (stack != null) {
          for (let i = 0; i < stack.length; i++) {
            const el = stack[i];
            if (el != null && root.contains(el)) return true;
          }
        }
      }
    }
  }
  return false;
}

function renderItem(
  item: MenuItem,
  selectedKeys: Set<string>,
  openKeys: Set<string>,
  onOpenChange: (key: string) => void,
  onSelectKey: (key: string) => void,
  depth: number,
  mode: "vertical" | "horizontal",
  usePopoverSubmenu: boolean,
  focusedKey: string | undefined,
  onFocusChange: ((key: string) => void) | undefined,
  onCloseSubmenu?: () => void,
): JSX.Element {
  const hasChildren = item.children != null && item.children.length > 0;
  const isOpen = hasChildren && openKeys.has(item.key);
  const isSelected = selectedKeys.has(item.key);
  const isHorizontalPopover = mode === "horizontal" && usePopoverSubmenu;
  /**
   * 带子项的触发器：展开中或子树内有选中项时高亮（垂直内联与水平 popover 行为一致）。
   */
  const submenuTriggerActive =
    menuSubtreeContainsSelectedKey(item, selectedKeys) || isOpen;

  const toggleOpen = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasChildren) onOpenChange(item.key);
  };

  const submenuContent = hasChildren && (
    <div
      class={twMerge(
        "min-w-[120px] py-1 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg",
        isHorizontalPopover
          ? "absolute top-full left-0 mt-1 z-50 py-1 px-1.5 [overflow-anchor:none]"
          : "px-1 border-l border-slate-200 dark:border-slate-600 ml-2 my-1",
      )}
    >
      {item.children!.map((child) => (
        <Fragment key={child.key}>
          {renderItem(
            child,
            selectedKeys,
            openKeys,
            onOpenChange,
            onSelectKey,
            depth + 1,
            mode,
            usePopoverSubmenu,
            focusedKey,
            onFocusChange,
            onCloseSubmenu,
          )}
        </Fragment>
      ))}
    </div>
  );

  if (hasChildren) {
    const trigger = (
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        data-menu-key={item.key}
        tabIndex={focusedKey === item.key ? 0 : -1}
        class={twMerge(
          mode === "horizontal"
            ? "flex items-center gap-1 px-3 py-2"
            : "w-full flex items-center justify-between gap-2 px-3 py-2 text-left",
          "text-sm rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700",
          submenuTriggerActive &&
            "bg-blue-50 dark:bg-blue-800/50 text-blue-600 dark:text-blue-300 font-medium",
          item.disabled && "opacity-50 cursor-not-allowed",
        )}
        disabled={item.disabled}
        onMouseDown={(e: Event) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={toggleOpen}
      >
        <span>{item.label}</span>
        <IconChevronRight
          class={twMerge(
            "shrink-0 w-4 h-4",
            mode === "vertical" && isOpen && "rotate-90",
          )}
        />
      </button>
    );
    return (
      <div
        class={twMerge(
          "border-slate-100 dark:border-slate-700",
          isHorizontalPopover && "relative inline-block",
        )}
      >
        {trigger}
        {isOpen && submenuContent}
      </div>
    );
  }

  const fullWidth = mode !== "horizontal" || depth > 0;
  const isInSubmenu = depth > 0;
  return (
    <button
      type="button"
      data-menu-key={item.key}
      tabIndex={focusedKey === item.key ? 0 : -1}
      class={twMerge(
        fullWidth
          ? "w-full flex items-center gap-2 px-3 py-2 text-left"
          : "flex items-center px-3 py-2",
        isInSubmenu ? "rounded-xs" : "rounded-md",
        "text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700",
        isSelected &&
          "bg-blue-50 dark:bg-blue-800/50 text-blue-600 dark:text-blue-300 font-medium",
        item.disabled && "opacity-50 cursor-not-allowed",
      )}
      disabled={item.disabled}
      onMouseDown={(e: Event) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={() => {
        if (item.disabled) return;
        onSelectKey(item.key);
        if (isHorizontalPopover && depth > 0) onCloseSubmenu?.();
      }}
    >
      {item.label}
    </button>
  );
}

/**
 * Menu：多级导航菜单。
 */
export function Menu(props: MenuProps): JSX.Element {
  const {
    items,
    onClick,
    mode = "vertical",
    usePopoverSubmenu = false,
    defaultOpenKeys = [],
    onOpenChange,
    onFocusChange,
    class: className,
  } = props;

  const selectedKeysRef = useSignal<string[]>([]);

  const resolvedInitialOpen = typeof props.openKeys === "function"
    ? props.openKeys()
    : (props.openKeys ?? defaultOpenKeys);
  const popoverOpenKeysRef = useSignal<string[]>(resolvedInitialOpen);
  const internalOpenKeysRef = useSignal<string[]>(defaultOpenKeys);

  const readOpenKeysArray = (): string[] => {
    if (usePopoverSubmenu) {
      if (props.openKeys !== undefined) {
        return typeof props.openKeys === "function"
          ? props.openKeys()
          : props.openKeys;
      }
      return popoverOpenKeysRef.value;
    }
    if (props.openKeys !== undefined) {
      return typeof props.openKeys === "function"
        ? props.openKeys()
        : props.openKeys;
    }
    return internalOpenKeysRef.value;
  };

  const handleOpenChange = (key: string) => {
    const openVal = readOpenKeysArray();
    const prevOpen = new Set(openVal);
    const next = new Set(openVal);
    const wasOpen = prevOpen.has(key);
    if (wasOpen) next.delete(key);
    else next.add(key);
    const nextArr = Array.from(next) as string[];

    /**
     * 刚展开某子树时，去掉落在该子树外的选中 key（垂直/水平、内联或 popover 均适用）：
     * 先点「选项二」再展开「子菜单」时，兄弟项不应仍显示为当前项。
     */
    if (!wasOpen && next.has(key)) {
      const node = findMenuItemByKey(items, key);
      if (node?.children?.length) {
        const branch = new Set<string>();
        collectMenuSubtreeKeys(node, branch);
        selectedKeysRef.value = selectedKeysRef.value.filter((k) =>
          branch.has(k)
        );
      }
    }

    if (usePopoverSubmenu) {
      if (props.openKeys === undefined) popoverOpenKeysRef.value = nextArr;
    } else if (props.openKeys === undefined) {
      internalOpenKeysRef.value = nextArr;
    }
    onOpenChange?.(nextArr);
  };

  const closePopover = () => {
    popoverOpenKeysRef.value = [];
    onOpenChange?.([]);
  };

  const closeAllOpenSubmenus = () => {
    if (usePopoverSubmenu) {
      if (props.openKeys === undefined) {
        popoverOpenKeysRef.value = [];
      }
      onOpenChange?.([]);
      return;
    }
    if (props.openKeys === undefined) {
      internalOpenKeysRef.value = [];
    }
    onOpenChange?.([]);
  };

  const menuRootRef = useRef<HTMLElement | null>(null);

  const openKeysSnapshot = JSON.stringify(readOpenKeysArray());

  useEffect(() => {
    const doc = globalThis.document;
    if (doc == null || typeof doc.addEventListener !== "function") return;
    const openKeysVal = JSON.parse(openKeysSnapshot) as string[];
    if (openKeysVal.length === 0) return;

    let removeDocClick: (() => void) | null = null;
    let disposed = false;

    const attach = () => {
      if (disposed) return;
      const armUntil = typeof globalThis.performance !== "undefined" &&
          typeof globalThis.performance.now === "function"
        ? globalThis.performance.now() + MENU_DOC_CLICK_ARM_MS
        : 0;

      const onDocClick = (e: MouseEvent) => {
        if (typeof e.button === "number" && e.button !== 0) {
          return;
        }
        if (
          armUntil !== 0 &&
          typeof globalThis.performance !== "undefined" &&
          typeof globalThis.performance.now === "function" &&
          globalThis.performance.now() < armUntil
        ) {
          return;
        }
        const root = menuRootRef.current;
        if (
          root == null ||
          typeof (root as HTMLElement).contains !== "function"
        ) {
          return;
        }
        if (clickEventTouchesMenuRoot(e, root)) return;
        globalThis.setTimeout(() => closeAllOpenSubmenus(), 0);
      };

      doc.addEventListener("click", onDocClick, false);
      removeDocClick = () => {
        doc.removeEventListener("click", onDocClick, false);
        removeDocClick = null;
      };
    };

    globalThis.queueMicrotask(attach);

    return () => {
      disposed = true;
      removeDocClick?.();
    };
  }, [openKeysSnapshot]);

  const handleSelectKey = (key: string) => {
    selectedKeysRef.value = [key];
    onClick?.(key);
  };

  const keyboardNavRef = useRef<{
    orderedKeys: string[];
    focusKey: string | undefined;
    onFocusChange: ((key: string) => void) | undefined;
  }>({
    orderedKeys: [],
    focusKey: undefined,
    onFocusChange: undefined,
  });

  const handleKeyDownNav = (e: Event) => {
    const onFC = keyboardNavRef.current.onFocusChange;
    const orderedKeys = keyboardNavRef.current.orderedKeys;
    if (!onFC || orderedKeys.length === 0) return;
    const ev = e as KeyboardEvent;
    if (ev.key !== "ArrowDown" && ev.key !== "ArrowUp") return;
    ev.preventDefault();
    const focusKeyNow = keyboardNavRef.current.focusKey;
    const current = focusKeyNow != null ? orderedKeys.indexOf(focusKeyNow) : -1;
    const nextIndex = ev.key === "ArrowDown"
      ? Math.min(orderedKeys.length - 1, current + 1)
      : Math.max(0, current - 1);
    onFC(orderedKeys[nextIndex] ?? orderedKeys[0]!);
  };

  const openKeysVal = readOpenKeysArray();
  const openSet = new Set(openKeysVal);
  const orderedKeys = getOrderedKeys(items, openSet);
  const selectedSet = new Set(selectedKeysRef.value);
  const focusKeyNow = typeof props.focusedKey === "function"
    ? props.focusedKey()
    : props.focusedKey;

  keyboardNavRef.current.orderedKeys = orderedKeys;
  keyboardNavRef.current.focusKey = focusKeyNow;
  keyboardNavRef.current.onFocusChange = onFocusChange;

  return (
    <nav
      ref={(el) => {
        menuRootRef.current = el;
      }}
      class={twMerge(
        "flex flex-col gap-0.5",
        mode === "horizontal" &&
          "flex-row flex-wrap items-center [overflow-anchor:none]",
        className,
      )}
      role="menu"
      onKeyDown={onFocusChange
        ? (handleKeyDownNav as (e: Event) => void)
        : undefined}
    >
      {items.map((item) => (
        <Fragment key={item.key}>
          {renderItem(
            item,
            selectedSet,
            openSet,
            handleOpenChange,
            handleSelectKey,
            0,
            mode,
            usePopoverSubmenu,
            focusKeyNow,
            onFocusChange,
            usePopoverSubmenu ? closePopover : undefined,
          )}
        </Fragment>
      ))}
    </nav>
  );
}
