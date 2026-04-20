# 变更日志

本项目的重要变更将记录在此文件中。

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循
[语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.1] - 2026-04-20

### 变更

- **Popover** / **Popconfirm**：浮层默认经 `createPortal` 挂到 `document.body`，
  `position: fixed` + `shared/feedback/popFixedStyle.ts` 视口对齐；展开期间用
  rAF / resize 跟随触发器；无 `body` 时回退为容器内 `absolute`。
- **Dropdown**：`placement` 仅保留下方向（`bottom*`）；Portal + `fixed` 几何同步
  更新（`src/desktop/navigation/dropdownPortalGeometry.ts`、`Dropdown.tsx`）。

## [1.0.0] - 2026-04-17

### 新增

- `@dreamer/ui-preact` 首个稳定版：基于 Preact 10 与 `@preact/signals`，目录与
  `@dreamer/ui-view` 对齐（桌面、移动及 `shared` 子路径）。

### 变更

- 聚合
  `mod.ts`（包根、`shared`、`desktop`、`mobile`、`basic`）使用显式命名再导出，不再使用
  `export *`。
- `basic` 中内置图标改为显式列出各 `Icon*`。
- `desktop` / `mobile` 聚合仅再导出各子路径相对 `shared`
  的增量符号，避免重复导出。
