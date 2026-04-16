/**
 * Tree 树形（Preact）。
 * 目录、结构数据；支持展开/选中/勾选、异步加载、多选、可拖拽（可选）。
 * expandedKeys/selectedKeys/checkedKeys 可传 getter（如 `() => sig.value`）。
 *
 * 点击：`elementsFromPoint` 只取**第一个**可解析行，且勾选框以 `event.target` 为准；勿对整条射线反复覆盖 `row`（会得到父行，表现为勾错项）。
 *
 * **与 ui-view 对齐的策略**（见 `ui-view/src/shared/data-display/Tree.tsx`）：
 * - 用 `untracked` 读 getter 生成传给 `renderNode` 的 Set，**不在此路径订阅 signal**，避免整树随 keys 抖动；
 * - 用 `@preact/signals` 的 `effect` 订阅 getter + `rootRef`，在 effect 内 **直接写 DOM**（`input.checked`、行 class、子树 `display`、展开按钮 aria/图标），
 *   不依赖 Preact 对受控 checkbox 的逐帧补丁——在 dweb + getter 场景下更稳。
 * - **勾选框 JSX 不传 `checked`**：避免 Preact 用陈旧 VDOM 盖掉真实 `input.checked`。
 * - **`handleCheck` 用本次算出的 `next` 立刻写勾选 DOM**（`applyCheckboxCheckedFromSet`），不依赖下一拍再读父级 getter；并 `queueMicrotask` 全量同步 + `requestAnimationFrame` 再补勾选。
 * - **点击用 `composedPath()[0]`**：穿透 shadow 时 `target` 可能不准。
 */

import type { ComponentChildren, JSX } from "preact";
import { effect, signal, untracked } from "@preact/signals";
import { useEffect, useLayoutEffect, useMemo, useRef } from "preact/hooks";
import { twMerge } from "tailwind-merge";
/** 按需：单文件图标，避免经 icons/mod 拉入全表 */
import { IconChevronRight } from "../basic/icons/ChevronRight.tsx";

export interface TreeNode {
  /** 唯一 key */
  key: string;
  /** 标题 */
  title: ComponentChildren;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否可选（不传则默认 true） */
  selectable?: boolean;
  /** 是否可勾选（显示 checkbox） */
  checkable?: boolean;
  /** 是否叶子节点（无 children 时自动为 true） */
  isLeaf?: boolean;
  /** 子节点 */
  children?: TreeNode[];
}

export interface TreeProps {
  /** 树数据 */
  treeData: TreeNode[];
  /** 当前展开的 key 列表（受控）；与 signal 搭配时可传 `() => sig.value` */
  expandedKeys?: string[] | (() => string[]);
  /** 默认展开的 key 列表 */
  defaultExpandedKeys?: string[];
  /** 展开/收起回调 */
  onExpand?: (expandedKeys: string[]) => void;
  /** 当前选中的 key（受控） */
  selectedKeys?: string[] | (() => string[]);
  /** 选中回调 */
  onSelect?: (
    selectedKeys: string[],
    info: { node: TreeNode; selected: boolean },
  ) => void;
  /** 当前勾选的 key 列表（受控，当 checkable 时） */
  checkedKeys?: string[] | (() => string[]);
  /** 勾选回调 */
  onCheck?: (checkedKeys: string[]) => void;
  /** 是否显示 checkbox */
  checkable?: boolean;
  /** 是否允许多选 */
  multiple?: boolean;
  /** 是否块级 */
  blockNode?: boolean;
  /** 是否显示连接线 */
  showLine?: boolean;
  /** 额外 class */
  class?: string;
}

function getNodeByKey(nodes: TreeNode[], key: string): TreeNode | undefined {
  for (const n of nodes) {
    if (n.key === key) return n;
    const found = n.children ? getNodeByKey(n.children, key) : undefined;
    if (found) return found;
  }
  return undefined;
}

