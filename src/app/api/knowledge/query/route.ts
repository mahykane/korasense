import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getTenantBySlug } from '@/lib/auth';
import { runAgentPipeline } from '@/lib/agent_pipeline';
import { runGeminiAgent } from '@/lib/gemini_agent';
import { MultimodalFile } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let question: string;
    let tenant_slug: string;
    let files: MultimodalFile[] = [];

    // Handle multipart form data (with files) or JSON
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      question = formData.get('question') as string;
      tenant_slug = formData.get('tenant_slug') as string;

      // Process uploaded files
      const fileEntries = Array.from(formData.entries()).filter(([key]) => key.startsWith('file'));
      for (const [, value] of fileEntries) {
        if (value instanceof File) {
          const buffer = Buffer.from(await value.arrayBuffer());
          files.push({
            data: buffer,
            mimeType: value.type,
            filename: value.name,
          });
        }
      }
    } else {
      // JSON request
      const body = await request.json();
      question = body.question;
      tenant_slug = body.tenant_slug;
    }

    if (!tenant_slug || !question) {
      return NextResponse.json(
        { error: 'Missing required fields: tenant_slug and question are required' },
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
      // External API - no user context
    }

    // Run the agent pipeline (with or without files)
    // Use new Gemini function calling agent for text queries, old pipeline for multimodal
    const result = files.length > 0 
      ? await runAgentPipeline({
          question,
          tenantId: tenant.id,
          userId,
          files: files.length > 0 ? files : undefined,
        })
      : await runGeminiAgent(question, tenant.id, userId);

    return NextResponse.json({
      session_id: 'sessionId' in result ? result.sessionId : `session_${Date.now()}`,
      question,
      answer: result.answer,
      quality_score: result.qualityScore,
      trace: result.trace,
      total_latency_ms: result.totalLatencyMs,
    });
  } catch (error: any) {
    console.error('Knowledge query error:', error);
    
    // Handle specific error types
    if (error.message?.startsWith('Query rejected:')) {
      return NextResponse.json(
        { 
          error: 'REJECTED',
          message: error.message.replace('Query rejected: ', ''),
        },
        { status: 400 }
      );
    }
    
    if (error.message?.startsWith('Clarification needed:')) {
      return NextResponse.json(
        { 
          error: 'CLARIFICATION_NEEDED',
          message: error.message.replace('Clarification needed: ', ''),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
