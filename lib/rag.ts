import { similaritySearch } from './chroma';

const SYSTEM_PROMPT = `You are Sentinel, a secure, privacy-focused AI assistant. You help users understand their documents by providing accurate, context-aware responses.

IMPORTANT GUIDELINES:
1. Only answer questions based on the provided document context
2. If the answer is not in the context, say "I don't have enough information in the provided documents to answer this question."
3. Be precise and cite relevant sections when possible
4. Maintain a professional, helpful tone
5. All processing happens locally - your data never leaves your infrastructure`;

export interface RAGResult {
  answer: string;
  sources: Array<{
    content: string;
    source: string;
    page: number;
  }>;
}

export async function runRAGPipeline(
  query: string,
  contextChunks: Array<{ content: string; metadata: Record<string, unknown> }>
): Promise<RAGResult> {
  const context = contextChunks
    .map((chunk, i) => {
      const source = (chunk.metadata?.source as string) || 'Unknown';
      const page = (chunk.metadata?.page as number) || 0;
      return `[Document ${i + 1}] (${source}, Page ${page}):\n${chunk.content}`;
    })
    .join('\n\n');
  
  const prompt = `Context from uploaded documents:
${context}

---

User Question: ${query}

Please answer the question based on the document context above. If the information is not in the context, clearly state that.`;

  const response = await generateText(prompt, SYSTEM_PROMPT);
  
  const sources = contextChunks.map((chunk) => ({
    content: chunk.content.slice(0, 200) + (chunk.content.length > 200 ? '...' : ''),
    source: (chunk.metadata?.source as string) || 'Unknown',
    page: (chunk.metadata?.page as number) || 0,
  }));
  
  return {
    answer: response,
    sources,
  };
}

async function generateText(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const LLM_MODEL = process.env.OLLAMA_LLM_MODEL || 'llama3';

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: LLM_MODEL,
        prompt,
        system: systemPrompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          num_predict: 2048,
        },
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Ollama generate error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Generate error:', error);
    throw new Error('Failed to generate response. Is Ollama running?');
  }
}

export async function chatWithDocuments(query: string): Promise<RAGResult> {
  const contextChunks = await similaritySearch(query, 5);
  
  if (contextChunks.length === 0) {
    return {
      answer: 'No documents have been uploaded yet. Please upload a PDF first to start querying.',
      sources: [],
    };
  }
  
  return runRAGPipeline(query, contextChunks);
}
