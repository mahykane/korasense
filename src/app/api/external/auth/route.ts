/**
 * External API: Get Current User & Tenant
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key' },
        { status: 401 }
      );
    }

    // Find API key
    const externalKey = await prisma.externalApiKey.findUnique({
      where: { key: apiKey },
      include: {
        tenant: true,
      },
    });

    if (!externalKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Get the first admin user for this tenant
    const tenantMember = await prisma.tenantMember.findFirst({
      where: {
        tenantId: externalKey.tenantId,
        role: 'TENANT_ADMIN',
      },
      include: {
        user: true,
      },
    });

    // If no admin, get any member
    const member = tenantMember || await prisma.tenantMember.findFirst({
      where: {
        tenantId: externalKey.tenantId,
      },
      include: {
        user: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'No user found for this tenant' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: member.user.id,
        email: member.user.email,
        name: member.user.name,
      },
      tenant: {
        id: externalKey.tenant.id,
        name: externalKey.tenant.name,
        slug: externalKey.tenant.slug,
      },
    });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
