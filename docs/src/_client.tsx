/**
 * 客户端入口文件（由 @dreamer/dweb 自动生成，仅当不存在时生成，可手动编辑）
 * 从 _client.dep.tsx 导入 initApp；在 .then((app) => { ... }) 中可直接使用 app。
 * - i18n：i18n.onChange(() => app.renderCurrentRoute())
 * - 路由拦截：app.router.beforeRoute((to, from) => { ... })、app.router.afterRoute((to, from) => { ... })
 */

/** 顶栏 Dropdown 等需 Esc 关闭：由本包桌面导航导出，与 ui-view 文档站行为一致 */
import { initDropdownEsc } from "@dreamer/ui-preact";
import { initApp } from "./_client.dep.tsx";

initApp()
  .then((app) => {
    /** 文档站顶栏 Dropdown 需 Esc 关闭时注册（见 {@link initDropdownEsc}） */
    initDropdownEsc();

    // 路由前置守卫（拦截）：在导航前执行，返回 false 阻止导航，返回 string 重定向到该路径
    app.router.beforeRoute((_to: unknown, _from: unknown) => {
      // 示例：需要登录的页面重定向到登录
      // if (to?.route.meta?.requiresAuth && !isLoggedIn()) return "/login";
      // 示例：阻止访问某路径
      // if (to?.route.component === "admin") return false;
      return true; // allow
    });

    // 路由后置守卫：导航完成后执行（可做埋点、日志等）
    app.router.afterRoute((_to: unknown, _from: unknown) => {
      // 按需在此写埋点
    });
  })
  .catch(console.error);
