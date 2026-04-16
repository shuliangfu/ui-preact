/**
 * DatePicker（移动版）文档页（概述、引入、示例、API）。路由: /mobile/form/date-picker
 */

import { DatePicker } from "@dreamer/ui-preact/mobile";
import { CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";
import {
  DocsApiTable,
  type DocsApiTableRow,
} from "../../../components/DocsApiTable.tsx";
import { MobileDocDemo } from "../../../components/MobileDocDemo.tsx";

/**
 * 文档示例：当前本地日期的 YYYY-MM-DD。
 *
 * @returns 日期串
 */
function localTodayYmd(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const DATEPICKER_API: DocsApiTableRow[] = [
  {
    name: "mode",
    type: `"single" | "range" | "multiple"`,
    default: "single",
    description:
      "单日 / 区间 / 多日；range、multiple 时 onChange 的隐藏值为 JSON 串，详见桌面文档",
  },
  {
    name: "value",
    type: "MaybeSignal<DatePickerValue>",
    default: "-",
    description: "受控值，形态随 mode、format 变化",
  },
  {
    name: "min",
    type: "string",
    default: "-",
    description: "最小日 YYYY-MM-DD",
  },
  {
    name: "max",
    type: "string",
    default: "-",
    description: "最大日 YYYY-MM-DD",
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
    default: `"请选择日期"`,
    description: "无值占位",
  },
  {
    name: "format",
    type: "string",
    default: "YYYY-MM-DD",
    description: "展示与解析粒度（年/月/日组合），见桌面说明",
  },
  {
    name: "panelAttach",
    type: `"anchored" | "viewport"`,
    default: "anchored",
    description: "viewport：浮层 fixed 到视口并同步几何，避免被 overflow 裁切",
  },
  { name: "class", type: "string", default: "-", description: "根 class" },
  {
    name: "onChange",
    type: "(e: Event) => void",
    default: "-",
    description: "变更；target.value 为日期串或 JSON",
  },
  { name: "name", type: "string", default: "-", description: "隐藏域 name" },
  { name: "id", type: "string", default: "-", description: "根 id" },
];

const importCode = `import { DatePicker } from "@dreamer/ui-preact/mobile";
import { signal } from "@preact/signals";

const val = signal("2026-04-09");

<DatePicker value={val} class="w-full" />`;

/** 文档页受控值须模块级，与桌面 DatePicker 示例一致 */
const mobileDatePickerVal = signal(localTodayYmd());

export default function MobileDatePickerDoc() {
  return (
    <div class="w-full max-w-3xl space-y-10">
      <section>
        <Title level={1}>DatePicker 日期（移动）</Title>
        <Paragraph class="mt-2">
          与桌面共用实现：触发器 + 日历浮层 + 确定/取消，<strong>
            非
          </strong>浏览器原生{" "}
          <code class="text-sm">input[type=date]</code>。支持{" "}
          <code class="text-sm">mode</code>、<code class="text-sm">
            format
          </code>、
          <code class="text-sm">panelAttach</code>{" "}
          等；细节见桌面 DatePicker 文档。
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
          <Title level={3}>单日（Signal）</Title>
          <MobileDocDemo>
            <DatePicker value={mobileDatePickerVal} class="w-full" />
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
          与 <code class="text-sm">@dreamer/ui-preact</code>{" "}
          中 DatePicker 一致；从 mobile 导入便于与同页其他移动组件同入口。
        </Paragraph>
        <DocsApiTable rows={DATEPICKER_API} />
      </section>
    </div>
  );
}
