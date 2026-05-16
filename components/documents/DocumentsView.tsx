"use client";

import { useState } from "react";
import { Search, Upload, Grid, List } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DocumentGrid } from "@/components/documents/DocumentGrid";
import { UploadZone } from "@/components/documents/UploadZone";
import type { Document } from "@/types/database";

interface DocumentsViewProps {
  initialDocuments: Document[];
  totalCount: number;
  userId: string;
}

export function DocumentsView({ initialDocuments, totalCount, userId }: DocumentsViewProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showUpload, setShowUpload] = useState(false);

  const filtered = documents.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleUploadComplete = (newDoc: Document) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setShowUpload(false);
  };

  const handleDelete = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[var(--border)] px-5 py-3">
        <Input
          placeholder="Search documents…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-3.5 w-3.5" />}
          wrapperClassName="flex-1 max-w-sm"
        />

        <div className="ml-auto flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-lg border border-[var(--border)] p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-canvas-200 text-ink"
                  : "text-ink-faint hover:text-ink-muted"
              }`}
            >
              <Grid className="h-3 w-3" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-canvas-200 text-ink"
                  : "text-ink-faint hover:text-ink-muted"
              }`}
            >
              <List className="h-3 w-3" />
            </button>
          </div>

          <Button
            variant="amber"
            size="sm"
            leftIcon={<Upload className="h-3 w-3" />}
            onClick={() => setShowUpload(true)}
          >
            Upload
          </Button>
        </div>
      </div>

      {/* Upload zone drawer */}
      {showUpload && (
        <div className="shrink-0 border-b border-[var(--border)] bg-canvas-50/60 p-5">
          <UploadZone
            userId={userId}
            onUploadComplete={handleUploadComplete}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      )}

      {/* Document grid/list */}
      <div className="flex-1 overflow-y-auto p-5">
        <DocumentGrid
          documents={filtered}
          viewMode={viewMode}
          onDelete={handleDelete}
          totalCount={totalCount}
          isFiltered={search.length > 0}
        />
      </div>
    </div>
  );
}
