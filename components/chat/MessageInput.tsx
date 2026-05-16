"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Mic } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = "Ask a question about your documents…",
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div
      className={cn(
        "flex items-end gap-2 rounded-xl border bg-canvas-100 px-3 py-2 transition-all duration-150",
        disabled
          ? "border-[var(--border)] opacity-60"
          : "border-[var(--border)] hover:border-[var(--border-hover)] focus-within:border-amber/40 focus-within:ring-2 focus-within:ring-amber/10",
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        className={cn(
          "flex-1 resize-none bg-transparent py-0.5 text-sm text-ink placeholder:text-ink-faint",
          "focus:outline-none disabled:cursor-not-allowed",
          "scrollbar-none",
        )}
        style={{ maxHeight: "180px" }}
      />

      <div className="flex shrink-0 items-center gap-1 pb-0.5">
        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150",
            canSend
              ? "bg-amber text-canvas hover:bg-amber-light active:bg-amber-dark"
              : "bg-canvas-300 text-ink-faint",
          )}
          title="Send (Enter)"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
