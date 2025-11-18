/**
 * Google Gemini AI Client
 * Handles embeddings, chat, and multimodal interactions
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generate text embeddings using Gemini
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(text);
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
 * Gatekeeper: Check if query is safe and clear
 */
export async function runGatekeeper(question: string): Promise<{
  status: 'approved' | 'rejected' | 'needs_clarification';
  clarificationQuestion?: string;
  reason?: string;
}> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  const prompt = `You are a safety and clarity gatekeeper for a risk assessment copilot.

Analyze this user question:
"${question}"

Determine if:
1. It's safe (no harmful, inappropriate, or malicious content)
2. It's clear enough to answer (not too vague or ambiguous)
3. It's relevant to risk, compliance, policy, or security topics

Respond with JSON:
{
  "status": "approved" | "rejected" | "needs_clarification",
  "clarificationQuestion": "...",  // if needs_clarification
  "reason": "..."  // if rejected
}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  return JSON.parse(response);
}

/**
 * Planner: Decide search strategy and doc types
 */
export async function runPlanner(
  question: string,
  tenantContext?: string
): Promise<{
  docTypes: string[];
  needsRiskAssessment: boolean;
  searchStrategy: string;
}> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const prompt = `You are a query planner for a knowledge and risk copilot.

User question: "${question}"
${tenantContext ? `Tenant context: ${tenantContext}` : ''}

Available document types: POLICY, INCIDENT, ARCHITECTURE, CHAT, TABLE, OTHER

Plan the search strategy:
1. Which document types are most relevant?
2. Does this need a full risk assessment or just Q&A?
3. What's the search strategy?

Respond with JSON:
{
  "docTypes": ["POLICY", "INCIDENT"],
  "needsRiskAssessment": false,
  "searchStrategy": "broad" | "focused" | "comprehensive"
}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  return JSON.parse(response);
}

/**
 * Analyst: Synthesize answer from evidence
 */
export async function runAnalyst(
  question: string,
  evidence: Array<{ text: string; docType: string; title: string; documentId: string }>
): Promise<{
  answer: string;
  keyRisks: string[];
  evidenceReferences: string[];
  confidence: number;
}> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-pro',
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });

  const evidenceText = evidence.map((e, i) => 
    `[${i + 1}] ${e.docType} - ${e.title}\n${e.text}`
  ).join('\n\n---\n\n');

  const prompt = `You are an expert analyst synthesizing information for risk and compliance questions.

Question: "${question}"

Evidence:
${evidenceText}

Analyze the evidence and provide:
1. A clear, structured answer
2. Key risks identified (if any)
3. Which evidence pieces support your answer (by number)
4. Your confidence level (0-1)

Respond with JSON:
{
  "answer": "...",
  "keyRisks": ["risk1", "risk2"],
  "evidenceReferences": ["[1]", "[3]"],
  "confidence": 0.85
}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  return JSON.parse(response);
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
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  const prompt = `You are a quality auditor verifying answers to risk questions.

Question: "${question}"
Answer: "${analysis.answer}"
Evidence pieces: ${evidence.length}
Confidence: ${analysis.confidence}

Audit the answer:
1. Is it well-grounded in the evidence? (true/false)
2. Does it cover all aspects of the question? (true/false)
3. What aspects are missing? (list)
4. Overall quality score (0-1)

Respond with JSON:
{
  "qualityScore": 0.85,
  "groundingCheck": true,
  "coverageCheck": true,
  "missingAspects": []
}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  return JSON.parse(response);
}

/**
 * Final Writer: Create polished answer
 */
export async function runFinalWriter(
  question: string,
  analysis: any,
  audit: any
): Promise<string> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-pro',
    generationConfig: {
      temperature: 0.4,
    },
  });

  const prompt = `You are a professional writer crafting clear, actionable answers to risk and compliance questions.

Question: "${question}"

Analysis:
${JSON.stringify(analysis, null, 2)}

Audit feedback:
${JSON.stringify(audit, null, 2)}

Write a clear, well-structured final answer in markdown format. Include:
- Direct answer to the question
- Key risks or concerns (if any)
- Actionable recommendations (if relevant)
- References to evidence

Keep it professional, concise, and actionable.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
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
    model: 'gemini-1.5-pro',
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
