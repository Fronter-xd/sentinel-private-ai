'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'processing' | 'error';
  label?: string;
  pulse?: boolean;
  className?: string;
}

export function StatusBadge({ status, label, pulse, className }: StatusBadgeProps) {
  const colors = {
    online: 'bg-status-secure text-status-secure',
    offline: 'bg-status-error text-status-error',
    processing: 'bg-status-warning text-status-warning',
    error: 'bg-status-error text-status-error',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="relative flex h-2.5 w-2.5">
        {pulse && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              colors[status].replace('text-', 'bg-')
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-2.5 w-2.5',
            colors[status].replace('text-', 'bg-')
          )}
        />
      </span>
      {label && (
        <span className={cn('text-xs font-mono uppercase tracking-wider', colors[status])}>
          {label}
        </span>
      )}
    </div>
  );
}
