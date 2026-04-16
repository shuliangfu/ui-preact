/**
 * CodeBlock 代码块（Preact）。
 * 展示代码并支持语法高亮（基于 Prism）、行号、复制、标题、最大高度滚动；归属 3.7 数据展示。
 */

import type { JSX } from "preact";
import Prism from "prismjs";
import "prismjs/components/prism-bash.js";
import "prismjs/components/prism-css.js";
import "prismjs/components/prism-javascript.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-jsx.js";
import "prismjs/components/prism-markdown.js";
import "prismjs/components/prism-tsx.js";
import "prismjs/components/prism-typescript.js";
// html 与 plaintext 通常已在 core 或通过 markup
import "prismjs/components/prism-markup.js";
import { twMerge } from "tailwind-merge";
/** 按需：单文件图标，避免经 icons/mod 拉入全表 */
import { IconCopy } from "../basic/icons/Copy.tsx";
import { toast } from "../feedback/toast-store.ts";
import { PRISM_TOKEN_CSS } from "../prism-token-styles.ts";

/**
 * 与 {@link PRISM_TOKEN_CSS} 相同；保留此导出名以免破坏依赖方。
 */
export const CODE_BLOCK_PRISM_STYLES = PRISM_TOKEN_CSS;

/**
 * 判断是否为可执行 insertBefore 的 DOM 元素节点。
 * 不使用裸 `instanceof HTMLElement`：Deno 等运行时可能没有 HTMLElement 全局，会抛 ReferenceError。
 */
function isElementNodeForInsert(node: unknown): node is HTMLElement {
  if (node == null || typeof node !== "object") return false;
  if (typeof HTMLElement !== "undefined") {
    return node instanceof HTMLElement;
  }
  const o = node as { nodeType?: unknown; insertBefore?: unknown };
  return o.nodeType === 1 && typeof o.insertBefore === "function";
}

/** 常用语言 id，与 Prism 的 language 一致 */
export type CodeBlockLanguage =
  | "javascript"
  | "typescript"
  | "json"
  | "html"
  | "css"
  | "bash"
  | "shell"
  | "markdown"
  | "plaintext"
  | string;

export interface CodeBlockProps {
  /** 代码内容 */
  code: string;
  /** 语言（用于语法高亮）；不传或 unknown 则按纯文本展示 */
  language?: CodeBlockLanguage;
  /** 是否显示行号，默认 false */
  showLineNumbers?: boolean;
  /** 行号起始值，默认 1 */
  lineNumberStart?: number;
  /** 最大高度（如 "20rem"、"400px"），超出可滚动；不传则不限制 */
  maxHeight?: string | number;
  /** 标题（如文件名），显示在代码块上方 */
  title?: string | null;
  /** 是否显示复制按钮，默认 true */
  copyable?: boolean;
  /** 是否显示左上角三色圆点（仿 macOS 窗口按钮），默认 true */
  showWindowDots?: boolean;
  /** 复制成功后回调 */
  onCopy?: () => void;
  /** 是否长行自动换行，默认 false（横向滚动） */
  wrapLongLines?: boolean;
  /** 额外 class（作用于最外层） */
  class?: string;
  /** pre 的 class */
  preClass?: string;
  /** code 的 class */
  codeClass?: string;
}

/**
 * 顶部标题栏：圆点装饰 + 居中标题，拆出子组件减轻主 JSX 嵌套，便于 `deno fmt` 稳定。
 */
function CodeBlockHeader(props: {
  title: string | null | undefined;
  showWindowDots: boolean;
}): JSX.Element | null {
  const { title, showWindowDots } = props;
  const hasTitle = title != null && title !== "";
  if (!hasTitle && !showWindowDots) {
    return null;
  }
  return (
    <div class="relative flex items-center justify-between gap-3 px-3 py-3 border-b border-slate-200 dark:border-slate-600 bg-slate-100/80 dark:bg-slate-700/50">
      {showWindowDots && (
        <div
          class="relative z-0 flex items-center gap-1.5 shrink-0"
          aria-hidden
        >
          <span
            class="w-2.5 h-2.5 rounded-full bg-[#ef4446]"
            title="关闭"
          />
          <span
            class="w-2.5 h-2.5 rounded-full bg-[#e5a00d]"
            title="最小化"
          />
          <span
            class="w-2.5 h-2.5 rounded-full bg-[#34c749]"
            title="最大化"
          />
        </div>
      )}
      {hasTitle && (
        <span class="absolute inset-0 flex items-center justify-center pointer-events-none font-medium text-slate-700 dark:text-slate-300 truncate max-w-full px-12">
          {title}
        </span>
      )}
    </div>
  );
}

