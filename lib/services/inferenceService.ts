import type { LLMMessage, LLMConfig } from "@/types/chat";

// =============================================================================
// Inference Service — Groq API (free tier)
// https://console.groq.com — Free: ~14,400 req/day, very fast
// Models: llama-3.3-70b-versatile | llama-3.1-8b-instant | mixtral-8x7b-32768
// =============================================================================

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export interface GroqCompletionRequest {
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export async function createChatCompletion(
  messages: LLMMessage[],
  config: Partial<LLMConfig> = {},
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model ?? process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      messages,
      temperature: config.temperature ?? 0.3,
      max_tokens: config.maxTokens ?? 1024,
      stream: false,
    } satisfies GroqCompletionRequest),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? "";
}

export async function createStreamingCompletion(
  messages: LLMMessage[],
  config: Partial<LLMConfig> = {},
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model ?? process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      messages,
      temperature: config.temperature ?? 0.3,
      max_tokens: config.maxTokens ?? 1024,
      stream: true,
    } satisfies GroqCompletionRequest),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq streaming error ${response.status}: ${err}`);
  }

  // Return the raw SSE stream — parse in the API route
  return response.body!;
}

/**
 * Auto-generate a chat session title from the first user message.
 * Uses a fast small model for speed.
 */
export async function generateSessionTitle(firstMessage: string): Promise<string> {
  try {
    const title = await createChatCompletion(
      [
        {
          role: "user",
          content: `Generate a short (max 5 words) title for a chat session that starts with this message. Reply with ONLY the title, no quotes, no punctuation at end:\n\n${firstMessage}`,
        },
      ],
      {
        model: "llama-3.1-8b-instant",
        temperature: 0.5,
        maxTokens: 20,
      },
    );
    return title.trim().slice(0, 60);
  } catch {
    return firstMessage.slice(0, 40) + (firstMessage.length > 40 ? "…" : "");
  }
}

export const AVAILABLE_MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", speed: "medium" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (Fast)", speed: "fast" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", speed: "medium" },
] as const;
