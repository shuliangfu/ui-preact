/**
 * 日期/时间选择器浮层工具：点击外部关闭、时/分列表隐藏滚动条等。
 *
 * **DatePicker / TimePicker / DateTimePicker / ColorPicker（锚定触发器）**：弹层与触发器同处 **`relative` 子树**，用 `position:fixed` + {@link computePickerPortalStyle} 贴触发器，
 * 并由 {@link subscribePickerAnchorScrollAndResize} 跟随滚动（不用 `createPortal`，减轻与页面滚动不同步的延迟感）。
 * 注册点外关闭须与几何同步一并延后到 **`queueMicrotask`**（见 {@link registerPickerFixedOverlayPositionAndOutsideClick}）。
 * {@link getFormPortalBodyHost} 给仍需挂 `document.body` 的浮层（如富文本）用。
 */

/**
 * Tailwind CSS **v4**：`z-*` 对任意整数会生成工具类，**写 `z-1070` 即 `z-index:1070`**。
 * v3 未扩展 theme 时 `z-1070` 可能不生成，常用 `z-[1070]`；v4 不必强制方括号（见官方讨论如 tailwindlabs/tailwindcss#18951）。
 */
export const pickerPortalZClass = "z-1070";

/**
 * 弹层 `z-index` 内联值：高于文档站内常见控件，且不依赖 Tailwind 是否扫描到本文件。
 */
export const pickerOverlayZIndexInline = "100000";

/**
 * 根据触发器视口矩形计算 `position:fixed` 的 `top`/`left`/`zIndex`（弹层在触发器下方，左右夹紧视口）。
 *
 * @param trigger - 一般为触发按钮；为 null 时退化为左上角留白
 * @param options - 下边距、视口内边距、用于右边界推算的最小宽度（与 `min-w-[288px]` 对齐）
 */
export function computePickerPortalStyle(
  trigger: HTMLElement | null,
  options?: {
    marginBelow?: number;
    viewportInset?: number;
    panelMinWidth?: number;
  },
): Record<string, string> {
  const margin = options?.marginBelow ?? 4;
  const inset = options?.viewportInset ?? 8;
  const minW = options?.panelMinWidth ?? 288;
  /** 与 {@link pickerOverlayZIndexInline} 同步，保证打开首帧也有合法层叠 */
  const z = pickerOverlayZIndexInline;
  const vw = typeof globalThis !== "undefined" &&
      typeof globalThis.innerWidth === "number"
    ? globalThis.innerWidth
    : 1024;
  if (trigger == null) {
    return {
      top: `${inset}px`,
      left: `${inset}px`,
      zIndex: z,
    };
  }
  const r = trigger.getBoundingClientRect();
  let left = r.left;
  const maxLeft = vw - inset - minW;
  if (left > maxLeft) left = Math.max(inset, maxLeft);
  if (left < inset) left = inset;
  return {
    top: `${Math.round(r.bottom + margin)}px`,
    left: `${Math.round(left)}px`,
    zIndex: z,
  };
}

/**
 * 判断两段浮层定位是否在布局上等价（仅比较 `top` / `left` / `zIndex` 字符串）。
 *
 * {@link computePickerPortalStyle} 每次返回**新对象**，若不经比较就写入 signal，`Object.is` 恒为不等，
 * 会反复触发依赖该 signal 的整段 **函数子响应式插入** 重算；滚动/resize 回调与 DOM 几何写回交错时，
 * 可能形成高密度同步更新甚至反馈环，表现为点击打开日期面板后主线程长时间占用（像「卡死」）。
 *
 * @param prev - 上一帧已提交到 signal 或 DOM 的样式
 * @param next - 本次计算结果
 * @returns 三者字符串均相同则为 true
 */
export function isSamePickerPortalGeometry(
  prev: Record<string, string>,
  next: Record<string, string>,
): boolean {
  return prev.top === next.top && prev.left === next.left &&
    prev.zIndex === next.zIndex;
}

/**
 * 时间列表滚动列容器上的 data 属性名（带 `overflow-y-auto` 的列内容盒，时/分/秒各一列）。
 * 文档站编译路径可能不下发 `data-*` 到 DOM，故 {@link pickerTimeListScrollClass} 同时带 {@link PICKER_TIME_SCROLL_COL_FALLBACK_CLASS} 供查询。
 */
export const PICKER_TIME_SCROLL_COL_ATTR = "data-picker-time-col";

/**
 * 与 {@link PICKER_TIME_SCROLL_COL_ATTR} 同节点上的稳定 class，供 `querySelectorAll` 回退（不依赖 Tailwind 生成规则，仅为标记）。
 */
export const PICKER_TIME_SCROLL_COL_FALLBACK_CLASS = "ui-picker-time-col";

/**
 * 列语义：`hour` | `minute` | `second`，与 {@link PICKER_TIME_CELL_VALUE_ATTR} 组合实现稳定滚动对齐。
 */
export const PICKER_TIME_KIND_ATTR = "data-picker-time-kind";

/**
 * 每行按钮上的当前段数值（0–23 / 0–59），与列 kind 一起用于 `querySelector`，不依赖高亮 class。
 */
export const PICKER_TIME_CELL_VALUE_ATTR = "data-picker-cell-value";

/**
 * 单条时间轨（单选 / range 开始 / range 结束 / multiple 草稿轨）的根节点，避免双轨时 `querySelector` 命中错误列。
 */
export const PICKER_TIME_STRIP_SCOPE_ATTR = "data-picker-time-strip-scope";

/**
 * 当前列选中行按钮上的 data 属性名（仅选中项设置，值为真即可，避免 `="false"` 仍被 `[attr]` 选中）。
 */
