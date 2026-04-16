/**
 * Cascader 组件文档页（桌面）
 * 路由: /desktop/form/cascader
 */

import {
  Cascader,
  CodeBlock,
  Form,
  FormItem,
  Paragraph,
  Title,
} from "@dreamer/ui-preact";
import type { CascaderOption } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

/** 与文档 API 表行结构一致 */
interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** 与 CascaderProps 对齐的 API 说明 */
const CASCADER_API: ApiRow[] = [
  {
    name: "options",
    type: "CascaderOption[]",
    default: "-",
    description:
      "必填。根级选项列表；静态模式下可嵌套任意深度的 children。动态模式下通常只放根节点，子级由 loadChildren 填充",
  },
  {
    name: "value",
    type: "string[] | (() => string[]) | Signal<string[]>",
    default: "[]",
    description:
      "选中路径（每段为该层节点的 value）。上列三种写法与 Input、Select 等表单组件相同；在类型系统里合称 `MaybeSignal<string[]>`。勿写 `value={val.value}`。设 `name` 时按路径段输出同名隐藏域参与提交。",
  },
  {
    name: "onChange",
    type: "(value: string[]) => void",
    default: "-",
    description:
      "可选。`value` 为 Signal 时组件已自动回写，可不传；需副作用或 getter/字面量受控时再传。参数为新的 string[]；点首行占位可清空为 []",
  },
  {
    name: "loadChildren",
    type: "(path: string[]) => Promise<CascaderOption[]>",
    default: "-",
    description:
      '动态加载：path 为**父节点**在树中的路径（根下列不传 []，从第一层父节点起如 ["省value"]）。返回的子项写入内部缓存并参与展示；不会自动调用 path 为 []',
  },
  {
    name: "onLoadError",
    type: "(path: string[], error: unknown) => void",
    default: "-",
    description:
      "loadChildren 抛错时调用；组件会把该 path 缓存为空数组，该列表现为无下级",
  },
  {
    name: "placeholder",
    type: "string",
    default: '"请选择"',
    description: "未选时触发条文案；浮层第一列首行同文案，点击可清空为 []",
  },
  {
    name: "size",
    type: "SizeVariant",
    default: "md",
    description: "尺寸：xs、sm、md、lg，与 Input / Select 一致",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "为 true 时不可展开、不可选",
  },
  {
    name: "hideFocusRing",
    type: "boolean",
    default: "false",
    description: "为 true 时隐藏触发条聚焦蓝色 ring",
  },
  {
    name: "name",
    type: "string",
    default: "-",
    description:
      '表单提交：按路径段渲染多个同名 type="hidden" 的 input，每段 value 一个字段（与传统多级 name 数组类似，具体收参取决于后端约定）',
  },
  {
    name: "id",
    type: "string",
    default: "-",
    description: "触发按钮 id，便于 label[for] 关联",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "根容器额外 class，常用 w-full",
  },
];

/** 三级示例：省 → 市 → 区（组件支持任意深度，浮层多列横向滚动） */
const OPTIONS = [
  {
    value: "zhejiang",
    label: "浙江",
    children: [
      {
        value: "hangzhou",
        label: "杭州",
        children: [
          { value: "xihu", label: "西湖区" },
          { value: "binjiang", label: "滨江区" },
        ],
      },
      {
        value: "ningbo",
        label: "宁波",
        children: [
          { value: "haishu", label: "海曙区" },
          { value: "jiangbei", label: "江北区" },
        ],
      },
    ],
  },
  {
    value: "jiangsu",
    label: "江苏",
    children: [
      {
        value: "nanjing",
        label: "南京",
        children: [
          { value: "xuanwu", label: "玄武区" },
          { value: "qinhuai", label: "秦淮区" },
        ],
      },
      { value: "suzhou", label: "苏州" },
    ],
  },
];

const importCode =
  `import { Cascader, Form, FormItem } from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

const val = signal<string[]>([]);

<FormItem label="省 / 市 / 区">
  <Cascader options={options} value={val} class="w-full" />
</FormItem>`;

/** 仅根节点；子级由 loadChildren 按需返回（演示异步） */
const LAZY_ROOT = [
  { value: "zhejiang", label: "浙江" },
  /** 无下级且不再请求 */
  { value: "jiangsu", label: "江苏", isLeaf: true },
];

/**
 * 根据已选路径返回下一级选项（演示：短延迟模拟接口）。
 *
 * @param path - 当前父节点路径，如 `["zhejiang"]` 表示加载浙江下的市
 */
