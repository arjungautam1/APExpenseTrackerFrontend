import React from 'react';
import { Transaction } from '../../types';
import { useCurrencyFormatter } from '../../utils/currency';
import { formatTransactionDescription } from '../../utils/transactionNameFormatter';
import { Pencil, Trash2 } from 'lucide-react';

interface TransactionListProps {
  items: Transaction[];
  onEdit?: (t: Transaction) => void;
  onDelete?: (t: Transaction) => void;
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export function TransactionList({ items, onEdit, onDelete }: TransactionListProps) {
  const { formatCurrency } = useCurrencyFormatter();
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No transactions found</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile – stacked cards */}
      <div className="md:hidden space-y-2">
        {items.map((t) => {
          const primaryText = (t.description && t.description.trim().length > 0)
            ? formatTransactionDescription(t.description)
            : (t.category?.name || 'Transaction');
          const showCategoryChip = Boolean(t.description && t.description.trim().length > 0);
          return (
          <div
            key={t.id}
            className="rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all duration-200 bg-white active:scale-[0.98]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm leading-tight truncate">
                  {primaryText}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                  {showCategoryChip && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-gray-700 text-xs">
                      <span
                        className="mr-1.5 h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: t.category?.color || '#9CA3AF' }}
                      />
                      <span className="truncate max-w-20">{t.category?.name || 'Unknown'}</span>
                    </span>
                  )}
                  <span className="text-gray-500 text-xs">{formatDate(t.date)}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${
                      t.type === 'income'
                        ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                        : t.type === 'investment'
                        ? 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20'
                        : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                    }`}
                  >
                    {t.type}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <p
                  className={`text-sm font-semibold leading-tight transition-all duration-300 ${
                    t.type === 'income' 
                      ? 'text-green-600 group-hover:text-green-700' 
                      : t.type === 'investment'
                      ? 'text-purple-600 group-hover:text-purple-700 group-hover:scale-105'
                      : 'text-red-600 group-hover:text-red-700'
                  }`}
                >
                  {t.type === 'income' ? '+' : t.type === 'investment' ? '⬆' : '-'}{formatCurrency(t.amount)}
                </p>
                <div className="flex items-center gap-1">
                  {onEdit && (
                    <button
                      className="rounded-md border border-gray-200 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation"
                      aria-label="Edit"
                      onClick={() => onEdit(t)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="rounded-md border border-red-200 p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors touch-manipulation"
                      aria-label="Delete"
                      onClick={() => onDelete(t)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );})}
      </div>

      {/* Desktop – modern table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full table-fixed border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-200 first:rounded-tl-lg">Description</th>
              <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-200 w-56">Category</th>
              <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-200 w-36">Date</th>
              <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-200 w-28">Type</th>
              <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b border-gray-200 w-40">Amount</th>
              <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b border-gray-200 w-28 last:rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {items.map((t, index) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-4 py-3 align-middle">
                  <p className="font-medium text-gray-900 truncate">
                    {(t.description && t.description.trim().length > 0) ? formatTransactionDescription(t.description) : (t.category?.name || 'Transaction')}
                  </p>
                </td>
                <td className="px-4 py-3 align-middle">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-sm text-gray-700">
                    <span
                      className="mr-2 h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: t.category?.color || '#9CA3AF' }}
                    />
                    <span className="truncate">{t.category?.name || 'Unknown Category'}</span>
                  </span>
                </td>
                <td className="px-4 py-3 align-middle text-sm text-gray-600">{formatDate(t.date)}</td>
                <td className="px-4 py-3 align-middle">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      t.type === 'income'
                        ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                        : t.type === 'investment'
                        ? 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20'
                        : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                    }`}
                  >
                    {t.type}
                  </span>
                </td>
                <td className="px-4 py-3 align-middle text-right">
                  <span
                    className={`text-sm font-semibold ${
                      t.type === 'income' 
                        ? 'text-green-600' 
                        : t.type === 'investment'
                        ? 'text-purple-600'
                        : 'text-red-600'
                    }`}
                  >
                    {t.type === 'income' ? '+' : t.type === 'investment' ? '⬆' : '-'}{formatCurrency(t.amount)}
                  </span>
                </td>
                <td className="px-4 py-3 align-middle text-right">
                  <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                      <button
                        className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                        aria-label="Edit"
                        onClick={() => onEdit(t)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="rounded-lg border border-red-200 p-2 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label="Delete"
                        onClick={() => onDelete(t)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}


