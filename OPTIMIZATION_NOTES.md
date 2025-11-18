# Performance & Quota Optimizations

## Recent Changes (Nov 18, 2025)

### Issue
- Gemini API quota exceeded (429 errors)
- `gemini-2.5-flash` hitting 1M token/minute limit
- Query taking 3.9 minutes before failure

### Root Cause
- Sending too many chunks (8) to Gemini
- Each chunk potentially 1000+ characters
- Full chunk text in evidence = massive token usage
- Model using premium tier tokens

### Optimizations Applied

#### 1. Reduced Chunk Count
**Before**: 8 chunks per query
**After**: 5 chunks per query
- Location: `agent_pipeline.ts` line 68
- Impact: ~37% reduction in evidence data

#### 2. Truncated Evidence Text
**Before**: Full chunk text (unlimited)
**After**: Max 500 characters per chunk + "..."
- Location: `gemini.ts` line 214
- Impact: ~50-70% reduction in prompt tokens

#### 3. Switched to Lighter Model
**Before**: `gemini-2.5-flash` (premium)
**After**: `gemini-2.0-flash-lite` (standard)
- Location: `gemini.ts` line 210
- Impact: Lower quota usage, faster response

#### 4. Improved Retry Logic
**Before**: 3 retries with 1s, 2s, 4s delays
**After**: 2 retries with 5s, 10s delays
- Location: `gemini.ts` line 38
- Impact: Better handling of rate limits
- Added helpful error messages

#### 5. Reduced Multimodal Context
**Before**: 5 context chunks for multimodal
**After**: 3 context chunks for multimodal
- Location: `agent_pipeline.ts` line 282
- Impact: Lighter context for vision queries

### Expected Results

**Token Usage Reduction**:
- Chunks: 8 → 5 (37% less)
- Text per chunk: ~1000 → 500 chars (50% less)
- Combined: ~68% token reduction
- Model efficiency: 2.5-flash → 2.0-flash-lite (30% less quota usage)

**Total Improvement**: ~80% reduction in quota usage per query

**Response Time**:
- Expected: 10-20 seconds (down from 3.9 minutes)
- Fewer retries, lighter model, less data

### Monitoring

Check token usage at: https://ai.dev/usage?tab=rate-limit

**Current Limits**:
- Input tokens: 1,000,000/min per model
- Output tokens: Varies by tier

**Safe Query Rate** (with new optimizations):
- Estimated: 20-30 queries/minute
- Previous: ~4-5 queries/minute

### Future Optimizations

If quota issues persist:

1. **Implement Query Caching**
   - Cache similar questions for 5 minutes
   - Avoid re-processing identical queries

2. **Smart Chunking**
   - Only send most relevant sentences from chunks
   - Use extractive summarization

3. **Batch Processing**
   - Queue multiple queries
   - Process with rate limiting

4. **Model Selection**
   - Use gemini-1.5-flash for simple queries
   - Reserve 2.0-flash for complex analysis

5. **Context Compression**
   - Compress evidence with smaller model first
   - Send compressed context to main model

### Configuration Options

Add to `.env` for further control:

```bash
# Max chunks to retrieve
MAX_RETRIEVAL_CHUNKS=5

# Max characters per chunk evidence
MAX_CHUNK_CHARS=500

# Model selection
GEMINI_MODEL=gemini-2.0-flash-lite

# Retry configuration
MAX_RETRIES=2
RETRY_BASE_DELAY=5000
```

## Testing

After optimizations, test with:

1. Simple query: "What are our remote work policies?"
2. Complex query: "Analyze Q3 financial performance and identify risks"
3. Multimodal query: Upload image + "What's shown in this diagram?"

Expected results:
- ✅ All queries complete in <20s
- ✅ No 429 quota errors
- ✅ Quality maintained with lighter model
