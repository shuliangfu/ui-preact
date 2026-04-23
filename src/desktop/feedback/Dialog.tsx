/**
 * Dialog 确认对话框（Preact）。
 * 可视为 Modal 简化版：标题、内容、确定/取消按钮；支持警告（橙色确定）、危险操作（红色确定）、加载态。
 *
 * **`open`**：与 {@link Modal} 一致，请传 **`Signal<boolean>`** `open={sig}` 或零参 getter，勿传 `open={sig.value}` 快照。
 *
 * **变体**：`variant` 控制宽度与 `actionSheet` 落位等；`mobileLayout` 默认横排，仅当传 `auto`/`stack` 时窄屏或全断点纵排。自定义 `footer` 时由业务自行布局，不受 `mobileLayout` 影响；默认定/取底栏窄屏在 foot 内居中成组、`sm+` 仍右对齐（与 ui-view 一致）。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { Button } from "../../shared/basic/Button.tsx";
import { Modal } from "../../shared/feedback/Modal.tsx";
import type {
  ModalPlacement,
  ModalProps,
} from "../../shared/feedback/Modal.tsx";

/**
 * 类系统确认框：小屏左右留白；`actionSheet` 自底部上滑；`default` 为原仅桌面 520 横排。默认定/取为横排，与旧版一致。
 */
export type DialogVariant = "default" | "alert" | "actionSheet";

/**
 * 库默认定/取栏布局（自定义 `footer` 时不生效）。
 * - `row`（默认）：两钮横排，窄屏在底栏内居中成组；`sm+` 与原先一致靠右
 * - `auto`：窄屏纵排全宽；`sm+` 横排靠右
 * - `stack`：各断点均纵排
 */
export type DialogMobileLayout = "row" | "auto" | "stack";

/** 与系统弹窗类似：不贴满视口，上沿与 sm 预设一致 */
const DIALOG_ALERT_WIDTH = "min(calc(100vw - 2rem), 520px)";

export interface DialogProps extends
  Omit<
    ModalProps,
    "footer" | "children"
  > {
  /** 关闭回调 */
  onClose?: () => void;
  /** 标题 */
  title?: string | null;
  /** 正文内容（与 children 二选一，若都传则 content 优先） */
  content?: string | ComponentChildren;
  /** 弹层内容（与 content 二选一） */
  children?: ComponentChildren;
  /**
   * 布局变体。`alert`（默认）：小屏边距为类系统宽；`actionSheet`：自底部上滑；`default`：原 Modal 固定宽。
   */
  variant?: DialogVariant;
  /**
   * 仅作用于**库默认**确定/取底栏。默认 `row`（两钮横排，与旧版一致）；`auto`/`stack` 为需纵排时使用。
   */
  mobileLayout?: DialogMobileLayout;
  /** 自定义底部（覆盖默认确定/取消）；传 null 不显示 footer */
  footer?: ComponentChildren | null;
  /** 确定按钮文案，默认 "确定" */
  confirmText?: string;
  /** 取消按钮文案，默认 "取消"；传 null 或空则不显示取消按钮 */
  cancelText?: string | null;
  /** 确定回调；不传则不显示确定按钮（仅当 footer 也未传时生效） */
  onConfirm?: () => void | Promise<void>;
  /** 取消回调，默认 onClose */
  onCancel?: () => void;
  /** 是否为危险操作（确定按钮 danger 样式），默认 false */
  danger?: boolean;
  /**
   * 是否为警告类确认（确定按钮 warning 橙色样式），默认 false。
   * 与 {@link danger} 同时为 true 时以 danger 为准。
   */
  warning?: boolean;
  /**
   * 确定按钮 loading：走 Button 的 `loading`（转圈 + 主色保持）；
   * 为 true 时**确定与取消**均禁用，避免提交过程中重复操作或中途取消（完成后由业务将本项置回 false）。
   * 若仍允许点遮罩/标题栏/Esc 关闭，请自行控制 Modal 的 `closable`、`maskClosable`、`keyboard` 等透传属性。
   */
  confirmLoading?: boolean;
  /** 是否显示底部（确定/取消）；传 false 则完全不显示 footer */
  showFooter?: boolean;
}

/**
 * 按 `mobileLayout` 与按钮语义构造默认定/取区：横排、或带窄屏纵排/全断点堆叠的包裹层（与 `@dreamer/ui-view` 的 Dialog 同源逻辑）。
 */
