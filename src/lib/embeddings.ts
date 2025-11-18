/**
 * Local Embedding Module
 * Uses Transformers.js for client-side embedding generation
 * Falls back to Gemini if local embedding fails
 */

import { pipeline, type PipelineType } from '@xenova/transformers';

let embeddingPipeline: any = null;
let initializationPromise: Promise<any> | null = null;

/**
 * Initialize the local embedding model
 * Uses 'Xenova/all-MiniLM-L6-v2' - a fast, lightweight sentence transformer
 * Outputs 384-dimensional embeddings
 */
async function initializeEmbeddingModel() {
  if (embeddingPipeline) {
    return embeddingPipeline;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log('Initializing local embedding model...');
      
      // Use a smaller model for faster loading and inference
      // all-MiniLM-L6-v2: 384 dimensions, 22.7M parameters
      embeddingPipeline = await pipeline(
        'feature-extraction' as PipelineType,
        'Xenova/all-MiniLM-L6-v2',
        {
          // Cache models to disk for faster subsequent loads
          cache_dir: './.embedding-cache',
        }
      );
      
      console.log('Local embedding model initialized successfully');
      return embeddingPipeline;
    } catch (error) {
      console.error('Failed to initialize local embedding model:', error);
      embeddingPipeline = null;
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
}

/**
 * Generate embeddings using local model
 * @param text - Text to embed (will be truncated if too long)
 * @param maxLength - Maximum token length (default 512 for MiniLM)
 * @returns 384-dimensional embedding vector
 */
export async function generateLocalEmbedding(
  text: string,
  maxLength: number = 512
): Promise<number[]> {
  try {
    const pipe = await initializeEmbeddingModel();
    
    // Truncate text to stay within model's context window
    // MiniLM-L6-v2 has a max of 512 tokens (roughly 2000 characters)
    const maxChars = 2000;
    const truncatedText = text.length > maxChars 
      ? text.substring(0, maxChars)
      : text;
    
    // Generate embedding
    const output = await pipe(truncatedText, {
      pooling: 'mean',
      normalize: true,
    });
    
    // Convert to regular array
    const embedding = Array.from(output.data) as number[];
    
    return embedding;
  } catch (error) {
    console.error('Local embedding generation failed:', error);
    throw error;
  }
}

/**
 * Get the dimension of embeddings produced by the local model
 */
export function getLocalEmbeddingDimension(): number {
  return 384; // all-MiniLM-L6-v2 outputs 384-dimensional vectors
}

/**
 * Cleanup function to free resources
 */
export async function cleanupEmbeddingModel(): Promise<void> {
  if (embeddingPipeline) {
    // Transformers.js doesn't have explicit cleanup, but we can null the reference
    embeddingPipeline = null;
    initializationPromise = null;
    console.log('Local embedding model cleaned up');
  }
}
