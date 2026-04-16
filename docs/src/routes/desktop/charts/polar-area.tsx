/**
 * ChartPolarArea 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/charts/polar-area
 */

import {
  ChartPolarArea,
  CodeBlock,
  Paragraph,
  Title,
} from "@dreamer/ui-preact";

const sampleData = {
  labels: ["红", "绿", "蓝", "黄", "紫"],
  datasets: [{
    data: [11, 16, 7, 14, 9],
    backgroundColor: [
      "rgba(102, 126, 234, 0.6)",
      "rgba(118, 75, 162, 0.6)",
      "rgba(79, 172, 254, 0.6)",
      "rgba(67, 233, 123, 0.6)",
      "rgba(250, 112, 154, 0.6)",
    ],
    borderWidth: 1,
  }],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: "right" as const } },
};

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const CHART_POLAR_API: ApiRow[] = [
  {
    name: "data",
    type: 'ChartData<"polarArea">',
    default: "-",
    description: "Chart.js 极区图 data",
  },
  {
    name: "options",
    type: 'ChartOptions<"polarArea">',
    default: "{}",
    description: "Chart.js options",
  },
  { name: "class", type: "string", default: "-", description: "容器 class" },
  { name: "width", type: "number", default: "-", description: "画布宽度" },
  { name: "height", type: "number", default: "-", description: "画布高度" },
];

const importCode = `import { ChartPolarArea } from "@dreamer/ui-preact";

const data = { labels: ["红", "绿", ...], datasets: [{ data: [11, 16, ...], backgroundColor: [...] }] };
<ChartPolarArea
  data={data}
  options={options}
  class="w-full h-64"
/>`;

const exampleBasic = `<ChartPolarArea
  data={sampleData}
  options={options}
  class="w-full h-64"
/>`;

export default function ChartsPolarArea() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>ChartPolarArea 极区图</Title>
        <Paragraph class="mt-2">
          极区图：data、options、class、width、height。基于
          Chart.js，极坐标下的扇形面积；data 结构类似饼图，datasets[].data
          对应各扇区数值。 使用 Tailwind v4，支持 light/dark 主题。
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
          <div class="w-full max-w-md h-64">
            <ChartPolarArea
              data={sampleData}
              options={options}
              class="w-full h-64"
            />
          </div>
          <CodeBlock
            title="代码示例"
            code={exampleBasic}
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
              {CHART_POLAR_API.map((row) => (
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
