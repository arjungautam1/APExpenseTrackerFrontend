import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, TrendingUp, TrendingDown, Building, X } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface TransactionSuccessNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  transaction?: {
    type: 'income' | 'expense' | 'investment';
    amount: number;
    description?: string;
    category?: {
      name: string;
      icon?: string;
      color?: string;
    };
    date: string;
  };
  autoHide?: boolean;
  duration?: number;
}

export function TransactionSuccessNotification({
  isVisible,
  onClose,
  transaction,
  autoHide = true,
  duration = 3000
}: TransactionSuccessNotificationProps) {
  useEffect(() => {
    if (isVisible && autoHide) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHide, duration, onClose]);

  // Don't render if no transaction data
  if (!transaction) {
    return null;
  }

  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'income':
        return <TrendingUp className="h-4 w-4" />;
      case 'expense':
        return <TrendingDown className="h-4 w-4" />;
      case 'investment':
        return <Building className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (transaction.type) {
      case 'income':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: 'text-green-600'
        };
      case 'expense':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: 'text-red-600'
        };
      case 'investment':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-700',
          icon: 'text-purple-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: 'text-gray-600'
        };
    }
  };

  const getTypeLabel = () => {
    switch (transaction.type) {
      case 'income':
        return 'Income added';
      case 'expense':
        return 'Expense recorded';
      case 'investment':
        return 'Investment added';
      default:
        return 'Transaction added';
    }
  };

  const colors = getTypeColor();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ 
            type: "spring", 
            damping: 20, 
            stiffness: 300 
          }}
          className="fixed top-4 right-4 z-[9999] max-w-sm w-full"
        >
          {/* Simple Success Toast */}
          <div className={`${colors.bg} border ${colors.border} rounded-lg shadow-lg backdrop-blur-sm`}>
            <div className="p-4">
              {/* Header with Icon and Close */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-md ${colors.icon} bg-white/60`}>
                    {getTypeIcon()}
                  </div>
                  <span className={`text-sm font-medium ${colors.text}`}>
                    {getTypeLabel()}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-md hover:bg-white/60 transition-colors"
                >
                  <X className="h-3 w-3 text-gray-500" />
                </button>
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  {transaction.description ? transaction.description : transaction.category?.name || 'Transaction'}
                </span>
                <span className={`font-semibold ${colors.text}`}>
                  {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                </span>
              </div>

              {/* Progress Bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className="h-0.5 bg-gray-200 rounded-full mt-3 overflow-hidden"
              >
                <div className={`h-full ${colors.text.replace('text-', 'bg-')} rounded-full`}></div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for easy transaction success notifications
export function useTransactionSuccessNotification() {
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    transaction?: {
      type: 'income' | 'expense' | 'investment';
      amount: number;
      description?: string;
      category?: {
        name: string;
        icon?: string;
        color?: string;
      };
      date: string;
    };
  }>({
    isVisible: false
  });

  const showSuccess = (transaction: {
    type: 'income' | 'expense' | 'investment';
    amount: number;
    description?: string;
    category?: {
      name: string;
      icon?: string;
      color?: string;
    };
    date: string;
  }) => {
    setNotification({
      isVisible: true,
      transaction
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  return {
    notification,
    showSuccess,
    hideNotification
  };
}
