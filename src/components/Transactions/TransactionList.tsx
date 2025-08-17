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
      {/* Mobile – Compact Modern Cards */}
      <div className="md:hidden space-y-2">
        {items.map((t, index) => {
          const primaryText = (t.description && t.description.trim().length > 0)
            ? formatTransactionDescription(t.description)
            : (t.category?.name || 'Transaction');
          const showCategoryChip = Boolean(t.description && t.description.trim().length > 0);
          const colors = getTypeColor(t.type);
          
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`relative overflow-hidden rounded-lg border ${colors.border} ${colors.bg} ${colors.hover} transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]`}
            >
              <div className="relative p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {/* Main row - Icon, Title, Amount */}
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`p-1.5 rounded-md ${colors.bg} border ${colors.border}`}>
                        <div className={`${colors.icon} w-3.5 h-3.5`}>
                          {getTypeIcon(t.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm leading-tight truncate">
                          {primaryText}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-bold ${colors.amount}`}>
                          {t.type === 'income' ? '+' : t.type === 'investment' ? '⬆' : t.type === 'transfer' ? '⇄' : '-'}{formatCurrency(t.amount)}
                        </p>
                      </div>
                    </div>

                    {/* Secondary row - Category, Date, Type */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {showCategoryChip && (
                          <span className="inline-flex items-center rounded-full bg-white/60 backdrop-blur-sm border border-gray-200 px-2 py-0.5 text-xs text-gray-600">
                            <span
                              className="mr-1 h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: t.category?.color || '#9CA3AF' }}
                            />
                            <span className="truncate max-w-16">{t.category?.name || 'Unknown'}</span>
                          </span>
                        )}
                        <span className="text-gray-500 text-xs">
                          {formatDate(t.date)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors.text} bg-white/60 backdrop-blur-sm border ${colors.border}`}>
                          {t.type}
                        </span>
                        {(onEdit || onDelete) && (
                          <div className="flex items-center gap-0.5 ml-1">
                            {onEdit && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="rounded-md bg-white/60 backdrop-blur-sm border border-gray-200 p-1 text-gray-500 hover:text-gray-700 hover:bg-white transition-all duration-200"
                                aria-label="Edit"
                                onClick={() => onEdit(t)}
                              >
                                <Pencil className="h-3 w-3" />
                              </motion.button>
                            )}
                            {onDelete && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="rounded-md bg-white/60 backdrop-blur-sm border border-red-200 p-1 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                                aria-label="Delete"
                                onClick={() => onDelete(t)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </motion.button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Desktop – Compact Modern Table */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50/50 transition-all duration-200 group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-md ${colors.bg} border ${colors.border}`}>
                            <div className={`${colors.icon} w-3.5 h-3.5`}>
                              {getTypeIcon(t.type)}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {primaryText}
                            </p>
                            {t.location && (
                              <p className="text-xs text-gray-500 truncate">
                                📍 {t.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                          <span
                            className="mr-1.5 h-2 w-2 rounded-full"
                            style={{ backgroundColor: t.category?.color || '#9CA3AF' }}
                          />
                          <span className="truncate max-w-24">{t.category?.name || 'Unknown'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {formatDate(t.date)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-bold ${colors.amount}`}>
                          {t.type === 'income' ? '+' : t.type === 'investment' ? '⬆' : t.type === 'transfer' ? '⇄' : '-'}{formatCurrency(t.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          {onEdit && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="rounded-md bg-white border border-gray-200 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200"
                              aria-label="Edit"
                              onClick={() => onEdit(t)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </motion.button>
                          )}
                          {onDelete && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="rounded-md bg-white border border-red-200 p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                              aria-label="Delete"
                              onClick={() => onDelete(t)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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


