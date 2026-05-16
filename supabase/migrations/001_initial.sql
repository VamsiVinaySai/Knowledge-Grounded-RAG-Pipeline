-- =============================================================================
-- DocAI — Initial Database Schema
-- Migration: 001_initial.sql
-- =============================================================================
-- Stack: Postgres 16 + pgvector
-- Run via: supabase db push  OR  docker-compose (auto-runs on first start)
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- fuzzy text search

-- =============================================================================
-- PROFILES
-- Extends Supabase auth.users with app-specific data
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  full_name    TEXT,
  avatar_url   TEXT,
  plan         TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  storage_used BIGINT NOT NULL DEFAULT 0,          -- bytes consumed
  doc_count    INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- DOCUMENTS
-- Metadata for uploaded files (actual files live in Supabase Storage)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  original_name   TEXT NOT NULL,
  file_path       TEXT NOT NULL,         -- path in Supabase Storage bucket
  file_size       BIGINT NOT NULL,       -- bytes
  mime_type       TEXT NOT NULL,
  page_count      INT,
  word_count      INT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','processing','ready','error')),
  error_message   TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS documents_status_idx ON public.documents(status);
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON public.documents(created_at DESC);
-- Trigram index for fuzzy name search
CREATE INDEX IF NOT EXISTS documents_name_trgm_idx ON public.documents
  USING GIN (name gin_trgm_ops);

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- DOCUMENT CHUNKS
-- Text chunks extracted from documents, with embeddings for RAG
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id   UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  chunk_index   INT NOT NULL,
  content       TEXT NOT NULL,
  token_count   INT,
  page_number   INT,
  -- 384 dimensions for all-MiniLM-L6-v2
  -- 768 dimensions for all-mpnet-base-v2
  -- 1536 dimensions for OpenAI text-embedding-3-small (future upgrade path)
  embedding     vector(384),
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chunks_document_id_idx ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS chunks_user_id_idx ON public.document_chunks(user_id);

-- IVFFlat index for approximate nearest-neighbor search
-- Create AFTER loading data: CREATE INDEX ... (not useful on empty table)
-- Recreate with correct list count: lists = rows / 1000, min 10
-- Example: CREATE INDEX ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- For now create a basic index as placeholder (works, just slower than ivfflat)
-- UNCOMMMENT AFTER FIRST DATA LOAD:
-- CREATE INDEX IF NOT EXISTS chunks_embedding_idx ON public.document_chunks
--   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Full text search on chunk content
CREATE INDEX IF NOT EXISTS chunks_content_fts_idx ON public.document_chunks
  USING GIN (to_tsvector('english', content));

-- =============================================================================
-- CHAT SESSIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'New Chat',
  -- Optional: scope chat to specific documents (NULL = all user docs)
  document_ids UUID[] DEFAULT NULL,
  model       TEXT NOT NULL DEFAULT 'llama-3.3-70b-versatile',
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_updated_at_idx ON public.chat_sessions(updated_at DESC);

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- CHAT MESSAGES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content     TEXT NOT NULL,
  -- Source chunks cited in this response (for citations UI)
  sources     JSONB DEFAULT '[]',
  tokens_used INT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_session_id_idx ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.chat_messages(created_at);

-- =============================================================================
-- DOCUMENT <-> CHAT SESSION JUNCTION
-- Track which documents are referenced per session
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.session_documents (
  session_id  UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (session_id, document_id)
);

-- =============================================================================
-- RAG SIMILARITY SEARCH FUNCTION
-- Call this from your API route to find relevant chunks
-- =============================================================================
CREATE OR REPLACE FUNCTION public.match_chunks(
  query_embedding  vector(384),
  match_threshold  FLOAT DEFAULT 0.7,
  match_count      INT DEFAULT 5,
  filter_user_id   UUID DEFAULT NULL,
  filter_doc_ids   UUID[] DEFAULT NULL
)
RETURNS TABLE (
  id            UUID,
  document_id   UUID,
  chunk_index   INT,
  content       TEXT,
  page_number   INT,
  metadata      JSONB,
  similarity    FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.chunk_index,
    dc.content,
    dc.page_number,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM public.document_chunks dc
  WHERE
    -- Cosine similarity threshold
    1 - (dc.embedding <=> query_embedding) > match_threshold
    -- Optional user filter (RLS handles this too, but explicit is faster)
    AND (filter_user_id IS NULL OR dc.user_id = filter_user_id)
    -- Optional document filter
    AND (filter_doc_ids IS NULL OR dc.document_id = ANY(filter_doc_ids))
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only access their own data
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_documents ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- DOCUMENTS
CREATE POLICY "Users can view own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON public.documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id);

-- DOCUMENT CHUNKS
CREATE POLICY "Users can view own chunks"
  ON public.document_chunks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert chunks"
  ON public.document_chunks FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- CHAT SESSIONS
CREATE POLICY "Users can CRUD own sessions"
  ON public.chat_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CHAT MESSAGES
CREATE POLICY "Users can CRUD own messages"
  ON public.chat_messages FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SESSION DOCUMENTS
CREATE POLICY "Users can manage session documents"
  ON public.session_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = session_id AND cs.user_id = auth.uid()
    )
  );

-- =============================================================================
-- STORAGE BUCKETS
-- Run these in Supabase Dashboard → Storage (SQL editor can't create buckets)
-- Or use: supabase storage create-bucket documents --public false
-- =============================================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
--
-- CREATE POLICY "Authenticated users can upload"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
--
-- CREATE POLICY "Users can access own files"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Users can delete own files"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
