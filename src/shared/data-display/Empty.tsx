/**
 * Empty 空状态（Preact）。
 * 无数据、空列表占位；支持自定义插图、描述、底部操作。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";

/**
 * Empty 内置文案（仅这些是组件本身渲染的字符串），可被 {@link EmptyProps.messages} 覆盖以适配多语言。
 */
export interface EmptyMessages {
  /** 主描述文案；与 {@link EmptyProps.description} 同义，后者优先 */
  description: string;
  /** 容器 `aria-label`，供屏幕阅读器报读 */
  ariaLabel: string;
}

/** 默认中文文案 */
export const defaultEmptyMessages: EmptyMessages = {
  description: "暂无数据",
  ariaLabel: "空状态",
};

export interface EmptyProps {
  /**
   * 主描述文案；不传则用 {@link EmptyProps.messages}.description ?? {@link defaultEmptyMessages}.description。
   * 传 `null` 显式不显示描述。
   */
  description?: ComponentChildren | null;
  /** 自定义插图（图片或节点）；不传则使用默认占位图样式 */
  image?: ComponentChildren;
  /** 是否使用简单占位图（线条图标风格） */
  simple?: boolean;
  /** 底部区域（如「新建」按钮） */
  footer?: ComponentChildren;
  /** 额外 class（容器） */
  class?: string;
  /** 插图容器 class */
  imageClass?: string;
  /** 描述 class */
  descriptionClass?: string;
  /** 多语言/自定义文案；未传字段走 {@link defaultEmptyMessages} */
  messages?: Partial<EmptyMessages>;
}

/**
 * Empty：空状态占位。
 */
export function Empty(props: EmptyProps): JSX.Element {
  const {
    image,
    simple = false,
    footer,
    class: className,
    imageClass,
    descriptionClass,
    messages,
  } = props;
  /** 合并默认中文文案与外部传入 messages */
  const m = { ...defaultEmptyMessages, ...messages };
  const description = props.description !== undefined
    ? props.description
    : m.description;

  const defaultImage = simple
    ? (
      <svg
        class="w-16 h-16 text-slate-300 dark:text-slate-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.5m-2.5 0h-5M6 13V6a2 2 0 012-2h8a2 2 0 012 2v7M6 13v5a2 2 0 002 2h8a2 2 0 002-2v-5m0-8h-2.5M6 13h5"
        />
      </svg>
    )
    : (
      <svg
        class="w-24 h-24 text-slate-200 dark:text-slate-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    );

  return (
    <div
      class={twMerge(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className,
      )}
      role="status"
      aria-label={m.ariaLabel}
    >
      <div
        class={twMerge("shrink-0 flex items-center justify-center", imageClass)}
      >
        {image != null ? image : defaultImage}
      </div>
      {description != null && (
        <p
          class={twMerge(
            "mt-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs",
            descriptionClass,
          )}
        >
          {description}
        </p>
      )}
      {footer != null && <div class="mt-6">{footer}</div>}
    </div>
  );
}
