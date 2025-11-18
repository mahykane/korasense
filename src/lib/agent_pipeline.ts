/**
 * Agentic Reasoning Pipeline
 * Orchestrates the multi-step Q&A process with Gemini AI
 */

import { generateEmbedding, runGatekeeper, runPlanner, runAnalyst, runAuditor, runFinalWriter } from './gemini';
import { qdrant } from './qdrant';
import { prisma } from './db';
import { StepTimer } from './metrics';

export interface AgentTraceStep {
  step: string;
  summary: string;
  durationMs: number;
  documentsUsed: Array<{
    id: string;
    title: string;
  }>;
}

export interface AgentPipelineResult {
  sessionId: string;
  answer: string;
  qualityScore: number;
  trace: AgentTraceStep[];
  totalLatencyMs: number;
}

export interface AgentPipelineOptions {
  question: string;
  tenantId: string;
  userId?: string;
  contextTags?: string[];
}

/**
 * Main agent pipeline
 */
export async function runAgentPipeline(options: AgentPipelineOptions): Promise<AgentPipelineResult> {
  const { question, tenantId, userId, contextTags = [] } = options;
  
  const timer = new StepTimer();
  const trace: AgentTraceStep[] = [];
  const documentsUsed = new Set<string>();

  // Step 1: Gatekeeper
  const gatekeeperResult = await runGatekeeper(question);
  timer.markStep('GATEKEEPER');
  
  trace.push({
    step: 'GATEKEEPER',
    summary: `Query is ${gatekeeperResult.status}`,
    durationMs: timer.getSteps()[0].durationMs,
    documentsUsed: [],
  });

  if (gatekeeperResult.status === 'rejected') {
    throw new Error(`Query rejected: ${gatekeeperResult.reason}`);
  }

  if (gatekeeperResult.status === 'needs_clarification') {
    throw new Error(`Clarification needed: ${gatekeeperResult.clarificationQuestion}`);
  }

  // Step 2: Planner
  const plan = await runPlanner(question);
  timer.markStep('PLANNER');
  
  trace.push({
    step: 'PLANNER',
    summary: `Search strategy: ${plan.searchStrategy}, doc types: ${plan.docTypes.join(', ')}`,
    durationMs: timer.getSteps()[1].durationMs,
    documentsUsed: [],
  });

  // Step 3: Retrieval
  const retrievalStartTime = Date.now();
  const questionEmbedding = await generateEmbedding(question);
  
  const searchResults = await qdrant.search(questionEmbedding, tenantId, {
    limit: plan.searchStrategy === 'comprehensive' ? 20 : 10,
    filter: {
      docTypes: plan.docTypes,
    },
  });
  
  const retrievalLatencyMs = Date.now() - retrievalStartTime;
  timer.markStep('RETRIEVER');

  // Get full document info
  const chunkIds = searchResults.map(r => r.id);
  const chunks = await prisma.documentChunk.findMany({
    where: {
      qdrantPointId: {
        in: chunkIds,
      },
    },
    include: {
      document: {
        select: {
          id: true,
          title: true,
          docType: true,
        },
      },
    },
  });

  const evidence = chunks.map(chunk => {
    documentsUsed.add(chunk.document.id);
    return {
      text: chunk.text,
      docType: chunk.document.docType,
      title: chunk.document.title,
      documentId: chunk.document.id,
    };
  });

  const docsArray = Array.from(documentsUsed).map(docId => {
    const doc = chunks.find(c => c.document.id === docId)?.document;
    return { id: docId, title: doc?.title || 'Unknown' };
  });

  trace.push({
    step: 'RETRIEVER',
    summary: `Retrieved ${searchResults.length} chunks from ${documentsUsed.size} documents`,
    durationMs: timer.getSteps()[2].durationMs,
    documentsUsed: docsArray,
  });

  // Step 4: Analyst
  const geminiStartTime = Date.now();
  const analysis = await runAnalyst(question, evidence);
  timer.markStep('ANALYST');

  trace.push({
    step: 'ANALYST',
    summary: `Generated analysis with ${analysis.keyRisks.length} key risks, confidence: ${(analysis.confidence * 100).toFixed(0)}%`,
    durationMs: timer.getSteps()[3].durationMs,
    documentsUsed: docsArray,
  });

  // Step 5: Auditor
  const audit = await runAuditor(question, evidence, analysis);
  timer.markStep('AUDITOR');

  trace.push({
    step: 'AUDITOR',
    summary: `Quality score: ${(audit.qualityScore * 100).toFixed(0)}%, grounding: ${audit.groundingCheck ? 'pass' : 'fail'}, coverage: ${audit.coverageCheck ? 'pass' : 'fail'}`,
    durationMs: timer.getSteps()[4].durationMs,
    documentsUsed: [],
  });

  // Step 6: Optional second analyst pass if quality is low
  let finalAnalysis = analysis;
  if (audit.qualityScore < 0.7 && audit.missingAspects.length > 0) {
    // In a full implementation, we'd do another retrieval + analysis pass
    trace.push({
      step: 'RE_ANALYSIS',
      summary: 'Skipped (would improve answer based on audit feedback)',
      durationMs: 0,
      documentsUsed: [],
    });
  }

  // Step 7: Final Writer
  const finalAnswer = await runFinalWriter(question, finalAnalysis, audit);
  const geminiLatencyMs = Date.now() - geminiStartTime;
  timer.markStep('WRITER');

  trace.push({
    step: 'WRITER',
    summary: 'Generated final polished answer',
    durationMs: timer.getSteps()[timer.getSteps().length - 1].durationMs,
    documentsUsed: [],
  });

  const totalLatencyMs = timer.getTotalDuration();

  // Save session to database
  const session = await prisma.qaSession.create({
    data: {
      tenantId,
      userId,
      question,
      finalAnswer,
      agentTrace: trace as any,
      qualityScore: audit.qualityScore,
      totalLatencyMs,
    },
  });

  // Save metrics
  await prisma.qaMetrics.create({
    data: {
      qaSessionId: session.id,
      tenantId,
      retrievalK: plan.searchStrategy === 'comprehensive' ? 20 : 10,
      retrievalUsed: searchResults.length,
      retrievalLatencyMs,
      geminiLatencyMs,
    },
  });

  return {
    sessionId: session.id,
    answer: finalAnswer,
    qualityScore: audit.qualityScore,
    trace,
    totalLatencyMs,
  };
}