function buildDialogDefaultFooter(
  options: {
    hasConfirm: boolean;
    hasCancel: boolean;
    layout: DialogMobileLayout;
    confirmVariant: "primary" | "warning" | "danger";
    confirmText: string;
    cancelText: string;
    confirmLoading: boolean;
    onConfirm?: () => void | Promise<void>;
    onCancel: (() => void) | undefined;
    onClose: (() => void) | undefined;
  },
): ComponentChildren {
  const {
    hasConfirm,
    hasCancel,
    layout,
    confirmVariant,
    confirmText,
    cancelText,
    confirmLoading,
    onConfirm,
    onCancel,
    onClose,
  } = options;

  /** 横排不加尺寸类；`auto` 为窄屏全宽、`sm+` 与原先横排一致；`stack` 为各断点全宽 */
  const btnClass = layout === "row"
    ? ""
    : (layout === "stack"
      ? "w-full min-h-10"
      : "w-full min-h-10 sm:min-h-0 sm:w-auto");
  const btnClassProp = btnClass || undefined;
  /** 非 `row` 时必有包裹层，便于窄屏纵排与 `sm+` 右对齐横排 */
  const wrapForNonRow = layout === "stack"
    ? "flex w-full flex-col gap-2.5 self-stretch"
    : "flex w-full flex-col gap-2.5 self-stretch sm:w-auto sm:flex-row sm:justify-end sm:gap-2 sm:self-center";

  const nodes = (
    <>
      {hasConfirm && (
        <Button
          type="button"
          class={btnClassProp}
          variant={confirmVariant}
          loading={confirmLoading}
          onClick={(_e: Event) => onConfirm?.()}
        >
          {confirmText}
        </Button>
      )}
      {hasCancel && (
        <Button
          type="button"
          class={btnClassProp}
          variant="default"
          disabled={confirmLoading}
          onClick={(_e: Event) => (onCancel ?? onClose)?.()}
        >
          {cancelText}
        </Button>
      )}
    </>
  );

  if (layout === "row") {
    return nodes;
  }
  return <div class={wrapForNonRow}>{nodes}</div>;
}

/**
 * 确认对话框：基于 {@link Modal} 的标题、正文与底部按钮组合（`variant` / `mobileLayout` 与 `@dreamer/ui-view` 对齐）。
 *
 * @param props - 弹层与按钮配置
 * @returns 与 Modal 同路径下的弹层
 */
export function Dialog(props: DialogProps): JSX.Element {
  const {
    open,
    onClose,
    title,
    content,
    children,
    variant = "alert",
    mobileLayout: mobileLayoutIn,
    footer: footerOverride,
    footerClass: footerClassIn,
    confirmText = "确定",
    cancelText = "取消",
    onConfirm,
    onCancel,
    danger = false,
    warning = false,
    confirmLoading = false,
    showFooter = true,
    width: widthIn,
    class: classIn,
    wrapClass: wrapIn,
    placement: placementIn,
    ...restModal
  } = props;

  const body: ComponentChildren = content !== undefined ? content : children;
  const hasCancel = cancelText != null && cancelText !== "";
  const hasConfirm = onConfirm != null;

  const layout: DialogMobileLayout = mobileLayoutIn != null
    ? mobileLayoutIn
    : "row";

  /** 确定钮语义：危险 > 警告 > 主色 */
  const confirmVariant = danger ? "danger" : warning ? "warning" : "primary";

  const resolvedWidth = widthIn != null
    ? widthIn
    : (variant === "default"
      ? undefined
      : (variant === "actionSheet" ? "100%" : DIALOG_ALERT_WIDTH));

  const placement: ModalPlacement | undefined = variant === "actionSheet"
    ? "bottom"
    : (placementIn === "bottom" ? "bottom" : undefined);

  const classFromVariant = variant === "actionSheet"
    ? twMerge(
      "w-full sm:mb-2 sm:mx-auto sm:max-w-[min(calc(100vw-2rem),520px)] sm:rounded-xl",
      "rounded-b-none rounded-t-2xl border-x-0 sm:border-x",
    )
    : (variant === "alert" ? "w-full" : undefined);

  const classMerged = twMerge(classFromVariant, classIn);

  const useBuiltInFooter = showFooter && (hasConfirm || hasCancel) &&
    footerOverride === undefined;
  const defaultFooter: ComponentChildren | null = useBuiltInFooter
    ? buildDialogDefaultFooter({
      hasConfirm,
      hasCancel,
      layout,
      confirmVariant,
      confirmText,
      cancelText: cancelText as string,
      confirmLoading,
      onConfirm,
      onCancel,
      onClose,
    })
    : (footerOverride ?? null);

  const footerClassMerged = useBuiltInFooter
    ? twMerge("max-sm:justify-center sm:justify-end", footerClassIn)
    : footerClassIn;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={defaultFooter}
      keyboard
      width={resolvedWidth}
      class={classMerged}
      wrapClass={wrapIn}
      placement={placement}
      footerClass={footerClassMerged}
      {...restModal}
    >
      {body as ComponentChildren}
    </Modal>
  );
}
