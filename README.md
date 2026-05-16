# DocAI — Intelligent Document Assistant

> Chat with your documents using AI. Upload PDFs, Word docs, and more — then ask questions in natural language.

**100% free to build, run, and deploy.** No credit card required anywhere in the stack.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│          Next.js 15 App Router · TypeScript · Tailwind          │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────┐
│                    NEXT.JS SERVER (Vercel Free)                  │
│                                                                 │
│  App Router          API Routes          Middleware              │
│  ├── (auth)/         ├── /api/chat       └── Auth session        │
│  │   ├── login       ├── /api/documents      refresh +           │
│  │   └── signup      └── /api/health         route guard         │
│  └── (dashboard)/                                               │
│      ├── documents   Service Layer                              │
│      ├── chat/       ├── documentService.ts                     │
│      │   └── [id]    ├── chatService.ts                         │
│      └── settings    ├── inferenceService.ts  → Groq API        │
│                      └── embeddingService.ts  → HuggingFace     │
└─────────┬───────────────────────────────────────────────────────┘
          │
          ├──── Supabase (free tier) ─────────────────────────────┐
          │     ├── Auth (email/password + magic links)           │
          │     ├── Postgres 15 + pgvector                        │
          │     │   ├── profiles                                  │
          │     │   ├── documents                                 │
          │     │   ├── document_chunks  (+ 384-dim embeddings)   │
          │     │   ├── chat_sessions                             │
          │     │   └── chat_messages                             │
          │     └── Storage (document files)                      │
          │                                                       │
          ├──── Groq API (free tier) ─────────────────────────────┤
          │     └── llama-3.3-70b-versatile / mixtral-8x7b        │
          │         ~14,400 req/day free                          │
          │                                                       │
          └──── HuggingFace Inference (free tier) ────────────────┘
                └── sentence-transformers/all-MiniLM-L6-v2
                    384-dim embeddings · ~1000 req/day free
```

### RAG Pipeline (Phase 2)

```
Upload → Extract Text → Chunk → Embed → Store in pgvector
  │
  └── Query → Embed Query → ANN Search (pgvector) → Inject Context → Groq LLM → Stream Response
```

---

## Free Tier Budget

| Service | Free Allowance | Usage |
|---------|---------------|-------|
| **Vercel** | Hobby — unlimited deployments | App hosting |
| **Supabase** | 500 MB DB · 1 GB storage · 50k MAU | DB + Auth + Files |
| **Groq** | ~14,400 req/day · 6000 tokens/min | LLM inference |
| **HuggingFace** | ~1000 req/day Inference API | Embeddings |
| **GitHub Codespaces** | 60 hrs/month free | Development |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 |
| Database | Supabase Postgres 16 + pgvector |
| Auth | Supabase Auth |
| File Storage | Supabase Storage |
| LLM | Groq (llama-3.3-70b-versatile) |
| Embeddings | HuggingFace Inference API |
| Local Orchestration | Docker Compose |
| CI | GitHub Actions |
| Deployment | Vercel (free tier) |

---

## Folder Structure

```
docai/
├── app/
│   ├── (auth)/              # Login + signup pages
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/         # Protected app pages
│   │   ├── chat/
│   │   │   └── [sessionId]/ # Individual chat session
│   │   ├── documents/       # Document library
│   │   └── settings/
│   ├── api/
│   │   ├── auth/callback/   # Supabase OAuth callback
│   │   ├── chat/            # Chat API (streaming, Phase 2)
│   │   ├── documents/       # Document CRUD API
│   │   └── health/          # Health check
│   ├── globals.css          # Design tokens + base styles
│   └── layout.tsx           # Root layout + fonts
│
├── components/
│   ├── auth/                # Login/signup forms
│   ├── chat/                # Chat UI (interface, messages, input)
│   ├── documents/           # Document grid, upload zone
│   ├── layout/              # Sidebar, TopBar
│   ├── settings/            # Settings view
│   └── ui/                  # Button, Input, Card, Badge, Spinner
│
├── hooks/
│   ├── useAuth.ts           # Auth state + redirect
│   ├── useDocuments.ts      # Document CRUD + realtime
│   └── useChat.ts           # Chat session management
│
├── lib/
│   ├── services/
│   │   ├── chatService.ts       # Session + message DB ops
│   │   ├── documentService.ts   # Document DB ops
│   │   ├── embeddingService.ts  # HuggingFace embeddings
│   │   └── inferenceService.ts  # Groq LLM client
│   ├── supabase/
│   │   ├── client.ts        # Browser client
│   │   └── server.ts        # Server + service-role client
│   └── utils/
│       ├── cn.ts            # Tailwind class merger
│       └── format.ts        # Date, bytes, string utils
│
├── types/
│   ├── chat.ts              # Chat domain types
│   ├── database.ts          # Full DB type definitions
│   └── documents.ts         # Document domain types
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial.sql  # Full schema with RLS + pgvector
│   └── seed.sql             # Dev seed data
│
├── .devcontainer/
│   └── devcontainer.json    # Codespaces config
├── .github/workflows/
│   └── ci.yml               # Lint + typecheck + build
├── docker-compose.yml       # Postgres + Redis + pgAdmin
├── middleware.ts            # Auth guard + session refresh
└── README.md
```

---

## Getting Started in GitHub Codespaces

### 1. Open in Codespaces

```bash
# On GitHub, click Code → Codespaces → New codespace
# OR fork first, then open your fork in Codespaces
```

The devcontainer automatically:
- Installs Node.js 22
- Runs `npm install`
- Copies `.env.example` → `.env.local`

### 2. Start Docker services

```bash
docker compose up -d
```

This starts:
- **Postgres + pgvector** on port 5433
- **Redis** on port 6379

Verify they're healthy:
```bash
docker compose ps
```

### 3. Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com) → New project (free tier)
2. Go to **SQL Editor** → paste and run `supabase/migrations/001_initial.sql`
3. Go to **Storage** → create bucket named `documents` (private)
4. Go to **Project Settings → API** → copy your keys

### 4. Get a Groq API key (free)

1. Sign up at [console.groq.com](https://console.groq.com)
2. Create an API key — **free, no credit card**

### 5. Get a HuggingFace token (free)

1. Sign up at [huggingface.co](https://huggingface.co)
2. Go to Settings → Access Tokens → New token (read)

### 6. Configure environment

Edit `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

