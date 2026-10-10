import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center max-w-md mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-zinc-100 mb-1.5">{title}</h3>
      <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

