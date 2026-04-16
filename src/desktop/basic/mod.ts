/**
 * @module @dreamer/ui-preact/basic
 * @description
 * **JSR**：`import … from "@dreamer/ui-preact/basic"`。桌面端**基础**组件：按钮、链接、图标容器、排版、徽标、头像、骨架屏、加载动画。
 *
 * **主要符号**：`Button`、`ButtonGroup`、`Link`、`Icon`、`Title` / `Text` / `Paragraph`、`Badge`、`Avatar`、`Skeleton`、`Spinner`；图标全集见 `./icons/` 单文件导出（`Icon*`）。
 * **类型**：各 `*Props`、`IconComponentProps` 等与组件同路径导出。
 *
 * 实现位于本目录；详细参数与返回值说明见各 `export function` 的 JSDoc。
 *
 * @see {@link ../../mod.ts} 包根入口
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
