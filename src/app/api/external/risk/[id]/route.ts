import { NextRequest, NextResponse } from 'next/server';
import { verifyExternalApiKey } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
    }

    const keyRecord = await verifyExternalApiKey(apiKey);
    if (!keyRecord) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const { id } = await params;

    // Get assessment
    const assessment = await prisma.riskAssessment.findUnique({
      where: { id },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Verify tenant access
    if (assessment.tenantId !== keyRecord.tenant.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      assessment_id: assessment.id,
      domain: assessment.domain,
      objective: assessment.objective,
      time_horizon_months: assessment.timeHorizonMonths,
      risks: assessment.riskRegister,
      overall_level: assessment.overallLevel,
      created_at: assessment.createdAt,
    });
  } catch (error: any) {
    console.error('Get assessment error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