/**
 * 从 props 解析展开 key 数组（支持 getter）。
 *
 * @param p - Tree 当前 props
 */
function readExpandedKeysArray(p: TreeProps): string[] {
  const ex = p.expandedKeys;
  const d = p.defaultExpandedKeys ?? [];
  if (typeof ex === "function") return (ex as () => string[])();
  return ex ?? d;
}

/**
 * 从 props 解析选中 key 数组（支持 getter）。
 *
 * @param p - Tree 当前 props
 */
function readSelectedKeysArray(p: TreeProps): string[] {
  const v = p.selectedKeys ?? [];
  return typeof v === "function" ? (v as () => string[])() : v;
}

/**
 * 从 props 解析勾选 key 数组（支持 getter）。
 *
 * @param p - Tree 当前 props
 */
function readCheckedKeysArray(p: TreeProps): string[] {
  const v = p.checkedKeys ?? [];
  return typeof v === "function" ? (v as () => string[])() : v;
}

/**
 * 将 array 或 getter 规范为 getter（与 ui-view `asGetter` 一致，供事件里读最新值）。
 *
 * @param value - 数组或 getter
 * @param fallback - 无值时的默认数组
 */
function asGetter(
  value: string[] | (() => string[]) | undefined,
  fallback: string[],
): () => string[] {
  if (typeof value === "function") return value as () => string[];
  return () => (value ?? fallback);
}

/**
 * 根据受控 keys 同步根节点下勾选框、展开按钮、行选中样式、子树显隐（与 ui-view `createEffect` 内逻辑一致）。
 *
 * @param root - 树根 DOM
 * @param expanded - 当前展开 key 集合
 * @param selected - 当前选中 key 集合
 * @param checked - 当前勾选 key 集合
 */
/**
 * 仅同步勾选框 `checked` 属性（与 `syncTreeDomFromRoot` 内第一环一致，供点击后立即用已算出的 `next` 写 DOM，不依赖父级 signal 下一拍）。
 *
 * @param root - 树根 DOM
 * @param checked - 应为勾选的 key 集合
 */
function applyCheckboxCheckedFromSet(
  root: HTMLElement,
  checked: Set<string>,
): void {
  root.querySelectorAll<HTMLInputElement>("input[data-tree-check-key]")
    .forEach((input) => {
      const key = input.getAttribute("data-tree-check-key");
      if (key) input.checked = checked.has(key);
    });
}

function syncTreeDomFromRoot(
  root: HTMLDivElement,
  expanded: Set<string>,
  selected: Set<string>,
  checked: Set<string>,
): void {
  applyCheckboxCheckedFromSet(root, checked);
  root.querySelectorAll<HTMLButtonElement>("button[data-tree-expand-key]")
    .forEach((btn) => {
      const key = btn.getAttribute("data-tree-expand-key");
      if (key) {
        const open = expanded.has(key);
        btn.setAttribute("aria-expanded", String(open));
        const icon = btn.querySelector("[class*='transition-transform']");
        if (icon) (icon as HTMLElement).classList.toggle("rotate-90", open);
      }
    });
  root.querySelectorAll<HTMLElement>("[data-tree-node-key]").forEach((row) => {
    const key = row.getAttribute("data-tree-node-key");
    if (!key) return;
    const isSelected = selected.has(key);
    row.classList.toggle("bg-blue-50", isSelected);
    row.classList.toggle("dark:bg-blue-900/30", isSelected);
    row.classList.toggle("text-blue-700", isSelected);
    row.classList.toggle("dark:text-blue-300", isSelected);
  });
  root.querySelectorAll<HTMLElement>(".tree-children").forEach((wrap) => {
    const key = wrap.getAttribute("data-tree-children-key");
    wrap.style.display = key && expanded.has(key) ? "" : "none";
  });
}

