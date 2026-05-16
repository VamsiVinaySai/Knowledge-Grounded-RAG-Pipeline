import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// =============================================================================
// Chat API — /api/chat
// Streaming chat endpoint (Phase 2: add RAG retrieval + Groq streaming)
// =============================================================================

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId, content, documentIds } = body;

    if (!sessionId || !content) {
      return NextResponse.json(
        { error: "sessionId and content are required" },
        { status: 400 },
      );
    }

    // TODO (Phase 2):
    // 1. Embed the user query (embeddingService.embedText)
    // 2. Retrieve relevant chunks (supabase.rpc('match_chunks', ...))
    // 3. Build context-augmented prompt
    // 4. Stream Groq completion (inferenceService.createStreamingCompletion)
    // 5. Save messages to DB (chatService.saveMessage)

    // Placeholder response for Phase 1
    return NextResponse.json({
      message: "Chat implementation coming in Phase 2. Foundation is ready.",
      sessionId,
      documentIds,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
