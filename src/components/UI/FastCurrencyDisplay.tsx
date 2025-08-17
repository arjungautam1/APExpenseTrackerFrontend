import React, { useState, useEffect } from 'react';
import { useCurrencyFormatter } from '../../utils/currency';

interface FastCurrencyDisplayProps {
  amount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showAnimation?: boolean;
  animationDuration?: number;
  prefix?: string;
  suffix?: string;
  color?: 'default' | 'positive' | 'negative' | 'neutral';
}

export function FastCurrencyDisplay({
  amount,
  className = '',
  size = 'md',
  showAnimation = false,
  animationDuration = 0.8,
  prefix,
  suffix,
  color = 'default'
}: FastCurrencyDisplayProps) {
  const { formatCurrency } = useCurrencyFormatter();
  const [displayAmount, setDisplayAmount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl'
  };

  const colorClasses = {
    default: 'text-gray-900',
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  useEffect(() => {
    if (showAnimation && amount > 0) {
      setIsAnimating(true);
      const startTime = Date.now();
      const startAmount = 0;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / (animationDuration * 1000), 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentAmount = startAmount + (amount - startAmount) * easeOutQuart;
        
        setDisplayAmount(currentAmount);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayAmount(amount);
          setIsAnimating(false);
        }
      };
      
      requestAnimationFrame(animate);
    } else {
      setDisplayAmount(amount);
    }
  }, [amount, showAnimation, animationDuration]);

  const formattedAmount = formatCurrency(displayAmount);
  const finalDisplay = `${prefix || ''}${formattedAmount}${suffix || ''}`;

  return (
    <span 
      className={`font-bold ${sizeClasses[size]} ${colorClasses[color]} ${className} ${
        isAnimating ? 'transition-all duration-75' : ''
      }`}
    >
      {finalDisplay}
    </span>
  );
}

// Ultra-fast currency display without animations
export function InstantCurrencyDisplay({
  amount,
  className = '',
  size = 'md',
  color = 'default',
  prefix,
  suffix
}: Omit<FastCurrencyDisplayProps, 'showAnimation' | 'animationDuration'>) {
  const { formatCurrency } = useCurrencyFormatter();

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl'
  };

  const colorClasses = {
    default: 'text-gray-900',
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const formattedAmount = formatCurrency(amount);
  const finalDisplay = `${prefix || ''}${formattedAmount}${suffix || ''}`;

  return (
    <span className={`font-bold ${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
      {finalDisplay}
    </span>
  );
}

// Compact currency display for lists
export function CompactCurrencyDisplay({
  amount,
  type = 'expense',
  className = ''
}: {
  amount: number;
  type?: 'income' | 'expense' | 'investment';
  className?: string;
}) {
  const { formatCurrency } = useCurrencyFormatter();
  
  const colorClasses = {
    income: 'text-green-600',
    expense: 'text-red-600',
    investment: 'text-purple-600'
  };

  const prefix = type === 'income' ? '+' : type === 'investment' ? '⬆' : '-';

  return (
    <span className={`font-medium ${colorClasses[type]} ${className}`}>
      {prefix}{formatCurrency(amount)}
    </span>
  );
}

// Skeleton currency display for loading states
export function CurrencySkeleton({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-16',
    md: 'h-6 w-20',
    lg: 'h-8 w-24',
    xl: 'h-10 w-28'
  };

  return (
    <div className={`${sizeClasses[size]} bg-gray-200 rounded animate-pulse ${className}`} />
  );
}
