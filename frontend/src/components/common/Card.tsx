import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  bordered = true,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-zinc-900/90 rounded-2xl ${
        bordered ? 'border border-zinc-800/80' : ''
      } ${
        hoverable
          ? 'transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

