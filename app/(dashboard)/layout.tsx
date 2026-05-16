import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch recent chat sessions for sidebar
  const { data: recentSessions } = await supabase
    .from("chat_sessions")
    .select("id, title, updated_at, model, metadata, created_at, document_ids, user_id")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(8);

  return (
    <div className="app-shell">
      <Sidebar recentSessions={recentSessions ?? []} />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}