GROQ_API_KEY=gsk_your-groq-key
GROQ_MODEL=llama-3.3-70b-versatile

HUGGINGFACE_API_KEY=hf_your-token
HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=DocAI
```

### 7. Run the app

```bash
npm run dev
```

App opens at `http://localhost:3000` (Codespaces auto-forwards port 3000).

### 8. Create your account

Navigate to `/signup` and create an account. Supabase will send a confirmation email — click the link.

---

## Local Development with Docker Postgres (without Supabase cloud)

You can point the app at the local Docker Postgres instead of Supabase cloud for fully offline development:

```bash
# Run Supabase CLI locally (requires Docker)
npx supabase start

# This gives you a local Supabase stack including Auth, Storage, and Postgres
# Copy the printed keys into .env.local
```

---

## Deployment to Vercel (free)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env vars in Vercel dashboard or:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... etc
```

---

## Roadmap

### ✅ Phase 1 — Foundation (this commit)
- [x] Full project scaffold
- [x] Supabase Auth (email/password)
- [x] Dashboard shell with sidebar
- [x] Document library UI
- [x] Upload zone (UI complete)
- [x] Chat session management UI
- [x] Database schema + pgvector + RLS
- [x] Service layers (document, chat, inference, embedding)
- [x] TypeScript types + hooks
- [x] Docker Compose
- [x] Codespaces devcontainer
- [x] CI pipeline

### 🔜 Phase 2 — Document Ingestion
- [ ] PDF text extraction (pdf-parse / pdfjs-dist)
- [ ] Word doc extraction (mammoth)
- [ ] Text chunking with overlap
- [ ] HuggingFace embedding generation
- [ ] pgvector storage + IVFFlat index

### 🔜 Phase 3 — RAG + Chat
- [ ] Query embedding
- [ ] pgvector similarity search (`match_chunks`)
- [ ] Context-augmented Groq prompts
- [ ] Streaming SSE responses
- [ ] Source citations in UI
- [ ] Auto session title generation

### 🔜 Phase 4 — Polish
- [ ] Document preview
- [ ] Supabase Realtime processing status
- [ ] Rate limiting (Redis)
- [ ] Export chat history
- [ ] OAuth (Google, GitHub)

---

## Development Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run type-check   # TypeScript check (no emit)
npm run lint         # ESLint
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier
npm run format:check # Prettier check

# Docker
docker compose up -d           # Start Postgres + Redis
docker compose down            # Stop services
docker compose logs -f db      # Tail DB logs
docker compose --profile tools up  # Also start pgAdmin at :5050

# Supabase (if using local Supabase CLI)
npx supabase start             # Start local Supabase stack
npx supabase stop              # Stop local stack
npx supabase db reset          # Reset + re-run migrations
npm run db:types               # Regenerate TypeScript types from schema
```

---

## Contributing

PRs welcome. Please run `npm run type-check && npm run lint && npm run format:check` before submitting.

---

## License

MIT
