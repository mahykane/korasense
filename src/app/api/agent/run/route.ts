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
    
    // Handle gatekeeper rejection
    if (error.message.includes('Query rejected:')) {
      const reason = error.message.replace('Query rejected: ', '');
      return NextResponse.json(
        { 
          error: 'Query Not Suitable',
          message: reason,
          guidance: 'Please ask questions related to risk assessment, compliance, security policies, or operational procedures. Examples: "What are our data retention policies?", "Summarize recent security incidents", "What are the compliance requirements for GDPR?"',
          type: 'REJECTED'
        },
        { status: 400 }
      );
    }
    
    // Handle clarification needed
    if (error.message.includes('Clarification needed:')) {
      const clarificationQuestion = error.message.replace('Clarification needed: ', '');
      return NextResponse.json(
        { 
          error: 'More Information Needed',
          message: clarificationQuestion,
          guidance: 'Please provide more specific details to help us answer your question accurately.',
          type: 'CLARIFICATION'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: error.message,
        guidance: 'An unexpected error occurred. Please try again or contact support if the issue persists.',
        type: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
