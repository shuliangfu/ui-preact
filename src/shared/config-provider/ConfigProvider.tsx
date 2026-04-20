/**
 * ConfigProvider 全局配置（Preact）。
 * 为子树提供主题、语言、组件默认尺寸等；子组件可通过 getConfig() 读取。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import type { SizeVariant } from "../types.ts";
import { setConfig } from "./config-store.ts";
import type { ConfigProviderConfig, ThemeMode } from "./config-store.ts";

export type { ConfigProviderConfig, ThemeMode } from "./config-store.ts";
export { getConfig } from "./config-store.ts";

/** `config` 批量参数；`themeMode` 与 store 中的 `theme` 同义 */
export type ConfigProviderBatchConfig = Partial<
  ConfigProviderConfig & {
    themeMode?: ThemeMode;
  }
>;

export interface ConfigProviderProps {
  /** 批量配置；与顶层 theme / locale 等可同时使用，顶层优先 */
  config?: ConfigProviderBatchConfig;
  /** 主题：light / dark / system */
  theme?: ThemeMode;
  /** 语言/地区，如 zh-CN、en-US */
  locale?: string;
  /** 组件默认尺寸 */
  componentSize?: SizeVariant;
  /** 自定义 class 前缀（可选） */
  prefixCls?: string;
  /** 子节点 */
  children?: ComponentChildren;
  /** 额外 class（作用于包装 div） */
  class?: string;
}

function resolveConfigProviderFields(props: ConfigProviderProps): {
  theme: ThemeMode;
  locale: string | undefined;
  componentSize: SizeVariant | undefined;
  prefixCls: string | undefined;
} {
  const batch = props.config;
  const themeFromBatch = batch?.theme ?? batch?.themeMode;
  const theme = props.theme ?? themeFromBatch ?? "light";
  return {
    theme,
    locale: props.locale ?? batch?.locale,
    componentSize: props.componentSize ?? batch?.componentSize,
    prefixCls: props.prefixCls ?? batch?.prefixCls,
  };
}

/**
 * ConfigProvider：包装子树并写入全局配置。
 */
export function ConfigProvider(props: ConfigProviderProps): JSX.Element {
  const { children, class: className } = props;
  const { theme, locale, componentSize, prefixCls } =
    resolveConfigProviderFields(props);

  setConfig({
    theme,
    locale,
    componentSize,
    prefixCls,
  });

  const resolvedTheme = theme === "system"
    ? (typeof globalThis.matchMedia !== "undefined" &&
        globalThis.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light")
    : theme;
  const themeClass = resolvedTheme === "dark" ? "dark" : "";

  return (
    <div
      class={twMerge("config-provider", themeClass, className)}
      data-theme={resolvedTheme}
      data-locale={locale ?? undefined}
    >
      {children}
    </div>
  );
}
