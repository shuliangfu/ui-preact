/**
 * Progress 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/feedback/progress
 */

import { signal, untracked, useSignalEffect } from "@preact/signals";
import {
  Button,
  CodeBlock,
  Paragraph,
  Progress,
  Title,
} from "@dreamer/ui-preact";

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const PROGRESS_API: ApiRow[] = [
  {
    name: "percent",
    type: "number | Signal<number> | () => number",
    default: "0",
    description:
      "进度 0–100；手写 JSX 须 percent={sig} 或 percent={()=>n}，勿 percent={sig.value}",
  },
  {
    name: "type",
    type: "line | circle",
    default: "line",
    description: "线性或环形",
  },
  {
    name: "status",
    type: "normal | success | exception | active",
    default: "normal",
    description: "状态",
  },
  {
    name: "showInfo",
    type: "boolean",
    default: "true",
    description: "是否显示百分比文案",
  },
  {
    name: "strokeWidth",
    type: "number",
    default: "8",
    description: "线性条高度（px）",
  },
  {
    name: "size",
    type: "number",
    default: "120",
    description: "环形直径（px）",
  },
  {
    name: "strokeWidthCircle",
    type: "number",
    default: "6",
    description: "环形线宽（px）",
  },
  {
    name: "strokeColor",
    type: "string",
    default: "-",
    description: "进度条颜色（CSS）",
  },
  {
    name: "trailColor",
    type: "string",
    default: "-",
    description: "轨道颜色（CSS）",
  },
  {
    name: "format",
    type: "(percent: number) => string",
    default: "-",
    description: "自定义文案",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "外层容器 class",
  },
];

const importCode = `import { Progress } from "@dreamer/ui-preact";

<Progress percent={30} />
<Progress type="circle" percent={75} />`;

const exampleLine = `<Progress percent={30} />
<Progress percent={70} status="success" />
<Progress percent={100} status="exception" />
<Progress percent={45} status="active" />`;

const exampleNoInfo = `<Progress percent={60} showInfo={false} />`;

const exampleFormat = `<Progress percent={3} format={(_p) => \`3/10 步\`} />`;

const exampleCircle = `<Progress type="circle" percent={75} />
<Progress type="circle" percent={100} status="success" />
<Progress
  type="circle"
  percent={30}
  size={80}
  strokeWidthCircle={4}
/>`;

const exampleStroke = `<Progress
  percent={50}
  strokeWidth={12}
/>
<Progress
  percent={60}
  strokeColor="rgb(34 197 94)"
  trailColor="rgb(226 232 240)"
/>`;

/** 文档内「0→100」示例对应的可复制代码（与页面行为一致） */
const exampleDynamic =
  `import { signal, untracked, useSignalEffect } from "@preact/signals";
import { Button, Progress } from "@dreamer/ui-preact";

export function Demo() {
  const dynamicPercent = signal(0);
  const replayKey = signal(0);

  // 只订阅 replayKey；勿在 effect 同步体内裸写 dynamicPercent.value = 0（setter 读旧值会把 effect 绑到进度上）。
  useSignalEffect(() => {
    void replayKey.value;
    untracked(() => {
      dynamicPercent.value = 0;
    });
    const id = globalThis.setInterval(() => {
      const p = dynamicPercent.peek();
      if (p >= 100) {
        globalThis.clearInterval(id);
        return;
      }
      dynamicPercent.value = p + 1;
    }, 40);
    return () => globalThis.clearInterval(id);
  });

  return (
    <>
      {/** 上一行仅按钮；下一行线性条；再下一行环形 */}
      <div class="w-full">
        <Button
          type="button"
          onClick={() => {
            replayKey.value += 1;
          }}
        >
          重新播放
        </Button>
      </div>
      <div class="w-full min-h-9 flex items-center">
        <Progress percent={dynamicPercent} status="active" />
      </div>
      <div class="flex justify-center">
        <Progress type="circle" percent={dynamicPercent} status="active" />
      </div>
    </>
  );
}`;

