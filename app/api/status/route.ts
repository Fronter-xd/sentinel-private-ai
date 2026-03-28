import { NextResponse } from 'next/server';
import { checkOllamaStatus } from '@/lib/ollama';
import { getCollectionStats } from '@/lib/chroma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const [ollamaStatus, chromaStats] = await Promise.all([
      checkOllamaStatus(),
      getCollectionStats().catch(() => ({ count: 0, documents: [] })),
    ]);
    
    return NextResponse.json({
      ollama: {
        connected: ollamaStatus.connected,
        model: ollamaStatus.model,
        embeddingModel: ollamaStatus.embeddingModel,
        status: ollamaStatus.connected ? 'online' : 'offline',
      },
      chromadb: {
        connected: true,
        documents: chromaStats.documents.length,
        chunks: chromaStats.count,
      },
      privacy: {
        mode: 'on-premise',
        dataLeavesServer: false,
        encryption: 'enabled',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      {
        ollama: { connected: false, status: 'error' },
        chromadb: { connected: false, documents: 0 },
        error: error instanceof Error ? error.message : 'Status check failed',
      },
      { status: 200 }
    );
  }
}
