import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/TopBar";
import { DocumentsView } from "@/components/documents/DocumentsView";
import type { Profile } from "@/types/database";

export const metadata: Metadata = { title: "Documents" };

export default async function DocumentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const { data: documents, count } = await supabase
    .from("documents")
    .select("*", { count: "exact" })
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <>
      <TopBar
        title="Documents"
        subtitle={`${count ?? 0} document${count !== 1 ? "s" : ""}`}
        profile={profile as unknown as Profile}
      />
      <DocumentsView
        initialDocuments={documents ?? []}
        totalCount={count ?? 0}
        userId={user!.id}
      />
    </>
  );
}
