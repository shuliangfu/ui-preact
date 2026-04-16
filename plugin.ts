/**
 * @module @dreamer/ui-preact/plugin
 * @packageDocumentation
 *
 * @description
 * **JSR**：`import … from "@dreamer/ui-preact/plugin"`。为 **Tailwind CSS v4** 提供按需 **content** 扫描：在 dweb `onInit` 中解析项目对 `@dreamer/ui-preact` 的引用，生成仅含 `@source "相对路径";` 的 CSS 片段文件。
 *
 * ### 行为概要
 * - 输出文件路径由 **`outputPath`** 指定；业务在 `tailwind.css` 中 `@import` 该文件即可让 Tailwind 扫描实际用到的组件源路径。
 * - `@source` 路径相对于生成文件所在目录书写，避免把本机绝对路径写入仓库。
 * - 插件入口：**{@link uiPreactTailwindPlugin}**（返回 `Plugin`，含 `onInit`）。
 *
 * ### 使用顺序
 * 先注册本插件，再注册 Tailwind 官方/封装插件；并在样式入口 `@import` 生成的 `@source` 文件。
 *
 * @see {@link uiPreactTailwindPlugin} 工厂函数与选项说明
 */

import type { Plugin } from "@dreamer/plugin";
import type { ServiceContainer } from "@dreamer/service";
import {
  cwd,
  dirname,
  existsSync,
  fromFileUrl,
  join,
  mkdir,
  readdir,
  readTextFile,
  relative,
  writeTextFile,
} from "@dreamer/runtime-adapter";

/** 用于判定「是否为 @dreamer/ui-preact 包根」的标记文件（相对包根） */
const PACKAGE_ROOT_MARKER = "src/mod.ts";

/**
 * dweb `deno task build` 会把应用打进 `dist/server.js`，插件代码里的 `import.meta.url` 会落在 `…/dist/`，
 * 不再是 `ui-view/plugin.ts`。若仍用 `dirname(import.meta.url)` 作为包根，会得到 `docs/dist`，
 * 只会扫到构建产物里零散的 `dist/src/**`，`mergeIntrinsicIconSources` 也扫不全 icons，最终 @source 仅百余行。
 * 从进程 cwd 逐级向上查找同时存在 `plugin.ts` 与 `src/mod.ts` 的目录，即可在 dev 与 build 下都得到真实包根。
 *
 * @returns 包根绝对路径；未找到时返回 null
 */
