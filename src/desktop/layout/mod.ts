/**
 * @module @dreamer/ui-preact/layout
 * @description
 * **JSR**：`import … from "@dreamer/ui-preact/layout"`。**布局与容器**：`Container`、`Hero`、`Grid`/`GridItem`、`Stack`、`Divider`、`Tabs`、`Accordion`。
 *
 * `Tabs`、`Accordion` 非受控场景使用 `createSignal`（内部 **Signal**，`.value`）；其余多为纯 props 布局组件。
 *
 * @see {@link ./Tabs.tsx} 标签页
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
