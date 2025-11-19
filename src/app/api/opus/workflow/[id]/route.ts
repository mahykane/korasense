import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { getWorkflowStatus } from '@/lib/opus';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workflowId } = await params;

    // Get workflow from database
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        user: true,
        tenant: true,
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Verify user has access to this workflow
    if (workflow.user.clerkUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get status from OPUS if workflow is still processing
    if (workflow.status === 'PROCESSING' && workflow.opusWorkflowId) {
      try {
        const opusStatus = await getWorkflowStatus(workflow.opusWorkflowId);
        
        // Update local workflow status if changed
        const isCompleted = opusStatus.status === 'COMPLETED' || opusStatus.status === 'FAILED';
        if (opusStatus.status !== workflow.status) {
          await prisma.workflow.update({
            where: { id: workflowId },
            data: {
              status: opusStatus.status as any,
              result: opusStatus as any,
              completedAt: isCompleted ? new Date() : null,
            },
          });
        }

        return NextResponse.json({
          workflowId: workflow.id,
          status: opusStatus.status,
          result: opusStatus,
        });
      } catch (error) {
        console.error('Failed to get OPUS status:', error);
        // Return local status if OPUS API fails
      }
    }

    return NextResponse.json({
      workflowId: workflow.id,
      status: workflow.status,
      result: workflow.result,
      createdAt: workflow.createdAt,
      completedAt: workflow.completedAt,
    });
  } catch (error: any) {
    console.error('Get workflow status error:', error);
    return NextResponse.json(
      { error: 'Failed to get workflow status', details: error.message },
      { status: 500 }
    );
  }
}
