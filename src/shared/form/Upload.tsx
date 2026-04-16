/**
 * Upload 文件上传（Preact）。
 * 提供 `action` 或 `requestUpload`；行为与 ui-view 对齐。
 */

import type { JSX } from "preact";
import { useMemo, useRef } from "preact/hooks";
import { type Signal, signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";
import { IconUpload } from "../basic/icons/Upload.tsx";
import { DEFAULT_UPLOAD_CHUNK_SIZE } from "./chunked-upload.ts";
import {
  fileMatchesAccept,
  uploadFilePhasedChunks,
  uploadFileSimple,
} from "./upload-http.ts";
import {
  commitMaybeSignal,
  type MaybeSignal,
  readMaybeSignal,
} from "./maybe-signal.ts";

/** 文件项状态 */
export type UploadFileStatus = "pending" | "uploading" | "done" | "error";

export interface UploadFile {
  uid: string;
  name: string;
  status?: UploadFileStatus;
  progress?: number;
  size?: number;
  errorMessage?: string;
  resultUrl?: string;
}

/**
 * 将字节格式化为可读字符串。
 */
export function formatUploadFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type UploadMultipleValueMode = "json" | "comma";

export interface UploadCoreProps {
  multiple?: boolean;
  accept?: string;
  disabled?: boolean;
  drag?: boolean;
  dragPlaceholder?: string;
  showTriggerIcon?: boolean;
  triggerLabel?: string;
  hideFocusRing?: boolean;
  preview?: boolean;
  class?: string;
  name?: string;
  id?: string;
  method?: string;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  fileFieldName?: string;
  maxFileSize?: number;
  maxCount?: number;
  chunked?: boolean | "auto";
  chunkThreshold?: number;
  chunkSize?: number;
  getValueFromResponse?: (res: Response) => Promise<string>;
  multipleValueMode?: UploadMultipleValueMode;
  value?: MaybeSignal<string>;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onUploadSuccess?: (p: {
    url: string;
    file: File;
    response?: Response;
  }) => void;
  onUploadError?: (err: Error, file: File) => void;
}

export type UploadProps =
  & UploadCoreProps
  & (
    | {
      action: string;
      requestUpload?: (file: File, signal: AbortSignal) => Promise<string>;
    }
    | {
      action?: string;
      requestUpload: (file: File, signal: AbortSignal) => Promise<string>;
    }
  );

const fileInputOverlayCls =
  "absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed";

const dropZoneCls =
  "border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 transition-colors";
const dropZoneActiveCls = "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20";

interface UploadRuntimeState {
  items: Signal<UploadFile[]>;
  innerHidden: Signal<string>;
  fileByUid: Map<string, File>;
  abortByUid: Map<string, AbortController>;
}

const uploadRuntimeByStorageKey = new Map<string, UploadRuntimeState>();

function resolveUploadStorageKey(
  id: string | undefined,
  name: string | undefined,
): string | null {
  const trimmedId = id?.trim();
  if (trimmedId) return `id:${trimmedId}`;
  const trimmedName = name?.trim();
  if (trimmedName) return `name:${trimmedName}`;
  return null;
}

function makeUploadRuntime(defaultHidden: string): UploadRuntimeState {
  return {
    items: signal<UploadFile[]>([]),
    innerHidden: signal(defaultHidden),
    fileByUid: new Map(),
    abortByUid: new Map(),
  };
}

function serializeUploadHiddenValue(
  items: UploadFile[],
  multiple: boolean,
  mode: UploadMultipleValueMode,
): string {
  const urls = items.map((it) =>
    it.status === "done" && it.resultUrl ? it.resultUrl : null
  );
  if (!multiple) {
    const u = urls.find((x): x is string => x != null);
    return u ?? "";
  }
  if (mode === "comma") {
    return urls.filter((x): x is string => x != null).join(",");
  }
  return JSON.stringify(urls);
}

function newUploadUid(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `u-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function canPreviewUploadedImage(url: string, accept?: string): boolean {
  const u = url.trim();
  if (!u) return false;
  if (accept && /\bimage\b/i.test(accept)) {
    return true;
  }
  if (u.startsWith("data:image/")) return true;
  if (
    /\/file\?[^#]*\bkey=/.test(u) &&
    /[?&]key=[^&#]*\.(png|jpe?g|gif|webp|svg|avif|bmp)(?:&|#|$)/i.test(u)
  ) {
    return true;
  }
  return /\.(png|jpe?g|gif|webp|svg|avif|bmp)(?:\?|#|$|&)/i.test(u) ||
    /[?&][^#]*\.(png|jpe?g|gif|webp|svg|avif|bmp)/i.test(u);
}

/**
 * Upload：文件选择与自动上传。
 */
export function Upload(props: UploadProps): JSX.Element {
  const {
    multiple = false,
    accept,
    disabled = false,
    drag = true,
    dragPlaceholder = "点击或拖拽文件到此处",
    showTriggerIcon = true,
    triggerLabel = "选择文件",
    hideFocusRing = false,
    preview = false,
    class: className,
    name,
    id,
    action,
    method,
    headers,
    withCredentials,
    fileFieldName,
    maxFileSize,
    maxCount,
    chunked = "auto",
    chunkThreshold = DEFAULT_UPLOAD_CHUNK_SIZE,
    chunkSize = DEFAULT_UPLOAD_CHUNK_SIZE,
    getValueFromResponse,
    multipleValueMode = "json",
    requestUpload,
    value: valueProp,
    defaultValue = "",
    onValueChange,
    onUploadSuccess,
    onUploadError,
  } = props;

  const storageKey = resolveUploadStorageKey(id, name);
  const anonRef = useRef<UploadRuntimeState | null>(null);

  const rt = useMemo(() => {
    if (storageKey != null) {
      const hit = uploadRuntimeByStorageKey.get(storageKey);
      if (hit) return hit;
      const created = makeUploadRuntime(defaultValue);
      uploadRuntimeByStorageKey.set(storageKey, created);
      return created;
    }
    if (!anonRef.current) anonRef.current = makeUploadRuntime(defaultValue);
    return anonRef.current;
  }, [storageKey, defaultValue]);

  const { items, innerHidden, fileByUid, abortByUid } = rt;

  const setHiddenAndNotify = (next: string) => {
    if (valueProp === undefined) {
      innerHidden.value = next;
    }
    commitMaybeSignal(valueProp, next);
    onValueChange?.(next);
  };

  const recomputeHidden = (list: UploadFile[]) => {
    const s = serializeUploadHiddenValue(
      list,
      multiple,
      multipleValueMode,
    );
    setHiddenAndNotify(s);
  };

  const pushErrorItem = (file: File, message: string) => {
    const uid = newUploadUid();
    items.value = [
      ...items.value,
      {
        uid,
        name: file.name,
        size: file.size,
        status: "error",
        errorMessage: message,
      },
    ];
  };

  const startUpload = (uid: string, file: File) => {
    const ac = new AbortController();
    abortByUid.set(uid, ac);

    const updateItem = (patch: Partial<UploadFile>) => {
      const cur = items.value;
      if (!cur.some((it) => it.uid === uid)) return;
      items.value = cur.map((it) => it.uid === uid ? { ...it, ...patch } : it);
    };

    updateItem({ status: "uploading", progress: 0, errorMessage: undefined });

    const run = async () => {
      try {
        let url: string;
        if (requestUpload) {
          url = await requestUpload(file, ac.signal);
        } else if (action) {
          const useChunk = chunked === true ||
            (chunked === "auto" && file.size > chunkThreshold);
          const gv = getValueFromResponse;
          if (useChunk) {
            url = await uploadFilePhasedChunks(action, file, {
              method,
              headers,
              withCredentials,
              chunkSize,
              signal: ac.signal,
              onProgress: (loaded, total) => {
                const pct = total > 0 ? (loaded / total) * 100 : 0;
                updateItem({ progress: pct });
              },
              getValueFromResponse: gv,
            });
          } else {
            url = await uploadFileSimple(action, file, {
              method,
              headers,
              withCredentials,
              fileFieldName,
              signal: ac.signal,
              getValueFromResponse: gv,
            });
            updateItem({ progress: 100 });
          }
        } else {
          throw new Error("Upload 需要 action 或 requestUpload");
        }
        const cur = items.value;
        const hasRow = cur.some((it) => it.uid === uid);
        const list: UploadFile[] = hasRow
          ? cur.map((it) =>
            it.uid === uid
              ? {
                ...it,
                status: "done" as const,
                progress: 100,
                resultUrl: url,
                errorMessage: undefined,
              }
              : it
          )
          : [
            ...cur,
            {
              uid,
              name: file.name,
              size: file.size,
              status: "done" as const,
              progress: 100,
              resultUrl: url,
              errorMessage: undefined,
            },
          ];
        fileByUid.set(uid, file);
        items.value = list;
        recomputeHidden(list);
        onUploadSuccess?.({ url, file });
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
          return;
        }
        const msg = e instanceof Error ? e.message : String(e);
        updateItem({
          status: "error",
          progress: undefined,
          errorMessage: msg,
        });
        onUploadError?.(e instanceof Error ? e : new Error(msg), file);
      } finally {
        abortByUid.delete(uid);
      }
    };

    void run();
  };

  const tryAddFiles = (raw: File[]) => {
    if (disabled) return;
    if (raw.length === 0) return;
    if (!multiple) {
      for (const it of items.value) {
        abortByUid.get(it.uid)?.abort();
        fileByUid.delete(it.uid);
      }
      items.value = [];
    }
    for (const file of raw) {
      if (!fileMatchesAccept(file, accept)) {
        pushErrorItem(file, "文件类型不在 accept 允许范围内");
        continue;
      }
      if (maxFileSize != null && file.size > maxFileSize) {
        pushErrorItem(
          file,
          `文件超过大小限制（最大 ${formatUploadFileSize(maxFileSize)}）`,
        );
        continue;
      }
      if (multiple && maxCount != null && items.value.length >= maxCount) {
        pushErrorItem(file, `最多只能选择 ${maxCount} 个文件`);
        break;
      }
      const uid = newUploadUid();
      fileByUid.set(uid, file);
      items.value = [
        ...items.value,
        {
          uid,
          name: file.name,
          size: file.size,
          status: "pending",
        },
      ];
      startUpload(uid, file);
      if (!multiple) break;
    }
    recomputeHidden(items.value);
  };

  const handleFileInputChange = (e: Event) => {
    const el = e.target as HTMLInputElement;
    const fs = el.files;
    if (!fs?.length) return;
    tryAddFiles(Array.from(fs));
    el.value = "";
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).classList.remove(dropZoneActiveCls);
    if (disabled || !e.dataTransfer?.files?.length) return;
    const files = multiple
      ? Array.from(e.dataTransfer.files)
      : [e.dataTransfer.files[0]!];
    tryAddFiles(files);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = "copy";
    if (!disabled && drag) {
      (e.currentTarget as HTMLElement).classList.add(dropZoneActiveCls);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove(dropZoneActiveCls);
  };

  const handleRemoveByUid = (uid: string) => {
    const row = items.value.find((it) => it.uid === uid);
    if (!row) return;
    abortByUid.get(row.uid)?.abort();
    fileByUid.delete(row.uid);
    const next = items.value.filter((it) => it.uid !== uid);
    items.value = next;
    recomputeHidden(next);
  };

  const handleRetryByUid = (uid: string) => {
    const row = items.value.find((it) => it.uid === uid);
    if (!row || row.status !== "error") return;
    const file = fileByUid.get(row.uid);
    if (!file) return;
    items.value = items.value.map((it) =>
      it.uid === uid
        ? {
          ...it,
          status: "pending" as const,
          progress: undefined,
          errorMessage: undefined,
          resultUrl: undefined,
        }
        : it
    );
    startUpload(row.uid, file);
  };

  const showDragZone = drag !== false;
  const hiddenId = id ? `${id}-value` : undefined;

  const controlledHidden = readMaybeSignal(valueProp);
  const hiddenValue = controlledHidden !== undefined
    ? controlledHidden
    : innerHidden.value;

  const fileInputOverlay = (
    <input
      type="file"
      id={id}
      multiple={multiple}
      accept={accept}
      disabled={disabled}
      class={fileInputOverlayCls}
      aria-label={triggerLabel}
      onChange={handleFileInputChange}
    />
  );

  const triggerBar = (
    <div
      class={twMerge(
        "relative flex min-h-10 w-full max-w-full items-stretch overflow-hidden rounded-lg border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800",
        !hideFocusRing &&
          "focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent dark:focus-within:ring-blue-400",
        disabled && "opacity-50",
      )}
    >
      {fileInputOverlay}
      <div class="pointer-events-none flex min-h-10 min-w-0 flex-1 items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
        {showTriggerIcon && (
          <IconUpload
            size="sm"
            class="shrink-0 text-slate-500 dark:text-slate-400"
          />
        )}
        <span class="truncate">{triggerLabel}</span>
      </div>
    </div>
  );

  const list = items.value;

  return (
    <div class={twMerge("space-y-2", className)}>
      <input
        type="hidden"
        name={name}
        id={hiddenId}
        value={hiddenValue}
        readOnly
        aria-hidden="true"
      />

      {showDragZone
        ? (
          <div
            class={twMerge(
              dropZoneCls,
              "relative min-h-[120px] flex items-center justify-center",
              !hideFocusRing &&
                "focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent dark:focus-within:ring-blue-400",
            )}
            onDrop={handleDrop as unknown as (e: Event) => void}
            onDragOver={handleDragOver as unknown as (e: Event) => void}
            onDragLeave={handleDragLeave as unknown as (e: Event) => void}
          >
            {fileInputOverlay}
            <div class="pointer-events-none flex flex-col items-center gap-2 px-2 text-center">
              {showTriggerIcon && (
                <IconUpload
                  size="md"
                  class="text-slate-400 dark:text-slate-500"
                />
              )}
              <span class="text-sm">{dragPlaceholder}</span>
            </div>
          </div>
        )
        : triggerBar}

      <ul
        class={twMerge(
          "grid grid-cols-1 gap-3 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          list.length === 0 ? "hidden" : "",
        )}
        role="list"
      >
        {list.map((file) => (
          <li
            key={file.uid}
            class="relative flex min-w-0 flex-col gap-2 overflow-hidden rounded-lg border border-slate-200/90 bg-slate-100 p-2 dark:border-slate-600/70 dark:bg-slate-700/50"
          >
            {preview &&
              file.status === "done" &&
              file.resultUrl &&
              canPreviewUploadedImage(file.resultUrl, accept) && (
              <div class="aspect-square w-full shrink-0 overflow-hidden rounded-md border border-slate-200/80 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/80">
                <img
                  src={file.resultUrl}
                  alt={file.name}
                  class="h-full w-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}
            <div class="flex min-w-0 flex-wrap items-center gap-2">
              <span
                class="min-w-0 flex-1 truncate text-slate-800 dark:text-slate-100"
                title={file.name}
              >
                {file.name}
                {file.size != null && file.size >= 0 && (
                  <span class="text-slate-500 dark:text-slate-400 font-normal">
                    {" "}
                    · {formatUploadFileSize(file.size)}
                  </span>
                )}
              </span>
              {file.status === "pending" && (
                <span
                  class="shrink-0 text-xs text-slate-400 dark:text-slate-500"
                  aria-label="等待上传"
                >
                  …
                </span>
              )}
              {file.status === "uploading" && file.progress != null && (
                <span class="shrink-0 w-11 text-right text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {Math.round(file.progress)}%
                </span>
              )}
              {file.status === "done" && (
                <span
                  class="shrink-0 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                  aria-label="已完成"
                >
                  OK
                </span>
              )}
              {file.status === "error" && (
                <span
                  class="shrink-0 text-xs font-medium text-red-600 dark:text-red-400"
                  title={file.errorMessage}
                  aria-label="上传失败"
                >
                  !
                </span>
              )}
              {file.status === "error" && (
                <button
                  type="button"
                  class="shrink-0 text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                  disabled={disabled}
                  onClick={() => handleRetryByUid(file.uid)}
                >
                  重试
                </button>
              )}
              <button
                type="button"
                class="shrink-0 p-0.5 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                aria-label={file.status === "uploading"
                  ? `取消或移除 ${file.name}`
                  : `移除 ${file.name}`}
                disabled={disabled}
                onClick={() => handleRemoveByUid(file.uid)}
              >
                <svg
                  class="size-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {file.status === "error" && file.errorMessage && (
              <p class="text-xs text-red-600 dark:text-red-400 truncate pl-0.5">
                {file.errorMessage}
              </p>
            )}
            {file.status === "uploading" && (
              <div
                class="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b bg-slate-200 dark:bg-slate-600"
                role="progressbar"
                aria-valuenow={file.progress ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  class="h-full rounded bg-blue-500"
                  style={{ width: `${file.progress ?? 0}%` }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
