-- =============================================================================
-- DocAI — Development Seed Data
-- Run: supabase db seed  OR  psql -U docai -d docai -f seed.sql
-- WARNING: For local dev only. Never seed production.
-- =============================================================================

-- Create a demo user (Supabase auth — you must sign up via UI first,
-- then update this UUID to match your real user)
-- The trigger in 001_initial.sql creates the profile automatically.

-- If you want to manually insert a demo profile for testing:
-- INSERT INTO public.profiles (id, email, full_name, plan)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   'demo@docai.dev',
--   'Demo User',
--   'free'
-- ) ON CONFLICT DO NOTHING;

-- Sample documents (status = 'ready' for UI testing)
-- Replace user_id with your actual user UUID after signup
/*
INSERT INTO public.documents (id, user_id, name, original_name, file_path, file_size, mime_type, page_count, word_count, status)
VALUES
  (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000001',
    'Product Roadmap Q1 2025',
    'roadmap-q1-2025.pdf',
    'documents/00000000-0000-0000-0000-000000000001/roadmap-q1-2025.pdf',
    245760,
    'application/pdf',
    12,
    4200,
    'ready'
  ),
  (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000001',
    'Engineering Architecture Overview',
    'architecture.md',
    'documents/00000000-0000-0000-0000-000000000001/architecture.md',
    18432,
    'text/markdown',
    NULL,
    2800,
    'ready'
  ),
  (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000001',
    'Investor Deck v3',
    'investor-deck-v3.pdf',
    'documents/00000000-0000-0000-0000-000000000001/investor-deck-v3.pdf',
    3145728,
    'application/pdf',
    24,
    3500,
    'processing'
  );
*/

-- Verify setup
SELECT 'Seed complete. Sign up at /signup to create your first user.' AS message;
