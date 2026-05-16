import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatInterface } from "@/components/chat/ChatInterface";
import type { Profile } from "@/types/database";

interface ChatSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export async function generateMetadata({
  params,
}: ChatSessionPageProps): Promise<Metadata> {
  const { sessionId } = await params;
  const supabase = await createClient();
  const { data: sessionTitle } = await supabase
    .from("chat_sessions")
    .select("title")
    .eq("id", sessionId)
    .single();

  return { title: (sessionTitle as { title?: string } | null)?.title ?? "Chat" };
}

export default async function ChatSessionPage({ params }: ChatSessionPageProps) {
  const { sessionId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sessionData } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!sessionData) notFound();
  const session = sessionData as import("@/types/database").ChatSession;

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch documents scoped to this session (if any)
  const docIds = (session.document_ids ?? null) as string[] | null;
  const { data: scopedDocs } = docIds?.length
    ? await supabase
        .from("documents")
        .select("id, name, status, mime_type, file_size, created_at")
        .in("id", docIds)
    : { data: [] };

  return (
    <ChatInterface
      session={session}
      initialMessages={messages ?? []}
      scopedDocuments={scopedDocs ?? []}
      profile={profile as unknown as Profile}
      userId={user.id}
    />
  );
}