async function demoLoadChildren(path: string[]): Promise<CascaderOption[]> {
  await new Promise((r) => setTimeout(r, 350));
  if (path.length === 1 && path[0] === "zhejiang") {
    return [
      { value: "hangzhou", label: "杭州" },
      { value: "ningbo", label: "宁波" },
    ];
  }
  /** 浙江下任意市都应对应返回区列表；漏写某一市会导致返回 [] 被当成叶子，第三列不出现 */
  if (path.length === 2 && path[0] === "zhejiang") {
    if (path[1] === "hangzhou") {
      return [
        { value: "xihu", label: "西湖区" },
        { value: "binjiang", label: "滨江区" },
      ];
    }
    if (path[1] === "ningbo") {
      return [
        { value: "haishu", label: "海曙区" },
        { value: "jiangbei", label: "江北区" },
      ];
    }
  }
  return [];
}

/**
 * 二级静态示例：根数组即**第一列**（此处为市），每项可带 `children` 作为**下一列**（区）。
 * 与 {@link OPTIONS} 的三级省→市→区 写法相同，只是少了一层省；`children` 可继续嵌套任意深度。
 */
const OPTIONS_CITY_DISTRICT: CascaderOption[] = [
  {
    value: "hangzhou",
    label: "杭州",
    children: [
      { value: "xihu", label: "西湖区" },
      { value: "binjiang", label: "滨江区" },
    ],
  },
  {
    value: "ningbo",
    label: "宁波",
    children: [
      { value: "haishu", label: "海曙区" },
      { value: "jiangbei", label: "江北区" },
    ],
  },
];

