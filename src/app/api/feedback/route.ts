import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { session_id, label, comment } = body;

    if (!session_id || !label) {
      return NextResponse.json(
        { error: 'Missing required fields: session_id, label' },
        { status: 400 }
      );
    }

    // Get session to verify tenant access
    const session = await prisma.qaSession.findUnique({
      where: { id: session_id },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Create feedback
    const feedback = await prisma.qaFeedback.create({
      data: {
        qaSessionId: session_id,
        tenantId: session.tenantId,
        userId: user.id,
        label: label as any,
        comment,
      },
    });

    return NextResponse.json({
      success: true,
      feedback_id: feedback.id,
    });
  } catch (error: any) {
    console.error('Feedback error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
