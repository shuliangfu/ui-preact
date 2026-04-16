/**
 * Markdown 预览区（innerHTML 注入后）对围栏代码块做 Prism 高亮，
 * 并为每个 `pre` 包一层容器（独立背景 + 右上角复制按钮）。
 *
 * 与 {@link CodeBlock} 使用相同语言包与 token 样式（{@link PRISM_TOKEN_CSS}）。
 */

import Prism from "prismjs";
import "prismjs/components/prism-bash.js";
import "prismjs/components/prism-css.js";
import "prismjs/components/prism-javascript.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-jsx.js";
import "prismjs/components/prism-markdown.js";
import "prismjs/components/prism-tsx.js";
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-markup.js";
import { toast } from "../feedback/toast-store.ts";
import { PRISM_TOKEN_CSS } from "../prism-token-styles.ts";

/**
 * 预览内代码块外壳与复制按钮样式（挂 head，避免被 `innerHTML` 清空）。
 *
 * 与预览区背景区分：浅色用略深灰底 + 边框；深色用 slate-950 相对 slate-800 预览底。
 */
const MARKDOWN_PREVIEW_CODE_UI_CSS = `
.md-preview-code-shell {
  position: relative;
  margin: 0.5rem 0;
  border-radius: 0.5rem;
  border: 1px solid rgb(226 232 240);
  background-color: rgb(241 245 249);
}
.dark .md-preview-code-shell {
  border-color: rgb(51 65 85);
  background-color: rgb(2 6 23);
}
.md-preview-code-shell pre {
  margin: 0 !important;
  max-height: min(70vh, 32rem);
  overflow: auto;
  padding: 0.75rem 2.75rem 0.75rem 0.75rem !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
  line-height: 1.625;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
}
/* 预览 prose 的 [&_code] 底纹会命中 pre>code；行内布局时背景按行盒分段成条带。围栏内取消 code 底纹并 block 化，整轨由 shell 承色。 */
.md-preview-code-shell pre code {
  display: block;
  width: max-content;
  min-width: 100%;
  box-sizing: border-box;
  padding: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
}
.md-preview-code-copy-btn {
  position: absolute;
  top: 0.375rem;
  right: 0.375rem;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  color: rgb(71 85 105);
  background: transparent;
  transition: background-color 0.15s, color 0.15s;
}
.md-preview-code-copy-btn:hover {
  color: rgb(15 23 42);
  background-color: rgb(226 232 240);
}
.dark .md-preview-code-copy-btn {
  color: rgb(148 163 184);
}
.dark .md-preview-code-copy-btn:hover {
  color: rgb(241 245 249);
  background-color: rgb(51 65 85);
}
`;

/**
 * Prism token + 代码块 UI 合并注入（一次 `<style>`，同一 Document 只插一次）。
 */
const MARKDOWN_PREVIEW_HEAD_CSS =
  `${PRISM_TOKEN_CSS}\n${MARKDOWN_PREVIEW_CODE_UI_CSS}`;

/**
 * 已为预览辅助 CSS（Prism token + 代码块壳）注入过 `<style>` 的 Document。
 */
const prismPreviewCssInjectedForDoc = new WeakMap<Document, boolean>();

/**
 * 从 `<code class="language-xxx">` 解析围栏语言别名，并映射为 Prism 注册的 grammar 键。
 *
 * @param className - `code` 元素的 `class` 属性全文
 * @returns Prism 使用的语言键；无法识别时返回空串
 */
function fenceAliasToPrismLang(className: string): string {
  const m = className.match(/\blanguage-([\w-]+)\b/);
  if (!m) return "";
  const alias = m[1].toLowerCase();
  if (alias === "ts") return "typescript";
  if (alias === "js") return "javascript";
  if (alias === "html" || alias === "xml") return "markup";
  if (alias === "shell" || alias === "sh") return "bash";
  return alias;
}

/**
 * 预览根是否为浏览器（或 happy-dom 等）真实元素节点。
 * SSR、部分运行时下的 `ref.current` 可能非 DOM，直接调 `querySelectorAll` 会抛错。
 *
 * @param host - {@link previewRef} 等传入值
 */
export function isMarkdownPreviewDomHost(host: unknown): host is HTMLElement {
  if (host == null || typeof host !== "object") return false;
  const h = host as { querySelectorAll?: unknown };
  return typeof h.querySelectorAll === "function";
}

