/**
 * 大文件分片上传：将 {@link File} 按固定字节切片，依次调用 {@link ChunkedUploadOptions.uploadChunk}，
 * 可选 {@link ChunkedUploadOptions.complete} 做服务端合并；也可由 {@link Upload} 内部分片上传使用。
 * 不包含具体 HTTP 实现，由业务在 `uploadChunk` 内使用 `fetch` / `XMLHttpRequest` 等对接自己的接口。
 */

/** 默认单片大小：2MiB（可按服务端限制在 options 中覆盖） */
export const DEFAULT_UPLOAD_CHUNK_SIZE = 2 * 1024 * 1024;

/**
 * 若已中止则抛出 `AbortError`，便于在循环中尽早退出。
 *
 * @param signal 可选的 AbortSignal
 */
function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
}

/** 单片上传时传入的上下文（由 runChunkedUpload 注入） */
export interface ChunkUploadContext {
  /** 当前分片的二进制切片 */
  chunk: Blob;
  /** 当前片序号，从 0 开始 */
  chunkIndex: number;
  /** 总分片数 */
  chunkCount: number;
  /** 当前片在文件中的起始字节（含） */
  start: number;
  /** 当前片在文件中的结束字节（不含） */
  end: number;
  /** 原始文件 */
  file: File;
  /** 与整体上传共用的中止信号 */
  signal?: AbortSignal;
}

/** {@link runChunkedUpload} 的选项 */
export interface ChunkedUploadOptions {
  /** 要上传的文件 */
  file: File;
  /**
   * 单片最大字节数；默认 {@link DEFAULT_UPLOAD_CHUNK_SIZE}。
   * 小文件也会至少调用一次 `uploadChunk`（整文件一片）。
   */
  chunkSize?: number;
  /** 中止信号：中止后后续 `uploadChunk` 不应再发起请求 */
  signal?: AbortSignal;
  /**
   * 整体进度：已上传字节数、文件总字节数。
   * 在每片 `uploadChunk` resolve 后调用（按已写入服务端逻辑理解为「已投递」进度）。
   */
  onProgress?: (loadedBytes: number, totalBytes: number) => void;
  /**
   * 上传单片；返回任意值会按顺序收集到 `parts`，供 `complete` 使用（如 ETag 列表）。
   */
  uploadChunk: (ctx: ChunkUploadContext) => Promise<unknown>;
  /**
   * 所有分片成功后调用（如通知服务端合并）；不传则仅顺序执行 `uploadChunk`。
   */
  complete?: (args: {
    file: File;
    parts: unknown[];
    signal?: AbortSignal;
  }) => Promise<void>;
}

/**
 * 按分片顺序执行上传，并在可选的 `complete` 阶段收尾。
 *
 * @param options 分片大小、回调与中止信号等
 * @returns 各片 `uploadChunk` 的返回值数组（顺序与分片顺序一致）
 */
export async function runChunkedUpload(
  options: ChunkedUploadOptions,
): Promise<unknown[]> {
  const {
    file,
    chunkSize = DEFAULT_UPLOAD_CHUNK_SIZE,
    signal,
    onProgress,
    uploadChunk,
    complete,
  } = options;

  const totalBytes = file.size;
  const chunkCount = Math.max(1, Math.ceil(totalBytes / chunkSize));
  const parts: unknown[] = [];

  for (let i = 0; i < chunkCount; i++) {
    throwIfAborted(signal);
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, totalBytes);
    const chunk = file.slice(start, end);
    const part = await uploadChunk({
      chunk,
      chunkIndex: i,
      chunkCount,
      start,
      end,
      file,
      signal,
    });
    parts.push(part);
    onProgress?.(end, totalBytes);
  }

  throwIfAborted(signal);
  if (complete) {
    await complete({ file, parts, signal });
  }
  return parts;
}
