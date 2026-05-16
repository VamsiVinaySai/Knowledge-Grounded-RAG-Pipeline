"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { formatBytes } from "@/lib/utils/format";
import { SUPPORTED_MIME_TYPES } from "@/types/documents";
import type { Document } from "@/types/database";
import toast from "react-hot-toast";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface UploadZoneProps {
  userId: string;
  onUploadComplete: (doc: Document) => void;
  onCancel: () => void;
}

interface FileWithStatus {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

export function UploadZone({ userId, onUploadComplete, onCancel }: UploadZoneProps) {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((accepted: File[], rejected: import("react-dropzone").FileRejection[]) => {
    if (rejected.length > 0) {
      rejected.forEach(({ file, errors }) => {
        toast.error(`${file.name}: ${errors[0]?.message}`);
      });
    }

    const newFiles: FileWithStatus[] = accepted.map((file) => ({
      file,
      status: "pending",
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.fromEntries(SUPPORTED_MIME_TYPES.map((t) => [t, []])),
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0 || uploading) return;
    setUploading(true);

    // TODO (Phase 2): Implement actual Supabase Storage upload
    // For now, show placeholder behavior
    for (let i = 0; i < files.length; i++) {
      setFiles((prev) =>
        prev.map((f, idx) => idx === i ? { ...f, status: "uploading", progress: 50 } : f),
      );

      await new Promise((res) => setTimeout(res, 800));

      setFiles((prev) =>
        prev.map((f, idx) => idx === i ? { ...f, status: "done", progress: 100 } : f),
      );
    }

    toast.success(`${files.length} file(s) queued. Ingestion pipeline coming in Phase 2.`);
    setUploading(false);

    setTimeout(() => {
      files.forEach(() => {
        // Placeholder: in Phase 2 this calls the real API
        // onUploadComplete(doc);
      });
      onCancel();
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Upload Documents</p>
        <button
          onClick={onCancel}
          className="rounded-lg p-1 text-ink-faint transition-colors hover:bg-canvas-200 hover:text-ink-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-200",
          isDragActive
            ? "border-amber/60 bg-amber/5"
            : "border-[var(--border)] bg-canvas-100 hover:border-[var(--border-hover)] hover:bg-canvas-200",
        )}
      >
        <input {...getInputProps()} />

        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full transition-all",
          isDragActive ? "bg-amber/15" : "bg-canvas-200",
        )}>
          <Upload className={cn("h-5 w-5 transition-colors", isDragActive ? "text-amber" : "text-ink-muted")} />
        </div>

        <p className="mt-3 text-sm text-ink">
          {isDragActive ? "Drop files here" : "Drag files here or click to browse"}
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          PDF, Word, TXT, Markdown — max 10 MB each
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg bg-canvas-100 px-3 py-2"
            >
              <FileText className="h-4 w-4 shrink-0 text-ink-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-ink">{f.file.name}</p>
                <p className="text-2xs text-ink-faint">{formatBytes(f.file.size)}</p>
                {f.status === "uploading" && (
                  <div className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-canvas-300">
                    <div
                      className="h-full rounded-full bg-amber transition-all duration-300"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                )}
                {f.status === "error" && (
                  <p className="mt-0.5 text-2xs text-danger">{f.error}</p>
                )}
              </div>
              {f.status === "done" ? (
                <div className="h-4 w-4 rounded-full bg-success/10 text-success flex items-center justify-center">
                  <span className="text-2xs">✓</span>
                </div>
              ) : f.status === "error" ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-danger" />
              ) : (
                <button
                  onClick={() => removeFile(i)}
                  className="rounded p-0.5 text-ink-faint hover:text-ink-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {files.length > 0 && (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="amber"
            size="sm"
            loading={uploading}
            onClick={handleUpload}
            disabled={files.every((f) => f.status === "done")}
          >
            Upload {files.length} file{files.length !== 1 ? "s" : ""}
          </Button>
        </div>
      )}
    </div>
  );
}
