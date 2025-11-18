import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { qdrant } from '@/lib/qdrant';
import { generateEmbedding } from '@/lib/gemini';
import { chunkDocument, extractText } from '@/lib/chunking';
import { getTenantBySlug, verifyExternalApiKey } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenant_slug, api_key, file_name, doc_type_hint, content } = body;

    // Validate inputs
    if (!tenant_slug || !file_name || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: tenant_slug, file_name, content' },
        { status: 400 }
      );
    }

    // Authenticate via API key or verify tenant
    let tenant;
    if (api_key) {
      const apiKeyRecord = await verifyExternalApiKey(api_key);
      if (!apiKeyRecord) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
      tenant = apiKeyRecord.tenant;
    } else {
      tenant = await getTenantBySlug(tenant_slug);
      if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }
    }

    // Extract text
    const extractedText = await extractText(file_name, content);

    // Determine doc type
    const docType = doc_type_hint || 'OTHER';

    // Create document record
    const document = await prisma.document.create({
      data: {
        tenantId: tenant.id,
        title: file_name.replace(/\.[^/.]+$/, ''), // Remove extension
        originalFileName: file_name,
        docType: docType as any,
        source: 'SENSE',
        status: 'UPLOADED',
      },
    });

    // Chunk the document
    const chunks = chunkDocument(extractedText, docType as any, {
      maxChunkSize: 1000,
      overlap: 100,
    });

    // Update status to PARSED
    await prisma.document.update({
      where: { id: document.id },
      data: { status: 'PARSED' },
    });

    // Generate embeddings and upsert to Qdrant
    const qdrantPoints = [];
    const chunkRecords = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await generateEmbedding(chunk.text);
      const pointId = `${document.id}-${i}`;

      qdrantPoints.push({
        id: pointId,
        vector: embedding,
        payload: {
          tenantId: tenant.id,
          documentId: document.id,
          chunkIndex: i,
          docType: docType,
          chunkStrategy: chunk.chunkStrategy,
          pageNumber: chunk.pageNumber,
          sectionTitle: chunk.sectionTitle,
          text: chunk.text,
        },
      });

      chunkRecords.push({
        documentId: document.id,
        tenantId: tenant.id,
        chunkIndex: i,
        text: chunk.text,
        chunkStrategy: chunk.chunkStrategy,
        pageNumber: chunk.pageNumber,
        sectionTitle: chunk.sectionTitle,
        qdrantPointId: pointId,
      });
    }

    // Ensure Qdrant collection exists
    await qdrant.ensureCollection();

    // Upsert to Qdrant
    await qdrant.upsertPoints(qdrantPoints);

    // Save chunks to database
    await prisma.documentChunk.createMany({
      data: chunkRecords,
    });

    // Update status to EMBEDDED
    await prisma.document.update({
      where: { id: document.id },
      data: { status: 'EMBEDDED' },
    });

    return NextResponse.json({
      success: true,
      document_id: document.id,
      chunks_created: chunks.length,
      message: 'Document ingested successfully',
    });
  } catch (error: any) {
    console.error('Ingestion error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
