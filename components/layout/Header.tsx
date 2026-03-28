'use client';

import { motion } from 'framer-motion';
import { Shield, Database, Cpu } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SystemStatus } from '@/lib/types';

interface HeaderProps {
  status?: SystemStatus;
}

export function Header({ status }: HeaderProps) {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-text-primary">SENTINEL</span>
                <span className="text-accent"> PRIVATE AI</span>
              </h1>
              <p className="text-[10px] text-text-muted tracking-[0.3em] uppercase">
                Secure Document Intelligence
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            {status ? (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-text-muted" />
                  <StatusBadge
                    status={status.ollama.connected ? 'online' : 'offline'}
                    label={status.ollama.connected ? 'OLLAMA' : 'OFFLINE'}
                    pulse
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-text-muted" />
                  <StatusBadge
                    status={status.chromadb.connected ? 'online' : 'offline'}
                    label={`${status.chromadb.documents} DOCS`}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <StatusBadge status="processing" label="INITIALIZING" pulse />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </header>
  );
}
