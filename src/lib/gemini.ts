/**
 * Google Gemini AI Client
 * Handles embeddings, chat, and multimodal interactions
 */

import { GoogleGenerativeAI, Part } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Toggle between local and remote embeddings
const USE_LOCAL_EMBEDDINGS = process.env.USE_LOCAL_EMBEDDINGS === 'true';

/**
 * Multimodal file upload interface
 */
export interface MultimodalFile {
  data: Buffer | Uint8Array;
  mimeType: string;
  filename?: string;
}

/**
 * Convert file to Gemini Part format
 */
function fileToGenerativePart(file: MultimodalFile): Part {
  return {
    inlineData: {
      data: Buffer.from(file.data).toString('base64'),
      mimeType: file.mimeType,
    },
  };
}

/**
 * Retry helper with exponential backoff for rate limiting
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  baseDelay = 5000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error.status === 429 || error.message?.includes('429') || error.message?.includes('quota');
      const isLastRetry = i === maxRetries - 1;
      
      if (!isRateLimit || isLastRetry) {
        // For quota errors, provide helpful message
        if (isRateLimit) {
          throw new Error('Gemini API quota exceeded. Please try again in a few seconds or reduce query complexity.');
        }
        throw error;
      }
      
      // Longer exponential backoff for quota issues: 5s, 10s
      const delay = baseDelay * Math.pow(2, i);
      console.log(`⚠️  Rate limit hit, waiting ${delay / 1000}s before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Generate text embeddings
 * Uses local model if USE_LOCAL_EMBEDDINGS=true, otherwise Gemini
 * Truncates text to stay within limits
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (USE_LOCAL_EMBEDDINGS) {
    try {
      // Dynamic import to avoid loading embeddings module unless needed
      const { generateLocalEmbedding } = await import('./embeddings');
      // Use local model (384 dimensions)
      return await generateLocalEmbedding(text);
    } catch (error) {
      console.error('Local embedding failed, falling back to Gemini:', error);
      // Fall through to Gemini if local fails
    }
  }
  
  // Use Gemini (768 dimensions)
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  
  // Gemini embedding limit is 36KB payload
  // Truncate to ~8000 characters to be safe (roughly 2000 tokens)
  const maxChars = 8000;
  const truncatedText = text.length > maxChars 
    ? text.substring(0, maxChars) + '...'
    : text;
  
  const result = await model.embedContent(truncatedText);
  return result.embedding.values;
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const embeddings: number[][] = [];

  // Process in batches to avoid rate limits
  const batchSize = 100;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const promises = batch.map(text => model.embedContent(text));
    const results = await Promise.all(promises);
    embeddings.push(...results.map(r => r.embedding.values));
  }

  return embeddings;
}

/**
 * Gatekeeper: Check if query is safe and clear (simplified for speed)
 */
export async function runGatekeeper(
  question: string,
  evidence: Array<{ text: string; docType: string; title: string; documentId: string }>
): Promise<{
  status: 'approved' | 'rejected' | 'needs_clarification';
  clarificationQuestion?: string;
  reason?: string;
}> {
  // Simple rule-based gatekeeper to avoid API calls and rate limits
  const questionLower = question.toLowerCase().trim();
  
  // Check for extremely vague questions
  const vaguePhrases = ['tell me', 'what about', 'something', 'anything', 'help'];
  const isVague = questionLower.length < 5 || 
                  (vaguePhrases.some(p => questionLower === p));
  
  if (isVague) {
    return {
      status: 'needs_clarification',
      clarificationQuestion: 'Could you please be more specific about what you\'d like to know?'
    };
  }
  
  // Check for obviously harmful content
  const harmfulKeywords = ['hack', 'attack', 'exploit', 'illegal', 'steal'];
  const containsHarmful = harmfulKeywords.some(k => questionLower.includes(k));
  
  if (containsHarmful) {
    return {
      status: 'rejected',
      reason: 'This query appears to request harmful or inappropriate information.'
    };
  }
  
  // If we have relevant evidence, approve immediately
  if (evidence.length > 0) {
    return { status: 'approved' };
  }
  
  // No evidence but question seems reasonable - still approve
  return { status: 'approved' };
}