function renderNode(
  node: TreeNode,
  expandedSet: Set<string>,
  selectedSet: Set<string>,
  onExpand: (key: string) => void,
  onSelect: (key: string) => void,
  onCheck: (key: string) => void,
  checkable: boolean,
  showLine: boolean,
  depth: number,
): JSX.Element {
  const hasChildren = node.children != null && node.children.length > 0;
  const isLeaf = node.isLeaf ?? !hasChildren;
  const isExpanded = expandedSet.has(node.key);
  const isSelected = selectedSet.has(node.key);
  const disabled = node.disabled ?? false;

  return (
    <div key={node.key} class="tree-node">
      <div
        data-tree-node-key={node.key}
        class={twMerge(
          "flex items-center gap-1 py-1 pr-2 rounded-md",
          "text-slate-700 dark:text-slate-300",
          isSelected &&
            "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
          !disabled &&
            "hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer",
          disabled && "opacity-60 cursor-not-allowed",
        )}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
      >
        <button
          type="button"
          data-tree-expand-key={node.key}
          class={twMerge(
            "shrink-0 w-4 h-4 p-0 flex items-center justify-center rounded",
            !isLeaf && "hover:bg-slate-200 dark:hover:bg-slate-600",
            isLeaf && "invisible",
          )}
          aria-expanded={hasChildren ? isExpanded : undefined}
        >
          <IconChevronRight
            class={twMerge(
              "w-4 h-4 transition-transform",
              isExpanded && "rotate-90",
            )}
          />
        </button>
        {checkable && (
          <input
            type="checkbox"
            key={`tree-chk-${node.key}`}
            data-tree-check-key={node.key}
            class="shrink-0 w-4 h-4 rounded border-slate-300 dark:border-slate-600 cursor-pointer"
            disabled={disabled}
          />
        )}
        <span
          data-tree-select-key={node.key}
          class="flex-1 min-w-0 truncate select-none"
        >
          {node.title as ComponentChildren}
        </span>
      </div>
      {hasChildren && (
        <div
          class="tree-children"
          data-tree-children-key={node.key}
          style={{ display: isExpanded ? "" : "none" }}
        >
          {node.children!.map((child) =>
            renderNode(
              child,
              expandedSet,
              selectedSet,
              onExpand,
              onSelect,
              onCheck,
              checkable,
              showLine,
              depth + 1,
            )
          )}
        </div>
      )}
    </div>
  );
}

