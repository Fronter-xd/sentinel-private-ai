const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';
const LLM_MODEL = process.env.OLLAMA_LLM_MODEL || 'llama3';

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  
  for (const text of texts) {
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          prompt: text,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Ollama embedding error: ${response.status}`);
      }
      
      const data = await response.json();
      embeddings.push(data.embedding);
    } catch (error) {
      console.error('Embedding error:', error);
      throw new Error('Failed to generate embeddings. Is Ollama running?');
    }
  }
  
  return embeddings;
}

export async function generateText(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
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

export async function checkOllamaStatus(): Promise<{
  connected: boolean;
  model: string;
  embeddingModel: string;
}> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    
    if (!response.ok) {
      return { connected: false, model: LLM_MODEL, embeddingModel: EMBEDDING_MODEL };
    }
    
    return {
      connected: true,
      model: LLM_MODEL,
      embeddingModel: EMBEDDING_MODEL,
    };
  } catch {
    return { connected: false, model: LLM_MODEL, embeddingModel: EMBEDDING_MODEL };
  }
}
