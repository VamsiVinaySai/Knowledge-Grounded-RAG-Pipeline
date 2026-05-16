"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Settings2 } from "lucide-react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { MessageInput } from "@/components/chat/MessageInput";
import { TopBar } from "@/components/layout/TopBar";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { asInsert, asUpdate } from "@/lib/supabase/types-helper";
import type { ChatSession, ChatMessage as DBMessage, Document, Profile } from "@/types/database";
import type { UIMessage } from "@/types/chat";
import { dbMessageToUI } from "@/types/chat";
import toast from "react-hot-toast";

interface ChatInterfaceProps {
  session: ChatSession;
  initialMessages: DBMessage[];
  scopedDocuments: Partial<Document>[];
  profile: Profile;
  userId: string;
}

export function ChatInterface({
  session,
  initialMessages,
  scopedDocuments,
  profile,
  userId,
}: ChatInterfaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<UIMessage[]>(
    initialMessages.map(dbMessageToUI),
  );
  const [sending, setSending] = useState(false);
  const [showDocPanel, setShowDocPanel] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstMessage = initialMessages.length === 0;

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useEffect(() => { scrollToBottom("instant"); }, [scrollToBottom]);
  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const handleSend = async (content: string) => {
    if (!content.trim() || sending) return;
    setSending(true);

    const userMsg: UIMessage = {
      id: `temp-${Date.now()}`,
      session_id: session.id,
      user_id: userId,
      role: "user",
      content,
      tokens_used: null,
      created_at: new Date().toISOString(),
    };

    const assistantMsg: UIMessage = {
      id: `temp-assistant-${Date.now()}`,
      session_id: session.id,
      user_id: userId,
      role: "assistant",
      content: "",
      tokens_used: null,
      created_at: new Date().toISOString(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          content,
          documentIds: session.document_ids,
        }),
      });

      if (!response.ok) throw new Error("Chat request failed");

      const placeholder =
        "**Chat logic arrives in Phase 2.** The foundation is fully wired:\n\n" +
        "- ✅ Session persisted · RLS enforced\n" +
        "- ✅ pgvector schema ready for embeddings\n" +
        "- ✅ Groq inference service scaffolded\n" +
        "- ✅ HuggingFace embedding service scaffolded\n" +
        "- 🔜 RAG retrieval + streaming (Phase 2)\n\n" +
        `Your query: *${content}*`;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: placeholder, isStreaming: false }
            : m,
        ),
      );

      const supabase = createClient();
      await supabase.from("chat_messages").insert(
        asInsert([
          { session_id: session.id, user_id: userId, role: "user", content, sources: [] },
          {
            session_id: session.id,
            user_id: userId,
            role: "assistant",
            content: placeholder,
            sources: [],
          },
        ]),
      );

      if (isFirstMessage) {
        await supabase
          .from("chat_sessions")
          .update(asUpdate({ title: content.slice(0, 60) }))
          .eq("id", session.id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== assistantMsg.id));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <TopBar
        title={session.title}
        subtitle={
          scopedDocuments.length > 0
            ? `${scopedDocuments.length} document${scopedDocuments.length !== 1 ? "s" : ""} in scope`
            : "All documents"
        }
        profile={profile}
        actions={
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push("/chat")}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-canvas-200 hover:text-ink-muted"
              title="All conversations"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            {scopedDocuments.length > 0 && (
              <button
                onClick={() => setShowDocPanel((v) => !v)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                  showDocPanel
                    ? "bg-amber/10 text-amber"
                    : "text-ink-faint hover:bg-canvas-200 hover:text-ink-muted",
                )}
                title="Document scope"
              >
                <FileText className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        }
      />

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {messages.length === 0 ? (
              <EmptyChat />
            ) : (
              <div className="mx-auto flex max-w-2xl flex-col gap-6">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-[var(--border)] bg-canvas-50/60 px-4 py-3 backdrop-blur-sm">
            <div className="mx-auto max-w-2xl">
              <MessageInput onSend={handleSend} disabled={sending} />
              <p className="mt-1.5 text-center text-2xs text-ink-faint">
                Powered by Groq · {session.model}
              </p>
            </div>
          </div>
        </div>

        {showDocPanel && scopedDocuments.length > 0 && (
          <div className="w-60 shrink-0 border-l border-[var(--border)] bg-canvas-50 p-3">
            <p className="mb-2 text-2xs font-semibold uppercase tracking-widest text-ink-faint">
              Scoped Documents
            </p>
            {scopedDocuments.map((doc) => (
              <div
                key={doc.id}
                className="mb-1 flex items-center gap-2 rounded-lg bg-canvas-100 px-2.5 py-2"
              >
                <FileText className="h-3.5 w-3.5 shrink-0 text-amber" />
                <span className="truncate text-xs text-ink-muted">{doc.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyChat() {
  const suggestions = [
    "Summarize the main points",
    "What are the key findings?",
    "Explain this in simple terms",
    "List action items or recommendations",
  ];
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-12">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber/10 ring-1 ring-amber/20">
          <Settings2 className="h-6 w-6 text-amber" />
        </div>
        <h3 className="font-display text-xl text-ink">Ready to chat</h3>
        <p className="mt-1.5 text-sm text-ink-muted">
          Ask a question about your documents.
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {suggestions.map((s) => (
          <div
            key={s}
            className="rounded-xl border border-[var(--border)] bg-canvas-100 px-3 py-2.5 text-xs text-ink-muted"
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
