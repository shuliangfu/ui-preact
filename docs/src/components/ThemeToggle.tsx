/**
 * 头部主题切换按钮（图标由 Tailwind `dark:` 控制显隐）。
 * 点击走 `@dreamer/theme`；下列选项须与 `src/main.ts` 里 `themePlugin`（cookieName / 策略等）一致，
 * 以便与 head 内联防闪脚本读写同一存储键。
 */

import {
  getTheme,
  THEME_CHANGE_EVENT,
  type ThemeChangeEventDetail,
  type ThemeOptions,
  toggleTheme,
} from "@dreamer/theme";

/**
 * 与 main.ts 中 themePlugin 的 cookieName、defaultMode、strategy、darkClass 对齐。
 */
const docsThemeClientOptions: ThemeOptions = {
  defaultMode: "light",
  strategy: "class",
  darkClass: "dark",
  storageKey: "ui-preact-docs-theme",
  storageType: "localStorage",
  transitionDuration: 200,
};

/**
 * 订阅全局主题变化（与 Theme 内部派发的 {@link THEME_CHANGE_EVENT} 一致），用于埋点、图表主题等。
 *
 * @param handler - 收到 {@link ThemeChangeEventDetail}
 * @returns 取消订阅函数
 */
export function subscribeDocsThemeChange(
  handler: (detail: ThemeChangeEventDetail) => void,
): () => void {
  const listener = ((event: Event) => {
    const ce = event as CustomEvent<ThemeChangeEventDetail>;
    if (ce.detail) handler(ce.detail);
  }) as EventListener;
  globalThis.addEventListener(THEME_CHANGE_EVENT, listener);
  return () => globalThis.removeEventListener(THEME_CHANGE_EVENT, listener);
}

/** 太阳图标：浅色主题时显示 */
const SunIcon = () => (
  <span
    data-theme-icon="sun"
    className="inline-block size-5 dark:hidden"
    aria-hidden="true"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  </span>
);

/** 月亮图标：深色主题时显示 */
const MoonIcon = () => (
  <span
    data-theme-icon="moon"
    className="hidden size-5 dark:inline-block"
    aria-hidden="true"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  </span>
);

/**
 * 保证 Theme 单例与 head 防闪脚本同一 storageKey，再执行切换。
 */
function handleThemeToggle(_e: Event): void {
  if (typeof globalThis.document === "undefined") return;
  getTheme(docsThemeClientOptions);
  toggleTheme();
}

export function ThemeToggle() {
  return (
    <button
      type="button"
      className="relative z-10 rounded-lg p-2.5 text-gray-600 hover:bg-slate-100 hover:text-teal-600 dark:text-gray-200 dark:hover:bg-slate-800 dark:hover:text-teal-400 transition-colors pointer-events-auto"
      title="切换主题"
      aria-label="切换主题"
      onClick={handleThemeToggle}
    >
      <SunIcon />
      <MoonIcon />
    </button>
  );
}
