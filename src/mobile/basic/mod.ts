/**
 * @module @dreamer/ui-preact/mobile/basic
 * @description
 * **JSR**：`import … from "@dreamer/ui-preact/mobile/basic"`。移动端引用的**基础**组件集合，与桌面 `basic` 同源 re-export（Button、Icon、Typography 等）。
 *
 * @see {@link ../../desktop/basic/mod.ts} 桌面同分类入口（符号一致）
 */
export { Button, ButtonGroup } from "./Button.tsx";
export type { ButtonGroupProps, ButtonProps } from "./Button.tsx";
export { Link } from "./Link.tsx";
export type { LinkProps } from "./Link.tsx";
export { Icon } from "./Icon.tsx";
export type { IconComponentProps, IconProps } from "./Icon.tsx";
export * from "./icons/mod.ts";
export { Paragraph, Text, Title } from "./Typography.tsx";
export type { ParagraphProps, TextProps, TitleProps } from "./Typography.tsx";
export { Badge } from "./Badge.tsx";
export type { BadgeProps } from "./Badge.tsx";
export { Avatar } from "./Avatar.tsx";
export type { AvatarProps, AvatarSize } from "./Avatar.tsx";
export { Skeleton } from "./Skeleton.tsx";
export type { SkeletonProps } from "./Skeleton.tsx";
export { Spinner } from "./Spinner.tsx";
export type { SpinnerProps } from "./Spinner.tsx";
