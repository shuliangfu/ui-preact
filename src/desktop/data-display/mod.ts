/**
 * @module @dreamer/ui-preact/data-display
 * @description
 * **JSR**：`import … from "@dreamer/ui-preact/data-display"`。桌面端**数据展示**：列表、卡片、图片、时间轴、树、日历、统计、分段器、表格等。
 *
 * **Table** 仅桌面提供；其余多为 shared 薄 re-export。`IMAGE_BUILTIN_FALLBACK_SRC` 为图片加载失败时的内置 data URI。
 * 各组件 props 与 `@returns` 见对应 `.tsx`。
 *
 * @see {@link ./Table.tsx} 表格组件
 */
export { Tag, type TagProps } from "./Tag.tsx";
export { Empty, type EmptyProps } from "./Empty.tsx";
export { Statistic, type StatisticProps } from "./Statistic.tsx";
export {
  Segmented,
  type SegmentedOption,
  type SegmentedProps,
} from "./Segmented.tsx";
export {
  Descriptions,
  type DescriptionsItem,
  type DescriptionsProps,
} from "./Descriptions.tsx";
export { Card, type CardProps } from "./Card.tsx";
export { List, type ListItemProps, type ListProps } from "./List.tsx";
export {
  Image,
  IMAGE_BUILTIN_FALLBACK_SRC,
  type ImageProps,
} from "./Image.tsx";
export {
  ImageViewer,
  type ImageViewerImageTransition,
  type ImageViewerProps,
  type ImageViewerTransition,
  type ImageViewerTransitionInput,
} from "./ImageViewer.tsx";
export {
  Timeline,
  type TimelineItemProps,
  type TimelineProps,
} from "./Timeline.tsx";
export {
  Collapse,
  type CollapseItem,
  type CollapseProps,
} from "./Collapse.tsx";
export { Carousel, type CarouselProps } from "./Carousel.tsx";
export { Tree, type TreeNode, type TreeProps } from "./Tree.tsx";
export {
  Calendar,
  type CalendarDaySelectionMode,
  type CalendarMode,
  type CalendarProps,
} from "./Calendar.tsx";
export { Comment, type CommentProps } from "./Comment.tsx";
export {
  CodeBlock,
  type CodeBlockLanguage,
  type CodeBlockProps,
} from "./CodeBlock.tsx";

export {
  type SortOrder,
  Table,
  type TableCellChangePayload,
  type TableColumn,
  type TableColumnEditable,
  type TableEditableOption,
  type TableProps,
} from "./Table.tsx";
