import React from 'react';
import styles from './Card/Card.module.css';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  interactive?: boolean;
  loading?: boolean;
  className?: string;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default',
  size = 'md',
  hover = false,
  interactive = false,
  loading = false,
  className = ''
}) => {
  const sizeMap = {
    sm: 'small',
    md: 'medium',
    lg: 'large'
  } as const;

  const classNames = [
    styles.card,
    styles[variant],
    styles[sizeMap[size]],
    hover ? styles.hover : '',
    interactive ? styles.interactive : '',
    loading ? styles.loading : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      {children}
    </div>
  );
};

export default Card;