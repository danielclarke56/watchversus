'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  as?: 'div' | 'article';
}

export function Card({
  children,
  className = '',
  hover = false,
  as: Component = 'div',
}: CardProps) {
  const hoverClass = hover
    ? 'hover:border-accent/40 hover:shadow-sm transition-all duration-200'
    : '';

  return React.createElement(
    Component,
    {
      className: `bg-surface border border-border rounded-lg overflow-hidden ${hoverClass} ${className}`,
    },
    children
  );
}
