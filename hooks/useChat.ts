"use client";

import { useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { asInsert } from "@/lib/supabase/types-helper";
import type { ChatSession, ChatMessage } from "@/types/database";
import type { UIMessage } from "@/types/chat";
import { dbMessageToUI } from "@/types/chat";
import toast from "react-hot-toast";

interface UseChatOptions {
  sessionId: string;
  userId: string;
  initialMessages?: ChatMessage[];
}

interface UseChatReturn {
  messages: UIMessage[];
  sending: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
}

export function useChat({
  sessionId,
  userId,
  initialMessages = [],
}: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<UIMessage[]>(
    initialMessages.map(dbMessageToUI),
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || sending) return;
      setSending(true);
      setError(null);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const userMsg: UIMessage = {
        id: `temp-user-${Date.now()}`,
        session_id: sessionId,
        user_id: userId,
        role: "user",
        content,
        tokens_used: null,
        created_at: new Date().toISOString(),
      };

      const assistantPlaceholder: UIMessage = {
        id: `temp-assistant-${Date.now()}`,
        session_id: sessionId,
        user_id: userId,
        role: "assistant",
        content: "",
        tokens_used: null,
        created_at: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, content }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const assistantContent = data.message ?? "Chat implementation arriving in Phase 2.";

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantPlaceholder.id
              ? { ...m, content: assistantContent, isStreaming: false }
              : m,
          ),
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Failed to send message";
        setError(msg);
        toast.error(msg);
        setMessages((prev) => prev.filter((m) => m.id !== assistantPlaceholder.id));
      } finally {
        setSending(false);
      }
    },
    [sessionId, userId, sending],
  );

  const clearError = useCallback(() => setError(null), []);
  return { messages, sending, error, sendMessage, clearError };
}

export async function createSession(
  userId: string,
  documentIds?: string[],
): Promise<ChatSession | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert(
      asInsert({
        user_id: userId,
        title: "New Chat",
        document_ids: documentIds ?? null,
        model: "llama-3.3-70b-versatile",
        metadata: {},
      }),
    )
    .select()
    .single();

  if (error) {
    toast.error("Failed to create session");
    return null;
  }
  return data as unknown as ChatSession;
}

export async function deleteSession(
  sessionId: string,
  userId: string,
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) {
    toast.error("Failed to delete session");
    return false;
  }
  return true;
}
