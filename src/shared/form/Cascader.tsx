/**
 * Cascader 级联选择（shared：`appearance` 切换浮层与浅层原生双 select）。
 * 支持**任意层级**的静态树：根数组 `options` 即浮层**最左一列**；每项 `{ value, label, children? }`，有 `children` 则向右多一列。
 * 例如**省→市→区**三级，或**市→区**二级（根节点直接是市、`children` 为区），数据结构相同，无需省这一层。
 * `value` 为从根到选中节点的路径；若传入 `@preact/signals` 的 `signal()`，组件会在选择/清空时**自动写回**该 Signal，可不写 `onChange`。
 * 若 `value` 为字面量或普通 getter，仍须在 `onChange` 内更新外部状态。清空为 `[]`。
 *
 * **动态加载**：传入 `loadChildren` 后，未写 `children` 且未标记 `isLeaf` 的节点会在展开该级时请求子节点；
 * 结果缓存在组件内并与 `options` 合并展示；也可在回调里自行合并到 `options` 后回传以持久化。
 *
 * **层级与列数**：嵌套几层 `children`，交互上即可展开几列（从左到右逐级选）；**无需**传入「层数」配置。
 * 打开时先显示最左一列（根），每选一层在右侧多一列，直到叶子。
 *
 * **浮层与滚动**：下拉在根内 **`position:absolute`**（`top-full`），随滚动容器与触发条一起走；**不使用** {@link Portal}。
 * 关外部用 **`document` 冒泡 `click`** + `composedPath` / {@link pressEventLikelyInsideRoot}。若页面里 **`Form` 下方紧挨大块兄弟（如代码预览）**，后绘制的兄弟会盖住浮层，宜调整 **DOM 顺序**（代码块在前、表单项在后）或提高表单侧层叠上下文，勿改挂 body。
 */

import { useRef } from "preact/hooks";
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

/**
 * 级联一层的节点；静态数据用 `children` 嵌套下一层（深度不限）。
 *
 * @example 二级静态（市 → 区），根数组即第一列：
 * ```ts
 * const options: CascaderOption[] = [
 *   { value: "hangzhou", label: "杭州", children: [
 *     { value: "xihu", label: "西湖区" },
 *   ]},
 * ];
 * ```
 */
export interface CascaderOption {
  value: string;
  label: string;
  /** 下一列选项；省略或空数组表示叶子（静态树） */
  children?: CascaderOption[];
  /**
   * 与 `loadChildren` 联用：为 `true` 表示确定无下级，不再请求。
   * 未传 `loadChildren` 时，省略 `children` 即视为叶子（与原先行为一致）。
   */
  isLeaf?: boolean;
}

/** 级联展示形态：`dropdown` 多列浮层；`native` 两级内双原生 select（无 `loadChildren`） */
export type CascaderAppearance = "dropdown" | "native";

export interface CascaderProps {
  /**
   * 静态树：根数组即第一列（可为省、市、类目一级等任意语义）；子级用 `children` 嵌套，二级或 N 级同一套结构。
   */
  options: CascaderOption[];
  /** 选中路径（每段为对应层级的 value）；见 {@link MaybeSignal} */
  value?: MaybeSignal<string[]>;
  size?: SizeVariant;
  disabled?: boolean;
  /**
   * 路径变化时的可选回调。`value` 为 Preact `Signal` 时，组件会先自动写入 Signal，无需仅为同步状态再传此回调；仍可传入以做日志等副作用。
   * `value` 为字面量或普通 `() => T` getter 时，须在此回调中更新数据源。
   */
  onChange?: (value: string[]) => void;
  placeholder?: string;
  class?: string;
  name?: string;
  id?: string;
  /** 为 true 时隐藏聚焦激活态边框；默认 false 显示 ring */
  hideFocusRing?: boolean;
  /**
   * 按当前路径异步加载**该路径节点**的直接子节点；返回的子项会写入内部缓存并触发重绘。
   * 路径含义：`[]` 不使用（根列表始终来自 `options`）；`["zhejiang"]` 表示加载「浙江」下的市/区列表。
   */
  loadChildren?: (path: string[]) => Promise<CascaderOption[]>;
  /** `loadChildren` 失败时回调；组件会将该路径缓存为空数组，列内显示为无下级 */
  onLoadError?: (path: string[], error: unknown) => void;
  /**
   * `native` 时：仅当**无** `loadChildren` 且静态树深度 ≤2 时使用双原生 select；
   * 否则自动使用 `dropdown` 浮层（与桌面一致）。
   */
  appearance?: CascaderAppearance;
}

