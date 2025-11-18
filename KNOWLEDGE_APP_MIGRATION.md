# Knowledge App Migration Summary

## Overview
Successfully transformed Opsense from a risk-focused copilot into a general-purpose knowledge management platform that allows employees to ingest any type of data and ask complex questions to unified company knowledge.

## Key Changes

### 1. Branding & Documentation
- **README.md**: Updated title, description, and features to focus on knowledge management
- **copilot-instructions.md**: Rebranded project description
- **package.json**: Changed name to `opsense-knowledge-app`

### 2. Database Schema (Migration: `20251118120400_knowledge_app_rebrand`)
- **DocumentType enum**: Changed from risk-specific types (POLICY, INCIDENT, ARCHITECTURE) to general types (DOCUMENT, SPREADSHEET, PRESENTATION, IMAGE, TEXT, OTHER)
- **Removed models**: `RiskAssessment` and `Playbook` - no longer needed
- **Removed enum**: `RiskLevel` - no longer applicable
- **Updated relations**: Removed risk-related foreign keys from User and Tenant models

### 3. API Routes
- **Renamed**: `/api/risk/assess` → `/api/knowledge/query`
- **Updated logic**: Changed from risk assessment to general knowledge queries using agent pipeline
- **Removed**: `/api/external/risk` endpoints - replaced by general query endpoint
- **Request format**: Now accepts `{ tenant_slug, question }` instead of risk-specific fields
- **Response format**: Returns `{ session_id, question, answer, quality_score, trace, total_latency_ms }`

### 4. Agent Pipeline (`src/lib/agent_pipeline.ts`)
- **Updated types**: Changed `keyRisks` → `keyInsights` in analyst responses
- **Updated prompts**: Removed risk-specific language from planner and analyst
- **Planner changes**: Replaced `needsRiskAssessment` with `subQueries` for breaking down complex questions
- **Trace updates**: Changed terminology from "Risk assessment" to "Sub-queries" and "Insights"

### 5. Gemini AI Integration (`src/lib/gemini.ts`)
- **Planner prompt**: Updated to focus on knowledge queries instead of risk assessment
- **Analyst prompt**: Changed from "risk and compliance questions" to "company knowledge synthesis"
- **Return types**: Updated to use `keyInsights` instead of `keyRisks`
- **Document types**: Updated to match new enum values

### 6. Frontend Pages
- **Renamed routes**:
  - `/risk` → `/knowledge` (Documents page)
  - `/eval` → `/chat` (Ask Questions page)
- **Navigation**: Updated menu items to "Dashboard", "Documents", "Ask Questions"
- **Dashboard**: Replaced risk assessments with getting started guide and document count
- **Knowledge page**: Added `DocumentUpload` component for web-based file uploads
- **Chat page**: Replaced evaluation dashboard with interactive Q&A console

### 7. New Components
- **DocumentUpload.tsx**: New component for direct web uploads
  - Multi-file selection
  - Progress tracking per file
  - Error handling
  - Success indicators with chunk counts
  - Drag-and-drop support

### 8. Updated Components
- **DemoConsole.tsx**: 
  - Now accepts `tenantSlug` and `initialHistory` props
  - Updated preset questions to be knowledge-focused
  - Changed API endpoint from `/api/agent/run` to `/api/knowledge/query`
  - Added history tracking for questions
  - Updated placeholder text

### 9. Tauri Desktop App
- **Branding**: Renamed from "Filesense" to "Opsense Knowledge Sync"
- **UI updates**: Changed title and description
- **Config files**:
  - `tauri.conf.json`: Updated productName
  - `Cargo.toml`: Updated package name to `opsense-knowledge-sync`

## Breaking Changes

### API Changes
❌ **Removed endpoints**:
- `POST /api/risk/assess`
- `GET/POST /api/external/risk`

✅ **New/Updated endpoints**:
- `POST /api/knowledge/query` - General knowledge queries
- `POST /api/external/query` - Already existed, now primary external endpoint

### Database Changes
⚠️ **Migration required**: Run `npx prisma migrate deploy` in production
- Risk assessments and playbooks will be dropped
- Document types will be updated (old data may have mismatched types)

### Frontend Routes
❌ **Removed routes**:
- `/risk` (Risk Copilot)
- `/eval` (Evaluation Dashboard)

✅ **New routes**:
- `/knowledge` (Documents & Upload)
- `/chat` (Ask Questions)

## Migration Steps for Production

### 1. Backend
```bash
# Update database schema
npx prisma migrate deploy

# Regenerate Prisma client
npx prisma generate

# Rebuild application
npm run build
```

### 2. Environment Variables
No changes needed - all existing env vars are compatible.

### 3. API Key Updates
Existing API keys work with the new `/api/knowledge/query` endpoint.
Update any integrations to use the new endpoint:

**Old**:
```bash
POST /api/external/risk
{
  "domain": "...",
  "objective": "...",
  "time_horizon_months": 12
}
```

**New**:
```bash
POST /api/external/query
{
  "question": "What are the main risks in our cloud infrastructure?"
}
```

### 4. Desktop App
Users need to update to the new "Opsense Knowledge Sync" app:
```bash
cd senses/filesense-app
npm run tauri build
```

## Testing Checklist

- [ ] Web upload works (multi-file, progress, errors)
- [ ] Desktop app syncs folders correctly
- [ ] Knowledge queries return relevant answers
- [ ] Agent pipeline shows correct trace steps
- [ ] Navigation links all work
- [ ] Dashboard loads without errors
- [ ] External API with existing keys works
- [ ] Document list displays correctly
- [ ] Chat interface saves history

## New Features Enabled

1. **Web Upload**: Users can now upload documents directly from browser
2. **General Q&A**: Ask any question, not just risk-related
3. **Simplified UX**: Cleaner navigation focused on core workflows
4. **Better Branding**: "Knowledge App" is more descriptive than "Risk Copilot"
5. **Flexible Document Types**: Support for any file type, not just policies

## Backwards Compatibility

⚠️ **Breaking**: 
- Old risk assessment endpoints are removed
- Risk assessment data will be lost during migration
- Frontend routes changed (update bookmarks)

✅ **Compatible**:
- Authentication (Clerk)
- Document ingestion
- Q&A sessions
- External API keys
- Qdrant vector database
- Embeddings (local or Gemini)

## Next Steps

1. **Test thoroughly** on staging environment
2. **Update API documentation** for external integrations
3. **Notify users** of route changes
4. **Consider**: Adding evaluation dashboard back as separate feature if needed
5. **Consider**: Adding document management features (delete, edit metadata)
