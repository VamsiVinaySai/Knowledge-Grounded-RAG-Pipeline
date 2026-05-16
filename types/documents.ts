import type { Document, DocumentStatus } from "./database";

// =============================================================================
// Document domain types
// =============================================================================

export type { Document, DocumentStatus };

export interface DocumentWithStats extends Document {
  chunk_count?: number;
  session_count?: number;
}

export interface DocumentUploadRequest {
  file: File;
  name?: string;
}

export interface DocumentUploadProgress {
  documentId: string;
  fileName: string;
  progress: number; // 0-100
  status: "uploading" | "processing" | "done" | "error";
  error?: string;
}

export interface DocumentFilter {
  status?: DocumentStatus;
  search?: string;
  sortBy?: "name" | "created_at" | "file_size" | "status";
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/html",
] as const;

export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

export const MIME_TYPE_LABELS: Record<SupportedMimeType, string> = {
  "application/pdf": "PDF",
  "text/plain": "Text",
  "text/markdown": "Markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word",
  "text/html": "HTML",
};

export const MIME_TYPE_ICONS: Record<SupportedMimeType, string> = {
  "application/pdf": "📄",
  "text/plain": "📝",
  "text/markdown": "📝",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "📃",
  "text/html": "🌐",
};

export function getFileTypeLabel(mimeType: string): string {
  return MIME_TYPE_LABELS[mimeType as SupportedMimeType] ?? "File";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
