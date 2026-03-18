'use client';

import React from 'react';

interface SpecRowProps {
  label: string;
  value1: string | number;
  value2: string | number;
  watch1Name?: string;
  watch2Name?: string;
  winner?: 1 | 2 | null;
  highlight?: boolean;
}

export function SpecRow({
  label,
  value1,
  value2,
  watch1Name,
  watch2Name,
  winner,
  highlight = false,
}: SpecRowProps) {
  const bgClass = highlight ? 'bg-surfaceAlt' : '';

  const value1Class =
    winner === 1
      ? 'font-bold text-winner'
      : winner === 2
      ? 'text-textMuted'
      : 'text-textPrimary font-medium';

  const value2Class =
    winner === 2
      ? 'font-bold text-winner'
      : winner === 1
      ? 'text-textMuted'
      : 'text-textPrimary font-medium';

  return (
    <>
      {/* Desktop: 3-column grid */}
      <div className={`hidden sm:grid grid-cols-3 gap-2 py-3 border-b border-border text-sm ${bgClass}`}>
        <div className="text-textMuted text-xs text-center">{label}</div>
        <div className={`text-center ${value1Class}`}>{value1}</div>
        <div className={`text-center ${value2Class}`}>{value2}</div>
      </div>

      {/* Mobile: stacked card layout */}
      <div className={`sm:hidden border-b border-border py-3 px-4 ${bgClass}`}>
        <div className="text-xs text-textMuted font-semibold uppercase tracking-wider mb-2">{label}</div>
        <div className="flex justify-between gap-4">
          <div className="flex-1">
            {watch1Name && <div className="text-[10px] text-textMuted mb-0.5">{watch1Name}</div>}
            <div className={`text-sm ${value1Class}`}>{value1}</div>
          </div>
          <div className="flex-1 text-right">
            {watch2Name && <div className="text-[10px] text-textMuted mb-0.5">{watch2Name}</div>}
            <div className={`text-sm ${value2Class}`}>{value2}</div>
          </div>
        </div>
      </div>
    </>
  );
}
