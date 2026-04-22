# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0-beta.4] - 2026-04-22

### Changed

- **plugin** `uiPreactTailwindPlugin`: Tailwind `@source` CSS generation logs
  now use `@dreamer/logger` (`Logger.child` with `ui-preact-tailwind` tag, or a
  standalone `createLogger` with `level: "debug"`) and emit at **debug** level
  instead of `info` (the `@dreamer/logger` dependency was already in
  `deno.json`).
- **plugin** `onInit` failure reporting: prefer `Logger.error` on the injected
  `Logger` instance; legacy loggers with only `error` remain supported; no
  longer fall back to `info` for error text.

## [1.0.1] - 2026-04-20

### Changed

- **Popover** / **Popconfirm**: overlay renders via `createPortal` onto
  `document.body` with `position: fixed` and viewport-aligned geometry
  (`shared/feedback/popFixedStyle.ts`); open/hover paths use scroll/resize and
  rAF to track the trigger (`getBoundingClientRect`). Falls back to in-wrapper
  `absolute` positioning when `body` is unavailable (SSR/tests).
- **Dropdown**: `placement` supports only downward variants (`bottom`,
  `bottomLeft`, `bottomRight`, `bottomAuto`); portal + `fixed` alignment updates
  in `src/desktop/navigation/dropdownPortalGeometry.ts` /
  `src/desktop/navigation/Dropdown.tsx`.

## [1.0.0] - 2026-04-17

### Added

- First stable release of `@dreamer/ui-preact`: Preact 10 + `@preact/signals` UI
  components aligned with `@dreamer/ui-view` structure (desktop, mobile, and
  shared subpath exports).

### Changed

- Aggregation `mod.ts` files use explicit named re-exports instead of `export *`
  (package root, `shared`, `desktop`, `mobile`, and `basic` barrels).
- Built-in icons are listed explicitly in `basic` barrels (no
  `export * from "./icons/mod.ts"`).
- Desktop and mobile aggregates re-export only symbols from subpath modules that
  are not already covered by the `shared` barrel, avoiding duplicate export
  errors.