/**
 * 在当前文档的 `head` 中注入一次 Prism token 样式（与 CodeBlock 视觉一致）。
 *
 * 样式挂在 `head`：预览每次更新会重写 `innerHTML`，勿把本 `<style>` 放在预览根内。
 *
 * @param host - 已挂树的节点，用于解析 `ownerDocument`（多 iframe 时各 Document 各注入一次）
 */
export function ensureMarkdownPreviewPrismStyles(host: HTMLElement): void {
  if (!isMarkdownPreviewDomHost(host)) return;
  const doc = host.ownerDocument ??
    (typeof globalThis.document !== "undefined"
      ? globalThis.document
      : undefined);
  if (!doc?.head?.appendChild) return;
  if (prismPreviewCssInjectedForDoc.get(doc)) return;

  prismPreviewCssInjectedForDoc.set(doc, true);
  const style = doc.createElement("style");
  style.setAttribute("data-md-preview-prism", "1");
  style.textContent = MARKDOWN_PREVIEW_HEAD_CSS;
  doc.head.appendChild(style);
}

/**
 * 对 `host` 内所有 `pre > code.language-*` 执行 Prism.highlight，写入着色后的 innerHTML。
 *
 * @param host - 已写入 `parse()` 产出的 HTML 的预览根节点
 */
export function highlightMarkdownPreviewCodeBlocks(host: HTMLElement): void {
  if (!isMarkdownPreviewDomHost(host)) return;
  const prism = Prism as {
    languages?: Record<string, unknown>;
    highlight: (code: string, grammar: unknown, lang: string) => string;
  };

  const codes = host.querySelectorAll("pre > code[class*='language-']");
  codes.forEach((node) => {
    const codeEl = node as HTMLElement;
    let lang = fenceAliasToPrismLang(codeEl.className);
    if (!lang) return;

    let grammar = prism.languages?.[lang];
    if (!grammar && lang === "tsx") {
      grammar = prism.languages?.["typescript"];
      if (grammar) lang = "typescript";
    }

    const source = codeEl.textContent ?? "";
    try {
      if (grammar) {
        codeEl.innerHTML = prism.highlight(source, grammar, lang);
      }
    } catch {
      codeEl.textContent = source;
    }
  });
}

/** 与 {@link IconCopy} 同形，供 `innerHTML` 内联（预览 DOM 非 JSX） */
const MD_PREVIEW_COPY_ICON_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`;

/**
 * 将预览区内每个 `pre` 包入 `.md-preview-code-shell`，并添加右上角复制按钮。
 *
 * 须在 `innerHTML` 赋值与 Prism 高亮之后调用；每次预览刷新都会重建 DOM，故每次全量包裹即可。
 *
 * @param host - Markdown 预览根节点
 */
export function wrapMarkdownPreviewCodeBlocks(host: HTMLElement): void {
  if (!isMarkdownPreviewDomHost(host)) return;
  const doc = host.ownerDocument ??
    (typeof globalThis.document !== "undefined"
      ? globalThis.document
      : undefined);
  if (!doc) return;

  const list = host.querySelectorAll("pre");
  list.forEach((pre) => {
    if (pre.parentElement?.classList.contains("md-preview-code-shell")) {
      return;
    }

    const shell = doc.createElement("div");
    shell.className = "md-preview-code-shell";
    shell.setAttribute("role", "group");
    shell.setAttribute("aria-label", "代码块");

    const parent = pre.parentNode;
    if (parent == null) return;
    parent.insertBefore(shell, pre);
    shell.appendChild(pre);

    const btn = doc.createElement("button");
    btn.type = "button";
    btn.className = "md-preview-code-copy-btn";
    btn.setAttribute("aria-label", "复制代码");
    btn.title = "复制代码";
    btn.innerHTML = MD_PREVIEW_COPY_ICON_SVG;

    /**
     * 复制围栏源码：优先取 `code` 的纯文本（与高亮 DOM 一致）。
     */
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const codeEl = pre.querySelector("code");
      const text = (codeEl?.innerText ?? pre.textContent ?? "").replace(
        /\u00a0/g,
        " ",
      );
      const payload = text.replace(/\n+$/, "");
      if (typeof globalThis.navigator?.clipboard?.writeText === "function") {
        globalThis.navigator.clipboard.writeText(payload).then(() => {
          toast.success("复制成功", 2000);
        }).catch(() => {
          toast.error("复制失败", 2000);
        });
      } else {
        toast.error("复制失败", 2000);
      }
    });

    shell.appendChild(btn);
  });
}
