/**
 * POST /api/upload
 * - 无 `phase`：整文件 multipart（`file` 字段）→ {@link Uploader}
 * - `?phase=init|chunk|complete`：委托 `@dreamer/upload/server` 的 MultipartUploadHandler
 */

import { json } from "@dreamer/router";
import {
  ensureUploaderReady,
  fileUrlForStoredPath,
  getMultipartHandler,
} from "./_state.ts";

/**
 * POST：分片或整文件上传入口
 */
export async function POST(request: Request): Promise<Response> {
  const phase = new URL(request.url).searchParams.get("phase");
  if (phase === "init" || phase === "chunk" || phase === "complete") {
    const handler = getMultipartHandler();
    if (phase === "init") return await handler.handleInit(request);
    if (phase === "chunk") return await handler.handleChunk(request);
    return await handler.handleComplete(request);
  }
  return await handleSimpleMultipart(request);
}

/**
 * 整文件 multipart：{@link Uploader.handleRequest}，返回 JSON `url` 供表单写入
 */
async function handleSimpleMultipart(request: Request): Promise<Response> {
  try {
    const uploader = await ensureUploaderReady();
    const result = await uploader.handleRequest(request);
    if (!result.success || result.files.length === 0) {
      return json(
        { error: result.error ?? "upload_failed" },
        result.error?.includes("multipart") ? 400 : 500,
      );
    }
    const f = result.files[0]!;
    const url = fileUrlForStoredPath(f.path);
    return json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return json({ error: message }, 500);
  }
}
