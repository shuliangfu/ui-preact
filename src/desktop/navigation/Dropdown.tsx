/**
 * Dropdown 下拉菜单（Preact）。
 * 桌面点击/悬停展开；触发元素 + 下拉内容，支持 placement、trigger(click/hover)、
 * Esc 关闭（需 initDropdownEsc）、hover 延迟防抖。展开状态由组件内部维护，无需传 open。
 * 浮层容器使用 **`p-1`**（四边等距），避免仅 `py-1` 时左右贴边、与内部再写 `py-1` 叠出过高顶距。
 */

import { useSignal } from "@preact/signals";
import type { ComponentChildren, JSX } from "preact";
import { useCallback, useEffect, useRef } from "preact/hooks";
import { twMerge } from "tailwind-merge";

export type DropdownPlacement =
  | "bottom"
  | "bottomLeft"
  | "bottomRight"
  | "bottomAuto"
  | "top"
  | "topLeft"
  | "topRight";

export interface DropdownProps {
  /** 触发元素（子节点） */
  children?: ComponentChildren;
  /** 下拉内容（菜单或自定义节点） */
  overlay: ComponentChildren;
  /** 打开/关闭时回调（可选，仅通知，不参与控制） */
  onOpenChange?: (open: boolean) => void;
  /** 触发方式：click 或 hover，默认 "click" */
  trigger?: "click" | "hover";
  /** hover 时展开延迟（ms），默认 150 */
  hoverOpenDelay?: number;
  /** hover 时收起延迟（ms），默认 100 */
  hoverCloseDelay?: number;
  /** 下拉位置，默认 "bottom"（正下方居中）；"bottomAuto" 为正下方且根据左右空间自动左/右移 */
  placement?: DropdownPlacement;
  /** 是否禁用，默认 false */
  disabled?: boolean;
  /** 额外 class（包装器） */
  class?: string;
  /** 下拉层 class */
  overlayClass?: string;
  /** 下拉层 id（无障碍：aria-describedby 等，可选） */
  overlayId?: string;
}

/** 用于 Esc 关闭时注册当前打开的下拉关闭回调（每帧仅一个） */
const DROPDOWN_ESC_KEY = "__lastDropdownClose" as const;

/** 在客户端调用一次，监听 Esc 关闭当前已打开的下拉 */
export function initDropdownEsc(): (() => void) | undefined {
  if (typeof globalThis.document === "undefined") return;
  const g = globalThis as unknown as Record<string, (() => void) | undefined>;
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Escape") return;
    const close = g[DROPDOWN_ESC_KEY];
    if (close) {
      close();
      delete g[DROPDOWN_ESC_KEY];
    }
  };
  globalThis.document.addEventListener("keydown", onKeyDown);
  return () => globalThis.document.removeEventListener("keydown", onKeyDown);
}

const placementClasses: Record<
  Exclude<DropdownPlacement, "bottomAuto">,
  string
> = {
  bottom: "top-full left-1/2 -translate-x-1/2 mt-1",
  bottomLeft: "top-full left-0 mt-1",
  bottomRight: "top-full right-0 mt-1",
  top: "bottom-full left-1/2 -translate-x-1/2 mb-1",
  topLeft: "bottom-full left-0 mb-1",
  topRight: "bottom-full right-0 mb-1",
};

/** hover 时用的定时器（闭包共享，避免闪动） */
const hoverTimers: { open: number; close: number } = { open: 0, close: 0 };

/**
 * 下拉菜单：内部维护展开态，支持 click/hover 与 bottomAuto 视口避让。
 *
 * @param props - 触发方式、内容与定位
 */
