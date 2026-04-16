/**
 * DatePicker 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/form/date-picker
 */

import {
  CodeBlock,
  DatePicker,
  Form,
  FormItem,
  Paragraph,
  Title,
} from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

/**
 * 文档示例用：当前本地日期的 YYYY-MM-DD（与 DatePicker 的 value 格式一致）。
 *
 * @returns 形如 `2026-03-25` 的字符串
 */
function localTodayYmd(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

/**
 * 文档示例：当前年-月，与 `format="YYYY-MM"` 的受控值一致。
 */
function localYearMonth(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + pad(d.getMonth() + 1);
}

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const DATEPICKER_API: ApiRow[] = [
  {
    name: "mode",
    type: `"single" | "range" | "multiple"`,
    default: "single",
    description:
      "single：单日，串形态由 format 决定（默认 YYYY-MM-DD）；range：区间，onChange 为 JSON `{start,end}`；multiple：多日期，onChange 为 JSON 数组。range/multiple 仅支持含「日」的完整日期；若 format 缺 DD 会回退 YYYY-MM-DD 并 console.warn",
  },
  {
    name: "value",
    type: "见 mode",
    default: "-",
    description:
      "single → string | getter，与 format 一致（如仅年则为 `YYYY`）；range → `{ start?, end? }` 或 getter，值为完整日串；multiple → `string[]` 或 getter，项为完整日串",
  },
  {
    name: "min",
    type: "string",
    default: "-",
    description: "最小日期（YYYY-MM-DD）",
  },
  {
    name: "max",
    type: "string",
    default: "-",
    description: "最大日期（YYYY-MM-DD）",
  },
  {
    name: "size",
    type: "SizeVariant",
    default: "md",
    description: "尺寸：xs、sm、md、lg",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "是否禁用",
  },
  {
    name: "hideFocusRing",
    type: "boolean",
    default: "false",
    description: "为 true 时隐藏聚焦时的蓝色激活边框（ring）；默认 false 显示",
  },
  {
    name: "placeholder",
    type: "string",
    default: `"请选择日期"`,
    description: "无值时触发器上显示的占位文案",
  },
  {
    name: "format",
    type: "string",
    default: "YYYY-MM-DD",
    description:
      "展示与受控串格式（与 Day.js 展示占位一致）：`YYYY`、`MM`、`DD` 须按顺序、不可跳级（禁止如 YYYY-DD）。仅 `YYYY` → 只选年；`YYYY-MM` → 年月无日网格；默认完整日。非法或与 range/multiple 冲突时回退默认并 warn",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
  {
    name: "onChange",
    type: "(e: Event) => void",
    default: "-",
    description:
      "变更回调；`target.value`：single 为日期串，range / multiple 为 JSON 字符串（与隐藏域一致）",
  },
  { name: "name", type: "string", default: "-", description: "原生 name" },
  { name: "id", type: "string", default: "-", description: "原生 id" },
];

const importCode =
  `import { DatePicker, Form, FormItem } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

/** 本地时区今天 YYYY-MM-DD */
function localTodayYmd() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}
const val = signal(localTodayYmd());
<FormItem label="日期">
  <DatePicker
    value={val}
  />
</FormItem>`;

export default function FormDatePicker() {
  const today = localTodayYmd();
  /** min/max 与「有默认值」示例同年，保证默认选中日在可选范围内 */
  const rangeYear = new Date().getFullYear();
  const val = signal(today);
  const val2 = signal(today);
  /** size 示例：与 Input 一致四种尺寸，受控值均为今日 YYYY-MM-DD */
  const valSizeXs = signal(today);
  const valSizeSm = signal(today);
  const valSizeMd = signal(today);
  const valSizeLg = signal(today);
  /** range：受控对象；提交时组件传出 JSON */
  const valRange = signal<{ start: string; end: string }>({
    start: today,
    end: today,
  });
  /** multiple：YYYY-MM-DD 数组 */
  const valMulti = signal<string[]>([today]);
  /** format：仅选年 */
  const valFmtYear = signal(String(new Date().getFullYear()));
  /** format：选到月 */
  const valFmtYm = signal(localYearMonth());
  /** format：自定义分隔符的完整日 */
  const valFmtSlash = signal(
    (() => {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
    })(),
  );

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>DatePicker 日期选择</Title>
        <Paragraph class="mt-2">
          日期选择框，支持 <code class="text-sm">mode</code>（
          <code class="text-sm">single</code> 单日、
          <code class="text-sm">range</code> 区间、
          <code class="text-sm">multiple</code>{" "}
          多日）、<code class="text-sm">format</code>（控制粒度与受控串形态）、
          value、onChange、min、max、size、disabled、placeholder。区间与多选时
          onChange 的 value 为 JSON 字符串。日期区间请使用{" "}
          <code class="text-sm">mode="range"</code>
          。宽度由 class 控制。Tailwind v4 + light/dark。
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
            <Title level={3}>基础</Title>
            <FormItem label="日期">
              <DatePicker
                value={val}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<DatePicker
  value={val}
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>有默认值 / min / max</Title>
            <FormItem label="限制范围">
              <DatePicker
                value={val2}
                min={`${rangeYear}-01-01`}
                max={`${rangeYear}-12-31`}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<DatePicker
  value={val2}
  min="${rangeYear}-01-01"
  max="${rangeYear}-12-31"
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>size（xs / sm / md / lg）与 disabled</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              与 <code class="text-xs">Input</code> 相同四种{" "}
              <code class="text-xs">SizeVariant</code>
              ；右侧日历图标较触发器小一档（xs 约 12px，lg 约 24px 见方）。
            </Paragraph>
            <FormItem label="xs">
              <DatePicker
                value={valSizeXs}
                size="xs"
              />
            </FormItem>
            <FormItem label="sm">
              <DatePicker
                value={valSizeSm}
                size="sm"
              />
            </FormItem>
            <FormItem label="md（默认）">
              <DatePicker
                value={valSizeMd}
                size="md"
              />
            </FormItem>
            <FormItem label="lg">
              <DatePicker
                value={valSizeLg}
                size="lg"
              />
            </FormItem>
            <FormItem label="禁用">
              <DatePicker value={today} disabled onChange={() => {}} />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`function localTodayYmd() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}
const today = localTodayYmd();
const valXs = signal(today);
const valSm = signal(today);
const valMd = signal(today);
const valLg = signal(today);
<DatePicker value={valXs} size="xs" />
<DatePicker value={valSm} size="sm" />
<DatePicker value={valMd} size="md" />
<DatePicker value={valLg} size="lg" />
<DatePicker value={today} disabled onChange={() => {}} />`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>format：年 / 年月 / 自定义分隔符</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              占位符须为 <code class="text-xs">YYYY</code>、
              <code class="text-xs">MM</code>、<code class="text-xs">DD</code>
              （大写），按顺序不可跳级；字面量（如{" "}
              <code class="text-xs">-</code>、<code class="text-xs">/</code>
              ）可自定。仅年时面板为年宫格；到月时无日历网格。
            </Paragraph>
            <FormItem label='format="YYYY"（仅年）'>
              <DatePicker
                format="YYYY"
                value={valFmtYear}
              />
            </FormItem>
            <FormItem label='format="YYYY-MM"（年月）'>
              <DatePicker
                format="YYYY-MM"
                value={valFmtYm}
              />
            </FormItem>
            <FormItem label='format="YYYY/MM/DD"'>
              <DatePicker
                format="YYYY/MM/DD"
                value={valFmtSlash}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<DatePicker
  format="YYYY"
  value={valFmtYear}
/>
<DatePicker
  format="YYYY-MM"
  value={valFmtYm}
/>
<DatePicker
  format="YYYY/MM/DD"
  value={valFmtSlash}
/>`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>mode="range" 日期区间</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              日历内先选起点再选终点；确定后{" "}
              <code class="text-xs">onChange</code> 的{" "}
              <code class="text-xs">value</code> 为{" "}
              <code class="text-xs">{"JSON.stringify({ start, end })"}</code>
              。
            </Paragraph>
            <FormItem label="区间（JSON 受控）">
              <DatePicker
                mode="range"
                value={valRange}
                min={`${rangeYear}-01-01`}
                max={`${rangeYear}-12-31`}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`const valRange = signal({ start: "2026-01-01", end: "2026-01-31" });

<DatePicker mode="range" value={valRange} />`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>mode="multiple" 多个日期</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              同一日再点一次可取消；确定后 value 为 JSON 数组字符串（升序
              YYYY-MM-DD）。
            </Paragraph>
            <FormItem label="多选">
              <DatePicker
                mode="multiple"
                value={valMulti}
                min={`${rangeYear}-01-01`}
                max={`${rangeYear}-12-31`}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`const valMulti = signal<string[]>(["2026-01-01", "2026-01-15"]);

<DatePicker mode="multiple" value={valMulti} />`}
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
          组件接收以下属性（均为可选）。
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
              {DATEPICKER_API.map((row) => (
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
