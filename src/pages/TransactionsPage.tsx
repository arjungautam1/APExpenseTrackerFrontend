import React, { useEffect, useState, useMemo } from 'react';
import { transactionService } from '../services/transaction';
import { Transaction } from '../types';
import { TransactionFilters, TransactionFilterState } from '../components/Transactions/TransactionFilters';
import { TransactionList } from '../components/Transactions/TransactionList';
import { TransactionEditModal } from '../components/Transactions/TransactionEditModal';
import { ConfirmDialog } from '../components/Common/ConfirmDialog';
import toast from 'react-hot-toast';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilterState>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);

  // Calculate totals based on filtered transactions
  const totals = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const investment = transactions
      .filter(t => t.type === 'investment')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const transfer = transactions
      .filter(t => t.type === 'transfer')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, investment, transfer };
  }, [transactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Convert month/year filters to date ranges
      let startDate = filters.startDate;
      let endDate = filters.endDate;
      
      if (filters.month && filters.year) {
        startDate = `${filters.year}-${filters.month}-01`;
        const lastDay = new Date(parseInt(filters.year), parseInt(filters.month), 0).getDate();
        endDate = `${filters.year}-${filters.month}-${lastDay}`;
      } else if (filters.year) {
        startDate = `${filters.year}-01-01`;
        endDate = `${filters.year}-12-31`;
      } else if (filters.month) {
        // If only month is selected, use current year
        const currentYear = new Date().getFullYear();
        startDate = `${currentYear}-${filters.month}-01`;
        const lastDay = new Date(currentYear, parseInt(filters.month), 0).getDate();
        endDate = `${currentYear}-${filters.month}-${lastDay}`;
      }
      
      const res = await transactionService.getTransactions({
        type: filters.type,
        categoryId: filters.categoryId,
        startDate,
        endDate,
        limit: 20,
        page: 1
      });
      setTransactions(res.data);
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type, filters.categoryId, filters.startDate, filters.endDate, filters.month, filters.year]);

  const clearFilters = () => setFilters({});

  const handleEdit = (t: Transaction) => setEditing(t);
  const handleDelete = (t: Transaction) => {
    setPendingDelete(t);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete || deletingId) return;
    try {
      setDeletingId(pendingDelete.id);
      await transactionService.deleteTransaction(pendingDelete.id);
      toast.success('Transaction deleted');
      setConfirmOpen(false);
      setPendingDelete(null);
      fetchTransactions();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to delete transaction';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-4 py-4 sm:px-6 lg:px-8">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Transactions</h1>
      </div>

      <div className="space-y-4">
        <TransactionFilters value={filters} onChange={setFilters} onClear={clearFilters} />

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Transaction List</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 text-xs">
                  {totals.income > 0 && (
                    <span className="text-green-600 font-medium">
                      +{formatCurrency(totals.income)}
                    </span>
                  )}
                  {totals.expense > 0 && (
                    <span className="text-red-600 font-medium">
                      -{formatCurrency(totals.expense)}
                    </span>
                  )}
                  {totals.investment > 0 && (
                    <span className="text-purple-600 font-medium">
                      ⬆{formatCurrency(totals.investment)}
                    </span>
                  )}
                  {totals.transfer > 0 && (
                    <span className="text-blue-600 font-medium">
                      ⇄{formatCurrency(totals.transfer)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{transactions.length} transactions</span>
              </div>
            </div>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded" />
                ))}
              </div>
            ) : (
              <TransactionList items={transactions} onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </div>
        </div>
      </div>

      {editing && (
        <TransactionEditModal
          transaction={editing}
          onClose={() => setEditing(null)}
          onSaved={fetchTransactions}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete transaction?"
        description={pendingDelete ? `This will permanently delete "${pendingDelete.description || 'transaction'}".` : 'This will permanently delete the transaction.'}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={!!deletingId}
        onConfirm={confirmDelete}
        onClose={() => { setConfirmOpen(false); setPendingDelete(null); }}
      />
    </div>
  );
}