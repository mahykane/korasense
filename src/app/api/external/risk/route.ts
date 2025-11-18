import { NextRequest, NextResponse } from 'next/server';
import { verifyExternalApiKey } from '@/lib/auth';
import { generateEmbedding, runRiskAssessment } from '@/lib/gemini';
import { qdrant } from '@/lib/qdrant';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { domain, objective, time_horizon_months, doc_types } = body;

    if (!domain || !objective || !time_horizon_months) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Retrieve evidence
    const queryEmbedding = await generateEmbedding(`${domain} ${objective}`);
    const searchResults = await qdrant.search(queryEmbedding, keyRecord.tenant.id, {
      limit: 20,
      filter: { docTypes: doc_types || ['POLICY', 'INCIDENT'] },
    });

    const chunkIds = searchResults.map(r => r.id);
    const chunks = await prisma.documentChunk.findMany({
      where: { qdrantPointId: { in: chunkIds } },
      include: { document: { select: { docType: true } } },
    });

    const evidence = chunks.map((chunk: any) => ({
      text: chunk.text,
      docType: chunk.document.docType,
    }));

    // Run assessment
    const assessment = await runRiskAssessment(
      domain,
      objective,
      time_horizon_months,
      evidence
    );

    // Save
    const riskAssessment = await prisma.riskAssessment.create({
      data: {
        tenantId: keyRecord.tenant.id,
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
      risks: assessment.risks,
      overall_level: assessment.overallLevel,
    });
  } catch (error: any) {
    console.error('External risk error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
