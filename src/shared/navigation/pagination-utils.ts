/**
 * Pagination 分页组件的纯逻辑，便于单测与复用。
 */

export interface PaginationState {
  /** 总页数 */
  totalPages: number;
  /** 当前页（已钳在 1..totalPages） */
  safeCurrent: number;
  /** 当前页在总条数中的起始序号（1-based），仅 total 存在时有意义 */
  from: number;
  /** 当前页在总条数中的结束序号（1-based），仅 total 存在时有意义 */
  to: number;
  /** 是否可上一页 */
  canPrev: boolean;
  /** 是否可下一页 */
  canNext: boolean;
  /** 要展示的页码数组，负数表示省略号（-1 前省略，-2 后省略） */
  pages: number[];
}

/**
 * 计算分页状态。
 * @param current 当前页码（1-based）
 * @param pageSize 每页条数
 * @param total 总条数（与 totalPages 二选一）
 * @param totalPagesProp 总页数（传了则优先，否则由 total/pageSize 计算）
 */
export function getPaginationState(
  current: number,
  pageSize: number,
  total?: number,
  totalPagesProp?: number,
): PaginationState {
  const totalPages = totalPagesProp ??
    (total != null ? Math.max(1, Math.ceil(total / pageSize)) : 1);
  const safeCurrent = Math.min(totalPages, Math.max(1, current));
  const canPrev = safeCurrent > 1;
  const canNext = safeCurrent < totalPages;

  const pages: number[] = [];
  const showEllipsisStart = safeCurrent > 3;
  const showEllipsisEnd = safeCurrent < totalPages - 2;
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (showEllipsisStart) pages.push(1);
    if (showEllipsisStart) pages.push(-1);
    const start = Math.max(1, safeCurrent - 1);
    const end = Math.min(totalPages, safeCurrent + 1);
    for (let i = start; i <= end; i++) if (!pages.includes(i)) pages.push(i);
    if (showEllipsisEnd) pages.push(-2);
    if (showEllipsisEnd) pages.push(totalPages);
  }

  const from = total != null ? (safeCurrent - 1) * pageSize + 1 : 0;
  const to = total != null
    ? Math.min(safeCurrent * pageSize, total)
    : safeCurrent * pageSize;

  return {
    totalPages,
    safeCurrent,
    from,
    to,
    canPrev,
    canNext,
    pages,
  };
}
