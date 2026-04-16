# 📦 @dreamer/ui-preact

Preact UI component library for Dreamer, styled with **Tailwind CSS v4**, with
light/dark theme and **desktop + mobile** entry points. Implementation is
migrated in parity with [`@dreamer/ui-view`](https://jsr.io/@dreamer/ui-view)
(View runtime); this package targets **Preact 10** and **`@preact/signals`**.

**简体中文:** [README-zh.md](./README-zh.md)

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)

---

## Installation

```bash
# Deno
deno add jsr:@dreamer/ui-preact

# Bun
bunx jsr add @dreamer/ui-preact
```

---

## 📂 Entry points

| Entry | Description |
| ----- | ----------- |
| `@dreamer/ui-preact` | Desktop aggregate (shared + form and related) |
| `@dreamer/ui-preact/basic` | Desktop basic components |
| `@dreamer/ui-preact/form` | Desktop form components |
| `@dreamer/ui-preact/layout` | Layout components |
| `@dreamer/ui-preact/feedback` | Feedback, overlays, global messaging |
| `@dreamer/ui-preact/navigation` | Navigation components |
| `@dreamer/ui-preact/data-display` | Data display (lists, cards, media, etc.) |
| `@dreamer/ui-preact/config-provider` | Global config (theme, locale, …) |
| `@dreamer/ui-preact/charts` | Chart.js–based charts |
| `@dreamer/ui-preact/shared` | Shared types and re-exports for tree-shaking |
| `@dreamer/ui-preact/mobile` | Mobile aggregate + portal scope |
| `@dreamer/ui-preact/mobile/basic` | Mobile basic |
| `@dreamer/ui-preact/mobile/form` | Mobile form (re-export parity with desktop where applicable) |

The default root entry focuses on desktop usage; the **`mobile`** subpath adds
mobile-specific components (e.g. `TabBar`, `PullRefresh`, `ScrollList`) and
shared pieces needed for mobile layouts.

---

## 🎨 Using with Tailwind

Components use Tailwind utility classes. After installing from JSR, your
project’s Tailwind **does not scan dependency packages by default**—without
configuration, classes from this library will be missing in the final CSS.

Adding **the entire package source tree** to Tailwind content also **bloats**
CSS because every component’s classes may be retained even if you only import
one button.

**We ship a Tailwind v4 plugin** that scans your app for imports from
`@dreamer/ui-preact`, writes an `@source` stub file, and keeps the CSS bundle
small. Register it in **dweb** (or any host that supports `@dreamer/plugin`)
**before** your Tailwind plugin.

### Plugin-based styling

**1. Register the plugin in your app entry (before `tailwindPlugin`):**

```ts
import { App } from "@dreamer/dweb";
import { uiPreactTailwindPlugin } from "@dreamer/ui-preact/plugin";
import { tailwindPlugin } from "@dreamer/plugins/tailwindcss";

const app = new App();

app.registerPlugin(uiPreactTailwindPlugin({
  outputPath: "src/assets/ui-preact-sources.css",
  scanPath: "src",
  // packageRoot optional; defaults to the installed package root
}));

app.registerPlugin(tailwindPlugin({
  output: "dist/client/assets",
  cssEntry: "src/assets/tailwind.css",
  assetsPath: "/assets",
}));

app.start();
```

**2. In your main Tailwind CSS entry, import the generated file:**

```css
@import "./ui-preact-sources.css"; /* generated: @source lines only */
@source "./src/**/*.{ts,tsx}"; /* your app sources */

@import "tailwindcss";
```

Adjust paths to match your project. The plugin records only the component
source files you actually import so Tailwind emits **one** theme and minimal
CSS.

---

## Preact, JSX, and signals

- **JSX runtime:** configure `compilerOptions.jsx` to `react-jsx` and
  `jsxImportSource` to `preact` (same as this package’s `deno.json`).
- **`@preact/signals`:** do **not** call `signal()` on every render inside a
  function component—that creates a new signal each time and breaks controlled
  props and lists. Use
  `useMemo(() => signal(initialValue), [])` (or module-level signals) so the
  signal identity is stable across renders.

---

## 📋 Component overview

The catalog below mirrors [`@dreamer/ui-view`](https://jsr.io/@dreamer/ui-view)
for discoverability. Coverage grows as migration continues; see package
`src/mod.ts` TSDoc for the latest “migrated vs pending” notes.

### 🧱 Basic

- **Button**, **Link**, **Icon**, **Typography** (Title, Paragraph, Text),
  **Badge**, **Avatar**, **Skeleton**, **Spinner**, **Icons** (ChevronDown,
  Close, Calendar, …)

### 📝 Form

- **Input**, **Search**, **Password**, **Textarea**, **InputNumber**,
  **AutoComplete**, **Checkbox / CheckboxGroup**, **Radio / RadioGroup**,
  **Switch**, **Slider**, **Rate**, **DatePicker**, **DateTimePicker**,
  **TimePicker**, **Upload**, **ColorPicker**, **Mentions**, **Form** /
  **FormItem** / **FormList**, **RichTextEditor**, **MarkdownEditor**, …

**Desktop-oriented:** Select, MultiSelect, Cascader, TreeSelect, and several
pickers (see `form` export).

### 💬 Messaging & notification

- **Toast** (ToastContainer + `toast`), **Message**, **Notification**
  (NotificationContainer + helpers)

### 💡 Feedback & overlay

- **Alert**, **Drawer**, **Progress**, **Result**

**Desktop:** Modal, Dialog, Tooltip, Popover, Popconfirm (where exported)

**Mobile:** BottomSheet, ActionSheet, PullRefresh, SwipeCell, …

### 📐 Layout & container

- **Container**, **Hero**, **Grid / GridItem**, **Stack**, **Divider**, **Tabs**,
  **Accordion**

### 🧭 Navigation

- **NavBar**, **Sidebar**, **Pagination**, **Menu**, **Steps**, **PageHeader**,
  **Affix**, **Anchor**, **BackTop**

**Desktop:** Dropdown, Breadcrumb

**Mobile:** TabBar, NavBar (mobile variants)

### 📊 Data display

- **Tag**, **Empty**, **Statistic**, **Segmented**, **Descriptions**, **Card**,
  **List**, **Image**, **ImageViewer**, **Timeline**, **Collapse**, **Carousel**,
  **Tree**, **Transfer**, **Calendar**, **Comment**, **CodeBlock**, …

**Desktop:** Table (where exported)

### 📈 Charts

Chart.js–based: ChartLine, ChartBar, ChartPie, ChartDoughnut, ChartRadar,
ChartPolarArea, ChartBubble, ChartScatter

### ⚙️ Other

- **ConfigProvider** — global theme, locale, and related settings

---

## 📚 Documentation

Interactive documentation and live examples ship in this repository’s
**`docs/`** package (same layout as other Dreamer UI packages). Run the docs app
locally per that package’s `README` when you need API tables and demos beyond
this file.

---

## 📄 License

Apache-2.0. See [LICENSE](./LICENSE).
