/**
 * BottomSheet：自底部滑出的半屏/全屏面板。
 * 与桌面 `Modal` / `Drawer` 一致：`open` 支持 `Signal`/getter。
 * Portal：若在 {@link ../MobilePortalHostScope.tsx} 子树内则挂机内锚点，否则挂 `document.body`（避免被业务根 `overflow` 裁切）。
 */

import { createPortal } from "preact/compat";
import type { ComponentChildren, JSX } from "preact";
import { useContext, useEffect, useLayoutEffect, useState } from "preact/hooks";
import { twMerge } from "tailwind-merge";
import { MobilePortalHostContext } from "../MobilePortalHostScope.tsx";
import {
  type ControlledOpenInput,
  readControlledOpenInput,
} from "../../shared/feedback/controlled-open.ts";
import { getBrowserBodyPortalHost } from "../../shared/feedback/portal-host.ts";

/** 高度模式：半屏、全屏、或自定义最大高度（px） */
export type BottomSheetHeightMode = "half" | "full" | number;

export interface BottomSheetProps {
  /** 是否打开：传 `Signal` 或 `() => sig()`，勿仅传 `sig.value`（Hybrid 下可能不更新） */
  open?: ControlledOpenInput;
  /** 标题 */
  title?: string;
  /** 关闭回调（遮罩/关闭按钮） */
  onClose?: () => void;
  /** 高度模式：默认 `half` 为锚点/视口高度的约 50%（固定）；`full` 铺满；`number` 为最大高度（px），多出的内容在面板内滚动 */
  heightMode?: BottomSheetHeightMode;
  /** 点击遮罩是否关闭，默认 true */
  maskClosable?: boolean;
  /** 关闭时卸载子树，默认 false */
  destroyOnClose?: boolean;
  /** 根 class（遮罩+面板容器） */
  class?: string;
  /** 面板 class */
  panelClass?: string;
  /** 子内容 */
  children?: ComponentChildren;
}

const Z_INDEX = 300;

/**
 * 将 heightMode 转为面板上的高度 style。
 * - `full`：须 `minHeight`+`maxHeight` 均为 100%，否则仅 max 时高度随内容收缩，不是全屏。
 * - `half`（默认）：须二者均为 50%，否则与 `full` 同类问题，看起来「随内容变矮」而非约半屏。
 * - 数字：仅 `maxHeight`（px），高度随内容增长直至上限，超出由内层 `overflow-auto` 滚动。
 *
 * @param mode - 高度模式
 */
function heightModeToPanelStyle(
  mode: BottomSheetHeightMode | undefined,
): Record<string, string> {
  if (mode === "full") {
    return { maxHeight: "100%", minHeight: "100%" };
  }
  if (typeof mode === "number" && Number.isFinite(mode)) {
    return { maxHeight: `${mode}px` };
  }
  /* 默认 half */
  return { maxHeight: "50%", minHeight: "50%" };
}

/**
 * 仅当存在真实 `document.body` 时设置 `overflow`（与 Modal / Drawer 同向）
 *
 * @param overflow - 写入 `body.style.overflow` 的值
 */
function trySetDocumentBodyOverflow(overflow: string): void {
  try {
    if (typeof globalThis.document === "undefined") return;
    const b = globalThis.document.body;
    if (b == null || b.nodeType !== 1) return;
    const st = b.style;
    if (st == null) return;
    st.overflow = overflow;
  } catch {
    /* 非浏览器或受限环境 */
  }
}

/**
 * BottomSheet 组件
 *
 * @param props - 面板属性
 */
