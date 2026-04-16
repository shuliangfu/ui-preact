/**
 * DateTimePicker（移动版）文档页（概述、引入、示例、API）。路由: /mobile/form/datetime-picker
 */

import { DateTimePicker } from "@dreamer/ui-preact/mobile";
import { CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";
import {
  DocsApiTable,
  type DocsApiTableRow,
} from "../../../components/DocsApiTable.tsx";
import { MobileDocDemo } from "../../../components/MobileDocDemo.tsx";

/**
 * 当前本地日期时间，默认 format 形态。
 *
 * @returns 形如 YYYY-MM-DD HH:mm
 */
function localNowDateTime(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

const DATETIME_API: DocsApiTableRow[] = [
  {
    name: "mode",
    type: `"single" | "range" | "multiple"`,
    default: "single",
    description: "单点 / 区间 / 多点；时间与日期段组合规则见桌面文档",
  },
  {
    name: "value",
    type: "MaybeSignal<DateTimePickerValue>",
    default: "-",
    description: "受控值，串格式由 format 决定",
  },
  {
    name: "min",
    type: "string",
    default: "-",
    description: "日期下限 YYYY-MM-DD",
  },
  {
    name: "max",
    type: "string",
    default: "-",
    description: "日期上限 YYYY-MM-DD",
  },
  {
    name: "size",
    type: "SizeVariant",
    default: "md",
    description: "触发器尺寸",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "禁用",
  },
  {
    name: "hideFocusRing",
    type: "boolean",
    default: "false",
    description: "隐藏聚焦 ring",
  },
  {
    name: "placeholder",
    type: "string",
    default: `"请选择日期时间"`,
    description: "占位",
  },
  {
    name: "format",
    type: "string",
    default: "YYYY-MM-DD HH:mm",
    description: "日期段 + 时间段占位，见桌面 DateTimePicker 说明",
  },
  {
    name: "panelAttach",
    type: `"anchored" | "viewport"`,
    default: "anchored",
    description: "浮层锚定方式，同 DatePicker",
  },
  { name: "class", type: "string", default: "-", description: "根 class" },
  {
    name: "onChange",
    type: "(e: Event) => void",
    default: "-",
    description: "变更回调",
  },
  { name: "name", type: "string", default: "-", description: "隐藏域 name" },
  { name: "id", type: "string", default: "-", description: "根 id" },
];

const importCode = `import { DateTimePicker } from "@dreamer/ui-preact/mobile";
import { signal } from "@preact/signals";

const val = signal(localNowDateTime());

<DateTimePicker value={val} class="w-full" />`;

/** 文档页受控值须模块级 */
const mobileDateTimePickerVal = signal(localNowDateTime());

export default function MobileDateTimePickerDoc() {
  return (
    <div class="w-full max-w-3xl space-y-10">
      <section>
        <Title level={1}>DateTimePicker 日期时间（移动）</Title>
        <Paragraph class="mt-2">
          日历 + 时分（及 format 允许的秒等）组合选择，与桌面共用实现；移动端从
          {" "}
          <code class="text-sm">@dreamer/ui-preact/mobile</code>{" "}
          导入即可与同页表单一致。
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
          <Title level={3}>基础</Title>
          <MobileDocDemo>
            <DateTimePicker value={mobileDateTimePickerVal} class="w-full" />
          </MobileDocDemo>
          <CodeBlock
            title="代码示例"
            code={importCode}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </div>
      </section>

      <section class="space-y-4">
        <Title level={2}>API</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          完整 mode/format 组合与桌面 DateTimePicker 文档一致。
        </Paragraph>
        <DocsApiTable rows={DATETIME_API} />
      </section>
    </div>
  );
}
