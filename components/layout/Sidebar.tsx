"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  MessageSquare,
  Settings,
  Plus,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ChatSessionWithLastMessage } from "@/types/chat";
import { truncate } from "@/lib/utils/format";

const NAV_ITEMS = [
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  recentSessions?: ChatSessionWithLastMessage[];
}

export function Sidebar({ recentSessions = [] }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[var(--border)] px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber/10 ring-1 ring-amber/20">
          <FileText className="h-3.5 w-3.5 text-amber" />
        </div>
        <span className="font-display text-lg tracking-tight text-ink">DocAI</span>
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-0.5 p-2 pt-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-all duration-150",
                active
                  ? "bg-canvas-200 text-ink"
                  : "text-ink-muted hover:bg-canvas-100 hover:text-ink",
              )}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-colors",
                  active ? "text-amber" : "text-ink-faint group-hover:text-ink-muted",
                )}
              />
              {label}
              {active && (
                <ChevronRight className="ml-auto h-3 w-3 shrink-0 text-ink-faint" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Recent chats */}
      {recentSessions.length > 0 && (
        <>
          <div className="mx-2 my-2 border-t border-[var(--border)]" />
          <div className="flex items-center justify-between px-4 pb-1">
            <span className="text-2xs font-semibold uppercase tracking-widest text-ink-faint">
              Recent Chats
            </span>
            <Link
              href="/chat"
              className="flex h-5 w-5 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-canvas-200 hover:text-ink-muted"
            >
              <Plus className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-0.5 overflow-y-auto px-2 pb-2">
            {recentSessions.slice(0, 8).map((session) => {
              const active = pathname === `/chat/${session.id}`;
              return (
                <Link
                  key={session.id}
                  href={`/chat/${session.id}`}
                  className={cn(
                    "group flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs transition-all duration-150",
                    active
                      ? "bg-canvas-200 text-ink"
                      : "text-ink-muted hover:bg-canvas-100 hover:text-ink",
                  )}
                >
                  <MessageSquare className="h-3 w-3 shrink-0 text-ink-faint" />
                  <span className="truncate">
                    {truncate(session.title, 26)}
                  </span>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Storage bar */}
      <StorageFooter />
    </aside>
  );
}

function StorageFooter() {
  const used = 24 * 1024 * 1024; // placeholder
  const max = 100 * 1024 * 1024;
  const pct = Math.round((used / max) * 100);

  return (
    <div className="border-t border-[var(--border)] p-3">
      <div className="flex items-center justify-between text-2xs text-ink-faint">
        <span>Storage</span>
        <span>{pct}% used</span>
      </div>
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-canvas-300">
        <div
          className="h-full rounded-full bg-amber/60 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-2xs text-ink-faint">
        24 MB / 100 MB free tier
      </p>
    </div>
  );
}