export function BottomSheet(props: BottomSheetProps): JSX.Element | null {
  const destroyOnClose = props.destroyOnClose === true;

  /**
   * 机内 Portal：须用对象 `{ getHost }` 传 Context，勿传裸函数（见 {@link ../MobilePortalHostScope.tsx}）。
   * 无 Provider 时为 `null`。
   */
  const portalHostScope = useContext(MobilePortalHostContext);
  /** 零参 getter；无 Scope 时为 `undefined` */
  const getScopedHost = portalHostScope?.getHost;

  /**
   * 首帧后多渲染一次，确保 Scope 内锚点 ref 已挂载后再读 `getHost`（与内联回退配合）。
   */
  const [, setLayoutPass] = useState(0);
  useLayoutEffect(() => {
    setLayoutPass((n) => n + 1);
  }, []);

  /**
   * 解析 Portal 容器：有 Scope 且锚点已挂载 → 该机内节点；有 Scope 未挂载 → `null`（内联回退）；无 Scope → `body`。
   */
  const portalTarget = (): HTMLElement | null => {
    if (getScopedHost != null) {
      const el = getScopedHost();
      if (el != null) return el;
      return null;
    }
    return getBrowserBodyPortalHost();
  };

  /** 仅 Portal 落在整页 `body` 时锁定 `document.body` 滚动 */
  const lockDocumentBody = portalHostScope == null;

  /** 每帧读 `open`，订阅 Signal */
  const isOpen = readControlledOpenInput(props.open);

  /** 入场/退场过渡类名用 */
  const [visible, setVisible] = useState(false);
  /** `destroyOnClose` 时在退场动画结束后再卸 DOM */
  const [mounted, setMounted] = useState(!destroyOnClose);

  const panelHeightStyle = heightModeToPanelStyle(props.heightMode);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      queueMicrotask(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!destroyOnClose) return;
    if (isOpen || visible) return;
    const t = globalThis.setTimeout(() => setMounted(false), 220);
    return () => globalThis.clearTimeout(t);
  }, [isOpen, visible, destroyOnClose]);

  const maskClosable = () => props.maskClosable !== false;

  /**
   * 半透明遮罩点击：在 `maskClosable` 为真时调用 `onClose`。
   */
  const handleMask = () => {
    if (!maskClosable()) return;
    props.onClose?.();
  };

  /**
   * 构建遮罩 + 面板（Portal 与 SSR 内联共用）
   */
  const buildSheetMarkup = (): JSX.Element => (
    <div
      class={twMerge(
        "fixed inset-0 flex flex-col justify-end transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0 pointer-events-none",
        props.class,
      )}
      style={{ zIndex: Z_INDEX }}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        class="absolute inset-0 bg-black/45 border-0 cursor-default"
        aria-label="关闭"
        onClick={handleMask}
      />
      <div
        class={twMerge(
          "relative w-full max-w-[100vw] rounded-t-2xl bg-white shadow-xl flex flex-col transition-transform duration-200 ease-out",
          visible ? "translate-y-0" : "translate-y-full",
          props.panelClass,
        )}
        style={panelHeightStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={props.title ? "bottom-sheet-title" : undefined}
        onClick={(e: MouseEvent) => e.stopPropagation()}
      >
        {props.title
          ? (
            <div class="flex items-center justify-between px-4 py-3 border-b border-black/6 shrink-0">
              <div id="bottom-sheet-title" class="text-base font-semibold">
                {props.title}
              </div>
              <button
                type="button"
                class="text-sm text-black/45 hover:text-black/75 px-2 py-1 rounded-md"
                onClick={() => props.onClose?.()}
              >
                关闭
              </button>
            </div>
          )
          : null}
        <div class="p-4 overflow-auto flex-1 min-h-0">{props.children}</div>
      </div>
    </div>
  );

  const portalHost = portalTarget();

  useEffect(() => {
    if (!mounted) {
      if (lockDocumentBody) trySetDocumentBodyOverflow("");
      return;
    }
    if (isOpen) {
      if (lockDocumentBody) trySetDocumentBodyOverflow("hidden");
    } else {
      if (lockDocumentBody) trySetDocumentBodyOverflow("");
    }
    return () => {
      if (lockDocumentBody) trySetDocumentBodyOverflow("");
    };
  }, [mounted, isOpen, lockDocumentBody]);

  const targetSync = portalHost;

  if (targetSync != null) {
    if (destroyOnClose && !mounted) {
      return null;
    }
    return (
      <>
        <span
          style="display:none;width:0;height:0;overflow:hidden;position:absolute;clip:rect(0,0,0,0)"
          aria-hidden="true"
          data-dreamer-bottom-sheet-portal-anchor=""
        />
        {mounted ? createPortal(buildSheetMarkup(), targetSync) : null}
      </>
    );
  }
  if (!mounted) {
    return null;
  }
  return buildSheetMarkup();
}
