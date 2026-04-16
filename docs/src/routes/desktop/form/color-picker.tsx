/**
 * ColorPicker 组件文档页
 * 路由: /desktop/form/color-picker
 */

import {
  CodeBlock,
  ColorPicker,
  Form,
  FormItem,
  Paragraph,
  Title,
} from "@dreamer/ui-preact";
import { signal } from "@preact/signals";

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const COLOR_PICKER_API: ApiRow[] = [
  {
    name: "value",
    type: "string | (() => string) | Signal<string>",
    default: "#000000",
    description:
      "当前颜色（如 #rrggbb）。与全库表单一致为 MaybeSignal：字面量、`() => T`、`createSignal` 返回值；勿直接绑 `sig.value`（快照失步或误订阅）。",
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
    name: "showSuffixIcon",
    type: "boolean",
    default: "true",
    description:
      '是否在右侧显示调色板图标（IconPalette，与 DatePicker 右侧日历提示类似）；图标 pointer-events-none，点击触发器仍打开自绘取色面板；`variant="swatch"` 时不生效',
  },
  {
    name: "variant",
    type: '"default" | "swatch"',
    default: '"default"',
    description:
      "`swatch` 时只显示可点击色块（约 40×40），点击打开面板；外层为 `inline-block`，可用 `class` 再调尺寸",
  },
  {
    name: "showToolbar",
    type: "boolean",
    default: "false",
    description:
      "为 true 时面板顶部显示屏幕取色、圆形预览与「拖动方格…」说明；默认 false 不显示",
  },
  {
    name: "onChange",
    type: "(e: Event) => void",
    default: "-",
    description:
      "在隐藏 input 上派发 `change`；**确定**时与 `input` 成对派发最终色；**取消 / 点外部 / Esc** 恢复打开前颜色时也会派发",
  },
  {
    name: "onInput",
    type: "(e: Event) => void",
    default: "-",
    description:
      "在隐藏 input 上派发 `input`；打开面板期间每次调色会触发；**确定**时再派发一次与 `change` 收尾。受控时建议 `onInput`/`onChange` 都更新 `value`",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "额外 class（作用于外层容器）",
  },
  { name: "name", type: "string", default: "-", description: "原生 name" },
  { name: "id", type: "string", default: "-", description: "原生 id" },
];

/**
 * 生成 `onInput` / `onChange` 用的处理器：从事件目标读取 hex 并写入给定 setter（示例页内复用）。
 *
 * @param set - 更新受控颜色的回调
 */
function bindColorInput(
  set: (v: string) => void,
): (e: Event) => void {
  return (e: Event) => {
    set((e.target as HTMLInputElement).value);
  };
}

