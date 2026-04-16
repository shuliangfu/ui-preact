/**
 * docs 演示上传目录定时清理：按文件修改时间删除超过保留期的对象（含 `.staging` 分片临时文件）。
 */

import {
  cron,
  type CronHandle,
  remove,
  stat,
  walk,
} from "@dreamer/runtime-adapter";
import { UPLOAD_ROOT } from "./_state.ts";

/** 上传文件在磁盘上的最长保留时间（毫秒），超时后可被定时任务删除 */
export const UPLOAD_FILE_TTL_MS = 10 * 60 * 1000;

/**
 * 遍历 `UPLOAD_ROOT`，删除修改时间早于「当前时间 − TTL」的普通文件。
 * 目录仅在变空后由后续逻辑或手动处理；此处不删目录以免误删正在写入的路径。
 */
export async function deleteExpiredUploadFiles(): Promise<void> {
  let rootStat;
  try {
    rootStat = await stat(UPLOAD_ROOT);
  } catch {
    return;
  }
  if (!rootStat.isDirectory) return;

  const cutoff = Date.now() - UPLOAD_FILE_TTL_MS;
  const paths: string[] = [];

  try {
    for await (const filePath of walk(UPLOAD_ROOT, { includeDirs: false })) {
      try {
        const info = await stat(filePath);
        if (!info.isFile || info.mtime == null) continue;
        if (info.mtime.getTime() < cutoff) {
          paths.push(filePath);
        }
      } catch {
        // 并发下文件可能已消失，忽略
      }
    }
  } catch {
    // 根目录不可读等
    return;
  }

  for (const p of paths) {
    try {
      await remove(p);
    } catch {
      // 已删除或无权限时忽略
    }
  }
}

let schedulerHandle: CronHandle | null = null;

/**
 * 注册每分钟执行一次的清理任务（node-cron 五段式：分 时 日 月 周）
 *
 * @returns 可调用 `close()` 停止任务
 */
export function startUploadCleanupScheduler(): CronHandle {
  if (schedulerHandle && !schedulerHandle.isClosed) {
    return schedulerHandle;
  }
  schedulerHandle = cron(
    "* * * * *",
    async () => {
      await deleteExpiredUploadFiles();
    },
    {
      onError: (err) => {
        console.error("[docs upload cleanup]", err);
      },
    },
  );
  return schedulerHandle;
}
