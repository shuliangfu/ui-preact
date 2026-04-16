/**
 * ActionSheet 底部动作列表（Preact）。
 * 移动端选择/操作：底部弹出若干选项 + 取消；与 `Modal` / `Drawer` 一致支持 `open={Signal}`；Portal 目标同 {@link ./BottomSheet.tsx}。
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

export interface ActionSheetAction {
  /** 显示文案 */
  label: string;
  /** 点击回调 */
  onClick?: () => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否危险操作（红色文案） */
  danger?: boolean;
  /** 可选描述（如副标题） */
  description?: string;
  /** 可选图标（显示在 label 左侧） */
  icon?: ComponentChildren;
}

export interface ActionSheetProps {
  /** 是否打开：传 `Signal` 或 `() => sig()`，勿仅传 `sig.value` */
  open?: ControlledOpenInput;
  /** 关闭回调（点击取消或遮罩时触发） */
  onClose?: () => void;
  /** 标题（可选，显示在动作列表上方） */
  title?: string | null;
  /** 动作项列表 */
  actions: ActionSheetAction[];
  /** 取消按钮文案，默认 "取消"；传 null 或空则不显示取消区 */
  cancelText?: string | null;
  /** 点击遮罩是否关闭，默认 true */
  maskClosable?: boolean;
  /** 关闭后是否销毁，默认 false */
  destroyOnClose?: boolean;
  /** 额外 class（作用于容器） */
  class?: string;
}

const Z_INDEX = 300;

/**
 * 仅当存在真实 `document.body` 时设置 `overflow`
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
 * ActionSheet 组件
 *
 * @param props - 动作表属性
 */
export function ActionSheet(props: ActionSheetProps): JSX.Element | null {
  const {
    onClose,
    title,
    actions,
    cancelText = "取消",
    maskClosable = true,
    destroyOnClose = false,
    class: className,
  } = props;

  const portalHostScope = useContext(MobilePortalHostContext);
  const getScopedHost = portalHostScope?.getHost;

  /** 与 BottomSheet 一致：layout 后再读机内锚点 */
  const [, setLayoutPass] = useState(0);
  useLayoutEffect(() => {
    setLayoutPass((n) => n + 1);
  }, []);
  const portalTarget = (): HTMLElement | null => {
    if (getScopedHost != null) {
      const el = getScopedHost();
      if (el != null) return el;
      return null;
    }
    return getBrowserBodyPortalHost();
  };

  const lockDocumentBody = portalHostScope == null;

  /** 每帧读 `open`，订阅 Signal */
  const isOpen = readControlledOpenInput(props.open);

  /**
   * 全屏遮罩点击：仅当点击落在遮罩按钮自身（非面板区域）且允许遮罩关闭时触发 `onClose`。
   *
   * @param e - 指针事件
   */
  const handleMaskClick = (e: MouseEvent) => {
    const t = e.target as Node | null;
    const cur = e.currentTarget as Node | null;
    if (t !== cur || !maskClosable) return;
    onClose?.();
  };

  /**
   * 构建遮罩 + 面板（Portal 与 SSR 内联共用）
   */
  const buildActionSheetMarkup = (): JSX.Element => (
    <div
      class="fixed inset-0 flex flex-col justify-end"
      style={{ zIndex: Z_INDEX }}
      role="dialog"
      aria-modal="true"
      aria-label="操作列表"
    >
      <button
        type="button"
        class="absolute inset-0 bg-black/50 dark:bg-black/60 border-0 cursor-default transition-opacity"
        aria-label="关闭"
        onClick={handleMaskClick}
      />
      <div
        class={twMerge(
          "relative z-10 flex flex-col gap-2 px-2 pb-safe max-h-[85vh] overflow-hidden",
          className,
        )}
        onClick={(e: MouseEvent) => e.stopPropagation()}
      >
        <div class="rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-xl">
          {title != null && title !== "" && (
            <div class="px-4 py-3 text-center text-sm text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
              {title}
            </div>
          )}
          <div class="max-h-[60vh] overflow-auto">
            {actions.map((action, index) => (
              <button
                key={index}
                type="button"
                disabled={action.disabled}
                class={twMerge(
                  "w-full px-4 py-3 text-left text-base font-medium transition-colors flex items-center gap-3",
                  "border-b border-slate-100 dark:border-slate-700 last:border-b-0",
                  action.disabled &&
                    "opacity-50 cursor-not-allowed text-slate-400 dark:text-slate-500",
                  !action.disabled &&
                    action.danger &&
                    "text-red-600 dark:text-red-400 active:bg-red-50 dark:active:bg-red-950/30",
                  !action.disabled &&
                    !action.danger &&
                    "text-slate-900 dark:text-slate-100 active:bg-slate-100 dark:active:bg-slate-700",
                )}
                onClick={() => {
                  if (!action.disabled) {
                    action.onClick?.();
                    onClose?.();
                  }
                }}
              >
                {action.icon != null && (
                  <span class="shrink-0 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
                    {action.icon}
                  </span>
                )}
                <span class="flex-1 min-w-0">
                  <span>{action.label}</span>
                  {action.description != null && action.description !== "" && (
                    <div class="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                      {action.description}
                    </div>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
        {cancelText != null && cancelText !== "" && (
          <button
            type="button"
            class="w-full py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium shadow-xl border-0"
            onClick={() => onClose?.()}
          >
            {cancelText}
          </button>
        )}
      </div>
    </div>
  );

  const portalHost = portalTarget();

  /** 打开且挂到整页 body 时锁定滚动；关闭或卸载时恢复 */
  useEffect(() => {
    if (!isOpen) {
      if (lockDocumentBody) trySetDocumentBodyOverflow("");
      return;
    }
    if (lockDocumentBody) trySetDocumentBodyOverflow("hidden");
    return () => {
      if (lockDocumentBody) trySetDocumentBodyOverflow("");
    };
  }, [isOpen, lockDocumentBody]);

  const targetSync = portalHost;

  if (targetSync != null) {
    if (destroyOnClose && !readControlledOpenInput(props.open)) {
      return null;
    }
    return (
      <>
        <span
          style="display:none;width:0;height:0;overflow:hidden;position:absolute;clip:rect(0,0,0,0)"
          aria-hidden="true"
          data-dreamer-action-sheet-portal-anchor=""
        />
        {isOpen ? createPortal(buildActionSheetMarkup(), targetSync) : null}
      </>
    );
  }
  if (!readControlledOpenInput(props.open)) {
    return null;
  }
  return buildActionSheetMarkup();
}