export default function FormColorPickerDoc() {
  const defaultHex = signal("#3b82f6");
  const swatchHex = signal("#10b981");
  const toolbarHex = signal("#f59e0b");
  const noSuffixHex = signal("#8b5cf6");
  const narrowHex = signal("#ec4899");
  const disabledHex = signal("#64748b");
  const comboHex = signal("#6366f1");
  const hideRingHex = signal("#0ea5e9");

  return (
    <div class="space-y-10">
      <section>
        <Title level={1}>ColorPicker 颜色选择</Title>
        <Paragraph class="mt-2">
          自绘饱和度/明度、色相条与 RGB/HEX 输入；弹层在组件根{" "}
          <code class="text-xs">relative</code> 内{" "}
          <code class="text-xs">absolute left-0 top-full mt-1</code>，与
          DatePicker 相同，随页面滚动跟移。受控时请传{" "}
          <code class="text-xs">signal</code> 返回值本身，如{" "}
          <code class="text-xs">{"value={hex}"}</code>；勿写{" "}
          <code class="text-xs">{"value={hex.value}"}</code>
          （仅为求值瞬间的快照，无法被组件写回且易失步）。亦可用{" "}
          <code class="text-xs">{"value={() => hex.value}"}</code>。属性{" "}
          <code class="text-xs">value</code> 为 #rrggbb，隐藏{" "}
          <code class="text-xs">input</code> 随调色更新。右侧默认展示{" "}
          <code class="text-xs">IconPalette</code>；不需要时可传{" "}
          <code class="text-xs">{"showSuffixIcon={false}"}
          </code>。面板内调色会通过 <code class="text-xs">onInput</code>{" "}
          持续同步；「确定」仅关面板；「取消」或点外部 / Esc
          会恢复打开前颜色并派发 <code class="text-xs">input</code>/
          <code class="text-xs">
            change
          </code>。「确定」会再派发一次最终色并关面板，避免只绑{" "}
          <code class="text-xs">onChange</code> 时关面板后颜色被冲回。传{" "}
          <code class="text-xs">variant="swatch"</code>{" "}
          可只显示色块触发。面板顶部的取色按钮、圆环预览与说明文案由{" "}
          <code class="text-xs">showToolbar</code> 控制，默认关闭。
        </Paragraph>
      </section>

      <section class="space-y-3">
        <Title level={2}>引入</Title>
        <CodeBlock
          title="最小用法"
          code={`import { ColorPicker } from "@dreamer/ui-preact";

const hex = signal("#3b82f6");

<ColorPicker
  value={hex}
/>`}
          language="tsx"
          showLineNumbers
          wrapLongLines
        />
      </section>

      <section class="space-y-8">
        <Title level={2}>示例</Title>

        <div class="space-y-4">
          <Title level={3}>默认（色块 + HEX + 右侧图标）</Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            <code class="text-xs">variant</code> 默认为{" "}
            <code class="text-xs">default</code>，占满父级宽度（可用{" "}
            <code class="text-xs">class</code> 覆盖）。
          </Paragraph>
          <Form layout="vertical" class="w-full max-w-xs">
            <FormItem label="主题色">
              <ColorPicker
                value={defaultHex}
                onInput={bindColorInput((v) => {
                  defaultHex.value = v;
                })}
                onChange={bindColorInput((v) => {
                  defaultHex.value = v;
                })}
              />
            </FormItem>
          </Form>
          <CodeBlock
            title="代码"
            code={`<ColorPicker
  value={hex}
/>`}
            language="tsx"
            showLineNumbers
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>
            <code class="text-base">variant="swatch"</code> 仅色块触发
          </Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            约 40×40 色块，外层 <code class="text-xs">inline-block</code>。
          </Paragraph>
          <Form layout="vertical" class="w-full max-w-xs">
            <FormItem label="仅色块">
              <ColorPicker
                variant="swatch"
                value={swatchHex}
                onInput={bindColorInput((v) => {
                  swatchHex.value = v;
                })}
                onChange={bindColorInput((v) => {
                  swatchHex.value = v;
                })}
              />
            </FormItem>
          </Form>
          <CodeBlock
            title="代码"
            code={`<ColorPicker
  variant="swatch"
  value={hex}
/>`}
            language="tsx"
            showLineNumbers
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>
            <code class="text-base">showToolbar</code> 面板顶栏
          </Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            显示屏幕取色、圆形预览与「拖动方格与色相条选择颜色」说明。
          </Paragraph>
          <Form layout="vertical" class="w-full max-w-xs">
            <FormItem label="带顶栏">
              <ColorPicker
                showToolbar
                value={toolbarHex}
                onInput={bindColorInput((v) => {
                  toolbarHex.value = v;
                })}
                onChange={bindColorInput((v) => {
                  toolbarHex.value = v;
                })}
              />
            </FormItem>
          </Form>
          <CodeBlock
            title="代码"
            code={`<ColorPicker
  showToolbar
  value={hex}
/>`}
            language="tsx"
            showLineNumbers
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>
            <code class="text-base">showSuffixIcon={false}</code>{" "}
            隐藏右侧调色板图标
          </Title>
          <Form layout="vertical" class="w-full max-w-xs">
            <FormItem label="无后缀图标">
              <ColorPicker
                showSuffixIcon={false}
                value={noSuffixHex}
                onInput={bindColorInput((v) => {
                  noSuffixHex.value = v;
                })}
                onChange={bindColorInput((v) => {
                  noSuffixHex.value = v;
                })}
              />
            </FormItem>
          </Form>
          <CodeBlock
            title="代码"
            code={`<ColorPicker
  showSuffixIcon={false}
  value={hex}
/>`}
            language="tsx"
            showLineNumbers
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>
            <code class="text-base">class</code> 控制宽度
          </Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            默认含 <code class="text-xs">w-full</code>，传入{" "}
            <code class="text-xs">max-w-*</code> /{" "}
            <code class="text-xs">w-*</code> 可收窄触发条。
          </Paragraph>
          <Form layout="vertical" class="w-full max-w-xs">
            <FormItem label="最大宽度 200px">
              <ColorPicker
                class="max-w-[200px]"
                value={narrowHex}
                onInput={bindColorInput((v) => {
                  narrowHex.value = v;
                })}
                onChange={bindColorInput((v) => {
                  narrowHex.value = v;
                })}
              />
            </FormItem>
          </Form>
          <CodeBlock
            title="代码"
            code={`<ColorPicker
  class="max-w-[200px]"
  value={hex}
/>`}
            language="tsx"
            showLineNumbers
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>
            <code class="text-base">disabled</code>
          </Title>
          <Form layout="vertical" class="w-full max-w-xs">
            <FormItem label="禁用">
              <ColorPicker
                disabled
                value={disabledHex}
                onInput={bindColorInput((v) => {
                  disabledHex.value = v;
                })}
                onChange={bindColorInput((v) => {
                  disabledHex.value = v;
                })}
              />
            </FormItem>
          </Form>
          <CodeBlock
            title="代码"
            code={`<ColorPicker
  disabled
  value={hex}
/>`}
            language="tsx"
            showLineNumbers
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>
            <code class="text-base">hideFocusRing</code> 无聚焦蓝环
          </Title>
          <Form layout="vertical" class="w-full max-w-xs">
            <FormItem label="隐藏 focus ring">
              <ColorPicker
                hideFocusRing
                value={hideRingHex}
                onInput={bindColorInput((v) => {
                  hideRingHex.value = v;
                })}
                onChange={bindColorInput((v) => {
                  hideRingHex.value = v;
                })}
              />
            </FormItem>
          </Form>
          <CodeBlock
            title="代码"
            code={`<ColorPicker
  hideFocusRing
  value={hex}
/>`}
            language="tsx"
            showLineNumbers
            wrapLongLines
          />
        </div>

        <div class="space-y-4">
          <Title level={3}>
            组合：<code class="text-base">swatch</code> +{" "}
            <code class="text-base">showToolbar</code>
          </Title>
          <Paragraph class="text-sm text-slate-600 dark:text-slate-400">
            小触发器打开后仍可在面板内使用顶栏取色与说明。
          </Paragraph>
          <Form layout="vertical" class="w-full max-w-xs">
            <FormItem label="色块 + 顶栏">
              <ColorPicker
                variant="swatch"
                showToolbar
                value={comboHex}
                onInput={bindColorInput((v) => {
                  comboHex.value = v;
                })}
                onChange={bindColorInput((v) => {
                  comboHex.value = v;
                })}
              />
            </FormItem>
          </Form>
          <CodeBlock
            title="代码"
            code={`<ColorPicker
  variant="swatch"
  showToolbar
  value={hex}
/>`}
            language="tsx"
            showLineNumbers
            wrapLongLines
          />
        </div>
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
              {COLOR_PICKER_API.map((row) => (
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
