'use client';

import React from 'react';

interface VoteButtonProps {
  side: 'left' | 'right';
  watchName: string;
  votes: number;
  userVote: 'left' | 'right' | null;
  onVote: (side: 'left' | 'right') => void;
  disabled?: boolean;
}

export function VoteButton({
  side,
  watchName,
  votes,
  userVote,
  onVote,
  disabled = false,
}: VoteButtonProps) {
  const isActive = userVote === side;
  const isDisabledState = disabled || (userVote !== null && !isActive);

  const buttonClass = isActive
    ? 'bg-accent text-white border-accent'
    : isDisabledState
    ? 'bg-surface text-textMuted border-border'
    : 'bg-surface text-textPrimary border-border hover:border-accent/40';

  return (
    <button
      onClick={() => onVote(side)}
      disabled={isDisabledState}
      className={`flex flex-col items-center gap-1 px-5 py-3 rounded-lg border font-semibold text-sm transition-all ${buttonClass}`}
    >
      <span className="truncate">{watchName}</span>
      <span
        className={`text-xs ${isActive ? 'text-white' : 'text-textMuted'}`}
      >
        {votes.toLocaleString()} vote{votes !== 1 ? 's' : ''}
      </span>
    </button>
  );
}
