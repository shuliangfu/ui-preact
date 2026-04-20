/**
 * Dropdown 下拉菜单（Preact）。
 * 桌面点击/悬停展开；**仅向触发器下方**展开（`bottom` / `bottomLeft` / `bottomRight` / `bottomAuto`）。
 * Esc 关闭（需 initDropdownEsc）、hover 延迟防抖。展开状态由组件内部维护，无需传 open。
 * 浮层经 {@link createPortal} 挂到 `document.body` 且 `position: fixed`，与 `ui-view` 同源几何；
 * 无真实 `body` 时回退为包裹层内 `absolute`（如部分 SSR/测试环境）。
 * 可设 {@link DropdownProps.arrow} 显示小尖角（与 ui-view 一致，默认 false）。
 */

import { useSignal } from "@preact/signals";
import type { ComponentChildren, JSX } from "preact";
import { createPortal } from "preact/compat";
import { useCallback, useEffect, useRef } from "preact/hooks";
import { twMerge } from "tailwind-merge";

import { getBrowserBodyPortalHost } from "../../shared/feedback/portal-host.ts";
import {
  computeDropdownFixedStyle,
  getDropdownArrowProps,
  type ResolvedPopPlacement,
  resolvePlacement,
} from "./dropdownPortalGeometry.ts";

export type DropdownPlacement =
  | "bottom"
  | "bottomLeft"
  | "bottomRight"
  | "bottomAuto";

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
  /** 下拉位置（均在触发器下方）：默认 `bottom`；`bottomAuto` 根据视口左右空间自动偏左/居中/偏右 */
  placement?: DropdownPlacement;
  /** 是否禁用，默认 false */
  disabled?: boolean;
  /** 额外 class（包装器） */
  class?: string;
  /** 下拉层 class */
  overlayClass?: string;
  /** 下拉层 id（无障碍：aria-describedby 等，可选） */
  overlayId?: string;
  /**
   * 为 true 时浮层与触发器间显示小尖角（与 ui-view 一致，默认 false）。
   */
  arrow?: boolean;
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

/** 无 `body` 时内联回退的 placement 类（与原先 absolute 版一致，不含 `bottomAuto` 字面量） */
const placementClasses: Record<
  Exclude<DropdownPlacement, "bottomAuto">,
  string
> = {
  bottom: "top-full left-1/2 -translate-x-1/2 mt-1",
  bottomLeft: "top-full left-0 mt-1",
  bottomRight: "top-full right-0 mt-1",
};

/** hover 时用的定时器（闭包共享，避免闪动） */
const hoverTimers: { open: number; close: number } = { open: 0, close: 0 };