export function CodeBlock(props: CodeBlockProps): JSX.Element {
  const {
    code,
    language = "plaintext",
    showLineNumbers = false,
    lineNumberStart = 1,
    maxHeight,
    title,
    copyable = true,
    showWindowDots = true,
    onCopy,
    wrapLongLines = false,
    class: className,
    preClass,
    codeClass,
  } = props;

  const maxHeightStyle = maxHeight != null
    ? {
      maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
    }
    : undefined;

  const lines = code.split("\n");
  const lineCount = lines.length;

  /** 服务端无 DOM，需在 JSX 中直接输出代码文本，供 SSR 可见；客户端由 setCodeRef 替换为高亮结果 */
  const setCodeRef = (el: unknown) => {
    const codeEl = el as HTMLElement | null;
    if (!codeEl || typeof globalThis.document === "undefined") return;
    let lang = (language ?? "plaintext").toLowerCase();
    if (lang === "html") lang = "markup";
    if (lang === "shell") lang = "bash";
    const prism = Prism as {
      languages?: Record<string, unknown>;
      highlight: (code: string, grammar: unknown, lang: string) => string;
    };
    let grammar = prism.languages?.[lang];
    if (!grammar && lang === "tsx") {
      grammar = prism.languages?.["typescript"];
      if (grammar) lang = "typescript";
    }
    try {
      if (grammar) {
        codeEl.innerHTML = prism.highlight(code, grammar, lang);
      } else {
        codeEl.textContent = code;
      }
    } catch {
      codeEl.textContent = code;
    }
  };

  const handleCopy = () => {
    if (typeof globalThis.navigator?.clipboard?.writeText === "function") {
      globalThis.navigator.clipboard.writeText(code).then(() => {
        toast.success("复制成功", 2000);
        onCopy?.();
      }).catch(() => {
        toast.error("复制失败", 2000);
      });
    } else {
      toast.error("复制失败", 2000);
      onCopy?.();
    }
  };

  /**
   * 注入 Prism token 样式（每个 CodeBlock 根节点一次）。
   * 注意：部分运行时下 ref 可能在元素尚未挂入 document 时调用，
   * detached 节点的 ownerDocument 可能为 undefined，需回退到 globalThis.document。
   */
  const setWrapperRef = (el: unknown) => {
    if (!isElementNodeForInsert(el)) return;
    const wrapper = el;
    const marked = wrapper as HTMLElement & { _codeBlockStyle?: boolean };
    if (marked._codeBlockStyle) return;

    const doc = wrapper.ownerDocument ??
      (typeof globalThis.document !== "undefined"
        ? globalThis.document
        : undefined);
    if (!doc?.createElement) return;

    marked._codeBlockStyle = true;
    const style = doc.createElement("style");
    style.textContent = PRISM_TOKEN_CSS;
    wrapper.insertBefore(style, wrapper.firstChild);
  };

  const lineNumberCol = showLineNumbers && lineCount > 0
    ? (
      <div
        class="shrink-0 min-w-10 select-none py-3 px-2 font-mono text-xs text-slate-400 dark:text-slate-500 border-r border-slate-200 dark:border-slate-600 bg-slate-100/50 dark:bg-slate-800/50"
        aria-hidden
      >
        {lines.map((_, i) => (
          <div
            key={i}
            class="flex w-full min-h-[calc(0.875rem*1.625)] items-center justify-center tabular-nums"
          >
            {lineNumberStart + i}
          </div>
        ))}
      </div>
    )
    : null;

  return (
    <div
      ref={setWrapperRef}
      class={twMerge(
        "code-block code-block-prism rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80 text-sm",
        className,
      )}
    >
      <CodeBlockHeader title={title} showWindowDots={showWindowDots} />
      <div class="relative flex overflow-hidden">
        {copyable && (
          <button
            type="button"
            class="absolute top-2 right-2 z-0 p-2 rounded hover:bg-slate-200/80 dark:hover:bg-slate-600/80 text-slate-600 dark:text-slate-400 transition-colors"
            onClick={handleCopy}
            title="复制"
            aria-label="复制"
          >
            <IconCopy class="w-4 h-4" />
          </button>
        )}
        {lineNumberCol}
        <pre
          class={twMerge(
            "m-0 flex-1 min-w-0 overflow-auto p-3 font-mono leading-relaxed",
            showLineNumbers && "pl-4",
            copyable && "pr-12",
            wrapLongLines && "whitespace-pre-wrap wrap-break-word",
            !wrapLongLines && "whitespace-pre",
            preClass,
          )}
          style={maxHeightStyle}
        >
          <code
            ref={setCodeRef}
            class={twMerge(
              `language-${(language ?? "plaintext").toLowerCase()}`,
              "inline-block min-w-full w-max whitespace-pre text-left break-normal [overflow-wrap:normal] [word-break:normal]",
              codeClass,
            )}
          >
          </code>
        </pre>
      </div>
    </div>
  );
}
