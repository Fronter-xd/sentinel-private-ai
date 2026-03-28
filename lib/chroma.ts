import { embedTexts } from './ollama';
import path from 'path';
import fs from 'fs';

const DATA_DIR = process.env.CHROMA_PATH || './data/chroma';

interface DocumentChunk {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
}

interface StoredDocument {
  id: string;
  chunks: DocumentChunk[];
}

let documents: Map<string, StoredDocument> = new Map();

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  const words = text.split(/\s+/);
  let currentChunk: string[] = [];
  let currentLength = 0;
  
  for (const word of words) {
    currentChunk.push(word);
    currentLength += word.length + 1;
    
    if (currentLength >= chunkSize) {
      chunks.push(currentChunk.join(' '));
      const overlapWords = currentChunk.slice(-Math.floor(overlap / 5));
      currentChunk = [...overlapWords];
      currentLength = overlapWords.join(' ').length;
    }
  }
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }
  
  return chunks;
}

function ensureDataDir(): string {
  const dir = path.resolve(DATA_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getIndexPath(): string {
  return path.join(ensureDataDir(), 'index.json');
}

function loadIndex(): void {
  const indexPath = getIndexPath();
  if (fs.existsSync(indexPath)) {
    try {
      const data = fs.readFileSync(indexPath, 'utf-8');
      const parsed = JSON.parse(data);
      documents = new Map(Object.entries(parsed));
    } catch {
      documents = new Map();
    }
  }
}

function saveIndex(): void {
  const indexPath = getIndexPath();
  const data = JSON.stringify(Object.fromEntries(documents));
  fs.writeFileSync(indexPath, data, 'utf-8');
}

export async function initializeVectorStore(): Promise<void> {
  ensureDataDir();
  loadIndex();
}

export async function addDocument(
  docId: string,
  text: string,
  metadata: Record<string, unknown>
): Promise<void> {
  await initializeVectorStore();
  
  const chunks = chunkText(text);
  const embeddings = await embedTexts(chunks);
  
  const documentChunks: DocumentChunk[] = chunks.map((content, i) => ({
    id: `${docId}_chunk_${i}`,
    content,
    metadata: {
      ...metadata,
      chunkIndex: i,
      totalChunks: chunks.length,
      embedding: embeddings[i],
    },
  }));
  
  documents.set(docId, {
    id: docId,
    chunks: documentChunks,
  });
  
  saveIndex();
}

export async function similaritySearch(
  query: string,
  topK: number = 5
): Promise<Array<{ content: string; metadata: Record<string, unknown>; distance: number }>> {
  await initializeVectorStore();
  
  const queryEmbedding = await embedTexts([query]);
  const queryVec = queryEmbedding[0];
  
  const results: Array<{ content: string; metadata: Record<string, unknown>; distance: number }> = [];
  
  for (const [, doc] of documents) {
    for (const chunk of doc.chunks) {
      const chunkEmbedding = chunk.metadata.embedding as number[];
      if (chunkEmbedding && Array.isArray(chunkEmbedding)) {
        const similarity = cosineSimilarity(queryVec, chunkEmbedding);
        const distance = 1 - similarity;
        
        results.push({
          content: chunk.content,
          metadata: {
            ...chunk.metadata,
            embedding: undefined,
          },
          distance,
        });
      }
    }
  }
  
  results.sort((a, b) => a.distance - b.distance);
  
  return results.slice(0, topK);
}

export async function getCollectionStats(): Promise<{ count: number; documents: string[] }> {
  await initializeVectorStore();
  
  let chunkCount = 0;
  const docIds: string[] = [];
  
  for (const [docId, doc] of documents) {
    docIds.push(docId);
    chunkCount += doc.chunks.length;
  }
  
  return { count: chunkCount, documents: docIds };
}

export async function deleteDocument(docId: string): Promise<void> {
  await initializeVectorStore();
  documents.delete(docId);
  saveIndex();
}

export async function clearCollection(): Promise<void> {
  documents.clear();
  saveIndex();
}
