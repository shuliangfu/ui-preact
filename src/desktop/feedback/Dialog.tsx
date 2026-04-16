/**
 * Dialog 确认对话框（Preact）。
 * 可视为 Modal 简化版：标题、内容、确定/取消按钮；支持警告（橙色确定）、危险操作（红色确定）、加载态。
 *
 * **`open`**：与 {@link Modal} 一致，请传 **`Signal<boolean>`** `open={sig}` 或零参 getter，勿传 `open={sig.value}` 快照。
 */

import type { ComponentChildren, JSX } from "preact";
import { Button } from "../../shared/basic/Button.tsx";
import { Modal } from "../../shared/feedback/Modal.tsx";
import type { ModalProps } from "../../shared/feedback/Modal.tsx";

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
 * 确认对话框：基于 {@link Modal} 的标题、正文与底部按钮组合。
 *
 * @param props - 弹层与按钮配置
 */
export function Dialog(props: DialogProps): JSX.Element {
  const {
    open,
    onClose,
    title,
    content,
    children,
    footer: footerOverride,
    confirmText = "确定",
    cancelText = "取消",
    onConfirm,
    onCancel,
    danger = false,
    warning = false,
    confirmLoading = false,
    showFooter = true,
    ...restModal
  } = props;

  const body = content !== undefined ? content : children;
  const hasCancel = cancelText != null && cancelText !== "";
  const hasConfirm = onConfirm != null;

  /** 确定钮语义：危险 > 警告 > 主色 */
  const confirmVariant = danger ? "danger" : warning ? "warning" : "primary";

  /** 默认底部：确定与取消按钮（可由 footer 覆盖） */
  const defaultFooter =
    showFooter && (hasConfirm || hasCancel) && footerOverride === undefined
      ? (
        <>
          {hasConfirm && (
            <Button
              type="button"
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
              variant="default"
              disabled={confirmLoading}
              onClick={(_e: Event) => (onCancel ?? onClose)?.()}
            >
              {cancelText}
            </Button>
          )}
        </>
      )
      : footerOverride;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={defaultFooter}
      keyboard
      {...restModal}
    >
      {body as ComponentChildren}
    </Modal>
  );
}
