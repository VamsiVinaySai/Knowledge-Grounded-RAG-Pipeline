import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listDocuments } from "@/lib/services/documentService";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  try {
    const result = await listDocuments(user.id, {
      page,
      limit,
      search,
      status: status as never,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Document list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}

// POST /api/documents — handled via upload flow (Supabase Storage direct upload)
// See: lib/services/documentService.ts createDocument()
// Full ingestion pipeline will be implemented in Phase 2
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: "Direct upload not yet implemented. Use Supabase Storage." },
    { status: 501 },
  );
}
