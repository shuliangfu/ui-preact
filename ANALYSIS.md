# @dreamer/ui-preact 实现分析

> 本文档针对 **@dreamer/ui-preact** 包，对 UI
> 库范围、桌面/移动端策略及实现优先级做全面分析；与
> @dreamer/ui-view、@dreamer/ui-react 在 API 与语义上对齐。

---

## 一、目标与定位

- **定位**：Dreamer 生态内跨框架（View / React / Preact）的通用 UI 组件库，与
  `@dreamer/view` 等包协同。
- **设计原则**：共享设计令牌（shared）、同一套 API
  语义、多框架实现一致、桌面/移动体验分别优化。

---

## 二、桌面版与移动版是否要「各一套对齐」？

**结论：要。建议「桌面一套、移动一套」，两套在 API
与语义上对齐，在布局与交互上按端区分。**

### 2.1 为何要分桌面 / 移动两套？

| 维度       | 桌面端                    | 移动端                        |
| ---------- | ------------------------- | ----------------------------- |
| 交互       | 鼠标、键盘、大屏          | 触控、手势、小屏              |
| 布局       | 多列、悬停、Popover 常用  | 单列、全屏/半屏、BottomSheet  |
| 组件形态   | Modal 居中、Dropdown 下拉 | ActionSheet、底部抽屉、TabBar |
| 密度与尺寸 | 可更紧凑                  | 触控热区更大、字体更大        |

同一「语义」的组件（如「确认弹层」）在桌面用 Modal、在移动用
BottomSheet，才能兼顾体验，因此需要**两套实现**，而不是一套组件靠媒体查询简单适配。

### 2.2 「对齐」指什么？

- **API 对齐**：同一组件名、同一套 props（如 `Button` 的
  `variant`、`size`、`disabled`），便于业务层按端切换导入路径即可（`@dreamer/ui-preact`
  vs `@dreamer/ui-preact/mobile`）。
- **设计令牌对齐**：共用 `shared` 的
  `SizeVariant`、`ColorVariant`、间距、圆角、阴影等 token，保证视觉一致。
- **语义对齐**：桌面「选择一项」用 Select，移动也用 Select（或
  MobileSelect），语义一致，实现可不同（桌面下拉，移动底部滚轮等）。

### 2.3 推荐用法

- **默认入口**（`@dreamer/ui-preact`）：桌面版组件（shared + preact desktop）。
- **子路径** `@dreamer/ui-preact/mobile`：移动版组件（shared + mobile）。
- 业务侧按运行端或构建目标选择一套入口，或按路由/设备检测动态选择，保证同一页面只加载一套（桌面或移动），避免两套混用带来的冗余与风格不统一。

### 2.4 本包目录结构（common / desktop / mobile）

本包（**@dreamer/ui-preact**）与 @dreamer/ui-view、@dreamer/ui-react
采用**同一套目录约定**：共用组件在 `shared/basic/`，桌面/移动分别为
`desktop/`、`mobile/`。

