import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { chatWithDocuments } from '@/lib/rag';

export const runtime = 'nodejs';
export const maxDuration = 120;

const chatHistory: Map<string, Array<{ role: string; content: string }>> = new Map();
const MAX_HISTORY = 10;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, sessionId } = body;
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }
    
    const session = sessionId || uuidv4();
    
    let history = chatHistory.get(session) || [];
    
    const ragResult = await chatWithDocuments(query);
    
    history.push({ role: 'user', content: query });
    history.push({ role: 'assistant', content: ragResult.answer });
    
    if (history.length > MAX_HISTORY * 2) {
      history = history.slice(-MAX_HISTORY * 2);
    }
    chatHistory.set(session, history);
    
    return NextResponse.json({
      success: true,
      message: {
        id: uuidv4(),
        role: 'assistant',
        content: ragResult.answer,
        timestamp: new Date().toISOString(),
        sources: ragResult.sources,
      },
      sessionId: session,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Chat failed' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (sessionId && chatHistory.has(sessionId)) {
      chatHistory.delete(sessionId);
      return NextResponse.json({ success: true, message: 'Session cleared' });
    }
    
    chatHistory.clear();
    return NextResponse.json({ success: true, message: 'All sessions cleared' });
  } catch (error) {
    console.error('Clear error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear session' },
      { status: 500 }
    );
  }
}
