/**
 * Agentic Reasoning Pipeline
 * Orchestrates the multi-step Q&A process with Gemini AI
 */

import { 
  generateEmbedding, 
  runGatekeeper, 
  runPlanner, 
  runAnalyst, 
  runAuditor, 
  runFinalWriter,
  runMultimodalQuery,
  runDocumentAnalysis,
  MultimodalFile 
} from './gemini';
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
  status?: string;
  details?: string;
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
  files?: MultimodalFile[];
}

/**
 * Main agent pipeline
 */
export async function runAgentPipeline(options: AgentPipelineOptions): Promise<AgentPipelineResult> {
  const { question, tenantId, userId, contextTags = [], files = [] } = options;
  
  console.log(`🔍 Processing query: "${question.substring(0, 60)}${question.length > 60 ? '...' : ''}"`);
  
  const timer = new StepTimer();
  const trace: AgentTraceStep[] = [];
  const documentsUsed = new Set<string>();

  // Handle multimodal queries (images, videos, documents)
  if (files && files.length > 0) {
    console.log(`📎 Multimodal query with ${files.length} file(s)`);
    return await runMultimodalPipeline({ question, tenantId, userId, files });
  }

  // Step 1: Initial Retrieval (get relevant chunks first)
  const retrievalStartTime = Date.now();
  const questionEmbedding = await generateEmbedding(question);
  
  // Do a focused search to get most relevant context (reduced to 5 to avoid quota issues)
  const searchResults = await qdrant.search(questionEmbedding, tenantId, {
    limit: 5,
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

  const evidence = chunks.map((chunk: any) => {
    documentsUsed.add(chunk.document.id);
    return {
      text: chunk.text,
      docType: chunk.document.docType,
      title: chunk.document.title,
      documentId: chunk.document.id,
    };
  });

  const docsArray = Array.from(documentsUsed).map(docId => {
    const doc = chunks.find((c: any) => c.document.id === docId)?.document;
    return { id: docId, title: doc?.title || 'Unknown' };
  });

  trace.push({
    step: 'RETRIEVER',
    summary: `Found ${searchResults.length} relevant chunks from ${documentsUsed.size} documents`,
    durationMs: timer.getSteps()[0].durationMs,
    documentsUsed: docsArray,
    status: 'success',
    details: `Search results: ${searchResults.length} chunks\nUnique documents: ${documentsUsed.size}\nAverage similarity: ${searchResults.length > 0 ? (searchResults.reduce((sum: number, r: any) => sum + r.score, 0) / searchResults.length).toFixed(3) : 'N/A'}`,
  } as any);

  // Step 2: Gatekeeper (with context from retrieved chunks)
  const gatekeeperResult = await runGatekeeper(question, evidence);
  timer.markStep('GATEKEEPER');
  
  trace.push({
    step: 'GATEKEEPER',
    summary: `Safety & clarity check: ${gatekeeperResult.status}`,
    durationMs: timer.getSteps()[1].durationMs,
    documentsUsed: [],
    status: gatekeeperResult.status,
    details: gatekeeperResult.status === 'approved' 
      ? 'Query is safe and clear to process' 
      : gatekeeperResult.status === 'rejected' 
        ? gatekeeperResult.reason 
        : gatekeeperResult.clarificationQuestion,
  } as any);

  if (gatekeeperResult.status === 'rejected') {
    throw new Error(`Query rejected: ${gatekeeperResult.reason}`);
  }

  if (gatekeeperResult.status === 'needs_clarification') {
    throw new Error(`Clarification needed: ${gatekeeperResult.clarificationQuestion}`);
  }

  // Step 3: Planner (with context from retrieved chunks)
  const plan = await runPlanner(question, evidence);
  timer.markStep('PLANNER');
  
  trace.push({
    step: 'PLANNER',
    summary: `Planned ${plan.searchStrategy} search across ${plan.docTypes.length} document types`,
    durationMs: timer.getSteps()[2].durationMs,
    documentsUsed: [],
    status: 'success',
    details: `Strategy: ${plan.searchStrategy}\nDocument types: ${plan.docTypes.join(', ')}\nSub-queries: ${plan.subQueries?.length || 0}`,
  } as any);

  // Step 4: Analyst
  const geminiStartTime = Date.now();
  const analysis = await runAnalyst(question, evidence);
  timer.markStep('ANALYST');

  trace.push({
    step: 'ANALYST',
    summary: `Synthesized answer from ${evidence.length} evidence pieces`,
    durationMs: timer.getSteps()[3].durationMs,
    documentsUsed: docsArray,
    status: 'success',
    details: `Confidence: ${(analysis.confidence * 100).toFixed(0)}%\nKey insights: ${analysis.keyInsights?.length || 0}\nEvidence references: ${analysis.evidenceReferences.length}\nInsights: ${analysis.keyInsights?.join('; ') || 'None identified'}`,
  } as any);

  // Step 5: Auditor
  const audit = await runAuditor(question, evidence, analysis);
  timer.markStep('AUDITOR');

  trace.push({
    step: 'AUDITOR',
    summary: `Quality validated: ${(audit.qualityScore * 100).toFixed(0)}% score`,
    durationMs: timer.getSteps()[4].durationMs,
    documentsUsed: [],
    status: audit.qualityScore >= 0.7 ? 'success' : 'warning',
    details: `Quality score: ${(audit.qualityScore * 100).toFixed(0)}%\nGrounding check: ${audit.groundingCheck ? '✓ Pass' : '✗ Fail'}\nCoverage check: ${audit.coverageCheck ? '✓ Pass' : '✗ Fail'}\nMissing aspects: ${audit.missingAspects.length > 0 ? audit.missingAspects.join(', ') : 'None'}`,
  } as any);

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
    summary: 'Crafted final polished response',
    durationMs: timer.getSteps()[timer.getSteps().length - 1].durationMs,
    documentsUsed: [],
    status: 'success',
    details: `Answer length: ${finalAnswer.length} characters\nBased on: ${finalAnalysis.evidenceReferences.length} evidence pieces\nQuality: ${(audit.qualityScore * 100).toFixed(0)}%`,
  } as any);

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

/**
 * Multimodal Pipeline: Handle image, video, and document queries
 */
async function runMultimodalPipeline(options: {
  question: string;
  tenantId: string;
  userId?: string;
  files: MultimodalFile[];
}): Promise<AgentPipelineResult> {
  const { question, tenantId, userId, files } = options;
  
  const timer = new StepTimer();
  const trace: AgentTraceStep[] = [];
  const startTime = Date.now();

  // Step 1: Retrieve relevant context (optional, can enhance answers)
  let evidence: Array<{ text: string; docType: string; title: string; documentId: string }> = [];
  const documentsUsed = new Set<string>();

    try {
    const questionEmbedding = await generateEmbedding(question);
    const searchResults = await qdrant.search(questionEmbedding, tenantId, {
      limit: 3, // Minimal context for multimodal queries to avoid quota issues
    });    const chunkIds = searchResults.map(r => r.id);
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

    evidence = chunks.map((chunk: any) => {
      documentsUsed.add(chunk.document.id);
      return {
        text: chunk.text,
        docType: chunk.document.docType,
        title: chunk.document.title,
        documentId: chunk.document.id,
      };
    });

    const docsArray = Array.from(documentsUsed).map(docId => {
      const chunk = chunks.find((c: any) => c.document.id === docId);
      return {
        id: docId,
        title: chunk ? (chunk as any).document.title : 'Unknown',
      };
    });

    trace.push({
      step: 'RETRIEVER',
      summary: `Retrieved ${evidence.length} context chunks`,
      durationMs: Date.now() - startTime,
      documentsUsed: docsArray,
      status: 'success',
      details: `Context retrieval to enhance multimodal analysis`,
    });
  } catch (err) {
    console.warn('Context retrieval failed for multimodal query:', err);
    // Continue without context
  }

  timer.markStep('RETRIEVER');

  // Step 2: Analyze media files with Gemini multimodal
  const analysisStartTime = Date.now();
  
  // Detect file types
  const imageVideoFiles = files.filter(f => 
    f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/')
  );
  const documentFiles = files.filter(f => 
    !f.mimeType.startsWith('image/') && !f.mimeType.startsWith('video/')
  );

  let result: any;
  
  if (imageVideoFiles.length > 0) {
    // Process images/videos with multimodal model
    result = await runMultimodalQuery(question, imageVideoFiles, evidence);
    
    trace.push({
      step: 'MULTIMODAL_ANALYSIS',
      summary: `Analyzed ${imageVideoFiles.length} media file(s)`,
      durationMs: Date.now() - analysisStartTime,
      documentsUsed: [],
      status: 'success',
      details: `Media types: ${imageVideoFiles.map(f => f.mimeType).join(', ')}\nObservations: ${result.mediaAnalysis.length}`,
    });
  } else if (documentFiles.length > 0) {
    // Process document files
    result = await runDocumentAnalysis(question, documentFiles[0]);
    
    trace.push({
      step: 'DOCUMENT_ANALYSIS',
      summary: `Analyzed document: ${documentFiles[0].filename || 'uploaded file'}`,
      durationMs: Date.now() - analysisStartTime,
      documentsUsed: [],
      status: 'success',
      details: `Document type: ${documentFiles[0].mimeType}\nExtracted info: ${result.extractedInfo.length} items`,
    });
  } else {
    throw new Error('No valid files provided');
  }

  timer.markStep('ANALYSIS');

  const totalLatencyMs = timer.getTotalDuration();

  // Save session
  const session = await prisma.qaSession.create({
    data: {
      tenantId,
      userId,
      question,
      finalAnswer: result.answer,
      agentTrace: trace as any,
      qualityScore: result.confidence,
      totalLatencyMs,
    },
  });

  return {
    sessionId: session.id,
    answer: result.answer,
    qualityScore: result.confidence,
    trace,
    totalLatencyMs,
  };
}
