import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/TopBar";
import { SettingsView } from "@/components/settings/SettingsView";
import type { Profile } from "@/types/database";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
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

  return (
    <>
      <TopBar title="Settings" profile={profile as unknown as Profile} />
      <SettingsView profile={profile as unknown as Profile} />
    </>
  );
}