function findUiPreactPackageRootFromCwd(): string | null {
  let dir = cwd();
  const visited = new Set<string>();
  for (let i = 0; i < 20; i++) {
    if (visited.has(dir)) break;
    visited.add(dir);
    const pluginFile = join(dir, "plugin.ts");
    const marker = join(dir, PACKAGE_ROOT_MARKER);
    if (existsSync(pluginFile) && existsSync(marker)) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * 解析到的目录是否像真实的 ui-view 源码根（含完整 `src/shared`），而非误选的 `dist`。
 *
 * @param dir - 待检测的绝对路径
 */
function looksLikeUiPreactSourceRoot(dir: string): boolean {
  /** `dist/` 下通常没有 `plugin.ts`，可区分「打包产物目录」与真实包根 */
  return existsSync(join(dir, "plugin.ts")) &&
    existsSync(join(dir, PACKAGE_ROOT_MARKER)) &&
    existsSync(join(dir, "src/shared/basic/Icon.tsx"));
}

/** 插件配置 */
export interface UiPreactTailwindContentPluginOptions {
  /** 生成的 @source 文件路径（相对 cwd 或绝对），用户需在 tailwind.css 中 @import */
  outputPath: string;
  /** 扫描项目源码的目录（相对 cwd，默认 "src"） */
  scanPath?: string;
  /** @dreamer/ui-preact 包根目录（可选；不传则用插件所在包根） */
  packageRoot?: string;
}

/**
 * 组件名 → 相对包根的源码路径列表（新增组件时需在本对象中补全对应路径）。
 *
 * 注意：
 * - 导出组件名与「文件导出名」不一致时须多键指向同一文件（如 Title 与 Typography、Toast 与 ToastContainer）。
 * - `Icon*` 单品过多：任意 `Icon` 前缀导入会触发 mergeIntrinsicIconSources 递归扫描 `icons/`。
 * - Button / ButtonGroup / Link 依赖 `button-variants.ts` 中的类名字符串，映射中须同时列出该文件。
 * - Input、Select、DatePicker 等依赖 `input-focus-ring.ts` 中的 `focus:ring-*`、`has-[input:focus]:*`、`pickerTriggerSurface` 等类名字符串，映射中须同时列出该文件（与 button-variants 同理）。
 * - DatePicker / DateTimePicker / TimePicker 依赖 `picker-portal-utils.ts` 中的 `pickerTimeListScrollClass`（含隐藏滚动条、列宽等任意类），须一并扫描，否则按需构建会丢样式。
 * - RichTextEditor 从同文件引用 `getFormPortalBodyHost`，若需该文件内其它类名亦须映射。
 * - MarkdownEditor 使用 `@dreamer/markdown` 的 `parse` 与桌面 `Tooltip`；须映射 `MarkdownEditor.tsx`、`Tooltip.tsx`、`input-focus-ring.ts`。
 * - 单文件图标（`icons/*.tsx`）、`Calendar.tsx`、`ChartBase.tsx` 等被组件 import 时须写入对应组件的路径列表；`getContentPaths` 会去重。
 * - 纯函数 / store（message、toast、getConfig 等）不含 Tailwind class，无需映射。
 * - `desktop/form`、`mobile/form` 下若仅为 `export * from ../../shared/form/...` 的薄再导出，只列 **shared 实现文件** 即可，不必重复写 D/M 路径。
 */

const COMPONENT_PATHS: Record<string, string[]> = {
  "Table": [
    "src/desktop/data-display/Table.tsx",
    "src/shared/form/DatePicker.tsx",
    "src/shared/form/TimePicker.tsx",
    "src/shared/form/picker-portal-utils.ts",
    "src/shared/form/picker-trigger-icon.ts",
    "src/shared/form/picker-calendar-nav.tsx",
    "src/shared/data-display/Calendar.tsx",
    "src/shared/data-display/calendar-utils.ts",
    "src/shared/basic/icons/Calendar.tsx",
    "src/shared/basic/icons/ChevronLeft.tsx",
    "src/shared/basic/icons/ChevronRight.tsx",
    "src/shared/basic/icons/Clock.tsx",
    "src/shared/form/input-focus-ring.ts",
    "src/shared/basic/icons/ChevronDown.tsx",
    "src/shared/basic/icons/ChevronUp.tsx",
  ],
  "Dialog": [
    "src/desktop/feedback/Dialog.tsx",
    "src/shared/basic/Button.tsx",
    "src/shared/basic/button-variants.ts",
    "src/desktop/feedback/Modal.tsx",
    "src/shared/basic/icons/Close.tsx",
    "src/shared/basic/icons/ExitFullscreen.tsx",
    "src/shared/basic/icons/Maximize2.tsx",
  ],
  "Modal": [
    "src/desktop/feedback/Modal.tsx",
    "src/shared/basic/icons/Close.tsx",
    "src/shared/basic/icons/ExitFullscreen.tsx",
    "src/shared/basic/icons/Maximize2.tsx",
  ],
  "Popconfirm": [
    "src/desktop/feedback/Popconfirm.tsx",
    "src/shared/basic/Button.tsx",
    "src/shared/basic/button-variants.ts",
    "src/shared/basic/icons/HelpCircle.tsx",
  ],
  "Popover": [
    "src/desktop/feedback/Popover.tsx",
  ],
  "Tooltip": [
    "src/shared/feedback/Tooltip.tsx",
  ],
  "Cascader": [
    "src/shared/form/Cascader.tsx",
    "src/shared/basic/icons/ChevronDown.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "DatePicker": [
    "src/shared/form/DatePicker.tsx",
    "src/shared/form/picker-portal-utils.ts",
    "src/shared/form/picker-trigger-icon.ts",
    "src/shared/form/picker-calendar-nav.tsx",
    "src/shared/data-display/Calendar.tsx",
    "src/shared/data-display/calendar-utils.ts",
    "src/shared/basic/icons/Calendar.tsx",
    "src/shared/basic/icons/ChevronLeft.tsx",
    "src/shared/basic/icons/ChevronRight.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "DateTimePicker": [
    "src/shared/form/DateTimePicker.tsx",
    "src/shared/form/picker-portal-utils.ts",
    "src/shared/form/picker-trigger-icon.ts",
    "src/shared/form/picker-calendar-nav.tsx",
    "src/shared/data-display/Calendar.tsx",
    "src/shared/data-display/calendar-utils.ts",
    "src/shared/basic/icons/Calendar.tsx",
    "src/shared/basic/icons/ChevronLeft.tsx",
    "src/shared/basic/icons/ChevronRight.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "MultiSelect": [
    "src/shared/form/MultiSelect.tsx",
    "src/shared/basic/icons/ChevronDown.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "Select": [
    "src/shared/form/Select.tsx",
    "src/shared/basic/icons/ChevronDown.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "Transfer": [
    "src/shared/form/Transfer.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "TreeSelect": [
    "src/shared/form/TreeSelect.tsx",
    "src/shared/basic/icons/ChevronDown.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "Breadcrumb": [
    "src/desktop/navigation/Breadcrumb.tsx",
    "src/shared/basic/Link.tsx",
    "src/shared/basic/button-variants.ts",
    "src/shared/basic/icons/ChevronRight.tsx",
  ],
  "Dropdown": [
    "src/desktop/navigation/Dropdown.tsx",
  ],
  "ActionSheet": [
    "src/mobile/MobilePortalHostScope.tsx",
    "src/mobile/feedback/ActionSheet.tsx",
  ],
  "BottomSheet": [
    "src/mobile/MobilePortalHostScope.tsx",
    "src/mobile/feedback/BottomSheet.tsx",
    "src/shared/basic/icons/Close.tsx",
  ],
  "PullRefresh": [
    "src/mobile/feedback/PullRefresh.tsx",
  ],
  "SwipeCell": [
    "src/mobile/feedback/SwipeCell.tsx",
  ],
  /** D/M 均有 NavBar 实现，按需扫描两处源码 */
  "NavBar": [
    "src/desktop/navigation/NavBar.tsx",
    "src/mobile/navigation/NavBar.tsx",
    "src/shared/layout/Container.tsx",
    "src/shared/basic/icons/ChevronLeft.tsx",
  ],
  "TabBar": [
    "src/mobile/navigation/TabBar.tsx",
  ],
  "MobilePortalHostScope": [
    "src/mobile/MobilePortalHostScope.tsx",
  ],
  "Avatar": [
    "src/shared/basic/Avatar.tsx",
  ],
  "Badge": [
    "src/shared/basic/Badge.tsx",
  ],
  /**
   * Button 与 {@link ButtonGroup} 共用源码；尺寸/变体类在 `button-variants.ts`，须一并扫描否则按需构建会丢类。
   */
  "Button": [
    "src/shared/basic/Button.tsx",
    "src/shared/basic/button-variants.ts",
  ],
  /** 与 Button 同文件导出，仅映射 Button 时按需会漏扫 ButtonGroup 内的 class */
  "ButtonGroup": [
    "src/shared/basic/Button.tsx",
    "src/shared/basic/button-variants.ts",
  ],
  "Icon": [
    "src/shared/basic/Icon.tsx",
  ],
  /**
   * 链接按钮模式与 Button 共用 `button-variants.ts` 中的 Tailwind 片段，须纳入 @source。
   */
  "Link": [
    "src/shared/basic/Link.tsx",
    "src/shared/basic/button-variants.ts",
  ],
  "Skeleton": [
    "src/shared/basic/Skeleton.tsx",
  ],
  "Spinner": [
    "src/shared/basic/Spinner.tsx",
  ],
  /**
   * 实际导出名为 Title / Paragraph / Text；若只映射 Typography，按需 @source 会漏扫，
   * 导致如 dark:text-gray-200 等仅写在 Typography.tsx 内的工具类不会进入最终 CSS。
   */
  "Title": [
    "src/shared/basic/Typography.tsx",
  ],
  "Paragraph": [
    "src/shared/basic/Typography.tsx",
  ],
  "Text": [
    "src/shared/basic/Typography.tsx",
  ],
  "Typography": [
    "src/shared/basic/Typography.tsx",
  ],
  "ChartBar": [
    "src/shared/charts/ChartBar.tsx",
    "src/shared/charts/ChartBase.tsx",
    "src/shared/charts/types.ts",
  ],
  "ChartBase": [
    "src/shared/charts/ChartBase.tsx",
    "src/shared/charts/types.ts",
  ],
  "ChartBubble": [
    "src/shared/charts/ChartBubble.tsx",
    "src/shared/charts/ChartBase.tsx",
    "src/shared/charts/types.ts",
  ],
  "ChartDoughnut": [
    "src/shared/charts/ChartDoughnut.tsx",
    "src/shared/charts/ChartBase.tsx",
    "src/shared/charts/types.ts",
  ],
  "ChartLine": [
    "src/shared/charts/ChartLine.tsx",
    "src/shared/charts/ChartBase.tsx",
    "src/shared/charts/types.ts",
  ],
  "ChartPie": [
    "src/shared/charts/ChartPie.tsx",
    "src/shared/charts/ChartBase.tsx",
    "src/shared/charts/types.ts",
  ],
  "ChartPolarArea": [
    "src/shared/charts/ChartPolarArea.tsx",
    "src/shared/charts/ChartBase.tsx",
    "src/shared/charts/types.ts",
  ],
  "ChartRadar": [
    "src/shared/charts/ChartRadar.tsx",
    "src/shared/charts/ChartBase.tsx",
    "src/shared/charts/types.ts",
  ],
  "ChartScatter": [
    "src/shared/charts/ChartScatter.tsx",
    "src/shared/charts/ChartBase.tsx",
    "src/shared/charts/types.ts",
  ],
  "ConfigProvider": [
    "src/shared/config-provider/ConfigProvider.tsx",
  ],
  "Calendar": [
    "src/shared/data-display/Calendar.tsx",
    "src/shared/data-display/calendar-utils.ts",
  ],
  "Card": [
    "src/shared/data-display/Card.tsx",
  ],
  "Carousel": [
    "src/shared/data-display/Carousel.tsx",
    "src/shared/data-display/Image.tsx",
    "src/shared/basic/icons/ChevronLeft.tsx",
    "src/shared/basic/icons/ChevronRight.tsx",
  ],
  "CodeBlock": [
    "src/shared/data-display/CodeBlock.tsx",
    "src/shared/basic/icons/Copy.tsx",
  ],
  "Collapse": [
    "src/shared/data-display/Collapse.tsx",
    "src/shared/basic/icons/ChevronDown.tsx",
  ],
  "Comment": [
    "src/shared/data-display/Comment.tsx",
  ],
  "Descriptions": [
    "src/shared/data-display/Descriptions.tsx",
  ],
  "Empty": [
    "src/shared/data-display/Empty.tsx",
  ],
  "Image": [
    "src/shared/data-display/Image.tsx",
  ],
  "ImageViewer": [
    "src/shared/data-display/ImageViewer.tsx",
    "src/shared/basic/icons/ChevronLeft.tsx",
    "src/shared/basic/icons/ChevronRight.tsx",
    "src/shared/basic/icons/Close.tsx",
    "src/shared/basic/icons/RotateCcw.tsx",
    "src/shared/basic/icons/RotateCw.tsx",
    "src/shared/basic/icons/ZoomIn.tsx",
    "src/shared/basic/icons/ZoomOut.tsx",
  ],
  "List": [
    "src/shared/data-display/List.tsx",
  ],
  "ScrollList": [
    "src/mobile/data-display/ScrollList.tsx",
    "src/mobile/feedback/PullRefresh.tsx",
    "src/shared/data-display/List.tsx",
    "src/shared/feedback/controlled-open.ts",
  ],
  "Segmented": [
    "src/shared/data-display/Segmented.tsx",
  ],
  "Statistic": [
    "src/shared/data-display/Statistic.tsx",
  ],
  "Tag": [
    "src/shared/data-display/Tag.tsx",
  ],
  "Timeline": [
    "src/shared/data-display/Timeline.tsx",
  ],
  "Tree": [
    "src/shared/data-display/Tree.tsx",
    "src/shared/basic/icons/ChevronRight.tsx",
  ],
  "Alert": [
    "src/shared/feedback/Alert.tsx",
    "src/shared/basic/icons/AlertCircle.tsx",
    "src/shared/basic/icons/CheckCircle.tsx",
    "src/shared/basic/icons/Info.tsx",
    "src/shared/basic/icons/XCircle.tsx",
  ],
  "Drawer": [
    "src/shared/feedback/Drawer.tsx",
    "src/shared/basic/icons/Close.tsx",
  ],
  "Notification": [
    "src/shared/feedback/Notification.tsx",
    "src/shared/basic/icons/AlertCircle.tsx",
    "src/shared/basic/icons/Bell.tsx",
    "src/shared/basic/icons/CheckCircle.tsx",
    "src/shared/basic/icons/Info.tsx",
    "src/shared/basic/icons/XCircle.tsx",
  ],
  "Progress": [
    "src/shared/feedback/Progress.tsx",
  ],
  "Result": [
    "src/shared/feedback/Result.tsx",
    "src/shared/basic/icons/AlertCircle.tsx",
    "src/shared/basic/icons/CheckCircle.tsx",
    "src/shared/basic/icons/HelpCircle.tsx",
    "src/shared/basic/icons/Info.tsx",
    "src/shared/basic/icons/ShieldAlert.tsx",
    "src/shared/basic/icons/XCircle.tsx",
  ],
  "Toast": [
    "src/shared/feedback/Toast.tsx",
  ],
  /** 包内 JSX 导出名为 *Container，须单独映射否则只用 Toast 时不会扫 Toast.tsx */
  "ToastContainer": [
    "src/shared/feedback/Toast.tsx",
  ],
  "MessageContainer": [
    "src/shared/feedback/Message.tsx",
    "src/shared/basic/icons/AlertCircle.tsx",
    "src/shared/basic/icons/CheckCircle.tsx",
    "src/shared/basic/icons/Info.tsx",
    "src/shared/basic/icons/XCircle.tsx",
  ],
  "NotificationContainer": [
    "src/shared/feedback/Notification.tsx",
    "src/shared/basic/icons/AlertCircle.tsx",
    "src/shared/basic/icons/Bell.tsx",
    "src/shared/basic/icons/CheckCircle.tsx",
    "src/shared/basic/icons/Info.tsx",
    "src/shared/basic/icons/XCircle.tsx",
  ],
  "AutoComplete": [
    "src/shared/form/AutoComplete.tsx",
  ],
  "Checkbox": [
    "src/shared/form/Checkbox.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "CheckboxGroup": [
    "src/shared/form/CheckboxGroup.tsx",
    "src/shared/form/Checkbox.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "ColorPicker": [
    "src/shared/form/ColorPicker.tsx",
    "src/shared/form/input-focus-ring.ts",
    "src/shared/basic/icons/Palette.tsx",
  ],
  "Form": [
    "src/shared/form/Form.tsx",
  ],
  "FormItem": [
    "src/shared/form/FormItem.tsx",
  ],
  "FormList": [
    "src/shared/form/FormList.tsx",
  ],
  "Input": [
    "src/shared/form/Input.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "InputNumber": [
    "src/shared/form/InputNumber.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "Mentions": [
    "src/shared/form/Mentions.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  /** 工具栏与 RichTextEditor 同款样式类 + Tooltip；运行时依赖 `jsr:@dreamer/markdown` */
  "MarkdownEditor": [
    "src/shared/form/MarkdownEditor.tsx",
    "src/shared/feedback/Tooltip.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "Password": [
    "src/shared/form/Password.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "Radio": [
    "src/shared/form/Radio.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "RadioGroup": [
    "src/shared/form/RadioGroup.tsx",
    "src/shared/form/Radio.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "Rate": [
    "src/shared/form/Rate.tsx",
  ],
  "RichTextEditor": [
    "src/shared/form/RichTextEditor.tsx",
    "src/shared/form/picker-portal-utils.ts",
    "src/shared/form/input-focus-ring.ts",
    "src/desktop/feedback/Modal.tsx",
    "src/shared/basic/icons/Close.tsx",
    "src/shared/basic/icons/ExitFullscreen.tsx",
    "src/shared/basic/icons/Maximize2.tsx",
    "src/shared/basic/Button.tsx",
    "src/shared/basic/button-variants.ts",
    "src/shared/basic/icons/Type.tsx",
    "src/shared/form/Input.tsx",
  ],
  "Search": [
    "src/shared/form/Search.tsx",
    "src/shared/form/input-focus-ring.ts",
    "src/shared/basic/icons/Search.tsx",
  ],
  "Slider": [
    "src/shared/form/Slider.tsx",
  ],
  "Switch": [
    "src/shared/form/Switch.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "Textarea": [
    "src/shared/form/Textarea.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "TimePicker": [
    "src/shared/form/TimePicker.tsx",
    "src/shared/form/picker-portal-utils.ts",
    "src/shared/form/picker-trigger-icon.ts",
    "src/shared/basic/icons/Clock.tsx",
    "src/shared/form/input-focus-ring.ts",
  ],
  "Upload": [
    "src/shared/form/Upload.tsx",
    "src/shared/form/chunked-upload.ts",
    "src/shared/form/upload-http.ts",
    "src/shared/basic/Icon.tsx",
    "src/shared/basic/icons/Upload.tsx",
  ],
  "Accordion": [
    "src/shared/layout/Accordion.tsx",
    "src/shared/basic/icons/ChevronDown.tsx",
  ],
  "Container": [
    "src/shared/layout/Container.tsx",
  ],
  "Divider": [
    "src/shared/layout/Divider.tsx",
  ],
  "Grid": [
    "src/shared/layout/Grid.tsx",
  ],
  "Hero": [
    "src/shared/layout/Hero.tsx",
  ],
  "Stack": [
    "src/shared/layout/Stack.tsx",
  ],
  "Tabs": [
    "src/shared/layout/Tabs.tsx",
  ],
  "Affix": [
    "src/shared/navigation/Affix.tsx",
  ],
  "Anchor": [
    "src/shared/navigation/Anchor.tsx",
  ],
  "BackTop": [
    "src/shared/navigation/BackTop.tsx",
    "src/shared/basic/icons/ChevronUp.tsx",
  ],
  "Menu": [
    "src/shared/navigation/Menu.tsx",
    "src/shared/basic/icons/ChevronRight.tsx",
  ],
  "PageHeader": [
    "src/shared/navigation/PageHeader.tsx",
    "src/shared/basic/icons/ArrowLeft.tsx",
  ],
  "Pagination": [
    "src/shared/navigation/Pagination.tsx",
    "src/shared/basic/icons/ChevronLeft.tsx",
    "src/shared/basic/icons/ChevronRight.tsx",
  ],
  "Sidebar": [
    "src/shared/navigation/Sidebar.tsx",
    "src/shared/basic/Link.tsx",
    "src/shared/basic/button-variants.ts",
    "src/shared/basic/icons/ChevronDown.tsx",
    "src/shared/basic/icons/ChevronRight.tsx",
  ],
  "Steps": [
    "src/shared/navigation/Steps.tsx",
    "src/shared/basic/icons/Check.tsx",
  ],
};

/**
 * 匹配具名导入：主包、子路径（如 @dreamer/ui-preact/mobile、/form）、jsr: spec。
 * 注意：仅 `@dreamer/ui-preact` 不含后续路径时，`/mobile` 会留在引号内导致整段匹配失败，故必须允许 `/…`。
 */
const RE_NAMED_IMPORT =
  /import\s*(?:type\s*)?\{\s*([^}]+)\}\s*from\s*["'](?:@dreamer\/ui-preact(?:\/[^"']*)?|jsr:[^"']*ui-preact[^"']*)["']/g;

function parseNamedImportSpecifiers(specifiers: string): string[] {
  return specifiers
    .split(",")
    .map((s) => s.trim().split(/\s+as\s+/i)[0].trim())
    .filter(Boolean);
}

async function collectTsTsx(
  dir: string,
  baseDir: string,
  out: string[],
): Promise<void> {
  const entries = await readdir(dir);
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      await collectTsTsx(full, baseDir, out);
    } else if (
      entry.isFile &&
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))
    ) {
      out.push(full);
    }
  }
}

