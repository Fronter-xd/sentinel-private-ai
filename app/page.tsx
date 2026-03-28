'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { FileText, MessageSquare, Shield, Lock, Zap } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { FileUpload } from '@/components/upload/FileUpload';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { GlassCard } from '@/components/ui/GlassCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { ChatMessage, Document, SystemStatus } from '@/lib/types';

export default function Home() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>(uuidv4());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setStatus(data);
    } catch {
      setStatus({
        ollama: { connected: false, model: 'llama3' },
        chromadb: { connected: false, documents: 0 },
      });
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleUploadComplete = (doc: Document) => {
    setDocuments((prev) => [...prev, doc]);
    setMessages((prev) => [
      ...prev,
      {
        id: uuidv4(),
        role: 'assistant',
        content: `Document "${doc.name}" uploaded successfully. I've indexed ${doc.chunks} chunks for querying. You can now ask me questions about its contents.`,
        timestamp: new Date(),
      },
    ]);
  };

  const handleUploadError = (err: string) => {
    setError(err);
    setTimeout(() => setError(null), 5000);
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: message, sessionId }),
      });

      const data = await response.json();

      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        if (data.sessionId) {
          setSessionId(data.sessionId);
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg">
      <Header status={status || undefined} />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          <MetricCard
            icon={Shield}
            label="Privacy Mode"
            value="100%"
            trend="neutral"
          />
          <MetricCard
            icon={Lock}
            label="Data Location"
            value="Local"
            trend="neutral"
          />
          <MetricCard
            icon={Zap}
            label="Processing"
            value={status?.ollama.connected ? 'Active' : 'Standby'}
            trend={status?.ollama.connected ? 'up' : 'down'}
          />
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-status-error/10 border border-status-error/30 text-status-error"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold">Upload Document</h2>
              </div>
              <FileUpload
                onUploadComplete={handleUploadComplete}
                onError={handleUploadError}
              />
            </GlassCard>

            {documents.length > 0 && (
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-semibold">Uploaded ({documents.length})</h2>
                </div>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-lg bg-surface/50 border border-border"
                    >
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-text-muted">
                        {doc.pageCount} pages • {doc.chunks} chunks
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>

          <div className="lg:col-span-2">
            <GlassCard className="h-[600px] flex flex-col" glow>
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-semibold">Document Query Interface</h2>
                </div>
                {messages.length > 0 && (
                  <button
                    onClick={() => setMessages([])}
                    className="text-xs text-text-muted hover:text-accent transition-colors"
                  >
                    Clear chat
                  </button>
                )}
              </div>
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </GlassCard>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-text-muted">
            <Lock className="w-4 h-4 text-accent" />
            <span>All processing happens locally. Your documents never leave your infrastructure.</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
