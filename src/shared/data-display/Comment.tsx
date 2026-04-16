/**
 * Comment 评论（Preact）。
 * 评论列表 + 回复结构；支持作者、头像、时间、内容、操作、嵌套回复。
 */

import type { ComponentChildren, JSX } from "preact";
import { twMerge } from "tailwind-merge";

export interface CommentProps {
  /** 作者名或节点 */
  author?: ComponentChildren;
  /** 头像（Avatar 或图片） */
  avatar?: ComponentChildren;
  /** 主内容 */
  children?: ComponentChildren;
  /** 时间/日期文案 */
  datetime?: ComponentChildren;
  /** 操作区（如「回复」「删除」） */
  actions?: ComponentChildren[];
  /** 嵌套回复（子 Comment 或列表） */
  replies?: ComponentChildren;
  /** 额外 class */
  class?: string;
  /** 内容区 class */
  contentClass?: string;
}

/**
 * Comment：单条评论块。
 */
export function Comment(props: CommentProps): JSX.Element {
  const {
    author,
    avatar,
    children,
    datetime,
    actions,
    replies,
    class: className,
    contentClass,
  } = props;

  return (
    <div class={twMerge("comment flex gap-3", className)}>
      <div class="shrink-0">
        {avatar != null
          ? avatar
          : (
            <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              ?
            </div>
          )}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          {author != null && (
            <span class="font-medium text-slate-900 dark:text-white">
              {author}
            </span>
          )}
          {datetime != null && (
            <span class="text-xs text-slate-500 dark:text-slate-400">
              {datetime}
            </span>
          )}
        </div>
        <div
          class={twMerge(
            "mt-1 text-sm text-slate-700 dark:text-slate-300",
            contentClass,
          )}
        >
          {children}
        </div>
        {actions != null && actions.length > 0 && (
          <div class="mt-2 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            {actions.map((action, i) => <span key={i}>{action}</span>)}
          </div>
        )}
        {replies != null && (
          <div class="mt-4 pl-4 border-l-2 border-slate-100 dark:border-slate-700 space-y-4">
            {replies}
          </div>
        )}
      </div>
    </div>
  );
}
