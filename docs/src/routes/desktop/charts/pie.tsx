/**
 * ChartPie 组件文档页（标准文档结构：概述、引入、示例、API）
 * 路由: /desktop/charts/pie
 */

import { ChartPie, CodeBlock, Paragraph, Title } from "@dreamer/ui-preact";

const sampleData = {
  labels: ["A", "B", "C", "D", "E"],
  datasets: [{
    data: [30, 25, 20, 15, 10],
    backgroundColor: ["#667eea", "#764ba2", "#4facfe", "#43e97b", "#fa709a"],
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

const CHART_PIE_API: ApiRow[] = [
  {
    name: "data",
    type: 'ChartData<"pie">',
    default: "-",
    description: "Chart.js 饼图 data",
  },
  {
    name: "options",
    type: 'ChartOptions<"pie">',
    default: "{}",
    description: "Chart.js options",
  },
  { name: "class", type: "string", default: "-", description: "容器 class" },
  { name: "width", type: "number", default: "-", description: "画布宽度" },
  { name: "height", type: "number", default: "-", description: "画布高度" },
];

const importCode = `import { ChartPie } from "@dreamer/ui-preact";

const data = { labels: ["A", "B", ...], datasets: [{ data: [30, 25, ...], backgroundColor: [...] }] };
<ChartPie
  data={data}
  options={options}
  class="w-full h-64"
/>`;

const exampleBasic = `<ChartPie
  data={sampleData}
  options={options}
  class="w-full h-64"
/>`;

export default function ChartsPie() {
  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>ChartPie 饼图</Title>
        <Paragraph class="mt-2">
          饼图：data、options、class、width、height。基于
          Chart.js，用于占比、构成展示；data.labels、data.datasets[].data、backgroundColor、borderWidth；options.plugins.legend
          控制图例位置。 使用 Tailwind v4，支持 light/dark 主题。
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
            <ChartPie data={sampleData} options={options} class="w-full h-64" />
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
              {CHART_PIE_API.map((row) => (
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