export default function FeedbackProgress() {
  /** 动态进度 0–100 */
  const dynamicPercent = signal(0);
  /** 递增以触发 {@link useSignalEffect} 重跑：清旧定时器并从 0 再播 */
  const replayKey = signal(0);

  /**
   * `useSignalEffect` 底层是 `effect()`：同步体内对 `dynamicPercent` 的赋值会经 setter 读旧值，
   * 误把 `dynamicPercent` 登记为依赖 → 每次 tick 都重跑 effect、清掉 interval，表现为「重播不从 0 开始」。
   * 归零包在 `untracked` 内；tick 内用 `peek()` 读当前值。
   */
  useSignalEffect(() => {
    void replayKey.value;
    untracked(() => {
      dynamicPercent.value = 0;
    });
    const id = globalThis.setInterval(() => {
      const p = dynamicPercent.peek();
      if (p >= 100) {
        globalThis.clearInterval(id);
        return;
      }
      dynamicPercent.value = p + 1;
    }, 40);
    return () => globalThis.clearInterval(id);
  });

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Progress 进度条</Title>
        <Paragraph class="mt-2">
          进度条（线性/环形）；支持百分比、状态（正常/成功/异常/进行中）、是否显示文案、自定义颜色与
          format；动态进度请对 percent 传入 `signal()` 返回的 Signal， 勿写
          .value（手写 JSX 会快照不更新）。使用 Tailwind v4，支持 light/dark
          主题。
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
          <Title level={3}>动态进度（0 → 100）</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            用 signal 存百分比；<code class="text-xs">useSignalEffect</code>
            {" "}
            内只读 <code class="text-xs">replayKey</code>；归零须包在{" "}
            <code class="text-xs">untracked</code>，否则{" "}
            <code class="text-xs">dynamicPercent.value = 0</code>{" "}
            的 setter 会把 effect 绑到进度上；tick 里用{" "}
            <code class="text-xs">peek()</code>{" "}
            读当前值。percent 须传 Signal 本身（如{" "}
            <code class="text-xs">percent={"{"}dynamicPercent{"}"}</code>
            ），勿写 <code class="text-xs">.value</code>
            ：手写 JSX 在创建 ComponentChildren 时会求值成快照，无法订阅
            signal。
          </Paragraph>
          <div class="space-y-3 w-full">
            {/** 第一行：仅「重新播放」；第二行：线性条；第三行：环形居中 */}
            <div class="w-full">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  replayKey.value += 1;
                }}
              >
                重新播放
              </Button>
            </div>
            <div class="w-full min-h-9 flex items-center">
              <Progress percent={dynamicPercent} status="active" />
            </div>
            <div class="flex justify-center">
              <Progress
                type="circle"
                percent={dynamicPercent}
                status="active"
                size={100}
              />
            </div>
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleDynamic}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>线性</Title>
          <div class="space-y-2 w-full">
            <Progress percent={30} />
            <Progress percent={70} status="success" />
            <Progress percent={100} status="exception" />
            <Progress percent={45} status="active" />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleLine}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>不显示百分比</Title>
          <div class="w-full">
            <Progress percent={60} showInfo={false} />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleNoInfo}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>自定义 format</Title>
          <div class="w-full">
            <Progress
              percent={3}
              format={(_p) => `3/10 步`}
            />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleFormat}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>环形</Title>
          <div class="flex flex-wrap gap-8">
            <Progress type="circle" percent={75} />
            <Progress type="circle" percent={100} status="success" />
            <Progress
              type="circle"
              percent={30}
              size={80}
              strokeWidthCircle={4}
            />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleCircle}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>线性 strokeWidth / strokeColor / trailColor</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            线性进度条可设置描边宽度、进度色、轨道色。
          </Paragraph>
          <div class="space-y-2 w-full">
            <Progress percent={50} strokeWidth={12} />
            <Progress
              percent={60}
              strokeColor="rgb(34 197 94)"
              trailColor="rgb(226 232 240)"
            />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleStroke}
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
          组件接收以下属性。
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
              {PROGRESS_API.map((row) => (
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
