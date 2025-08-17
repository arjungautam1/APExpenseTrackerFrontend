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
  duration = 2000
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
        return <TrendingUp className="h-5 w-5" />;
      case 'expense':
        return <TrendingDown className="h-5 w-5" />;
      case 'investment':
        return <Building className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  const getTypeColor = () => {
    switch (transaction.type) {
      case 'income':
        return {
          bg: 'bg-emerald-500',
          border: 'border-emerald-500',
          text: 'text-emerald-600',
          icon: 'text-white',
          accent: 'bg-emerald-50'
        };
      case 'expense':
        return {
          bg: 'bg-rose-500',
          border: 'border-rose-500',
          text: 'text-rose-600',
          icon: 'text-white',
          accent: 'bg-rose-50'
        };
      case 'investment':
        return {
          bg: 'bg-violet-500',
          border: 'border-violet-500',
          text: 'text-violet-600',
          icon: 'text-white',
          accent: 'bg-violet-50'
        };
      default:
        return {
          bg: 'bg-slate-500',
          border: 'border-slate-500',
          text: 'text-slate-600',
          icon: 'text-white',
          accent: 'bg-slate-50'
        };
    }
  };

  const getTypeLabel = () => {
    switch (transaction.type) {
      case 'income':
        return 'Income Added';
      case 'expense':
        return 'Expense Recorded';
      case 'investment':
        return 'Investment Added';
      default:
        return 'Transaction Added';
    }
  };

  const colors = getTypeColor();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            damping: 15, 
            stiffness: 400,
            duration: 0.3
          }}
          className="fixed top-6 right-6 z-[9999] max-w-sm w-full"
        >
          {/* Modern Success Toast */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header with colored accent */}
            <div className={`${colors.bg} p-4 relative`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                    {getTypeIcon()}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {getTypeLabel()}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {transaction.description ? transaction.description : transaction.category?.name || 'Transaction'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
              
              {/* Success checkmark */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.1,
                  type: "spring", 
                  damping: 15, 
                  stiffness: 200 
                }}
                className="absolute -bottom-3 right-6 p-2 rounded-full bg-white shadow-lg"
              >
                <CheckCircle className="h-5 w-5 text-green-500" />
              </motion.div>
            </div>

            {/* Amount and details */}
            <div className="p-4 pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Amount</span>
                <span className={`text-2xl font-bold ${colors.text}`}>
                  {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                </span>
              </div>

              {/* Progress bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className="h-1 bg-gray-200 rounded-full overflow-hidden"
              >
                <div className={`h-full ${colors.bg} rounded-full`}></div>
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
