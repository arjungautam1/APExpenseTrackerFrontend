import React from 'react';
import { Transaction } from '../../types';
import { useCurrencyFormatter } from '../../utils/currency';
import { formatTransactionDescription } from '../../utils/transactionNameFormatter';
import { Pencil, Trash2, TrendingUp, TrendingDown, Building, Send, Calendar, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface TransactionListProps {
  items: Transaction[];
  onEdit?: (t: Transaction) => void;
  onDelete?: (t: Transaction) => void;
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'income':
      return <TrendingUp className="h-4 w-4" />;
    case 'expense':
      return <TrendingDown className="h-4 w-4" />;
    case 'investment':
      return <Building className="h-4 w-4" />;
    case 'transfer':
      return <Send className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'income':
      return {
        bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: 'text-green-600',
        amount: 'text-green-600',
        hover: 'hover:from-green-100 hover:to-emerald-100'
      };
    case 'expense':
      return {
        bg: 'bg-gradient-to-r from-red-50 to-rose-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: 'text-red-600',
        amount: 'text-red-600',
        hover: 'hover:from-red-100 hover:to-rose-100'
      };
    case 'investment':
      return {
        bg: 'bg-gradient-to-r from-purple-50 to-violet-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        icon: 'text-purple-600',
        amount: 'text-purple-600',
        hover: 'hover:from-purple-100 hover:to-violet-100'
      };
    case 'transfer':
      return {
        bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: 'text-blue-600',
        amount: 'text-blue-600',
        hover: 'hover:from-blue-100 hover:to-cyan-100'
      };
    default:
      return {
        bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        icon: 'text-gray-600',
        amount: 'text-gray-600',
        hover: 'hover:from-gray-100 hover:to-slate-100'
      };
  }
};

export function TransactionList({ items, onEdit, onDelete }: TransactionListProps) {
  const { formatCurrency } = useCurrencyFormatter();
  
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Calendar className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
        <p className="text-gray-500">Start by adding your first transaction</p>
      </motion.div>
    );
  }

  return (
    <>
      {/* Mobile – Modern Cards */}
      <div className="md:hidden space-y-3">
        {items.map((t, index) => {
          const primaryText = (t.description && t.description.trim().length > 0)
            ? formatTransactionDescription(t.description)
            : (t.category?.name || 'Transaction');
          const showCategoryChip = Boolean(t.description && t.description.trim().length > 0);
          const colors = getTypeColor(t.type);
          
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative overflow-hidden rounded-xl border ${colors.border} ${colors.bg} ${colors.hover} transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-current rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-current rounded-full translate-y-12 -translate-x-12"></div>
              </div>

              <div className="relative p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {/* Transaction Icon and Type */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
                        <div className={colors.icon}>
                          {getTypeIcon(t.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-base leading-tight truncate">
                          {primaryText}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${colors.text} bg-white/60 backdrop-blur-sm border ${colors.border}`}>
                            {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                          </span>
                          <span className="text-gray-500 text-xs flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(t.date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Category and Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      {showCategoryChip && (
                        <span className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 px-3 py-1.5 text-sm text-gray-700">
                          <span
                            className="mr-2 h-2 w-2 rounded-full"
                            style={{ backgroundColor: t.category?.color || '#9CA3AF' }}
                          />
                          <span className="truncate max-w-24">{t.category?.name || 'Unknown'}</span>
                        </span>
                      )}
                      {t.tags && t.tags.length > 0 && (
                        <div className="flex gap-1">
                          {t.tags.slice(0, 2).map((tag, tagIndex) => (
                            <span key={tagIndex} className="inline-flex items-center rounded-full bg-white/60 backdrop-blur-sm border border-gray-200 px-2 py-1 text-xs text-gray-600">
                              #{tag}
                            </span>
                          ))}
                          {t.tags.length > 2 && (
                            <span className="inline-flex items-center rounded-full bg-white/60 backdrop-blur-sm border border-gray-200 px-2 py-1 text-xs text-gray-500">
                              +{t.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amount and Actions */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${colors.amount} transition-all duration-300`}>
                        {t.type === 'income' ? '+' : t.type === 'investment' ? '⬆' : t.type === 'transfer' ? '⇄' : '-'}{formatCurrency(t.amount)}
                      </p>
                      {t.location && (
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-24">
                          📍 {t.location}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 p-2 text-gray-500 hover:text-gray-700 hover:bg-white transition-all duration-200 shadow-sm"
                          aria-label="Edit"
                          onClick={() => onEdit(t)}
                        >
                          <Pencil className="h-4 w-4" />
                        </motion.button>
                      )}
                      {onDelete && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="rounded-lg bg-white/80 backdrop-blur-sm border border-red-200 p-2 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 shadow-sm"
                          aria-label="Delete"
                          onClick={() => onDelete(t)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Desktop – Modern Table */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {items.map((t, index) => {
                  const primaryText = (t.description && t.description.trim().length > 0)
                    ? formatTransactionDescription(t.description)
                    : (t.category?.name || 'Transaction');
                  const colors = getTypeColor(t.type);
                  
                  return (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/50 transition-all duration-200 group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
                            <div className={colors.icon}>
                              {getTypeIcon(t.type)}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {primaryText}
                            </p>
                            {t.location && (
                              <p className="text-sm text-gray-500 truncate">
                                📍 {t.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700">
                          <span
                            className="mr-2 h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: t.category?.color || '#9CA3AF' }}
                          />
                          <span className="truncate">{t.category?.name || 'Unknown Category'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(t.date)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ${colors.text} ${colors.bg} border ${colors.border}`}>
                          {getTypeIcon(t.type)}
                          <span className="ml-1.5">{t.type.charAt(0).toUpperCase() + t.type.slice(1)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-lg font-bold ${colors.amount} transition-all duration-300`}>
                          {t.type === 'income' ? '+' : t.type === 'investment' ? '⬆' : t.type === 'transfer' ? '⇄' : '-'}{formatCurrency(t.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          {onEdit && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="rounded-lg bg-white border border-gray-200 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm"
                              aria-label="Edit"
                              onClick={() => onEdit(t)}
                            >
                              <Pencil className="h-4 w-4" />
                            </motion.button>
                          )}
                          {onDelete && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="rounded-lg bg-white border border-red-200 p-2 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 shadow-sm"
                              aria-label="Delete"
                              onClick={() => onDelete(t)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}


