/**
 * Qdrant Vector Database Client
 * Handles vector storage and similarity search operations
 */

export interface QdrantPoint {
  id: string;
  vector: number[];
  payload: {
    tenantId: string;
    documentId: string;
    chunkIndex: number;
    docType: string;
    chunkStrategy: string;
    pageNumber?: number;
    sectionTitle?: string;
    text: string;
  };
}

export interface SearchResult {
  id: string;
  score: number;
  payload: QdrantPoint['payload'];
}

class QdrantClient {
  private url: string;
  private apiKey: string;
  private collectionName: string;

  constructor() {
    this.url = process.env.QDRANT_URL || '';
    this.apiKey = process.env.QDRANT_API_KEY || '';
    this.collectionName = process.env.QDRANT_COLLECTION_NAME || 'opsense_chunks';

    if (!this.url || !this.apiKey) {
      console.warn('Qdrant credentials not configured');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.url}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Qdrant API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Initialize collection if it doesn't exist
   */
  async ensureCollection(vectorSize: number = 768) {
    try {
      // Check if collection exists
      await this.request(`/collections/${this.collectionName}`);
      console.log(`Collection ${this.collectionName} already exists`);
    } catch (error) {
      // Create collection if it doesn't exist
      await this.request(`/collections/${this.collectionName}`, {
        method: 'PUT',
        body: JSON.stringify({
          vectors: {
            size: vectorSize,
            distance: 'Cosine',
          },
        }),
      });
      console.log(`Created Qdrant collection: ${this.collectionName}`);
      
      // Create payload indexes for filtering
      await this.createPayloadIndexes();
    }
  }

  /**
   * Create payload indexes for efficient filtering
   */
  async createPayloadIndexes() {
    const indexes = [
      { field: 'tenantId', type: 'keyword' },
      { field: 'documentId', type: 'keyword' },
      { field: 'docType', type: 'keyword' },
    ];

    for (const index of indexes) {
      try {
        await this.request(`/collections/${this.collectionName}/index`, {
          method: 'PUT',
          body: JSON.stringify({
            field_name: index.field,
            field_schema: index.type,
          }),
        });
        console.log(`Created index for ${index.field}`);
      } catch (error) {
        console.warn(`Failed to create index for ${index.field}:`, error);
      }
    }
  }

  /**
   * Upsert a single point to Qdrant
   */
  async upsertPoint(point: QdrantPoint): Promise<void> {
    await this.request(`/collections/${this.collectionName}/points`, {
      method: 'PUT',
      body: JSON.stringify({
        points: [point],
      }),
    });
  }

  /**
   * Upsert multiple points to Qdrant
   */
  async upsertPoints(points: QdrantPoint[]): Promise<void> {
    if (points.length === 0) return;

    // Batch upsert in chunks of 100
    const batchSize = 100;
    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);
      await this.request(`/collections/${this.collectionName}/points`, {
        method: 'PUT',
        body: JSON.stringify({
          points: batch,
        }),
      });
    }
  }

  /**
   * Search for similar vectors
   */
  async search(
    vector: number[],
    tenantId: string,
    options: {
      limit?: number;
      filter?: {
        docTypes?: string[];
        documentIds?: string[];
      };
    } = {}
  ): Promise<SearchResult[]> {
    const { limit = 10, filter = {} } = options;

    // Build Qdrant filter
    const must: any[] = [
      {
        key: 'tenantId',
        match: { value: tenantId },
      },
    ];

    if (filter.docTypes && filter.docTypes.length > 0) {
      must.push({
        key: 'docType',
        match: { any: filter.docTypes },
      });
    }

    if (filter.documentIds && filter.documentIds.length > 0) {
      must.push({
        key: 'documentId',
        match: { any: filter.documentIds },
      });
    }

    const response = await this.request(`/collections/${this.collectionName}/points/search`, {
      method: 'POST',
      body: JSON.stringify({
        vector,
        limit,
        filter: {
          must,
        },
        with_payload: true,
        // OPTIMIZATION: Use approximate HNSW search for speed
        params: {
          hnsw_ef: 128, // Lower = faster (default: 128)
          exact: false, // Use approximate search
        },
      }),
    });

    return response.result.map((item: any) => ({
      id: item.id,
      score: item.score,
      payload: item.payload,
    }));
  }

  /**
   * Delete points by filter
   */
  async deletePoints(tenantId: string, documentIds?: string[]): Promise<void> {
    const must: any[] = [
      {
        key: 'tenantId',
        match: { value: tenantId },
      },
    ];

    if (documentIds && documentIds.length > 0) {
      must.push({
        key: 'documentId',
        match: { any: documentIds },
      });
    }

    await this.request(`/collections/${this.collectionName}/points/delete`, {
      method: 'POST',
      body: JSON.stringify({
        filter: { must },
      }),
    });
  }
}

export const qdrant = new QdrantClient();
