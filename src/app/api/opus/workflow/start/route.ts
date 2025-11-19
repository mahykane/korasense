import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { executeOpusWorkflow } from '@/lib/opus';
import { OpusDocument, OpusWorkflowConfig } from '@/lib/types/opus';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user and tenant
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's tenant through membership
    const membership = await prisma.tenantMember.findFirst({
      where: { userId: user.id },
      include: { tenant: true },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const body = await request.json();
    const { workflowType, documents, config } = body;

    if (!workflowType || !documents || !config) {
      return NextResponse.json(
        { error: 'Missing required fields: workflowType, documents, config' },
        { status: 400 }
      );
    }

    // Validate documents
    if (!Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: 'At least one document is required' },
        { status: 400 }
      );
    }

    // Execute OPUS workflow
    console.log(`🚀 Starting OPUS workflow: ${workflowType}`);
    const result = await executeOpusWorkflow(
      workflowType,
      documents as OpusDocument[],
      config as OpusWorkflowConfig,
      membership.tenant.id,
      userId
    );

    // Store workflow in database
    const workflow = await prisma.workflow.create({
      data: {
        tenantId: membership.tenant.id,
        userId: user.id,
        type: workflowType as any,
        status: 'PROCESSING' as any,
        opusWorkflowId: result.workflowId,
        config: config as any,
        documentsCount: documents.length,
      },
    });

    console.log(`✓ OPUS workflow started: ${workflow.id}`);

    return NextResponse.json({
      workflowId: workflow.id,
      opusWorkflowId: result.workflowId,
      status: result.status,
      message: 'Workflow started successfully',
    });
  } catch (error: any) {
    console.error('OPUS workflow error:', error);
    return NextResponse.json(
      { error: 'Failed to start workflow', details: error.message },
      { status: 500 }
    );
  }
}
