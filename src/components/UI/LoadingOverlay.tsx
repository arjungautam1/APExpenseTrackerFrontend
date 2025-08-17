import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'investment';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBackdrop?: boolean;
  className?: string;
}

export function LoadingOverlay({ 
  isLoading, 
  text = 'Loading...', 
  variant = 'default',
  size = 'lg',
  showBackdrop = true,
  className = ''
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${showBackdrop ? 'bg-black/20 backdrop-blur-sm' : ''} ${className}`}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 animate-scale-in">
        <LoadingSpinner 
          size={size} 
          variant={variant} 
          text={text}
          showIcon={true}
        />
      </div>
    </div>
  );
}

// Modern skeleton card component
interface SkeletonCardProps {
  className?: string;
  lines?: number;
  showAvatar?: boolean;
  showActions?: boolean;
}

export function SkeletonCard({ 
  className = '', 
  lines = 3, 
  showAvatar = false,
  showActions = false 
}: SkeletonCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm ${className}`}>
      <div className="flex items-start space-x-4">
        {showAvatar && (
          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
        )}
        <div className="flex-1 space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div 
              key={i} 
              className="h-4 bg-gray-200 rounded animate-pulse"
              style={{ width: `${Math.random() * 40 + 60}%` }}
            ></div>
          ))}
        </div>
        {showActions && (
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
}

// Modern loading button component
interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'investment';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText = 'Loading...',
  variant = 'default',
  className = '',
  disabled = false,
  onClick,
  type = 'button'
}: LoadingButtonProps) {
  const baseClasses = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    default: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    error: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
    investment: "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500"
  };

  return (
    <button
      type={type}
      disabled={isLoading || disabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center">
          <LoadingSpinner size="sm" variant={variant} className="mr-2" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
