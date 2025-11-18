/**
 * Script to set up Qdrant collection for KORASENSE
 * 
 * Usage: npx tsx scripts/setup-qdrant.ts
 */

// Load environment variables FIRST before any imports
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  // Verify env vars are loaded
  if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
    console.error('❌ Error: Qdrant credentials not found in .env.local');
    console.error('\n💡 Make sure you have:');
    console.error('  QDRANT_URL=...');
    console.error('  QDRANT_API_KEY=...');
    process.exit(1);
  }

  // Now import qdrant client after env vars are loaded
  const { qdrant } = await import('../src/lib/qdrant');
  console.log('🔧 Setting up Qdrant collection...\n');

  try {
    // Check if we should recreate (pass --recreate flag)
    const shouldRecreate = process.argv.includes('--recreate');
    
    if (shouldRecreate) {
      console.log('🗑️  Deleting existing collection...');
      try {
        await fetch(`${process.env.QDRANT_URL}/collections/${process.env.QDRANT_COLLECTION_NAME || 'KORASENSE_chunks'}`, {
          method: 'DELETE',
          headers: {
            'api-key': process.env.QDRANT_API_KEY || '',
          },
        });
        console.log('✅ Collection deleted');
      } catch (e) {
        console.log('ℹ️  Collection did not exist');
      }
    }
    
    console.log('📦 Ensuring collection "KORASENSE_chunks" exists...');
    
    // Get vector size from environment variable
    const useLocalEmbeddings = process.env.USE_LOCAL_EMBEDDINGS === 'true';
    const vectorSize = useLocalEmbeddings ? 384 : 768;
    const modelInfo = useLocalEmbeddings ? 'all-MiniLM-L6-v2 (local)' : 'text-embedding-004';
    
    console.log(`   Using ${modelInfo} with ${vectorSize} dimensions`);
    
    // This will create the collection if it doesn't exist
    await qdrant.ensureCollection(vectorSize);
    
    console.log('✅ Collection ready!');
    console.log('\nCollection Info:');
    console.log('  Name: KORASENSE_chunks');
    console.log(`  Vector size: ${vectorSize} (${modelInfo})`);
    console.log('  Distance: Cosine');
    console.log('  Status: Ready');

    console.log('\n' + '='.repeat(80));
    console.log('✅ Qdrant Setup Complete!');
    console.log('='.repeat(80));
    console.log('\n📝 Next Steps:');
    console.log('  1. Ingest documents via the FileSense app or /api/ingest endpoint');
    console.log('  2. Ask questions via the demo console at /demo');
    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error: any) {
    console.error('\n❌ Error setting up Qdrant:', error.message);
    console.error('\n💡 Make sure:');
    console.error('  - QDRANT_URL is set in .env.local');
    console.error('  - QDRANT_API_KEY is set in .env.local');
    console.error('  - Your Qdrant Cloud cluster is running');
    process.exit(1);
  }
}

main();