export const PICKER_TIME_ACTIVE_ATTR = "data-picker-time-active";

/**
 * 打开浮层或切换 range 槽位时，按草稿滚到视区中部：各列是否展示须与 format 粒度一致。
 */
export interface PickerTimeColumnDraft {
  showHour: boolean;
  showMinute: boolean;
  showSecond: boolean;
  hour: number;
  minute: number;
  second: number;
  /**
   * 与 {@link PICKER_TIME_STRIP_SCOPE_ATTR} 一致；缺省按 `default` 解析（与 TimePicker 时间轨根节点属性对齐）。
   */
  stripScope?: string;
}

/**
 * 由 draft 中各列是否展示，推算「时/分/秒」在 `querySelectorAll([data-picker-time-col])` 里的下标（与 TimePicker / DateTimePicker 渲染顺序一致）。
 *
 * @param draft - 当前轨展示哪些时间列
 * @param kind - 要找的列语义
 * @returns 列下标；不应滚动该 kind 时为 `-1`
 */
function pickerTimeColumnListIndex(
  draft: PickerTimeColumnDraft,
  kind: "hour" | "minute" | "second",
): number {
  let idx = 0;
  if (draft.showHour) {
    if (kind === "hour") return idx;
    idx++;
  }
  if (draft.showMinute) {
    if (kind === "minute") return idx;
    idx++;
  }
  if (draft.showSecond) {
    if (kind === "second") return idx;
    idx++;
  }
  return -1;
}

/**
 * 当前轨应渲染的时间列数量（与 TimePicker 展示列数一致）。
 *
 * @param draft - 草稿上的 show 标记
 */
function pickerTimeScrollColumnNeedCount(draft: PickerTimeColumnDraft): number {
  return (draft.showHour ? 1 : 0) + (draft.showMinute ? 1 : 0) +
    (draft.showSecond ? 1 : 0);
}

/**
 * 在子树内收集所有「时间滚动列」容器：先 `data-picker-time-col`，再 {@link PICKER_TIME_SCROLL_COL_FALLBACK_CLASS}，去重。
 *
 * @param searchRoot - 查找起点
 */
function queryPickerTimeScrollColumnsWithin(
  searchRoot: Element,
): HTMLElement[] {
  const seen = new Set<HTMLElement>();
  const add = (list: NodeListOf<Element>) => {
    for (let i = 0; i < list.length; i++) {
      const n = list[i];
      if (n instanceof HTMLElement) seen.add(n);
    }
  };
  add(searchRoot.querySelectorAll(`[${PICKER_TIME_SCROLL_COL_ATTR}]`));
  add(
    searchRoot.querySelectorAll(`.${PICKER_TIME_SCROLL_COL_FALLBACK_CLASS}`),
  );
  return [...seen];
}

/**
 * 解析本条 draft 应对哪段子树滚动：`querySelector` 仅匹配后代，若 `data-picker-time-strip-scope` 未进 DOM 或子树尚未挂列，则退化为整块面板；range 双轨时在面板上用列下标偏移区分开始/结束。
 *
 * @param panelRoot - 浮层 `role="dialog"` 根
 * @param draft - 含 stripScope
 */
function resolvePickerTimeSearchRoot(
  panelRoot: HTMLElement,
  draft: PickerTimeColumnDraft,
): { searchRoot: HTMLElement; columnBaseIndex: number } {
  const need = pickerTimeScrollColumnNeedCount(draft);
  const scope = draft.stripScope ?? "default";
  const scoped = panelRoot.querySelector(
    `[${PICKER_TIME_STRIP_SCOPE_ATTR}="${scope}"]`,
  );
  if (scoped instanceof HTMLElement) {
    const scopedCols = queryPickerTimeScrollColumnsWithin(scoped);
    if (scopedCols.length > 0) {
      return { searchRoot: scoped, columnBaseIndex: 0 };
    }
  }
  const all = queryPickerTimeScrollColumnsWithin(panelRoot);
  if (all.length === need) {
    return { searchRoot: panelRoot, columnBaseIndex: 0 };
  }
  if (draft.stripScope === "range-end" && all.length >= need * 2) {
    return { searchRoot: panelRoot, columnBaseIndex: need };
  }
  if (draft.stripScope === "range-start" && all.length >= need * 2) {
    return { searchRoot: panelRoot, columnBaseIndex: 0 };
  }
  if (scoped instanceof HTMLElement) {
    return { searchRoot: scoped, columnBaseIndex: 0 };
  }
  return { searchRoot: panelRoot, columnBaseIndex: 0 };
}

/**
 * 在 strip 子树内解析「时/分/秒」对应的滚动列元素：优先带 {@link PICKER_TIME_KIND_ATTR}；否则按列顺序 + {@link columnBaseIndex} 回退。
 *
 * @param searchRoot - 单条时间轨根或整块面板（回退）
 * @param kind - 列语义
 * @param draft - 与渲染列顺序一致
 * @param columnBaseIndex - range 全面板回退时「结束」轨的起始列下标
 */
function resolvePickerTimeScrollColumnEl(
  searchRoot: HTMLElement,
  kind: "hour" | "minute" | "second",
  draft: PickerTimeColumnDraft,
  columnBaseIndex: number,
): HTMLElement | null {
  const byKind = searchRoot.querySelector(
    `[${PICKER_TIME_SCROLL_COL_ATTR}][${PICKER_TIME_KIND_ATTR}="${kind}"]`,
  );
  if (byKind instanceof HTMLElement) return byKind;
  const cols = queryPickerTimeScrollColumnsWithin(searchRoot);
  const li = columnBaseIndex + pickerTimeColumnListIndex(draft, kind);
  if (li >= 0 && li < cols.length) return cols[li]!;
  return null;
}

