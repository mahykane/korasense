# Embedding Configuration Guide

Opsense supports both **local** and **remote** (Gemini) embedding models.

## Current Setup

- **Default**: Gemini `text-embedding-004` (768 dimensions)
- **Optional**: Local `all-MiniLM-L6-v2` (384 dimensions)

## Comparison

| Feature | Gemini Embeddings | Local Embeddings |
|---------|------------------|------------------|
| **Dimensions** | 768 | 384 |
| **Speed** | ~2-3s per chunk | ~100-200ms per chunk |
| **Cost** | API calls (free tier: 1,500/day) | Free, unlimited |
| **Limits** | 8,000 chars/request | 2,000 chars/request |
| **Quality** | Higher (larger model) | Good (smaller model) |
| **Dependencies** | Internet + API key | `@xenova/transformers` |
| **First Load** | Instant | ~30s (downloads model) |

## How to Switch to Local Embeddings

### 1. Update Environment Variables

Edit `.env.local`:

```bash
USE_LOCAL_EMBEDDINGS=true
EMBEDDING_DIMENSION=384
```

### 2. Recreate Qdrant Collection

The Qdrant collection needs to match the embedding dimension:

```bash
npm run setup:qdrant -- --recreate
```

This will:
- Delete the existing `opsense_chunks` collection
- Create a new collection with 384 dimensions
- Set up payload indexes

### 3. Restart Services

```bash
# Kill existing servers
pkill -f "next dev"
pkill -f "tauri dev"

# Restart Next.js
npm run dev

# Restart desktop app (if using)
cd senses/filesense-app && npm run tauri dev
```

### 4. Re-ingest Documents

Since the collection was recreated, you need to re-ingest your documents:

1. Open the desktop app (FileSense)
2. Add your folders again
3. Click "Start Watching"

OR use the web interface:
1. Go to `/knowledge`
2. Upload documents manually

## Switching Back to Gemini

### 1. Update Environment

```bash
USE_LOCAL_EMBEDDINGS=false
EMBEDDING_DIMENSION=768
```

### 2. Recreate Collection

```bash
npm run setup:qdrant -- --recreate
```

### 3. Restart and Re-ingest

Same as above.

## Performance Tips

### For Local Embeddings:

- **First load**: Model downloads (~90MB), takes 30-60 seconds
- **Subsequent loads**: Model cached in `.embedding-cache/`, loads in 2-3 seconds
- **Inference**: ~100-200ms per chunk (10-20x faster than Gemini)

### For Gemini Embeddings:

- **Text Truncation**: Automatically truncates to 8,000 chars
- **Rate Limits**: Free tier allows 1,500 requests/day
- **Batch Processing**: Consider upgrading to paid tier for high volume

## Troubleshooting

### Local Embeddings Not Working

1. Check `node_modules/@xenova/transformers` exists:
   ```bash
   ls node_modules/@xenova/transformers
   ```

2. Check model cache:
   ```bash
   ls -la .embedding-cache/
   ```

3. Clear cache if corrupted:
   ```bash
   rm -rf .embedding-cache/
   ```

### Dimension Mismatch Error

Error: `Wrong input: expected dim: 768, got 384`

**Solution**: You changed embedding models but didn't recreate the collection.

```bash
npm run setup:qdrant -- --recreate
```

### Out of Memory

If local embeddings cause memory issues:

1. Reduce concurrent ingestion
2. Switch back to Gemini
3. Increase Node.js memory:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run dev
   ```

## Recommendations

**Use Local Embeddings if:**
- You have many documents to ingest (>1000)
- You want faster ingestion
- You don't want API dependencies
- You're okay with slightly lower quality

**Use Gemini Embeddings if:**
- You have <500 documents
- You want the highest quality search results
- You don't mind the API dependency
- Speed is not critical

## Technical Details

### Local Model: all-MiniLM-L6-v2

- **Type**: Sentence Transformer
- **Parameters**: 22.7M
- **Context**: 512 tokens (~2,000 chars)
- **Output**: 384-dimensional vectors
- **Normalization**: L2 normalized
- **Pooling**: Mean pooling
- **License**: Apache 2.0

### Gemini Model: text-embedding-004

- **Type**: Transformer-based
- **Context**: ~10,000 tokens (~36,000 bytes)
- **Output**: 768-dimensional vectors
- **API**: Google Generative AI
- **License**: Google Cloud Terms
