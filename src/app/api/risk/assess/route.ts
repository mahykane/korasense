import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getTenantBySlug } from '@/lib/auth';
import { generateEmbedding, runRiskAssessment } from '@/lib/gemini';
import { qdrant } from '@/lib/qdrant';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenant_slug, domain, objective, time_horizon_months, doc_types } = body;

    if (!tenant_slug || !domain || !objective || !time_horizon_months) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get tenant
    const tenant = await getTenantBySlug(tenant_slug);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get current user (optional)
    let userId: string | undefined;
    try {
      const user = await getCurrentUser();
      userId = user?.id;
    } catch (e) {
      // External API
    }

    // Retrieve relevant documents
    const queryEmbedding = await generateEmbedding(`${domain} ${objective}`);
    
    const searchResults = await qdrant.search(queryEmbedding, tenant.id, {
      limit: 20,
      filter: {
        docTypes: doc_types || ['POLICY', 'INCIDENT', 'ARCHITECTURE'],
      },
    });

    // Get chunk details
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
            docType: true,
          },
        },
      },
    });

    const evidence = chunks.map(chunk => ({
      text: chunk.text,
      docType: chunk.document.docType,
    }));

    // Run risk assessment
    const assessment = await runRiskAssessment(
      domain,
      objective,
      time_horizon_months,
      evidence
    );

    // Save to database
    const riskAssessment = await prisma.riskAssessment.create({
      data: {
        tenantId: tenant.id,
        userId,
        domain,
        objective,
        timeHorizonMonths: time_horizon_months,
        riskRegister: assessment.risks,
        overallLevel: assessment.overallLevel,
      },
    });

    return NextResponse.json({
      assessment_id: riskAssessment.id,
      domain,
      objective,
      time_horizon_months,
      risks: assessment.risks,
      overall_level: assessment.overallLevel,
    });
  } catch (error: any) {
    console.error('Risk assessment error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
