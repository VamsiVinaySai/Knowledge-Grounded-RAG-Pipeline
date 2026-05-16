"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Document } from "@/types/database";
import type { DocumentFilter } from "@/types/documents";
import toast from "react-hot-toast";

interface UseDocumentsOptions {
  userId: string;
  initialDocuments?: Document[];
  filter?: DocumentFilter;
}

interface UseDocumentsReturn {
  documents: Document[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  refetch: () => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  loadMore: () => Promise<void>;
}

const PAGE_SIZE = 20;

export function useDocuments({
  userId,
  initialDocuments = [],
  filter = {},
}: UseDocumentsOptions): UseDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(initialDocuments.length);
  const [page, setPage] = useState(1);

  const fetchDocuments = useCallback(
    async (pageNum = 1, replace = true) => {
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        let query = supabase
          .from("documents")
          .select("*", { count: "exact" })
          .eq("user_id", userId);

        if (filter.status) query = query.eq("status", filter.status);
        if (filter.search) query = query.ilike("name", `%${filter.search}%`);

        const sortBy = filter.sortBy ?? "created_at";
        const ascending = filter.sortDir === "asc";
        query = query.order(sortBy, { ascending });

        const from = (pageNum - 1) * PAGE_SIZE;
        query = query.range(from, from + PAGE_SIZE - 1);

        const { data, error: queryError, count } = await query;

        if (queryError) throw new Error(queryError.message);

        setTotalCount(count ?? 0);
        setDocuments((prev) =>
          replace ? (data as Document[]) : [...prev, ...(data as Document[])],
        );
        setPage(pageNum);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load documents";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [userId, filter.status, filter.search, filter.sortBy, filter.sortDir],
  );

  // Subscribe to realtime document status changes
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("documents-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "documents",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === payload.new.id ? (payload.new as Document) : doc,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const deleteDocument = useCallback(
    async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        toast.error("Failed to delete document");
        return;
      }

      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setTotalCount((prev) => prev - 1);
      toast.success("Document deleted");
    },
    [userId],
  );

  const loadMore = useCallback(async () => {
    if (loading) return;
    await fetchDocuments(page + 1, false);
  }, [fetchDocuments, loading, page]);

  const refetch = useCallback(() => fetchDocuments(1, true), [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    totalCount,
    hasMore: documents.length < totalCount,
    refetch,
    deleteDocument,
    loadMore,
  };
}
