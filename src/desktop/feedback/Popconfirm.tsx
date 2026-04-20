/**
 * Popconfirm 气泡确认框（Preact）。
 * 删除等二次确认：点击触发后显示带标题与「确定、取消」按钮；支持危险 / 警告样式（确定钮配色）。
 * 受控：`open` + `onOpenChange`；触发器 `onClick` 里应 `onOpenChange(true)` 或写 `sig.value = true`。
 *
 * **手写 JSX**：`open={sig.value}` 会在创建 VNode 时变成快照；须传 **`open={sig}`** 或零参 getter。
 *
 * **定位**：有 `document.body` 时面板经 {@link createPortal} 挂到 body 且 `position: fixed`，
 * 由 {@link computePopFixedStyle} 对齐触发器，避免祖先 `overflow` 裁剪；打开期间 rAF 同步视口矩形。
 * 无 body 时回退为包裹层内 `absolute`（与旧版一致）。
 *
 * 根层不挂全屏遮罩；点外部由 `document` 上 `click` 冒泡关闭。
 */

import { Signal } from "@preact/signals";
import type { ComponentChildren, JSX } from "preact";
import { createPortal } from "preact/compat";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "preact/hooks";
import { twMerge } from "tailwind-merge";
import { Button } from "../../shared/basic/Button.tsx";
import {
  type ControlledOpenInput,
  readControlledOpenInput,
} from "../../shared/feedback/controlled-open.ts";
import { IconHelpCircle } from "../../shared/basic/icons/HelpCircle.tsx";
import { getBrowserBodyPortalHost } from "../../shared/feedback/portal-host.ts";
import {
  computePopFixedStyle,
  type FullPopStylePlacement,
  POP_FIXED_STYLE_RESET,
} from "../../shared/feedback/popFixedStyle.ts";

export type PopconfirmPlacement =
  | "top"
  | "topLeft"
  | "topRight"
  | "bottom"
  | "bottomLeft"
  | "bottomRight"
  | "left"
  | "right";

/** `open`：布尔快照、`Signal<boolean>`（`useSignal` 返回值）或零参 getter（与 Modal `open` 同向） */
export type PopconfirmOpenInput = ControlledOpenInput;

export interface PopconfirmProps {
  /** 是否打开（受控）；推荐 `open={signal}`，勿 `open={sig.value}` */
  open?: PopconfirmOpenInput;
  /** 打开/关闭回调（关闭时传 false） */
  onOpenChange?: (open: boolean) => void;
  /** 确认标题/描述 */
  title: string;
  /** 确定后业务回调；浮层关闭由组件在回调之后统一处理（`requestClose`），不必在回调里写 `open.value = false` */
  onConfirm?: () => void;
  /** 取消后业务回调；浮层关闭由组件统一处理，不必在回调里再关 */
  onCancel?: () => void;
  /** 确定按钮文案，默认 "确定" */
  okText?: string;
  /** 取消按钮文案，默认 "取消" */
  cancelText?: string;
  /** 是否为危险操作（确定按钮红色），默认 false；与 `warning` 同时为 true 时以本项为准 */
  danger?: boolean;
  /**
   * 是否为警告类确认（确定按钮琥珀色），默认 false；与 `danger` 互斥语义上二选一，
   * 二者均为 false 时确定钮为 primary。
   */
  warning?: boolean;
  /** 是否显示问号图标，默认 true */
  showIcon?: boolean;
  /** 气泡位置，默认 "top" */
  placement?: PopconfirmPlacement;
  /**
   * 是否显示指向触发器的小箭头（与 {@link Popover} 同向：旋转方片 + 边框），默认 true。
   */
  arrow?: boolean;
  /** 触发元素（需在 onClick 中打开，如 `onClick={() => (sig.value = true)}`） */
  children?: ComponentChildren;
  /** 额外 class（包装器） */
  class?: string;
  /** 面板 class */
  overlayClass?: string;
}

/** 标记气泡面板根节点，供 document `click` 与 `composedPath` 判断是否点在面板内 */
const POPCONFIRM_PANEL_ATTR = "data-dreamer-popconfirm-panel";

