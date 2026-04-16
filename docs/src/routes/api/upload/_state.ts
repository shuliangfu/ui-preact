/**
 * ui-view docs 上传演示：整文件用 {@link Uploader}；分片用 `@dreamer/upload/server` 的 MultipartUploadHandler +
 * 本地磁盘 {@link createLocalCloudStorageAdapter}（仅开发/文档，生产请接鉴权与对象存储）。
 */

import { createLocalCloudStorageAdapter } from "@dreamer/upload/adapters";
import { createUploader, type Uploader } from "@dreamer/upload";
import { createMultipartUploadHandler } from "@dreamer/upload/server";
import { cwd, join, relative, resolve } from "@dreamer/runtime-adapter";

/** 上传根目录（runtime/ 已在 .gitignore） */
export const UPLOAD_ROOT = join(cwd(), "runtime", "uploads");

/** 懒加载整文件 {@link Uploader} */
let uploaderSingleton: Uploader | null = null;

/** 懒加载分片处理器（与官方包协议一致） */
let multipartHandlerSingleton:
  | ReturnType<
    typeof createMultipartUploadHandler
  >
  | null = null;

/**
 * 返回共享 {@link Uploader}（简单 multipart）
 */
export function getUploader(): Uploader {
  if (!uploaderSingleton) {
    uploaderSingleton = createUploader({
      uploadDir: UPLOAD_ROOT,
      validation: {
        maxFileSize: 50 * 1024 * 1024,
        allowedMimeTypes: [],
      },
      maxTotalSize: 80 * 1024 * 1024,
    });
  }
  return uploaderSingleton;
}

/**
 * 确保上传目录已创建
 */
export async function ensureUploaderReady(): Promise<Uploader> {
  const u = getUploader();
  await u.init();
  return u;
}

/**
 * 返回 `MultipartUploadHandler` 单例（底层为本地 CloudStorageAdapter）
 */
export function getMultipartHandler(): ReturnType<
  typeof createMultipartUploadHandler
> {
  if (!multipartHandlerSingleton) {
    const storage = createLocalCloudStorageAdapter({
      baseDir: UPLOAD_ROOT,
      publicFileBasePath: "/api/upload/file",
    });
    multipartHandlerSingleton = createMultipartUploadHandler({
      storage,
      maxFileSize: 50 * 1024 * 1024,
      maxPartSize: 10 * 1024 * 1024,
      allowedMimeTypes: [],
    });
  }
  return multipartHandlerSingleton;
}

/**
 * 将落盘绝对路径转为同源下载 URL（`GET /api/upload/file?key=`）
 *
 * @param absPath 已保存文件的绝对路径
 */
export function fileUrlForStoredPath(absPath: string): string {
  const rel = relative(UPLOAD_ROOT, absPath).replace(/\\/g, "/");
  if (!rel || rel.startsWith("..") || rel.startsWith(".staging/")) {
    throw new Error("invalid stored path for public URL");
  }
  return `/api/upload/file?key=${encodeURIComponent(rel)}`;
}

/**
 * 校验 query `key` 并解析为绝对路径，禁止 `..` 与访问 `.staging`
 *
 * @param keyParam URL 中的 key
 * @returns 安全路径，非法则 `null`
 */
export function resolveSafeUploadPath(keyParam: string): string | null {
  const k = keyParam.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!k || k.includes("..") || k.startsWith(".staging/")) {
    return null;
  }
  const abs = resolve(join(UPLOAD_ROOT, k));
  const root = resolve(UPLOAD_ROOT);
  const absNorm = abs.replace(/\\/g, "/");
  const rootNorm = root.replace(/\\/g, "/");
  if (!absNorm.startsWith(rootNorm)) {
    return null;
  }
  return abs;
}