const sizeClasses: Record<SizeVariant, string> = {
  xs: "px-2.5 py-1 text-xs rounded-md",
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-3 py-2 text-sm rounded-lg",
  lg: "px-4 py-2.5 text-base rounded-lg",
};

/** 原生双 select 分支用的尺寸（移动最小触控高度） */
const sizeClassesNative: Record<SizeVariant, string> = {
  xs: "px-3 py-2 text-sm rounded-md min-h-[44px]",
  sm: "px-4 py-2.5 text-sm rounded-lg min-h-[44px]",
  md: "px-4 py-3 text-base rounded-lg min-h-[48px]",
  lg: "px-5 py-3.5 text-base rounded-lg min-h-[52px]",
};

/**
 * 静态 `options` 树的最大深度（根层计为 1）。
 *
 * @param opts - 当前层节点列表
 * @param depth - 当前层深度
 */
function maxStaticTreeDepth(opts: CascaderOption[], depth = 1): number {
  let m = depth;
  for (const o of opts) {
    if (o.children?.length) {
      m = Math.max(m, maxStaticTreeDepth(o.children, depth + 1));
    }
  }
  return m;
}

/**
 * 两级及以内静态树：横向双原生 select，适合移动端；与浮层版互斥于 {@link Cascader} 入口。
 *
 * @param props - 级联 props（忽略 `loadChildren`）
 */