/**
 * 在列内解析目标格按钮：优先 {@link PICKER_TIME_CELL_VALUE_ATTR}；若未进 DOM，则按列表 0..n 顺序回退（与 HOURS/MINUTES/SECONDS 渲染顺序一致）。
 *
 * @param col - 单列滚动容器
 * @param value - 时 0–23 / 分秒 0–59
 */
function resolvePickerTimeScrollCellButton(
  col: HTMLElement,
  value: number,
): HTMLElement | null {
  const byVal = col.querySelector(
    `[${PICKER_TIME_CELL_VALUE_ATTR}="${value}"]`,
  );
  if (byVal instanceof HTMLElement) return byVal;
  const buttons = col.querySelectorAll("button");
  const btn = buttons.item(value);
  return btn instanceof HTMLElement ? btn : null;
}

/**
 * 根据**当前选中行**的视口高度与在列内的相对位置，计算并写入 `scrollTop`，使该行大致落在列视区垂直中部。
 *
 * 内容坐标：`itemTop ≈ col.scrollTop + (activeRect.top - colRect.top)`（把「相对列视口顶」还原成滚动内容里的位置）。
 *
 * @param col - `overflow-y-auto` 的列容器
 * @param active - 当前应对齐的按钮（用于量 `height` 与位置）
 */
function scrollPickerTimeColumnToCenterActive(
  col: HTMLElement,
  active: HTMLElement,
): void {
  const colRect = col.getBoundingClientRect();
  const actRect = active.getBoundingClientRect();
  /** 选中行在视口中的高度（与 padding 后的按钮盒一致） */
  const rowH = actRect.height;
  /** 选中行顶部在滚动内容中的近似 Y（相对列内容顶） */
  const itemTopInContent = Math.round(
    col.scrollTop + (actRect.top - colRect.top),
  );
  const maxScroll = Math.max(0, col.scrollHeight - col.clientHeight);
  /** 使行几何中心落在列视区中心时的 scrollTop */
  const desiredUnclamped = Math.round(
    itemTopInContent + rowH / 2 - col.clientHeight / 2,
  );
  const next = Math.max(0, Math.min(desiredUnclamped, maxScroll));
  col.scrollTop = next;
}

/**
 * 在浮层根下查找所有时间滚动列，将列内选中项滚到视区中部。
 *
 * @returns 已找到至少一列且**每一列都有选中节点**并完成滚动时为 `true`；尚无列或任缺一列选中项时为 `false`（子树未挂完，应下一帧再试）。
 */
export function scrollPickerTimeActiveItemsIntoView(
  panelRoot: HTMLElement | null | undefined,
): boolean {
  if (panelRoot == null || !panelRoot.isConnected) return true;
  const cols = queryPickerTimeScrollColumnsWithin(panelRoot);
  if (cols.length === 0) return false;
  let complete = true;
  for (let i = 0; i < cols.length; i++) {
    const col = cols[i];
    if (!(col instanceof HTMLElement)) continue;
    const active = col.querySelector(`[${PICKER_TIME_ACTIVE_ATTR}]`);
    if (!(active instanceof HTMLElement)) {
      complete = false;
      continue;
    }
    try {
      scrollPickerTimeColumnToCenterActive(col, active);
    } catch {
      try {
        active.scrollIntoView({ block: "center", inline: "nearest" });
      } catch {
        /* 忽略 */
      }
    }
  }
  return complete;
}

/**
 * 在指定 strip 子树内，按 kind + 单元格数值找到按钮并将列 `scrollTop` 调到大致居中。
 *
 * @param searchRoot - 一般为带 {@link PICKER_TIME_STRIP_SCOPE_ATTR} 的轨根
 * @param kind - 时 / 分 / 秒
 * @param value - 与按钮上 {@link PICKER_TIME_CELL_VALUE_ATTR} 一致的整数，或列内第 `value` 个 `button`（回退）
 * @param draft - 与当前轨列顺序一致，用于无 `data-picker-time-kind` 时的列下标回退
 * @returns 列与目标按钮均找到并完成（或已 fallback）时为 true
 */
