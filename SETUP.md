# Opsense Risk Copilot - Setup Guide

## ✅ Project Created Successfully!

The complete Opsense Risk Copilot MVP has been scaffolded and is ready for development.

## 📁 What Was Created

### Backend
- ✅ Next.js 14+ with App Router and TypeScript
- ✅ Prisma ORM with complete schema (11 models)
- ✅ Qdrant vector database client
- ✅ Google Gemini AI integration
- ✅ Complete agentic pipeline (gatekeeper, planner, retriever, analyst, auditor, writer)
- ✅ All API routes (ingest, agent/run, risk/assess, external APIs, feedback)
- ✅ Clerk authentication integration
- ✅ Metrics and monitoring utilities

### Frontend
- ✅ Landing page with sign-in/sign-up
- ✅ Protected dashboard
- ✅ Knowledge base page with document list
- ✅ Risk copilot console with agent timeline
- ✅ Evaluation dashboard with metrics
- ✅ Demo mode for public access
- ✅ Responsive navigation and layouts
- ✅ Tailwind CSS styling

### Rust Senses
- ✅ FileSense Rust application for folder watching
- ✅ Automatic document ingestion
- ✅ Configuration file support

### Documentation
- ✅ Comprehensive README.md
- ✅ Environment variable examples
- ✅ API documentation
- ✅ Architecture overview

## 🚀 Next Steps

### 1. Set Up Services

You need to create accounts and get API keys for:

1. **Clerk** (Authentication)
   - Go to https://dashboard.clerk.com
   - Create a new application
   - Get your publishable key and secret key

2. **Qdrant Cloud** (Vector Database)
   - Go to https://cloud.qdrant.io
   - Create a cluster
   - Get your cluster URL and API key

3. **Google Gemini** (AI)
   - Go to https://makersuite.google.com/app/apikey
   - Create an API key

4. **PostgreSQL Database**
   - Use Neon (https://neon.tech) or Supabase (https://supabase.com)
   - Or run PostgreSQL locally

### 2. Configure Environment Variables

Update `.env.local` with your real credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/opsense"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_real_key
CLERK_SECRET_KEY=sk_test_your_real_key

# Qdrant
QDRANT_URL=https://your-cluster.cloud.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_COLLECTION_NAME=opsense_chunks

# Gemini
GEMINI_API_KEY=your_gemini_api_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Initialize Database

```bash
# Generate Prisma client
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate

# Open Prisma Studio to view data (optional)
npm run prisma:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 5. Build Rust Senses (Optional)

```bash
cd senses/filesense
cargo build --release

# Configure
cp config.example.toml ~/.opsense_filesense.toml
# Edit ~/.opsense_filesense.toml with your settings

# Run
./target/release/filesense run
```

## 📊 Project Structure

```
opsense/
├── src/
│   ├── app/                    # Next.js routes
│   │   ├── (protected)/       # Auth-required pages
│   │   ├── api/               # API endpoints
│   │   └── demo/              # Public demo
│   ├── components/            # React components
│   └── lib/                   # Core libraries
├── prisma/
│   └── schema.prisma          # Database schema
├── senses/
│   └── filesense/             # Rust folder watcher
├── .env.local                 # Environment variables
└── README.md                  # Full documentation
```

## 🔧 Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Prisma commands
npm run prisma:generate   # Generate client
npm run prisma:migrate    # Create migration
npm run prisma:studio     # Open database GUI
npm run prisma:deploy     # Deploy migrations (prod)

# Linting
npm run lint
```

## 🧪 Testing the System

1. **Sign up** for an account
2. Upload documents via **Knowledge** page or use Rust Senses
3. Go to **Risk Copilot** and ask questions like:
   - "What are our data residency requirements?"
   - "Summarize recent security incidents"
   - "Assess risks in our cloud infrastructure"
4. View metrics in **Evaluation** dashboard
5. Check **Demo** mode for public access

## 🔐 Security Notes

- Never commit `.env.local` or real credentials
- Use `.env.example` as a template
- Rotate API keys regularly
- Enable HTTPS in production
- Follow Clerk best practices for authentication

## 📈 Known Limitations (MVP)

- Build requires valid Clerk keys (no offline development yet)
- Manual document upload UI not yet implemented (use Senses or API)
- Basic error handling (needs improvement)
- No real-time streaming (planned for v2)
- Limited multimodal support (text only for MVP)

## 🆘 Troubleshooting

### Build fails with Clerk errors
- Ensure you have valid Clerk keys in `.env.local`
- Check that keys start with `pk_test_` and `sk_test_`

### Prisma errors
- Make sure `DATABASE_URL` is correct
- Run `npm run prisma:generate` after schema changes
- Check database is running

### Qdrant connection issues
- Verify `QDRANT_URL` and `QDRANT_API_KEY`
- Check Qdrant cluster is running
- Test API key with curl

### TypeScript errors
- Run `npm install` to ensure all deps are installed
- Check `tsconfig.json` settings
- Some type errors are expected without real API keys

## 🚀 Deployment to Vercel

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically:
- Run Prisma migrations
- Build the Next.js app
- Deploy to production

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Qdrant Documentation](https://qdrant.tech/documentation)
- [Gemini API Documentation](https://ai.google.dev/docs)

## 🤝 Contributing

This is an MVP. Future enhancements:
- Multi-file upload UI
- Advanced chunking strategies
- Real-time streaming responses
- Enhanced visualizations
- Slack/Teams integration
- Mobile app

---

**You're all set!** 🎉

Follow the steps above to configure your services and start developing.

For questions or issues, refer to the main README.md or create a GitHub issue.
