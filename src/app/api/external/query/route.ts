import { NextRequest, NextResponse } from 'next/server';
import { verifyExternalApiKey } from '@/lib/auth';
import { runAgentPipeline } from '@/lib/agent_pipeline';

export async function POST(request: NextRequest) {
  try {
    // Verify API key from header
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
    }

    const keyRecord = await verifyExternalApiKey(apiKey);
    if (!keyRecord) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const body = await request.json();
    const { question, context_tags } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Missing required field: question' },
        { status: 400 }
      );
    }

    // Run agent pipeline
    const result = await runAgentPipeline({
      question,
      tenantId: keyRecord.tenant.id,
      contextTags: context_tags,
    });

    return NextResponse.json({
      session_id: result.sessionId,
      answer: result.answer,
      quality_score: result.qualityScore,
      trace: result.trace,
      total_latency_ms: result.totalLatencyMs,
    });
  } catch (error: any) {
    console.error('External query error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
