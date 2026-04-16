/**
 * 首页：@dreamer/ui-preact 介绍、特性、快速开始与入口。
 * 路由: /
 */

import {
  Card,
  CodeBlock,
  Container,
  Grid,
  GridItem,
  Hero,
  IconBrandGithub,
  Link,
  Paragraph,
  Text,
  Title,
} from "@dreamer/ui-preact";
import SiteFooter from "../components/SiteFooter.tsx";

/** Hero 背景：渐变 + 细网格，提升层次且不抢眼 */
function HeroBackground() {
  return (
    <div class="absolute inset-0 overflow-hidden" aria-hidden>
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_-30%,rgba(20,184,166,0.22),transparent)] dark:bg-[radial-gradient(ellipse_90%_50%_at_50%_-30%,rgba(20,184,166,0.14),transparent)]" />
      <div
        class="absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
        style={{
          backgroundImage:
            `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2394a3b8' fill-opacity='0.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

const FEATURES = [
  {
    title: "桌面 / 移动双端",
    desc:
      "主入口为桌面组件；`@dreamer/ui-preact/mobile` 提供 BottomSheet、TabBar、NavBar 等移动专用实现，并与 shared 对齐设计令牌。",
    icon: "📱",
  },
  {
    title: "View + Signal",
    desc:
      "与 @dreamer/view 协同：`createSignal` 返回 `.value` 读写容器；复杂组件用渲染 getter 订阅状态，表单 props 可传 getter 减少整块更新。",
    icon: "⚡",
  },
  {
    title: "Tailwind v4 按需扫描",
    desc:
      "提供 uiViewTailwindPlugin：按引用生成 @source，主 CSS 一次 @import 即可，体积小、theme 不重复。",
    icon: "🎨",
  },
  {
    title: "深浅色主题",
    desc:
      "工具类 + `.dark` 策略；文档站内置主题切换（cookie 持久化），可与 ConfigProvider 配合。",
    icon: "🌓",
  },
  {
    title: "TypeScript & JSR",
    desc:
      "类型完整；通过 jsr:@dreamer/ui-preact 在 Deno / 兼容环境引用，仓库开源在 GitHub。",
    icon: "📦",
  },
  {
    title: "组件覆盖面广",
    desc:
      "基础、表单、反馈、布局、导航、数据展示、Chart.js 图表等，持续与 ANALYSIS 规划对齐。",
    icon: "🧩",
  },
];

export default function Home() {
  /* 与文档主栏一致：正文 flex-auto 以免 flex-1 限高导致内容叠在页脚上 */
  return (
    <div class="relative flex h-full min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
      <div class="flex flex-auto flex-col">
        <Hero
          class="relative py-20 sm:py-24 lg:py-32"
          title={
            <span class="inline-flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
              <span class="rounded-xl bg-linear-to-r from-teal-500 to-emerald-600 px-4 py-2 text-white dark:text-gray-200 dark:from-teal-500 dark:to-emerald-500 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight shadow-lg shadow-teal-500/25">
                ui-view
              </span>
            </span>
          }
          subtitle={
            <span class="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
              Dreamer · View 框架
            </span>
          }
          description="基于 @dreamer/view 的 UI 组件库：桌面与移动端、Tailwind CSS v4、明暗主题与 JSR 分发。"
          contentClass="max-w-2xl mx-auto text-center"
          background={<HeroBackground />}
          extra={
            <div class="flex w-full flex-wrap items-center justify-center gap-3 sm:gap-4">
              {
                /*
                 * Hero CTA：button + variant + size 负责布局、过渡与基准样式；
                 * className 只补站点主色（teal）与圆角/描边/阴影，不写与组件重复的 inline-flex、text-sm 等。
                 */
              }
              <Link
                href="/desktop"
                button
                variant="primary"
                size="lg"
                className="rounded-xl bg-teal-600 px-6 py-3.5 font-semibold shadow-lg shadow-teal-600/30 hover:bg-teal-500 dark:text-gray-200"
              >
                桌面版文档
              </Link>
              <Link
                href="/mobile"
                button
                size="lg"
                variant="ghost"
                className="rounded-xl border-2 border-slate-300 bg-white px-6 py-3.5 font-semibold hover:border-teal-400 hover:bg-teal-50/50 dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                移动版文档
              </Link>
              {
                /* <Link
                href="https://jsr.io/@dreamer/ui-preact"
                target="_blank"
                button
                size="lg"
                variant="ghost"
                className="rounded-xl px-6 py-3.5 font-semibold text-teal-700 hover:bg-teal-50 hover:text-teal-800 dark:hover:bg-slate-800"
              >
                JSR 包页 →
              </Link> */
              }
              {
                /*
                 * 图标 + 文案：包在 span 内作为单一子节点，避免 View 下 Link 多子挂载偶发只渲染外框。
                 * inline-flex + gap 放在 span 上，与前两颗 CTA 同 lg + px-6 py-3.5。
                 */
              }
              <Link
                href="https://github.com/shuliangfu/ui-view"
                target="_blank"
                rel="noopener noreferrer"
                button
                size="lg"
                variant="ghost"
                className="rounded-xl px-6 py-3.5 font-semibold"
              >
                <span class="inline-flex items-center gap-2">
                  <IconBrandGithub
                    size="sm"
                    class="h-5 w-5 shrink-0 text-current"
                  />
                  GitHub
                </span>
              </Link>
            </div>
          }
        />

        <section class="py-16 sm:py-20 border-t border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/30">
          <Container maxWidth="lg" class="max-w-5xl">
            <Title
              level={2}
              class="text-center mb-4 text-slate-900 dark:text-white text-2xl sm:text-3xl"
            >
              核心特性
            </Title>
            <Paragraph class="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              与 Dreamer 生态一致的技术选型，便于在 dweb
              应用与文档站中直接使用。
            </Paragraph>
            <Grid cols={12} gap={6}>
              {FEATURES.map((item) => (
                <GridItem
                  key={item.title}
                  span={12}
                  class="sm:col-span-6 lg:col-span-4"
                >
                  <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/80 shadow-sm hover:shadow-md hover:border-teal-300/80 dark:hover:border-teal-600/50 transition-all duration-200 h-full">
                    <Card
                      hoverable={false}
                      bordered={false}
                      class="rounded-2xl bg-transparent dark:bg-transparent shadow-none h-full"
                      bodyClass="p-6"
                    >
                      <span class="text-2xl mb-3 block" aria-hidden>
                        {item.icon}
                      </span>
                      <Title
                        level={4}
                        class="mb-2 text-slate-900 dark:text-white"
                      >
                        {item.title}
                      </Title>
                      <Paragraph class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.desc}
                      </Paragraph>
                    </Card>
                  </div>
                </GridItem>
              ))}
            </Grid>
          </Container>
        </section>

        <section class="py-16 sm:py-20 bg-slate-100/80 dark:bg-slate-950/50">
          <Container maxWidth="lg" class="max-w-3xl text-center">
            <Title level={2} class="mb-4 text-slate-900 dark:text-white">
              快速开始
            </Title>
            <Paragraph class="text-slate-600 dark:text-slate-300 mb-8">
              使用 JSR 添加依赖；桌面组件走主入口，移动专用组件走{" "}
              <code class="rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 text-sm">
                /mobile
              </code>{" "}
              子路径。
            </Paragraph>
            <CodeBlock
              title="安装与导入"
              code={`// Deno
deno add jsr:@dreamer/ui-preact
// Bun
bunx jsr add @dreamer/ui-preact

import { Button, Modal, Table } from "@dreamer/ui-preact";
import { BottomSheet, TabBar, NavBar } from "@dreamer/ui-preact/mobile";`}
              language="typescript"
              copyable
              class="rounded-xl text-left bg-slate-900 dark:bg-slate-950 border border-slate-700"
            />
            <Text class="mt-6 text-sm text-slate-500 dark:text-slate-400 block">
              本站点由 @dreamer/dweb + hybrid 渲染构建；侧栏可浏览全部组件示例。
            </Text>
          </Container>
        </section>

        <section class="py-16 sm:py-20 border-t border-slate-200/90 dark:border-slate-800/90">
          <Container maxWidth="md" class="max-w-2xl text-center">
            <Title level={3} class="mb-3 text-slate-900 dark:text-white">
              开始浏览
            </Title>
            <Paragraph class="text-slate-600 dark:text-slate-400 mb-8">
              从基础、表单到数据展示与图表，覆盖常见中后台与移动端页面。
            </Paragraph>
            <div class="flex flex-wrap justify-center gap-3">
              <Link
                href="/desktop"
                className="inline-flex items-center rounded-xl bg-teal-600 px-8 py-3.5 text-base font-semibold text-white dark:text-gray-200 hover:bg-teal-500 dark:hover:text-gray-200 transition-colors"
              >
                桌面组件 →
              </Link>
              <Link
                href="/mobile"
                className="inline-flex items-center rounded-xl border-2 border-slate-300 dark:border-slate-600 px-8 py-3.5 text-base font-semibold text-slate-700 dark:text-gray-200 hover:border-teal-400 transition-colors"
              >
                移动组件 →
              </Link>
            </div>
          </Container>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
