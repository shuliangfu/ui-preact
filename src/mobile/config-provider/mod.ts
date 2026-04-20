/**
 * @module @dreamer/ui-preact/mobile/config-provider
 * @description
 * **JSR**：`import … from "@dreamer/ui-preact/mobile/config-provider"`。与桌面版相同的全局 **ConfigProvider** 与 `getConfig` / `setConfig`（re-export）。
 *
 * @see {@link ../../desktop/config-provider/mod.ts} 桌面同路径
 */
export { ConfigProvider } from "./ConfigProvider.tsx";
export type {
  ConfigProviderBatchConfig,
  ConfigProviderProps,
} from "./ConfigProvider.tsx";
export { getConfig, setConfig } from "./config-store.ts";
export type { ConfigProviderConfig, ThemeMode } from "./config-store.ts";