/**
 * 下拉菜单：内部维护展开态，支持 click/hover 与 bottomAuto 视口避让；默认 Portal+fixed+每帧 rAF 对齐（与 ui-view 一致）。
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
    arrow = false,
  } = props;

  const openState = useSignal(false);
  const autoPlacement = useSignal<
    "bottom" | "bottomLeft" | "bottomRight"
  >("bottom");
  const portalStyle = useSignal<Record<string, string>>({});

  const setOpen = useCallback(
    (value: boolean) => {
      openState.value = value;
      onOpenChange?.(value);
    },
    [onOpenChange],
  );

  const isHover = trigger === "hover";
  const isAuto = placement === "bottomAuto";
  const portalHost = getBrowserBodyPortalHost();

  const overlayPositionClass = isAuto
    ? placementClasses[autoPlacement.value]
    : placementClasses[placement as Exclude<DropdownPlacement, "bottomAuto">];

  const triggerRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLElement | null>(null);
  const measureAndSetAuto = useCallback(() => {
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
  }, [autoPlacement]);

  const scheduleMeasure = useCallback(() => {
    if (typeof globalThis.requestAnimationFrame === "undefined") return;
    globalThis.requestAnimationFrame(() => {
      measureAndSetAuto();
    });
  }, [measureAndSetAuto]);

  /**
   * 展开时：rAF 循环 + resize，使 fixed 外框与 trigger 的 `getBoundingClientRect` 同频（同 ui-view）。
   */
  useEffect(() => {
    if (
      !openState.value || typeof globalThis.window === "undefined" ||
      !portalHost
    ) {
      if (!openState.value) {
        portalStyle.value = {};
      }
      return;
    }

    const run = () => {
      const tEl = triggerRef.current;
      if (!tEl) return;
      const tr = tEl.getBoundingClientRect();
      const eff = resolvePlacement(
        isAuto,
        autoPlacement.value,
        placement,
      );
      portalStyle.value = computeDropdownFixedStyle(tr, eff, arrow);
    };
    run();

    let frameIndex = 0;
    let rafLoop = 0;
    let running = true;
    const keepAligned = () => {
      if (!running) return;
      run();
      if (frameIndex === 1 && isAuto && overlayRef.current) {
        scheduleMeasure();
      }
      frameIndex += 1;
      rafLoop = globalThis.requestAnimationFrame(keepAligned);
    };
    rafLoop = globalThis.requestAnimationFrame(keepAligned);

    const onResize = () => run();
    globalThis.window.addEventListener("resize", onResize);
    const vv = globalThis.visualViewport;
    if (vv) {
      vv.addEventListener("resize", onResize);
    }

    return () => {
      running = false;
      globalThis.cancelAnimationFrame(rafLoop);
      globalThis.window.removeEventListener("resize", onResize);
      if (vv) {
        vv.removeEventListener("resize", onResize);
      }
    };
  }, [
    arrow,
    isAuto,
    openState.value,
    placement,
    autoPlacement.value,
    portalHost,
    scheduleMeasure,
  ]);

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

  /**
   * 在 Portal 分支中渲染的菜单与可选箭头，供 createPortal 复用。
   */
  const buildPortalContent = () => {
    const panel = (
      <div
        key="dropdown-overlay-panel"
        id={overlayId}
        role="menu"
        class={twMerge(
          "relative z-10 min-w-[120px] rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg p-1",
          overlayClass,
        )}
      >
        {overlay}
      </div>
    );
    if (!arrow) {
      return panel;
    }
    const eff = resolvePlacement(
      isAuto,
      autoPlacement.value,
      placement,
    ) as ResolvedPopPlacement;
    const arrowParts = getDropdownArrowProps(eff);
    const arrowEl = (
      <span
        key="dropdown-arrow"
        class={twMerge("pointer-events-none z-20", arrowParts.className)}
        style={arrowParts.style}
        aria-hidden
      />
    );
    return (
      <>
        {panel}
        {arrowEl}
      </>
    );
  };

  return (
    <span
      class={twMerge("relative inline-flex", className)}
      onMouseEnter={isHover
        ? (handleTriggerEnter as (e: Event) => void)
        : undefined}
      onMouseLeave={isHover
        ? (handleTriggerLeave as (e: Event) => void)
        : undefined}
    >
      {/* ref 挂在真实按钮上：`getBoundingClientRect` 与「下右」右缘对齐一致，避免外层容器多出空隙 */}
      <span
        ref={(el: HTMLElement | null) => {
          triggerRef.current = el;
        }}
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
      {openState.value && portalHost != null &&
        createPortal(
          <div
            key="dropdown-overlay"
            ref={(el: HTMLElement | null) => {
              overlayRef.current = el;
              if (el && isAuto) {
                scheduleMeasure();
              }
            }}
            class="fixed z-[100] overflow-visible"
            style={portalStyle.value}
            onClick={!isHover ? () => setOpen(false) : undefined}
            onMouseEnter={isHover
              ? (handleOverlayEnter as (e: Event) => void)
              : undefined}
            onMouseLeave={isHover
              ? (handleOverlayLeave as (e: Event) => void)
              : undefined}
          >
            {buildPortalContent()}
          </div>,
          portalHost,
        )}
      {openState.value && portalHost == null && (
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
