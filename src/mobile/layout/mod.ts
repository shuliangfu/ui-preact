/**
 * @module @dreamer/ui-preact/mobile/layout
 * @description
 * **JSR**：`import … from "@dreamer/ui-preact/mobile/layout"`。移动端**布局**（Container、Grid、Tabs、Accordion 等与桌面同源 re-export）。
 *
 * `Tabs` / `Accordion` 内部非受控状态使用 `createSignal`；其余多为纯布局 props。
 */

export { Container } from "./Container.tsx";
export type { ContainerProps, ContainerSize } from "./Container.tsx";

export { Divider } from "./Divider.tsx";
export type { DividerOrientation, DividerProps } from "./Divider.tsx";

export { Stack } from "./Stack.tsx";
export type {
  StackAlign,
  StackDirection,
  StackJustify,
  StackProps,
} from "./Stack.tsx";

export { Grid, GridItem } from "./Grid.tsx";
export type { GridItemProps, GridProps } from "./Grid.tsx";

export { Hero } from "./Hero.tsx";
export type { HeroLayout, HeroProps } from "./Hero.tsx";

export { Tabs } from "./Tabs.tsx";
export type { TabItem, TabsProps, TabsType } from "./Tabs.tsx";

export { Accordion } from "./Accordion.tsx";
export type { AccordionItem, AccordionProps } from "./Accordion.tsx";
