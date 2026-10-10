import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 focus:ring-indigo-500',
    secondary:
      'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/60 focus:ring-zinc-500',
    outline:
      'bg-transparent hover:bg-zinc-900 text-zinc-200 border border-zinc-700 hover:border-zinc-500 focus:ring-zinc-400',
    danger:
      'bg-rose-600/90 hover:bg-rose-600 text-white shadow-lg shadow-rose-600/20 focus:ring-rose-500',
    ghost:
      'bg-transparent hover:bg-zinc-800/60 text-zinc-300 hover:text-white focus:ring-zinc-500',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

