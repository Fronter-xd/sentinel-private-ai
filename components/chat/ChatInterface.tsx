'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/lib/types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInterface({ messages, onSendMessage, isLoading }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [expandedSources, setExpandedSources] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 p-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex gap-3',
                message.role === 'user' && 'flex-row-reverse'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  message.role === 'user' ? 'bg-accent' : 'bg-surface'
                )}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-background" />
                ) : (
                  <Bot className="w-4 h-4 text-accent" />
                )}
              </div>

              <div
                className={cn(
                  'flex-1 max-w-[80%]',
                  message.role === 'user' && 'flex flex-col items-end'
                )}
              >
                <div
                  className={cn(
                    'glass rounded-lg p-4',
                    message.role === 'user' && 'bg-accent/10'
                  )}
                >
                  <p className="text-text-primary whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>

                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 w-full">
                    <button
                      onClick={() =>
                        setExpandedSources(
                          expandedSources === message.id ? null : message.id
                        )
                      }
                      className="flex items-center gap-2 text-xs text-text-muted hover:text-accent transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{message.sources.length} sources</span>
                      {expandedSources === message.id ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedSources === message.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-2 space-y-2 overflow-hidden"
                        >
                          {message.sources.map((source, i) => (
                            <div
                              key={i}
                              className="glass p-3 rounded-lg text-xs"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-accent font-mono">
                                  {source.source}
                                </span>
                                <span className="text-text-muted">
                                  Page {source.page}
                                </span>
                              </div>
                              <p className="text-text-secondary">{source.content}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <span className="text-[10px] text-text-muted mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <div className="glass rounded-lg p-4">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your documents..."
            disabled={isLoading}
            className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors resize-none"
            rows={1}
          />
          <motion.button
            type="submit"
            disabled={!input.trim() || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2',
              input.trim() && !isLoading
                ? 'bg-accent text-background'
                : 'bg-surface text-text-muted cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}
