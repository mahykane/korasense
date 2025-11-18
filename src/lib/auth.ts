/**
 * Clerk Authentication and Tenant Utilities
 */

import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from './db';
import type { User } from '.prisma/client';

/**
 * Get current user from Clerk and ensure exists in database
 */
export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  // Find or create user in our database using upsert to handle race conditions
  const user = await prisma.user.upsert({
    where: { clerkUserId: clerkUser.id },
    update: {
      // Update email and name in case they changed in Clerk
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
    },
    create: {
      clerkUserId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
    },
  });

  return user;
}

/**
 * Get user's tenants with their roles
 */
export async function getUserTenants(userId: string) {
  const tenantMembers = await prisma.tenantMember.findMany({
    where: { userId },
    include: {
      tenant: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return tenantMembers.map((tm: any) => ({
    ...tm.tenant,
    role: tm.role,
  }));
}

/**
 * Get or create default tenant for user
 */
export async function getOrCreateDefaultTenant(userId: string) {
  // Check if user has any tenants
  const existingMembership = await prisma.tenantMember.findFirst({
    where: { userId },
    include: { tenant: true },
  });

  if (existingMembership) {
    return existingMembership.tenant;
  }

  // Create a new tenant for the user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const slug = `${user.email.split('@')[0]}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '');

  const tenant = await prisma.tenant.create({
    data: {
      name: `${user.name || user.email}'s Workspace`,
      slug,
      members: {
        create: {
          userId,
          role: 'TENANT_ADMIN',
        },
      },
    },
  });

  return tenant;
}

/**
 * Check if user has access to tenant
 */
export async function checkTenantAccess(userId: string, tenantId: string) {
  const membership = await prisma.tenantMember.findUnique({
    where: {
      tenantId_userId: {
        tenantId,
        userId,
      },
    },
  });

  return membership !== null;
}

/**
 * Get tenant by slug
 */
export async function getTenantBySlug(slug: string) {
  return prisma.tenant.findUnique({
    where: { slug },
  });
}

/**
 * Verify external API key
 */
export async function verifyExternalApiKey(apiKey: string) {
  const key = await prisma.externalApiKey.findUnique({
    where: { key: apiKey },
    include: { tenant: true },
  });

  return key;
}

/**
 * Auth middleware helper
 */
export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('User not found');
  }

  return user;
}
