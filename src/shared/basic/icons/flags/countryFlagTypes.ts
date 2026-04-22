/**
 * 各独立国旗组件（`IconFlagCN` 等，`IconFlag`+ISO 两字母大写）的 props，与 `FlagImg` 一致，无 `code` 字段。
 */
import type { IconComponentProps } from "../../Icon.tsx";

/**
 * 独立国旗图标的 props：尺寸、class、可选 `img` 描述（无障碍）。
 */
export type CountryFlagComponentProps = IconComponentProps & {
  /**
   * 有值时作 `<img alt>` 与 `title`；在纯装饰场景（如菜单+可见文案）可缺省
   */
  title?: string;
};
