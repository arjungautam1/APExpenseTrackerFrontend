import React from 'react';
import { Transaction } from '../../types';
import { useCurrencyFormatter } from '../../utils/currency';
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
      <div className="md:hidden space-y-3">
        {items.map((t) => {
          const primaryText = (t.description && t.description.trim().length > 0)
            ? t.description
            : (t.category?.name || 'Transaction');
          const showCategoryChip = Boolean(t.description && t.description.trim().length > 0);
          return (
          <div
            key={t.id}
            className="rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 pr-3">
                <p className="font-medium text-gray-900 truncate">
                  {primaryText}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                  {showCategoryChip && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                      <span
                        className="mr-2 h-2 w-2 rounded-full"
                        style={{ backgroundColor: t.category?.color || '#9CA3AF' }}
                      />
                      {t.category?.name || 'Unknown Category'}
                    </span>
                  )}
                  <span className="text-gray-500">{formatDate(t.date)}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
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
              <div className="flex flex-col items-end gap-2">
                <p
                  className={`text-base font-semibold ${
                    t.type === 'income' 
                      ? 'text-green-600' 
                      : t.type === 'investment'
                      ? 'text-purple-600'
                      : 'text-red-600'
                  }`}
                >
                  {t.type === 'income' ? '+' : t.type === 'investment' ? '⬆' : '-'}{formatCurrency(t.amount)}
                </p>
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <button
                      className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      aria-label="Edit"
                      onClick={() => onEdit(t)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="rounded-lg border border-red-200 p-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                      aria-label="Delete"
                      onClick={() => onDelete(t)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );})}
      </div>

      {/* Desktop – modern table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full table-fixed border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky top-0 z-10 bg-white px-4 py-3 text-left text-xs font-semibold text-gray-600 border-b border-gray-200">Description</th>
              <th className="sticky top-0 z-10 bg-white px-4 py-3 text-left text-xs font-semibold text-gray-600 border-b border-gray-200 w-56">Category</th>
              <th className="sticky top-0 z-10 bg-white px-4 py-3 text-left text-xs font-semibold text-gray-600 border-b border-gray-200 w-36">Date</th>
              <th className="sticky top-0 z-10 bg-white px-4 py-3 text-left text-xs font-semibold text-gray-600 border-b border-gray-200 w-28">Type</th>
              <th className="sticky top-0 z-10 bg-white px-4 py-3 text-right text-xs font-semibold text-gray-600 border-b border-gray-200 w-40">Amount</th>
              <th className="sticky top-0 z-10 bg-white px-4 py-3 text-right text-xs font-semibold text-gray-600 border-b border-gray-200 w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 align-middle">
                  <p className="font-medium text-gray-900 truncate">
                    {(t.description && t.description.trim().length > 0) ? t.description : (t.category?.name || 'Transaction')}
                  </p>
                </td>
                <td className="px-4 py-3 align-middle">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-sm text-gray-700">
                    <span
                      className="mr-2 h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: t.category?.color || '#9CA3AF' }}
                    />
                    {t.category?.name || 'Unknown Category'}
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
                  <div className="flex justify-end items-center gap-2">
                    {onEdit && (
                      <button
                        className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        aria-label="Edit"
                        onClick={() => onEdit(t)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="rounded-lg border border-red-200 p-2 text-red-500 hover:text-red-600 hover:bg-red-50"
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


