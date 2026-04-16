/**
 * DateTimePicker 组件文档页（概述、引入、示例、API）
 * 路由: /desktop/form/datetime-picker
 */

import {
  CodeBlock,
  DateTimePicker,
  Form,
  FormItem,
  Paragraph,
  Title,
} from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

/**
 * 文档示例：当前本地日期时间，格式 `YYYY-MM-DD HH:mm`（与默认 format 一致）。
 */
function localNowDateTime(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

/**
 * 文档示例：含秒的日期时间，与 `format="YYYY-MM-DD HH:mm:ss"` 一致。
 */
function localNowDateTimeWithSeconds(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

/**
 * 文档示例：仅年 + 时间，与 `format="YYYY HH:mm"` 一致（空格为字面量）。
 */
function localYearWithTime(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 文档示例：两位年 + 月日 + 时，与 `format="YY-MM-DD HH"` 一致（如 2026 → `26`）。
 */
function localYyMmDdHour(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const yy = pad(d.getFullYear() % 100);
  return `${yy}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${
    pad(d.getHours())
  }`;
}

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const DATETIMEPICKER_API: ApiRow[] = [
  {
    name: "mode",
    type: `"single" | "range" | "multiple"`,
    default: "single",
    description:
      "single：单点，整串形态由 format 决定；range：起止各选日期段+时间段（JSON）；multiple：多条同格式串（JSON 数组）。range/multiple 要求日期段含「日」且时间至少到「分」；否则回退默认 format 并 warn",
  },
  {
    name: "value",
    type: "见 mode",
    default: "-",
    description:
      "single → string | getter，与 format 一致；range → `{ start?, end? }`；multiple → string[]；均可 getter",
  },
  {
    name: "min",
    type: "string",
    default: "-",
    description: "可选日下限（仅日期部分 YYYY-MM-DD，与 DatePicker 一致）",
  },
  {
    name: "max",
    type: "string",
    default: "-",
    description: "可选日上限（YYYY-MM-DD）",
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
    description: "为 true 时隐藏聚焦时的蓝色 ring",
  },
  {
    name: "placeholder",
    type: "string",
    default: `"请选择日期时间"`,
    description: "无值时触发器占位文案",
  },
  {
    name: "format",
    type: "string",
    default: "YYYY-MM-DD HH:mm",
    description:
      "单串内「日期段」在前、「时间段」在后：年为 `YYYY` 或 `YY`（两位展示/解析，解析按当前世纪展开），`MM`/`DD` 顺序不可跳级；时间须含 `HH`，可选小写 `mm`、`ss`。`MM` 为月。非法或与 range/multiple 冲突时回退默认并 warn",
  },
  { name: "class", type: "string", default: "-", description: "额外 class" },
  {
    name: "onChange",
    type: "(e: Event) => void",
    default: "-",
    description:
      "变更回调；single 为整串，range / multiple 为 JSON 字符串（与隐藏域一致）",
  },
  { name: "name", type: "string", default: "-", description: "原生 name" },
  { name: "id", type: "string", default: "-", description: "原生 id" },
];

const importCode =
  `import { DateTimePicker, Form, FormItem } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

function localNowDateTime() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
}

const val = signal(localNowDateTime());
<FormItem label="日期时间">
  <DateTimePicker
    value={val}
  />
</FormItem>`;

export default function FormDateTimePickerDoc() {
  const now = localNowDateTime();
  const rangeYear = new Date().getFullYear();

  const val = signal(now);
  const val2 = signal(now);
  const valSizeXs = signal(now);
  const valSizeSm = signal(now);
  const valSizeMd = signal(now);
  const valSizeLg = signal(now);
  const valRange = signal<{ start: string; end: string }>({
    start: now,
    end: now,
  });
  const valMulti = signal<string[]>([now]);
  const nowSec = localNowDateTimeWithSeconds();
  const valWithSeconds = signal(nowSec);
  const valYearTime = signal(localYearWithTime());
  const valYyMmDdHour = signal(localYyMmDdHour());

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>DateTimePicker 日期时间</Title>
        <Paragraph class="mt-2">
          日历 + 时间列表：默认受控串为{" "}
          <code class="text-sm">YYYY-MM-DD HH:mm</code>；可用{" "}
          <code class="text-sm">format</code>{" "}
          与 Day.js 展示占位一致，扩展秒、两位年{" "}
          <code class="text-sm">YY</code>、或把日期段缩为仅年/年月等（single
          模式）。分须小写 <code class="text-sm">mm</code>，与月的{" "}
          <code class="text-sm">MM</code> 区分。支持{" "}
          <code class="text-sm">mode</code>
          ：单日、区间、多日（多日共用当前所选时/分/秒，按自然日切换）。Tailwind
          v4 + light/dark。
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
            <Title level={3}>基础（mode="single"）</Title>
            <FormItem label="日期时间">
              <DateTimePicker
                value={val}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<DateTimePicker value={val} />`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>format：含秒 / 仅年+时间</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              <code class="text-xs">YYYY-MM-DD HH:mm:ss</code>{" "}
              会显示「秒」列；仅 <code class="text-xs">HH</code>{" "}
              时只显示时（range/multiple 会回退到含分）。日期段可为{" "}
              <code class="text-xs">YYYY</code>、<code class="text-xs">YY</code>
              （两位年，如 2026→<code class="text-xs">26</code>
              ，解析按当前世纪展开）、<code class="text-xs">YYYY-MM</code>{" "}
              等与 DatePicker 相同规则。
            </Paragraph>
            <FormItem label='format="YYYY-MM-DD HH:mm:ss"'>
              <DateTimePicker
                format="YYYY-MM-DD HH:mm:ss"
                value={valWithSeconds}
              />
            </FormItem>
            <FormItem label='format="YYYY HH:mm"（single：仅选年 + 时分）'>
              <DateTimePicker
                format="YYYY HH:mm"
                value={valYearTime}
              />
            </FormItem>
            <FormItem label='format="YY-MM-DD HH"（两位年 + 仅小时）'>
              <DateTimePicker
                format="YY-MM-DD HH"
                value={valYyMmDdHour}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<DateTimePicker format="YYYY-MM-DD HH:mm:ss" value={valWithSeconds} />
<DateTimePicker format="YYYY HH:mm" value={valYearTime} />
<DateTimePicker format="YY-MM-DD HH" value={valYyMmDdHour} />`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>min / max（限制可选「日」）</Title>
            <FormItem label="限制在当年">
              <DateTimePicker
                value={val2}
                min={`${rangeYear}-01-01`}
                max={`${rangeYear}-12-31`}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<DateTimePicker
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
              ；日历图标较触发器小一档。
            </Paragraph>
            <FormItem label="xs">
              <DateTimePicker
                value={valSizeXs}
                size="xs"
              />
            </FormItem>
            <FormItem label="sm">
              <DateTimePicker
                value={valSizeSm}
                size="sm"
              />
            </FormItem>
            <FormItem label="md（默认）">
              <DateTimePicker
                value={valSizeMd}
                size="md"
              />
            </FormItem>
            <FormItem label="lg">
              <DateTimePicker
                value={valSizeLg}
                size="lg"
              />
            </FormItem>
            <FormItem label="禁用">
              <DateTimePicker value={now} disabled onChange={() => {}} />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`<DateTimePicker value={valXs} size="xs" />
<DateTimePicker value={valSm} size="sm" />
<DateTimePicker value={valMd} size="md" />
<DateTimePicker value={valLg} size="lg" />
<DateTimePicker value={now} disabled onChange={() => {}} />`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>mode="range" 日期时间区间</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              顶部切换「开始」「结束」，分别为当前槽选日与时、分；确定后 value
              为 <code class="text-xs">{"JSON.stringify({ start, end })"}</code>
              ，且按时间先后排序写入 start/end。
            </Paragraph>
            <FormItem label="区间">
              <DateTimePicker
                mode="range"
                value={valRange}
                min={`${rangeYear}-01-01`}
                max={`${rangeYear}-12-31`}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`const valRange = signal({
  start: "2026-01-01 09:00",
  end: "2026-01-31 18:00",
});

<DateTimePicker mode="range" value={valRange} />`}
              language="tsx"
              showLineNumbers
              copyable
              wrapLongLines
            />
          </section>

          <section class="space-y-4">
            <Title level={3}>mode="multiple" 多个日期时间（共用时、分）</Title>
            <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
              先选时间列，再在日历上按日切换：同一自然日再点会去掉该日对应项；每条串形态与当前
              {" "}
              <code class="text-xs">format</code> 一致（默认含到分）。
            </Paragraph>
            <FormItem label="多选">
              <DateTimePicker
                mode="multiple"
                value={valMulti}
                min={`${rangeYear}-01-01`}
                max={`${rangeYear}-12-31`}
              />
            </FormItem>
            <CodeBlock
              title="代码示例"
              code={`const valMulti = signal<string[]>(["2026-01-01 10:00", "2026-01-15 10:00"]);

<DateTimePicker mode="multiple" value={valMulti} />`}
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
              {DATETIMEPICKER_API.map((row) => (
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