function extractUsedNames(content: string): string[] {
  const names = new Set<string>();
  let m: RegExpExecArray | null;
  RE_NAMED_IMPORT.lastIndex = 0;
  while ((m = RE_NAMED_IMPORT.exec(content)) !== null) {
    for (const name of parseNamedImportSpecifiers(m[1])) {
      names.add(name);
    }
  }
  return Array.from(names);
}

/** 根据用到的组件名和包根，得到应加入 @source 的绝对路径列表（去重排序） */
function getContentPaths(usedNames: string[], packageRoot: string): string[] {
  const root = packageRoot.replace(/\/+$/, "");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const name of usedNames) {
    const paths = COMPONENT_PATHS[name];
    if (!paths) continue;
    for (const rel of paths) {
      const full = `${root}/${rel}`.replace(/\/+/g, "/");
      if (seen.has(full)) continue;
      seen.add(full);
      out.push(full);
    }
  }
  return out.sort();
}

/**
 * 内置图标以 `IconXxx` 单独导出、文件分散在 icons/ 子目录；不可能在 COMPONENT_PATHS 中逐一手写。
 * 若扫描结果中出现任意 `Icon` 前缀组件名，则递归加入 `src/shared/basic/icons` 下全部 `.tsx` 供 Tailwind 收集 class。
 *
 * @param usedNames - 从项目源码提取的具名导入符号
 * @param packageRoot - ui-view 包根绝对路径
 * @param paths - getContentPaths 结果，本函数会原地追加并重新排序
 */
