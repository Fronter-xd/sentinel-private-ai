'use client';

import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, glow, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass rounded-lg transition-all duration-300',
        glow && 'glow-border',
        onClick && 'cursor-pointer hover:border-accent/50',
        className
      )}
    >
      {children}
    </div>
  );
}
