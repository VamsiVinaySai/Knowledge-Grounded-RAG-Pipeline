"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import { getInitials, stringToColor } from "@/lib/utils/format";
import toast from "react-hot-toast";
import type { Profile } from "@/types/database";

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  profile?: Profile | null;
}

export function TopBar({ title, subtitle, actions, profile }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] bg-canvas-50/60 px-5 backdrop-blur-sm">
      <div>
        <h1 className="font-display text-xl leading-none text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {actions}
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}

function UserMenu({ profile }: { profile?: Profile | null }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  };

  const displayName = profile?.full_name ?? profile?.email ?? "User";
  const initials = getInitials(displayName);
  const avatarColor = stringToColor(profile?.email ?? "user");

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 items-center gap-2 rounded-lg px-2 text-sm text-ink-muted transition-colors hover:bg-canvas-200 hover:text-ink"
      >
        {/* Avatar */}
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-2xs font-semibold text-white"
          style={{ background: avatarColor }}
        >
          {initials}
        </span>
        <span className="hidden max-w-[120px] truncate text-xs sm:block">
          {displayName}
        </span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-10 z-20 w-52 overflow-hidden rounded-xl border border-[var(--border)] bg-canvas-100 shadow-panel">
            {/* Profile info */}
            <div className="border-b border-[var(--border)] px-3 py-2.5">
              <p className="text-xs font-medium text-ink">
                {profile?.full_name ?? "User"}
              </p>
              <p className="text-2xs text-ink-muted">{profile?.email}</p>
            </div>

            {/* Menu items */}
            <div className="p-1">
              <MenuItem
                icon={<User className="h-3.5 w-3.5" />}
                label="Profile"
                onClick={() => { setOpen(false); router.push("/settings"); }}
              />
              <MenuItem
                icon={<LogOut className="h-3.5 w-3.5" />}
                label="Sign out"
                onClick={handleSignOut}
                variant="danger"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  variant = "default",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
        variant === "danger"
          ? "text-danger hover:bg-danger/10"
          : "text-ink-muted hover:bg-canvas-200 hover:text-ink",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
