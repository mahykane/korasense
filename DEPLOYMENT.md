# Deploying to Vercel

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Required Services**:
   - PostgreSQL database (e.g., Supabase, Neon, Railway)
   - Qdrant Cloud account
   - Google Gemini API key
   - Clerk account for authentication

## Step-by-Step Deployment

### 1. Prepare Your Database

**Option A: Supabase (Recommended)**
```bash
# 1. Go to supabase.com and create a new project
# 2. Get your connection string from Settings > Database
# 3. Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

**Option B: Neon**
```bash
# 1. Go to neon.tech and create a project
# 2. Copy the connection string
```

### 2. Set Up Environment Variables

**On Vercel Dashboard:**

1. Go to your project → Settings → Environment Variables
2. Add the following variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Qdrant Vector Database
QDRANT_URL=https://xxx.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key
QDRANT_COLLECTION_NAME=opsense_chunks

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# External API
EXTERNAL_API_SECRET=generate-a-secure-random-string

# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 3. Deploy via Vercel CLI

**Install Vercel CLI:**
```bash
npm install -g vercel
```

**Login to Vercel:**
```bash
vercel login
```

**Deploy:**
```bash
# From project root
vercel

# For production
vercel --prod
```

### 4. Deploy via GitHub Integration (Recommended)

1. **Connect Repository:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

2. **Configure Project:**
   - Framework Preset: **Next.js**
   - Build Command: `prisma generate && next build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Add Environment Variables:**
   - Add all variables from `.env.example`
   - Make sure to use production values

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your app

### 5. Run Database Migrations

**After first deployment:**

```bash
# Install Vercel CLI if not already
npm install -g vercel

# Link to your project
vercel link

# Run migrations
vercel env pull .env.local
npx prisma migrate deploy
```

**Or use Vercel dashboard:**
```bash
# In your Vercel project settings
# Add a new Environment Variable
DATABASE_URL=your-production-database-url

# Then in your local terminal
vercel env pull
npx prisma migrate deploy
```

### 6. Verify Deployment

1. **Check Build Logs:**
   - Go to Vercel Dashboard → Deployments
   - Click on your deployment
   - Review build logs for errors

2. **Test the App:**
   - Visit your Vercel URL
   - Test authentication flow
   - Try uploading a document
   - Ask a question in the chat

3. **Check Database:**
   - Verify tables were created
   - Run `npx prisma studio` locally with production DB

## Post-Deployment Tasks

### 1. Set Up Custom Domain (Optional)

```bash
# Via Vercel CLI
vercel domains add yourdomain.com

# Or in Vercel Dashboard:
# Settings → Domains → Add Domain
```

### 2. Configure Clerk for Production

1. Go to Clerk Dashboard
2. Update allowed origins:
   - Add `https://your-app.vercel.app`
3. Update redirect URLs
4. Get production API keys

### 3. Create Initial Tenant

```bash
# SSH into Vercel (if needed) or run locally
npm run prisma:studio

# Or use the API to create tenant
curl -X POST https://your-app.vercel.app/api/tenants \
  -H "Content-Type: application/json" \
  -d '{"name": "Your Company", "slug": "your-company"}'
```

### 4. Create API Keys

```bash
# Run the script locally with production DB
npm run prisma:generate
npx tsx scripts/create-api-key.ts
```

## Troubleshooting

### Build Fails

**Error: "Prisma Client not generated"**
```bash
# Update build command to:
prisma generate && next build
```

**Error: "MODULE_NOT_FOUND"**
```bash
# Clear cache and redeploy
vercel --force
```

### Database Connection Issues

**Error: "Can't reach database server"**
```bash
# 1. Check DATABASE_URL format
# 2. Ensure database allows connections from Vercel IPs
# 3. Add ?connection_limit=1 to connection string
DATABASE_URL="postgresql://...?connection_limit=1"
```

### Authentication Issues

**Error: "Clerk: Invalid publishable key"**
```bash
# 1. Verify you're using production keys
# 2. Check NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY starts with pk_live_
# 3. Redeploy after updating env vars
```

### Environment Variables Not Working

```bash
# 1. Ensure they're added to Vercel project settings
# 2. Redeploy after adding new variables
# 3. Check variable names match exactly (case-sensitive)
```

## Monitoring & Maintenance

### 1. Set Up Monitoring

- **Vercel Analytics**: Enable in project settings
- **Error Tracking**: Consider Sentry integration
- **Logs**: Check Vercel function logs regularly

### 2. Regular Updates

```bash
# Update dependencies
npm update

# Run tests
npm run lint

# Deploy
git push origin main
```

### 3. Database Backups

- Enable automatic backups on your database provider
- Test restore process periodically
- Keep migration history in Git

### 4. Performance Optimization

```bash
# Enable Vercel caching
# In next.config.ts
export default {
  experimental: {
    optimizeCss: true,
  },
  images: {
    domains: ['your-domain.com'],
  },
}
```

## Scaling Considerations

### 1. Database Scaling

- Use connection pooling (PgBouncer)
- Consider read replicas for heavy queries
- Monitor query performance

### 2. Vector Database

- Upgrade Qdrant plan as needed
- Monitor API usage and quotas
- Consider clustering for high traffic

### 3. AI API Limits

- Monitor Gemini API quota
- Implement rate limiting on endpoints
- Consider caching frequent queries

### 4. CDN & Edge

- Use Vercel Edge Network
- Enable ISR for static pages
- Optimize images with Next.js Image

## Security Checklist

- [ ] All environment variables are set
- [ ] Database uses SSL connections
- [ ] API keys are rotated regularly
- [ ] Clerk authentication is properly configured
- [ ] CORS settings are restrictive
- [ ] Rate limiting is implemented
- [ ] Input validation is in place
- [ ] Error messages don't leak sensitive info

## Quick Deploy Commands

```bash
# First time setup
vercel
vercel env add DATABASE_URL
vercel env add GEMINI_API_KEY
# ... add all other env vars

# Deploy to production
git push origin main
# Auto-deploys via GitHub integration

# Or manual deploy
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Prisma Deployment**: [prisma.io/docs/guides/deployment](https://www.prisma.io/docs/guides/deployment)

## Cost Estimation

### Free Tier Limits:
- **Vercel**: 100GB bandwidth/month
- **Supabase**: 500MB database, 1GB file storage
- **Qdrant**: 1GB vectors (free cluster)
- **Gemini**: 1M tokens/minute

### Estimated Monthly Cost (Production):
- **Vercel Pro**: $20/month
- **Database (Supabase Pro)**: $25/month
- **Qdrant (Standard)**: $49/month
- **Gemini API**: Variable (pay per use)

**Total**: ~$100-200/month for small-medium usage
