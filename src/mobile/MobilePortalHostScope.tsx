/**
 * @fileoverview 文档站 / 嵌入式预览：将 BottomSheet、ActionSheet 等浮层的 Portal 限制在「模拟视口」内，而非整页 `document.body`。
 * 通过 `transform: translateZ(0)` 建立 `position: fixed` 的包含块，使遮罩与抽屉相对于本 Scope 铺满。
 *
 * **Preact**：使用 `useRef` 持有锚点 DOM，`Context` 向子树暴露 `getHost`。
 */

import { createContext } from "preact";
import type { ComponentChildren, JSX } from "preact";
import { useCallback, useMemo, useRef } from "preact/hooks";
import { twMerge } from "tailwind-merge";

/**
 * Context 承载对象：`getHost` 为稳定函数，内部读取 ref.current。
 */
export interface MobilePortalHostContextValue {
  /**
   * 返回当前 Portal 锚点 DOM；未挂载或未设 ref 时为 `null`/`undefined`。
   */
  getHost: () => HTMLElement | null | undefined;
}

/** 无 Provider 时为 `null` */
export const MobilePortalHostContext = createContext<
  MobilePortalHostContextValue | null
>(null);

/** {@link MobilePortalHostScope} 的 props */
export interface MobilePortalHostScopeProps {
  /** 可滚动主内容等；与底部锚点层共用同一「机内视口」 */
  children?: ComponentChildren;
  /**
   * 包裹层额外 class；须保持纵向 flex 与 `min-h-0`，以便在 flex 布局中占满剩余屏高。
   */
  class?: string;
}

/**
 * 包住模拟手机/内嵌移动预览的可交互区域：子组件树内的 BottomSheet、ActionSheet 会优先 Portal 到本层叠锚点。
 *
 * @param props - 子节点与可选 class
 */
export function MobilePortalHostScope(
  props: MobilePortalHostScopeProps,
): JSX.Element {
  /** Portal 真实挂载的 DOM 节点，由 ref 回调写入 */
  const hostRef = useRef<HTMLElement | null>(null);

  /**
   * 供 {@link MobilePortalHostContext} 消费：每次调用读取当前锚点。
   *
   * @returns 当前锚点元素，未挂载时为 `null`
   */
  const getHost = useCallback((): HTMLElement | null | undefined => {
    return hostRef.current;
  }, []);

  /** 稳定引用，避免无意义重渲染子树 */
  const ctxValue = useMemo(
    (): MobilePortalHostContextValue => ({ getHost }),
    [getHost],
  );

  /**
   * 将锚点层 DOM 与 ref 同步。
   *
   * @param el - 原生元素或卸载时的 `null`
   */
  const setHostRef = (el: HTMLElement | null) => {
    hostRef.current = el;
  };

  return (
    <MobilePortalHostContext.Provider value={ctxValue}>
      <div
        class={twMerge(
          "relative flex min-h-0 flex-1 flex-col [transform:translateZ(0)]",
          props.class,
        )}
      >
        {props.children}
        {
          /*
          叠在内容之上、不参与命中检测；浮层根节点自行 `pointer-events-auto`
        */
        }
        <div
          ref={setHostRef}
          class="pointer-events-none absolute inset-0 z-[120]"
          aria-hidden="true"
          data-dreamer-mobile-portal-host=""
        />
      </div>
    </MobilePortalHostContext.Provider>
  );
}
