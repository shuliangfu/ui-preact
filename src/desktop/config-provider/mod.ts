/**
 * @module @dreamer/ui-preact/config-provider
 * @description
 * **JSR**：`import … from "@dreamer/ui-preact/config-provider"`。全局 **ConfigProvider** 与 **`getConfig` / `setConfig`** 存取（主题模式、尺寸等）。
 *
 * **导出**：`ConfigProvider` 组件；`ConfigProviderProps`；`getConfig`、`setConfig`；`ConfigProviderConfig`、`ThemeMode`。
 * 组件树包裹 Provider 后子组件可读取配置；具体字段含义见 `ConfigProvider.tsx` 与 `config-store.ts` 内注释。
 *
 * @see {@link ./ConfigProvider.tsx} 组件实现与 JSDoc
 */
export { ConfigProvider } from "./ConfigProvider.tsx";
export type { ConfigProviderProps } from "./ConfigProvider.tsx";
export { getConfig, setConfig } from "./config-store.ts";
export type { ConfigProviderConfig, ThemeMode } from "./config-store.ts";
