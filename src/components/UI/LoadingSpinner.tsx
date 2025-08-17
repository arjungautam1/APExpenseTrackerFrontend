import React from 'react';
import { Loader2, Sparkles, TrendingUp, TrendingDown, Building } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'success' | 'error' | 'warning' | 'investment';
  text?: string;
  showIcon?: boolean;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  text, 
  showIcon = false,
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const variantClasses = {
    default: 'border-primary-600',
    success: 'border-green-600',
    error: 'border-red-600',
    warning: 'border-yellow-600',
    investment: 'border-purple-600'
  };

  const getIcon = () => {
    if (!showIcon) return null;
    
    const iconClasses = sizeClasses[size];
    switch (variant) {
      case 'success':
        return <TrendingUp className={`${iconClasses} text-green-600`} />;
      case 'error':
        return <TrendingDown className={`${iconClasses} text-red-600`} />;
      case 'investment':
        return <Building className={`${iconClasses} text-purple-600`} />;
      default:
        return <Sparkles className={`${iconClasses} text-primary-600`} />;
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="relative inline-block">
          <Loader2 
            className={`${sizeClasses[size]} animate-spin ${variantClasses[variant]} border-2 border-t-transparent rounded-full`}
          />
          {showIcon && (
            <div className="absolute inset-0 flex items-center justify-center">
              {getIcon()}
            </div>
          )}
        </div>
        {text && (
          <p className="mt-2 text-sm text-gray-600 font-medium">{text}</p>
        )}
      </div>
    </div>
  );
}

// Modern skeleton loader component
interface SkeletonProps {
  className?: string;
  lines?: number;
  variant?: 'text' | 'card' | 'list';
}

export function Skeleton({ className = '', lines = 1, variant = 'text' }: SkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg h-32"></div>
        <div className="mt-3 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`animate-pulse space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
      ))}
    </div>
  );
}

// Modern progress bar component
interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'error' | 'warning';
}

export function ProgressBar({ 
  progress, 
  className = '', 
  showLabel = false,
  variant = 'default'
}: ProgressBarProps) {
  const variantClasses = {
    default: 'bg-primary-600',
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600'
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full ${variantClasses[variant]} transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
