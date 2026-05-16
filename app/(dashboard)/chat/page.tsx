import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/TopBar";
import { ChatLanding } from "@/components/chat/ChatLanding";
import type { Profile } from "@/types/database";

export const metadata: Metadata = { title: "Chat" };

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: sessions } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(20);

  const { data: documents } = await supabase
    .from("documents")
    .select("id, name, status, mime_type, file_size, created_at")
    .eq("user_id", user.id)
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <>
      <TopBar
        title="Chat"
        subtitle="Ask questions across your documents"
        profile={profile as unknown as Profile}
      />
      <ChatLanding
        sessions={sessions ?? []}
        documents={documents ?? []}
        userId={user.id}
      />
    </>
  );
}
