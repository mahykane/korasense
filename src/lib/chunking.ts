/**
 * Chunking Strategies for Documents
 * Handles different approaches to splitting documents into searchable chunks
 */

export type ChunkStrategy = 'LINE' | 'PARAGRAPH' | 'SECTION' | 'TABLE' | 'SLIDING' | 'PAGE';
export type DocumentType = 'POLICY' | 'INCIDENT' | 'ARCHITECTURE' | 'CHAT' | 'TABLE' | 'OTHER';

export interface Chunk {
  text: string;
  chunkStrategy: ChunkStrategy;
  pageNumber?: number;
  sectionTitle?: string;
}

/**
 * Main chunking function - selects strategy based on document type
 */
export function chunkDocument(
  text: string,
  docType: DocumentType,
  options: {
    maxChunkSize?: number;
    overlap?: number;
  } = {}
): Chunk[] {
  const { maxChunkSize = 1000, overlap = 100 } = options;

  switch (docType) {
    case 'POLICY':
      return chunkBySection(text, maxChunkSize);
    case 'INCIDENT':
      return chunkByParagraphWithSliding(text, maxChunkSize, overlap);
    case 'CHAT':
      return chunkByLine(text);
    case 'TABLE':
      return chunkTable(text);
    case 'ARCHITECTURE':
      return chunkBySection(text, maxChunkSize);
    default:
      return chunkByParagraph(text, maxChunkSize);
  }
}

/**
 * Split by lines - good for chat logs
 */
function chunkByLine(text: string): Chunk[] {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  return lines.map(line => ({
    text: line.trim(),
    chunkStrategy: 'LINE',
  }));
}

/**
 * Split by paragraphs - general purpose
 */
function chunkByParagraph(text: string, maxSize: number): Chunk[] {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const chunks: Chunk[] = [];

  let currentChunk = '';
  for (const para of paragraphs) {
    if (currentChunk.length + para.length > maxSize && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        chunkStrategy: 'PARAGRAPH',
      });
      currentChunk = '';
    }
    currentChunk += para + '\n\n';
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      chunkStrategy: 'PARAGRAPH',
    });
  }

  return chunks;
}

/**
 * Split by sections - looks for headers
 */
function chunkBySection(text: string, maxSize: number): Chunk[] {
  // Look for section headers (lines starting with #, ##, or numbered sections)
  const lines = text.split('\n');
  const chunks: Chunk[] = [];
  let currentSection = '';
  let currentTitle = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is a header
    const isHeader = /^#{1,6}\s/.test(line) || /^\d+\.\s+[A-Z]/.test(line);
    
    if (isHeader) {
      // Save previous section
      if (currentSection.trim().length > 0) {
        chunks.push({
          text: currentSection.trim(),
          chunkStrategy: 'SECTION',
          sectionTitle: currentTitle,
        });
      }
      
      // Start new section
      currentTitle = line.replace(/^#{1,6}\s/, '').replace(/^\d+\.\s+/, '').trim();
      currentSection = line + '\n';
    } else {
      currentSection += line + '\n';
      
      // Split if too large
      if (currentSection.length > maxSize) {
        chunks.push({
          text: currentSection.trim(),
          chunkStrategy: 'SECTION',
          sectionTitle: currentTitle,
        });
        currentSection = '';
      }
    }
  }

  // Add final section
  if (currentSection.trim().length > 0) {
    chunks.push({
      text: currentSection.trim(),
      chunkStrategy: 'SECTION',
      sectionTitle: currentTitle,
    });
  }

  return chunks;
}

/**
 * Paragraph chunking with sliding window overlap
 */
function chunkByParagraphWithSliding(
  text: string,
  maxSize: number,
  overlap: number
): Chunk[] {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const chunks: Chunk[] = [];

  let currentChunk = '';
  let previousChunk = '';

  for (const para of paragraphs) {
    if (currentChunk.length + para.length > maxSize && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        chunkStrategy: 'SLIDING',
      });
      
      // Add overlap from previous chunk
      previousChunk = currentChunk;
      const overlapText = previousChunk.slice(-overlap);
      currentChunk = overlapText + '\n\n';
    }
    currentChunk += para + '\n\n';
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      chunkStrategy: 'SLIDING',
    });
  }

  return chunks;
}

/**
 * Handle table data - split by rows or logical groups
 */
function chunkTable(text: string): Chunk[] {
  // Simple table chunking - split by double newlines or table separators
  const rows = text.split(/\n(?=\||---)/);
  const chunks: Chunk[] = [];
  
  let currentChunk = '';
  let rowCount = 0;
  const maxRows = 20;

  for (const row of rows) {
    if (rowCount >= maxRows) {
      chunks.push({
        text: currentChunk.trim(),
        chunkStrategy: 'TABLE',
      });
      currentChunk = '';
      rowCount = 0;
    }
    currentChunk += row + '\n';
    rowCount++;
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      chunkStrategy: 'TABLE',
    });
  }

  return chunks;
}

/**
 * Extract text from different file formats (placeholder for MVP)
 */
export async function extractText(
  fileName: string,
  content: string | Buffer
): Promise<string> {
  const ext = fileName.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'txt':
    case 'md':
      return content.toString();
    
    case 'pdf':
      // For MVP, assume text is already extracted by the Sense client
      // In production, you'd use a PDF library here
      return content.toString();
    
    default:
      return content.toString();
  }
}
