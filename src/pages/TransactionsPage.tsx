import React, { useEffect, useState } from 'react';
import { transactionService } from '../services/transaction';
import { Transaction } from '../types';
import { TransactionFilters, TransactionFilterState } from '../components/Transactions/TransactionFilters';
import { TransactionList } from '../components/Transactions/TransactionList';
import { TransactionEditModal } from '../components/Transactions/TransactionEditModal';
import { ConfirmDialog } from '../components/Common/ConfirmDialog';
import toast from 'react-hot-toast';

export function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilterState>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);

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
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600">Manage your income, expenses, and investments</p>
      </div>

      <div className="space-y-6">
        <TransactionFilters value={filters} onChange={setFilters} onClear={clearFilters} />

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Results</h3>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="space-y-3">
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