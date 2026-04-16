/**
 * Form、FormItem、FormList 等表单容器文档用 API 表数据。
 * 仅由 `form-containers.tsx` 引用；各独立表单控件文档请在各自页面内维护 API 表，勿从此文件 import。
 */

/** 文档站 API 表格行 */
export interface FormDocsApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** FormItem 表单项属性说明 */
export const FORM_ITEM_API: FormDocsApiRow[] = [
  {
    name: "label",
    type: "string",
    default: "-",
    description: "标签文案",
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: "必填；为 true 时标签旁默认显示红色 *",
  },
  {
    name: "hideRequiredMark",
    type: "boolean",
    default: "false",
    description:
      "为 true 时不显示红色 *，可与 required 同时为 true（子控件仍可 required、校验照旧）",
  },
  {
    name: "error",
    type: "string",
    default: "-",
    description: "错误文案；有值时表单项错误样式",
  },
  {
    name: "labelPosition",
    type: '"top" | "left"',
    default: "top",
    description: "标签在控件上方或左侧",
  },
  {
    name: "labelAlign",
    type: '"left" | "right"',
    default: "left",
    description: "仅 labelPosition=left 时：标签在列内左/右对齐",
  },
  {
    name: "id",
    type: "string",
    default: "-",
    description: "关联控件 id（label for）",
  },
  {
    name: "trailing",
    type: "unknown",
    default: "-",
    description: "与控件同一行、输入右侧（如 FormList 删除）；与输入同一水平线",
  },
  {
    name: "class",
    type: "string",
    default: "-",
    description: "容器额外 class",
  },
  {
    name: "children",
    type: "unknown",
    default: "-",
    description: "单个表单控件（如 Input）",
  },
];
