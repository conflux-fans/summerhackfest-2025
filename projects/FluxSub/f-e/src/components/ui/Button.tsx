"use client";

import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary';
  color?: 'blue' | 'green' | 'purple' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({ 
  children, 
  href, 
  variant = 'primary', 
  color = 'blue', 
  size = 'md',
  onClick,
  className = '',
  style,
  disabled = false,
  type = 'button'
}: ButtonProps) {
  const colors = {
    blue: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    green: 'linear-gradient(135deg, #10b981, #059669)',
    purple: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    orange: 'linear-gradient(135deg, #f59e0b, #d97706)'
  };

  const shadowColors = {
    blue: 'rgba(59, 130, 246, 0.3)',
    green: 'rgba(16, 185, 129, 0.3)',
    purple: 'rgba(139, 92, 246, 0.3)',
    orange: 'rgba(245, 158, 11, 0.3)'
  };

  const sizes = {
    sm: { padding: '8px 16px', fontSize: '14px' },
    md: { padding: '14px 28px', fontSize: '16px' },
    lg: { padding: '16px 32px', fontSize: '18px' }
  };

  const baseStyles = {
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    fontFamily: 'var(--font-geist-sans)',
    cursor: 'pointer',
    ...sizes[size]
  };

  const primaryStyles = {
    ...baseStyles,
    background: colors[color],
    color: 'white',
    boxShadow: `0 4px 14px ${shadowColors[color]}`
  };

  const secondaryStyles = {
    ...baseStyles,
    background: 'var(--background)',
    color: 'var(--foreground)',
    border: '1px solid var(--gray-alpha-200)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  };

  const styles = variant === 'primary' ? primaryStyles : secondaryStyles;

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (variant === 'primary') {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = `0 8px 25px ${shadowColors[color].replace('0.3', '0.4')}`;
    } else {
      e.currentTarget.style.transform = 'translateY(-1px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (variant === 'primary') {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = `0 4px 14px ${shadowColors[color]}`;
    } else {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
    }
  };

  if (href) {
    return (
      <a
        href={href}
        style={styles}
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      style={{...styles, ...style}}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
    >
      {children}
    </button>
  );
}