async function mergeIntrinsicIconSources(
  usedNames: Iterable<string>,
  packageRoot: string,
  paths: string[],
): Promise<void> {
  let anyIcon = false;
  for (const n of usedNames) {
    if (/^Icon[A-Z]/.test(n)) {
      anyIcon = true;
      break;
    }
  }
  if (!anyIcon) return;
  const iconRoot = join(packageRoot, "src/shared/basic/icons");
  const iconFiles: string[] = [];
  try {
    await collectTsTsx(iconRoot, iconRoot, iconFiles);
  } catch {
    return;
  }
  const seen = new Set(paths);
  for (const f of iconFiles) {
    if (seen.has(f)) continue;
    seen.add(f);
    paths.push(f);
  }
  paths.sort();
}

/**
 * 将组件源码绝对路径转为写入 `ui-view-sources.css` 的 `@source` 引用串。
 * Tailwind v4 按「当前 CSS 文件所在目录」解析相对路径；若写入本机绝对路径（如 `/Users/...`），
 * 在其它机器或 CI（路径不同）上 `deno task build` 会找不到文件或 Tailwind 报错。
 *
 * @param sourcesCssDir - 生成的 `ui-view-sources.css` 所在目录（绝对路径）
 * @param absFilePath - 待扫描的 `.ts`/`.tsx` 绝对路径
 * @returns 以 `./` 或 `../` 开头的相对路径（正斜杠）
 */
