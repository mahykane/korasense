# Opsense Knowledge App

An intelligent, multimodal knowledge management platform that allows employees to ingest any type of data and ask complex questions to unified company knowledge. Built with Next.js 14+, TypeScript, Prisma, Qdrant, and Gemini AI.

## 🚀 Features

- **Unified Knowledge Base**: Ingest documents, PDFs, Word files, text, and more into a centralized knowledge repository
- **Web & Desktop Upload**: Upload documents directly from browser or use the desktop app for automated folder watching
- **Intelligent Q&A**: Ask complex questions and get AI-powered answers with source citations and confidence scores
- **Multi-Agent Reasoning**: Decompose complex queries with gatekeeper, planner, retriever, analyst, and synthesizer agents
- **Local Embeddings**: Fast, cost-effective semantic search using local transformer models (384-dim all-MiniLM-L6-v2)
- **Quality Metrics**: Track answer quality, latency, and user feedback with comprehensive evaluation dashboards
- **External API**: REST API for external integrations and programmatic access
- **Demo Mode**: Public read-only demo with pre-loaded company knowledge

## 📋 Tech Stack

### Core
- **Framework**: Next.js 14+ (App Router, TypeScript, React 18)
- **Auth**: Clerk
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Vector DB**: Qdrant Cloud
- **AI**: Google Gemini (chat, embeddings, multimodal)
- **Deployment**: Vercel

### Edge Clients
- **Rust Senses**: Lightweight folder watchers for automatic document ingestion

## 🏗️ Project Structure

```
opsense/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (protected)/         # Authenticated routes
│   │   │   ├── dashboard/
│   │   │   ├── knowledge/
│   │   │   ├── risk/
│   │   │   └── eval/
│   │   ├── api/                 # API routes
│   │   │   ├── ingest/
│   │   │   ├── agent/run/
│   │   │   ├── risk/assess/
│   │   │   ├── external/
│   │   │   └── feedback/
│   │   ├── demo/                # Public demo
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/              # React components
│   │   ├── navigation/
│   │   ├── knowledge/
│   │   ├── risk/
│   │   ├── eval/
│   │   └── demo/
│   └── lib/                     # Core libraries
│       ├── db.ts               # Prisma client
│       ├── qdrant.ts           # Vector DB client
│       ├── gemini.ts           # AI functions
│       ├── chunking.ts         # Document chunking
│       ├── agent_pipeline.ts   # Agentic reasoning
│       ├── metrics.ts          # Performance tracking
│       └── auth.ts             # Authentication helpers
├── prisma/
│   └── schema.prisma           # Database schema
├── senses/
│   └── filesense/              # Rust folder watcher
│       ├── src/main.rs
│       └── Cargo.toml
└── ...
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Qdrant Cloud account
- Google Gemini API key
- Clerk account
- Rust (for Senses)

### 1. Clone and Install

```bash
cd /Users/mahykane/Projects/OPSENSE
npm install
```

### 2. Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/opsense"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Qdrant Vector Database
QDRANT_URL=https://xxx.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key
QDRANT_COLLECTION_NAME=opsense_chunks

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# External API
EXTERNAL_API_SECRET=your-external-api-secret

# Demo Tenant
DEMO_TENANT_SLUG=demo-tenant

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### 4. Development

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🤖 Agentic Pipeline

The system uses a multi-step reasoning pipeline:

1. **Gatekeeper**: Safety and clarity check
2. **Planner**: Decide search strategy and document types
3. **Retriever**: Vector search in Qdrant
4. **Analyst**: Synthesize answer from evidence
5. **Auditor**: Verify quality and coverage
6. **Writer**: Generate final polished answer

Each step is traced and displayed to users for full transparency.

## 📊 Data Model

### Core Tables
- **Tenant**: Multi-tenancy support
- **User**: User accounts (synced with Clerk)
- **TenantMember**: User-tenant relationships with roles
- **ExternalApiKey**: API keys for external integrations

### Documents
- **Document**: Document metadata
- **DocumentChunk**: Text chunks with embeddings in Qdrant

### Q&A
- **QaSession**: Question-answer sessions with traces
- **QaMetrics**: Performance metrics (latency, retrieval stats)
- **QaFeedback**: User feedback (helpful/unhelpful)

### Risk
- **RiskAssessment**: Structured risk registers
- **Playbook**: Reusable risk mitigation patterns

## 🦀 Rust Senses

FileSense watches folders and auto-ingests documents.

### Build

```bash
cd senses/filesense
cargo build --release
```

### Configure

Create `~/.opsense_filesense.toml`:

```toml
tenant_slug = "your-tenant-slug"
api_key = "your-api-key"
backend_url = "http://localhost:3000"

folders = [
    "/path/to/policies",
    "/path/to/incidents",
]
```

### Run

```bash
# Watch continuously
./target/release/filesense run

# Scan once
./target/release/filesense once
```

## 🌐 API Endpoints

### Internal APIs (Authenticated)

- `POST /api/ingest` - Ingest documents
- `POST /api/agent/run` - Run Q&A pipeline
- `POST /api/risk/assess` - Generate risk assessment
- `POST /api/feedback` - Submit feedback

### External APIs (API Key)

- `POST /api/external/query` - Query knowledge base
- `POST /api/external/risk` - Create risk assessment
- `GET /api/external/risk/[id]` - Get risk assessment

Headers: `x-api-key: your-api-key`

## 🚀 Deployment

### Vercel

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

### Database Migrations

```bash
# In Vercel, add build command:
npm run build

# Or run manually:
npx prisma migrate deploy
```

### Seed Demo Data

Create a script to seed demo tenant and documents:

```typescript
// scripts/seed-demo.ts
import { prisma } from '../src/lib/db';
// ... create demo tenant, documents, and embeddings
```

## 📈 Evaluation Dashboard

Track:
- Average quality scores
- Latency over time
- Helpful vs unhelpful feedback
- Quality distribution charts
- Recent Q&A sessions

## 🔒 Security

- Clerk authentication for users
- API key authentication for external access
- Tenant isolation in database and vector store
- Environment-based secrets
- HTTPS only in production

## 🤝 Contributing

This is an MVP. Future enhancements:
- Multi-file upload UI
- Advanced chunking strategies
- Multimodal support (images, PDFs)
- Real-time streaming responses
- Enhanced risk playbooks
- Slack/Teams integration

## 📄 License

ISC

## 🙋 Support

For issues or questions, open a GitHub issue or contact support.

---

Built with ❤️ using Next.js, Gemini, and Qdrant
