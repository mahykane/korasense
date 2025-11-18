# Multimodal Features Guide

## Overview
The Opsense Knowledge App now supports multimodal queries, allowing users to upload and analyze images, videos, and documents directly in the chat interface.

## Supported File Types

### Images
- PNG, JPEG, WEBP, HEIC, HEIF
- Examples: Screenshots, diagrams, charts, photos

### Videos
- MP4, MPEG, MOV, AVI, FLV, MPG, WEBM, WMV, 3GPP
- Examples: Recordings, demos, tutorials

### Documents
- PDF, DOC, DOCX, TXT
- Examples: Reports, contracts, specifications

## How It Works

### User Interface
1. **Upload Button**: Click the 📎 button in the chat input to select files
2. **Multiple Files**: Upload multiple files at once (mix images, videos, docs)
3. **File Preview**: See uploaded files before sending
4. **Remove Files**: Click the ✕ on any file to remove it

### Backend Processing

#### Standard Query (No Files)
```
1. RETRIEVER → Search vector database for relevant chunks
2. GATEKEEPER → Safety and clarity check
3. PLANNER → Analyze retrieved documents
4. ANALYST → Synthesize answer from evidence
5. AUDITOR → Quality validation (heuristic)
6. WRITER → Return polished answer
```

#### Multimodal Query (With Files)
```
1. RETRIEVER → Optional context from knowledge base (5 chunks)
2. MULTIMODAL_ANALYSIS → Gemini 2.0 Flash analyzes media files
   - Extract text, objects, patterns from images/videos
   - Understand document content
   - Cross-reference with company knowledge
3. Return answer with media insights
```

## API Usage

### With Files (Multipart Form Data)
```typescript
const formData = new FormData();
formData.append('tenant_slug', 'your-tenant');
formData.append('question', 'What is shown in this image?');
formData.append('file0', imageFile);
formData.append('file1', videoFile);

const response = await fetch('/api/knowledge/query', {
  method: 'POST',
  body: formData,
});
```

### Without Files (JSON)
```typescript
const response = await fetch('/api/knowledge/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tenant_slug: 'your-tenant',
    question: 'What are our remote work policies?',
  }),
});
```

## Use Cases

### 1. Visual Analysis
**Question**: "What safety violations do you see in this photo?"
- Upload: Image of workplace
- AI: Identifies hazards, references safety policies

### 2. Document Understanding
**Question**: "Summarize the key points in this contract"
- Upload: PDF contract
- AI: Extracts terms, highlights important clauses

### 3. Video Analysis
**Question**: "What steps are shown in this tutorial?"
- Upload: Training video
- AI: Lists steps, identifies actions, timestamps

### 4. Cross-Reference
**Question**: "Does this diagram match our architecture docs?"
- Upload: System diagram image
- AI: Compares with existing documentation, finds discrepancies

### 5. Multimodal Combination
**Question**: "Compare these two designs"
- Upload: Multiple images
- AI: Analyzes differences, provides recommendations

## Technical Details

### Gemini Model
- **Model**: `gemini-2.0-flash`
- **Temperature**: 0.3 (balanced creativity/accuracy)
- **Output**: JSON with structured responses

### Functions

#### `runMultimodalQuery()`
Analyzes images and videos with text questions
```typescript
{
  answer: string;           // Markdown-formatted answer
  mediaAnalysis: string[];  // Observations from media
  confidence: number;       // 0-1 confidence score
}
```

#### `runDocumentAnalysis()`
Analyzes document files (PDF, text, etc.)
```typescript
{
  answer: string;           // Markdown-formatted answer
  extractedInfo: string[];  // Key points from document
  confidence: number;       // 0-1 confidence score
}
```

### Performance
- **Multimodal queries**: ~3-5 seconds (faster than standard 6-step pipeline)
- **Parallel processing**: Files analyzed together
- **Context enhancement**: Optional knowledge base retrieval (5 chunks)

## Limitations

1. **File Size**: Large videos may take longer to process
2. **Quality**: Image/video quality affects analysis accuracy
3. **Language**: Best results with English content
4. **Rate Limits**: Gemini API rate limits apply

## Best Practices

### For Images
- Use high-resolution images for better text extraction
- Ensure good lighting and clarity
- Include context in your question

### For Videos
- Keep videos under 5 minutes for faster processing
- Ensure clear audio for transcript analysis
- Ask specific questions about scenes or actions

### For Documents
- Use searchable PDFs (not scanned images)
- Reference specific sections in your question
- Combine with knowledge base context

## Examples

### Example 1: Dashboard Analysis
```
Question: "What metrics are shown in this dashboard?"
Files: [dashboard-screenshot.png]
Answer: Analyzes charts, extracts numbers, explains metrics
```

### Example 2: Code Review
```
Question: "Are there any security issues in this code?"
Files: [code-snippet.png]
Answer: Reviews code, identifies vulnerabilities, suggests fixes
```

### Example 3: Compliance Check
```
Question: "Does this contract comply with our procurement policy?"
Files: [contract.pdf]
Answer: Compares contract terms with internal policies
```

## Future Enhancements

- [ ] Audio file support (MP3, WAV)
- [ ] Spreadsheet analysis (XLSX, CSV)
- [ ] Real-time streaming for large files
- [ ] Batch processing for multiple queries
- [ ] File type preview thumbnails
- [ ] Drag-and-drop upload
- [ ] Copy-paste image support