/**
 * Planner: Decide search strategy and doc types (simplified for speed)
 */
export async function runPlanner(
  question: string,
  evidence: Array<{ text: string; docType: string; title: string; documentId: string }>
): Promise<{
  docTypes: string[];
  subQueries: string[];
  searchStrategy: string;
}> {
  // Simple rule-based planner to avoid API calls
  const foundDocTypes = [...new Set(evidence.map(e => e.docType))];
  
  // If we have evidence, use those doc types
  const docTypes = foundDocTypes.length > 0 
    ? foundDocTypes 
    : ['DOCUMENT', 'TEXT', 'SPREADSHEET', 'OTHER'];
  
  // Determine strategy based on evidence count
  const searchStrategy = evidence.length >= 5 
    ? 'focused' 
    : evidence.length > 0 
      ? 'broad' 
      : 'comprehensive';
  
  return {
    docTypes,
    subQueries: [], // Skip sub-queries for speed
    searchStrategy
  };
}

/**
 * Analyst: Synthesize answer from evidence
 */
export async function runAnalyst(
  question: string,
  evidence: Array<{ text: string; docType: string; title: string; documentId: string }>
): Promise<{
  answer: string;
  keyInsights: string[];
  evidenceReferences: string[];
  confidence: number;
}> {
  // Use lighter model to avoid quota issues (2.0-flash-lite uses fewer tokens)
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-lite',
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });

  // Truncate evidence text to avoid quota issues (max 500 chars per chunk)
  const evidenceText = evidence.map((e, i) => {
    const truncatedText = e.text.length > 500 
      ? e.text.substring(0, 500) + '...'
      : e.text;
    return `[${i + 1}] ${e.docType} - ${e.title}\n${truncatedText}`;
  }).join('\n\n---\n\n');

  const prompt = `You are an expert analyst providing clear, actionable answers using company knowledge.

Question: "${question}"

Evidence:
${evidenceText}

Provide a comprehensive answer in markdown format. Include:
- **Direct answer** to the question
- **Key insights** from the evidence
- **Evidence references** [1], [2], etc. where relevant
- **Confidence level** (0-1)

Format your response as JSON:
{
  "answer": "Well-structured markdown answer with ## headings, **bold**, lists, and [reference] citations",
  "keyInsights": ["insight1", "insight2"],
  "evidenceReferences": ["[1]", "[3]"],
  "confidence": 0.85
}

Make the answer professional, actionable, and well-formatted for direct presentation to users.`;

  return await retryWithBackoff(async () => {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    return JSON.parse(response);
  });
}

/**
 * Auditor: Verify quality and coverage
 */
export async function runAuditor(
  question: string,
  evidence: Array<{ text: string }>,
  analysis: any
): Promise<{
  qualityScore: number;
  groundingCheck: boolean;
  coverageCheck: boolean;
  missingAspects: string[];
}> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  // Simplified auditor - skip AI call for speed, use heuristics
  const qualityScore = analysis.confidence || 0.75;
  const groundingCheck = evidence.length > 0;
  const coverageCheck = analysis.answer && analysis.answer.length > 50;
  const missingAspects: string[] = [];
  
  if (evidence.length === 0) {
    missingAspects.push('No supporting evidence found');
  }
  if (analysis.confidence < 0.5) {
    missingAspects.push('Low confidence in answer');
  }
  
  return {
    qualityScore,
    groundingCheck,
    coverageCheck,
    missingAspects
  };
}

/**
 * Final Writer: Merged with Analyst - not used separately anymore
 * The Analyst now produces the final polished answer directly
 */
export async function runFinalWriter(
  question: string,
  analysis: any,
  audit: any
): Promise<string> {
  // Return the analysis answer directly - no additional API call needed
  // The analyst already produces markdown-formatted, polished answers
  return analysis.answer || 'No answer generated';
}