/**
 * 相对包裹层内面板的 `absolute` 方位类（无 Portal 回退路径）。
 */
const placementClasses: Record<PopconfirmPlacement, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  topLeft: "bottom-full left-0 mb-2",
  topRight: "bottom-full right-0 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  bottomLeft: "top-full left-0 mt-2",
  bottomRight: "top-full right-0 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

/**
 * 根据 `placement` 生成指向触发器一侧的箭头 class（与 {@link Popover} 的 `arrowClass` 同算法）。
 *
 * @param placement - 气泡方位
 * @returns 箭头根节点的 Tailwind 类名字符串
 */
function popconfirmArrowClass(placement: PopconfirmPlacement): string {
  const base =
    "absolute z-[1] w-2 h-2 rotate-45 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 pointer-events-none";
  if (placement.startsWith("top")) {
    return `${base} bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-t-0 border-l-0`;
  }
  if (placement.startsWith("bottom")) {
    return `${base} top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-b-0 border-r-0`;
  }
  if (placement.startsWith("left")) {
    return `${base} right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-b-0 border-l-0`;
  }
  if (placement.startsWith("right")) {
    return `${base} left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 border-t-0 border-r-0`;
  }
  return base;
}

/**
 * 气泡确认：受控打开；默认 Portal 到 `body` 与触发器视口对齐。
 *
 * @param props - {@link PopconfirmProps}
 */
