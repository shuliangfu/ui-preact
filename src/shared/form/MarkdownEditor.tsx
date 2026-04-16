/**
 * MarkdownEditor：源码编辑 + 可选实时预览，解析由 `@dreamer/markdown` 的 {@link parse} 完成。
 * 预览在写入 HTML 后对 `pre code.language-*` 用 Prism 着色，并为围栏块加独立底色与右上角复制（与 {@link CodeBlock} 行为接近）。
 * 顶栏与 {@link RichTextEditor} 对齐：分组、SVG 图标、{@link Tooltip}、全屏（根节点 `md-editor-fullscreen`）。
 * `split` 宽屏仅全屏钮；窄屏与 `tabs` 含源码/预览切换。预览区写入 `innerHTML`，勿用于不可信内容。
 */

import type { ComponentChildren, JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import {
  computed,
  effect,
  Signal as SignalCtor,
  signal,
} from "@preact/signals";
import type { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";
import { parse } from "@dreamer/markdown";
import type { ParseOptions } from "@dreamer/markdown/types";
import { Tooltip } from "../feedback/Tooltip.tsx";
import {
  controlBlueFocusRing,
  controlErrorBorder,
  controlErrorFocusRing,
} from "./input-focus-ring.ts";
import {
  ensureMarkdownPreviewPrismStyles,
  highlightMarkdownPreviewCodeBlocks,
  isMarkdownPreviewDomHost,
  wrapMarkdownPreviewCodeBlocks,
} from "./markdown-preview-prism.ts";
import {
  commitMaybeSignal,
  type MaybeSignal,
  readMaybeSignal,
} from "./maybe-signal.ts";

/** 预览展示方式 */
export type MarkdownEditorPreviewMode = "off" | "split" | "tabs";

export interface MarkdownEditorProps {
  /** Markdown 源码；见 {@link MaybeSignal} */
  value?: MaybeSignal<string>;
  /** 占位文案 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读（仍可看预览） */
  readOnly?: boolean;
  /** 错误态（红框） */
  error?: boolean;
  /** 隐藏聚焦 ring */
  hideFocusRing?: boolean;
  /** 外层容器 class */
  class?: string;
  /** 编辑区最小高度（如 `min-h-[240px]`） */
  editorMinHeightClass?: string;
  /** 预览区最小高度，默认与编辑区一致 */
  previewMinHeightClass?: string;
  /** 关闭预览；`split` 宽屏左右分栏、窄屏顶栏切换单栏；`tabs` 始终顶栏切换单栏 */
  preview?: MarkdownEditorPreviewMode;
  /** 透传给 `parse` 的选项；未传字段使用组件内默认 */
  parseOptions?: ParseOptions;
  /** 原生 input 事件 */
  onInput?: (e: Event) => void;
  /** 原生 change 事件 */
  onChange?: (e: Event) => void;
  onBlur?: (e: Event) => void;
  onFocus?: (e: Event) => void;
  onKeyDown?: (e: Event) => void;
  /**
   * 输入后回调当前 Markdown 字符串（在 `onInput` 之后调用，便于受控封装）。
   *
   * @param markdown - 文本框当前全文
   */
  onMarkdownChange?: (markdown: string) => void;
  /** 原生 name */
  name?: string;
  /** 原生 id */
  id?: string;
  /** 可见标签缺失时的无障碍名称 */
  ariaLabel?: string;
  /** 是否必填 */
  required?: boolean;
  /** 最大字符数（原生 `maxlength` + 底部字数提示，仅编辑区子树读 `value()`） */
  maxLength?: number;
  /** 文本行数提示（原生 `rows`） */
  rows?: number;
  /** 为 `true` 时显示全屏按钮（根节点 toggles `md-editor-fullscreen`）；默认 `false` 不显示 */
  allowFullscreen?: boolean;
}

/** `parse` 默认与常见编辑器一致：GFM + 单换行转 `<br>` */
const DEFAULT_PARSE: ParseOptions = {
  gfm: true,
  breaks: true,
};

/**
 * 以下三类名与 {@link RichTextEditor} 中 `toolbarWrapCls` / `toolbarGroupCls` / `toolbarBtnBase` 保持一致，便于文档站 Tailwind 扫描与视觉统一。
 */
const toolbarWrapCls =
  "flex flex-wrap items-center gap-1 border-b border-slate-200 p-2 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50";
const toolbarGroupCls =
  "flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-600 pr-1 last:border-r-0 last:pr-0";
const toolbarBtnBase =
  "inline-flex items-center justify-center p-1.5 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed min-w-[28px] min-h-[28px] text-sm font-medium";

/** 工具栏内 SVG 尺寸（同 {@link RichTextEditor} `rteToolbarSvgCls`） */
const mdToolbarSvgCls = "size-4 shrink-0";

/** 无 `id` 时根节点 `id` 的后备序号（避免多实例冲突） */
let mdEditorRootSeq = 0;

/**
 * 源码/预览顶栏切换态：dweb 等场景下父级 getter 重跑会再次执行 `MarkdownEditor()`，若每次 `createSignal('edit')` 会换新实例，
 * 点击改的是旧 signal、新 DOM 仍订阅新 signal → tabs 切换「无反应」。与 Upload 的 storageKey 思路一致，按 `id` 或受控 `value` 的 Signal 复用。
 */
const mdEditorActiveTabById = new Map<string, Signal<"edit" | "preview">>();
const mdEditorActiveTabByValueSignal = new WeakMap<
  object,
  Signal<"edit" | "preview">
>();

/**
 * 获取或创建与当前编辑器实例对齐的 `activeTab` signal。
 *
 * @param props - 仅需 `id` 与 `value`（须在解构前传入完整 props）
 */
function takeMarkdownEditorActiveTab(
  props: Pick<MarkdownEditorProps, "id" | "value">,
): Signal<"edit" | "preview"> {
  const trimmedId = props.id?.trim();
  if (trimmedId) {
    const k = `id:${trimmedId}`;
    const hit = mdEditorActiveTabById.get(k);
    if (hit) return hit;
    const s = signal<"edit" | "preview">("edit");
    mdEditorActiveTabById.set(k, s);
    return s;
  }
  const v = props.value;
  if (v !== undefined && v instanceof SignalCtor) {
    const hit = mdEditorActiveTabByValueSignal.get(v as object);
    if (hit) return hit;
    const s = signal<"edit" | "preview">("edit");
    mdEditorActiveTabByValueSignal.set(v as object, s);
    return s;
  }
  return signal<"edit" | "preview">("edit");
}

/**
 * Markdown 工具栏悬停说明：Tooltip 默认 Portal + `fixed`；全屏时用 `overlayClass` 抬高 z-index；`placement="top"` 为产品约定。
 *
 * @param props.content - 提示文案
 * @param props.children - 触发器子节点
 * @param props.class - 合并到 Tooltip 触发器外层
 */
function MdToolbarItemTip(props: {
  content: string;
  children?: ComponentChildren;
  class?: string;
}) {
  const c = props.content.trim();
  if (!c) return <>{props.children}</>;
  return (
    <Tooltip
      content={c}
      placement="top"
      class={twMerge("inline-flex shrink-0 items-center", props.class)}
      overlayClass="z-10050"
      arrow
    >
      {props.children}
    </Tooltip>
  );
}

/**
 * 「源码」图标：与 RTE `renderToolbarButtonContent` 的 `sourceHtml` 分支同形（尖括号 + 斜杠）。
 */
function MdToolbarIconSource() {
  return (
    <svg
      class={mdToolbarSvgCls}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 9l-4 4 4 4M16 9l4 4-4 4"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M14.5 6l-5 12"
      />
    </svg>
  );
}

/**
 * 「预览」图标：眼睛轮廓 + 瞳孔，线框风格与 RTE 工具栏一致。
 */
function MdToolbarIconPreview() {
  return (
    <svg
      class={mdToolbarSvgCls}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      />
    </svg>
  );
}

/**
 * 全屏 / 退出全屏图标：与 RTE `fullscreen` 分支 SVG 一致。
 */
function MdToolbarIconFullscreen(props: { exit: boolean }) {
  const { exit } = props;
  if (exit) {
    return (
      <svg
        class={mdToolbarSvgCls}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 9l4 0l0 -4"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 3l6 6"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 15l4 0l0 4"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 21l6 -6"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-4 0l0 -4"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 9l6 -6"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 15l-4 0l0 4"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 15l6 6"
        />
      </svg>
    );
  }
  return (
    <svg
      class={mdToolbarSvgCls}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M16 4l4 0l0 4"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M14 10l6 -6"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 20l-4 0l0 -4"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 20l6 -6"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M16 20l4 0l0 -4"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M14 14l6 6"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 4l-4 0l0 4"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 4l6 6"
      />
    </svg>
  );
}

/**
 * Markdown 工具栏切换钮 class：激活时加底纹，便于与 RTE 分段选中态区分。
 *
 * @param active - 是否为当前视图
 * @param showFocusRing - 是否显示聚焦 ring
 */
function mdToolbarToggleClass(active: boolean, showFocusRing: boolean): string {
  return twMerge(
    toolbarBtnBase,
    controlBlueFocusRing(showFocusRing),
    active
      ? "bg-slate-200 text-slate-900 dark:bg-slate-600 dark:text-slate-100"
      : "",
  );
}

const textareaBase =
  "w-full min-h-[200px] border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-3 py-2 text-sm rounded-lg resize-y font-mono tab-size-2 leading-relaxed";

/**
 * 宽屏分栏时：在元素内纵向滚动，并隐藏滚动条（仍可滚轮 / 触摸板滚动）。
 */
const MD_SPLIT_SCROLL_HIDE =
  "md:overflow-y-auto md:[scrollbar-width:none] md:[-ms-overflow-style:none] md:[&::-webkit-scrollbar]:w-0 md:[&::-webkit-scrollbar]:h-0";

const readOnlyTextareaCls = "bg-slate-50 dark:bg-slate-800/80 cursor-default";

/**
 * 将 Markdown 转为 HTML；失败时返回带说明的段落；空串时显示占位提示。
 *
 * @param md - 源码
 * @param opts - 与默认合并后的解析选项
 */
function safeParseMarkdown(md: string, opts: ParseOptions): string {
  if (md.trim() === "") {
    return `<p class="text-sm text-slate-400 dark:text-slate-500">开始输入 Markdown，预览区将显示渲染结果。</p>`;
  }
  try {
    return parse(md, opts);
  } catch {
    return `<p class="text-red-600 dark:text-red-400 text-sm">Markdown 解析失败，请检查语法。</p>`;
  }
}

/**
 * 预览容器内链接、标题、列表、代码块等的基础样式（未使用 `@tailwindcss/typography`）。
 * 围栏 `pre` 的盒模型与背景由 `markdown-preview-prism` 注入的 `.md-preview-code-shell` 负责，此处不写 `[&_pre]:bg-*`。
 */
const previewProseCls =
  "text-sm text-slate-800 dark:text-slate-200 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline [&_strong]:font-semibold [&_em]:italic [&_p]:my-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:my-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:my-2 [&_h3]:text-base [&_h3]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:dark:border-slate-600 [&_blockquote]:pl-3 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-slate-100 [&_code]:dark:bg-slate-900 [&_code]:px-1 [&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_td]:border [&_th]:border-slate-300 [&_td]:border-slate-300 [&_th]:dark:border-slate-600 [&_td]:dark:border-slate-600 [&_th]:px-2 [&_td]:px-2 [&_th]:py-1 [&_td]:py-1";

/** 叠在 textarea 左下角的字数徽标样式（文案由 `createRenderEffect` 写 `textContent`，避免牵动整树重绘失焦） */
const MD_CHAR_COUNT_BADGE_CLS =
  "pointer-events-none absolute bottom-2 left-2 z-10 rounded border border-slate-200/80 bg-white/90 px-1.5 py-0.5 text-left text-xs text-slate-600 shadow-sm backdrop-blur-sm dark:border-slate-600/80 dark:bg-slate-950/90 dark:text-slate-400";

export function MarkdownEditor(props: MarkdownEditorProps): JSX.Element {
  /** 须在解构前取 props，保证 `id` / `value`（Signal）与文档实例稳定对齐 */
  const activeTab = takeMarkdownEditorActiveTab(props);
  const {
    placeholder,
    disabled = false,
    readOnly = false,
    error = false,
    hideFocusRing = false,
    class: className,
    editorMinHeightClass = "min-h-[240px]",
    previewMinHeightClass,
    preview = "split",
    parseOptions: parseOptionsProp,
    onInput,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    onMarkdownChange,
    name,
    id,
    ariaLabel = "Markdown 源码",
    required = false,
    maxLength,
    rows = 12,
    allowFullscreen = false,
  } = props;

  /** 全屏时用于切换 `md-editor-fullscreen` 的根容器 */
  const rootRef = useRef<HTMLDivElement>(null);
  /** 与 RTE `rteFullscreen` 同理：同步全屏态以切换图标与 Tooltip */
  const mdFullscreen = signal(false);
  /** 稳定 DOM id，供全屏等逻辑挂载根节点（无 `id` prop 时生成唯一值） */
  const editorRootDomId = id != null
    ? `${id}-md-editor-root`
    : `md-editor-root-${++mdEditorRootSeq}`;

  const previewRef = useRef<HTMLDivElement>(null);
  /** 有 `maxLength` 时字数徽标 DOM，仅用 `textContent` 更新，勿在 `return` 里读 `markdownSource` 绑定子节点文案（会整段重算导致 textarea 失焦） */
  const charCountRef = useRef<HTMLSpanElement>(null);
  /**
   * 是否与 RichTextEditor 一致的 md 断点（≥768px）：`preview="split"` 时宽屏双栏、窄屏单栏切换；工具栏在宽屏仍显示全屏钮。
   */
  const isMdUp = signal(
    typeof globalThis !== "undefined" &&
      typeof globalThis.matchMedia === "function" &&
      globalThis.matchMedia("(min-width: 768px)").matches,
  );

  useEffect(() => {
    if (typeof globalThis.matchMedia !== "function") return undefined;
    const mq = globalThis.matchMedia("(min-width: 768px)");
    const sync = () => {
      isMdUp.value = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const mergedParseOptions = computed((): ParseOptions => ({
    ...DEFAULT_PARSE,
    ...parseOptionsProp,
  }));

  /**
   * 追踪受控 `value`（含 Preact Signal）变化以驱动预览 HTML。
   */
  const markdownSource = computed(() => readMaybeSignal(props.value) ?? "");

  const previewHtml = computed(() => {
    if (preview === "off") return "";
    return safeParseMarkdown(markdownSource.value, mergedParseOptions.value);
  });

  /**
   * 将解析后的 HTML 写入预览容器。
   * 组件首次执行时预览 div 尚未插入 DOM，`ref` 常在 effect 之后才赋值；若仅本轮读 `previewRef.current` 会一直是 null，
   * 且受控初值未触发 memo 二次更新时 effect 不再跑 → 分栏预览永久空白。故同步尝试一次后再 `queueMicrotask` 补写。
   *
   * @param html - {@link safeParseMarkdown} 结果
   */
  const applyMarkdownPreviewHtml = (html: string) => {
    const el = previewRef.current;
    /** 开发服 / SSR 下 ref 偶为非 Element，避免写 innerHTML 与 Prism 遍历抛错 */
    if (!isMarkdownPreviewDomHost(el)) return;
    el.innerHTML = html;
    // 围栏代码块：Prism 着色（需在 innerHTML 赋值之后执行）
    ensureMarkdownPreviewPrismStyles(el);
    highlightMarkdownPreviewCodeBlocks(el);
    wrapMarkdownPreviewCodeBlocks(el);
  };

  effect(() => {
    if (preview === "off") return;
    const html = previewHtml.value;
    applyMarkdownPreviewHtml(html);
    queueMicrotask(() => applyMarkdownPreviewHtml(html));
  });

  /**
   * 订阅 `markdownSource` 仅更新字数 `span`，不触发含 textarea 的视图函数重跑，避免输入时失焦。
   */
  effect(() => {
    if (maxLength == null) return;
    const len = markdownSource.value.length;
    const remaining = Math.max(0, maxLength - len);
    const badge = charCountRef.current;
    if (badge != null) {
      badge.textContent = `剩余 ${remaining} / ${maxLength}`;
    }
  });

  const previewRegionId = id != null ? `${id}-md-preview` : undefined;
  const minPrev = previewMinHeightClass ?? editorMinHeightClass;

  /**
   * 合并 `onInput` 与 `onMarkdownChange`，便于父组件只关心字符串。
   *
   * @param e - 原生 input 事件
   */
  const handleInput = (e: Event) => {
    onInput?.(e);
    const t = e.target;
    if (t instanceof HTMLTextAreaElement) {
      commitMaybeSignal(props.value, t.value);
      onMarkdownChange?.(t.value);
    }
  };

  /**
   * 受控 `value` 为 Signal 时由组件写回，再调用外部 `onChange`。
   *
   * @param e - 原生 change 事件
   */
  const handleChange = (e: Event) => {
    const t = e.target;
    if (t instanceof HTMLTextAreaElement) {
      commitMaybeSignal(props.value, t.value);
    }
    onChange?.(e);
  };

  /**
   * 切换根节点全屏类名（与 RTE `fullscreen` 命令一致思路）。
   */
  const toggleMdFullscreen = () => {
    const el = rootRef.current;
    if (el == null) return;
    el.classList.toggle("md-editor-fullscreen");
    mdFullscreen.value = el.classList.contains("md-editor-fullscreen");
  };

  const tab = activeTab.value;
  const wide = isMdUp.value;
  const fs = mdFullscreen.value;
  const showSplit = preview === "split";
  const showPreviewPane = preview !== "off";
  /**
   * 宽屏且开启 split 并实际渲染预览栏时，才使用双栏等高 + 内部滚动；
   * 避免 `preview="off"` 时仍套用分栏高度限制。
   */
  const showSplitDesktop = showSplit && wide && showPreviewPane;
  /** 源码/预览图标组：`tabs` 与 split 窄屏显示；split 宽屏双栏时隐藏 */
  const showModeToolbar = showPreviewPane &&
    (preview === "tabs" || (showSplit && !wide));
  /** 是否渲染整条工具栏（模式组或至少全屏） */
  const showToolbar = showModeToolbar || allowFullscreen;
  const singlePaneMode = showPreviewPane &&
    (preview === "tabs" || (showSplit && !wide));
  const ariaDescribedBy = showPreviewPane && previewRegionId != null
    ? previewRegionId
    : undefined;

  /** 字数提示的 `id`，与 textarea `aria-describedby` 组合（有 `maxLength` 且存在编辑器 `id` 时） */
  const charCountDescId = id != null && maxLength != null
    ? `${id}-md-char-count`
    : undefined;
  const textareaAriaDescribedBy =
    [ariaDescribedBy, charCountDescId].filter(Boolean).join(" ") ||
    undefined;

  /**
   * 分栏宽屏：textarea 填满左栏并在内部滚动；单栏保持 min-height + 纵向 resize。
   */
  const textareaClass = twMerge(
    textareaBase,
    showSplitDesktop
      ? twMerge(
        editorMinHeightClass,
        "md:min-h-0 md:h-full md:flex-1 md:basis-0 md:resize-none",
        MD_SPLIT_SCROLL_HIDE,
      )
      : editorMinHeightClass,
    controlBlueFocusRing(!hideFocusRing),
    error && controlErrorBorder,
    error && !hideFocusRing && controlErrorFocusRing(true),
    readOnly && readOnlyTextareaCls,
  );

  /**
   * 分栏宽屏：预览根节点参与 flex 等高，内容在内部滚动；单栏沿用 min-height + overflow-auto。
   */
  const previewShellClass = twMerge(
    "code-block-prism rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 p-3",
    showSplitDesktop
      ? twMerge("md:min-h-0 md:flex-1 md:basis-0", MD_SPLIT_SCROLL_HIDE)
      : twMerge("overflow-auto", minPrev),
    !showSplitDesktop && minPrev,
    previewProseCls,
  );

  const textareaNode = (
    <textarea
      id={id}
      name={name}
      rows={rows}
      value={readMaybeSignal(props.value) ?? ""}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      maxLength={maxLength}
      spellcheck={false}
      autocapitalize="off"
      autocomplete="off"
      aria-label={ariaLabel}
      aria-required={required}
      aria-invalid={error}
      aria-describedby={textareaAriaDescribedBy}
      class={twMerge(
        textareaClass,
        showToolbar && "rounded-t-none",
        maxLength != null && "pb-9",
      )}
      onInput={handleInput}
      onChange={handleChange}
      onBlur={onBlur}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
    />
  );

  /**
   * `relative` + 内叠字数：`textarea` 仍 `flex-1` 撑满，底部 `pb-9` 预留给字数条，避免正文与提示重叠。
   */
  const editorBody = maxLength != null
    ? (
      <div
        class={twMerge(
          "relative flex min-w-0 flex-col",
          showSplitDesktop ? "min-h-0 flex-1 overflow-hidden" : "flex-1",
        )}
      >
        {textareaNode}
        <span
          ref={charCountRef}
          id={charCountDescId}
          class={MD_CHAR_COUNT_BADGE_CLS}
          aria-live="polite"
        />
      </div>
    )
    : textareaNode;

  const editorPane = (
    <div
      class={showSplit
        ? twMerge(
          "min-w-0 flex flex-col",
          showSplitDesktop ? "min-h-0 flex-1 overflow-hidden" : "flex-1",
        )
        : "min-w-0 flex flex-col"}
      hidden={singlePaneMode && tab !== "edit" ? true : undefined}
    >
      {editorBody}
    </div>
  );

  const previewPane = showPreviewPane
    ? (
      <div
        class={showSplit
          ? twMerge(
            "min-w-0 flex flex-col",
            showSplitDesktop ? "min-h-0 flex-1 overflow-hidden" : "flex-1",
          )
          : "min-w-0 flex flex-col"}
        hidden={singlePaneMode && tab !== "preview" ? true : undefined}
      >
        <div
          id={previewRegionId}
          ref={previewRef}
          class={twMerge(
            previewShellClass,
            showToolbar && "rounded-t-none",
          )}
          role="region"
          aria-label="Markdown 预览"
        />
      </div>
    )
    : null;

  return (
    <div
      ref={rootRef}
      id={editorRootDomId}
      class={twMerge(
        "relative flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600",
        !hideFocusRing &&
          "has-[textarea:focus]:border-blue-500 dark:has-[textarea:focus]:border-blue-400",
        "[&.md-editor-fullscreen]:fixed [&.md-editor-fullscreen]:inset-0 [&.md-editor-fullscreen]:z-9999 [&.md-editor-fullscreen]:border-0 [&.md-editor-fullscreen]:bg-white [&.md-editor-fullscreen]:dark:bg-slate-900 [&.md-editor-fullscreen]:flex [&.md-editor-fullscreen]:flex-col",
        className,
      )}
    >
      {showToolbar && (
        <div
          class={twMerge(
            toolbarWrapCls,
            "flex w-full min-h-10 shrink-0 items-center gap-2",
          )}
          role="toolbar"
          aria-label="Markdown 编辑器工具栏"
          onMouseDown={(e: Event) => {
            const t = e.target;
            if (t instanceof Element && t.closest("select")) return;
            /**
             * 点在 `button` 上时不 `preventDefault`：与 RichTextEditor 一样用于避免 textarea 失焦，
             * 但部分环境下会阻断后续 `click`，表现为 tabs/全屏钮点击无响应。
             */
            if (t instanceof Element && t.closest("button")) return;
            e.preventDefault();
          }}
        >
          {
            /**
             * 与 RichTextEditor 同款排布：左侧占满剩余宽度（避免图标挤在角落），右侧固定全屏组。
             */
          }
          <div class="flex min-h-9 min-w-0 flex-1 flex-wrap items-center gap-1">
            {showModeToolbar && (
              <div class={toolbarGroupCls}>
                <MdToolbarItemTip content="Markdown 源码">
                  <button
                    type="button"
                    class={mdToolbarToggleClass(
                      tab === "edit",
                      !hideFocusRing,
                    )}
                    disabled={disabled}
                    aria-label="Markdown 源码"
                    aria-pressed={tab === "edit"}
                    onClick={() => {
                      activeTab.value = "edit";
                    }}
                  >
                    <MdToolbarIconSource />
                  </button>
                </MdToolbarItemTip>
                <MdToolbarItemTip content="渲染预览">
                  <button
                    type="button"
                    class={mdToolbarToggleClass(
                      tab === "preview",
                      !hideFocusRing,
                    )}
                    disabled={disabled}
                    aria-label="Markdown 预览"
                    aria-pressed={tab === "preview"}
                    onClick={() => {
                      activeTab.value = "preview";
                    }}
                  >
                    <MdToolbarIconPreview />
                  </button>
                </MdToolbarItemTip>
              </div>
            )}
          </div>
          {allowFullscreen && (
            <div
              class={twMerge(
                toolbarGroupCls,
                "shrink-0 border-r-0 pr-0",
              )}
            >
              <MdToolbarItemTip content={fs ? "退出全屏" : "全屏编辑"}>
                <button
                  type="button"
                  class={twMerge(
                    toolbarBtnBase,
                    controlBlueFocusRing(!hideFocusRing),
                  )}
                  disabled={disabled}
                  aria-label={fs ? "退出全屏" : "全屏编辑"}
                  onClick={toggleMdFullscreen}
                >
                  <MdToolbarIconFullscreen exit={fs} />
                </button>
              </MdToolbarItemTip>
            </div>
          )}
        </div>
      )}
      <div
        class={twMerge(
          "flex min-h-0 flex-1 flex-col gap-2",
          showSplitDesktop &&
            "md:flex-row md:items-stretch md:overflow-hidden",
          showSplitDesktop &&
            (fs ? "md:flex-1 md:min-h-0" : "md:max-h-[70vh]"),
          showSplitDesktop && editorMinHeightClass,
        )}
      >
        {editorPane}
        {showSplitDesktop && (
          <div
            class="w-px shrink-0 self-stretch bg-slate-200 dark:bg-slate-600"
            aria-hidden="true"
          />
        )}
        {previewPane}
      </div>
    </div>
  );
}