/**
 * Risk Assessment: Generate structured risk register
 */
export async function runRiskAssessment(
  domain: string,
  objective: string,
  timeHorizonMonths: number,
  evidence: Array<{ text: string; docType: string }>
): Promise<{
  risks: Array<{
    title: string;
    description: string;
    likelihood: 'LOW' | 'MEDIUM' | 'HIGH';
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    evidence: string[];
  }>;
  overallLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });

  const evidenceText = evidence.map((e, i) => 
    `[${i + 1}] ${e.docType}\n${e.text}`
  ).join('\n\n---\n\n');

  const prompt = `You are a risk assessment expert.

Domain: ${domain}
Objective: ${objective}
Time horizon: ${timeHorizonMonths} months

Available evidence:
${evidenceText}

Create a structured risk register. For each risk:
- Clear title and description
- Likelihood (LOW/MEDIUM/HIGH)
- Impact (LOW/MEDIUM/HIGH)
- Supporting evidence

Also provide an overall risk level for the domain.

Respond with JSON:
{
  "risks": [
    {
      "title": "...",
      "description": "...",
      "likelihood": "MEDIUM",
      "impact": "HIGH",
      "evidence": ["...", "..."]
    }
  ],
  "overallLevel": "MEDIUM"
}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  return JSON.parse(response);
}

/**
 * Multimodal Query: Analyze images/videos with text question
 * Supports: images (PNG, JPEG, WEBP, HEIC, HEIF), videos (MP4, MPEG, MOV, AVI, FLV, MPG, WEBM, WMV, 3GPP)
 */
export async function runMultimodalQuery(
  question: string,
  files: MultimodalFile[],
  evidence?: Array<{ text: string; docType: string; title: string; documentId: string }>
): Promise<{
  answer: string;
  mediaAnalysis: string[];
  confidence: number;
}> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });

  // Convert files to Gemini parts
  const fileParts = files.map(fileToGenerativePart);
  
  // Build context from evidence if available
  const evidenceContext = evidence && evidence.length > 0
    ? `\n\nRelevant company knowledge:\n${evidence.map((e, i) => 
        `[${i + 1}] ${e.docType} - ${e.title}\n${e.text}`
      ).join('\n\n---\n\n')}`
    : '';

  const prompt = `You are an AI assistant analyzing visual content (images/videos) and answering questions.

Question: "${question}"

Instructions:
1. Analyze the provided media files carefully
2. Extract relevant information, text, objects, actions, or patterns
3. Provide a clear, detailed answer to the question
4. Reference specific elements you see in the media${evidenceContext ? '\n5. Cross-reference with provided company knowledge when relevant' : ''}

Respond with JSON:
{
  "answer": "Detailed markdown-formatted answer with observations and insights",
  "mediaAnalysis": ["observation1 from media", "observation2 from media"],
  "confidence": 0.85
}`;

  return await retryWithBackoff(async () => {
    const result = await model.generateContent([prompt, ...fileParts]);
    const response = result.response.text();
    return JSON.parse(response);
  });
}

/**
 * Analyze document/file content (PDFs, text files, spreadsheets, etc.)
 */
export async function runDocumentAnalysis(
  question: string,
  file: MultimodalFile
): Promise<{
  answer: string;
  extractedInfo: string[];
  confidence: number;
}> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });

  const filePart = fileToGenerativePart(file);

  const prompt = `You are an AI assistant analyzing a document file.

Question: "${question}"

Instructions:
1. Read and understand the document content
2. Extract key information relevant to the question
3. Provide a structured, clear answer
4. Include specific references from the document

Respond with JSON:
{
  "answer": "Markdown-formatted answer with key findings",
  "extractedInfo": ["key point 1", "key point 2"],
  "confidence": 0.85
}`;

  return await retryWithBackoff(async () => {
    const result = await model.generateContent([prompt, filePart]);
    const response = result.response.text();
    return JSON.parse(response);
  });
}
