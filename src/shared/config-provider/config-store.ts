/**
 * ConfigProvider 全局配置存储。
 * 供 ConfigProvider 写入、子组件通过 getConfig() 读取（主题、语言、组件默认尺寸等）。
 */

import type { SizeVariant } from "../types.ts";

export type ThemeMode = "light" | "dark" | "system";

export interface ConfigProviderConfig {
  /** 主题：light / dark / system（system 依 prefers-color-scheme 或未设置则 light） */
  theme?: ThemeMode;
  /** 语言/地区，如 zh-CN、en-US */
  locale?: string;
  /** 组件默认尺寸（如 Button、Input） */
  componentSize?: SizeVariant;
  /** 自定义前缀 class（如 ant- 风格时用 ant-btn） */
  prefixCls?: string;
}

let currentConfig: ConfigProviderConfig = {};

/**
 * 获取当前全局配置（由最近的 ConfigProvider 设置）。
 */
export function getConfig(): Readonly<ConfigProviderConfig> {
  return currentConfig;
}

/**
 * 判断两处配置是否一致，避免 ConfigProvider 每帧写入相同内容仍替换对象引用（与 ui-view 文档页一致）。
 */
function configFieldsEqual(
  a: ConfigProviderConfig,
  b: ConfigProviderConfig,
): boolean {
  return (
    Object.is(a.theme, b.theme) &&
    Object.is(a.locale, b.locale) &&
    Object.is(a.componentSize, b.componentSize) &&
    Object.is(a.prefixCls, b.prefixCls)
  );
}

/**
 * 设置全局配置（供 ConfigProvider 内部调用）；值未变时不替换，减轻与 `getConfig()` 联用的重渲染风险。
 */
export function setConfig(config: ConfigProviderConfig): void {
  const next = { ...config };
  if (configFieldsEqual(currentConfig, next)) {
    return;
  }
  currentConfig = next;
}