export function Tree(props: TreeProps): JSX.Element {
  /** 稳定引用：effect 闭包始终读 `latestPropsRef.current`，避免每帧 `{ current }` 新对象导致订阅 stale */
  const latestPropsRef = useRef(props);
  latestPropsRef.current = props;

  const {
    treeData,
    expandedKeys: controlledExpanded,
    defaultExpandedKeys = [],
    onExpand,
    selectedKeys = [],
    onSelect,
    checkedKeys = [],
    onCheck,
    checkable = false,
    multiple = false,
    showLine = false,
    class: className,
  } = props;

  const getExpandedKeys = asGetter(controlledExpanded, defaultExpandedKeys);
  const getSelectedKeys = asGetter(selectedKeys, []);
  const getCheckedKeys = asGetter(checkedKeys, []);

  /**
   * 首屏 VDOM 用 untrack 读 getter，不订阅 signal（与 ui-view 一致）；真实展开/选中/勾选态由 `syncTreeDomFromRoot` 维护。
   */
  const expandedSet = new Set(
    untracked(() =>
      typeof controlledExpanded === "function"
        ? (controlledExpanded as () => string[])()
        : (controlledExpanded ?? defaultExpandedKeys)
    ),
  );
  const selectedSet = new Set(
    untracked(() =>
      typeof selectedKeys === "function"
        ? (selectedKeys as () => string[])()
        : (selectedKeys ?? [])
    ),
  );
  const rootElRef = useRef<HTMLDivElement | null>(null);
  /** 供 `effect` 订阅：仅 ref 变化时 Preact 不会重跑外层，需 signal 才能让「根已挂上」后再次同步 DOM */
  const rootMountSignal = useMemo(
    () => signal<HTMLDivElement | null>(null),
    [],
  );

  const handleExpand = (key: string) => {
    const cur = new Set(getExpandedKeys());
    if (cur.has(key)) cur.delete(key);
    else cur.add(key);
    onExpand?.(Array.from(cur));
  };

  const handleSelect = (key: string) => {
    const cur = new Set(getSelectedKeys());
    let next: string[];
    if (multiple) {
      next = cur.has(key) ? [...cur].filter((k) => k !== key) : [...cur, key];
    } else {
      next = cur.has(key) ? [] : [key];
    }
    const node = getNodeByKey(latestPropsRef.current.treeData, key);
    onSelect?.(next, { node: node!, selected: next.includes(key) });
  };

  const handleCheck = (key: string) => {
    const cur = new Set(getCheckedKeys());
    if (cur.has(key)) cur.delete(key);
    else cur.add(key);
    const next = Array.from(cur);
    const nextSet = new Set(next);
    onCheck?.(next);
    /**
     * 立刻用本次计算的 `next` 写勾选 DOM，不依赖再读父级 getter（signal 批处理 / effect 顺序下再读可能仍是旧数组，表现为慢一拍）。
     */
    const root = rootElRef.current;
    if (root) applyCheckboxCheckedFromSet(root, nextSet);
    /** 下一微任务再全量同步（行样式、展开区等），此时父级一般已 flush */
    queueMicrotask(() => {
      const r = rootElRef.current;
      if (!r) return;
      const p = latestPropsRef.current;
      syncTreeDomFromRoot(
        r,
        new Set(readExpandedKeysArray(p)),
        new Set(readSelectedKeysArray(p)),
        new Set(readCheckedKeysArray(p)),
      );
    });
    /** 再补一帧 rAF，应对宿主在 paint 后又改 checkbox 的情况 */
    requestAnimationFrame(() => {
      const r = rootElRef.current;
      if (!r) return;
      const p = latestPropsRef.current;
      applyCheckboxCheckedFromSet(
        r,
        new Set(readCheckedKeysArray(p)),
      );
    });
  };

  /**
   * 点击委托：`elementsFromPoint` 只取**第一个**落在树内且能解析到行的元素（浅层优先）。
   * 若像旧 ui-view 那样对整条射线不断 `row = r` 覆盖，后面的 DOM 往往是**父行**，会把子项点击误判成父节点 →「点的下一个勾的是上一个」。
   * 勾选框命中时一律以 **`event.target`** 所在行为准（与真实点击目标一致）。
   *
   * @param e - 树容器上的鼠标事件
   */
  const handleTreeClick = (e: Event) => {
    const me = e as MouseEvent;
    const root = rootElRef.current;
    const path = me.composedPath?.() ?? [];
    const path0 = path[0] as Node | undefined;
    const primary = (path0 ?? me.target) as Node | null;
    if (!root || !primary || !root.contains(primary)) return;

    const hit = primary;
    let row: Element | null = null;
    /** 与 `row` 搭配判断点的是展开钮 / 勾选 / 标题；勾选时与 `hit` 一致 */
    let raw: HTMLElement | null = null;

    if (
      hit instanceof globalThis.HTMLInputElement &&
      hit.getAttribute("data-tree-check-key") != null &&
      root.contains(hit)
    ) {
      row = hit.closest("[data-tree-node-key]");
      raw = hit;
    } else {
      const clientX = me.clientX;
      const clientY = me.clientY;
      if (typeof clientX !== "number" || typeof clientY !== "number") return;
      const doc = globalThis.document;
      const elementsAtPoint = doc?.elementsFromPoint?.(clientX, clientY) ?? [];
      for (const el of elementsAtPoint) {
        if (!root.contains(el)) break;
        const r = (el as HTMLElement).closest?.("[data-tree-node-key]");
        if (r && root.contains(r)) {
          row = r;
          break;
        }
      }
      const topEl = (elementsAtPoint[0] as HTMLElement) ?? (row as HTMLElement);
      raw = topEl?.nodeType === 3
        ? (topEl as unknown as Text).parentElement
        : topEl;
    }

    const key = row?.getAttribute("data-tree-node-key");
    if (!key || !row) return;
    const node = getNodeByKey(latestPropsRef.current.treeData, key);
    if (!node || (node.disabled ?? false)) return;
    if (!raw?.closest) return;
    if (row.contains(raw) && raw.closest("button[data-tree-expand-key]")) {
      const isLeaf = node.isLeaf ??
        !(node.children != null && node.children.length > 0);
      if (!isLeaf) {
        e.preventDefault();
        e.stopPropagation();
        handleExpand(key);
      }
      return;
    }
    if (row.contains(raw) && raw.closest("input[data-tree-check-key]")) {
      e.preventDefault();
      e.stopPropagation();
      handleCheck(key);
      if (node.selectable !== false) handleSelect(key);
      return;
    }
    if (
      row.contains(raw) &&
      (raw.closest("span[data-tree-select-key]") || raw === row)
    ) {
      e.preventDefault();
      e.stopPropagation();
      if (checkable) handleCheck(key);
      if (node.selectable !== false) handleSelect(key);
    }
  };

  /**
   * 捕获阶段阻止勾选框默认切换；勾选态只由 `syncTreeDomFromRoot` 写入，避免浏览器先改 DOM 再被错误 VDOM 覆盖。
   *
   * @param e - 树容器上的点击事件（捕获）
   */
  const handleTreeClickCapture = (e: Event) => {
    const me = e as MouseEvent;
    const path = me.composedPath?.() ?? [];
    const t = (path[0] ?? me.target) as EventTarget;
    if (!(t instanceof globalThis.HTMLInputElement)) return;
    if (t.getAttribute("data-tree-check-key") == null) return;
    const root = rootElRef.current;
    if (!root?.contains(t)) return;
    me.preventDefault();
  };

  /**
   * 订阅受控 keys（getter 内读 signal）与挂载根节点，同步 DOM；卸载时 dispose。
   */
  useLayoutEffect(() => {
    const dispose = effect(() => {
      const p = latestPropsRef.current;
      const expanded = new Set(readExpandedKeysArray(p));
      const selected = new Set(readSelectedKeysArray(p));
      const checked = new Set(readCheckedKeysArray(p));
      const root = rootMountSignal.value;
      if (!root || typeof root.querySelectorAll !== "function") return;
      syncTreeDomFromRoot(root, expanded, selected, checked);
    });
    return () => dispose();
  }, []);

  /**
   * 结构或 class 名等变化后补一次同步（不依赖 signal 时）。
   */
  useEffect(() => {
    const root = rootElRef.current;
    if (!root) return;
    const p = latestPropsRef.current;
    syncTreeDomFromRoot(
      root,
      new Set(readExpandedKeysArray(p)),
      new Set(readSelectedKeysArray(p)),
      new Set(readCheckedKeysArray(p)),
    );
  }, [treeData, checkable, showLine, className]);

  return (
    <div
      ref={(el: HTMLDivElement | null) => {
        rootElRef.current = el;
        rootMountSignal.value = el;
      }}
      class={twMerge("tree text-sm", className)}
      role="tree"
      onClickCapture={handleTreeClickCapture}
      onClick={handleTreeClick}
    >
      {treeData.map((node) =>
        renderNode(
          node,
          expandedSet,
          selectedSet,
          handleExpand,
          handleSelect,
          handleCheck,
          checkable,
          showLine,
          0,
        )
      )}
    </div>
  );
}