function CascaderNativeTwoLevel(props: CascaderProps): JSX.Element {
  const {
    options,
    value: valueProp,
    size = "md",
    disabled = false,
    onChange,
    placeholder = "请选择",
    class: className,
    name,
    id,
    hideFocusRing = false,
  } = props;
  const value = readMaybeSignal(valueProp) ?? [];
  const sizeCls = sizeClassesNative[size];

  /**
   * 将新路径写回受控源：`valueProp` 为 Signal 时自动赋值；再调用可选的 `onChange`。
   *
   * @param newPath - 更新后的路径
   */
  const commitPath = (newPath: string[]) => {
    commitMaybeSignal(valueProp, newPath);
    onChange?.(newPath);
  };
  const parentValue = value[0] ?? "";
  const childOptions = options.find((o) => o.value === parentValue)?.children ??
    [];
  const childValue = value[1] ?? "";

  return (
    <div class={twMerge("flex flex-wrap items-center gap-2", className)}>
      <select
        id={id}
        name={name}
        value={parentValue}
        disabled={disabled}
        class={twMerge(
          "touch-manipulation",
          nativeSelectSurface,
          controlBlueFocusRing(!hideFocusRing),
          sizeCls,
          "min-w-[120px]",
        )}
        onChange={(e: Event) => {
          const v = (e.target as HTMLSelectElement).value;
          commitPath(v ? [v] : []);
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {childOptions.length > 0 && (
        <select
          value={childValue}
          disabled={disabled}
          class={twMerge(
            "touch-manipulation",
            nativeSelectSurface,
            controlBlueFocusRing(!hideFocusRing),
            sizeCls,
            "min-w-[120px]",
          )}
          onChange={(e: Event) => {
            const v = (e.target as HTMLSelectElement).value;
            commitPath(parentValue ? [parentValue, v] : []);
          }}
        >
          <option value="">{placeholder}</option>
          {childOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}
    </div>
  );
}

const colBtnBase =
  "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/80";

const colBtnActive =
  "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200";

const DROPDOWN_ESC_KEY = "__lastDropdownClose" as const;

/** 将路径编码为缓存键，避免段值含分隔符冲突 */
function pathKey(path: string[]): string {
  return path.join("\u0001");
}

/**
 * 静态数据下该项是否还有下一列（存在非空 `children`）。
 * 与「仅写 `children: []`」区分：空数组视为无下级，选完应关面板。
 */
function staticOptionHasChildren(opt: CascaderOption): boolean {
  const ch = opt.children;
  return Array.isArray(ch) && ch.length > 0;
}

/**
 * 判断指针事件是否发生在 `root` 子树内；优先用 `composedPath` 穿透 Shadow DOM，
 * 避免仅用 `Node.contains` 在部分环境下误判「外部」为内部或相反。
 */
function eventTargetInsideRoot(e: Event, root: HTMLElement | null): boolean {
  if (!root) return false;
  if (typeof e.composedPath === "function") {
    const path = e.composedPath();
    if (path.length > 0 && path.includes(root)) return true;
  }
  /** 点击落在文本节点时 `contains` 需落到父元素 */
  const raw = e.target;
  let n: Node | null = raw instanceof Node ? raw : null;
  if (n && n.nodeType === 3) {
    n = n.parentNode;
  }
  return n instanceof Node && root.contains(n);
}

/**
 * 按下（pointer/mouse）是否应视为发生在 `root` 子树内，用于「点外部关面板」。
 *
 * 长页面里**后出现的兄弟区块**（标题、卡片、代码区）可能叠在上方级联控件的浮层**视觉之上**，
 * 命中测试的 `event.target` 会落在 root **外**，`window` 捕获阶段误判为外部并立刻 `closePanel`，
 * 表现为点「浙江」等一级项直接关面板、不出第二列；二级示例在文档中更靠下，叠层情况不同，故看似「只有三级坏」。
 *
 * 在 `eventTargetInsideRoot` 为假时，若事件带 `clientX`/`clientY`，再用 `document.elementsFromPoint`
 * 从上往下遍历叠层：栈里**任一**元素被 `root.contains`，仍视为点在组件内。
 *
 * @param e - `pointerdown` 或 `mousedown`
 * @param root - {@link Cascader} 根节点（`data-ui-cascader-root`）
 */
function pressEventLikelyInsideRoot(
  e: Event,
  root: HTMLElement | null,
): boolean {
  if (!root) return false;
  if (eventTargetInsideRoot(e, root)) return true;

  const me = e as Partial<MouseEvent>;
  const x = me.clientX;
  const y = me.clientY;
  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    Number.isNaN(x) ||
    Number.isNaN(y)
  ) {
    return false;
  }

  const doc = root.ownerDocument;
  if (!doc || typeof doc.elementsFromPoint !== "function") {
    return false;
  }

  let stack: Element[];
  try {
    stack = doc.elementsFromPoint(x, y) as Element[];
  } catch {
    return false;
  }
  if (!stack || stack.length === 0) return false;

  for (let i = 0; i < stack.length; i++) {
    const el = stack[i]!;
    if (el instanceof Element && root.contains(el)) {
      return true;
    }
  }
  return false;
}

/**
 * 本次 `click` 的 `composedPath` 是否经过 `data-ui-cascader-root`（含其下 absolute 浮层）。
 */
function clickComposedPathIncludesRoot(
  e: Event,
  root: HTMLElement | null,
): boolean {
  if (!root || typeof e.composedPath !== "function") return false;
  try {
    return e.composedPath().includes(root);
  } catch {
    return false;
  }
}

/**
 * 在静态 `options` 树上，按「当前面板路径 + 列下标 + 被点 value」解析节点，得到与数据源一致的 {@link CascaderOption}。
 * 用于 {@link pickInColumn} 判断是否有下级：避免列表渲染传入的 `opt` 引用在个别时序下不完整。
 */
function getOptionAtColumnIndex(
  rootOpts: CascaderOption[],
  panelPath: string[],
  colIndex: number,
  pickedValue: string,
): CascaderOption | null {
  let level = rootOpts;
  for (let c = 0; c < colIndex; c++) {
    const seg = panelPath[c];
    if (seg === undefined) return null;
    const node = level.find((o) => o.value === seg) ?? null;
    if (!node) return null;
    level = node.children ?? [];
  }
  return level.find((o) => o.value === pickedValue) ?? null;
}

/**
 * 沿 `options` 树查找路径对应节点（仅看 props 上的 `children`，不看动态缓存）。
 */
function getNodeAtPath(
  opts: CascaderOption[],
  path: string[],
): CascaderOption | null {
  let level = opts;
  let found: CascaderOption | null = null;
  for (const key of path) {
    found = level.find((o) => o.value === key) ?? null;
    if (!found) return null;
    level = found.children ?? [];
  }
  return found;
}

/**
 * 已知合并视图中的节点及其路径，解析其直接子列表（props.children / isLeaf / 懒加载缓存）。
 */
function getChildrenOfResolvedNode(
  node: CascaderOption | null,
  nodePath: string[],
  loadChildren: CascaderProps["loadChildren"],
  cache: Record<string, CascaderOption[]>,
): CascaderOption[] {
  if (!node) return [];
  if (Array.isArray(node.children)) return node.children;
  if (node.isLeaf) return [];
  if (!loadChildren) return [];
  const key = pathKey(nodePath);
  if (Object.prototype.hasOwnProperty.call(cache, key)) {
    return cache[key]!;
  }
  return [];
}

/**
 * 在 `options` + 懒加载缓存的**合并视图**中解析路径对应节点。
 * 子级仅存在于 `childCache` 时（如市不在 props 树里）也能定位，否则第三级永远无法加载。
 */
function getMergedNode(
  baseOptions: CascaderOption[],
  path: string[],
  loadChildren: CascaderProps["loadChildren"],
  cache: Record<string, CascaderOption[]>,
): CascaderOption | null {
  if (!loadChildren || path.length === 0) return null;
  let level: CascaderOption[] = baseOptions;
  let current: CascaderOption | null = null;
  for (let i = 0; i < path.length; i++) {
    const seg = path[i]!;
    current = level.find((o) => o.value === seg) ?? null;
    if (!current) return null;
    if (i === path.length - 1) return current;
    const pathToCurrent = path.slice(0, i + 1);
    level = getChildrenOfResolvedNode(
      current,
      pathToCurrent,
      loadChildren,
      cache,
    );
  }
  return current;
}

/**
 * 解析某路径节点在界面上的子列表：无懒加载时等同 `options` 树；有懒加载时合并缓存解析父节点。
 */
function getEffectiveChildren(
  baseOptions: CascaderOption[],
  parentPath: string[],
  loadChildren: CascaderProps["loadChildren"],
  cache: Record<string, CascaderOption[]>,
): CascaderOption[] {
  if (!loadChildren) {
    const node = getNodeAtPath(baseOptions, parentPath);
    return node?.children ?? [];
  }
  if (parentPath.length === 0) {
    return baseOptions;
  }
  const node = getMergedNode(baseOptions, parentPath, loadChildren, cache);
  return getChildrenOfResolvedNode(node, parentPath, loadChildren, cache);
}

/**
 * 是否应对 `parentPath` 节点发起懒加载（已打开面板、有 loadChildren、未缓存、非叶子）。
 */
function needsLazyFetch(
  baseOptions: CascaderOption[],
  parentPath: string[],
  loadChildren: CascaderProps["loadChildren"],
  cache: Record<string, CascaderOption[]>,
  loadingKey: string | null,
): boolean {
  if (!loadChildren || parentPath.length === 0) return false;
  const node = getMergedNode(baseOptions, parentPath, loadChildren, cache);
  if (!node || node.isLeaf) return false;
  if (Array.isArray(node.children)) return false;
  const key = pathKey(parentPath);
  if (Object.prototype.hasOwnProperty.call(cache, key)) return false;
  if (loadingKey === key) return false;
  return true;
}

/**
 * 列数：已选路径长度 + 1，但若最后一级已确定为叶子且无进行中的加载，则不再多出一列「无下级」。
 */
function computeNumCols(
  baseOptions: CascaderOption[],
  panelPath: string[],
  loadChildren: CascaderProps["loadChildren"],
  cache: Record<string, CascaderOption[]>,
  loadingKey: string | null,
): number {
  if (panelPath.length === 0) return 1;
  const key = pathKey(panelPath);
  const kids = getEffectiveChildren(
    baseOptions,
    panelPath,
    loadChildren,
    cache,
  );
  const pending = needsLazyFetch(
    baseOptions,
    panelPath,
    loadChildren,
    cache,
    loadingKey,
  );
  const loadingHere = loadingKey === key;
  if (kids.length === 0 && !pending && !loadingHere) {
    return panelPath.length;
  }
  return panelPath.length + 1;
}

/**
 * 第 `c` 列展示的列表：`pathPrefix = panelPath.slice(0, c)` 对应节点的子项（含动态缓存）。
 */
function columnItemsMerged(
  baseOptions: CascaderOption[],
  pathPrefix: string[],
  loadChildren: CascaderProps["loadChildren"],
  cache: Record<string, CascaderOption[]>,
): CascaderOption[] {
  if (pathPrefix.length === 0) return baseOptions;
  return getEffectiveChildren(
    baseOptions,
    pathPrefix,
    loadChildren,
    cache,
  );
}

/**
 * 触发条文案：沿路径在「根列表 + 各级有效子列表」中解析 label。
 */
function displayLabelsMerged(
  baseOptions: CascaderOption[],
  path: string[],
  loadChildren: CascaderProps["loadChildren"],
  cache: Record<string, CascaderOption[]>,
): string {
  if (path.length === 0) return "";
  const labels: string[] = [];
  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    const parentPath = path.slice(0, i);
    const level = parentPath.length === 0 ? baseOptions : getEffectiveChildren(
      baseOptions,
      parentPath,
      loadChildren,
      cache,
    );
    const node = level.find((o) => o.value === key);
    if (!node) {
      labels.push(key);
      break;
    }
    labels.push(node.label);
  }
  return labels.join(" / ");
}

/**
 * 任意层级级联（Preact）：浮层内列数由 `computeNumCols` 决定；支持 `loadChildren` 动态子项。
 * 读 `pathInPanel` / `childCache` 时随 Signal 更新重绘面板列。
 */
function CascaderDropdownPanel(props: CascaderProps): JSX.Element {
  const {
    options: rootOptions,
    loadChildren,
    onLoadError,
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
  /** 组件根 DOM（触发条 + 内联 absolute 浮层），供「点外部」与 `elementsFromPoint` 兜底 */
  const rootRef = useRef<HTMLDivElement | null>(null);
  /** 浮层内当前路径，打开时从 value 拷贝，点击列内项时更新 */
  const pathInPanel = useSignal<string[]>([]);
  /** 懒加载子节点缓存：键为 pathKey(父路径) */
  const childCache = useSignal<Record<string, CascaderOption[]>>({});
  /** 当前正在请求的父路径键，用于展示加载态 */
  const loadingPathKey = useSignal<string | null>(null);
  const sizeCls = sizeClasses[size];

  /**
   * 将新路径写回受控源：`value` 为 Signal 时自动赋值；再调用可选的 `onChange`。
   *
   * @param newPath - 更新后的路径（可为 `[]` 表示清空）
   */
  const commitPath = (newPath: string[]) => {
    commitMaybeSignal(value, newPath);
    onChange?.(newPath);
  };

  const closePanel = () => {
    openState.value = false;
  };

  /**
   * 懒加载等分支里关面板：同步关 + 微任务再关一次，防止批处理末尾仍被写成开。
   */
  const scheduleClosePanel = () => {
    closePanel();
    queueMicrotask(() => {
      if (openState.value) {
        openState.value = false;
      }
    });
  };

  /**
   * 展开时关外部：在 **`document` 冒泡阶段**监听 **`click`**（`capture: false`）。
   */
  useSignalEffect(() => {
    if (!openState.value) return;
    const doc = globalThis.document;
    if (!doc) return;

    let disposed = false;
    let attached = false;

    const onClickOutsideBubble = (e: Event) => {
      if (!openState.value) return;
      if (
        e instanceof MouseEvent && typeof e.button === "number" &&
        e.button !== 0
      ) {
        return;
      }
      const root = rootRef.current;
      if (!root) return;
      if (clickComposedPathIncludesRoot(e, root)) return;
      if (pressEventLikelyInsideRoot(e, root)) return;
      closePanel();
    };

    const attach = () => {
      if (disposed || !openState.value) return;
      attached = true;
      doc.addEventListener("click", onClickOutsideBubble, false);
    };

    /** 避免与「本次用于打开面板」的同一 tick 交错 */
    queueMicrotask(attach);

    return () => {
      disposed = true;
      if (attached) {
        doc.removeEventListener("click", onClickOutsideBubble, false);
      }
    };
  });

  const openPanel = () => {
    if (disabled) return;
    const path = readMaybeSignal(value) ?? [];
    pathInPanel.value = [...path];
    openState.value = true;
  };

  /**
   * 打开且存在 `loadChildren` 时，按当前面板路径自上而下依次补全未缓存的层级。
   */
  useSignalEffect(() => {
    const load = loadChildren;
    if (!load || !openState.value) return;
    const opts = rootOptions;
    const pp = pathInPanel.value;
    const cache = childCache.value;
    const n = computeNumCols(
      opts,
      pp,
      load,
      cache,
      loadingPathKey.value,
    );

    for (let c = 1; c < n; c++) {
      const prefix = pp.slice(0, c);
      const key = pathKey(prefix);
      /** 市等节点可能只在 cache 中，必须用合并视图 */
      const node = getMergedNode(opts, prefix, load, cache);
      if (!node || node.isLeaf) continue;
      if (Array.isArray(node.children)) continue;
      if (Object.prototype.hasOwnProperty.call(cache, key)) continue;
      if (loadingPathKey.value === key) continue;

      loadingPathKey.value = key;
      void load(prefix)
        .then((kids) => {
          childCache.value = { ...childCache.value, [key]: kids };
        })
        .catch((err) => {
          onLoadError?.(prefix, err);
          childCache.value = { ...childCache.value, [key]: [] };
        })
        .finally(() => {
          if (loadingPathKey.value === key) {
            loadingPathKey.value = null;
          }
        });
      break;
    }
  });

  /** 下拉打开时注册 Esc 关闭（与 Select 等共用键）；闭包固定避免 cleanup 引用漂移 */
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

  /**
   * 触发条展示：读受控 `value` + `childCache`（与原先内层 thunk 一致，改为供函数型子/属性调用）。
   */
  const getTriggerView = () => {
    const opts = rootOptions;
    const load = loadChildren;
    const path = readMaybeSignal(value) ?? [];
    const cache = childCache.value;
    const displayText =
      (load ? displayLabelsMerged(opts, path, load, cache) : (() => {
        if (path.length === 0) return "";
        const labels: string[] = [];
        let level = opts;
        for (const key of path) {
          const node = level.find((o) => o.value === key);
          if (!node) {
            labels.push(key);
            break;
          }
          labels.push(node.label);
          level = node.children ?? [];
        }
        return labels.join(" / ");
      })()) || placeholder;
    const hasSelection = path.length > 0 && path[0] !== "";
    return { displayText, hasSelection };
  };

  /**
   * 在列 `colIndex` 选中 `opt`：截断更深层后追加；叶子或已确认无下级则关闭浮层。
   *
   * 静态树（无 `loadChildren`）是否关面板：以 **`options` 树上解析出的节点** 是否有非空 `children` 为准，
   * 不单独信任渲染回调里的 `opt` 引用（避免个别时序下引用不完整被误判为叶子）。
   */
  const pickInColumn = (colIndex: number, opt: CascaderOption) => {
    const opts = rootOptions;
    const load = loadChildren;
    const current = pathInPanel.value;
    const newPath = [...current.slice(0, colIndex), opt.value];
    /** 静态树：从 props.options 再解析一次，便于日志区分「列表里的 opt」与「树上 canonical」是否一致 */
    const resolvedFromTree = !load
      ? getOptionAtColumnIndex(opts, current, colIndex, opt.value)
      : null;
    const canonical = !load ? (resolvedFromTree ?? opt) : opt;
    const hasBranch = staticOptionHasChildren(canonical);

    /** 静态叶子：先关面板再写路径，微任务再兜底关一次 */
    if (!load && !hasBranch) {
      openState.value = false;
      pathInPanel.value = newPath;
      commitPath(newPath);
      queueMicrotask(() => {
        if (openState.value) {
          openState.value = false;
        }
      });
      return;
    }

    pathInPanel.value = newPath;
    commitPath(newPath);

    /** 点击时刻的最新缓存，避免闭包读到旧 cache */
    const cacheNow = childCache.value;
    if (!load) {
      return;
    }

    const node = getMergedNode(opts, newPath, load, cacheNow);
    const kids = getEffectiveChildren(
      opts,
      newPath,
      load,
      cacheNow,
    );
    const k = pathKey(newPath);
    const isLoading = loadingPathKey.value === k;
    if (kids.length > 0) return;
    if (isLoading) return;
    if (node?.isLeaf) {
      scheduleClosePanel();
      return;
    }
    if (Array.isArray(node?.children) && node.children.length === 0) {
      scheduleClosePanel();
      return;
    }
    if (
      Object.prototype.hasOwnProperty.call(cacheNow, k) &&
      cacheNow[k].length === 0
    ) {
      scheduleClosePanel();
      return;
    }
  };

  /**
   * 渲染多列浮层内容（随 `pathInPanel` / `childCache` / `loadingPathKey` 订阅更新）。
   */
  function renderCascaderPanel(): JSX.Element {
    const opts = rootOptions;
    const load = loadChildren;
    const cache = childCache.value;
    const panelPath = pathInPanel.value;
    const loadingKey = loadingPathKey.value;
    const pathCommitted = readMaybeSignal(value) ?? [];
    const hasSelection = pathCommitted.length > 0 &&
      pathCommitted[0] !== "";

    const numCols = Math.max(
      1,
      computeNumCols(opts, panelPath, load, cache, loadingKey),
    );

    const columns: {
      colIndex: number;
      items: CascaderOption[];
      selectedKey: string | undefined;
      showLoading: boolean;
    }[] = [];
    for (let c = 0; c < numCols; c++) {
      const prefix = panelPath.slice(0, c);
      const items = load
        ? columnItemsMerged(opts, prefix, load, cache)
        : (() => {
          if (prefix.length === 0) return opts;
          const n0 = getNodeAtPath(opts, prefix);
          return n0?.children ?? [];
        })();
      const pk = pathKey(prefix);
      const showLoading = Boolean(
        load &&
          c > 0 &&
          items.length === 0 &&
          (loadingKey === pk ||
            needsLazyFetch(
              opts,
              prefix,
              load,
              cache,
              loadingKey,
            )),
      );
      columns.push({
        colIndex: c,
        items,
        selectedKey: panelPath[c],
        showLoading,
      });
    }

    return (
      <div class="flex min-h-0 min-w-0 max-w-full flex-col">
        {/* 列区域：不用 `display:contents`，避免个别环境下命中/包含与关外部判断异常 */}
        <div class="grid max-h-72 w-max min-w-0 max-w-full grid-flow-col overflow-x-auto [grid-auto-columns:minmax(10rem,max-content)]">
          {columns.map((col, colIdx) => (
            <div
              key={col.colIndex}
              class={twMerge(
                "flex min-h-0 max-h-72 min-w-0 flex-col overflow-y-auto border-slate-200 dark:border-slate-600",
                colIdx < columns.length - 1 && "border-r",
              )}
            >
              {col.colIndex === 0 && (
                <button
                  type="button"
                  class={twMerge(
                    colBtnBase,
                    "text-slate-500 dark:text-slate-400",
                    !hasSelection && colBtnActive,
                  )}
                  onClick={() => {
                    pathInPanel.value = [];
                    commitPath([]);
                    closePanel();
                  }}
                >
                  {placeholder}
                </button>
              )}
              {col.showLoading
                ? (
                  <div class="px-3 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    加载中…
                  </div>
                )
                : col.items.length === 0
                ? (
                  <div class="px-3 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                    {col.colIndex === 0 ? "暂无选项" : "无下级选项"}
                  </div>
                )
                : (
                  col.items.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      class={twMerge(
                        colBtnBase,
                        col.selectedKey === opt.value && colBtnActive,
                      )}
                      onClick={() => pickInColumn(col.colIndex, opt)}
                    >
                      {opt.label}
                    </button>
                  ))
                )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /** 触发条展示文案（与受控 value、懒加载缓存一致） */
  const triggerView = getTriggerView();
  const ariaLabelCascader = triggerView.displayText || placeholder ||
    "级联选择";

  return (
    <div
      ref={(el: HTMLDivElement | null) => {
        /** 卸载时传入 null，避免保留 Detached 节点引用 */
        rootRef.current = el;
      }}
      data-ui-cascader-root=""
      class={twMerge(
        /** `overflow-visible`：减轻 flex 祖先裁切多列浮层；展开时抬高以压过后序兄弟块 */
        "relative inline-block w-full min-w-0 overflow-visible",
        openState.value && "z-[1000]",
        className,
      )}
    >
      {name != null &&
        (readMaybeSignal(value) ?? [])
          .filter((x) => x !== "")
          .map((v, i) => (
            <input key={`${i}-${v}`} type="hidden" name={name} value={v} />
          ))}
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={openState.value}
        aria-label={ariaLabelCascader}
        class={twMerge(
          "w-full min-w-0",
          pickerTriggerSurface,
          controlBlueFocusRing(!hideFocusRing),
          sizeCls,
        )}
        onClick={() => {
          if (disabled) return;
          if (openState.value) closePanel();
          else openPanel();
        }}
      >
        <span
          class={twMerge(
            "truncate min-w-0 text-left",
            triggerView.hasSelection
              ? "text-slate-900 dark:text-slate-100"
              : "text-slate-400 dark:text-slate-500",
          )}
        >
          {triggerView.displayText}
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
        <div
          role="dialog"
          aria-label="级联选择"
          data-ui-cascader-panel=""
          class={twMerge(
            "absolute z-50 top-full left-0 mt-1 w-max max-h-72 min-w-0 max-w-[min(100vw-1rem,520px)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800",
          )}
        >
          {renderCascaderPanel()}
        </div>
      )}
    </div>
  );
}

/**
 * 级联选择：默认多列浮层（含懒加载）；`appearance="native"` 时在浅层静态树下使用双原生 select。
 *
 * @param props - {@link CascaderProps}
 */
export function Cascader(props: CascaderProps): JSX.Element {
  const appearance = props.appearance ?? "dropdown";
  if (
    appearance === "native" &&
    props.loadChildren == null &&
    maxStaticTreeDepth(props.options) <= 2
  ) {
    return CascaderNativeTwoLevel(props);
  }
  return CascaderDropdownPanel(props);
}