function scrollPickerTimeOneColumnByCellValue(
  searchRoot: HTMLElement,
  columnBaseIndex: number,
  kind: "hour" | "minute" | "second",
  value: number,
  draft: PickerTimeColumnDraft,
): boolean {
  const col = resolvePickerTimeScrollColumnEl(
    searchRoot,
    kind,
    draft,
    columnBaseIndex,
  );
  if (col == null) return false;
  const btn = resolvePickerTimeScrollCellButton(col, value);
  if (btn == null) return false;
  try {
    scrollPickerTimeColumnToCenterActive(col, btn);
  } catch {
    try {
      btn.scrollIntoView({ block: "center", inline: "nearest" });
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * 根据草稿数值滚动**一条**时间轨内的可见列（不依赖选中项 data-attribute 是否已挂上）。
 *
 * @param panelRoot - 浮层根（`role="dialog"` 容器）
 * @param draft - 粒度开关 + 当前时/分/秒 + 可选轨 scope
 * @returns 凡应滚动的列均已找到目标单元格并完成滚动时为 true
 */
export function scrollPickerTimeColumnsByDraftValues(
  panelRoot: HTMLElement | null | undefined,
  draft: PickerTimeColumnDraft,
): boolean {
  if (panelRoot == null || !panelRoot.isConnected) return false;
  const { searchRoot, columnBaseIndex } = resolvePickerTimeSearchRoot(
    panelRoot,
    draft,
  );
  let complete = true;
  if (draft.showHour) {
    complete = scrollPickerTimeOneColumnByCellValue(
      searchRoot,
      columnBaseIndex,
      "hour",
      draft.hour,
      draft,
    ) && complete;
  }
  if (draft.showMinute) {
    complete = scrollPickerTimeOneColumnByCellValue(
      searchRoot,
      columnBaseIndex,
      "minute",
      draft.minute,
      draft,
    ) && complete;
  }
  if (draft.showSecond) {
    complete = scrollPickerTimeOneColumnByCellValue(
      searchRoot,
      columnBaseIndex,
      "second",
      draft.second,
      draft,
    ) && complete;
  }
  return complete;
}

export type PickerTimePanelRootGetter = () => HTMLElement | null;

/**
 * 在子树与布局就绪后再滚时间列：父级 `ref` 往往早于 **函数子响应式插入** 子节点提交，首帧 `querySelector` 常为空；
 * 故用微任务 + 多帧 `requestAnimationFrame` 重试，直到各列均有选中项或达到上限。
 *
 * @param panelRoot - 浮层根；或传入 getter（如 `() => outsidePanelEl.current`）以便每帧取最新节点
 */
export function schedulePickerTimeActiveItemsScroll(
  panelRoot: HTMLElement | null | PickerTimePanelRootGetter,
): void {
  const resolve: PickerTimePanelRootGetter = typeof panelRoot === "function"
    ? panelRoot
    : () => panelRoot;

  const maxAttempts = 28;
  let attempt = 0;

  /**
   * 单步：解析面板根并尝试滚动；未就绪则下一帧继续。
   */
  const step = (): void => {
    const el = resolve();
    if (el == null || !el.isConnected) {
      if (++attempt < maxAttempts) {
        globalThis.requestAnimationFrame(step);
      }
      return;
    }
    const ok = scrollPickerTimeActiveItemsIntoView(el);
    attempt++;
    if (!ok && attempt < maxAttempts) {
      globalThis.requestAnimationFrame(step);
    }
  };

  globalThis.queueMicrotask(() => {
    globalThis.requestAnimationFrame(step);
  });
}

export type PickerTimeDraftColumnsGetter = () => PickerTimeColumnDraft[];

/**
 * 按 {@link PickerTimeColumnDraft} 列表滚动（range 双轨等多条 scope 一次调度）；优先于仅依赖 `data-picker-time-active` 的旧逻辑。
 *
 * @param panelRoot - 浮层根或 getter（每帧取最新 DOM）
 * @param getDrafts - 每次尝试时读取当前草稿（须与 DOM 上 strip scope 一致）
 */
export function schedulePickerTimeDraftColumnsScroll(
  panelRoot: HTMLElement | null | PickerTimePanelRootGetter,
  getDrafts: PickerTimeDraftColumnsGetter,
): void {
  const resolve: PickerTimePanelRootGetter = typeof panelRoot === "function"
    ? panelRoot
    : () => panelRoot;

  const maxAttempts = 28;
  let attempt = 0;

  /**
   * 单步：解析面板根并对每条 draft 滚动；任一条未就绪则下一帧重试。
   */
  const step = (): void => {
    const el = resolve();
    if (el == null || !el.isConnected) {
      if (++attempt < maxAttempts) {
        globalThis.requestAnimationFrame(step);
      }
      return;
    }
    const drafts = getDrafts();
    let ok = true;
    for (let i = 0; i < drafts.length; i++) {
      ok = scrollPickerTimeColumnsByDraftValues(el, drafts[i]!) && ok;
    }
    attempt++;
    if (!ok && attempt < maxAttempts) {
      globalThis.requestAnimationFrame(step);
    }
  };

  globalThis.queueMicrotask(() => {
    globalThis.requestAnimationFrame(step);
  });
}

/**
 * 表单域 `createPortal` 的挂载目标：`document.body`。
 * 与 feedback 包内 `getBrowserBodyPortalHost` 行为一致，但放在本文件供 picker / RichTextEditor 等共用，避免 form → feedback 依赖。
 *
 * @returns 可用的 `body` 元素；非浏览器、无 DOM、`body` 非元素节点或访问异常时为 `null`
 */
export function getFormPortalBodyHost(): HTMLElement | null {
  try {
    if (typeof globalThis.document === "undefined") return null;
    const doc = globalThis.document;
    const b = doc.body;
    if (b != null && b.nodeType === 1) return b as HTMLElement;
    /** 解析完成前 `body` 可能仍为 null；挂到 `documentElement` 仍可脱离表单 overflow 子树 */
    const de = doc.documentElement;
    if (de != null && de.nodeType === 1) return de as HTMLElement;
    return null;
  } catch {
    return null;
  }
}

/** `scroll` / `resize`：`passive` 减少主线程滚动阻塞 */
const pickerPassiveListenerOpts: AddEventListenerOptions = { passive: true };

/**
 * 将 {@link computePickerPortalStyle} 的结果同步写到浮层根节点，避免仅靠 signal 在滚动帧晚一拍到 DOM。
 *
 * @param panel - 浮层根节点
 * @param styles - 位置样式对象
 */
export function applyPickerPortalGeometryToElement(
  panel: HTMLElement | null | undefined,
  styles: Record<string, string>,
): void {
  if (panel == null) return;
  const top = styles.top;
  const left = styles.left;
  const z = styles.zIndex;
  if (top !== undefined) panel.style.top = top;
  if (left !== undefined) panel.style.left = left;
  if (z !== undefined) panel.style.zIndex = z;
}

/**
 * 在触发器祖先链、`documentElement`、`visualViewport` 等上订阅 `scroll`，并订阅 `window.resize` 与
 * `visualViewport.resize`：`onSync` 在事件回调内**同步**执行，与滚动/视口变化同一步骤尽早读 `getBoundingClientRect`
 * 写回 `fixed` 浮层，避免常驻 `requestAnimationFrame` 每帧抢主线程、与合成滚动错位产生「跟手延迟」。
 *
 * @param anchor - 触发器；`null` 时退化只挂 `globalThis` 的 `scroll` + `resize`
 * @param onSync - 位置同步回调（须幂等、轻量：读 `getBoundingClientRect` 写浮层 `style`）
 * @returns 取消全部监听
 */
export function subscribePickerAnchorScrollAndResize(
  anchor: HTMLElement | null,
  onSync: () => void,
): () => void {
  const seenScroll = new Set<EventTarget>();
  const cleanups: (() => void)[] = [];

  /**
   * @param t - 监听目标
   */
  const addScrollTarget = (t: EventTarget | null | undefined) => {
    if (t == null || seenScroll.has(t)) return;
    seenScroll.add(t);
    const fn = () => onSync();
    t.addEventListener("scroll", fn, pickerPassiveListenerOpts);
    cleanups.push(() =>
      t.removeEventListener("scroll", fn, pickerPassiveListenerOpts)
    );
  };

  if (anchor != null) {
    /** 自触发器向上**每一层**挂 `scroll`：`scroll` 不冒泡，必须在真正滚动的节点上监听；仅靠 `overflow`+高度判断易漏（flex、子像素、首帧高度）。非滚动节点几乎不派发事件，多几个 listener 可接受。 */
    let p: HTMLElement | null = anchor;
    while (p != null) {
      addScrollTarget(p);
      p = p.parentElement;
    }
    const doc = anchor.ownerDocument;
    const win = doc.defaultView;
    addScrollTarget(doc.documentElement);
    addScrollTarget(doc.body);
    addScrollTarget(win);
    const vv = win?.visualViewport;
    if (vv != null) {
      addScrollTarget(vv);
      /** 地址栏伸缩、缩放导致视口矩形变化；`scroll` 已由上一行覆盖 */
      const onVvResize = () => onSync();
      vv.addEventListener("resize", onVvResize, pickerPassiveListenerOpts);
      cleanups.push(() =>
        vv.removeEventListener("resize", onVvResize, pickerPassiveListenerOpts)
      );
    }
  } else {
    addScrollTarget(globalThis);
  }

  const onResize = () => onSync();
  globalThis.addEventListener("resize", onResize, pickerPassiveListenerOpts);
  cleanups.push(() =>
    globalThis.removeEventListener(
      "resize",
      onResize,
      pickerPassiveListenerOpts,
    )
  );

  /** 无 rAF 的运行时（部分 SSR）：补一次异步对齐 */
  if (typeof globalThis.requestAnimationFrame !== "function") {
    queueMicrotask(() => onSync());
  }

  return () => {
    for (const c of cleanups) c();
  };
}

/**
 * 时/分滚动列表等：保留 `overflow-y-auto` 与 `max-h-48`，但隐藏系统滚动条（Firefox / IE / WebKit）。
 */
export const pickerTimeListScrollClass =
  "max-h-48 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden " +
  PICKER_TIME_SCROLL_COL_FALLBACK_CLASS;

/**
 * 时 / 分 / 秒列外层：固定 3rem 宽，防止宽浮层下某一列被拉长或「占掉」未显示列的宽度。
 */
export const pickerTimeColumnWrapClass =
  "flex w-12 min-w-12 max-w-12 shrink-0 flex-col";

/**
 * 与 {@link pickerTimeListScrollClass} 拼用，滚动列表区域与列同宽。
 */
export const pickerTimeListInnerWidthClass = "w-12 min-w-12 max-w-12";

/**
 * 多列时间段：行内横向排列，各列固定宽度，不占满父级剩余宽度。
 */
export const pickerTimeStripRowMultiClass = "inline-flex shrink-0 gap-2";

/**
 * @deprecated 单列时间请用 {@link pickerTimeStripRowMultiClass} + {@link pickerTimeColumnWrapClass} + {@link pickerTimeColumnSpacerClass}，与 `HH:mm` 完全一致。
 */
export const pickerTimeSingleMergedStripClass =
  "flex w-[6.5rem] min-w-[6.5rem] max-w-[6.5rem] shrink-0 flex-col items-stretch";

/**
 * 与「时/分」列同宽的空占位：`HH` 仅一列数据时放在第二轨，保证横向与 `HH:mm` 两列（`w-12`×2+`gap-2`）一致；仅用 Tailwind 标准 `w-12`，避免任意宽度未进构建。
 */
export const pickerTimeColumnSpacerClass =
  "w-12 min-w-12 max-w-12 shrink-0 self-stretch";

/**
 * `HH` 单列外层：勿用 `w-full`。弹层为 `flex-col` 时默认 `items-stretch` 会把子项拉成整行宽，内层 6.5rem 只剩「中间一条」的错觉；用 `self-center` + `w-max` 让本层宽度等于子项（合并条），再在宽弹层里整体居中。
 */
export const pickerTimeStripSingleCenterWrapClass =
  "flex w-max max-w-full shrink-0 justify-center self-center";

/**
 * @deprecated 合并条方案已弃用；列表在 `w-12` 列内请用 {@link pickerTimeListInnerWidthClass}。
 */
export const pickerTimeListMergedInnerClass = "w-full min-w-0";

/**
 * @deprecated 请用 {@link pickerTimeStripRowMultiClass} + {@link pickerTimeColumnSpacerClass}。
 */
export const pickerTimeColumnsRowSingleClass =
  "flex w-full min-w-0 justify-center gap-2";

/**
 * @deprecated 请用 {@link pickerTimeSingleMergedStripClass}。
 */
export const pickerTimeColumnWrapSingleClass =
  "flex w-[6.5rem] min-w-[6.5rem] max-w-[6.5rem] shrink-0 flex-col";

/**
 * @deprecated 时/分/秒列内列表请统一用 {@link pickerTimeListInnerWidthClass}。
 */
export const pickerTimeListSingleColWidthClass = "w-full min-w-0";

/**
 * 时间滚轮列表内 `button`：在主键 `pointerdown` 时执行与 `onClick` 相同的 `pick`，
 * 避免可滚动列或文档捕获监听导致 `click` 未派发时草稿与蓝色高亮仍停在 00。
 * 键盘 Space/Enter 仍触发 `click`，故须**同时**保留 `onClick={pick}`。
 *
 * @param ev - 来自 `onPointerDown` 的事件
 * @param pick - 与对应 `onClick` 完全一致的写入逻辑
 */
export function runTimeStripPrimaryPointerPick(
  ev: Event,
  pick: () => void,
): void {
  const pe = ev as PointerEvent;
  if (pe.button !== 0) return;
  pick();
}

/**
 * 在浮层已挂载的前提下，解析「应视为内部」的触发按钮。
 * View 在 signal flush 重绘时，触发器 `ref` 可能短暂为 `null`；若仅依赖 `triggerRef.current`，
 * `pointerdown` 落在按钮上会被误判为外部并立刻 `close()`，表现为 `openState` 先 true 再 false、浮层闪没。
 *
 * @param panel - 一般为 `role="dialog"` 的浮层根（与触发器同属 `relative` 父容器）
 * @param triggerRef - 组件内可变 ref，可能暂时未挂上
 * @returns 用于 `contains(target)` 的按钮元素，或 null
 */
function resolvePickerTriggerForOutsideClick(
  panel: HTMLElement,
  triggerRef?: { current: HTMLElement | null },
): HTMLElement | null {
  const refEl = triggerRef?.current;
  if (refEl?.isConnected) return refEl;
  const host = panel.parentElement;
  if (!(host instanceof HTMLElement)) return refEl ?? null;
  /** DatePicker / DateTimePicker / TimePicker / ColorPicker：触发器为父级下带 dialog 语义的 button */
  const scoped = host.querySelector(":scope > button[aria-haspopup='dialog']");
  if (scoped instanceof HTMLElement) return scoped;
  const nested = host.querySelector("button[aria-haspopup='dialog']");
  return nested instanceof HTMLElement ? nested : refEl ?? null;
}

/**
 * 刚挂上 document 监听后的极短毫秒数：此窗口内忽略 `close`，减轻同一手势尾段或 flush 后误派的 pointer 事件误关浮层。
 * 与各 Picker 内「打开后拒绝非 forced 关闭」互补；数值过大拖慢用户「打开即点外关」的体验。
 */
const POINTER_OUTSIDE_ARM_MS = 80;

/**
 * 判断 `pointerdown` 等事件的**路径**是否落在 `root` 上或其子树内。
 * 优先用 {@link PointerEvent.composedPath}，再回退 {@link PointerEvent.target}；
 * 避免「路径非空但无一命中」时直接判假（部分环境下路径与 `contains` 组合会漏掉浮层内节点）。
 *
 * @param ev - 一般为捕获阶段 `pointerdown`
 * @param root - 浮层根、宿主包裹层或触发器按钮等
 */
function pointerEventPathTouchesRoot(ev: Event, root: Node): boolean {
  const pe = ev as PointerEvent;
  const t = pe.target;
  if (typeof pe.composedPath === "function") {
    const path = pe.composedPath();
    if (path != null && path.length > 0) {
      for (let i = 0; i < path.length; i++) {
        const x = path[i];
        if (x === root) return true;
        if (x instanceof Node && root.contains(x)) return true;
      }
    }
  }
  return t instanceof Node && root.contains(t);
}

/**
 * 用视口坐标判断指针是否落在元素轴对齐包围盒内；不依赖 `composedPath`/`contains`，
 * 作取色器等「路径判断失败仍应视为浮层内」的兜底。
 *
 * @param el - 一般为 `role="dialog"` 根节点
 * @param clientX - `PointerEvent.clientX`
 * @param clientY - `PointerEvent.clientY`
 */
function clientPointInsideElementAabb(
  el: Element,
  clientX: number,
  clientY: number,
): boolean {
  if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return false;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return false;
  return (
    clientX >= r.left &&
    clientX <= r.right &&
    clientY >= r.top &&
    clientY <= r.bottom
  );
}

/**
 * 用 `elementsFromPoint` / `elementFromPoint` 判断视口坐标下命中栈是否在 `root` 子树内。
 * 作为 {@link pointerEventPathTouchesRoot} 与 {@link clientPointInsideElementAabb} 的补充：
 * capture 阶段个别环境下 `composedPath`/`target` 不完整，或首帧布局尚未完成导致父级包围盒为 0×0 时，
 * 仍会把 ColorPicker 等面板内的点选误判为「外部」而关闭浮层。
 *
 * @param root - 浮层根（一般为 `role="dialog"`）
 * @param clientX - `PointerEvent.clientX`
 * @param clientY - `PointerEvent.clientY`
 */
function clientPointHitsElementSubtree(
  root: HTMLElement,
  clientX: number,
  clientY: number,
): boolean {
  if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return false;
  const doc = root.ownerDocument;
  if (doc == null) return false;
  const stackFn = (doc as Document & {
    elementsFromPoint?: (x: number, y: number) => Element[];
  }).elementsFromPoint;
  if (typeof stackFn === "function") {
    const stack = stackFn.call(doc, clientX, clientY);
    if (stack != null) {
      for (let i = 0; i < stack.length; i++) {
        const hit = stack[i];
        if (hit instanceof Element && root.contains(hit)) return true;
      }
    }
  }
  const top = doc.elementFromPoint(clientX, clientY);
  return top != null && root.contains(top);
}

/**
 * 当 `PointerEvent.target` 已从文档移除时，`Node.contains(target)` 与路径判断对该 target 恒不可用。
 * 仅用视口坐标判断指针是否仍落在面板、宿主包裹层或触发器上（与 {@link registerPointerDownOutside} 的 host/trigger 规则一致）。
 * 用于修复：document 冒泡阶段本监听器晚于 View 委托执行时，取色面板内 `pointerdown` 已把命中节点同步换掉，导致误关浮层。
 *
 * @param panel - 浮层根节点
 * @param triggerRef - 可选触发器 ref
 * @param clientX - `PointerEvent.clientX`
 * @param clientY - `PointerEvent.clientY`
 */
function pointerCoordsInsidePickerChrome(
  panel: HTMLElement,
  triggerRef: { current: HTMLElement | null } | undefined,
  clientX: number,
  clientY: number,
): boolean {
  if (clientPointInsideElementAabb(panel, clientX, clientY)) return true;
  if (clientPointHitsElementSubtree(panel, clientX, clientY)) return true;
  const host = panel.parentElement;
  if (host instanceof HTMLElement) {
    if (clientPointInsideElementAabb(host, clientX, clientY)) return true;
    if (clientPointHitsElementSubtree(host, clientX, clientY)) return true;
  }
  const trig = resolvePickerTriggerForOutsideClick(panel, triggerRef);
  if (trig instanceof HTMLElement) {
    if (clientPointInsideElementAabb(trig, clientX, clientY)) return true;
    if (clientPointHitsElementSubtree(trig, clientX, clientY)) return true;
  }
  return false;
}

/**
 * 在 document **冒泡**阶段监听 `pointerdown`：若落点不在 `panel` 内则调用 `close`。
 * 历史上曾用**捕获**阶段，在部分环境下早于目标节点完成命中，`composedPath`/`target` 与 `elementFromPoint`
 * 与取色面板内点击不同步，导致 ColorPicker 内点选仍走 `close`；冒泡阶段在目标处理之后再判断，与 View 的
 * document 委托（默认冒泡）一致，更稳。
 * 用于替代「全屏 pointer-events-auto 遮罩」，避免挡住背后页面的滚轮滚动。
 * 注册后 {@link POINTER_OUTSIDE_ARM_MS} 毫秒内忽略回调，减轻误关。
 *
 * @param panel 弹层面板根节点（一般为 `role="dialog"` 容器）
 * @param close 关闭浮层（须幂等）
 * @returns 取消监听的函数；须在关闭浮层或 panel 卸载时调用
 */

export function registerPointerDownOutside(
  panel: HTMLElement,
  close: () => void,
  /** 点击触发器不关闭（避免开关同一帧抢焦点） */
  triggerRef?: { current: HTMLElement | null },
): () => void {
  if (typeof globalThis === "undefined") return () => {};
  /** 与浮层同一文档，避免 iframe / 多文档下误绑顶层 window.document */
  const doc = panel.ownerDocument ??
    (globalThis as { document?: Document }).document;
  if (doc == null) return () => {};

  /** 本监听器生效时刻；仅用于首段防抖，不替代业务层 forced 关闭 */
  const armUntil = typeof globalThis.performance !== "undefined" &&
      typeof globalThis.performance.now === "function"
    ? globalThis.performance.now() + POINTER_OUTSIDE_ARM_MS
    : 0;

  const onDown = (ev: Event) => {
    if (
      armUntil !== 0 &&
      typeof globalThis.performance !== "undefined" &&
      typeof globalThis.performance.now === "function" &&
      globalThis.performance.now() < armUntil
    ) {
      return;
    }
    /**
     * flush 重绘瞬间浮层可能短暂脱离文档；此时不应 close，否则 openState 会 true→false、面板闪没。
     */
    if (!panel.isConnected) return;
    const pe = ev as PointerEvent;
    const rawTarget = pe.target;
    /**
     * View 的 document 委托先于本监听器处理 `pointerdown`；ColorPicker 等会在同步 flush 中替换 SV 等命中节点，
     * 使 `event.target` 脱离文档。此时 `contains`/`composedPath` 对该 target 为假，必须仅用坐标对照 panel/host/trigger。
     */
    if (rawTarget instanceof Node && !rawTarget.isConnected) {
      if (
        pointerCoordsInsidePickerChrome(
          panel,
          triggerRef,
          pe.clientX,
          pe.clientY,
        )
      ) {
        return;
      }
      close();
      return;
    }
    if (pointerEventPathTouchesRoot(ev, panel)) return;
    /** 坐标兜底：路径/target 在个别浏览器或 flush 瞬间不可靠时，仍把「落在面板矩形内」视为内部 */
    if (clientPointInsideElementAabb(panel, pe.clientX, pe.clientY)) {
      return;
    }
    /** 命中栈兜底：AABB 首帧为 0 或路径缺失时，仍以实际堆叠命中判断是否点在面板子树内 */
    if (clientPointHitsElementSubtree(panel, pe.clientX, pe.clientY)) {
      return;
    }
    /**
     * 触发器与浮层通常同属 `panel.parentElement`（如 DatePicker 的 `data-ui-datepicker-root` 包裹层）。
     * 比单独 `triggerRef` / querySelector 更稳：重排时 ref 可能 `isConnected: false`，但事件 target 仍在同一 host 子树内。
     */
    const host = panel.parentElement;
    if (host instanceof HTMLElement && pointerEventPathTouchesRoot(ev, host)) {
      return;
    }
    const trig = resolvePickerTriggerForOutsideClick(panel, triggerRef);
    if (trig != null && pointerEventPathTouchesRoot(ev, trig)) return;
    close();
  };

  /** `false`：冒泡阶段，避免捕获阶段命中信息未就绪时误关（尤其 ColorPicker SV 区域） */
  doc.addEventListener("pointerdown", onDown, false);
  return () => doc.removeEventListener("pointerdown", onDown, false);
}

/** 与 {@link registerPickerFixedOverlayPositionAndOutsideClick} 配合：存 dispose 的槽位形态 */
export type PickerOverlayDisposeSlot = { dispose: (() => void) | null };

/**
 * {@link registerPickerFixedOverlayPositionAndOutsideClick} 的布局模式：视口 `fixed` 与「相对宿主」二选一。
 */
export type PickerOverlayLayoutOptions = {
  /**
   * 默认 `true`：`position:fixed` + {@link computePickerPortalStyle} + {@link subscribePickerAnchorScrollAndResize}。
   * 为 `false` 时不写视口几何、不挂滚动同步；浮层应由宿主用含 `position:relative` 的祖先 + 自身 `absolute`
   * （如 `top-full left-0`）定位，随表单/滚动容器一起走，避免以浏览器窗口为参照的错位感。
   */
  fixedToViewport?: boolean;
};

/**
 * 弹层挂载后：注册「点外部关闭」+ 可选的 `fixed` 视口几何贴 {@link triggerRef} 与滚动/视口同步。
 * 须在 **`queueMicrotask`** 中调用，并与 {@link registerPointerDownOutside} 的延后注册配合，减轻打开瞬间误关浮层。
 *
 * @param panel - 浮层根（一般为 `role="dialog"`）
 * @param triggerRef - 触发器 ref；`hideTrigger` 场景可传空对象
 * @param close - 关闭回调（与 Esc、确定等一致）
 * @param outsideSlot - 存放 {@link registerPointerDownOutside} 的 dispose
 * @param anchorScrollSlot - 存放 {@link subscribePickerAnchorScrollAndResize} 的 dispose（锚定模式时为 `null`）
 * @param portalOpts - 传给 {@link computePickerPortalStyle}（如 `panelMinWidth`）；仅 `fixedToViewport` 时生效
 * @param layoutOpts - {@link PickerOverlayLayoutOptions}
 */
export function registerPickerFixedOverlayPositionAndOutsideClick(
  panel: HTMLElement,
  triggerRef: { current: HTMLElement | null },
  close: () => void,
  outsideSlot: PickerOverlayDisposeSlot,
  anchorScrollSlot: PickerOverlayDisposeSlot,
  portalOpts?: Parameters<typeof computePickerPortalStyle>[1],
  layoutOpts?: PickerOverlayLayoutOptions,
): void {
  outsideSlot.dispose?.();
  anchorScrollSlot.dispose?.();

  /** 待取消的 rAF id；dispose 时一并清掉，避免卸载后仍注册监听 */
  const pendingRaf = { id1: 0, id2: 0 };
  let removeOutsideListener: (() => void) | null = null;

  const raf = globalThis.requestAnimationFrame;
  const caf = globalThis.cancelAnimationFrame;

  const cancelPendingOutsideRegistration = (): void => {
    if (typeof caf === "function") {
      if (pendingRaf.id1 !== 0) {
        caf.call(globalThis, pendingRaf.id1);
        pendingRaf.id1 = 0;
      }
      if (pendingRaf.id2 !== 0) {
        caf.call(globalThis, pendingRaf.id2);
        pendingRaf.id2 = 0;
      }
    }
  };

  const disposeOutside = (): void => {
    cancelPendingOutsideRegistration();
    removeOutsideListener?.();
    removeOutsideListener = null;
  };

  const fixedToViewport = layoutOpts?.fixedToViewport !== false;

  if (fixedToViewport) {
    /**
     * 几何与滚动同步立即挂上；点外 `pointerdown` 延后双 rAF 再注册，
     * 让 View 把浮层/触发器插回文档后再监听，减少 flush 内误关。
     */
    const sync = (): void => {
      applyPickerPortalGeometryToElement(
        panel,
        computePickerPortalStyle(triggerRef.current, portalOpts),
      );
    };
    sync();
    anchorScrollSlot.dispose = subscribePickerAnchorScrollAndResize(
      triggerRef.current,
      sync,
    );
  } else {
    /** 避免上次 fixed 会话残留的 inline 覆盖 CSS 锚定 */
    panel.style.removeProperty("top");
    panel.style.removeProperty("left");
    panel.style.removeProperty("z-index");
    anchorScrollSlot.dispose = null;
  }

  outsideSlot.dispose = disposeOutside;

  if (typeof raf === "function") {
    pendingRaf.id1 = raf.call(globalThis, () => {
      pendingRaf.id1 = 0;
      pendingRaf.id2 = raf.call(globalThis, () => {
        pendingRaf.id2 = 0;
        if (!panel.isConnected) return;
        removeOutsideListener = registerPointerDownOutside(
          panel,
          close,
          triggerRef,
        );
      });
    });
  } else {
    removeOutsideListener = registerPointerDownOutside(
      panel,
      close,
      triggerRef,
    );
  }
}
