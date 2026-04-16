/**
 * GET /api/upload/file?key=<相对 UPLOAD_ROOT 的路径>
 * 读取已上传文件（与 {@link createLocalCloudStorageAdapter} 的 getPresignedUrl 对应）
 */

import { getMimeType } from "@dreamer/upload";
import { basename, readFile } from "@dreamer/runtime-adapter";
import { resolveSafeUploadPath } from "./_state.ts";

/**
 * 按安全解析后的路径返回文件字节流
 */
export async function GET(request: Request): Promise<Response> {
  const key = new URL(request.url).searchParams.get("key");
  if (!key) {
    return new Response("missing key", { status: 400 });
  }
  const abs = resolveSafeUploadPath(key);
  if (!abs) {
    return new Response("invalid key", { status: 400 });
  }
  try {
    const body = await readFile(abs);
    const mime = getMimeType(basename(key)) || "application/octet-stream";
    // Uint8Array 作为 BodyInit 在部分 TS lib 下需独立切片，避免 ArrayBufferLike 类型不兼容
    return new Response(body.slice(), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
