/**
 * ChartRadar 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/charts/radar
 */

import { ChartRadar, CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";

const sampleData = {
  labels: ["速度", "力量", "耐力", "技巧", "防守", "进攻"],
  datasets: [
    {
      label: "系列 A",
      data: [65, 59, 90, 81, 56, 55],
      borderColor: "rgb(102, 126, 234)",
      backgroundColor: "rgba(102, 126, 234, 0.2)",
      pointBackgroundColor: "rgb(102, 126, 234)",
    },
    {
      label: "系列 B",
      data: [28, 48, 40, 19, 96, 27],
      borderColor: "rgb(118, 75, 162)",
      backgroundColor: "rgba(118, 75, 162, 0.2)",
      pointBackgroundColor: "rgb(118, 75, 162)",
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: "top" as const } },
};

/** API 属性行类型 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const CHART_RADAR_API: ApiRow[] = [
  {
    name: "data",
    type: 'ChartData<"radar">',
    default: "-",
    description: "Chart.js 雷达图 data",
  },
  {
    name: "options",
    type: 'ChartOptions<"radar">',
    default: "{}",
    description: "Chart.js options",
  },
  { name: "class", type: "string", default: "-", description: "容器 class" },
  { name: "width", type: "number", default: "-", description: "画布宽度" },
  { name: "height", type: "number", default: "-", description: "画布高度" },
];

const importCode = `import { ChartRadar } from "@dreamer/ui-preact";

const data = { labels: ["速度", "力量", ...], datasets: [{ label: "系列 A", data: [65, 59, ...], borderColor: "...", backgroundColor: "..." }] };
<ChartRadar
  data={data}
  options={options}
  class="w-full h-64"
/>`;

const exampleBasic = `<ChartRadar
  data={sampleData}
  options={options}
  class="w-full h-64"
/>`;

export default function ChartsRadar() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>ChartRadar 雷达图</Title>
        <Paragraph class="mt-2">
          雷达图：data、options、class、width、height。基于
          Chart.js，多维度对比；data.labels 为维度名，datasets 含
          label、data、borderColor、backgroundColor、pointBackgroundColor。 使用
          Tailwind v4，支持 light/dark 主题。
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
          <Title level={3}>多系列</Title>
          <div class="w-full max-w-md h-64">
            <ChartRadar
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
              {CHART_RADAR_API.map((row) => (
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
