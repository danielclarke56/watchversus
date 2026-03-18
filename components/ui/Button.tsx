'use client';

import React from 'react';
import Link from 'next/link';

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const variantClass = {
    primary:
      'bg-accent text-white font-semibold rounded-md hover:bg-accentHover transition-colors',
    secondary:
      'bg-accent/10 text-accent font-semibold rounded-md hover:bg-accent/20 transition-colors',
    outline:
      'border border-accent text-accent font-semibold rounded-md hover:bg-accentLight transition-colors',
    ghost:
      'text-accent font-medium hover:underline transition-colors',
  }[variant];

  const sizeClass = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-7 py-3 text-base',
  }[size];

  const combinedClass = `${variantClass} ${sizeClass} ${className}`;

  if (href) {
    return (
      <Link href={href} className={`inline-block ${combinedClass}`}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClass} {...rest}>
      {children}
    </button>
  );
}
