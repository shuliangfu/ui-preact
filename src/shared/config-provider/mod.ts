/**
 * ConfigProvider 与全局配置（ANALYSIS 3.10）。
 * ConfigProvider 直接返回 Preact VNode。
 */
export { ConfigProvider } from "./ConfigProvider.tsx";
export type { ConfigProviderProps } from "./ConfigProvider.tsx";
export { getConfig, setConfig } from "./config-store.ts";
export type { ConfigProviderConfig, ThemeMode } from "./config-store.ts";
