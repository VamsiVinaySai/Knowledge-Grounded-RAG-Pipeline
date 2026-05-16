"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen, ChevronDown, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatRelativeDate } from "@/lib/utils/format";
import type { UIMessage, ChatSource } from "@/types/chat";

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const isUser = message.role === "user";
  const sources: ChatSource[] = message.uiSources ?? [];

  if (isUser) {
    return (
      <div className="animate-in flex items-start gap-3">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-canvas-300">
          <User className="h-3 w-3 text-ink-muted" />
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-canvas-200 px-4 py-2.5">
          <p className="text-sm text-ink">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in flex items-start gap-3">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber/10 ring-1 ring-amber/20">
        {message.isStreaming && !message.content ? (
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber/80" />
        ) : (
          <Bot className="h-3 w-3 text-amber" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        {message.isStreaming && !message.content ? (
          <div className="flex items-center gap-1 py-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-amber/60"
                style={{ animation: "typing 1.2s steps(3) infinite", animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        ) : (
          <div className="prose-chat">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            {message.isStreaming && (
              <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse rounded-full bg-amber/70" />
            )}
          </div>
        )}

        {sources.length > 0 && !message.isStreaming && (
          <div className="mt-3">
            <button
              onClick={() => setSourcesOpen((v) => !v)}
              className="flex items-center gap-1.5 text-2xs text-ink-faint transition-colors hover:text-ink-muted"
            >
              <BookOpen className="h-3 w-3" />
              <span>{sources.length} source{sources.length !== 1 ? "s" : ""}</span>
              <ChevronDown className={cn("h-3 w-3 transition-transform", sourcesOpen && "rotate-180")} />
            </button>
            {sourcesOpen && (
              <div className="mt-2 flex flex-col gap-2">
                {sources.map((src, i) => (
                  <div key={src.chunkId ?? i} className="rounded-lg border border-[var(--border)] bg-canvas-100 px-3 py-2">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="truncate text-2xs font-medium text-ink-muted">
                        {src.documentName}{src.pageNumber ? ` · p.${src.pageNumber}` : ""}
                      </p>
                      <span className="shrink-0 text-2xs text-amber">
                        {Math.round(src.similarity * 100)}% match
                      </span>
                    </div>
                    <p className="line-clamp-3 text-2xs leading-relaxed text-ink-faint">{src.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!message.isStreaming && (
          <p className="mt-2 text-2xs text-ink-faint">
            {formatRelativeDate(message.created_at)}
            {message.tokens_used ? ` · ${message.tokens_used} tokens` : ""}
          </p>
        )}
      </div>
    </div>
  );
}