| 目录              | 说明                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **shared/basic/** | 桌面与移动**共用**的公共组件（如 Button、Link、Spinner、Avatar、Badge）。与 ANALYSIS 中标注为 C 的组件对应。                    |
| **desktop/**      | 桌面**专用**组件（如 Modal、Dialog、Table、Tooltip、Popover）。入口 `@dreamer/ui-preact` 导出 shared + desktop。                |
| **mobile/**       | 移动**专用**组件（如 BottomSheet、ActionSheet、TabBar、PullRefresh）。子路径 `@dreamer/ui-preact/mobile` 导出 shared + mobile。 |

- **shared/** 存放类型、tokens（`SizeVariant`、`ColorVariant`
  等）及共用组件（`shared/basic/`），供 desktop、mobile 引用。
- **common 不单独作为子路径导出**：用户只引用 `@dreamer/ui-preact` 或
  `@dreamer/ui-preact/mobile`，即可获得 shared + 对应端组件。

**@dreamer/ui-preact 当前 src 结构：**

```
src/
├── shared/              # 类型、tokens、常量 + 共用组件（即 common）
│   ├── basic/           # 共用组件：Button、Link、Spinner 等
│   ├── types.ts
│   └── mod.ts
├── desktop/             # 桌面专用
│   └── mod.ts
├── mobile/             # 移动专用
│   └── mod.ts
└── mod.ts              # 入口 → shared + desktop；/mobile 子路径 → shared + mobile
```

---

## 三、应实现的 UI 组件清单（全面）

以下按**类别**列出建议实现的组件，并标明**桌面 (D)**、**移动 (M)**、**共用 (C)**
建议。\
**C** = 桌面与移动可共用同一实现（仅通过 token/媒体查询微调）；**D** =
建议以桌面为主实现；**M** = 建议以移动为主或移动特有。

### 3.1 基础组件（Foundation）

| 组件       | 说明                       | D/M/C | 备注                     |
| ---------- | -------------------------- | ----- | ------------------------ |
| Button     | 按钮，支持 variant/size    | C     | 核心，三框架先上         |
| Link       | 文字/图标链接              | C     | 可基于 `<a>` + 样式      |
| Icon       | 图标容器/占位              | C     | 或与 icon 包配合         |
| Typography | 排版：Title/Text/Paragraph | C     | 标题层级、正文、可省略号 |
| Badge      | 角标、数字徽章             | C     | 常用于导航、购物车       |
| Avatar     | 头像                       | C     | 尺寸用 SizeVariant       |
| Skeleton   | 骨架屏                     | C     | 加载态                   |
| Spinner    | 加载旋转/菊花              | C     | 加载态                   |

### 3.2 表单组件（Form）

| 组件               | 说明                   | D/M/C | 备注                                       |
| ------------------ | ---------------------- | ----- | ------------------------------------------ |
| Input              | 单行输入               | C     | 桌面/移动可共用，移动可加大触控区          |
| Search             | 搜索框                 | C     | 带搜索图标、清除，或作为 Input variant     |
| Password           | 密码输入               | C     | 显隐切换、强度提示可选                     |
| Textarea           | 多行输入               | C     | 同上                                       |
| InputNumber        | 数字输入               | C     | 步进、范围、精度                           |
| Select             | 单选下拉               | D/M   | 桌面下拉，移动可底部滚轮/全屏选择          |
| MultiSelect        | 多选下拉               | D/M   | 多选、标签展示、全选                       |
| AutoComplete       | 自动完成               | C     | 输入联想、搜索建议                         |
| Cascader           | 级联选择               | D/M   | 省市区、分类多级                           |
| TreeSelect         | 树选择                 | D     | 树形结构单选/多选                          |
| Checkbox           | 多选勾选               | C     | 移动可放大点击区域                         |
| CheckboxGroup      | 多选组                 | C     | 与 Checkbox 组合或内置于 Form              |
| Radio              | 单选                   | C     | 同上                                       |
| RadioGroup         | 单选组                 | C     | 与 Radio 组合或内置于 Form                 |
| Switch             | 开关                   | C     | 常用                                       |
| Slider             | 滑块                   | C     | 移动端手势友好                             |
| Rate               | 评分                   | C     | 星级评分                                   |
| DatePicker         | 日期选择               | D/M   | 含 single / range / multiple；日历弹层     |
| TimePicker         | 时间选择               | C     | 含 single / range / multiple；时分列表     |
| ColorPicker        | 颜色选择               | C     | 色板/取色器，主题、设计器场景              |
| Upload             | 文件上传               | C     | 拖拽/点击、列表、进度                      |
| Mentions           | @提及                  | C     | 输入时触发候选（评论、聊天）               |
| Transfer           | 穿梭框                 | D     | 双列多选，也可用于表单「从候选集选出一批」 |
| Form               | 表单容器（校验、布局） | C     | 与各表单组件组合                           |
| FormItem           | 表单项包装             | C     | 标签、必填、错误提示、布局                 |
| FormList           | 动态表单项（可选）     | C     | 动态增减表单项（如多条联系人）             |
| **RichTextEditor** | **富文本编辑器**       | C     | 见下方说明                                 |

**富文本组件（RichTextEditor）说明**：

- **能力**：WYSIWYG
  编辑，支持加粗/斜体/下划线、标题、列表、引用、链接、图片插入、表格等；可输出
  HTML 或自定义 DSL。
- **实现**：可基于 ProseMirror、Slate、TipTap、Quill 等内核做 View/React/Preact
  封装，工具栏与主题对齐 shared 设计令牌。
- **场景**：文章、评论、工单、邮件正文、CMS
  内容等。桌面为主，移动端可简化工具栏或只读预览。
- **可选子项**：Markdown
  编辑、代码块高亮、图片上传与粘贴、字数统计、只读模式（用于展示富文本内容）。

### 3.3 消息与通知（Message & Notification）※ 重要

| 组件                   | 说明                             | D/M/C | 使用场景                                                                         |
| ---------------------- | -------------------------------- | ----- | -------------------------------------------------------------------------------- |
| **Toast**              | 轻提示，自动消失                 | C     | 操作反馈（成功/失败/信息），不打断用户，角位或底部弹出                           |
| **Message**            | 全局提示，简短文案               | C     | 与 Toast 类似，可约定为「顶部居中」形态，或与 Toast 合并为同一组件两种 placement |
| **Notification**       | **消息通知框**，带标题/描述/列表 | C     | 后台任务结果、需用户注意的警告/错误，可堆叠、可 key 去重，桌面常为右上角         |
| **NotificationCenter** | 通知中心（可选）                 | C     | 收纳多条通知、已读/未读、清空，偏复杂场景                                        |

**说明**：

- **Toast**：无标题或仅图标+一句话，几秒后自动关闭，不打断操作。
- **Message**：若与 Toast 分开，则多为顶部居中、更轻量；也可统一用 Toast +
  `placement` 覆盖。
- **Notification**：**必须单独实现**，支持
  title、description、icon、列表、操作按钮、duration/key，适合「消息通知」场景（如系统通知、任务完成、告警）。
- 当前文档中**已包含 Toast**，**未单独列出 Message/Notification**；建议**补全
  Notification（消息通知）组件**，Message 可视实现选择与 Toast 合并或单独。

### 3.4 反馈与浮层（Feedback & Overlay）

| 组件        | 说明            | D/M/C | 备注                           |
| ----------- | --------------- | ----- | ------------------------------ |
| Alert       | 静态提示条      | C     | 成功/警告/错误等，常驻于页面内 |
| Modal       | 模态弹窗        | D     | 桌面居中弹层                   |
| Dialog      | 确认/取消对话框 | D     | 可视为 Modal 简化版            |
| Drawer      | 侧边抽屉        | C     | 左/右拉出，移动常用            |
| BottomSheet | 底部抽屉/半屏   | M     | 移动典型组件                   |
| ActionSheet | 底部动作列表    | M     | 移动选择/操作                  |
| Progress    | 进度条/环形     | C     | 线性、环形                     |
| Tooltip     | 悬停提示        | D     | 桌面更常用                     |
| Popover     | 弹出面板        | D     | 桌面更常用                     |
| Popconfirm  | 气泡确认框      | C     | 删除等二次确认                 |
| Result      | 结果页          | C     | 成功/失败/403/404 等结果态     |

### 3.5 布局与容器（Layout）

| 组件      | 说明            | D/M/C | 备注                                                            |
| --------- | --------------- | ----- | --------------------------------------------------------------- |
| Container | 最大宽度容器    | C     | 响应式 max-width                                                |
| **Hero**  | **英雄区/首屏** | C     | 落地页主视觉：大标题、副标题、CTA 按钮、背景图/插画，见下方说明 |
| Grid      | 栅格            | C     | 12/24 列等                                                      |
| Stack     | 垂直/水平堆叠   | C     | 替代部分 div+flex                                               |
| Divider   | 分割线          | C     | 水平/垂直                                                       |
| Tabs      | 标签页          | C     | 桌面横排，移动可滚动                                            |
| Accordion | 手风琴折叠      | C     | 常见于 FAQ、设置                                                |

**Hero 组件说明**：

- **用途**：落地页、营销页、产品首页的首屏区域，突出主标题、副文案与主操作按钮。
- **常见结构**：标题（title）、副标题（subtitle）、描述（description）、一个或多个
  CTA（Button/Link）、可选背景图/视频/插画、可选装饰元素。
- **变体**：居中版、左文右图/右文左图、全屏、带导航的 Hero 等；可与
  Container、Grid、Stack 组合使用。
- **D/M/C**：桌面与移动共用同一组件，通过布局与字号等 token 响应式适配。

### 3.6 导航（Navigation）

| 组件       | 说明        | D/M/C | 备注                       |
| ---------- | ----------- | ----- | -------------------------- |
| Breadcrumb | 面包屑      | D     | 桌面更常见                 |
| Pagination | 分页        | C     | 移动可简化显示             |
| Menu       | 菜单列表    | C     | 桌面多级，移动可单层/折叠  |
| Dropdown   | 下拉菜单    | D     | 桌面点击/悬停展开          |
| Steps      | 步骤条      | C     | 流程、向导                 |
| PageHeader | 页头        | C     | 标题、返回、面包屑、操作区 |
| Affix      | 固钉        | C     | 滚动时固定于视口           |
| Anchor     | 锚点        | D     | 长页内定位导航             |
| TabBar     | 底部 Tab 栏 | M     | 移动主导航                 |

### 3.7 数据展示（Data Display）

| 组件         | 说明                | D/M/C | 备注                        |
| ------------ | ------------------- | ----- | --------------------------- |
| Table        | 表格                | D     | 桌面为主，移动可卡片化      |
| List         | 列表                | C     | 桌面/移动均常用             |
| Card         | 卡片                | C     | 通用                        |
| Tag          | 标签                | C     | 通用                        |
| Empty        | 空状态              | C     | 通用                        |
| Image        | 图片                | C     | 懒加载、占位、预览          |
| Descriptions | 描述列表            | C     | 键值对展示                  |
| Timeline     | 时间轴              | C     | 流程、动态                  |
| Statistic    | 统计数值            | C     | 数字高亮、单位、趋势        |
| Segmented    | 分段控制器          | C     | 多选一紧凑展示              |
| Collapse     | 折叠面板            | C     | 与 Accordion 可二选一或统一 |
| **Carousel** | **轮播图 / 幻灯片** | C     | 见下方说明                  |
| Calendar     | 日历                | C     | 月视图、选日                |
| Comment      | 评论                | C     | 评论列表+回复结构（可选）   |
| Tree         | 树形                | D     | 目录、结构数据              |
| Transfer     | 穿梭框              | D     | 双列选择（可选）            |

**Carousel（轮播图 / 幻灯片）说明**：

- **同一组件**：轮播图、幻灯片、Banner 轮播在文档中统一为 **Carousel** 组件。
- **能力**：多张内容（图/卡片/自定义）横向或纵向轮播；支持自动播放、指示点/缩略图、前后箭头、触摸滑动；可配置一屏多图、循环、切换动画。
- **场景**：首屏
  Banner、商品图、介绍步骤、相册等；桌面与移动均常用，移动端常配合手势滑动。
- **可选扩展**：全屏幻灯片模式、懒加载、与 Router 联动（每页一个 URL）等。

### 3.8 移动端强化组件（Mobile-specific）

| 组件        | 说明          | 备注                 |
| ----------- | ------------- | -------------------- |
| BottomSheet | 底部抽屉/半屏 | 与 Modal 语义对齐    |
| ActionSheet | 底部动作列表  | 选择、操作           |
| TabBar      | 底部 Tab 导航 | 主导航               |
| PullRefresh | 下拉刷新      | 列表页               |
| SwipeCell   | 左滑操作      | 列表项删除/更多      |
| Navbar      | 顶栏          | 标题、返回、右侧操作 |

### 3.9 其它常用（Other）

| 组件           | 说明     | D/M/C | 备注                       |
| -------------- | -------- | ----- | -------------------------- |
| BackTop        | 回到顶部 | C     | 长列表/长页                |
| ConfigProvider | 全局配置 | C     | 主题、语言、组件默认 props |

---

## 四、漏写与补全说明（对照本文档）

- **消息通知**：原清单只有
  Toast（轻提示），**未单独写「消息通知」组件**。现已补全：
  - **Notification**：消息通知框（带标题/描述/列表/操作），需**单独实现**，与
    Toast 区分。
  - **Message**：可与 Toast 合并（用 placement
    区分）或单独作为「顶部居中」轻提示。
  - **NotificationCenter**：通知中心为可选增强。
- **本次全面补全的组件**：Typography、InputNumber、AutoComplete、Cascader、TreeSelect、Rate、TimePicker、Upload、Mentions、Popconfirm、Result、Steps、PageHeader、Affix、Anchor、Image、Descriptions、Timeline、Statistic、Segmented、Collapse、Carousel、Calendar、Comment、Tree、Transfer、BackTop、ConfigProvider。\
  以上均已纳入第三节分类表，可按优先级分阶段实现。
- **表单组件补全**：在 3.2 节已补全
  Search、Password、MultiSelect、CheckboxGroup、RadioGroup、ColorPicker、Transfer、FormItem、FormList；日期/时间区间由
  DatePicker、TimePicker 的 range 模式覆盖。表单类组件已写全。
- **富文本组件**：已纳入 3.2 节
  **RichTextEditor**，含能力说明与实现建议（ProseMirror/Slate/TipTap/Quill
  等）。
- **Hero 英雄组件**：已纳入 3.5
  节布局与容器，作为首屏/英雄区组件，用于落地页、营销页主视觉。

---

## 五、桌面/移动对齐矩阵（摘要）

- **共用 (C)**：同一组件文件，通过 shared token 与可选媒体查询适配桌面/移动（如
  Button、Input、Toast、Card、List、Stack、Divider、Tabs 等）。
- **桌面为主 (D)**：默认入口导出，如
  Modal、Dialog、Tooltip、Popover、Dropdown、Table、Breadcrumb；移动端若需要可复用部分逻辑但用不同形态（如移动用
  BottomSheet 替代部分 Modal）。
- **移动为主/独有 (M)**：仅从 `/mobile` 导出，如
  BottomSheet、ActionSheet、TabBar、PullRefresh、SwipeCell、Navbar；桌面端不提供或由业务用
  Drawer/Modal 等替代。

同一「能力」的组件在命名和 props 上建议对齐，例如：

- 桌面：`Modal`（`title`、`footer`、`onClose`）
- 移动：`BottomSheet`（`title`、`footer`、`onClose`，可增加
  `snapPoints`、`dragToClose` 等移动特有 props）

这样业务层可以写一层抽象，按端切换组件名与导入路径，而 props
结构保持一致或高度相似。

---

## 六、实现优先级建议

### 阶段一：基础与表单（优先）

1. **shared 扩展**：在现有 `SizeVariant`、`ColorVariant`
   上增加间距、圆角、阴影、动效时长等 token（或常量）。
2. **基础组件**：Button、Input、Spinner、Skeleton、Avatar、Badge。
3. **表单**：Textarea、Checkbox、Radio、Switch、Select（先做桌面形态）。

目标：三框架（View / React / Preact）桌面端可搭建简单表单页与列表项。

### 阶段二：反馈与浮层 + 消息通知

1. **消息与通知**：Toast、**Notification（消息通知框）**、Message（或与 Toast
   合并）。
2. Alert、Popconfirm、Result。
3. Modal、Dialog（桌面）。
4. Drawer（左右抽屉，桌面/移动共用）。
5. 移动：BottomSheet、ActionSheet（本包从 `@dreamer/ui-preact/mobile` 导出）。

目标：桌面与移动的「弹层」与「消息通知」能力对齐且可用。

### 阶段三：布局与导航

1. Container、Stack、Grid、Divider、Tabs、Accordion。
2. Menu、Dropdown（桌面）、Pagination。
3. 移动：TabBar、NavBar、PullRefresh、SwipeCell（可选）。

目标：可搭建完整页面框架与导航。

### 阶段四：数据展示与增强

1. Table、List、Card、Tag、Empty。
2. Tooltip、Popover（桌面）。
3. DatePicker、Slider、Form 容器与校验。

目标：覆盖常见中后台与 C 端场景。

---

## 七、设计令牌与 shared 扩展建议

当前已有：

- `SizeVariant`: `xs` | `sm` | `md` | `lg`
- `ColorVariant`: `default` | `primary` | `secondary` | `success` | `warning` |
  `danger` | `ghost`

建议在 `shared` 中逐步增加（可按需拆文件）：

- **间距**：`space.*`（如 4, 8, 12, 16, 24, 32）
- **圆角**：`radius.sm/md/lg/full`
- **阴影**：`shadow.sm/md/lg`
- **动效**：`duration.fast/normal/slow`、`easing.*`
- **断点**：`breakpoint.sm/md/lg/xl`（供媒体查询或 JS 判断）
- **z-index 层级**：dropdown、modal、toast 等分层

这样桌面与移动两套组件共用同一套 token，保证视觉与交互节奏一致。

---

## 八、总结

| 问题                    | 结论                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 是否要桌面/移动各一套？ | **要**。默认入口 = 桌面，`/mobile` = 移动，两套在 API 与语义上对齐。                                                                                                                             |
| 哪些组件桌面/移动共用？ | Button、Input、Toast、**Notification**、Message、Card、List、Stack、Divider、Tabs、Spinner、Skeleton、Avatar、Badge、Checkbox、Radio、Switch、Alert、Drawer、Progress、Empty、Tag 等以共用为主。 |
| 哪些组件要区分实现？    | Modal/Dialog、Tooltip、Popover、Dropdown、Table、Breadcrumb 以桌面为主；BottomSheet、ActionSheet、TabBar、PullRefresh、SwipeCell、Navbar 以移动为主或移动特有。                                  |
| 消息通知是否写全？      | **已补全**：Toast（轻提示）、Message（可选）、**Notification（消息通知框）**、NotificationCenter（可选），见第三节「消息与通知」。                                                               |
| 实现顺序                | 先 shared 与基础+表单，再**消息通知+反馈浮层**（含 Notification、Toast、Modal、BottomSheet 等），再布局导航与数据展示。                                                                          |

本文档可作为 @dreamer/ui-preact 的路线图与需求基准，随实现进展可再细化单组件 API
与桌面/移动行为说明。
