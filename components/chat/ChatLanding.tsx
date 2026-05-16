"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Plus, FileText, Clock, ChevronRight, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { formatRelativeDate } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/client";
import { asInsert } from "@/lib/supabase/types-helper";
import type { ChatSession, Document } from "@/types/database";
import toast from "react-hot-toast";

interface ChatLandingProps {
  sessions: ChatSession[];
  documents: Partial<Document>[];
  userId: string;
}

export function ChatLanding({ sessions, documents, userId }: ChatLandingProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  const handleNewChat = async () => {
    setCreating(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("chat_sessions")
      .insert(
        asInsert({
          user_id: userId,
          title: "New Chat",
          document_ids: selectedDocs.length > 0 ? selectedDocs : null,
          model: "llama-3.3-70b-versatile",
          metadata: {},
        }),
      )
      .select()
      .single();

    if (error) {
      toast.error("Failed to create chat session");
      setCreating(false);
      return;
    }

    const session = data as unknown as ChatSession;
    router.push(`/chat/${session.id}`);
  };

  const toggleDoc = (docId: string) => {
    setSelectedDocs((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId],
    );
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-5 py-8">
        {/* Hero */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber/10 ring-1 ring-amber/20">
            <Sparkles className="h-6 w-6 text-amber" />
          </div>
          <h2 className="font-display text-2xl text-ink">Chat with your documents</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Select documents to scope the conversation, or leave all selected to search
            across everything.
          </p>
        </div>

        {/* Document scope selector */}
        {documents.length > 0 && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-ink-muted">
                Scope to documents{" "}
                <span className="text-ink-faint">(optional — defaults to all)</span>
              </p>
              {selectedDocs.length > 0 && (
                <button
                  onClick={() => setSelectedDocs([])}
                  className="text-2xs text-amber hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id!)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all duration-150",
                    selectedDocs.includes(doc.id!)
                      ? "border-amber/40 bg-amber/10 text-amber"
                      : "border-[var(--border)] bg-canvas-100 text-ink-muted hover:border-[var(--border-hover)] hover:text-ink",
                  )}
                >
                  <FileText className="h-3 w-3 shrink-0" />
                  <span className="max-w-[160px] truncate">{doc.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {documents.length === 0 && (
          <div className="mb-6 rounded-xl border border-dashed border-[var(--border)] bg-canvas-50 p-4 text-center">
            <p className="text-sm text-ink-muted">
              No ready documents yet.{" "}
              <a href="/documents" className="text-amber hover:underline">
                Upload some
              </a>{" "}
              to enable document-scoped chat.
            </p>
          </div>
        )}

        {/* Start chat button */}
        <Button
          variant="amber"
          size="lg"
          loading={creating}
          onClick={handleNewChat}
          leftIcon={<Plus className="h-4 w-4" />}
          className="w-full"
        >
          {selectedDocs.length > 0
            ? `Start Chat with ${selectedDocs.length} Document${selectedDocs.length !== 1 ? "s" : ""}`
            : "Start New Chat"}
        </Button>

        {/* Recent sessions */}
        {sessions.length > 0 && (
          <div className="mt-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-faint">
              Recent Conversations
            </p>
            <div className="flex flex-col gap-2">
              {sessions.map((session, i) => (
                <Card
                  key={session.id}
                  hover
                  className={cn("animate-in flex cursor-pointer items-center gap-3 p-3")}
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => router.push(`/chat/${session.id}`)}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas-200">
                    <MessageSquare className="h-3.5 w-3.5 text-ink-muted" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{session.title}</p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-2xs text-ink-faint">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{formatRelativeDate(session.updated_at)}</span>
                      {Array.isArray(session.document_ids) &&
                        session.document_ids.length > 0 && (
                          <>
                            <span>·</span>
                            <FileText className="h-2.5 w-2.5" />
                            <span>
                              {session.document_ids.length} doc
                              {session.document_ids.length !== 1 ? "s" : ""}
                            </span>
                          </>
                        )}
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                </Card>
              ))}
            </div>
          </div>
        )}

        {sessions.length === 0 && documents.length > 0 && (
          <div className="mt-8">
            <EmptyState
              icon={<MessageSquare className="h-5 w-5" />}
              title="No conversations yet"
              description="Start a new chat to ask questions about your documents"
            />
          </div>
        )}
      </div>
    </div>
  );
}
