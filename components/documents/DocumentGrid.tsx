"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  MoreHorizontal,
  Trash2,
  MessageSquare,
  Clock,
} from "lucide-react";
import { Card, StatusBadge, EmptyState } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { formatRelativeDate, formatBytes } from "@/lib/utils/format";
import { getFileTypeLabel } from "@/types/documents";
import { createClient } from "@/lib/supabase/client";
import type { Document } from "@/types/database";
import toast from "react-hot-toast";

interface DocumentGridProps {
  documents: Document[];
  viewMode: "grid" | "list";
  onDelete: (id: string) => void;
  totalCount: number;
  isFiltered: boolean;
}

export function DocumentGrid({
  documents,
  viewMode,
  onDelete,
  totalCount,
  isFiltered,
}: DocumentGridProps) {
  if (documents.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-5 w-5" />}
        title={isFiltered ? "No documents match your search" : "No documents yet"}
        description={
          isFiltered
            ? "Try a different search term"
            : "Upload PDFs, Word docs, or text files to get started"
        }
      />
    );
  }

  return (
    <div
      className={cn(
        viewMode === "grid"
          ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "flex flex-col gap-2",
      )}
    >
      {documents.map((doc, i) => (
        <DocumentCard
          key={doc.id}
          doc={doc}
          viewMode={viewMode}
          onDelete={onDelete}
          style={{ animationDelay: `${i * 0.03}s` }}
        />
      ))}
    </div>
  );
}

interface DocumentCardProps {
  doc: Document;
  viewMode: "grid" | "list";
  onDelete: (id: string) => void;
  style?: React.CSSProperties;
}

function DocumentCard({ doc, viewMode, onDelete, style }: DocumentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    setMenuOpen(false);

    const supabase = createClient();
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", doc.id);

    if (error) {
      toast.error("Failed to delete document");
      setDeleting(false);
      return;
    }

    toast.success("Document deleted");
    onDelete(doc.id);
  };

  if (viewMode === "list") {
    return (
      <div
        className="animate-in flex items-center gap-3 rounded-lg border border-[var(--border)] bg-canvas-50 px-4 py-2.5 transition-all hover:border-[var(--border-hover)] hover:bg-canvas-100"
        style={style}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas-200">
          <FileText className="h-4 w-4 text-ink-muted" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{doc.name}</p>
          <div className="flex items-center gap-2 text-2xs text-ink-faint">
            <span>{getFileTypeLabel(doc.mime_type)}</span>
            <span>·</span>
            <span>{formatBytes(doc.file_size)}</span>
            <span>·</span>
            <span>{formatRelativeDate(doc.created_at)}</span>
          </div>
        </div>
        <StatusBadge status={doc.status} />
        <CardActions doc={doc} onDelete={handleDelete} deleting={deleting} />
      </div>
    );
  }

  return (
    <Card
      hover
      className="animate-in group relative flex flex-col gap-3"
      style={style}
    >
      {/* Icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas-200 transition-colors group-hover:bg-amber/10">
        <FileText className="h-5 w-5 text-ink-muted transition-colors group-hover:text-amber" />
      </div>

      {/* File info */}
      <div className="flex-1">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-ink">
          {doc.name}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-ink-faint">
          <span className="rounded bg-canvas-200 px-1.5 py-0.5">
            {getFileTypeLabel(doc.mime_type)}
          </span>
          <span>{formatBytes(doc.file_size)}</span>
          {doc.page_count && <span>{doc.page_count}p</span>}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <StatusBadge status={doc.status} />
        <div className="flex items-center gap-1 text-2xs text-ink-faint">
          <Clock className="h-2.5 w-2.5" />
          {formatRelativeDate(doc.created_at)}
        </div>
      </div>

      {/* Actions */}
      <div className="absolute right-2 top-2">
        <CardActions doc={doc} onDelete={handleDelete} deleting={deleting} />
      </div>
    </Card>
  );
}

function CardActions({
  doc,
  onDelete,
  deleting,
}: {
  doc: Document;
  onDelete: () => void;
  deleting: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex h-6 w-6 items-center justify-center rounded-md text-ink-faint opacity-0 transition-all group-hover:opacity-100 hover:bg-canvas-200 hover:text-ink-muted"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 w-44 overflow-hidden rounded-xl border border-[var(--border)] bg-canvas-100 shadow-panel">
            {doc.status === "ready" && (
              <Link
                href={`/chat?docId=${doc.id}`}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-muted transition-colors hover:bg-canvas-200 hover:text-ink"
                onClick={() => setOpen(false)}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Chat with document
              </Link>
            )}
            <button
              onClick={() => { setOpen(false); onDelete(); }}
              disabled={deleting}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
