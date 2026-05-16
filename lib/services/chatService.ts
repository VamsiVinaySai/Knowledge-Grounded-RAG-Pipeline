import { createClient } from "@/lib/supabase/server";
import { asInsert, asUpdate } from "@/lib/supabase/types-helper";
import type {
  ChatSession,
  ChatMessage,
  ChatSessionWithLastMessage,
  CreateSessionRequest,
} from "@/types/chat";

export async function listSessions(
  userId: string,
  limit = 30,
): Promise<ChatSessionWithLastMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to list sessions: ${error.message}`);
  return (data ?? []) as unknown as ChatSessionWithLastMessage[];
}

export async function getSession(
  sessionId: string,
  userId: string,
): Promise<ChatSession | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to get session: ${error.message}`);
  }
  return data as unknown as ChatSession;
}

export async function createSession(
  userId: string,
  req: CreateSessionRequest = {},
): Promise<ChatSession> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert(
      asInsert({
        user_id: userId,
        title: req.title ?? "New Chat",
        document_ids: req.documentIds ?? null,
        model: req.model ?? process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
        metadata: {},
      }),
    )
    .select()
    .single();

  if (error) throw new Error(`Failed to create session: ${error.message}`);
  return data as unknown as ChatSession;
}

export async function updateSessionTitle(
  sessionId: string,
  userId: string,
  title: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("chat_sessions")
    .update(asUpdate({ title }))
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) throw new Error(`Failed to update session title: ${error.message}`);
}

export async function deleteSession(sessionId: string, userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) throw new Error(`Failed to delete session: ${error.message}`);
}

export async function getSessionMessages(
  sessionId: string,
  userId: string,
): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to get messages: ${error.message}`);
  return (data ?? []) as unknown as ChatMessage[];
}

export async function saveMessage(
  sessionId: string,
  userId: string,
  role: "user" | "assistant" | "system",
  content: string,
  sources: unknown[] = [],
  tokensUsed?: number,
): Promise<ChatMessage> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert(
      asInsert({
        session_id: sessionId,
        user_id: userId,
        role,
        content,
        sources,
        tokens_used: tokensUsed ?? null,
      }),
    )
    .select()
    .single();

  if (error) throw new Error(`Failed to save message: ${error.message}`);
  return data as unknown as ChatMessage;
}
