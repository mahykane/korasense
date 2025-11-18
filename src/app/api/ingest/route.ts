import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { qdrant } from '@/lib/qdrant';
import { generateEmbedding } from '@/lib/gemini';
import { chunkDocument, extractText } from '@/lib/chunking';
import { getTenantBySlug, verifyExternalApiKey } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check if request is multipart (file upload)
    const contentType = request.headers.get('content-type') || '';
    let tenant;
    let file_name: string;
    let content: string;
    let doc_type_hint: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload (from desktop app OR web app)
      // Parse form data first
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const tenantId = formData.get('tenantId') as string;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      if (!tenantId) {
        return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 });
      }

      const apiKey = request.headers.get('x-api-key');
      
      // Try API key authentication first (for desktop app)
      if (apiKey) {
        const apiKeyRecord = await verifyExternalApiKey(apiKey);
        if (!apiKeyRecord) {
          return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
        }
        tenant = apiKeyRecord.tenant;

        // Verify tenant ID matches
        if (tenantId !== tenant.id) {
          return NextResponse.json({ error: 'Tenant ID mismatch' }, { status: 403 });
        }
      } else {
        // Try session-based authentication (for web app)
        const { userId } = await auth();
        if (!userId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify user has access to this tenant
        const tenantMember = await prisma.tenantMember.findFirst({
          where: {
            user: { clerkUserId: userId },
            tenantId: tenantId,
          },
          include: { tenant: true },
        });

        if (!tenantMember) {
          return NextResponse.json({ error: 'Access denied to tenant' }, { status: 403 });
        }

        tenant = tenantMember.tenant;
      }

      file_name = file.name;
      
      // Convert file to base64 or text
      const buffer = await file.arrayBuffer();
      content = Buffer.from(buffer).toString('base64');
      
      // All file uploads from Sense default to OTHER doc type
      // Users can categorize them later in the UI if needed
      doc_type_hint = 'OTHER';

    } else {
      // Handle JSON request (original API for web app)
      const body = await request.json();
      const { tenant_slug, api_key, file_name: fn, doc_type_hint: dth, content: c } = body;

      // Validate inputs
      if (!tenant_slug || !fn || !c) {
        return NextResponse.json(
          { error: 'Missing required fields: tenant_slug, file_name, content' },
          { status: 400 }
        );
      }

      file_name = fn;
      content = c;
      doc_type_hint = dth;

      // Authenticate via API key or verify tenant
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
      
      // Generate a unique point ID using crypto (UUID v4)
      const pointId = crypto.randomUUID();

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
