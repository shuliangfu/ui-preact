/**
 * Slider 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/form/slider
 */

import {
  CodeBlock,
  Form,
  FormItem,
  Paragraph,
  Slider,
  Title,
} from "@dreamer/ui-preact";
import { useMemo } from "preact/hooks";
import { signal } from "@preact/signals";

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const SLIDER_API: ApiRow[] = [
  {
    name: "value",
    type:
      "number | [number, number] | (() => number | [number, number]) | Signal<number | [number, number]>",
    default: "-",
    description:
      "单滑块为 number，range 为 [min,max]。与全库表单一致为 MaybeSignal：字面量、`() => T`、`signal()` 返回值；勿在 render 内每次新建 `signal()`（须 useMemo 等保持同一引用）；勿直接绑 `sig.value`（快照失步或误订阅）。",
  },
  { name: "min", type: "number", default: "0", description: "最小值" },
  { name: "max", type: "number", default: "100", description: "最大值" },
  { name: "step", type: "number", default: "1", description: "步长" },
  {
    name: "range",
    type: "boolean",
    default: "false",
    description: "是否为范围双滑块",
  },
  {
    name: "vertical",
    type: "boolean",
    default: "false",
    description: "是否竖向",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "是否禁用",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
  {
    name: "onChange",
    type: "(e: Event) => void",
    default: "-",
    description:
      "仅在松手时原生 change 触发；单值 target.value 为 string；range 为合成 value: [n,n]。拖动中不调用，避免父级每帧更新导致 input 被换掉拖不动",
  },
  {
    name: "onInput",
    type: "(e: Event) => void",
    default: "-",
    description:
      "拖动过程回调（rAF 合并）；需要拖动时更新父级 state 或展示请用此项；与 onChange 可同时使用",
  },
  { name: "name", type: "string", default: "-", description: "原生 name" },
  { name: "id", type: "string", default: "-", description: "原生 id" },
];

const importCode = `import { Slider, Form, FormItem } from "@dreamer/ui-preact";
import { useMemo } from "preact/hooks";
import { signal } from "@preact/signals";

/** Signal 必须在组件生命周期内保持同一引用：用 useMemo（或模块顶层）创建一次，切勿在 render 里每次 signal()。 */
export function Example() {
  const committed = useMemo(() => signal(50), []);
  return (
    <FormItem label="0–100">
      <div class="flex w-full min-w-0 flex-col gap-1">
        <Slider value={committed} min={0} max={100} />
        <span class="text-sm tabular-nums text-slate-600 dark:text-slate-400">
          {\`当前值：\${committed.value}\`}
        </span>
      </div>
    </FormItem>
  );
}`;

/** 文档示例：滑块下方展示当前数值的样式（等宽数字、次要色） */
const sliderValueHintCls =
  "text-sm tabular-nums text-slate-600 dark:text-slate-400";

export default function FormSlider() {
  /**
   * 与 Slider 的 `value` 绑定同一 Signal；须在**首帧后仍指向同一实例**。
   * 若在函数体内每次 `signal(50)`，父组件任一重渲染都会换一个新 Signal（初值又变回 50），
   * Slider 内已 commit 的旧实例与 props 上的新实例脱节，`effect` 会用新实例的 50 把 DOM 盖回，表现为松手回弹、当前值不跟。
   */
  const singleVal = useMemo(() => signal(50), []);
  const rangeVal = useMemo(() => signal<[number, number]>([20, 80]), []);
  const stepVal = useMemo(() => signal(30), []);

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Slider 滑块</Title>
        <Paragraph class="mt-2 leading-relaxed">
          滑块，支持单值或 range
          双值、min、max、step、vertical、disabled、onChange / onInput。Tailwind
          v4 + light/dark。
        </Paragraph>
        <Paragraph class="mt-3 text-sm text-slate-600 dark:text-slate-400">
          <strong>受控与拖动：</strong>
          本组件不在原生 <code class="text-xs">input</code> 上绑响应式{" "}
          <code class="text-xs">value</code>，而用 ref + effect
          在非拖动时同步。拖动中由内部{" "}
          <code class="text-xs">commitMaybeSignal</code> 更新你传入的{" "}
          <code class="text-xs">value</code>{" "}
          Signal，一般<strong>不必</strong>再在{" "}
          <code class="text-xs">onInput</code> 里重复写入同一状态。<strong>
            不要
          </strong>在 <code class="text-xs">onChange</code>{" "}
          里按帧更新父级（仅松手触发）；若用其它方式在拖动中频繁替换整段子树，仍可能换掉
          {" "}
          <code class="text-xs">input</code> 导致拖不动。
        </Paragraph>
        <Paragraph class="mt-2 text-sm text-slate-600 dark:text-slate-400">
          <strong>响应式与读数：</strong>
          下方「当前值 / 当前范围」与 <code class="text-xs">value</code>{" "}
          使用<strong>同一</strong> <code class="text-xs">Signal</code>，文案用
          {" "}
          <code class="text-xs">{"{`…${sig.value}`}"}</code>{" "}
          绑定即可：<code class="text-xs">Slider</code> 在拖动时会在内部{" "}
          <code class="text-xs">commitMaybeSignal</code>{" "}
          更新该值，故<strong>刷新后首屏即有文案</strong>，拖动中也同步。
          <strong class="block mt-1">
            切勿在组件函数体内每次执行 <code class="text-xs">signal()</code>
            ：
          </strong>
          每次重渲染都会得到<strong>新实例</strong>（初值重置），Slider
          会收到新的 <code class="text-xs">value</code>，内部的{" "}
          <code class="text-xs">
            effect
          </code>{" "}
          用新 Signal 的旧初值把拇指 DOM
          写回去，表现为松手回弹、当前值不更新。请用{" "}
          <code class="text-xs">useMemo(() =&gt; signal(…), [])</code>、
          <code class="text-xs">useRef</code>{" "}
          惰性创建，或模块级常量。若需在 DevTools 里尽量减少兄弟节点高亮，可改用
          ref +{" "}
          <code class="text-xs">textContent</code>，但须在 ref
          挂载后另行同步（勿仅依赖首次{" "}
          <code class="text-xs">createEffect</code>，否则首帧{" "}
          <code class="text-xs">
            ref.current
          </code>{" "}
          可能仍为 null）。
        </Paragraph>
        <Paragraph class="mt-2 text-sm text-slate-600 dark:text-slate-400">
          <strong>range 双滑块：</strong>
          横向为同一轨道上的两枚拇指，中间为选中区间色带；竖向 range
          仍为双轨示意布局。
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

        <Form layout="vertical" class="w-full space-y-6">
          <section class="space-y-4">
            <Title level={3}>单值</Title>
            <FormItem label="0–100">
              <div class="flex w-full min-w-0 flex-col gap-1">
                <Slider value={singleVal} min={0} max={100} />
                <span class={sliderValueHintCls}>
                  当前值：{singleVal.value}
                </span>
              </div>
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`import { useMemo } from "preact/hooks";
import { signal } from "@preact/signals";

function Row() {
  const committed = useMemo(() => signal(50), []);
  return (
    <div class="flex w-full min-w-0 flex-col gap-1">
      <Slider value={committed} min={0} max={100} />
      <span class="text-sm tabular-nums text-slate-600 dark:text-slate-400">
        {\`当前值：\${committed.value}\`}
      </span>
    </div>
  );
}`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>range 双滑块</Title>
            <FormItem label="范围">
              <div class="flex w-full min-w-0 flex-col gap-1">
                <Slider range value={rangeVal} min={0} max={100} />
                <span class={sliderValueHintCls}>
                  当前范围：{rangeVal.value[0]} – {rangeVal.value[1]}
                </span>
              </div>
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`import { useMemo } from "preact/hooks";
import { signal } from "@preact/signals";

function RangeRow() {
  const range = useMemo(() => signal<[number, number]>([20, 80]), []);
  return (
    <div class="flex w-full min-w-0 flex-col gap-1">
      <Slider range value={range} min={0} max={100} />
      <span class="text-sm tabular-nums text-slate-600 dark:text-slate-400">
        {\`当前范围：\${range.value[0]} – \${range.value[1]}\`}
      </span>
    </div>
  );
}`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>vertical 竖排</Title>
            <FormItem label="竖排单值">
              <div class="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
                <Slider value={singleVal} min={0} max={100} vertical />
                <span class={`${sliderValueHintCls} sm:pb-1`}>
                  当前值：{singleVal.value}（与上方「单值」共用 Signal）
                </span>
              </div>
            </FormItem>
          </section>

          <section class="space-y-4">
            <Title level={3}>step / disabled</Title>
            <FormItem label="step=10">
              <div class="flex w-full min-w-0 flex-col gap-1">
                <Slider value={stepVal} min={0} max={100} step={10} />
                <span class={sliderValueHintCls}>
                  当前值：{stepVal.value}（步长 10）
                </span>
              </div>
            </FormItem>
            <FormItem label="disabled">
              <div class="flex w-full min-w-0 flex-col gap-1">
                <Slider value={60} min={0} max={100} disabled />
                <span class={sliderValueHintCls}>
                  当前值：60（禁用，不可拖动）
                </span>
              </div>
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`import { useMemo } from "preact/hooks";
import { signal } from "@preact/signals";

function StepBlock() {
  const step = useMemo(() => signal(30), []);
  return (
    <>
      <div class="flex w-full min-w-0 flex-col gap-1">
        <Slider value={step} min={0} max={100} step={10} />
        <span class="text-sm tabular-nums text-slate-600 dark:text-slate-400">
          {\`当前值：\${step.value}（步长 10）\`}
        </span>
      </div>
      <div class="flex w-full min-w-0 flex-col gap-1">
        <Slider value={60} min={0} max={100} disabled />
        <span class="text-sm tabular-nums text-slate-600 dark:text-slate-400">
          当前值：60（禁用，不可拖动）
        </span>
      </div>
    </>
  );
}`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>
        </Form>
      </section>

      <section class="space-y-3">
        <Title level={2}>API</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          组件接收以下属性（均为可选）。对外只暴露{" "}
          <code class="text-xs">onChange</code> /{" "}
          <code class="text-xs">onInput</code>；<code class="text-xs">
            range
          </code>{" "}
          为 true 时两个原生 input 在拖动中仅经 rAF 走{" "}
          <code class="text-xs">onInput</code>（若传入）；松手时再触发{" "}
          <code class="text-xs">onChange</code>。
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
              {SLIDER_API.map((row) => (
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
