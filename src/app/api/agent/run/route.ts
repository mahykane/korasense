import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getTenantBySlug } from '@/lib/auth';
import { runAgentPipeline } from '@/lib/agent_pipeline';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenant_slug, question, context_tags } = body;

    if (!tenant_slug || !question) {
      return NextResponse.json(
        { error: 'Missing required fields: tenant_slug, question' },
        { status: 400 }
      );
    }

    // Get tenant
    const tenant = await getTenantBySlug(tenant_slug);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get current user (optional for external API calls)
    let userId: string | undefined;
    try {
      const user = await getCurrentUser();
      userId = user?.id;
    } catch (e) {
      // External API call without auth
    }

    // Run agent pipeline
    const result = await runAgentPipeline({
      question,
      tenantId: tenant.id,
      userId,
      contextTags: context_tags,
    });

    return NextResponse.json({
      session_id: result.sessionId,
      answer: result.answer,
      quality_score: result.qualityScore,
      trace: result.trace,
      totalLatencyMs: result.totalLatencyMs,
    });
  } catch (error: any) {
    console.error('Agent run error:', error);
    
    // Handle specific error types
    if (error.message.includes('rejected') || error.message.includes('Clarification needed')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
