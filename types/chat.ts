import type { ChatMessage, ChatSession, MessageRole, Json } from "./database";

export type { ChatMessage, ChatSession, MessageRole };

export interface ChatSource {
  documentId: string;
  documentName: string;
  chunkId: string;
  content: string;
  pageNumber?: number;
  similarity: number;
}

// UIMessage decouples runtime sources (typed array) from DB sources (Json)
export interface UIMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: MessageRole;
  content: string;
  tokens_used: number | null;
  created_at: string;
  // Runtime-only — not the DB Json field
  uiSources?: ChatSource[];
  isStreaming?: boolean;
}

export function dbMessageToUI(msg: ChatMessage): UIMessage {
  let uiSources: ChatSource[] = [];
  try {
    if (Array.isArray(msg.sources)) {
      uiSources = msg.sources as unknown as ChatSource[];
    }
  } catch {
    uiSources = [];
  }
  return {
    id: msg.id,
    session_id: msg.session_id,
    user_id: msg.user_id,
    role: msg.role,
    content: msg.content,
    tokens_used: msg.tokens_used,
    created_at: msg.created_at,
    uiSources,
  };
}

export interface ChatSessionWithLastMessage extends ChatSession {
  lastMessage?: string;
  messageCount?: number;
}

export interface SendMessageRequest {
  sessionId: string;
  content: string;
  documentIds?: string[];
}

export interface CreateSessionRequest {
  title?: string;
  documentIds?: string[];
  model?: string;
}

export interface LLMMessage {
  role: MessageRole;
  content: string;
}

export interface LLMConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export const DEFAULT_SYSTEM_PROMPT = `You are DocAI, an intelligent document assistant.
You help users understand and analyze their documents through conversation.
When answering questions:
1. Base your answers strictly on the provided document context
2. If you can't find relevant information, say so clearly
3. Cite specific parts of documents when relevant
4. Be concise but thorough
5. Format responses with markdown when it improves readability`;
