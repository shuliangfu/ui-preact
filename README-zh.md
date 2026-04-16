# 📦 @dreamer/ui-preact

面向 Dreamer 生态的 **Preact** UI 组件库，使用 **Tailwind CSS v4**
编写样式，支持浅色/深色主题与**桌面端 + 移动端**入口。实现与
[`@dreamer/ui-view`](https://jsr.io/@dreamer/ui-view)（View
运行时）同源对齐迁移；本包面向 **Preact 10** 与 **`@preact/signals`**。

**English:** [README.md](./README.md)

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)

---

## ⬇️ 安装

```bash
# Deno
deno add jsr:@dreamer/ui-preact

# Bun
bunx jsr add @dreamer/ui-preact
```

---

## 📂 入口

| 入口                                 | 说明                                   |
| ------------------------------------ | -------------------------------------- |
| `@dreamer/ui-preact`                 | 桌面端聚合（shared + form 等）         |
| `@dreamer/ui-preact/basic`           | 桌面端基础组件                         |
| `@dreamer/ui-preact/form`            | 桌面端表单                             |
| `@dreamer/ui-preact/layout`          | 布局组件                               |
| `@dreamer/ui-preact/feedback`        | 反馈、浮层、全局提示                   |
| `@dreamer/ui-preact/navigation`      | 导航组件                               |
| `@dreamer/ui-preact/data-display`    | 数据展示（列表、卡片、媒体等）         |
| `@dreamer/ui-preact/config-provider` | 全局配置（主题、语言等）               |
| `@dreamer/ui-preact/charts`          | 基于 Chart.js 的图表                   |
| `@dreamer/ui-preact/shared`          | 共享类型与按需 re-export               |
| `@dreamer/ui-preact/mobile`          | 移动端聚合 + Portal 等作用域           |
| `@dreamer/ui-preact/mobile/basic`    | 移动端基础                             |
| `@dreamer/ui-preact/mobile/form`     | 移动端表单（与桌面同源处为 re-export） |

默认根入口偏桌面使用；**`mobile`** 子路径包含移动专用组件（如
`TabBar`、`PullRefresh`、`ScrollList`）及移动布局所需共享部分。

---

## 与 Tailwind 配合使用

组件使用 Tailwind 工具类。从 JSR 安装后，用户项目的 Tailwind
**默认不会扫描依赖包**，若不配置，最终 CSS 会**缺少**本库 class。

若把本库**整包源码**都加入 Tailwind 扫描，构建也可能保留**全部组件**的
class，即使用户只引用一个按钮，体积也会偏大。

本库提供 **Tailwind v4 插件**：扫描业务代码中对 `@dreamer/ui-preact`
的引用，生成仅含 `@source` 的桩文件，从而**按需**扫描、体积可控。在
**dweb**（或支持 `@dreamer/plugin` 的宿主）里，请在 **Tailwind 插件之前**注册。

### 使用插件

**1. 在应用入口注册（务必在 `tailwindPlugin` 之前）：**

```ts
import { App } from "@dreamer/dweb";
import { uiPreactTailwindPlugin } from "@dreamer/ui-preact/plugin";
import { tailwindPlugin } from "@dreamer/plugins/tailwindcss";

const app = new App();

app.registerPlugin(uiPreactTailwindPlugin({
  outputPath: "src/assets/ui-preact-sources.css",
  scanPath: "src",
  // packageRoot 可选；默认取已安装包根目录
}));

app.registerPlugin(tailwindPlugin({
  output: "dist/client/assets",
  cssEntry: "src/assets/tailwind.css",
  assetsPath: "/assets",
}));

app.start();
```

**2. 在主 Tailwind 入口 CSS 中引用生成文件：**

```css
@import "./ui-preact-sources.css"; /* 由插件生成，仅含 @source */
@source "./src/**/*.{ts,tsx}"; /* 你方业务源码，路径自行调整 */

@import "tailwindcss";
```

路径请按项目实际调整。插件只记录**实际被 import** 的组件源路径，Tailwind
最终只包含用到的 class，且 theme 通常只出现一次。

---

## Preact、JSX 与 Signal

- **JSX：** 与 Deno 工程一致时，可设 `compilerOptions.jsx` 为
  `react-jsx`，`jsxImportSource` 为 `preact`（与本包 `deno.json` 一致）。
- **`@preact/signals`：** 勿在函数组件**每次 render** 里执行
  `signal(…)`，否则会不断产生新 Signal，受控属性与列表状态会错乱。应使用
  `useMemo(() => signal(初值), [])`（或模块级单例）保持 **Signal 引用稳定**。

---

## 📋 组件一览

下列分类与 [`@dreamer/ui-view`](https://jsr.io/@dreamer/ui-view)
对齐，便于检索；具体迁移进度以包内 **`src/mod.ts` 的 TSDoc** 为准（「已迁移 /
仍待对齐」会随版本更新）。

### 🧱 基础

- **Button**、**Link**、**Icon**、**Typography**（Title、Paragraph、Text）、**Badge**、**Avatar**、**Skeleton**、**Spinner**、**Icons**（ChevronDown、Close、Calendar
  等）

### 📝 表单

- **Input**、**Search**、**Password**、**Textarea**、**InputNumber**、**AutoComplete**、**Checkbox
  / CheckboxGroup**、**Radio /
  RadioGroup**、**Switch**、**Slider**、**Rate**、**DatePicker**、**DateTimePicker**、**TimePicker**、**Upload**、**ColorPicker**、**Mentions**、**Form
  / FormItem / FormList**、**RichTextEditor**、**MarkdownEditor** 等

**偏桌面：** Select、MultiSelect、Cascader、TreeSelect 及若干选择器（见 `form`
导出）。

### 💬 消息与通知

- **Toast**（ToastContainer +
  `toast`）、**Message**、**Notification**（NotificationContainer + 辅助方法）

### 💡 反馈与浮层

- **Alert**、**Drawer**、**Progress**、**Result**

**桌面：** Modal、Dialog、Tooltip、Popover、Popconfirm（以导出为准）

**移动：** BottomSheet、ActionSheet、PullRefresh、SwipeCell 等

### 📐 布局与容器

- **Container**、**Hero**、**Grid /
  GridItem**、**Stack**、**Divider**、**Tabs**、**Accordion**

### 🧭 导航

- **NavBar**、**Sidebar**、**Pagination**、**Menu**、**Steps**、**PageHeader**、**Affix**、**Anchor**、**BackTop**

**桌面：** Dropdown、Breadcrumb

**移动：** TabBar、NavBar（移动变体）

### 📊 数据展示

- **Tag**、**Empty**、**Statistic**、**Segmented**、**Descriptions**、**Card**、**List**、**Image**、**ImageViewer**、**Timeline**、**Collapse**、**Carousel**、**Tree**、**Transfer**、**Calendar**、**Comment**、**CodeBlock**
  等

**桌面：** Table（以导出为准）

### 📈 图表

基于
Chart.js：ChartLine、ChartBar、ChartPie、ChartDoughnut、ChartRadar、ChartPolarArea、ChartBubble、ChartScatter

### ⚙️ 其它

- **ConfigProvider** — 全局主题、语言等

---

## 📚 文档站与示例

完整交互文档与示例在本仓库的 **`docs/`** 包中维护（与其它 Dreamer UI
包相同结构）。本地运行方式见该目录下的说明；线上文档站由团队单独部署。

---

## 📄 License

Apache-2.0. See [LICENSE](./LICENSE).