export default function FormCascaderDoc() {
  const val = signal<string[]>([]);
  /** 二级静态示例（市 / 区）受控值 */
  const valCityDistrict = signal<string[]>([]);
  const lazyVal = signal<string[]>([]);
  /** 仅用于演示带 name 的表单值 */
  const nameDemoVal = signal<string[]>(["zhejiang", "hangzhou", "xihu"]);

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>Cascader 级联选择</Title>
        <Paragraph class="mt-2 leading-relaxed">
          <strong>适用场景：</strong>
          需要按层级<strong>
            顺序选择一条路径
          </strong>（如省→市→区、类目一级→二级），且提交或状态中希望拿到{" "}
          <code class="text-xs">string[]</code> 形式的各级 value。组件用<strong>
            多列浮层
          </strong>从左到右展开下一级，根列表始终来自{" "}
          <code class="text-xs">options</code>。
        </Paragraph>
        <Paragraph class="mt-3 leading-relaxed">
          <strong>与 TreeSelect 的区别：</strong>
          TreeSelect 在树里<strong>单选一个节点</strong>，对外{" "}
          <code class="text-xs">value</code> 为单个{" "}
          <code class="text-xs">string</code>；Cascader 强调<strong>
            整条路径
          </strong>， <code class="text-xs">value</code> 为{" "}
          <code class="text-xs">string[]</code>。若只需一个叶子 id
          且数据是树形，可优先考虑
          TreeSelect；若要省、市、区分别对应数组下标或分段提交，用 Cascader。
        </Paragraph>
        <Paragraph class="mt-3 leading-relaxed">
          <strong>展示与交互：</strong>
          自绘触发条 + 多列下拉（非原生{" "}
          <code class="text-xs">{"<select>"}</code>
          ）；列数随已选深度变化，超出宽度可横向滚动。已选路径在触发条上以{" "}
          <code class="text-xs">label</code>{" "}
          用「 / 」连接展示。点击浮层外区域、再次点击触发条、或 Esc（与 Select /
          TreeSelect
          共用布局上的关闭约定）可关闭浮层；展开时**不**使用全屏遮罩，以免挡住页面滚动。
        </Paragraph>
        <Paragraph class="mt-3 leading-relaxed">
          <strong>选中与清空：</strong>
          点中间层会更新路径并可能继续展示下一列；点<strong>
            叶子
          </strong>（无下级）后浮层关闭。第一列顶部的占位行与{" "}
          <code class="text-xs">placeholder</code> 文案一致，点击可将值置为{" "}
          <code class="text-xs">[]</code> 并关闭。
        </Paragraph>
        <Paragraph class="mt-3 leading-relaxed">
          <strong>View 受控写法：</strong>
          可写 <code class="text-xs">{"value={val}"}</code>（
          <code class="text-xs">signal</code> 返回值）或{" "}
          <code class="text-xs">{"value={val}"}</code>
          ；勿写 <code class="text-xs">{"value={val.value}"}</code>
          。文档正文里用 <code class="text-xs">{"<code>"}</code>{" "}
          展示时仍须字符串字面量，勿写{" "}
          <code class="text-xs">{"{val.value}"}</code>{" "}
          等可执行表达式，以免误订阅、整页闪动。
        </Paragraph>
      </section>

      <section class="space-y-3">
        <Title level={2}>数据结构 CascaderOption</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          每项含{" "}
          <code class="text-xs">value</code>（该层唯一标识，会进入路径数组）、
          <code class="text-xs">label</code>（展示名）。静态树用可选的{" "}
          <code class="text-xs">children</code>{" "}
          嵌套下一级。开启动态加载时，未加载的节点可不写{" "}
          <code class="text-xs">children</code>；若确定无下级，请设{" "}
          <code class="text-xs">isLeaf: true</code>，避免继续请求。
        </Paragraph>
        <CodeBlock
          title="类型示意"
          code={`export interface CascaderOption {
  value: string;
  label: string;
  children?: CascaderOption[];
  /** 与 loadChildren 联用：true 表示无下级、不再请求 */
  isLeaf?: boolean;
}`}
          language="tsx"
          showLineNumbers
          copyable
          wrapLongLines
        />
      </section>

      <section class="space-y-3">
        <Title level={2}>引入</Title>
        <CodeBlock
          title="代码示例"
          code={importCode}
          language="tsx"
          showLineNumbers
          copyable
          wrapLongLines
        />
      </section>

      <section class="space-y-8">
        <Title level={2}>示例</Title>
        <Paragraph class="text-sm text-slate-500 dark:text-slate-400">
          各小节<strong>先可交互示例、后附代码</strong>。Cascader 浮层在根内
          {" "}
          <code class="text-xs">absolute</code>、z-index
          较高；若展开后第二列被下方内容遮挡，可稍滚动页面或先收起再查看代码。
        </Paragraph>

        <section class="space-y-4">
          <Title level={3}>静态数据（多级嵌套）</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            <strong>数据结构：</strong>
            <code class="text-xs">options</code> 是根级{" "}
            <code class="text-xs">CascaderOption[]</code>，对应浮层<strong>
              最左一列
            </strong>；每一项为{" "}
            <code class="text-xs">{"{ value, label, children? }"}</code>，其中
            {" "}
            <code class="text-xs">children</code>{" "}
            可选，有则再嵌一层同结构数组，即下一列数据源。叶子节点不写{" "}
            <code class="text-xs">children</code>{" "}
            即可（如江苏「苏州」）。数据可一次写死在静态树里，也可用{" "}
            <code class="text-xs">loadChildren</code> 按需加载（见下文示例）。
            <strong>层数不用配置：</strong>嵌套几层{" "}
            <code class="text-xs">
              children
            </code>
            ，展开后就会逐级多出一列，直到叶子。
          </Paragraph>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            下列为省 → 市 → 区 三级；苏州示例为无{" "}
            <code class="text-xs">children</code> 的叶子市。
          </Paragraph>
          <Form layout="vertical" class="w-full max-w-lg">
            <FormItem label="省 / 市 / 区">
              <Cascader options={OPTIONS} value={val} class="w-full" />
            </FormItem>
          </Form>
          <CodeBlock
            title="代码示例"
            code={`<Cascader
  options={OPTIONS}
  value={val}
  class="w-full"
/>`}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </section>

        <section class="space-y-4">
          <Title level={3}>静态数据（二级：市 / 区）</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            只有两层时，根数组就是「市」列表，市的{" "}
            <code class="text-xs">children</code> 为「区」列表；选中路径形如
            {" "}
            <code class="text-xs">["hangzhou","xihu"]</code>。
          </Paragraph>
          <Form layout="vertical" class="w-full max-w-lg">
            <FormItem label="市 / 区">
              <Cascader
                options={OPTIONS_CITY_DISTRICT}
                value={valCityDistrict}
                class="w-full"
              />
            </FormItem>
          </Form>
          <CodeBlock
            title="数据与用法"
            code={`const OPTIONS_CITY_DISTRICT: CascaderOption[] = [
  {
    value: "hangzhou",
    label: "杭州",
    children: [
      { value: "xihu", label: "西湖区" },
      { value: "binjiang", label: "滨江区" },
    ],
  },
  {
    value: "ningbo",
    label: "宁波",
    children: [
      { value: "haishu", label: "海曙区" },
      { value: "jiangbei", label: "江北区" },
    ],
  },
];

<Cascader
  options={OPTIONS_CITY_DISTRICT}
  value={valCityDistrict}
  class="w-full"
/>`}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </section>

        <section class="space-y-4">
          <Title level={3}>表单 name（多段隐藏域）</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            设置 <code class="text-xs">name</code>{" "}
            后，会按当前路径为每一段渲染一个同名{" "}
            <code class="text-xs">{'<input type="hidden" />'}
            </code>，便于传统表单
            POST；后端如何解析多个同名字段请与接口约定一致。
          </Paragraph>
          <Form layout="vertical" class="w-full max-w-lg">
            <FormItem label="带 name 的级联（示例已预选）">
              <Cascader
                options={OPTIONS}
                name="region"
                value={nameDemoVal}
                class="w-full"
              />
            </FormItem>
          </Form>
          <CodeBlock
            title="代码示例"
            code={`<Cascader
  options={OPTIONS}
  name="region"
  value={nameDemoVal}
  class="w-full"
/>`}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </section>

        <section class="space-y-4">
          <Title level={3}>动态加载（loadChildren）</Title>
          <Paragraph class="leading-relaxed text-sm text-slate-600 dark:text-slate-400">
            根列表仍来自 <code class="text-xs">options</code>。某节点未写{" "}
            <code class="text-xs">children</code> 且未标记{" "}
            <code class="text-xs">isLeaf</code>{" "}
            时，展开到会经过该节点的一列后，会调用{" "}
            <code class="text-xs">
              loadChildren(该节点的路径)
            </code>，结果缓存在组件内并与静态数据合并解析路径（中间级只出现在缓存里也能继续加载更深层）。
          </Paragraph>
          <Paragraph class="leading-relaxed text-sm text-slate-600 dark:text-slate-400">
            <strong>回调约定：</strong>
            对你在上一级里<strong>
              展示过的每一个可选父节点
            </strong>，若用户可能点选它，则应对应返回其子列表；若某父节点返回空数组
            {" "}
            <code class="text-xs">[]</code>，会被视为<strong>
              叶子
            </strong>，不再出现下一列。请求失败可走{" "}
            <code class="text-xs">onLoadError</code>，组件同样会按无下级处理。
          </Paragraph>
          <Paragraph class="leading-relaxed text-sm text-slate-600 dark:text-slate-400">
            若需刷新后仍保留已加载树，可在{" "}
            <code class="text-xs">loadChildren</code>{" "}
            内请求成功后把子节点合并进自己的{" "}
            <code class="text-xs">options</code>{" "}
            状态；组件会优先使用 props 上已挂载的{" "}
            <code class="text-xs">children</code>。
          </Paragraph>
          <Form layout="vertical" class="w-full max-w-lg">
            <FormItem label="省 / 市 / 区（异步）">
              <Cascader
                options={LAZY_ROOT}
                value={lazyVal}
                loadChildren={demoLoadChildren}
                class="w-full"
              />
            </FormItem>
          </Form>
          <CodeBlock
            title="loadChildren 示例"
            code={`const LAZY_ROOT = [
  { value: "zhejiang", label: "浙江" },
  { value: "jiangsu", label: "江苏", isLeaf: true },
];

<Cascader
  options={LAZY_ROOT}
  value={lazyVal}
  loadChildren={async (path) => {
    if (path.length === 1 && path[0] === "zhejiang") {
      return [
        { value: "hangzhou", label: "杭州" },
        { value: "ningbo", label: "宁波" },
      ];
    }
    if (path.length === 2 && path[0] === "zhejiang") {
      if (path[1] === "hangzhou") {
        return [
          { value: "xihu", label: "西湖区" },
          { value: "binjiang", label: "滨江区" },
        ];
      }
      if (path[1] === "ningbo") {
        return [
          { value: "haishu", label: "海曙区" },
          { value: "jiangbei", label: "江北区" },
        ];
      }
    }
    return [];
  }}
  class="w-full"
/>`}
            language="tsx"
            showLineNumbers
            copyable
            wrapLongLines
          />
        </section>
      </section>

      <section class="space-y-3">
        <Title level={2}>API</Title>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          除 <code class="text-xs">options</code> 必填外，其余属性均为可选；
          {" "}
          <code class="text-xs">SizeVariant</code> 与全局表单组件一致。
        </Paragraph>
        <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
          <strong>MaybeSignal&lt;T&gt;</strong>：受控值可以是{" "}
          <code class="text-xs">T</code> 字面快照、零参函数{" "}
          <code class="text-xs">{"() => T"}</code>，或{" "}
          <code class="text-xs">signal</code> 的返回值（可调用{" "}
          <code class="text-xs">Signal&lt;T&gt;</code>）。类型定义在源码{" "}
          <code class="text-xs">ui-view/src/shared/form/maybe-signal.ts</code>
          ，并由 <code class="text-xs">@dreamer/ui-preact</code> 再导出，可{" "}
          <code class="text-xs">
            {'import type { MaybeSignal } from "@dreamer/ui-preact"'}
          </code>
          。
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
              {CASCADER_API.map((row) => (
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
