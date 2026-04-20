/**
 * 桌面版布局：继承根布局的顶栏/页脚，本层仅提供侧栏 + 主内容区。
 * 侧栏使用 @dreamer/ui-preact 的 Sidebar 组件。
 * aside 与 main 各自纵向滚动（overflow-y-auto + min-h-0），与根布局 flex 链配合，不共用整页滚动。
 */

import type { LoadContext } from "@dreamer/dweb";
import { Sidebar } from "@dreamer/ui-preact";
import type { ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";
import SiteFooter from "../../components/SiteFooter.tsx";
import {
  docsNavDrawerOpen,
  docsNavSidebarAttached,
} from "../../state/docs-nav-drawer.ts";

/** 基础组件下的二级子菜单：组件名 + 中文描述，对应路由 /basic/xxx */
const BASIC_SUBMENU = [
  { path: "/desktop/basic/button", label: "Button", desc: "按钮" },
  { path: "/desktop/basic/link", label: "Link", desc: "文字/图标链接" },
  { path: "/desktop/basic/icon", label: "Icon", desc: "图标容器/占位" },
  { path: "/desktop/basic/typography", label: "Typography", desc: "排版" },
  { path: "/desktop/basic/badge", label: "Badge", desc: "角标、数字徽章" },
  { path: "/desktop/basic/avatar", label: "Avatar", desc: "头像" },
  { path: "/desktop/basic/skeleton", label: "Skeleton", desc: "骨架屏" },
  { path: "/desktop/basic/spinner", label: "Spinner", desc: "加载旋转" },
] as const;

/**
 * 表单二级菜单：与 `src/desktop/form/mod.ts` 导出顺序大致一致（含文档路由）；
 * `Radio` 单控件见 RadioGroup 示例；`check` 为旧合订页未列入侧栏。
 */
const FORM_SUBMENU = [
  {
    path: "/desktop/form/form-containers",
    label: "Form",
    desc: "表单容器",
  },
  { path: "/desktop/form/input", label: "Input", desc: "单行输入" },
  { path: "/desktop/form/search", label: "Search", desc: "搜索框" },
  { path: "/desktop/form/password", label: "Password", desc: "密码" },
  { path: "/desktop/form/textarea", label: "Textarea", desc: "多行输入" },
  {
    path: "/desktop/form/input-number",
    label: "InputNumber",
    desc: "数字输入",
  },
  {
    path: "/desktop/form/autocomplete",
    label: "AutoComplete",
    desc: "自动完成",
  },
  { path: "/desktop/form/select", label: "Select", desc: "单选下拉" },
  { path: "/desktop/form/multiselect", label: "MultiSelect", desc: "多选下拉" },
  { path: "/desktop/form/tree-select", label: "TreeSelect", desc: "树选择" },
  { path: "/desktop/form/cascader", label: "Cascader", desc: "级联选择" },
  { path: "/desktop/form/checkbox", label: "Checkbox", desc: "勾选" },
  {
    path: "/desktop/form/checkbox-group",
    label: "CheckboxGroup",
    desc: "勾选组",
  },
  { path: "/desktop/form/radio-group", label: "RadioGroup", desc: "单选组" },
  { path: "/desktop/form/switch", label: "Switch", desc: "开关" },
  { path: "/desktop/form/slider", label: "Slider", desc: "滑块" },
  { path: "/desktop/form/rate", label: "Rate", desc: "评分" },
  { path: "/desktop/form/date-picker", label: "DatePicker", desc: "日期选择" },
  {
    path: "/desktop/form/datetime-picker",
    label: "DateTimePicker",
    desc: "日期时间",
  },
  { path: "/desktop/form/time-picker", label: "TimePicker", desc: "时间选择" },
  { path: "/desktop/form/color-picker", label: "ColorPicker", desc: "颜色" },
  { path: "/desktop/form/upload", label: "Upload", desc: "文件上传" },
  { path: "/desktop/form/transfer", label: "Transfer", desc: "穿梭框" },
  { path: "/desktop/form/mentions", label: "Mentions", desc: "@ 提及" },
  {
    path: "/desktop/form/rich-text-editor",
    label: "RichTextEditor",
    desc: "富文本",
  },
  {
    path: "/desktop/form/markdown-editor",
    label: "MarkdownEditor",
    desc: "Markdown",
  },
] as const;

/** 消息与通知下的二级子菜单，对应路由 /message/xxx */
const MESSAGE_SUBMENU = [
  { path: "/desktop/message/toast", label: "Toast", desc: "轻提示" },
  { path: "/desktop/message/message", label: "Message", desc: "全局提示" },
  {
    path: "/desktop/message/notification",
    label: "Notification",
    desc: "消息通知框",
  },
] as const;

/** 反馈与浮层下的二级子菜单，对应路由 /feedback/xxx */
const FEEDBACK_SUBMENU = [
  { path: "/desktop/feedback/alert", label: "Alert", desc: "静态提示条" },
  { path: "/desktop/feedback/modal", label: "Modal", desc: "模态弹窗" },
  { path: "/desktop/feedback/dialog", label: "Dialog", desc: "确认对话框" },
  { path: "/desktop/feedback/drawer", label: "Drawer", desc: "侧边抽屉" },
  { path: "/desktop/feedback/progress", label: "Progress", desc: "进度条" },
  { path: "/desktop/feedback/tooltip", label: "Tooltip", desc: "悬停提示" },
  { path: "/desktop/feedback/popover", label: "Popover", desc: "弹出面板" },
  {
    path: "/desktop/feedback/popconfirm",
    label: "Popconfirm",
    desc: "气泡确认框",
  },
  { path: "/desktop/feedback/result", label: "Result", desc: "结果页" },
] as const;

/** 布局与容器下的二级子菜单，对应路由 /layout/xxx */
const LAYOUT_SUBMENU = [
  {
    path: "/desktop/layout/container",
    label: "Container",
    desc: "最大宽度容器",
  },
  { path: "/desktop/layout/hero", label: "Hero", desc: "英雄区/首屏" },
  { path: "/desktop/layout/grid", label: "Grid", desc: "栅格" },
  { path: "/desktop/layout/stack", label: "Stack", desc: "垂直/水平堆叠" },
  { path: "/desktop/layout/divider", label: "Divider", desc: "分割线" },
  { path: "/desktop/layout/tabs", label: "Tabs", desc: "标签页" },
  { path: "/desktop/layout/accordion", label: "Accordion", desc: "手风琴折叠" },
] as const;

/** 导航下的二级子菜单，对应路由 /navigation/xxx */
const NAVIGATION_SUBMENU = [
  {
    path: "/desktop/navigation/breadcrumb",
    label: "Breadcrumb",
    desc: "面包屑",
  },
  { path: "/desktop/navigation/pagination", label: "Pagination", desc: "分页" },
  { path: "/desktop/navigation/menu", label: "Menu", desc: "菜单列表" },
  { path: "/desktop/navigation/dropdown", label: "Dropdown", desc: "下拉菜单" },
  { path: "/desktop/navigation/steps", label: "Steps", desc: "步骤条" },
  {
    path: "/desktop/navigation/page-header",
    label: "PageHeader",
    desc: "页头",
  },
  { path: "/desktop/navigation/affix", label: "Affix", desc: "固钉" },
  { path: "/desktop/navigation/anchor", label: "Anchor", desc: "锚点" },
] as const;

/** 数据展示下的二级子菜单，对应路由 /data-display/xxx */
const DATA_DISPLAY_SUBMENU = [
  { path: "/desktop/data-display/table", label: "Table", desc: "表格" },
  { path: "/desktop/data-display/list", label: "List", desc: "列表" },
  { path: "/desktop/data-display/card", label: "Card", desc: "卡片" },
  { path: "/desktop/data-display/tag", label: "Tag", desc: "标签" },
  { path: "/desktop/data-display/empty", label: "Empty", desc: "空状态" },
  { path: "/desktop/data-display/image", label: "Image", desc: "图片" },
  {
    path: "/desktop/data-display/image-viewer",
    label: "ImageViewer",
    desc: "图片查看器",
  },
  {
    path: "/desktop/data-display/descriptions",
    label: "Descriptions",
    desc: "描述列表",
  },
  { path: "/desktop/data-display/timeline", label: "Timeline", desc: "时间轴" },
  {
    path: "/desktop/data-display/statistic",
    label: "Statistic",
    desc: "统计数值",
  },
  {
    path: "/desktop/data-display/segmented",
    label: "Segmented",
    desc: "分段控制器",
  },
  {
    path: "/desktop/data-display/collapse",
    label: "Collapse",
    desc: "折叠面板",
  },
  { path: "/desktop/data-display/carousel", label: "Carousel", desc: "轮播图" },
  { path: "/desktop/data-display/calendar", label: "Calendar", desc: "日历" },
  { path: "/desktop/data-display/comment", label: "Comment", desc: "评论" },
  { path: "/desktop/data-display/tree", label: "Tree", desc: "树形" },
  {
    path: "/desktop/data-display/code-block",
    label: "CodeBlock",
    desc: "代码块",
  },
] as const;

/** 图表下的二级子菜单，对应路由 /charts/xxx，基于 Chart.js */
const CHARTS_SUBMENU = [
  { path: "/desktop/charts/line", label: "ChartLine", desc: "折线图" },
  { path: "/desktop/charts/bar", label: "ChartBar", desc: "柱状图" },
  { path: "/desktop/charts/pie", label: "ChartPie", desc: "饼图" },
  { path: "/desktop/charts/doughnut", label: "ChartDoughnut", desc: "环形图" },
  { path: "/desktop/charts/radar", label: "ChartRadar", desc: "雷达图" },
  {
    path: "/desktop/charts/polar-area",
    label: "ChartPolarArea",
    desc: "极区图",
  },
  { path: "/desktop/charts/bubble", label: "ChartBubble", desc: "气泡图" },
  { path: "/desktop/charts/scatter", label: "ChartScatter", desc: "散点图" },
] as const;

/** 其它下的二级子菜单，对应路由 /other/xxx */
const OTHER_SUBMENU = [
  {
    path: "/desktop/other/theme-colors",
    label: "主题颜色",
    desc: "@theme 色板预览",
  },
  { path: "/desktop/other/back-top", label: "BackTop", desc: "回到顶部" },
  {
    path: "/desktop/other/config-provider",
    label: "ConfigProvider",
    desc: "全局配置",
  },
] as const;

/** 组件分类：有子菜单的用 children，无子菜单的为单链接 */
const MENU: ReadonlyArray<
  {
    path: string;
    label: string;
    children?: ReadonlyArray<{ path: string; label: string; desc: string }>;
  }
> = [
  { path: "/desktop/basic", label: "基础组件", children: BASIC_SUBMENU },
  { path: "/desktop/form", label: "表单组件", children: FORM_SUBMENU },
  { path: "/desktop/message", label: "消息与通知", children: MESSAGE_SUBMENU },
  {
    path: "/desktop/feedback",
    label: "反馈与浮层",
    children: FEEDBACK_SUBMENU,
  },
  { path: "/desktop/layout", label: "布局与容器", children: LAYOUT_SUBMENU },
  { path: "/desktop/navigation", label: "导航", children: NAVIGATION_SUBMENU },
  {
    path: "/desktop/data-display",
    label: "数据展示",
    children: DATA_DISPLAY_SUBMENU,
  },
  { path: "/desktop/charts", label: "图表", children: CHARTS_SUBMENU },
  { path: "/desktop/other", label: "其它", children: OTHER_SUBMENU },
];

/** `load()` 注入，供侧栏 SSR 与 hydrate 首帧与当前路由对齐 */
interface DesktopDocsLayoutData {
  docsSidebarPathname?: string;
}

interface LayoutProps {
  children?: ComponentChildren | ComponentChildren[];
  data?: DesktopDocsLayoutData;
}

/**
 * 为侧栏提供请求路径：SSR 无 `location`，仅靠本函数输出才能令含当前页的 `<details>` 带 `open`。
 * 勿为返回值写对象字面量类型，以免 dweb 客户端 strip-load 误判函数体边界。
 */
export function load(ctx: LoadContext) {
  let pathname = "/";
  try {
    pathname = new URL(ctx.url).pathname;
  } catch {
    pathname = "/";
  }
  return { docsSidebarPathname: pathname };
}

export default function Layout({ children, data }: LayoutProps) {
  /**
   * 须在 effect 内置位侧栏已挂上（与 ui-view 文档站 `onMount`/`onCleanup` 一致）；
   * 若在渲染体内写 `docsNavSidebarAttached.value = true`，根 `_layout` 的顶栏又订阅该 signal，可能与 Preact 更新顺序叠加造成震荡。
   */
  useEffect(() => {
    docsNavSidebarAttached.value = true;
    return () => {
      docsNavSidebarAttached.value = false;
      docsNavDrawerOpen.value = false;
    };
  }, []);

  /** 侧栏 `getCurrentPath`：浏览器用 `location`；SSR 用本层 `load` 注入的 pathname */
  const pathHint = (data?.docsSidebarPathname ?? "").replace(/\/$/, "") || "";
  const getSidebarCurrentPath = (): string => {
    if (
      typeof globalThis.location !== "undefined" &&
      typeof globalThis.location.pathname === "string" &&
      globalThis.location.pathname !== ""
    ) {
      return globalThis.location.pathname.replace(/\/$/, "") || "/";
    }
    return pathHint !== "" ? pathHint : "/";
  };

  /* 占满根布局中间 flex-1 区域高度；max-w-[1800px] mx-auto 与根布局顶栏 NavBar 同宽居中，避免超宽屏仅顶栏收窄、正文贴左 */
  return (
    <div className="relative mx-auto flex h-full min-h-0 w-full max-w-[1800px] flex-1 overflow-hidden">
      {
        /*
         * 侧栏仅菜单：回首页见根布局顶栏 DocsSiteBrand，避免与顶栏重复。
         * drawerOpen 与根布局顶栏 `start` 内按钮共用，小屏为 Drawer + 顶栏汉堡。
         */
      }
      <Sidebar
        overview={{ path: "/desktop", label: "组件概览" }}
        sectionTitle="组件"
        items={MENU}
        getCurrentPath={getSidebarCurrentPath}
        accordionGroupName="docs-desktop-sidebar"
        drawerOpen={docsNavDrawerOpen}
        drawerTitle="组件导航"
        drawerAccordionGroupName="docs-desktop-drawer"
        className="min-h-0 overscroll-y-contain"
      />
      {
        /*
         * main：flex-col + overflow-y-auto。正文外包 flex-auto（勿用 flex-1 的 0% basis）：
         * flex-1 会把正文区高度钉死在「主栏剩余高度」，子内容 overflow:visible 会画在页脚之上造成叠层。
         * flex-auto 在短文时仍可 flex-grow 垫高，长文时随内容变高，整列滚动、页脚跟在正文后。
         */
      }
      {
        /*
         * `relative z-10`：主栏相对侧栏抬升叠放顺序，避免正文里 `absolute` 下拉被侧栏盖住。
         * 若浮层仍「缺一角」，多为 `overflow-y-auto` 裁剪——须改 Dropdown 为 `fixed` 或调整滚动容器。
         */
      }
      <main className="relative z-10 flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-y-auto overscroll-y-contain px-3 py-6 sm:px-6 sm:py-8 lg:px-10">
        <div className="flex flex-auto flex-col">{children}</div>
        <SiteFooter />
      </main>
    </div>
  );
}
