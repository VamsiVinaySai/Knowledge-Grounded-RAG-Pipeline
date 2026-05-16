import { createClient } from "@/lib/supabase/server";
import { asInsert, asUpdate } from "@/lib/supabase/types-helper";
import type { Document, DocumentFilter, DocumentListResponse } from "@/types/documents";
import type { DocumentStatus } from "@/types/database";

export async function listDocuments(
  userId: string,
  filter: DocumentFilter = {},
): Promise<DocumentListResponse> {
  const supabase = await createClient();
  const {
    status, search, sortBy = "created_at", sortDir = "desc", page = 1, limit = 20,
  } = filter;

  let query = supabase
    .from("documents")
    .select("*", { count: "exact" })
    .eq("user_id", userId);

  if (status) query = query.eq("status", status as string);
  if (search) query = query.ilike("name", `%${search}%`);
  query = query.order(sortBy as "created_at" | "name" | "file_size", {
    ascending: sortDir === "asc",
  });

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to list documents: ${error.message}`);

  const total = count ?? 0;
  return {
    documents: (data ?? []) as unknown as Document[],
    total, page, limit,
    hasMore: from + (data?.length ?? 0) < total,
  };
}

export async function getDocument(
  documentId: string,
  userId: string,
): Promise<Document | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to get document: ${error.message}`);
  }
  return data as unknown as Document;
}

export async function createDocument(
  userId: string,
  payload: {
    name: string;
    original_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
  },
): Promise<Document> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .insert(asInsert({ user_id: userId, status: "pending" as DocumentStatus, ...payload }))
    .select()
    .single();

  if (error) throw new Error(`Failed to create document: ${error.message}`);
  return data as unknown as Document;
}

export async function updateDocumentStatus(
  documentId: string,
  status: DocumentStatus,
  errorMessage?: string,
): Promise<void> {
  const supabase = await createClient();
  const patch: Record<string, unknown> = { status };
  if (errorMessage) patch.error_message = errorMessage;
  const { error } = await supabase
    .from("documents")
    .update(asUpdate(patch))
    .eq("id", documentId);
  if (error) throw new Error(`Failed to update document status: ${error.message}`);
}

export async function deleteDocument(documentId: string, userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("user_id", userId);
  if (error) throw new Error(`Failed to delete document: ${error.message}`);
}

export async function getStorageStats(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("storage_used, doc_count, plan")
    .eq("id", userId)
    .single();

  if (error) throw new Error(`Failed to get storage stats: ${error.message}`);

  const profile = data as unknown as { storage_used: number; doc_count: number; plan: string };
  const MAX_STORAGE: Record<string, number> = {
    free: 100 * 1024 * 1024,
    pro: 5 * 1024 * 1024 * 1024,
    team: 50 * 1024 * 1024 * 1024,
  };
  return {
    storageUsed: profile.storage_used,
    storageMax: MAX_STORAGE[profile.plan] ?? MAX_STORAGE.free,
    docCount: profile.doc_count,
    plan: profile.plan,
  };
}
