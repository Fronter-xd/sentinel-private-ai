'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MetricCard({ icon: Icon, label, value, trend, className }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('glass p-4 rounded-lg', className)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold font-mono text-text-primary">{value}</p>
        </div>
        <div className="p-2 rounded-lg bg-surface">
          <Icon className="w-5 h-5 text-accent" />
        </div>
      </div>
      {trend && (
        <div className="mt-2">
          <span
            className={cn(
              'text-xs font-mono',
              trend === 'up' && 'text-status-secure',
              trend === 'down' && 'text-status-error',
              trend === 'neutral' && 'text-text-muted'
            )}
          >
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trend === 'neutral' && '→'}
          </span>
        </div>
      )}
    </motion.div>
  );
}