export function Dropdown(props: DropdownProps): JSX.Element {
  const {
    children,
    overlay,
    onOpenChange,
    trigger = "click",
    hoverOpenDelay = 150,
    hoverCloseDelay = 100,
    placement = "bottom",
    disabled = false,
    class: className,
    overlayClass,
    overlayId,
  } = props;

  /** 展开状态由组件内部维护（`Signal`，`.value`） */
  const openState = useSignal(false);
  /** bottomAuto 时根据视口空间计算出的实际位置 */
  const autoPlacement = useSignal<
    "bottom" | "bottomLeft" | "bottomRight"
  >("bottom");

  /** 同步内部 open 与 onOpenChange 通知 */
  const setOpen = useCallback(
    (value: boolean) => {
      openState.value = value;
      onOpenChange?.(value);
    },
    [onOpenChange],
  );

  const isHover = trigger === "hover";
  const isAuto = placement === "bottomAuto";

  /**
   * 定位 class：bottomAuto 时读 `autoPlacement`，避免在无关 state 变更时误触布局计算。
   */
  const overlayPositionClass = isAuto
    ? placementClasses[autoPlacement.value]
    : placementClasses[placement];

  /** 用于 bottomAuto：测量触发元素与 overlay 后决定左/中/右 */
  const triggerRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLElement | null>(null);
  const measureAndSetAuto = () => {
    const triggerEl = triggerRef.current;
    const overlayEl = overlayRef.current;
    if (
      typeof globalThis.document === "undefined" || !triggerEl || !overlayEl
    ) {
      return;
    }
    const triggerRect = triggerEl.getBoundingClientRect();
    const overlayRect = overlayEl.getBoundingClientRect();
    const vw = globalThis.document.documentElement.clientWidth;
    const halfW = overlayRect.width / 2;
    const centerX = triggerRect.left + triggerRect.width / 2;
    const spaceLeft = centerX;
    const spaceRight = vw - centerX;
    if (spaceLeft < halfW && spaceRight >= halfW) {
      autoPlacement.value = "bottomLeft";
    } else if (spaceRight < halfW && spaceLeft >= halfW) {
      autoPlacement.value = "bottomRight";
    } else {
      autoPlacement.value = "bottom";
    }
  };
  const scheduleMeasure = () => {
    if (typeof globalThis.requestAnimationFrame === "undefined") return;
    globalThis.requestAnimationFrame(() => {
      measureAndSetAuto();
    });
  };

  /** click 模式下用 document 点击外部关闭；冒泡阶段且延迟关闭，避免拦截链接点击与路由导航、避免同步 setState 导致主内容区渲染异常 */
  let removeClickOutside: (() => void) | null = null;
  useEffect(() => {
    if (
      typeof globalThis.document === "undefined" || isHover || !openState.value
    ) {
      return;
    }
    const id = globalThis.setTimeout(() => {
      const onDocClick = (e: MouseEvent) => {
        const target = e.target as Node | null;
        const tEl = triggerRef.current;
        const oEl = overlayRef.current;
        if (
          target &&
          tEl?.contains(target) === false &&
          oEl?.contains(target) === false
        ) {
          globalThis.setTimeout(() => setOpen(false), 0);
        }
      };
      globalThis.document.addEventListener("click", onDocClick, false);
      removeClickOutside = () => {
        globalThis.document.removeEventListener("click", onDocClick, false);
        removeClickOutside = null;
      };
    }, 0);
    return () => {
      globalThis.clearTimeout(id);
      removeClickOutside?.();
    };
  }, [isHover, openState.value, setOpen]);

  /** 展开时向全局注册 Esc 关闭回调（与 initDropdownEsc 配合） */
  useEffect(() => {
    if (!openState.value) return;
    const g = globalThis as unknown as Record<
      string,
      (() => void) | undefined
    >;
    const close = () => setOpen(false);
    g[DROPDOWN_ESC_KEY] = close;
    return () => {
      if (g[DROPDOWN_ESC_KEY] === close) {
        delete g[DROPDOWN_ESC_KEY];
      }
    };
  }, [openState.value, setOpen]);

  const handleTriggerClick = (e: Event) => {
    e.preventDefault();
    if (disabled) return;
    if (!isHover) setOpen(!openState.value);
  };

  const handleTriggerEnter = () => {
    if (disabled) return;
    if (!isHover) return;
    if (hoverTimers.close) {
      clearTimeout(hoverTimers.close);
      hoverTimers.close = 0;
    }
    hoverTimers.open = setTimeout(() => setOpen(true), hoverOpenDelay);
  };

  const handleTriggerLeave = () => {
    if (!isHover) return;
    if (hoverTimers.open) {
      clearTimeout(hoverTimers.open);
      hoverTimers.open = 0;
    }
    hoverTimers.close = setTimeout(() => setOpen(false), hoverCloseDelay);
  };

  const handleOverlayEnter = () => {
    if (hoverTimers.close) {
      clearTimeout(hoverTimers.close);
      hoverTimers.close = 0;
    }
  };

  const handleOverlayLeave = () => {
    if (isHover) {
      hoverTimers.close = setTimeout(() => setOpen(false), hoverCloseDelay);
    }
  };

  return (
    <span
      ref={(el: HTMLElement | null) => {
        triggerRef.current = el;
      }}
      class={twMerge("relative inline-flex", className)}
      onMouseEnter={isHover
        ? (handleTriggerEnter as (e: Event) => void)
        : undefined}
      onMouseLeave={isHover
        ? (handleTriggerLeave as (e: Event) => void)
        : undefined}
    >
      <span
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="true"
        aria-expanded={openState.value}
        aria-disabled={disabled}
        onClick={!isHover
          ? (handleTriggerClick as (e: Event) => void)
          : undefined}
        onKeyDown={!isHover && !disabled
          ? ((e: Event) => {
            const k = (e as KeyboardEvent).key;
            if (k === "Enter" || k === " ") {
              e.preventDefault();
              setOpen(!openState.value);
            }
          }) as (e: Event) => void
          : undefined}
        class={disabled ? "pointer-events-none opacity-50" : "cursor-pointer"}
      >
        {children}
      </span>
      {
        /* 同表单 Select：避免 `display: contents` 破坏菜单 `absolute` 定位 */
      }
      {openState.value && (
        <div
          key="dropdown-overlay"
          ref={(el: HTMLElement | null) => {
            overlayRef.current = el;
            if (el && isAuto) scheduleMeasure();
          }}
          id={overlayId}
          role="menu"
          class={twMerge(
            "absolute z-50 min-w-[120px] p-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg",
            overlayPositionClass,
            overlayClass,
          )}
          onClick={!isHover ? () => setOpen(false) : undefined}
          onMouseEnter={isHover
            ? (handleOverlayEnter as (e: Event) => void)
            : undefined}
          onMouseLeave={isHover
            ? (handleOverlayLeave as (e: Event) => void)
            : undefined}
        >
          {overlay}
        </div>
      )}
    </span>
  );
}
