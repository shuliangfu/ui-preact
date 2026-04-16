/**
 * Steps 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/navigation/steps
 */

import { CodeBlock, Paragraph, Steps, Title } from "@dreamer/ui-preact";
import { computed, signal } from "@preact/signals";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const STEPS_API: ApiRow[] = [
  {
    name: "items",
    type: "StepItem[]",
    default: "-",
    description: "步骤项（title、description、status）",
  },
  {
    name: "current",
    type: "number | (() => number) | Signal<number>",
    default: "0",
    description:
      "当前步骤（从 0 起）；推荐 current={sig}，勿 current={sig.value}（手写 JSX 快照）",
  },
  {
    name: "direction",
    type: "horizontal | vertical",
    default: "horizontal",
    description: "方向",
  },
  {
    name: "onChange",
    type: "(current: number) => void",
    default: "-",
    description: "点击某步时回调",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
];

const STEP_ITEM_API: ApiRow[] = [
  {
    name: "title",
    type: "string | unknown",
    default: "-",
    description: "标题",
  },
  {
    name: "description",
    type: "string | unknown",
    default: "-",
    description: "描述",
  },
  {
    name: "status",
    type: "wait | process | finish",
    default: "-",
    description: "状态（不传则根据 current 推导）",
  },
];

const importCode = `import { signal } from "@preact/signals";
import { Steps } from "@dreamer/ui-preact";

const current = signal(0);
const items = [
  { title: "步骤一", description: "填写基本信息" },
  { title: "步骤二", description: "确认订单" },
  { title: "步骤三", description: "完成支付" },
];
<Steps
  items={items}
  current={current}
  onChange={(c) => current.value = c}
  direction="horizontal"
/>`;

const exampleHorizontal = `<Steps
  items={items}
  current={current}
  onChange={(c) => current.value = c}
  direction="horizontal"
/>`;

const exampleVertical = `<Steps
  items={items}
  current={current}
  direction="vertical"
/>`;

const exampleStatus = `<Steps items={[
  { title: "已完成", description: "步骤一", status: "finish" },
  { title: "进行中", description: "步骤二", status: "process" },
  { title: "待开始", description: "步骤三", status: "wait" },
]} current={1} />`;

/** 模块级 signal：0/1/2 对应第 1/2/3 步；示例主按钮在末步直接「已完成」，不再写入 current=n */
const current = signal(0);

export default function NavigationSteps() {
  const items = [
    { title: "步骤一", description: "填写基本信息" },
    { title: "步骤二", description: "确认订单" },
    { title: "步骤三", description: "完成支付" },
  ];

  /** 末步索引（第 n 步对应 n-1）；到达该步时主按钮直接「已完成」，无中间「完成」态 */
  const lastStepIndex = items.length;

  /**
   * 主按钮文案 / disabled：须走 {@link computed}。仅在 JSX 里写静态文本时，
   * 部分路由下可能不订阅 signal，会卡在首帧「下一步」。
   */
  const primaryLabel = computed(() => {
    const v = current.value;
    // 已在末步或更大（如点击步骤条等将 current 推到 n）：统一「已完成」，不再出现「完成」
    if (v > lastStepIndex) return "已完成";
    return "下一步";
  });

  const primaryDisabled = computed(() => current.value >= lastStepIndex);
  const prevDisabled = computed(() => current.value === 0);

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Steps 步骤条</Title>
        <Paragraph class="mt-2">
          步骤条：items（title、description、status）、current、onChange、direction（horizontal/vertical）、class。
          <code class="text-xs">current</code>
          须传 <code class="text-xs">signal</code> 返回值（如{" "}
          <code class="text-xs">current={"{"}step{"}"}</code>
          ）或零参 getter，勿写 <code class="text-xs">current.value</code>
          。使用 Tailwind v4，支持 light/dark 主题。
        </Paragraph>
      </section>

      <section class="space-y-3">
        <Title level={2}>引入</Title>
        <CodeBlock
          title="代码示例"
          code={importCode}
          language="tsx"
          showLineNumbers
          wrapLongLines
        />
      </section>

      <section class="space-y-8">
        <Title level={2}>示例</Title>

        <div class="space-y-4">
          <Title level={3}>direction=horizontal（可点击）</Title>
          {/* 包裹层限制宽度；className + 内联 style 保证 SSR/CSR 一致输出 class 与 max-width */}
          <div className="w-full max-w-3xl" style={{ maxWidth: "48rem" }}>
            <Steps
              items={items}
              current={current}
              onChange={(c) => current.value = c}
              direction="horizontal"
            />
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="px-3 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={prevDisabled}
              onClick={() => {
                current.value = Math.max(0, current.value - 1);
              }}
            >
              上一步
            </button>
            <button
              type="button"
              class="px-3 py-1.5 text-sm rounded font-medium text-white transition-colors bg-blue-600 hover:bg-blue-700 enabled:cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none disabled:bg-slate-500 disabled:text-slate-200 disabled:hover:bg-slate-500 dark:disabled:bg-slate-600 dark:disabled:text-slate-300 dark:disabled:hover:bg-slate-600"
              disabled={primaryDisabled}
              onClick={() => {
                const v = current.value;
                // 末步仅展示「已完成」且 disabled，不再把 current 置为 n（避免出现全绿勾前的「完成」点击）
                if (v >= lastStepIndex) return;
                current.value = Math.min(lastStepIndex, v + 1);
              }}
            >
              {primaryLabel}
            </button>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleHorizontal}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>direction=vertical</Title>
          <div className="w-full max-w-3xl" style={{ maxWidth: "48rem" }}>
            <Steps items={items} current={current} direction="vertical" />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleVertical}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>items 含 status</Title>
          <div className="w-full max-w-3xl" style={{ maxWidth: "48rem" }}>
            <Steps
              items={[
                { title: "已完成", description: "步骤一", status: "finish" },
                { title: "进行中", description: "步骤二", status: "process" },
                { title: "待开始", description: "步骤三", status: "wait" },
              ]}
              current={1}
            />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleStatus}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>
      </section>

      <section class="space-y-3">
        <Title level={2}>API</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          StepItem：title、description、status。Steps 属性如下。
        </Paragraph>
        <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-600 mb-4">
          <table class="w-full min-w-lg text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/80">
                <th class="px-4 py-3 text-left font-medium text-slate-900 dark:text-slate-100">
                  属性
                </th>
                <th class="px-4 py-3 text-left font-medium text-slate-900 dark:text-slate-100">
                  类型
                </th>
                <th class="px-4 py-3 text-left font-medium text-slate-900 dark:text-slate-100">
                  默认值
                </th>
                <th class="px-4 py-3 text-left font-medium text-slate-900 dark:text-slate-100">
                  说明
                </th>
              </tr>
            </thead>
            <tbody>
              {STEPS_API.map((row) => (
                <tr
                  key={row.name}
                  class="border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                >
                  <td class="px-4 py-2.5 font-mono text-slate-700 dark:text-slate-300">
                    {row.name}
                  </td>
                  <td class="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    {row.type}
                  </td>
                  <td class="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    {row.default}
                  </td>
                  <td class="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Paragraph class="text-sm font-medium text-slate-700 dark:text-slate-300">
          StepItem
        </Paragraph>
        <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-600">
          <table class="w-full min-w-lg text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/80">
                <th class="px-4 py-3 text-left font-medium text-slate-900 dark:text-slate-100">
                  属性
                </th>
                <th class="px-4 py-3 text-left font-medium text-slate-900 dark:text-slate-100">
                  类型
                </th>
                <th class="px-4 py-3 text-left font-medium text-slate-900 dark:text-slate-100">
                  默认值
                </th>
                <th class="px-4 py-3 text-left font-medium text-slate-900 dark:text-slate-100">
                  说明
                </th>
              </tr>
            </thead>
            <tbody>
              {STEP_ITEM_API.map((row) => (
                <tr
                  key={row.name}
                  class="border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                >
                  <td class="px-4 py-2.5 font-mono text-slate-700 dark:text-slate-300">
                    {row.name}
                  </td>
                  <td class="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    {row.type}
                  </td>
                  <td class="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    {row.default}
                  </td>
                  <td class="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
