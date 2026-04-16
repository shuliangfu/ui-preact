/**
 * RichTextEditor 富文本编辑器（View）。
 * WYSIWYG 编辑：加粗/斜体/下划线/删除线、标题、字号、行高、列表、引用、链接、图片（URL/上传）、表格、代码块、对齐、颜色等。
 * 正文块尽量用 `p`：聚焦时设置 `defaultParagraphSeparator` 为 `p`，并在输入时把根级裸文本包进首段 `p`（浏览器默认常用 `div` 与无包裹首段）。
 * 前景/背景色使用 {@link ColorPicker} 隐藏触发器 + 命令式 `openFromPointerEvent`；打开前克隆选区，
 * 确定时再恢复，避免操作取色面板导致选区丢失而无法正确 `execCommand`。
 * 支持粘贴图片到内容区（剪贴板图片转 data URL 或经 onPasteImage 上传后插入）。
 * 工具栏可配置为 simple（简单）、default（默认）、full（全部），或完全自定义；文字颜色与背景色在三档预设中均提供。
 * 各预设工具栏首位为「编辑源码」：在 HTML 源码与可视化编辑之间切换；进入源码时会对 `innerHTML` 做缩进排版（类 Elements 结构）便于编辑。
 * 受控 HTML 仅在**编辑区未获焦**且非链接弹层打开时由 `effect`（@preact/signals）同步到 DOM；获焦时以浏览器 DOM
 * 为准，避免写 `innerHTML` 重置选区。`ref` 仅用 `createRef` 持有编辑区节点。
 */

import type { ComponentChildren, JSX } from "preact";
import { useRef } from "preact/hooks";
import { createPortal } from "preact/compat";
import { computed, effect, signal, untracked } from "@preact/signals";
import { twMerge } from "tailwind-merge";
import { Modal } from "../feedback/Modal.tsx";
import { Tooltip } from "../feedback/Tooltip.tsx";
import { Button } from "../basic/Button.tsx";
import { IconType } from "../basic/icons/Type.tsx";
import { ColorPicker, type ColorPickerHandle } from "./ColorPicker.tsx";
import { controlBlueFocusRing } from "./input-focus-ring.ts";
import { Input } from "./Input.tsx";
import {
  commitMaybeSignal,
  type MaybeSignal,
  readMaybeSignal,
} from "./maybe-signal.ts";
import { getFormPortalBodyHost } from "./picker-portal-utils.ts";

/** 工具栏丰富程度预设 */
export type ToolbarPreset = "simple" | "default" | "full";

/** 单条工具栏项：命令与展示 */
export interface ToolbarItem {
  /** 展示用 key，如 bold、italic */
  key: string;
  /** 按钮标题 / 无障碍文案；可含快捷键说明，如 "加粗 (Ctrl+B)" */
  title: string;
  /** document.execCommand 或自定义命令名 */
  command: string;
  /** 命令参数（如 insertImage 的 url） */
  value?: string;
  /** 图标：可选 SVG 或文字缩写 */
  icon?: string;
  /** 子项（下拉，如标题层级、特殊字符） */
  children?: { value: string; label: string }[];
}

/** 自定义工具栏：二维数组，内层为同一组 */
export type ToolbarConfig = ToolbarItem[][] | ToolbarItem[];

/**
 * 工具栏与查找条悬停说明：使用 {@link Tooltip} 统一气泡样式；**不再**写原生 `title`，避免与自定义气泡叠两层。
 * Tooltip 气泡默认经 Portal 挂到 `document.body` 且 `fixed` 定位，避免工具栏 `overflow` 裁切；全屏根节点为 `z-9999` 时可用 `overlayClass` 抬高 z-index（如 `z-10050`）。
 *
 * @param props.content - 提示文案；`trim` 后为空则仅渲染子节点、不包裹 Tooltip
 * @param props.children - 触发区域（外包结构保持与原先一致，避免影响 `mousedown` 选区保留逻辑）
 * @param props.class - 额外 class 合并到 Tooltip 触发器外层
 * @returns 包装后的节点
 */
function RteToolbarItemTip(props: {
  /** 列表项稳定 key，供列表渲染协调；不参与 Tooltip 逻辑 */
  key?: string | number;
  content: string;
  children?: ComponentChildren;
  class?: string;
}) {
  const c = props.content.trim();
  if (!c) {
    return <>{props.children}</>;
  }
  // 工具栏多在编辑区上方，placement 取 bottom 减少贴顶溢出
  return (
    <Tooltip
      content={c}
      placement="top"
      class={twMerge("shrink-0 items-center", props.class)}
      overlayClass="z-10050"
      arrow
    >
      {props.children}
    </Tooltip>
  );
}

/**
 * 可视化 ↔ HTML 源码切换；须排在撤销之前，便于先切源码再编辑。
 */
const RTE_TOOLBAR_SOURCE_ITEM: ToolbarItem = {
  key: "sourceHtml",
  title: "编辑源码",
  command: "rteToggleSourceHtml",
  icon: "HTML",
};

/** 第一行：源码切换、撤销/重做与常用内联格式、链接（各预设共用） */
const RTE_TOOLBAR_ROW_BASIC: ToolbarItem[] = [
  RTE_TOOLBAR_SOURCE_ITEM,
  { key: "undo", title: "撤销 (Ctrl+Z)", command: "undo", icon: "↶" },
  { key: "redo", title: "重做 (Ctrl+Y)", command: "redo", icon: "↷" },
  { key: "bold", title: "加粗 (Ctrl+B)", command: "bold", icon: "B" },
  { key: "italic", title: "斜体 (Ctrl+I)", command: "italic", icon: "I" },
  {
    key: "underline",
    title: "下划线 (Ctrl+U)",
    command: "underline",
    icon: "U",
  },
  {
    key: "link",
    title: "插入链接 (Ctrl+K)",
    command: "createLink",
    value: "",
  },
];

/** 段落与标题（formatBlock）；左侧由工具栏渲染 {@link IconType}，此处保留文案供自定义工具栏回退 */
const RTE_TOOLBAR_HEADING_ITEM: ToolbarItem = {
  key: "heading",
  title: "段落与标题",
  command: "formatBlock",
  value: "p",
  icon: "段落",
  children: [
    { value: "p", label: "正文" },
    { value: "h2", label: "标题 2" },
    { value: "h3", label: "标题 3" },
    { value: "h4", label: "标题 4" },
  ],
};

/** 字号（自定义 `rteFontSize`，DOM 包 `span` + `data-rte-font-size`） */
const RTE_TOOLBAR_FONT_SIZE_ITEM: ToolbarItem = {
  key: "fontSize",
  title: "字号",
  command: "rteFontSize",
  value: "16px",
  children: [
    { value: "12px", label: "12px" },
    { value: "14px", label: "14px" },
    { value: "16px", label: "16px" },
    { value: "18px", label: "18px" },
    { value: "20px", label: "20px" },
    { value: "24px", label: "24px" },
    { value: "28px", label: "28px" },
  ],
};

/** 行高（自定义 `rteLineHeight`，作用于当前块级容器） */
const RTE_TOOLBAR_LINE_HEIGHT_ITEM: ToolbarItem = {
  key: "lineHeight",
  title: "行高",
  command: "rteLineHeight",
  value: "1.5",
  children: [
    { value: "1.25", label: "1.25" },
    { value: "1.5", label: "1.5" },
    { value: "1.75", label: "1.75" },
    { value: "2", label: "2" },
    { value: "2.5", label: "2.5" },
  ],
};

/** 第二行：段落标题、字号、行高（simple / default / full 共用） */
const RTE_TOOLBAR_ROW_TYPOGRAPHY: ToolbarItem[] = [
  RTE_TOOLBAR_HEADING_ITEM,
  RTE_TOOLBAR_FONT_SIZE_ITEM,
  RTE_TOOLBAR_LINE_HEIGHT_ITEM,
];

/**
 * 文字颜色与背景色（各预设均展示，与 {@link ColorPicker}、`foreColor`/`backColor` 命令联动）。
 */
const RTE_TOOLBAR_ROW_COLORS: ToolbarItem[] = [
  {
    key: "foreColor",
    title: "文字颜色",
    command: "foreColor",
    value: "#000000",
    icon: "A",
  },
  {
    key: "backColor",
    title: "背景色",
    command: "backColor",
    value: "#ffff00",
  },
];

/** 根据预设返回工具栏分组 */
function getToolbarByPreset(preset: ToolbarPreset): ToolbarItem[][] {
  const simple: ToolbarItem[][] = [
    RTE_TOOLBAR_ROW_BASIC,
    RTE_TOOLBAR_ROW_TYPOGRAPHY,
    RTE_TOOLBAR_ROW_COLORS,
  ];

  const defaultPreset: ToolbarItem[][] = [
    RTE_TOOLBAR_ROW_BASIC,
    RTE_TOOLBAR_ROW_TYPOGRAPHY,
    [
      {
        key: "removeFormat",
        title: "清除格式",
        command: "removeFormat",
        icon: "✕",
      },
      {
        key: "blockquote",
        title: "引用",
        command: "formatBlock",
        value: "blockquote",
      },
      {
        key: "ul",
        title: "无序列表",
        command: "insertUnorderedList",
        icon: "•",
      },
      {
        key: "ol",
        title: "有序列表",
        command: "insertOrderedList",
        icon: "1.",
      },
    ],
    RTE_TOOLBAR_ROW_COLORS,
  ];

  const full: ToolbarItem[][] = [
    ...defaultPreset,
    [
      {
        key: "strike",
        title: "删除线",
        command: "strikeThrough",
        /** 预设工具栏由 `renderToolbarButtonContent` 的 `strike` 分支绘制 SVG；保留字符供自定义回退 */
        icon: "S̲",
      },
      {
        key: "code",
        title: "行内代码",
        command: "formatBlock",
        value: "pre",
        icon: "</>",
      },
      {
        key: "insertCodeBlock",
        title: "代码块(可高亮)",
        command: "insertCodeBlock",
        icon: "{ }",
      },
      {
        key: "insertImage",
        title: "插入图片 URL",
        command: "insertImage",
        value: "",
      },
      {
        key: "uploadImage",
        title: "上传图片",
        command: "uploadImage",
        value: "",
      },
      {
        key: "insertTable",
        title: "插入表格",
        command: "insertTable",
        value: "",
        icon: "▦",
      },
      {
        key: "justifyLeft",
        title: "左对齐",
        command: "justifyLeft",
        icon: "≡",
      },
      {
        key: "justifyCenter",
        title: "居中",
        command: "justifyCenter",
        icon: "≡",
      },
      {
        key: "justifyRight",
        title: "右对齐",
        command: "justifyRight",
        icon: "≡",
      },
      {
        key: "hr",
        title: "水平线",
        command: "insertHorizontalRule",
        icon: "—",
      },
      {
        key: "insertSpecialChar",
        title: "特殊字符",
        command: "insertSpecialChar",
        icon: "Ω",
        children: [
          { value: "&nbsp;", label: "空格" },
          { value: "©", label: "©" },
          { value: "®", label: "®" },
          { value: "™", label: "™" },
          { value: "°", label: "°" },
          { value: "×", label: "×" },
          { value: "÷", label: "÷" },
          { value: "…", label: "…" },
          { value: "—", label: "—" },
          { value: "“", label: "“" },
          { value: '"', label: '"' },
          { value: "😀", label: "表情 😀" },
          { value: "👍", label: "赞 👍" },
          { value: "❤", label: "心形 ❤" },
        ],
      },
      {
        key: "insertTableWithHeader",
        title: "插入表格(含表头)",
        command: "insertTableWithHeader",
        icon: "▦H",
      },
      { key: "sup", title: "上标", command: "superscript", icon: "x²" },
      { key: "sub", title: "下标", command: "subscript", icon: "x₂" },
      {
        key: "indent",
        title: "首行缩进",
        command: "indentFirstLine",
        icon: "¶",
      },
      {
        key: "fullscreen",
        title: "全屏",
        command: "fullscreen",
        /** 图标由 `renderToolbarButtonContent` 的 `fullscreen` 分支绘制（全屏后切换为退出形） */
        icon: "⛶",
      },
      { key: "find", title: "查找 (Ctrl+F)", command: "find" },
      { key: "replace", title: "替换", command: "replace" },
      { key: "print", title: "打印", command: "print" },
      { key: "export", title: "导出", command: "exportContent" },
      {
        key: "shortcuts",
        title: "快捷键帮助",
        command: "shortcuts",
        icon: "?",
      },
    ],
  ];

  switch (preset) {
    case "simple":
      return simple;
    case "default":
      return defaultPreset;
    case "full":
      return full;
    default:
      return defaultPreset;
  }
}

/** 将自定义配置规范为二维数组 */
function normalizeToolbarConfig(config: ToolbarConfig): ToolbarItem[][] {
  if (config.length === 0) return [];
  const first = config[0];
  if (Array.isArray(first)) return config as ToolbarItem[][];
  return [config as ToolbarItem[]];
}

