/**
 * Script to create an External API Key for the Tauri desktop app
 * 
 * Usage: npx tsx scripts/create-api-key.ts
 */

import { prisma } from '../src/lib/db';
import { randomBytes } from 'crypto';

async function main() {
  // Get the first tenant (or create demo tenant)
  let tenant = await prisma.tenant.findFirst();
  
  if (!tenant) {
    console.log('No tenant found. Creating demo tenant...');
    tenant = await prisma.tenant.create({
      data: {
        name: 'Demo Organization',
        slug: 'demo-tenant',
      },
    });
    console.log(`✓ Created tenant: ${tenant.name} (${tenant.slug})`);
  }

  // Get the first user (or create demo user)
  let user = await prisma.user.findFirst();
  
  if (!user) {
    console.log('No user found. Creating demo user...');
    user = await prisma.user.create({
      data: {
        clerkUserId: 'demo_' + randomBytes(8).toString('hex'),
        email: 'demo@example.com',
        name: 'Demo User',
      },
    });
    console.log(`✓ Created user: ${user.name} (${user.email})`);
  }

  // Generate a random API key
  const apiKey = `opsense_${randomBytes(32).toString('hex')}`;

  // Create the external API key
  const externalKey = await prisma.externalApiKey.create({
    data: {
      key: apiKey,
      label: 'FileSense Desktop App',
      tenantId: tenant.id,
    },
  });

  console.log('\n' + '='.repeat(80));
  console.log('✅ API Key Created Successfully!');
  console.log('='.repeat(80));
  console.log('\nAPI Key Details:');
  console.log(`  Label:       ${externalKey.label}`);
  console.log(`  Tenant:      ${tenant.name} (${tenant.slug})`);
  console.log(`  User:        ${user.name} (${user.email})`);
  console.log(`  Created:     ${externalKey.createdAt.toISOString()}`);
  console.log(`  Expires:     Never`);
  console.log('\n' + '-'.repeat(80));
  console.log('🔑 Your API Key (save this securely):');
  console.log('-'.repeat(80));
  console.log(`\n  ${apiKey}\n`);
  console.log('-'.repeat(80));
  console.log('\n📱 Use this in your FileSense Desktop App:');
  console.log(`  Backend URL:  http://localhost:3000`);
  console.log(`  API Key:      ${apiKey}`);
  console.log('\n' + '='.repeat(80) + '\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