export function Popconfirm(props: PopconfirmProps): JSX.Element {
  const {
    onOpenChange,
    onConfirm,
    onCancel,
    danger = false,
    warning = false,
    placement = "top",
  } = props;

  const isOpen = readControlledOpenInput(props.open);

  const triggerRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLElement | null>(null);
  const [portalFixedStyle, setPortalFixedStyle] = useState<
    Record<string, string>
  >({});

  const portalHost = getBrowserBodyPortalHost();
  const portalHostOk = portalHost != null;

  const fullPlacement = placement as FullPopStylePlacement;

  /**
   * 关闭浮层：若 `open` 为 **`Signal<boolean>`** 则写回 `false`，再调用 `onOpenChange(false)`。
   */
  const requestClose = useCallback(() => {
    const o = props.open;
    if (o instanceof Signal) o.value = false;
    onOpenChange?.(false);
  }, [props.open, onOpenChange]);

  const handleConfirm = () => {
    onConfirm?.();
    requestClose();
  };

  const handleCancel = () => {
    onCancel?.();
    requestClose();
  };

  const okVariant = danger ? "danger" : warning ? "warning" : "primary";
  const iconToneCls = danger
    ? "text-red-500 dark:text-red-400"
    : warning
    ? "text-amber-500 dark:text-amber-400"
    : "text-slate-400 dark:text-slate-500";

  const posCls = placementClasses[placement];

  /**
   * 同步 Portal 浮层 `fixed` 位置（打开期间由 rAF / resize 驱动）。
   */
  const syncPortalPosition = useCallback(() => {
    const el = triggerRef.current;
    if (el == null) return;
    setPortalFixedStyle({
      ...POP_FIXED_STYLE_RESET,
      ...computePopFixedStyle(el.getBoundingClientRect(), fullPlacement),
    });
  }, [fullPlacement]);

  useLayoutEffect(() => {
    if (isOpen && portalHostOk) {
      syncPortalPosition();
    }
  }, [isOpen, portalHostOk, syncPortalPosition]);

  useEffect(() => {
    if (!isOpen || !portalHostOk) {
      setPortalFixedStyle({});
      return;
    }
    let running = true;
    let rafLoop = 0;
    const keepAligned = () => {
      if (!running) return;
      syncPortalPosition();
      rafLoop = globalThis.requestAnimationFrame(keepAligned);
    };
    rafLoop = globalThis.requestAnimationFrame(keepAligned);
    const onResize = () => syncPortalPosition();
    globalThis.window.addEventListener("resize", onResize);
    const vv = globalThis.visualViewport;
    vv?.addEventListener("resize", onResize);
    return () => {
      running = false;
      globalThis.cancelAnimationFrame(rafLoop);
      globalThis.window.removeEventListener("resize", onResize);
      vv?.removeEventListener("resize", onResize);
    };
  }, [isOpen, portalHostOk, syncPortalPosition]);

  useEffect(() => {
    if (!isOpen) return;

    const doc = globalThis.document;
    let armed = false;
    let armRaf0 = 0;
    let armRaf1 = 0;
    armRaf0 = globalThis.requestAnimationFrame(() => {
      armRaf1 = globalThis.requestAnimationFrame(() => {
        armed = true;
      });
    });

    const onDocumentClickBubble = (e: Event) => {
      if (!armed) return;
      const t = e.target;
      if (!(t instanceof globalThis.Node)) return;
      const triggerEl = triggerRef.current;
      const floatingEl = floatingRef.current;
      if (triggerEl != null && triggerEl.contains(t)) return;
      const path = typeof e.composedPath === "function"
        ? e.composedPath()
        : [t];
      const inPanel = path.some((n) =>
        n instanceof globalThis.Element &&
        n.hasAttribute(POPCONFIRM_PANEL_ATTR)
      );
      if (inPanel) return;
      if (floatingEl != null && floatingEl.contains(t)) return;
      requestClose();
    };

    doc?.addEventListener("click", onDocumentClickBubble, false);

    return () => {
      globalThis.cancelAnimationFrame(armRaf0);
      globalThis.cancelAnimationFrame(armRaf1);
      doc?.removeEventListener("click", onDocumentClickBubble, false);
    };
  }, [isOpen, requestClose]);

  const {
    title,
    okText = "确定",
    cancelText = "取消",
    showIcon = true,
    arrow = true,
    children,
    class: className,
    overlayClass,
  } = props;

  const arrowCls = arrow ? popconfirmArrowClass(placement) : "";

  /**
   * 面板内容区：问号 + 文案 + 按钮；`data-*` 供区外点击判断。
   */
  const panelBody = (
    <>
      <div class="flex gap-2">
        {showIcon && (
          <span class={twMerge("shrink-0 mt-0.5", iconToneCls)}>
            <IconHelpCircle class="w-4 h-4" />
          </span>
        )}
        <div class="flex-1">
          <div class="text-sm mb-3">{title}</div>
          <div class="flex justify-end gap-2">
            <Button
              type="button"
              variant={okVariant}
              size="sm"
              onClick={(_e: Event) => handleConfirm()}
            >
              {okText}
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={(_e: Event) => handleCancel()}
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </div>
      {arrow && <span class={arrowCls} aria-hidden="true" />}
    </>
  );

  const overlayBoxClass = twMerge(
    "pointer-events-auto min-w-[200px] max-w-[min(24rem,calc(100vw-1rem))] rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg text-slate-900 dark:text-slate-100 p-3 box-border",
    overlayClass,
  );

  return (
    <span
      ref={(el) => {
        triggerRef.current = el;
      }}
      class={twMerge("relative inline-flex", className)}
    >
      {children}
      {isOpen && portalHostOk && portalHost != null &&
        createPortal(
          <span
            ref={(el) => {
              floatingRef.current = el;
            }}
            data-dreamer-popconfirm-panel=""
            class={twMerge("fixed z-1065", overlayBoxClass)}
            style={portalFixedStyle}
          >
            {panelBody}
          </span>,
          portalHost,
        )}
      {isOpen && !portalHostOk && (
        <span
          ref={(el) => {
            floatingRef.current = el;
          }}
          data-dreamer-popconfirm-panel=""
          class={twMerge(
            "absolute z-1065 pointer-events-auto min-w-[200px] max-w-[min(24rem,calc(100vw-1rem))] rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg text-slate-900 dark:text-slate-100 p-3 box-border",
            posCls,
            overlayClass,
          )}
        >
          {panelBody}
        </span>
      )}
    </span>
  );
}