/** 仅用字符串去除 HTML 标签（SSR 安全，用于字数统计） */
function stripHtmlToText(html: string): string {
  return (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 从 HTML 提取纯文本用于字数统计（SSR 时 document 不可用，用 try/catch 回退到 stripHtmlToText） */
function getPlainText(html: string): string {
  try {
    const div = document.createElement("div");
    div.innerHTML = html;
    return (div.textContent ?? div.innerText ?? "").trim();
  } catch {
    return stripHtmlToText(html);
  }
}

/** 统计字数（按空格分词，过滤空串） */
function getWordCount(html: string): number {
  const text = getPlainText(html).trim();
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

/** 序列化时按 void 处理、不输出闭合标签的 HTML 元素 */
const RTE_VOID_HTML_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

/**
 * 属性值写回双引号属性时的转义。
 *
 * @param s - 原始属性值
 */
function rteEscapeAttrValueForSource(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "&#10;")
    .replace(/\r/g, "&#13;");
}

/**
 * 生成元素开始标签（含属性）。
 *
 * @param el - DOM 元素
 */
function rteSerializeOpenTag(el: Element): string {
  const name = el.tagName.toLowerCase();
  let tag = `<${name}`;
  for (let i = 0; i < el.attributes.length; i++) {
    const a = el.attributes[i]!;
    tag += ` ${a.name}="${rteEscapeAttrValueForSource(a.value)}"`;
  }
  return `${tag}>`;
}

/**
 * 将编辑区 `innerHTML` 格式化为带 2 空格缩进的多行源码，便于在源码模式下编辑（结构类似开发者工具 Elements，无语法高亮）。
 * 解析失败或非浏览器环境时返回原串。
 *
 * @param html - 原始 HTML
 */
function rtePrettyPrintHtmlSource(html: string): string {
  const raw = html ?? "";
  if (raw.trim() === "") return "";
  try {
    const doc = globalThis.document;
    if (!doc) return raw;
    const tpl = doc.createElement("template");
    tpl.innerHTML = raw;
    const lines: string[] = [];
    /**
     * 深度优先输出节点，每层一级缩进。
     *
     * @param node - 当前节点
     * @param depth - 缩进层级
     */
    const walk = (node: Node, depth: number): void => {
      const ind = "  ".repeat(depth);
      if (node.nodeType === Node.TEXT_NODE) {
        // 标签之间的换行/空白在 DOM 里常变成独立文本节点；若整段含 \n 直接 push，
        // 换行后 textarea 会从第 0 列起画，看起来像「内容没缩进」且多出空行。
        const raw = node.textContent ?? "";
        const trimmed = raw.replace(/^\s+|\s+$/g, "");
        if (trimmed === "") return;
        const parts = trimmed.split(/\r\n|\r|\n/);
        for (const part of parts) {
          if (part === "") continue;
          lines.push(ind + part);
        }
        return;
      }
      if (node.nodeType === Node.COMMENT_NODE) {
        lines.push(`${ind}<!--${node.textContent ?? ""}-->`);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const el = node as Element;
      const name = el.tagName.toLowerCase();
      const open = rteSerializeOpenTag(el);
      if (RTE_VOID_HTML_TAGS.has(name)) {
        lines.push(ind + open);
        return;
      }
      if (el.childNodes.length === 0) {
        lines.push(ind + open + `</${name}>`);
        return;
      }
      lines.push(ind + open);
      for (const c of Array.from(el.childNodes)) {
        walk(c, depth + 1);
      }
      lines.push(ind + `</${name}>`);
    };
    for (const c of Array.from(tpl.content.childNodes)) {
      walk(c, 0);
    }
    return lines.join("\n");
  } catch {
    return raw;
  }
}

/**
 * 判断编辑区是否处于「用户正在编辑」：焦点在 `contenteditable` 上，或选区锚点仍落在其 DOM 内。
 * 受控 `value` 触发重绘时，仅比较 `activeElement === el` 在部分 reconciler 时序下会短暂不成立，
 * 若此时用 props 覆盖 `innerHTML` 会重置选区，光标回到开头。
 *
 * @param editor - 富文本编辑区根节点
 * @returns 为 true 时不应从受控 `value` 同步 `innerHTML`
 */
function isEditorActiveOrSelectionInside(editor: HTMLElement): boolean {
  const doc = globalThis.document;
  if (!doc || !editor.isConnected) return false;
  if (doc.activeElement === editor) return true;
  try {
    const sel = doc.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    let n: Node | null = sel.anchorNode;
    if (!n) return false;
    if (n.nodeType === Node.TEXT_NODE) {
      n = n.parentNode;
    }
    return n != null && editor.contains(n);
  } catch {
    return false;
  }
}

/**
 * 若当前文档选区完全落在编辑区内，则克隆其第一个 `Range`；否则返回 `null`。
 * 在取色等浮层抢走焦点前调用，避免用户在面板内操作后 `document.getSelection()` 已折叠/清空，
 * 导致 `execCommand('foreColor'|'backColor')` 作用在错误位置。
 *
 * @param editor - contenteditable 根节点
 * @returns 可稍后交给 {@link restoreEditorSelectionRange} 的克隆，或 `null`
 */
function cloneEditorSelectionRangeIfInside(
  editor: HTMLElement,
): Range | null {
  const doc = globalThis.document;
  if (!doc) return null;
  try {
    const sel = doc.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const r = sel.getRangeAt(0);
    if (!editor.contains(r.commonAncestorContainer)) return null;
    return r.cloneRange();
  } catch {
    return null;
  }
}

/**
 * 将文档选区恢复为给定 `Range`（须仍挂在编辑区 DOM 内）；失败时静默忽略。
 *
 * @param editor - 会先对其 `focus` 的编辑区根节点
 * @param range - {@link cloneEditorSelectionRangeIfInside} 的返回值，可为 `null`
 */
function restoreEditorSelectionRange(
  editor: HTMLElement,
  range: Range | null,
): void {
  if (range == null) return;
  const doc = globalThis.document;
  if (!doc) return;
  try {
    if (!editor.contains(range.commonAncestorContainer)) return;
    editor.focus({ preventScroll: true });
    const sel = doc.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  } catch {
    /* Range 已失效或浏览器拒绝设置选区 */
  }
}

/**
 * 折叠光标处插入可见文案为「链接」、`href` 为 `url` 的锚点（不把 URL 写进正文）。
 *
 * @param editor - contenteditable 根
 * @param url - 链接地址
 */
function rteInsertLinkPlaceholderAtCaret(
  editor: HTMLElement,
  url: string,
): void {
  const a = document.createElement("a");
  a.href = url;
  a.textContent = "链接";
  const sel = document.getSelection();
  if (sel != null && sel.rangeCount > 0) {
    const cr = sel.getRangeAt(0);
    if (editor.contains(cr.commonAncestorContainer)) {
      try {
        cr.insertNode(a);
        rteCollapseSelectionToEndOfNode(a);
        return;
      } catch {
        /* 退回 insertHTML */
      }
    }
  }
  try {
    const safe = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    document.execCommand("insertHTML", false, `<a href="${safe}">链接</a>`);
  } catch {
    /* ignore */
  }
}

/**
 * 应用超链接：有非空选区时用 `createLink`（锚文本为选中文字，URL 仅作 `href`）；
 * 折叠或无选区时在光标插入「链接」二字锚点，避免浏览器把 URL 当可见正文插入。
 *
 * @param editor - contenteditable 根
 * @param url - 用户输入的 URL
 * @param savedRange - 打开链接弹层前克隆的选区，可为 `null`
 */
function rteApplyLinkUrl(
  editor: HTMLElement,
  url: string,
  savedRange: Range | null,
): void {
  const u = url.trim();
  if (!u) return;
  editor.focus({ preventScroll: true });
  restoreEditorSelectionRange(editor, savedRange);

  const sel = document.getSelection();
  if (!sel || sel.rangeCount === 0) {
    rteInsertLinkPlaceholderAtCaret(editor, u);
    return;
  }
  const r = sel.getRangeAt(0);
  if (!editor.contains(r.commonAncestorContainer)) {
    rteInsertLinkPlaceholderAtCaret(editor, u);
    return;
  }
  const hasText = !r.collapsed && (r.toString() ?? "").length > 0;
  if (hasText) {
    document.execCommand("createLink", false, u);
    return;
  }
  rteInsertLinkPlaceholderAtCaret(editor, u);
}

/**
 * 若选区落在已有 RTE 上色 `span` 内，则只改内联样式，避免反复包一层嵌套 `span`。
 * 自 {@link Range.commonAncestorContainer} 向上找**第一个**带对应 `data-*` 的 `span`（即最内层包裹）。
 *
 * @param editor - contenteditable 根，遇此停止向上
 * @param range - 当前选区
 * @param cmd - 前景或背景，决定读写的 `data-*` 与 CSS 属性
 * @param color - 新颜色值
 * @returns 是否已就地更新并应跳过后续 `surroundContents`
 */
function tryUpdateExistingRteColorSpan(
  editor: HTMLElement,
  range: Range,
  cmd: "foreColor" | "backColor",
  color: string,
): boolean {
  const attr = cmd === "foreColor" ? "data-rte-color" : "data-rte-bgcolor";
  const styleKey = cmd === "foreColor" ? "color" : "backgroundColor";
  let n: Node | null = range.commonAncestorContainer;
  if (n.nodeType === Node.TEXT_NODE) n = n.parentNode;
  while (n != null && n !== editor) {
    if (n instanceof HTMLSpanElement && n.hasAttribute(attr)) {
      try {
        const spanRange = document.createRange();
        spanRange.selectNodeContents(n);
        const fullyInside =
          range.compareBoundaryPoints(Range.START_TO_START, spanRange) >= 0 &&
          range.compareBoundaryPoints(Range.END_TO_END, spanRange) <= 0;
        if (fullyInside) {
          n.style.setProperty(styleKey, color, "important");
          const sel = document.getSelection();
          if (sel) {
            sel.removeAllRanges();
            const nr = document.createRange();
            nr.selectNodeContents(n);
            nr.collapse(false);
            sel.addRange(nr);
          }
          return true;
        }
      } catch {
        /* 继续向上找 */
      }
    }
    n = n.parentNode;
  }
  return false;
}

/**
 * 用带 `!important` 的内联样式包一层 `span`，避免编辑区 `text-slate-*` 等类通过继承/层叠盖住前景色。
 * 先 `surroundContents`；跨块选区失败时用 `extractContents` + `insertNode`（与 MDN 对 `surroundContents` 的说明一致）。
 *
 * @param range - 须未折叠且边界仍有效
 * @param styleKey - `color` 或 `backgroundColor`
 * @param value - CSS 颜色值
 * @returns 是否已成功写入 DOM
 */
function rteSurroundRangeWithImportantStyle(
  range: Range,
  styleKey: "color" | "backgroundColor",
  value: string,
): boolean {
  const span = document.createElement("span");
  span.style.setProperty(styleKey, value, "important");
  if (styleKey === "color") span.setAttribute("data-rte-color", "");
  else span.setAttribute("data-rte-bgcolor", "");
  try {
    range.surroundContents(span);
  } catch {
    try {
      const frag = range.extractContents();
      span.appendChild(frag);
      range.insertNode(span);
    } catch {
      return false;
    }
  }
  try {
    const sel = document.getSelection();
    if (sel) {
      sel.removeAllRanges();
      const nr = document.createRange();
      nr.selectNodeContents(span);
      nr.collapse(false);
      sel.addRange(nr);
    }
  } catch {
    /* 选区收尾失败不影响上色 */
  }
  return true;
}

/** 加粗/斜体/下划线：用 `span` + `style` + `data-rte-*`，不生成 `b`/`i`/`u` */
type RteInlineDecoKind = "bold" | "italic" | "underline";

/**
 * 判断是否为本组件维护的内联装饰 `span`（粗/斜/下划线）。
 *
 * @param el - 待检测元素
 */
function rteSpanHasInlineDecoMark(el: HTMLSpanElement): boolean {
  return el.hasAttribute("data-rte-bold") ||
    el.hasAttribute("data-rte-italic") ||
    el.hasAttribute("data-rte-underline");
}

/**
 * 自选区公共祖先向上找**最内层**、且完全包含选区的 RTE 内联装饰 `span`。
 *
 * @param editor - contenteditable 根
 * @param range - 选区
 */
function findInnermostRteInlineDecoSpan(
  editor: HTMLElement,
  range: Range,
): HTMLSpanElement | null {
  let n: Node | null = range.commonAncestorContainer;
  if (n.nodeType === Node.TEXT_NODE) n = n.parentNode;
  while (n != null && n !== editor) {
    if (n instanceof HTMLSpanElement && rteSpanHasInlineDecoMark(n)) {
      try {
        const sr = document.createRange();
        sr.selectNodeContents(n);
        const inside =
          range.compareBoundaryPoints(Range.START_TO_START, sr) >= 0 &&
          range.compareBoundaryPoints(Range.END_TO_END, sr) <= 0;
        if (inside) return n;
      } catch {
        /* 继续 */
      }
    }
    n = n.parentNode;
  }
  return null;
}

/**
 * 判断选区边界是否与某元素 `selectNodeContents` 完全一致。
 *
 * @param range - 选区
 * @param el - 容器元素
 */
function rteSelectionFullyCoversNodeContents(
  range: Range,
  el: HTMLElement,
): boolean {
  try {
    const sr = document.createRange();
    sr.selectNodeContents(el);
    return range.compareBoundaryPoints(Range.START_TO_START, sr) === 0 &&
      range.compareBoundaryPoints(Range.END_TO_END, sr) === 0;
  } catch {
    return false;
  }
}

/**
 * 对应 `data-rte-*` 属性名。
 *
 * @param kind - 装饰类型
 */
function rteDataAttrForInlineKind(kind: RteInlineDecoKind): string {
  if (kind === "bold") return "data-rte-bold";
  if (kind === "italic") return "data-rte-italic";
  return "data-rte-underline";
}

/**
 * 在已有 `span` 上合并一种内联装饰（`!important`）。
 *
 * @param span - 目标 `span`
 * @param kind - 粗/斜/下划
 */
function mergeRteInlineDecoKind(
  span: HTMLSpanElement,
  kind: RteInlineDecoKind,
): void {
  if (kind === "bold") {
    span.style.setProperty("font-weight", "700", "important");
    span.setAttribute("data-rte-bold", "");
  } else if (kind === "italic") {
    span.style.setProperty("font-style", "italic", "important");
    span.setAttribute("data-rte-italic", "");
  } else {
    span.style.setProperty("text-decoration", "underline", "important");
    span.setAttribute("data-rte-underline", "");
  }
}

/**
 * 去掉 `span` 上某一种装饰；若不再含任何 RTE 标记且无颜色标记则展开子节点。
 *
 * @param span - 目标 `span`
 * @param kind - 要移除的类型
 */
function stripRteInlineDecoKind(
  span: HTMLSpanElement,
  kind: RteInlineDecoKind,
): void {
  if (kind === "bold") {
    span.style.removeProperty("font-weight");
    span.removeAttribute("data-rte-bold");
  } else if (kind === "italic") {
    span.style.removeProperty("font-style");
    span.removeAttribute("data-rte-italic");
  } else {
    span.style.removeProperty("text-decoration");
    span.removeAttribute("data-rte-underline");
  }
  const hasDeco = span.hasAttribute("data-rte-bold") ||
    span.hasAttribute("data-rte-italic") ||
    span.hasAttribute("data-rte-underline");
  const hasColor = span.hasAttribute("data-rte-color") ||
    span.hasAttribute("data-rte-bgcolor");
  if (!hasDeco && !hasColor) {
    const parent = span.parentNode;
    if (parent) {
      while (span.firstChild) parent.insertBefore(span.firstChild, span);
      parent.removeChild(span);
    }
  }
}

/**
 * 将选区折叠到 `node` 内容末尾（`node` 为元素或文本父级）。
 *
 * @param node - 参照节点
 */
function rteCollapseSelectionToEndOfNode(node: Node): void {
  try {
    const sel = document.getSelection();
    if (!sel) return;
    const nr = document.createRange();
    if (node.nodeType === Node.TEXT_NODE) {
      nr.setStart(node, (node as Text).length);
      nr.collapse(true);
    } else {
      nr.selectNodeContents(node);
      nr.collapse(false);
    }
    sel.removeAllRanges();
    sel.addRange(nr);
  } catch {
    /* ignore */
  }
}

/**
 * 用带某一种内联装饰的 `span` 包裹选区。
 *
 * @param range - 非折叠选区
 * @param kind - 装饰类型
 */
function rteSurroundRangeWithInlineDecoKind(
  range: Range,
  kind: RteInlineDecoKind,
): boolean {
  const span = document.createElement("span");
  mergeRteInlineDecoKind(span, kind);
  try {
    range.surroundContents(span);
  } catch {
    try {
      const frag = range.extractContents();
      span.appendChild(frag);
      range.insertNode(span);
    } catch {
      return false;
    }
  }
  rteCollapseSelectionToEndOfNode(span);
  return true;
}

/**
 * 折叠选区处插入带零宽字符的样式 `span`，后续输入继承该样式。
 *
 * @param kind - 装饰类型
 * @param range - 折叠选区
 */
function rteInsertCollapsedInlineDecoSpan(
  kind: RteInlineDecoKind,
  range: Range,
): boolean {
  try {
    const span = document.createElement("span");
    mergeRteInlineDecoKind(span, kind);
    const zw = document.createTextNode("\u200b");
    span.appendChild(zw);
    range.insertNode(span);
    const nr = document.createRange();
    nr.setStart(zw, 1);
    nr.collapse(true);
    const sel = document.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(nr);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * 查找完全包含选区的、**仅**带颜色标记（无粗斜划 `data-rte-*`）的最内层 `span`，用于与字色同层合并。
 *
 * @param editor - contenteditable 根
 * @param range - 选区
 */
function findInnermostRteColorOnlySpan(
  editor: HTMLElement,
  range: Range,
): HTMLSpanElement | null {
  let n: Node | null = range.commonAncestorContainer;
  if (n.nodeType === Node.TEXT_NODE) n = n.parentNode;
  while (n != null && n !== editor) {
    if (
      n instanceof HTMLSpanElement &&
      (n.hasAttribute("data-rte-color") ||
        n.hasAttribute("data-rte-bgcolor")) &&
      !rteSpanHasInlineDecoMark(n)
    ) {
      try {
        const sr = document.createRange();
        sr.selectNodeContents(n);
        const inside =
          range.compareBoundaryPoints(Range.START_TO_START, sr) >= 0 &&
          range.compareBoundaryPoints(Range.END_TO_END, sr) <= 0;
        if (inside) return n;
      } catch {
        /* continue */
      }
    }
    n = n.parentNode;
  }
  return null;
}

/**
 * 对选区施加或切换加粗/斜体/下划线（不调用 `execCommand('bold'|…)`，避免 `b`/`i`/`u`）。
 *
 * @param editor - contenteditable 根
 * @param kind - 装饰类型
 * @returns 为 `true` 表示已处理，调用方应 `emitChange` 且勿再 `execCommand`
 */
function applyRteInlineDecoration(
  editor: HTMLElement,
  kind: RteInlineDecoKind,
): boolean {
  editor.focus({ preventScroll: true });
  const sel = document.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const raw = sel.getRangeAt(0);
  if (!editor.contains(raw.commonAncestorContainer)) return false;

  const attr = rteDataAttrForInlineKind(kind);

  if (raw.collapsed) {
    const r = raw.cloneRange();
    const innerC = findInnermostRteInlineDecoSpan(editor, r);
    /** 光标已在同类型装饰内：去掉整段包裹（避免再走 `execCommand` 生成 `b`/`i`/`u`） */
    if (innerC && innerC.hasAttribute(attr)) {
      const parentC = innerC.parentNode;
      stripRteInlineDecoKind(innerC, kind);
      const focusC = innerC.isConnected ? innerC : parentC;
      if (focusC) rteCollapseSelectionToEndOfNode(focusC);
      return true;
    }
    return rteInsertCollapsedInlineDecoSpan(kind, r);
  }

  const r = raw.cloneRange();
  const decoSpan = findInnermostRteInlineDecoSpan(editor, r);

  if (decoSpan && decoSpan.hasAttribute(attr)) {
    if (rteSelectionFullyCoversNodeContents(r, decoSpan)) {
      const parentBefore = decoSpan.parentNode;
      stripRteInlineDecoKind(decoSpan, kind);
      const anchor = decoSpan.isConnected ? decoSpan : parentBefore;
      if (anchor) rteCollapseSelectionToEndOfNode(anchor);
      return true;
    }
    const neutral = document.createElement("span");
    if (kind === "bold") {
      neutral.style.setProperty("font-weight", "400", "important");
    } else if (kind === "italic") {
      neutral.style.setProperty("font-style", "normal", "important");
    } else {
      neutral.style.setProperty("text-decoration", "none", "important");
    }
    try {
      r.surroundContents(neutral);
    } catch {
      try {
        const frag = r.extractContents();
        neutral.appendChild(frag);
        r.insertNode(neutral);
      } catch {
        return false;
      }
    }
    rteCollapseSelectionToEndOfNode(neutral);
    return true;
  }

  if (decoSpan && rteSpanHasInlineDecoMark(decoSpan)) {
    mergeRteInlineDecoKind(decoSpan, kind);
    rteCollapseSelectionToEndOfNode(decoSpan);
    return true;
  }

  const colorSpan = findInnermostRteColorOnlySpan(editor, r);
  if (colorSpan) {
    mergeRteInlineDecoKind(colorSpan, kind);
    rteCollapseSelectionToEndOfNode(colorSpan);
    return true;
  }

  return rteSurroundRangeWithInlineDecoKind(r, kind);
}

/** 插入代码块时使用的 HTML，与工具栏命令保持一致 */
const RTE_CODE_BLOCK_INSERT_HTML =
  '<pre class="rte-code-block language-plaintext"><code><br></code></pre>';

/**
 * 从节点沿父链走向编辑根，取路径上**最外层**（最靠近根）的 `pre.rte-code-block`。
 * 若误用「最内层」`pre` 且其父为 `<code>`，在其后 `insertBefore` 仍会把新块留在同一 `<code>` 内，嵌套无法消除。
 *
 * @param editor - contenteditable 根
 * @param node - 选区相关节点（可为文本节点）
 * @returns 最外层 RTE 代码块 `pre` 或 `null`
 */
function findOutermostRteCodeBlockPre(
  editor: HTMLElement,
  node: Node,
): HTMLPreElement | null {
  const start = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
  let n: Node | null = start;
  /** 沿祖先链可能经过多层 `pre.rte-code-block`（错误嵌套时），保留最后一次命中的即最外层 */
  let outer: HTMLPreElement | null = null;
  while (n != null && n !== editor) {
    if (n instanceof HTMLPreElement && n.classList.contains("rte-code-block")) {
      outer = n;
    }
    n = n.parentNode;
  }
  return outer;
}

/**
 * 折叠选区是否落在 `el` 内容末尾（与 `selectNodeContents(el).collapse(false)` 同界）。
 *
 * @param range - 当前选区
 * @param el - 通常为 `code`
 */
function rteRangeCollapsedAtEndOfElement(
  range: Range,
  el: Node,
): boolean {
  if (!range.collapsed) return false;
  try {
    const endProbe = document.createRange();
    endProbe.selectNodeContents(el);
    endProbe.collapse(false);
    return range.compareBoundaryPoints(Range.START_TO_START, endProbe) === 0;
  } catch {
    return false;
  }
}

/**
 * 若 `pre` 在父节点中没有下一个兄弟，则追加空段 `<p><br></p>`，避免代码块贴底时无法点击或方向键移出。
 *
 * @param pre - RTE 代码块根 `pre`
 */
function rteEnsureParagraphAfterPreIfLast(pre: HTMLPreElement): void {
  if (pre.nextSibling != null) return;
  const parent = pre.parentNode;
  if (parent == null) return;
  const p = document.createElement("p");
  p.appendChild(document.createElement("br"));
  parent.appendChild(p);
}

/**
 * 插入 RTE 代码块。光标若已在代码块内，继续用 `insertHTML` 会把新的 `pre` 插进当前 `code` 造成无限嵌套；
 * 此时在**最外层** `pre.rte-code-block` 之后插入兄弟块（脱离错误的 `pre>code>pre` 链），并把光标移入新块首行。
 *
 * @param editor - contenteditable 根
 */
function insertRteCodeBlockAtSelection(editor: HTMLElement): void {
  editor.focus({ preventScroll: true });
  const sel = document.getSelection();
  if (sel == null || sel.rangeCount < 1) return;

  const range = sel.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) return;

  const enclosing = findOutermostRteCodeBlockPre(
    editor,
    range.startContainer,
  );

  if (enclosing != null && enclosing.parentNode != null) {
    const wrap = document.createElement("div");
    wrap.innerHTML = RTE_CODE_BLOCK_INSERT_HTML;
    const newPre = wrap.firstElementChild;
    if (!(newPre instanceof HTMLPreElement)) return;
    enclosing.parentNode.insertBefore(newPre, enclosing.nextSibling);
    const code = newPre.querySelector("code");
    if (code != null) {
      const caret = document.createRange();
      caret.selectNodeContents(code);
      caret.collapse(true);
      sel.removeAllRanges();
      sel.addRange(caret);
    }
    rteEnsureParagraphAfterPreIfLast(newPre);
  } else if (typeof document.execCommand === "function") {
    document.execCommand("insertHTML", false, RTE_CODE_BLOCK_INSERT_HTML);
    if (sel.rangeCount > 0) {
      const after = findOutermostRteCodeBlockPre(
        editor,
        sel.getRangeAt(0).startContainer,
      );
      if (after != null) {
        rteEnsureParagraphAfterPreIfLast(after);
      }
    }
  }
}

/**
 * 为选区设置前景或背景色：若选区已在 {@link tryUpdateExistingRteColorSpan} 可识别的 `span` 内则只改 `style`；
 * 否则用 {@link rteSurroundRangeWithImportantStyle} 包一层；最后退回 `execCommand`。
 *
 * @param editor - contenteditable 根节点
 * @param savedRange - 打开取色器前克隆的选区；须仍挂在文档中且未折叠
 * @param cmd - `foreColor` 或 `backColor`
 * @param color - 颜色串，如 `#rrggbb`
 */
function applyRteForeOrBackColor(
  editor: HTMLElement,
  savedRange: Range | null,
  cmd: "foreColor" | "backColor",
  color: string,
): void {
  editor.focus({ preventScroll: true });
  /**
   * 必须先恢复选区再取 Range：`savedRange` 为打开取色器前的克隆，与当前文档选区可能脱节；
   * 内联粗体等改动后公共祖先也可能变化，仅用克隆会导致 `tryUpdate`/`surroundContents` 误判或失败。
   */
  restoreEditorSelectionRange(editor, savedRange);

  const sel = document.getSelection();
  let r: Range | null = null;
  if (sel && sel.rangeCount > 0) {
    const live = sel.getRangeAt(0);
    if (!live.collapsed && editor.contains(live.commonAncestorContainer)) {
      r = live.cloneRange();
    }
  }
  if (r == null && savedRange != null) {
    try {
      if (
        !savedRange.collapsed &&
        editor.contains(savedRange.commonAncestorContainer)
      ) {
        r = savedRange.cloneRange();
      }
    } catch {
      r = null;
    }
  }

  const styleKey = cmd === "foreColor" ? "color" : "backgroundColor";
  if (r != null && tryUpdateExistingRteColorSpan(editor, r, cmd, color)) {
    return;
  }
  if (r != null && rteSurroundRangeWithImportantStyle(r, styleKey, color)) {
    return;
  }
  restoreEditorSelectionRange(editor, savedRange);
  if (typeof document.execCommand === "function") {
    try {
      /** DOM 类型定义第三参为 `string`，浏览器对 `styleWithCSS` 接受 `"true"` */
      document.execCommand("styleWithCSS", false, "true");
    } catch {
      /* 忽略 */
    }
  }
  document.execCommand(cmd, false, color);
}

/**
 * 若选区完全落在带 `data-rte-font-size` 的 `span` 内，则只更新其 `font-size`，避免重复嵌套。
 *
 * @param editor - contenteditable 根
 * @param range - 当前选区（非折叠）
 * @param size - 如 `16px`
 * @returns 是否已就地更新并收起选区到该 `span` 末尾
 */
function tryUpdateExistingRteFontSizeSpan(
  editor: HTMLElement,
  range: Range,
  size: string,
): boolean {
  let n: Node | null = range.commonAncestorContainer;
  if (n.nodeType === Node.TEXT_NODE) n = n.parentNode;
  while (n != null && n !== editor) {
    if (n instanceof HTMLSpanElement && n.hasAttribute("data-rte-font-size")) {
      try {
        const spanRange = document.createRange();
        spanRange.selectNodeContents(n);
        const inside =
          range.compareBoundaryPoints(Range.START_TO_START, spanRange) >= 0 &&
          range.compareBoundaryPoints(Range.END_TO_END, spanRange) <= 0;
        if (inside) {
          n.style.setProperty("font-size", size, "important");
          rteCollapseSelectionToEndOfNode(n);
          return true;
        }
      } catch {
        /* 选区与 span 比较失败则继续向上找 */
      }
    }
    n = n.parentNode;
  }
  return false;
}

/**
 * 用带 `data-rte-font-size` 的 `span` 包裹非折叠选区；`surroundContents` 失败时退回 `extractContents`。
 *
 * @param range - 克隆后的选区
 * @param size - 如 `16px`
 * @returns 是否成功
 */
function rteSurroundRangeWithFontSize(range: Range, size: string): boolean {
  const span = document.createElement("span");
  span.style.setProperty("font-size", size, "important");
  span.setAttribute("data-rte-font-size", "");
  try {
    range.surroundContents(span);
  } catch {
    try {
      const frag = range.extractContents();
      span.appendChild(frag);
      range.insertNode(span);
    } catch {
      return false;
    }
  }
  rteCollapseSelectionToEndOfNode(span);
  return true;
}

/**
 * 折叠选区时在光标处插入零宽占位 + 字号 `span`，便于后续输入继承字号。
 *
 * @param size - 如 `16px`
 * @param range - 折叠选区
 * @returns 是否成功
 */
function rteInsertCollapsedFontSizeSpan(size: string, range: Range): boolean {
  try {
    const span = document.createElement("span");
    span.style.setProperty("font-size", size, "important");
    span.setAttribute("data-rte-font-size", "");
    const zw = document.createTextNode("\u200b");
    span.appendChild(zw);
    range.insertNode(span);
    const nr = document.createRange();
    nr.setStart(zw, 1);
    nr.collapse(true);
    const sel = document.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(nr);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * 为选区设置字号：`span` + `font-size !important` + `data-rte-font-size`（与字色包裹思路一致）。
 *
 * @param editor - contenteditable 根
 * @param size - 如 `16px`
 */
function applyRteFontSize(editor: HTMLElement, size: string): void {
  if (!size.trim()) return;
  editor.focus({ preventScroll: true });
  const sel = document.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const raw = sel.getRangeAt(0);
  if (!editor.contains(raw.commonAncestorContainer)) return;

  if (raw.collapsed) {
    rteInsertCollapsedFontSizeSpan(size, raw.cloneRange());
    return;
  }

  const r = raw.cloneRange();
  if (tryUpdateExistingRteFontSizeSpan(editor, r, size)) return;
  rteSurroundRangeWithFontSize(r, size);
}

/**
 * 自节点向上在编辑区内查找适合设置行高的块级容器。
 *
 * @param editor - contenteditable 根
 * @param node - 起点（常为选区锚点）
 */
function rteFindBlockForLineHeight(
  editor: HTMLElement,
  node: Node | null,
): HTMLElement | null {
  let n: Node | null = node;
  if (n?.nodeType === Node.TEXT_NODE) n = n.parentNode;
  while (n != null && n !== editor) {
    if (n instanceof HTMLElement) {
      const t = n.tagName.toLowerCase();
      if (
        t === "p" || t === "div" || t === "blockquote" || t === "li" ||
        t === "pre" || t === "td" || t === "th" || /^h[1-6]$/.test(t)
      ) {
        return n;
      }
    }
    n = n.parentNode;
  }
  return null;
}

/**
 * 为光标所在块设置 `line-height`（`!important`）；若无块则先 `formatBlock` 为 `p` 再尝试。
 *
 * @param editor - contenteditable 根
 * @param value - 如 `1.5`
 */
function applyRteLineHeight(editor: HTMLElement, value: string): void {
  if (!value.trim()) return;
  editor.focus({ preventScroll: true });
  const sel = document.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  let block = rteFindBlockForLineHeight(editor, sel.anchorNode);
  if (!block && typeof document.execCommand === "function") {
    try {
      document.execCommand("formatBlock", false, "p");
    } catch {
      /* 不支持则忽略 */
    }
    block = rteFindBlockForLineHeight(editor, sel.anchorNode);
  }
  if (block && editor.contains(block)) {
    block.style.setProperty("line-height", value, "important");
  }
}

/**
 * Chromium 系：将 Enter 新段默认由 `div` 改为 `p`（非标准命令，不支持时静默忽略）。
 */
function trySetDefaultParagraphSeparatorToP(): void {
  if (typeof document.execCommand !== "function") return;
  try {
    document.execCommand("defaultParagraphSeparator", false, "p");
  } catch {
    /* Safari 等可能不支持 */
  }
}

/**
 * 若编辑区根下以非空文本节点开头，将其包入 `p`，避免在空编辑器里直接输入时首段无块级标签。
 *
 * @param editor - contenteditable 根元素
 * @returns 是否修改过 DOM
 */
function wrapRteLeadingRootTextInParagraph(editor: HTMLDivElement): boolean {
  const first = editor.firstChild;
  if (!first || first.nodeType !== Node.TEXT_NODE) return false;
  const tn = first as Text;
  const raw = tn.textContent ?? "";
  if (raw === "") return false;
  const p = document.createElement("p");
  editor.removeChild(tn);
  p.appendChild(tn);
  editor.insertBefore(p, editor.firstChild);
  try {
    const sel = document.getSelection();
    if (sel && sel.anchorNode && editor.contains(sel.anchorNode)) {
      const range = document.createRange();
      range.selectNodeContents(p);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  } catch {
    /* 选区恢复失败则忽略 */
  }
  return true;
}

/**
 * 受控 `value` 重绘时是否禁止用 props 覆盖编辑区 `innerHTML`。
 * 焦点在组件根（工具栏、查找条、编辑区）内时覆盖会破坏「查找/替换」流程，且易与
 * {@link refreshHistoryNavState} 的焦点抖动叠加成问题。
 *
 * @param editorId - 编辑区元素 id（与根节点 `id` 为 `${editorId}-root` 对应）
 * @param editorEl - contenteditable 根节点
 */
function shouldSkipControlledInnerHtmlSync(
  editorId: string,
  editorEl: HTMLDivElement,
): boolean {
  const doc = globalThis.document;
  if (!doc) return false;
  if (isEditorActiveOrSelectionInside(editorEl)) return true;
  const root = doc.getElementById(`${editorId}-root`);
  const ae = doc.activeElement;
  if (root && ae instanceof Node && root.contains(ae)) return true;
  return false;
}

/**
 * 比较两段富文本 HTML 是否在「受控回写」语义下等价：忽略零宽符、`&nbsp;` 与普通空格差异及标签间空白折叠，
 * 避免浏览器序列化与父级回显字符串严格不等时误判需重写 `innerHTML`（进而重置光标）。
 *
 * @param a - 一段 HTML
 * @param b - 另一段 HTML
 * @returns 宽松相等时为 true
 */
function rteHtmlLooselyEquals(a: string, b: string): boolean {
  if (a === b) return true;
  const norm = (s: string) =>
    s.replace(/\uFEFF/g, "").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ");
  return norm(a) === norm(b);
}

/** 工具栏内 SVG 统一尺寸 class */
const rteToolbarSvgCls = "size-4 shrink-0";

/**
 * 渲染工具栏按钮内容：预设项用 currentColor 线框 SVG，避免彩色 emoji；未知项回退到 `icon` 或 `key` 文本。
 *
 * @param item - 工具栏配置项
 * @param options - 运行时状态；`rteFullscreen` 为 true 时 `fullscreen` 项显示「退出全屏」图标
 */
function renderToolbarButtonContent(
  item: ToolbarItem,
  options?: { rteFullscreen?: boolean },
) {
  switch (item.key) {
    /**
     * 插入链接：原双弧线路径在 16px 下易糊成「一团」；改用与 `IconLink2`（Link2.tsx）
     * 相同的链环造型，小工具栏上更易辨认。
     */
    case "link":
      return (
        <svg
          class={rteToolbarSvgCls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 17H7A5 5 0 0 1 7 7h2"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 7h2a5 5 0 1 1 0 10h-2"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12h8"
          />
        </svg>
      );
    case "blockquote":
      return (
        <svg
          class={rteToolbarSvgCls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-width="2"
            d="M8 6v12M8 8h6a2 2 0 012 2v2a2 2 0 01-2 2H8"
          />
        </svg>
      );
    case "insertImage":
      return (
        <svg
          class={rteToolbarSvgCls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="2"
            fill="none"
            stroke-width="2"
          />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 15l-5-5L5 21"
          />
        </svg>
      );
    case "uploadImage":
      return (
        <svg
          class={rteToolbarSvgCls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5 5 5M12 5v12"
          />
        </svg>
      );
    case "backColor":
      return (
        <svg
          class={rteToolbarSvgCls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 20h16M6 16l6-12 4 4-6 8"
          />
        </svg>
      );
    case "find":
      return (
        <svg
          class={rteToolbarSvgCls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      );
    case "replace":
      return (
        <svg
          class={rteToolbarSvgCls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 7h12M4 7l3-3m-3 3l3 3M20 17H8m12 0l-3 3m3-3l-3-3"
          />
        </svg>
      );
    case "print":
      return (
        <svg
          class={rteToolbarSvgCls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 9V5h12v4M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z"
          />
        </svg>
      );
    case "export":
      return (
        <svg
          class={rteToolbarSvgCls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V4"
          />
        </svg>
      );
    /** 左对齐：与 `IconAlignLeft`（AlignLeft.tsx）路径一致 */
    case "justifyLeft":
      return (
        <svg
          class={rteToolbarSvgCls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h10M4 18h14"
          />
        </svg>
      );
    /** 居中对齐：与 `IconAlignCenter`（AlignCenter.tsx）路径一致 */
    case "justifyCenter":
      return (
        <svg
          class={rteToolbarSvgCls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M7 12h10M5 18h14"
          />
        </svg>
      );
    /** 右对齐：与 `IconAlignRight`（AlignRight.tsx）路径一致 */
    case "justifyRight":
      return (
        <svg
          class={rteToolbarSvgCls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M10 12h10M6 18h14"
          />
        </svg>
      );
    /**
     * 删除线：配置里 `S̲` 为文本组合字符，下划线受字距影响易偏右；
     * 使用与 Lucide「Strikethrough」一致的路径（横线贯穿 S 形中部、几何居中）。
     */
    case "strike":
      return (
        <svg
          class={rteToolbarSvgCls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 4H9a3 3 0 0 0-2.83 4"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M14 12a4 4 0 0 1 0 8H6"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 12h16"
          />
        </svg>
      );
    /**
     * HTML 源码切换：尖括号 + 斜杠，与「行内代码」的 `</>` 文本配置区分图形。
     */
    case "sourceHtml":
      return (
        <svg
          class={rteToolbarSvgCls}
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
    /**
     * 全屏：未全屏时与 `IconMaximize2` 同形；全屏后与 `IconExitFullscreen` 同形（四角向内）。
     */
    case "fullscreen":
      if (options?.rteFullscreen) {
        return (
          <svg
            class={rteToolbarSvgCls}
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
          class={rteToolbarSvgCls}
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
    default:
      return (
        <span class="inline-flex min-w-5 items-center justify-center leading-none">
          {item.icon ?? item.key}
        </span>
      );
  }
}

export interface RichTextEditorProps {
  /** 当前内容（HTML 字符串）；见 {@link MaybeSignal} */
  value?: MaybeSignal<string>;
  /** 内容变化回调（输出 HTML） */
  onChange?: (html: string) => void;
  /** 工具栏丰富程度：simple / default / full；与 toolbar 二选一 */
  toolbarPreset?: ToolbarPreset;
  /** 自定义工具栏（覆盖 toolbarPreset）；二维数组为分组 */
  toolbar?: ToolbarConfig;
  /** 占位文案 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读（仅展示） */
  readOnly?: boolean;
  /** 编辑区最小高度（如 "200px"、"10rem"） */
  minHeight?: string;
  /** 额外 class（作用于最外层容器） */
  class?: string;
  /** 原生 name（会同步到隐藏 input 便于表单提交） */
  name?: string;
  /** 原生 id（编辑区与隐藏 input 会使用） */
  id?: string;
  /** 插入图片 URL 时由调用方提供（如弹窗输入）；若返回 string 则插入，否则不插入 */
  onInsertImage?: () => Promise<string> | string;
  /** 上传图片：选择文件后调用，返回图片 URL 后插入；不传则转为 data URL 插入 */
  onUploadImage?: (file: File) => Promise<string> | string;
  /** 粘贴图片时：不传则用 data URL 插入；传则经此处理（如上传）后插入返回的 URL */
  onPasteImage?: (blob: Blob) => Promise<string> | string;
  /** 为 true 时隐藏编辑区、工具栏与查找条控件的聚焦激活态边框；默认 false 显示 */
  hideFocusRing?: boolean;
}

const toolbarWrapCls =
  "flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50";
const toolbarGroupCls =
  "flex items-center gap-0.5 border-r border-slate-200 dark:border-slate-600 pr-1 last:border-r-0 last:pr-0";
/** 工具栏按钮底纹（不含聚焦 ring，由 {@link controlBlueFocusRing} 控制） */
const toolbarBtnBase =
  "inline-flex items-center justify-center p-1.5 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed min-w-[28px] min-h-[28px] text-sm font-medium";

/**
 * 整表禁用或源码模式下（除「源码切换」外）下拉不可用；段落下拉外层 `div` 无 `disabled`，须单独套灰度与弱色字。
 *
 * @param rteSource - 当前是否 HTML 源码模式
 * @param editorDisabled - `RichTextEditor` 的 `disabled`
 * @param item - 工具项
 */
function rteToolbarDropdownDisabled(
  rteSource: boolean,
  editorDisabled: boolean,
  item: ToolbarItem,
): boolean {
  return editorDisabled ||
    (rteSource && item.command !== "rteToggleSourceHtml");
}

/** 撤销/重做在「可用」时的强调色（相对默认工具栏灰字加亮） */
const toolbarHistoryActiveCls =
  "text-slate-900 dark:text-slate-100 font-semibold";
/** 撤销/重做在「当前不可用」时的弱化色（暗色背景下 slate-600 + disabled:opacity-50 会几乎看不见，故提亮并减轻 disabled 叠暗） */
const toolbarHistoryMutedCls =
  "text-slate-500 dark:text-slate-400 disabled:opacity-80";

/**
 * 工具栏内原生 `<select>`：默认宽度往往等于**最宽 option**，短标签（如「正文」「空格」）右侧会空一大块；
 * `field-sizing: content` 按**当前选中项**收缩宽度（Chrome 123+、Safari 17.4+、Firefox 等，旧浏览器回退为较宽）。
 * 右侧 `padding` 在具体 `select` 上与 `appearance-none` 配合，略小于旧版 `pr-5` 以收紧「正文 / 空格」等短标签右侧空白。
 * 段落下拉外层勿对子级 select 使用 `flex-1`，否则会强行撑满父级。
 */
const rteToolbarSelectFitCls =
  "text-left [field-sizing:content] w-max min-w-0 max-w-[min(100%,14rem)]";

/** 快捷键说明（工具栏「快捷键」与 {@link RTE_AUX_SHORTCUTS} Modal 共用） */
const RTE_SHORTCUTS_HELP_TEXT =
  "快捷键：\nCtrl+Z 撤销\nCtrl+Y 重做\nCtrl+B 加粗\nCtrl+I 斜体\nCtrl+U 下划线\nCtrl+K 插入链接\nCtrl+F 查找\n工具栏「编辑源码」可切换 HTML 源码与可视化";

/**
 * 无表头表格 HTML（与历史 `insertTable` 行内样式一致）。
 *
 * @param rows - 行数
 * @param cols - 列数
 */
function buildRtePlainTableHtml(rows: number, cols: number): string {
  const tableStyles = "border-collapse:collapse;width:100%;table-layout:fixed";
  const cellStyles = "border:1px solid #cbd5e1;padding:6px 8px;min-width:60px;";
  let html = `<table style="${tableStyles}" class="rte-table"><tbody>`;
  for (let r = 0; r < rows; r++) {
    html += "<tr>";
    for (let c = 0; c < cols; c++) {
      html += `<td style="${cellStyles}">&nbsp;</td>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table>";
  return html;
}

/**
 * 含表头表格 HTML（与历史 `insertTableWithHeader` 一致）。
 *
 * @param rows - 行数（含表头）
 * @param cols - 列数
 */
function buildRteHeaderTableHtml(rows: number, cols: number): string {
  const tableStyles = "border-collapse:collapse;width:100%;table-layout:fixed";
  const cellStyles = "border:1px solid #cbd5e1;padding:6px 8px;min-width:60px;";
  const thStyles = cellStyles +
    ";font-weight:600;background:rgb(241 245 249);";
  let html = `<table style="${tableStyles}" class="rte-table"><thead><tr>`;
  for (let c = 0; c < cols; c++) {
    html += `<th style="${thStyles}">&nbsp;</th>`;
  }
  html += "</tr></thead><tbody>";
  for (let r = 1; r < rows; r++) {
    html += "<tr>";
    for (let c = 0; c < cols; c++) {
      html += `<td style="${cellStyles}">&nbsp;</td>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table>";
  return html;
}

/**
 * 根据 {@link ToolbarItem} 与浏览器撤销栈状态，生成工具栏按钮 class（撤销/重做单独高亮/置灰）。
 *
 * @param item - 工具项
 * @param nav - 是否可撤销 / 可重做
 * @param editorDisabled - 整表禁用
 * @param showFocusRing - 是否显示聚焦 ring
 * @returns 合并后的 Tailwind class
 */
function toolbarButtonClassForItem(
  item: ToolbarItem,
  nav: { canUndo: boolean; canRedo: boolean },
  editorDisabled: boolean,
  showFocusRing: boolean,
): string {
  const ring = controlBlueFocusRing(showFocusRing);
  if (item.command === "undo") {
    const active = !editorDisabled && nav.canUndo;
    return twMerge(
      toolbarBtnBase,
      ring,
      active ? toolbarHistoryActiveCls : toolbarHistoryMutedCls,
    );
  }
  if (item.command === "redo") {
    const active = !editorDisabled && nav.canRedo;
    return twMerge(
      toolbarBtnBase,
      ring,
      active ? toolbarHistoryActiveCls : toolbarHistoryMutedCls,
    );
  }
  return twMerge(toolbarBtnBase, ring);
}

/**
 * 是否禁用撤销/重做按钮（无栈时点击无意义，与置灰样式一致）。
 *
 * @param item - 工具项
 * @param nav - 是否可撤销 / 可重做
 * @param editorDisabled - 整表禁用
 */
function isHistoryToolbarDisabled(
  item: ToolbarItem,
  nav: { canUndo: boolean; canRedo: boolean },
  editorDisabled: boolean,
): boolean {
  if (editorDisabled) return true;
  if (item.command === "undo") return !nav.canUndo;
  if (item.command === "redo") return !nav.canRedo;
  return false;
}

/**
 * 可编辑区底纹（聚焦高亮由根节点 `has-[[data-rte-editor]:focus]` 改边框色，此处聚焦时 `border-transparent` 避免与根双线）。
 */
const editorSurface =
  "w-full min-h-[120px] px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-t-0 border-slate-300 dark:border-slate-600 focus:outline-none overflow-auto [&_p]:mb-2 [&_p]:mt-0 [&_p:last-child]:mb-0 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:text-base [&_h4]:font-semibold [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_pre]:bg-slate-100 [&_pre]:dark:bg-slate-700 [&_pre]:p-2 [&_pre]:rounded [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_table]:border-collapse [&_table]:w-full [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-100 [&_th]:dark:bg-slate-700 [&_th]:p-2 [&_td]:border [&_td]:border-slate-300 [&_td]:p-2";

/** 查找条内小型文本框底纹（不含 ring） */
const findBarInputSurface =
  "px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-800 focus:outline-none";
const editorReadOnlyCls = "cursor-default bg-slate-50 dark:bg-slate-800/80";

export function RichTextEditor(props: RichTextEditorProps): JSX.Element {
  const {
    value = "",
    onChange,
    toolbarPreset = "default",
    toolbar: customToolbar,
    placeholder = "输入内容…",
    disabled = false,
    readOnly = false,
    minHeight = "200px",
    class: className,
    name,
    id,
    onInsertImage,
    onUploadImage,
    onPasteImage,
    hideFocusRing = false,
  } = props;

  const toolbarGroups = customToolbar
    ? normalizeToolbarConfig(customToolbar)
    : getToolbarByPreset(toolbarPreset);

  /**
   * {@link refreshHistoryNavState} 会临时 focus 编辑区以调用 queryCommandEnabled；
   * 若同步触发编辑区 onFocus 再 queueMicrotask(refresh)，会与「焦点在查找条」等场景形成无限微任务链导致页面卡死。
   */
  let suppressEditorFocusHistoryRefresh = false;

  const editorId = id ?? `rte-${Math.random().toString(36).slice(2, 9)}`;
  const uploadInputId = `${editorId}-upload`;

  /**
   * 工具栏撤销/重做是否可点；与 {@link refreshHistoryNavState} 同步。
   * 撤销：**不**依赖 `queryCommandEnabled("undo")`（多环境下恒为 false），改为当前 innerHTML 是否与
   * {@link lastSyncedFromPropsHtml} 不同。重做：`queryCommandEnabled("redo")` 与「刚执行过撤销」标志合取。
   */
  const historyNavState = signal({
    canUndo: false,
    canRedo: false,
  });

  /**
   * 最近一次由受控 `value` 写入编辑区的 HTML（首次 effect 时初始化），作撤销对照基准。
   */
  let lastSyncedFromPropsHtml: string | null = null;

  /**
   * 用户通过工具栏或 Ctrl+Z 执行过撤销后为 true，用于在 `queryCommandEnabled("redo")` 不可靠时仍点亮重做。
   * 新输入、外部改写 innerHTML、执行重做后置 false（或由 finally 在非 undo/redo 工具操作时清除）。
   */
  let rteRedoEligibleAfterUndo = false;

  /**
   * 焦点在 contenteditable 编辑区上时为 true。为 true 时禁止用受控 `value` 写 `innerHTML`，否则浏览器会重置选区
   * （光标跳行首、首字倒序等）。由编辑区 `onFocus`/`onBlur` 维护；比仅靠 `document.activeElement` 可靠。
   */
  let rteEditorHasFocus = false;
  /**
   * 从源码切回可视后、`queueMicrotask` 里 `focus` 执行前，受控 `value` 往往尚未随 {@link emitChange} 更新；
   * `effect` 若此时用旧 `value`（如空串）写 `innerHTML` 会清空刚写入的正文。为 true 时跳过 props→innerHTML。
   */
  let rteBlockPropsInnerHtmlAfterSourceExit = false;

  /**
   * 防止 {@link refreshHistoryNavState} 重入（onFocus / microtask / signal 连锁时同步再入会导致栈溢出或页面卡死）。
   */
  let insideRefreshHistoryNav = false;

  /**
   * 根节点是否处于 `rte-fullscreen`，与全屏按钮的图标、`title` / `aria-label` 同步。
   */
  const rteFullscreen = signal(false);
  /**
   * 为 true 时主区域显示 HTML 源码 `<textarea>`，与 {@link rteSourceHtml} 同步；为 false 时为 contenteditable 可视化编辑。
   */
  const rteSourceMode = signal(false);
  /**
   * 源码模式下的 HTML 字符串；进入源码时从编辑区 `innerHTML` 拷贝，编辑中经 `onInput` 与父级 `onChange` 同步。
   */
  const rteSourceHtml = signal("");

  /**
   * 仅在 canUndo/canRedo 与当前 signal 不同时写入。
   * `signal` 对对象用 `Object.is`：每次 `value = { canUndo, canRedo }` 都是新引用，即使用户未操作也会触发订阅 →
   * 重渲染 → ref 再 `queueMicrotask(refresh)`，形成更新风暴导致页面极卡。
   *
   * @param next - 浏览器查询得到的下一状态
   */
  const setHistoryNavIfChanged = (next: {
    canUndo: boolean;
    canRedo: boolean;
  }) => {
    const prev = historyNavState.value;
    if (prev.canUndo === next.canUndo && prev.canRedo === next.canRedo) {
      return;
    }
    historyNavState.value = next;
  };

  /**
   * 根据当前 DOM 与受控基准更新撤销/重做按钮态；仅对 **redo** 查询 `queryCommandEnabled`（需焦点时短暂 focus 编辑区）。
   */
  const refreshHistoryNavState = () => {
    if (typeof document === "undefined") return;
    if (insideRefreshHistoryNav) return;
    insideRefreshHistoryNav = true;
    try {
      const editor = document.getElementById(editorId) as HTMLDivElement | null;
      if (!editor?.isConnected) return;
      /** 基准未建立前不做比较，避免误亮撤销 */
      if (lastSyncedFromPropsHtml === null) {
        setHistoryNavIfChanged({ canUndo: false, canRedo: false });
        return;
      }

      const baseline = lastSyncedFromPropsHtml;
      /**
       * 源码模式：用 {@link rteSourceHtml} 比基准判断撤销；不重试 `queryCommandEnabled(redo)`（避免为查 redo 抢焦点离开 `<textarea>`）。
       */
      if (rteSourceMode.value) {
        const srcHtml = rteSourceHtml.value;
        const canUndo = baseline === ""
          ? srcHtml.replace(/\uFEFF/g, "").trim() !== ""
          : srcHtml !== baseline;
        setHistoryNavIfChanged({ canUndo, canRedo: false });
        return;
      }

      const currentHtml = editor.innerHTML;
      /**
       * 非空基准时用 {@link rteHtmlLooselyEquals}：浏览器序列化的 innerHTML 与受控字符串常有空白/`&nbsp;` 差异，
       * 严格 `!==` 会在「已有实质编辑」时仍判相等 → 撤销永灰。
       */
      const canUndo = baseline === ""
        ? currentHtml.replace(/\uFEFF/g, "").trim() !== ""
        : !rteHtmlLooselyEquals(currentHtml, baseline);

      let qRedo = false;
      if (typeof document.queryCommandEnabled === "function") {
        const doc = globalThis.document;
        const prevActive = doc.activeElement;
        const root = doc.getElementById(`${editorId}-root`);
        /**
         * 焦点在编辑区 **或** 组件根内（工具栏、查找条等）时，不得为查 redo 去 `editor.focus()`：
         * 否则 `onBlur` 里排的微任务会再把焦点抢回编辑区，与 `onFocus`/受控更新形成高频震荡，页面直接卡死。
         * 仅当 {@link rteEditorHasFocus} 仍为 true 且焦点已跑出整棵 RTE 外时，才短暂抢焦点查询（极少见）。
         */
        const focusInsideRteChrome = prevActive === editor ||
          (root != null &&
            prevActive instanceof Node &&
            root.contains(prevActive));
        const needStealFocus = rteEditorHasFocus && !focusInsideRteChrome;
        if (needStealFocus) {
          suppressEditorFocusHistoryRefresh = true;
          try {
            editor.focus({ preventScroll: true });
          } finally {
            suppressEditorFocusHistoryRefresh = false;
          }
        }
        try {
          qRedo = document.queryCommandEnabled("redo");
        } catch {
          qRedo = false;
        }
        if (needStealFocus && prevActive instanceof HTMLElement) {
          prevActive.focus({ preventScroll: true });
        }
      }

      const canRedo = qRedo || rteRedoEligibleAfterUndo;
      setHistoryNavIfChanged({ canUndo, canRedo });
    } finally {
      insideRefreshHistoryNav = false;
    }
  };

  /** 编辑区根节点；模板里只写 `ref={editorHostRef}`，不在 ref 里塞同步逻辑。 */
  const editorHostRef = useRef<HTMLDivElement>(null);

  const insertImageUrl = (url: string) => {
    const editor = document.getElementById(editorId) as HTMLDivElement | null;
    if (editor) {
      editor.focus();
      document.execCommand("insertImage", false, url);
      rteRedoEligibleAfterUndo = false;
      emitChange();
      queueMicrotask(() => refreshHistoryNavState());
    }
  };

  const handleToolbarAction = (
    item: ToolbarItem,
    childValue?: string,
    /** 工具栏点击时传入，用于在指针旁打开取色面板 */
    fromPointer?: MouseEvent,
  ) => {
    if (disabled || readOnly) return;
    /** 须在 try 外声明，供 finally 判断是否为撤销/重做（块内 const 在 finally 不可见） */
    const cmd = item.command;
    /** 源码模式下仅允许「源码/可视化」切换，避免对隐藏 contenteditable 执行无效命令 */
    if (rteSourceMode.value && cmd !== "rteToggleSourceHtml") return;
    const editor = document.getElementById(editorId) as HTMLDivElement | null;
    if (!editor) return;
    const val = childValue ?? item.value ?? "";

    /**
     * 可视化 ↔ HTML 源码：切到源码时快照 `innerHTML`；切回时写回并触发 {@link emitChange}。
     */
    if (cmd === "rteToggleSourceHtml") {
      if (rteSourceMode.value) {
        /**
         * 以 `<textarea>` 的 **DOM 值**为准：部分 reconciler 下 `onInput` 与 signal 可能不同步，仅用 `rteSourceHtml` 会读到旧串；
         * 且 `rteSourceMode` 置 false 后子树可能先提交 DOM，须在微任务里对 **当前** `getElementById(editorId)` 写 `innerHTML`，
         * 勿依赖本函数开头缓存的 `editor` 引用（可能是即将被替换的节点）。
         */
        const ta = document.getElementById(`${editorId}-source`) as
          | HTMLTextAreaElement
          | null;
        const html = ta != null ? ta.value : rteSourceHtml.value;
        rteSourceHtml.value = html;
        lastSyncedFromPropsHtml = html;
        rteRedoEligibleAfterUndo = false;
        /**
         * 先拦 props 同步再关源码模式：否则 effect 与 `emitChange` 同一轮里用滞后 `value` 覆盖可视区 `innerHTML`。
         */
        rteBlockPropsInnerHtmlAfterSourceExit = true;
        rteSourceMode.value = false;
        emitChange(html);
        /**
         * 双层微任务：等 {@link RteEditorBodyReactiveIsland} 等对 `rteSourceMode` 的 DOM 更新落盘后再写 `innerHTML` 与 `focus`。
         */
        queueMicrotask(() => {
          queueMicrotask(() => {
            const ed = document.getElementById(editorId) as
              | HTMLDivElement
              | null;
            if (ed) {
              ed.innerHTML = html;
            }
            lastSyncedFromPropsHtml = html;
            rteEditorHasFocus = true;
            rteBlockPropsInnerHtmlAfterSourceExit = false;
            ed?.focus({ preventScroll: true });
            refreshHistoryNavState();
          });
        });
      } else {
        rteSourceHtml.value = rtePrettyPrintHtmlSource(editor.innerHTML);
        rteRedoEligibleAfterUndo = false;
        rteSourceMode.value = true;
        queueMicrotask(() => {
          const ta = document.getElementById(`${editorId}-source`) as
            | HTMLTextAreaElement
            | null;
          ta?.focus({ preventScroll: true });
          refreshHistoryNavState();
        });
      }
      return;
    }

    try {
      editor.focus();

      if (cmd === "createLink") {
        openLinkUrlModal();
        return;
      }
      if (cmd === "insertImage") {
        if (onInsertImage) {
          Promise.resolve(onInsertImage()).then((url) => {
            if (url) insertImageUrl(url);
          });
        } else {
          rteAuxDraft1.value = "";
          rteAuxKind.value = "imageUrl";
        }
        return;
      }
      if (cmd === "uploadImage") {
        const input = document.getElementById(uploadInputId) as
          | HTMLInputElement
          | null;
        if (input) {
          input.value = "";
          input.click();
        }
        return;
      }
      if (cmd === "insertTable") {
        rteAuxDraft1.value = "3";
        rteAuxDraft2.value = "3";
        rteAuxKind.value = "tablePlain";
        return;
      }
      /** 字号：自定义 DOM 包裹，不经过 `execCommand` */
      if (cmd === "rteFontSize" && val) {
        applyRteFontSize(editor, val);
        emitChange();
        queueMicrotask(() => refreshHistoryNavState());
        return;
      }
      /** 行高：作用于当前块级节点 */
      if (cmd === "rteLineHeight" && val) {
        applyRteLineHeight(editor, val);
        emitChange();
        queueMicrotask(() => refreshHistoryNavState());
        return;
      }
      if (cmd === "foreColor" || cmd === "backColor") {
        rteAuxColorCmd = cmd;
        rteAuxDraft1.value = val || "#333333";
        /**
         * `click` 触发时选区常已在 `mousedown` 中丢失；优先使用工具栏 {@link onMouseDownCapture} 里已存的克隆。
         * 无（如键盘触发）时再尝试当前文档选区。
         */
        if (rteSavedColorSelectionRange == null) {
          rteSavedColorSelectionRange = cloneEditorSelectionRangeIfInside(
            editor,
          );
        }
        const pe = fromPointer ?? rteColorPickerAnchorFallback();
        rteColorPickerRef.current?.openFromPointerEvent(pe);
        return;
      }
      if (cmd === "insertHorizontalRule") {
        document.execCommand("insertHorizontalRule", false);
        emitChange();
        return;
      }
      if (cmd === "insertSpecialChar" && childValue != null) {
        const toInsert = childValue.startsWith("&") ? childValue : childValue;
        document.execCommand("insertHTML", false, toInsert);
        emitChange();
        return;
      }
      if (cmd === "insertTableWithHeader") {
        rteAuxDraft1.value = "4";
        rteAuxDraft2.value = "3";
        rteAuxKind.value = "tableHeader";
        return;
      }
      if (cmd === "superscript" || cmd === "subscript") {
        document.execCommand(cmd, false);
        emitChange();
        return;
      }
      if (cmd === "indentFirstLine") {
        document.execCommand("formatBlock", false, "p");
        const sel = document.getSelection();
        if (sel && sel.anchorNode) {
          const block = sel.anchorNode.nodeType === 3
            ? sel.anchorNode.parentElement
            : sel.anchorNode as Element;
          const p = block?.closest?.("p");
          if (p && !p.style.textIndent) p.style.textIndent = "2em";
        }
        emitChange();
        return;
      }
      if (cmd === "fullscreen") {
        const root = document.getElementById(`${editorId}-root`);
        if (root) {
          root.classList.toggle("rte-fullscreen");
          /** 切换后同步 signal，工具栏重绘为「退出全屏」图标与文案 */
          rteFullscreen.value = root.classList.contains("rte-fullscreen");
        }
        return;
      }
      if (cmd === "find") {
        const bar = document.getElementById(`${editorId}-findbar`);
        if (bar) bar.classList.toggle("rte-findbar-hidden");
        return;
      }
      if (cmd === "replace") {
        const bar = document.getElementById(`${editorId}-findbar`);
        if (bar) {
          bar.classList.remove("rte-findbar-hidden");
          const replaceInput = bar.querySelector("[data-replace-input]") as
            | HTMLInputElement
            | null;
          if (replaceInput) replaceInput.focus();
        }
        return;
      }
      if (cmd === "print") {
        const html = getEditorHtml();
        const win = globalThis.open("", "_blank");
        if (win) {
          win.document.write(
            `<!DOCTYPE html><html><head><meta charset="utf-8"><title>打印</title></head><body>${html}</body></html>`,
          );
          win.document.close();
          win.focus();
          win.print();
          win.close();
        }
        return;
      }
      if (cmd === "exportContent") {
        rteAuxKind.value = "export";
        return;
      }
      if (cmd === "shortcuts") {
        rteAuxMessage.value = RTE_SHORTCUTS_HELP_TEXT;
        rteAuxKind.value = "shortcuts";
        return;
      }
      if (cmd === "insertCodeBlock") {
        insertRteCodeBlockAtSelection(editor);
        emitChange();
        return;
      }
      if (cmd === "undo") {
        document.execCommand("undo", false);
        rteRedoEligibleAfterUndo = true;
        emitChange();
        return;
      }
      if (cmd === "redo") {
        document.execCommand("redo", false);
        rteRedoEligibleAfterUndo = false;
        emitChange();
        return;
      }
      if (cmd === "removeFormat") {
        document.execCommand(cmd, false);
        emitChange();
        return;
      }
      if (cmd === "bold" || cmd === "italic" || cmd === "underline") {
        const kind: RteInlineDecoKind = cmd === "bold"
          ? "bold"
          : cmd === "italic"
          ? "italic"
          : "underline";
        if (applyRteInlineDecoration(editor, kind)) {
          emitChange();
          return;
        }
      }

      document.execCommand(cmd, false, val);
      emitChange();
    } finally {
      /** 除撤销/重做外任意工具操作都会清空浏览器重做栈语义，同步熄灭本地重做门闸 */
      if (cmd !== "undo" && cmd !== "redo") {
        rteRedoEligibleAfterUndo = false;
      }
      queueMicrotask(() => refreshHistoryNavState());
    }
  };

  const handleInput = (e: Event) => {
    const el = e.currentTarget as HTMLDivElement;
    wrapRteLeadingRootTextInParagraph(el);
    rteRedoEligibleAfterUndo = false;
    emitChange(el.innerHTML);
    /** 同步刷新工具栏撤销态，避免仅依赖微任务时与当前帧 reconciler 顺序不一致导致仍显示 disabled */
    refreshHistoryNavState();
    queueMicrotask(() => refreshHistoryNavState());
  };

  const getEditorHtml = () => {
    const editor = document.getElementById(editorId) as HTMLDivElement | null;
    return editor?.innerHTML ?? "";
  };

  /** 通知父组件并同步 hidden input（因 value 用 `untracked` 不随 signal 更新，需在每次变更时手动写回） */
  const emitChange = (html?: string) => {
    /**
     * 撤销对照基准仍为 null 时，在 `commitMaybeSignal` **之前**读取受控值（{@link readMaybeSignal}）作为「上一拍」快照。
     * 否则仅依赖 effect/onFocus 初始化时，在 ref 晚就绪、焦点事件未送达等情况下 {@link lastSyncedFromPropsHtml} 会一直为 null，
     * {@link refreshHistoryNavState} 恒关撤销；或误把「已编辑后」的 DOM 当基准。
     */
    if (lastSyncedFromPropsHtml === null) {
      const prior = readMaybeSignal(props.value);
      lastSyncedFromPropsHtml = prior === undefined ? "" : prior;
    }
    const h = html ?? getEditorHtml();
    commitMaybeSignal(props.value, h);
    onChange?.(h);
    if (name != null) {
      const el = document.getElementById(`${editorId}-hidden`) as
        | HTMLInputElement
        | null;
      if (el) el.value = h;
    }
  };

  /** 插入链接弹层开关；{@link Modal} 经下方 JSX 中 {@link createPortal} 挂到 `body`。 */
  const linkModalOpen = signal(false);
  const linkUrlDraft = signal("");

  /**
   * 除「插入链接」外的工具栏输入/确认弹层类型（{@link Modal} + Portal，替代原生 prompt/confirm/alert）。
   */
  type RteAuxModalKind =
    | "none"
    | "imageUrl"
    | "tablePlain"
    | "tableHeader"
    | "export"
    | "shortcuts"
    | "info";

  const rteAuxKind = signal<RteAuxModalKind>("none");
  const rteAuxDraft1 = signal("");
  const rteAuxDraft2 = signal("");
  const rteAuxMessage = signal("");
  /** 取色面板「确定」时使用的 `document.execCommand` 子命令 */
  let rteAuxColorCmd: "foreColor" | "backColor" = "foreColor";
  /**
   * 工具栏 `mousedown` 捕获阶段克隆的选区；`onApply` 里交给 {@link applyRteForeOrBackColor} 上色。
   */
  let rteSavedColorSelectionRange: Range | null = null;
  /**
   * 打开「插入链接」弹层前克隆的选区；确定时用 {@link rteApplyLinkUrl} 恢复后再 `createLink`，避免焦点进 Modal 后选区丢失而把 URL 插成可见正文。
   */
  let rteSavedLinkSelectionRange: Range | null = null;
  /**
   * 原生 `<select>` 抢走焦点前在捕获阶段保存的选区；`change` 时先 {@link restoreEditorSelectionRange} 再执行命令，
   * 否则段落/字号/行高等下拉无法在「有选中文本」时生效。
   */
  let rteSavedToolbarSelectRange: Range | null = null;
  /**
   * 工具栏原生下拉 `change`：先恢复 `mousedown` 捕获阶段保存的选区，再执行命令（否则焦点在 `select` 上时编辑区选区已丢失）。
   *
   * @param item - 对应工具栏项
   * @param e - `<select>` 的 `change` 事件
   */
  const handleToolbarSelectChange = (item: ToolbarItem, e: Event) => {
    const v = (e.target as HTMLSelectElement).value;
    const ed = document.getElementById(editorId) as HTMLDivElement | null;
    if (ed != null && rteSavedToolbarSelectRange != null) {
      restoreEditorSelectionRange(ed, rteSavedToolbarSelectRange);
      rteSavedToolbarSelectRange = null;
    }
    handleToolbarAction(item, v);
  };
  /** 无指针事件时（如下拉 `change`）用于定位取色面板的命令式引用 */
  const rteColorPickerRef: { current: ColorPickerHandle | null } = {
    current: null,
  };
  /**
   * 取色面板是否打开；为 true 时与链接 Modal 一样禁止用滞后的受控 `value` 写编辑区 `innerHTML`。
   */
  const rteColorPickerOpen = signal(false);

  /**
   * 在编辑区上方附近取一点视口坐标，供 {@link ColorPickerHandle.openFromPointerEvent} 在无 `MouseEvent` 时使用。
   *
   * @returns 含 `clientX` / `clientY` 的对象
   */
  const rteColorPickerAnchorFallback = (): Pick<
    PointerEvent,
    "clientX" | "clientY"
  > => {
    const ed = document.getElementById(editorId) as HTMLElement | null;
    if (ed) {
      const r = ed.getBoundingClientRect();
      return {
        clientX: Math.round(r.left + Math.min(160, r.width / 2)),
        clientY: Math.round(r.top + 48),
      };
    }
    return { clientX: 200, clientY: 120 };
  };

  /**
   * 关闭通用工具栏弹层。
   */
  const closeRteAuxModal = () => {
    rteAuxKind.value = "none";
  };

  /**
   * 打开纯文案提示弹层（如查找无结果）。
   *
   * @param message - 正文
   */
  const openRteAuxInfo = (message: string) => {
    rteAuxMessage.value = message;
    rteAuxKind.value = "info";
  };

  /**
   * 任意富文本弹层或取色面板打开时禁止受控 `innerHTML` 回写（与 {@link linkModalOpen} 同因）。
   */
  const rteAnyOverlayOpen = () =>
    linkModalOpen.value ||
    rteAuxKind.value !== "none" ||
    rteColorPickerOpen.value;

  /**
   * 确认插入图片 URL（无 `onInsertImage` 时由 Modal 收集）。
   */
  const confirmRteAuxImageUrl = () => {
    const url = rteAuxDraft1.value.trim();
    closeRteAuxModal();
    if (url) insertImageUrl(url);
  };

  /**
   * 确认插入无表头表格。
   */
  const confirmRteAuxTablePlain = () => {
    const rows = Math.max(
      1,
      Math.min(20, parseInt(rteAuxDraft1.value, 10) || 3),
    );
    const cols = Math.max(
      1,
      Math.min(10, parseInt(rteAuxDraft2.value, 10) || 3),
    );
    closeRteAuxModal();
    const ed = document.getElementById(editorId) as HTMLDivElement | null;
    if (!ed) return;
    ed.focus();
    rteRedoEligibleAfterUndo = false;
    document.execCommand(
      "insertHTML",
      false,
      buildRtePlainTableHtml(rows, cols),
    );
    emitChange();
    queueMicrotask(() => refreshHistoryNavState());
  };

  /**
   * 确认插入含表头表格。
   */
  const confirmRteAuxTableHeader = () => {
    const rows = Math.max(
      2,
      Math.min(20, parseInt(rteAuxDraft1.value, 10) || 4),
    );
    const cols = Math.max(
      1,
      Math.min(10, parseInt(rteAuxDraft2.value, 10) || 3),
    );
    closeRteAuxModal();
    const ed = document.getElementById(editorId) as HTMLDivElement | null;
    if (!ed) return;
    ed.focus();
    rteRedoEligibleAfterUndo = false;
    document.execCommand(
      "insertHTML",
      false,
      buildRteHeaderTableHtml(rows, cols),
    );
    emitChange();
    queueMicrotask(() => refreshHistoryNavState());
  };

  /**
   * 下载导出文件（HTML 或纯文本）。
   *
   * @param asHtml - true 为 HTML，false 为纯文本
   */
  const performExportDownload = (asHtml: boolean) => {
    closeRteAuxModal();
    const html = getEditorHtml();
    const blob = asHtml
      ? new Blob([html], { type: "text/html;charset=utf-8" })
      : new Blob([getPlainText(html)], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = asHtml ? "content.html" : "content.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  /**
   * 关闭链接 URL 弹层（取消、遮罩、Esc 共用）。
   */
  const closeLinkUrlModal = () => {
    linkModalOpen.value = false;
    rteSavedLinkSelectionRange = null;
  };

  /**
   * 打开链接 URL 弹层；由工具栏「链接」与 Ctrl+K 调用。
   * 若工具栏 `mousedown` 已写入 {@link rteSavedLinkSelectionRange} 则不再覆盖，以免 click 时选区已丢。
   */
  const openLinkUrlModal = () => {
    const ed = document.getElementById(editorId) as HTMLDivElement | null;
    if (rteSavedLinkSelectionRange == null && ed != null) {
      rteSavedLinkSelectionRange = cloneEditorSelectionRangeIfInside(ed);
    }
    linkUrlDraft.value = "";
    linkModalOpen.value = true;
  };

  /**
   * 确认插入链接：恢复选区后 {@link rteApplyLinkUrl}（有选中文本则仅其为锚文，URL 不进正文）。
   */
  const confirmLinkUrl = () => {
    const url = linkUrlDraft.value.trim();
    const saved = rteSavedLinkSelectionRange;
    closeLinkUrlModal();
    if (!url) return;
    const ed = document.getElementById(editorId) as HTMLDivElement | null;
    if (!ed) return;
    rteRedoEligibleAfterUndo = false;
    rteApplyLinkUrl(ed, url, saved);
    emitChange();
    queueMicrotask(() => refreshHistoryNavState());
  };

  /**
   * 弹层打开后将焦点移入 URL 输入框，便于键盘操作。
   */
  effect(() => {
    if (!linkModalOpen.value) return;
    const inputId = `${editorId}-rte-link-url`;
    queueMicrotask(() => {
      const input = document.getElementById(inputId) as HTMLInputElement | null;
      input?.focus();
      input?.select();
    });
  });

  /**
   * 通用工具栏 Modal 打开后聚焦首个输入框（导出/说明类无输入则跳过）。
   */
  effect(() => {
    const k = rteAuxKind.value;
    if (
      k === "none" || k === "export" || k === "shortcuts" || k === "info"
    ) {
      return;
    }
    const focusId = `${editorId}-rte-aux-f1`;
    queueMicrotask(() => {
      const input = document.getElementById(focusId) as HTMLInputElement | null;
      input?.focus();
      input?.select();
    });
  });

  const handleUploadChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const resolveUrl = (url: string) => {
      insertImageUrl(url);
    };
    if (onUploadImage) {
      Promise.resolve(onUploadImage(file)).then((url) => {
        if (url) resolveUrl(url);
      });
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        if (dataUrl) resolveUrl(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: Event) => {
    const ev = e as ClipboardEvent;
    const items = ev.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        const blob = item.getAsFile();
        if (!blob) return;
        ev.preventDefault();
        const resolveUrl = (url: string) => {
          insertImageUrl(url);
        };
        if (onPasteImage) {
          Promise.resolve(onPasteImage(blob)).then((url) => {
            if (url) resolveUrl(url);
          });
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            if (dataUrl) resolveUrl(dataUrl);
          };
          reader.readAsDataURL(blob);
        }
        return;
      }
    }
  };

  /**
   * 是否展示工具栏与页脚字数行（非只读且存在工具项时为 true）。
   * 隐藏时用 Tailwind `hidden` 类，避免 HTML `hidden` 属性在 hybrid 水合中与客户端不一致。
   */
  const showToolbar = !readOnly && toolbarGroups.length > 0;

  /**
   * 页脚「字数」子树：在 `computed` 内读受控 `value`，仅本段随父级 value/signal 更新。
   *
   * **禁止**在 {@link RichTextEditor} 同步函数体顶层调用 `value()` 算字数：此时读 signal 会把依赖挂到**外层**（如 FormItem）；
   * 用户输入触发 `onChange` → 父级更新 → 整块表单项重挂 → contenteditable 失焦。
   * 与 {@link RteToolbarReactiveIsland} 的 `historyNavState` 隔离同因。
   */
  function RteWordCountReactiveIsland() {
    const wordCountMemo = computed(() =>
      getWordCount(readMaybeSignal(value) ?? "")
    );
    return (
      <div
        class={twMerge(
          "px-2 py-1 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-600",
          !showToolbar && "hidden",
        )}
        data-rte-wordcount
        aria-hidden={showToolbar ? undefined : true}
        aria-live="polite"
      >
        字数：{wordCountMemo.value}
      </div>
    );
  }

  /**
   * 将受控 `value`（HTML 字符串）同步到 contenteditable。
   * `value` 为无参函数时在此追踪 signal；`ref` 仅用 `createRef` 持有节点。
   * **获焦时不同步**：由 {@link rteEditorHasFocus} 与 {@link rteAnyOverlayOpen}（链接 Modal + 工具栏通用 Modal）门禁，杜绝写 `innerHTML` 导致选区丢失。
   *
   * @see editorHostRef
   */
  effect(() => {
    const el = editorHostRef.current;
    if (!el) return;
    /** 源码模式由 {@link rteSourceHtml} 与 `<textarea>` 维护，勿用受控 `value` 覆盖可视区 `innerHTML` */
    if (rteSourceMode.value) return;
    /** 见 {@link rteBlockPropsInnerHtmlAfterSourceExit}：避免切回可视瞬间被旧 `value` 清空 */
    if (rteBlockPropsInnerHtmlAfterSourceExit) return;
    const v = readMaybeSignal(value);
    if (v === undefined) return;
    /**
     * 尚未记过撤销对照基准时：仅在**非获焦**且**无弹层**时初始化。
     * 若 `editorHostRef` 晚于首次 effect 就绪，用户已输入后 effect 才跑到此处且曾把本块放在 `rteEditorHasFocus` 检查**之前**，
     * 会用「已含当前输入」的 `innerHTML` 当基准 → 与 `refreshHistoryNavState` 里 `currentHtml` 恒等 → 撤销永灰。
     * 获焦后仍未有基准时改由编辑区 {@link onFocus} 用当时受控值写入。
     */
    if (
      lastSyncedFromPropsHtml === null &&
      !rteEditorHasFocus &&
      !rteAnyOverlayOpen()
    ) {
      lastSyncedFromPropsHtml = v;
      queueMicrotask(() => refreshHistoryNavState());
    }
    /**
     * 编辑区获焦时 DOM 只能由用户输入 / execCommand 维护；任何受控回写都会重置选区（光标跳行首等）。
     * 链接弹层在 portal 内，焦点离开编辑区时也不能用可能滞后的 `value` 覆盖正文。
     */
    if (rteEditorHasFocus || rteAnyOverlayOpen()) {
      /** 勿在此每帧 `queueMicrotask(refresh)`：`value` 与 {@link historyNavState} 连锁会打爆主线程；撤销态由 onInput/onFocus/工具栏路径刷新即可 */
      return;
    }
    const skipSync = shouldSkipControlledInnerHtmlSync(editorId, el);
    if (skipSync) {
      return;
    }
    if (!rteHtmlLooselyEquals(el.innerHTML, v)) {
      el.innerHTML = v;
      lastSyncedFromPropsHtml = v;
      rteRedoEligibleAfterUndo = false;
      queueMicrotask(() => refreshHistoryNavState());
    }
  });

  const handleKeyDown = (e: Event) => {
    const ev = e as KeyboardEvent;
    /**
     * 代码块为最后一个块且无后续 `p` 时，浏览器常无法把光标移出；插入时已补空段，此处用 ArrowDown 在块尾显式落到下一段。
     */
    if (!ev.ctrlKey && !ev.metaKey && ev.key === "ArrowDown") {
      if (!disabled && !readOnly && !rteSourceMode.value) {
        const ed = document.getElementById(editorId) as HTMLDivElement | null;
        const sel = document.getSelection();
        if (ed != null && sel != null && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const pre = findOutermostRteCodeBlockPre(ed, range.startContainer);
          if (pre != null) {
            const codeEl = pre.querySelector("code");
            if (
              codeEl != null &&
              rteRangeCollapsedAtEndOfElement(range, codeEl)
            ) {
              rteEnsureParagraphAfterPreIfLast(pre);
              const next = pre.nextSibling;
              if (next instanceof HTMLParagraphElement) {
                ev.preventDefault();
                const r = document.createRange();
                r.selectNodeContents(next);
                r.collapse(true);
                sel.removeAllRanges();
                sel.addRange(r);
                emitChange();
                queueMicrotask(() => refreshHistoryNavState());
                return;
              }
            }
          }
        }
      }
    }
    if (ev.ctrlKey || ev.metaKey) {
      const key = ev.key.toLowerCase();
      if (key === "z") {
        ev.preventDefault();
        if (ev.shiftKey) {
          document.execCommand("redo", false);
          rteRedoEligibleAfterUndo = false;
        } else {
          document.execCommand("undo", false);
          rteRedoEligibleAfterUndo = true;
        }
        emitChange();
        queueMicrotask(() => refreshHistoryNavState());
      } else if (key === "y") {
        ev.preventDefault();
        document.execCommand("redo");
        rteRedoEligibleAfterUndo = false;
        emitChange();
        queueMicrotask(() => refreshHistoryNavState());
      } else if (key === "b") {
        ev.preventDefault();
        rteRedoEligibleAfterUndo = false;
        const ed = document.getElementById(editorId) as HTMLDivElement | null;
        if (!ed || !applyRteInlineDecoration(ed, "bold")) {
          document.execCommand("bold");
        }
        emitChange();
        queueMicrotask(() => refreshHistoryNavState());
      } else if (key === "i") {
        ev.preventDefault();
        rteRedoEligibleAfterUndo = false;
        const ed = document.getElementById(editorId) as HTMLDivElement | null;
        if (!ed || !applyRteInlineDecoration(ed, "italic")) {
          document.execCommand("italic");
        }
        emitChange();
        queueMicrotask(() => refreshHistoryNavState());
      } else if (key === "u") {
        ev.preventDefault();
        rteRedoEligibleAfterUndo = false;
        const ed = document.getElementById(editorId) as HTMLDivElement | null;
        if (!ed || !applyRteInlineDecoration(ed, "underline")) {
          document.execCommand("underline");
        }
        emitChange();
        queueMicrotask(() => refreshHistoryNavState());
      } else if (key === "k") {
        ev.preventDefault();
        openLinkUrlModal();
      } else if (key === "f") {
        ev.preventDefault();
        const bar = document.getElementById(`${editorId}-findbar`);
        if (bar) bar.classList.toggle("rte-findbar-hidden");
      }
    }
  };

  const doFind = () => {
    const bar = document.getElementById(`${editorId}-findbar`);
    if (!bar) return;
    const findInput = bar.querySelector("[data-find-input]") as
      | HTMLInputElement
      | null;
    const query = findInput?.value?.trim();
    if (!query) return;
    const editor = document.getElementById(editorId);
    if (!editor) return;
    const text = getPlainText(editor.innerHTML);
    const idx = text.indexOf(query);
    if (idx === -1) {
      openRteAuxInfo("未找到");
      return;
    }
    try {
      const sel = document.getSelection();
      if (sel) {
        const range = document.createRange();
        const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
        let pos = 0;
        let startNode: Text | null = null;
        let startOffset = 0;
        let endNode: Text | null = null;
        let endOffset = 0;
        while (walker.nextNode()) {
          const node = walker.currentNode as Text;
          const len = node.textContent?.length ?? 0;
          if (startNode === null && pos + len > idx) {
            startNode = node;
            startOffset = idx - pos;
          }
          if (endNode === null && pos + len >= idx + query.length) {
            endNode = node;
            endOffset = idx + query.length - pos;
            break;
          }
          pos += len;
        }
        if (startNode && endNode && sel) {
          range.setStart(startNode, startOffset);
          range.setEnd(endNode, endOffset);
          sel.removeAllRanges();
          sel.addRange(range);
          editor.focus();
        }
      }
    } catch {
      openRteAuxInfo("未找到");
    }
  };

  const doReplace = (all: boolean) => {
    const bar = document.getElementById(`${editorId}-findbar`);
    if (!bar) return;
    const findInput = bar.querySelector("[data-find-input]") as
      | HTMLInputElement
      | null;
    const replaceInput = bar.querySelector("[data-replace-input]") as
      | HTMLInputElement
      | null;
    const find = findInput?.value ?? "";
    const replace = replaceInput?.value ?? "";
    /** 查找串为空时不替换，避免 split/join 异常或误操作 */
    if (!find) return;
    const editor = document.getElementById(editorId) as HTMLDivElement | null;
    if (!editor) return;
    if (all) {
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      while (walker.nextNode()) {
        nodes.push(walker.currentNode as Text);
      }
      for (const node of nodes) {
        const text = node.textContent ?? "";
        if (text.includes(find)) {
          node.textContent = text.split(find).join(replace);
        }
      }
      rteRedoEligibleAfterUndo = false;
      emitChange(editor.innerHTML);
      queueMicrotask(() => refreshHistoryNavState());
    } else {
      const sel = document.getSelection();
      if (sel && sel.toString() === find) {
        rteRedoEligibleAfterUndo = false;
        document.execCommand("insertText", false, replace);
        emitChange();
        queueMicrotask(() => refreshHistoryNavState());
      } else {
        doFind();
      }
    }
  };

  /**
   * 含撤销/全屏 signal：单独成内联子函数组件，仅本段随 `historyNavState` 等与工具栏相关的订阅重绘。
   */
  function RteToolbarReactiveIsland() {
    const rteHistoryNav = historyNavState.value;
    const rteFs = rteFullscreen.value;
    /** 源码模式时除「切换回可视化」外禁用工具项，避免命令作用在隐藏的 contenteditable 上 */
    const rteSource = rteSourceMode.value;
    return (
      <div
        class={twMerge(
          toolbarWrapCls,
          !showToolbar && "hidden",
        )}
        data-rte-toolbar
        aria-hidden={showToolbar ? undefined : true}
        role={showToolbar ? "toolbar" : undefined}
        aria-label={showToolbar ? "编辑工具栏" : undefined}
        onMouseDown={(e: Event) => {
          /**
           * 对按钮等阻止默认可保留编辑区选区；若对原生 `<select>` 也 `preventDefault`，下拉无法展开（段落/字号/行高无反应）。
           */
          const t = e.target;
          if (t instanceof Element && t.closest("select")) return;
          e.preventDefault();
        }}
      >
        {toolbarGroups.map((group, gi) => (
          <div key={gi} class={toolbarGroupCls}>
            {group.map((item) =>
              item.children && item.children.length > 0
                ? (
                  item.key === "heading"
                    ? (
                      <RteToolbarItemTip
                        key={item.key}
                        content={item.title}
                      >
                        {
                          /*
                           * `disabled` 时原生 select 的 hover 行为不一致；由 {@link RteToolbarItemTip} 在外层触发器上处理悬停。
                           */
                        }
                        <div
                          class={twMerge(
                            toolbarBtnBase,
                            controlBlueFocusRing(
                              !hideFocusRing &&
                                !rteToolbarDropdownDisabled(
                                  rteSource,
                                  disabled,
                                  item,
                                ),
                            ),
                            /** 按内容收缩，避免 select 被 flex-1 撑满后右侧大片空白 */
                            "w-fit max-w-36 gap-1 justify-start px-1",
                            rteToolbarDropdownDisabled(
                                rteSource,
                                disabled,
                                item,
                              )
                              ? "pointer-events-none cursor-not-allowed opacity-50"
                              : "cursor-pointer",
                          )}
                        >
                          {
                            /*
                             * 段落下拉左侧 IconType；配置里 icon 文字不会在 select 上单独绘制。
                             */
                          }
                          <span
                            class={twMerge(
                              "inline-flex shrink-0",
                              rteToolbarDropdownDisabled(
                                  rteSource,
                                  disabled,
                                  item,
                                )
                                ? "text-slate-400 dark:text-slate-500"
                                : "text-slate-600 dark:text-slate-400",
                            )}
                            aria-hidden="true"
                          >
                            <IconType size="xs" class="text-current" />
                          </span>
                          <select
                            class={twMerge(
                              rteToolbarSelectFitCls,
                              "appearance-none border-0 bg-transparent p-0 pr-2.5 text-sm font-medium focus:outline-none",
                              rteToolbarDropdownDisabled(
                                  rteSource,
                                  disabled,
                                  item,
                                )
                                ? "cursor-not-allowed text-slate-500 dark:text-slate-400"
                                : "cursor-pointer text-slate-900 dark:text-slate-100",
                            )}
                            disabled={rteToolbarDropdownDisabled(
                              rteSource,
                              disabled,
                              item,
                            )}
                            aria-label={item.title}
                            onMouseDownCapture={() => {
                              const ed = document.getElementById(
                                editorId,
                              ) as HTMLDivElement | null;
                              if (ed) {
                                rteSavedToolbarSelectRange =
                                  cloneEditorSelectionRangeIfInside(ed);
                              }
                            }}
                            onChange={(e: Event) =>
                              handleToolbarSelectChange(item, e)}
                          >
                            {(item.children ?? []).map((c) => (
                              <option key={c.value} value={c.value}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </RteToolbarItemTip>
                    )
                    : (
                      <RteToolbarItemTip
                        key={item.key}
                        content={item.title}
                      >
                        <select
                          class={twMerge(
                            toolbarBtnBase,
                            controlBlueFocusRing(
                              !hideFocusRing &&
                                !rteToolbarDropdownDisabled(
                                  rteSource,
                                  disabled,
                                  item,
                                ),
                            ),
                            rteToolbarSelectFitCls,
                            rteToolbarDropdownDisabled(
                                rteSource,
                                disabled,
                                item,
                              )
                              ? "cursor-not-allowed appearance-none pr-2.5"
                              : "cursor-pointer appearance-none pr-2.5",
                          )}
                          disabled={rteToolbarDropdownDisabled(
                            rteSource,
                            disabled,
                            item,
                          )}
                          aria-label={item.title}
                          onMouseDownCapture={() => {
                            const ed = document.getElementById(
                              editorId,
                            ) as HTMLDivElement | null;
                            if (ed) {
                              rteSavedToolbarSelectRange =
                                cloneEditorSelectionRangeIfInside(ed);
                            }
                          }}
                          onChange={(e: Event) =>
                            handleToolbarSelectChange(item, e)}
                        >
                          {(item.children ?? []).map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </RteToolbarItemTip>
                    )
                )
                : (
                  <RteToolbarItemTip
                    key={item.key}
                    content={item.key === "sourceHtml" && rteSource
                      ? "返回可视化编辑"
                      : item.key === "fullscreen" && rteFs
                      ? "退出全屏"
                      : item.title}
                  >
                    {
                      /*
                       * 禁用态下 button 仍包在 Tooltip 触发器内，由外层 `span` 接收 `mouseenter`/`mouseleave`。
                       */
                    }
                    <button
                      type="button"
                      class={toolbarButtonClassForItem(
                        item,
                        rteHistoryNav,
                        disabled ||
                          (rteSource &&
                            item.command !== "rteToggleSourceHtml"),
                        !hideFocusRing,
                      )}
                      disabled={isHistoryToolbarDisabled(
                        item,
                        rteHistoryNav,
                        disabled ||
                          (rteSource &&
                            item.command !== "rteToggleSourceHtml"),
                      )}
                      aria-label={item.key === "sourceHtml" && rteSource
                        ? "返回可视化编辑"
                        : item.key === "fullscreen" && rteFs
                        ? "退出全屏"
                        : item.title}
                      onMouseDownCapture={item.command === "foreColor" ||
                          item.command === "backColor"
                        ? () => {
                          const ed = document.getElementById(
                            editorId,
                          ) as HTMLDivElement | null;
                          if (ed) {
                            rteSavedColorSelectionRange =
                              cloneEditorSelectionRangeIfInside(ed);
                          }
                        }
                        : item.command === "createLink"
                        ? () => {
                          const ed = document.getElementById(
                            editorId,
                          ) as HTMLDivElement | null;
                          if (ed) {
                            rteSavedLinkSelectionRange =
                              cloneEditorSelectionRangeIfInside(ed);
                          }
                        }
                        : undefined}
                      onMouseDown={(e: Event) => e.preventDefault()}
                      onClick={(e: Event) =>
                        handleToolbarAction(
                          item,
                          undefined,
                          e as MouseEvent,
                        )}
                    >
                      {renderToolbarButtonContent(item, {
                        rteFullscreen: rteFs,
                      })}
                    </button>
                  </RteToolbarItemTip>
                )
            )}
          </div>
        ))}
      </div>
    );
  }

  /**
   * 可视 contenteditable 与源码 `<textarea>` 并列挂载；须在本子组件内读取 {@link rteSourceMode}，
   * 才会订阅 signal 并更新 `hidden`、`contentEditable`。
   */
  function RteEditorBodyReactiveIsland() {
    const srcOn = rteSourceMode.value;
    return (
      <div class="contents">
        <div
          key={`${editorId}-body`}
          id={editorId}
          contentEditable={!srcOn && !disabled && !readOnly}
          data-placeholder={placeholder}
          data-rte-editor
          class={twMerge(
            editorSurface,
            srcOn && "hidden",
            !hideFocusRing && "focus:border-transparent",
            readOnly && editorReadOnlyCls,
            "empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 dark:empty:before:text-slate-500",
          )}
          style={minHeight ? { minHeight } : undefined}
          role="textbox"
          aria-multiline="true"
          aria-label={placeholder}
          aria-readonly={readOnly}
          aria-hidden={srcOn ? true : undefined}
          aria-disabled={disabled}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          /**
           * 聚焦时刷新撤销/重做可用状态。此处不必先 `queueMicrotask`：此时焦点已在编辑区，
           * `refreshHistoryNavState` 内 `hadEditorFocus === true` 不会再次 `focus` 编辑区，也就不会与
           * `suppressEditorFocusHistoryRefresh` 形成死循环（该标志仅在为查 redo 而临时抢焦点时使用）。
           */
          onFocus={() => {
            /** 须先于 `suppress` 分支执行，否则查询 redo 时临时 focus 也会跳过置位 */
            rteEditorHasFocus = true;
            /** Enter 新段用 `p` 而非浏览器默认的 `div`（Chromium 系） */
            trySetDefaultParagraphSeparatorToP();
            /**
             * ref 未就绪时 `effect` 可能从未写入 {@link lastSyncedFromPropsHtml}；须在首次获焦用**当时**受控值建基准，
             * 勿等「已输入后」的 effect 用 innerHTML 初始化（见上方 effect 注释）。
             */
            if (lastSyncedFromPropsHtml === null) {
              const vNow = readMaybeSignal(value) ?? "";
              lastSyncedFromPropsHtml = vNow;
            }
            if (suppressEditorFocusHistoryRefresh) return;
            refreshHistoryNavState();
          }}
          onBlur={() => {
            rteEditorHasFocus = false;
            queueMicrotask(() => refreshHistoryNavState());
          }}
          ref={editorHostRef}
        />
        {
          /*
           * 源码模式：等宽文本区直接编辑 HTML；`onInput` 与 {@link emitChange} 同步父级与隐藏 `name` 字段。
           */
        }
        <textarea
          id={`${editorId}-source`}
          data-rte-source-editor
          class={twMerge(
            editorSurface,
            "resize-y font-mono text-xs whitespace-pre-wrap wrap-break-word tab-size-2",
            !srcOn && "hidden",
            !hideFocusRing && "focus:border-transparent",
            readOnly && editorReadOnlyCls,
          )}
          style={minHeight ? { minHeight } : undefined}
          spellcheck={false}
          disabled={disabled}
          readOnly={readOnly}
          aria-label="HTML 源码"
          aria-hidden={!srcOn ? true : undefined}
          value={rteSourceHtml}
          onInput={(e: Event) => {
            const v = (e.target as HTMLTextAreaElement).value;
            rteSourceHtml.value = v;
            emitChange(v);
            queueMicrotask(() => refreshHistoryNavState());
          }}
        />
      </div>
    );
  }

  /** 表单浮层统一挂到 `document.body`（与 {@link getFormPortalBodyHost}） */
  const rteFormPortalHost = getFormPortalBodyHost();

  /**
   * 工具栏通用 Modal 内容：图片/表格/导出/快捷键/提示等（经 Portal 渲染）。
   *
   * @returns 无弹层类型时返回 `null`
   */
  function RteAuxModalPortalBody(): JSX.Element | null {
    const k = rteAuxKind.value;
    const footerOkCancel = (
      onConfirm: () => void,
    ) => (
      <div class="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="primary" onClick={() => onConfirm()}>
          确定
        </Button>
        <Button
          type="button"
          variant="default"
          onClick={() => closeRteAuxModal()}
        >
          取消
        </Button>
      </div>
    );

    if (k === "imageUrl") {
      return (
        <Modal
          open
          onClose={closeRteAuxModal}
          title="插入图片"
          width="sm"
          keyboard
          footer={footerOkCancel(confirmRteAuxImageUrl)}
        >
          <label
            class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            for={`${editorId}-rte-aux-f1`}
          >
            图片 URL
          </label>
          <Input
            id={`${editorId}-rte-aux-f1`}
            type="url"
            size="md"
            placeholder="https://"
            hideFocusRing={hideFocusRing}
            class="w-full"
            value={rteAuxDraft1}
            onInput={(e: Event) => {
              rteAuxDraft1.value = (e.target as HTMLInputElement).value;
            }}
            onKeyDown={(e: Event) => {
              const kev = e as KeyboardEvent;
              if (kev.key === "Enter") {
                kev.preventDefault();
                confirmRteAuxImageUrl();
              }
            }}
          />
        </Modal>
      );
    }

    if (k === "tablePlain" || k === "tableHeader") {
      const onConfirm = k === "tablePlain"
        ? confirmRteAuxTablePlain
        : confirmRteAuxTableHeader;
      return (
        <Modal
          open
          onClose={closeRteAuxModal}
          title={k === "tableHeader" ? "插入表格（含表头）" : "插入表格"}
          width="sm"
          keyboard
          footer={footerOkCancel(onConfirm)}
        >
          <label
            class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            for={`${editorId}-rte-aux-f1`}
          >
            {k === "tableHeader" ? "行数（含表头）" : "行数"}
          </label>
          <Input
            id={`${editorId}-rte-aux-f1`}
            type="text"
            size="md"
            hideFocusRing={hideFocusRing}
            class="w-full"
            value={rteAuxDraft1}
            onInput={(e: Event) => {
              rteAuxDraft1.value = (e.target as HTMLInputElement).value;
            }}
          />
          <label
            class="mb-1.5 mt-3 block text-sm font-medium text-slate-700 dark:text-slate-300"
            for={`${editorId}-rte-aux-f2`}
          >
            列数
          </label>
          <Input
            id={`${editorId}-rte-aux-f2`}
            type="text"
            size="md"
            hideFocusRing={hideFocusRing}
            class="w-full"
            value={rteAuxDraft2}
            onInput={(e: Event) => {
              rteAuxDraft2.value = (e.target as HTMLInputElement).value;
            }}
            onKeyDown={(e: Event) => {
              const kev = e as KeyboardEvent;
              if (kev.key === "Enter") {
                kev.preventDefault();
                onConfirm();
              }
            }}
          />
        </Modal>
      );
    }

    if (k === "export") {
      return (
        <Modal
          open
          onClose={closeRteAuxModal}
          title="导出内容"
          width="sm"
          keyboard
          footer={
            <div class="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="primary"
                onClick={() => performExportDownload(true)}
              >
                导出 HTML
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={() => performExportDownload(false)}
              >
                导出纯文本
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={() => closeRteAuxModal()}
              >
                取消
              </Button>
            </div>
          }
        >
          <p class="text-sm text-slate-600 dark:text-slate-300">
            选择导出格式：HTML 保留标签与样式线索；纯文本仅保留可见文字。
          </p>
        </Modal>
      );
    }

    if (k === "shortcuts") {
      return (
        <Modal
          open
          onClose={closeRteAuxModal}
          title="快捷键"
          width="sm"
          keyboard
          footer={
            <div class="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="primary"
                onClick={() => closeRteAuxModal()}
              >
                知道了
              </Button>
            </div>
          }
        >
          <pre class="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200 font-sans">
            {rteAuxMessage.value}
          </pre>
        </Modal>
      );
    }

    if (k === "info") {
      return (
        <Modal
          open
          onClose={closeRteAuxModal}
          title="提示"
          width="sm"
          keyboard
          footer={
            <div class="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="primary"
                onClick={() => closeRteAuxModal()}
              >
                确定
              </Button>
            </div>
          }
        >
          <p class="text-sm text-slate-700 dark:text-slate-200">
            {rteAuxMessage.value}
          </p>
        </Modal>
      );
    }

    return null;
  }

  return (
    <>
      <div
        id={`${editorId}-root`}
        class={twMerge(
          "rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 relative",
          /** 编辑区获焦时整格外框变蓝，与 Input 系一致；不画内层 ring，避免套在外框里一圈缝 */
          !hideFocusRing &&
            "has-[[data-rte-editor]:focus]:border-blue-500 dark:has-[[data-rte-editor]:focus]:border-blue-400 has-[[data-rte-source-editor]:focus]:border-blue-500 dark:has-[[data-rte-source-editor]:focus]:border-blue-400",
          "[&.rte-fullscreen]:fixed [&.rte-fullscreen]:inset-0 [&.rte-fullscreen]:z-9999 [&.rte-fullscreen]:bg-white [&.rte-fullscreen]:dark:bg-slate-900 [&.rte-fullscreen]:flex [&.rte-fullscreen]:flex-col",
          className,
        )}
      >
        <RteToolbarReactiveIsland />
        <div
          id={`${editorId}-findbar`}
          class={twMerge(
            "flex flex-wrap items-center gap-2 p-2 border-b border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 rte-findbar-hidden",
            "[&.rte-findbar-hidden]:h-0 [&.rte-findbar-hidden]:overflow-hidden [&.rte-findbar-hidden]:opacity-0 [&.rte-findbar-hidden]:pointer-events-none [&.rte-findbar-hidden]:min-h-0 [&.rte-findbar-hidden]:p-0 [&.rte-findbar-hidden]:border-b-0",
          )}
          role="search"
        >
          <input
            type="text"
            data-find-input
            placeholder="查找"
            class={twMerge(
              findBarInputSurface,
              controlBlueFocusRing(!hideFocusRing),
            )}
          />
          <RteToolbarItemTip content="查找下一处匹配">
            <button
              type="button"
              class={twMerge(
                toolbarBtnBase,
                controlBlueFocusRing(!hideFocusRing),
              )}
              aria-label="查找下一处匹配"
              onClick={() => doFind()}
            >
              查找
            </button>
          </RteToolbarItemTip>
          <input
            type="text"
            data-replace-input
            placeholder="替换为"
            class={twMerge(
              findBarInputSurface,
              controlBlueFocusRing(!hideFocusRing),
            )}
          />
          <RteToolbarItemTip content="替换当前匹配项">
            <button
              type="button"
              class={twMerge(
                toolbarBtnBase,
                controlBlueFocusRing(!hideFocusRing),
              )}
              aria-label="替换当前匹配项"
              onClick={() => doReplace(false)}
            >
              替换
            </button>
          </RteToolbarItemTip>
          <RteToolbarItemTip content="替换文档内全部匹配项">
            <button
              type="button"
              class={twMerge(
                toolbarBtnBase,
                controlBlueFocusRing(!hideFocusRing),
              )}
              aria-label="替换文档内全部匹配项"
              onClick={() => doReplace(true)}
            >
              全部替换
            </button>
          </RteToolbarItemTip>
        </div>
        <RteEditorBodyReactiveIsland />
        {name != null && (
          <input
            type="hidden"
            id={`${editorId}-hidden`}
            name={name}
            value={untracked(() => readMaybeSignal(value) ?? "")}
            readOnly
            aria-hidden="true"
          />
        )}
        <input
          type="file"
          id={uploadInputId}
          accept="image/*"
          class="hidden"
          aria-hidden="true"
          onChange={handleUploadChange}
        />
        <ColorPicker
          hideTrigger
          pickerRef={rteColorPickerRef}
          id={`${editorId}-rte-cp`}
          value={rteAuxDraft1.value}
          hideFocusRing={hideFocusRing}
          class="w-0 min-w-0"
          onInput={(e: Event) => {
            rteAuxDraft1.value = (e.target as HTMLInputElement).value;
          }}
          onChange={(e: Event) => {
            rteAuxDraft1.value = (e.target as HTMLInputElement).value;
          }}
          onOpenChange={(open: boolean) => {
            rteColorPickerOpen.value = open;
          }}
          onApply={(hex: string) => {
            const cmd = rteAuxColorCmd;
            const color = hex.trim();
            if (!color) return;
            const ed = document.getElementById(editorId) as
              | HTMLDivElement
              | null;
            if (!ed) return;
            const saved = rteSavedColorSelectionRange;
            rteSavedColorSelectionRange = null;
            rteRedoEligibleAfterUndo = false;
            applyRteForeOrBackColor(ed, saved, cmd, color);
            emitChange();
            queueMicrotask(() => refreshHistoryNavState());
          }}
        />
        <RteWordCountReactiveIsland />
      </div>
      {rteFormPortalHost != null && linkModalOpen.value
        ? createPortal(
          <Modal
            open
            onClose={closeLinkUrlModal}
            title="插入链接"
            width="sm"
            keyboard
            footer={
              <div class="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => confirmLinkUrl()}
                >
                  确定
                </Button>
                <Button
                  type="button"
                  variant="default"
                  onClick={() => closeLinkUrlModal()}
                >
                  取消
                </Button>
              </div>
            }
          >
            <label
              class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              for={`${editorId}-rte-link-url`}
            >
              链接 URL
            </label>
            <Input
              id={`${editorId}-rte-link-url`}
              type="url"
              size="md"
              placeholder="https://"
              hideFocusRing={hideFocusRing}
              class="w-full"
              value={linkUrlDraft}
              onInput={(e: Event) => {
                linkUrlDraft.value = (e.target as HTMLInputElement).value;
              }}
              onKeyDown={(e: Event) => {
                const kev = e as KeyboardEvent;
                if (kev.key === "Enter") {
                  kev.preventDefault();
                  confirmLinkUrl();
                }
              }}
            />
          </Modal>,
          rteFormPortalHost,
        )
        : null}
      {rteFormPortalHost != null && rteAuxKind.value !== "none"
        ? createPortal(<RteAuxModalPortalBody />, rteFormPortalHost)
        : null}
    </>
  );
}
