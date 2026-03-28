export interface Document {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  pageCount: number;
  status: 'processing' | 'ready' | 'error';
  chunks: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: SourceChunk[];
}

export interface SourceChunk {
  content: string;
  source: string;
  page: number;
}

export interface UploadResponse {
  success: boolean;
  document?: Document;
  error?: string;
}

export interface ChatRequest {
  query: string;
  sessionId?: string;
}

export interface ChatResponse {
  success: boolean;
  message?: ChatMessage;
  error?: string;
}

export interface SystemStatus {
  ollama: {
    connected: boolean;
    model: string;
  };
  chromadb: {
    connected: boolean;
    documents: number;
  };
}