function toAtSourceSpecifier(
  sourcesCssDir: string,
  absFilePath: string,
): string {
  let rel = relative(sourcesCssDir, absFilePath);
  if (rel === "" || rel === ".") {
    return ".";
  }
  rel = rel.replace(/\\/g, "/");
  /** Windows 跨盘符时 relative 可能返回 `D:/...` 绝对路径，勿再加 `./` 前缀 */
  if (/^[A-Za-z]:\//.test(rel) || rel.startsWith("/")) {
    return rel;
  }
  if (!rel.startsWith(".")) {
    return `./${rel}`;
  }
  return rel;
}

/**
 * 创建 ui-view Tailwind 按需 content 插件
 *
 * 参数：outputPath（生成文件路径）、scanPath（扫描目录）、packageRoot（可选）。
 * 在 onInit 时即扫描导入的 ui-view 组件，生成只含 @source 的 CSS，Tailwind 扫描该文件即可收集 class。
 */
export function uiPreactTailwindPlugin(
  options: UiPreactTailwindContentPluginOptions,
): Plugin {
  const {
    outputPath,
    scanPath = "src",
    packageRoot: optionPackageRoot,
  } = options;

  const resolvePackageRoot = (): string => {
    if (optionPackageRoot) {
      return optionPackageRoot.startsWith("/")
        ? optionPackageRoot
        : join(cwd(), optionPackageRoot);
    }
    const fromMeta = dirname(fromFileUrl(import.meta.url));
    if (looksLikeUiPreactSourceRoot(fromMeta)) {
      return fromMeta;
    }
    const fromCwd = findUiPreactPackageRootFromCwd();
    if (fromCwd != null) {
      return fromCwd;
    }
    return fromMeta;
  };

  return {
    name: "ui-preact-tailwind-content",
    version: "0.1.0",

    async onInit(container: ServiceContainer): Promise<void> {
      const logger = container.tryGet<
        { info: (msg: string) => void; debug: (msg: string) => void }
      >(
        "logger",
      );
      const root = cwd();
      const scanDir = join(root, scanPath);

      const files: string[] = [];
      try {
        await collectTsTsx(scanDir, scanDir, files);
      } catch (e) {
        if (logger) {
          logger.info(`[ui-preact-tailwind-content] 扫描目录跳过: ${e}`);
        }
        return;
      }

      const usedNames = new Set<string>();
      for (const filePath of files) {
        try {
          const content = await readTextFile(filePath);
          for (const name of extractUsedNames(content)) {
            usedNames.add(name);
          }
        } catch {
          // ignore
        }
      }

      const names = Array.from(usedNames);
      if (names.length === 0) {
        if (logger) {
          logger.info(
            "[ui-preact-tailwind-content] 未发现 @dreamer/ui-preact 引用，跳过生成",
          );
        }
        return;
      }

      const pkgRoot = resolvePackageRoot();
      const paths = getContentPaths(names, pkgRoot);
      await mergeIntrinsicIconSources(names, pkgRoot, paths);
      /** 与 getContentPaths / mergeIntrinsicIconSources 内去重双保险，保证写入的 @source 路径唯一 */
      const uniqueSortedPaths = Array.from(new Set(paths)).sort();

      const outAbs = outputPath.startsWith("/")
        ? outputPath
        : join(root, outputPath);
      const sourcesCssDir = dirname(outAbs);
      const cssContent = uniqueSortedPaths
        .map((p) => `@source "${toAtSourceSpecifier(sourcesCssDir, p)}";`)
        .join("\n") + "\n";

      await mkdir(sourcesCssDir, { recursive: true });
      await writeTextFile(outAbs, cssContent);

      if (logger) {
        logger.debug(
          `[ui-preact-tailwind-content] 已生成 ${uniqueSortedPaths.length} 个`,
        );
        logger.debug(
          `@source → ${outputPath}`,
        );
      }
    },
  };
}
