import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, TrendingUp, TrendingDown, Building, DollarSign, Calendar, Tag, X } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface TransactionSuccessNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  transaction: {
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
  duration = 4000
}: TransactionSuccessNotificationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      
      if (autoHide) {
        const timer = setTimeout(() => {
          onClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setShowConfetti(false);
    }
  }, [isVisible, autoHide, duration, onClose]);

  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'income':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'expense':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'investment':
        return <Building className="h-5 w-5 text-purple-500" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = () => {
    switch (transaction.type) {
      case 'income':
        return 'from-green-50 to-emerald-50 border-green-200';
      case 'expense':
        return 'from-red-50 to-rose-50 border-red-200';
      case 'investment':
        return 'from-purple-50 to-violet-50 border-purple-200';
      default:
        return 'from-gray-50 to-slate-50 border-gray-200';
    }
  };

  const getTypeTextColor = () => {
    switch (transaction.type) {
      case 'income':
        return 'text-green-700';
      case 'expense':
        return 'text-red-700';
      case 'investment':
        return 'text-purple-700';
      default:
        return 'text-gray-700';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 300 
          }}
          className="fixed top-4 right-4 z-[9999] max-w-sm w-full"
        >
          {/* Success Card */}
          <div className={`bg-gradient-to-br ${getTypeColor()} rounded-xl shadow-2xl border backdrop-blur-sm relative overflow-hidden`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-current rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-current rounded-full translate-y-12 -translate-x-12"></div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>

            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-white/80 shadow-sm">
                    {getTypeIcon()}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${getTypeTextColor()}`}>
                      {getTypeLabel()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                
                {/* Success Checkmark */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: 0.3,
                    type: "spring", 
                    damping: 15, 
                    stiffness: 200 
                  }}
                  className="p-2 rounded-full bg-green-100"
                >
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </motion.div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-3">
                {/* Amount */}
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Amount</span>
                  </div>
                  <span className={`font-bold text-lg ${getTypeTextColor()}`}>
                    {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                  </span>
                </div>

                {/* Description */}
                {transaction.description && (
                  <div className="flex items-center space-x-2 p-3 bg-white/40 rounded-lg">
                    <div className="flex-shrink-0 w-4 h-4 text-gray-500">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-700 truncate">
                      {transaction.description}
                    </span>
                  </div>
                )}

                {/* Category */}
                {transaction.category && (
                  <div className="flex items-center space-x-2 p-3 bg-white/40 rounded-lg">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {transaction.category.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, ease: 'linear' }}
                className="h-1 bg-white/30 rounded-full mt-4 overflow-hidden"
              >
                <div className={`h-full ${getTypeTextColor().replace('text-', 'bg-')} rounded-full`}></div>
              </motion.div>
            </div>
          </div>

          {/* Confetti Effect */}
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="absolute top-2 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              <div className="absolute top-1 right-1/4 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-3 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.7s' }}></div>
            </motion.div>
          )}
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
