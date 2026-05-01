import React from 'react';

interface BadgeProps {
  variant?: 'winner' | 'loser' | 'accent' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = 'neutral',
  children,
  className = '',
}: BadgeProps) {
  const variantClass = {
    winner:
      'bg-winnerBg text-winner font-medium text-xs tracking-wider px-2.5 py-0.5 rounded-full uppercase',
    loser:
      'bg-surfaceAlt text-textMuted font-medium text-xs tracking-wider px-2.5 py-0.5 rounded-full uppercase',
    accent:
      'bg-accentLight text-accent font-medium text-xs tracking-wider px-2.5 py-0.5 rounded-full uppercase',
    neutral:
      'bg-surfaceAlt text-textSecond font-medium text-xs tracking-wider px-2.5 py-0.5 rounded-full uppercase',
  }[variant];

  return <span className={`${variantClass} ${className}`}>{children}</span>;
}
