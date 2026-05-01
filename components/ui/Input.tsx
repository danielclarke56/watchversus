import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function Input({ className = '', ...rest }: InputProps) {
  return (
    <input
      className={`w-full bg-surfaceAlt border border-borderStrong rounded-sm px-4 py-2.5 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors ${className}`}
      {...rest}
    />
  );
}
