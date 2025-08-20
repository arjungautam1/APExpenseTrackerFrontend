import React, { useEffect, useState, useCallback } from 'react';
import { TransactionList } from '../components/Transactions/TransactionList';
import { TransactionFilters } from '../components/Transactions/TransactionFilters';
import { TransactionEditModal } from '../components/Transactions/TransactionEditModal';
import { ConfirmDialog } from '../components/Common/ConfirmDialog';
import { transactionService, TransactionFilters as Filters } from '../services/transaction';
import { Transaction } from '../types';
import { Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const fetchTransactions = useCallback(async (newFilters?: Filters) => {
    setLoading(true);
    try {
      const currentFilters = newFilters || filters;
      const res = await transactionService.getTransactions(currentFilters);
      setTransactions(res.data);
      setPagination(res.pagination);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFiltersChange = (newFilters: Filters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    fetchTransactions(updatedFilters);
  };

  const handlePageChange = (page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchTransactions(updatedFilters);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const handleDelete = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
    setShowDeleteDialog(true);
  };

  const handleEditSave = async (updatedTransaction: Transaction) => {
    try {
      await transactionService.updateTransaction(updatedTransaction.id, {
        amount: updatedTransaction.amount,
        type: updatedTransaction.type,
        categoryId: updatedTransaction.categoryId,
        description: updatedTransaction.description,
        date: updatedTransaction.date,
        location: updatedTransaction.location,
        tags: updatedTransaction.tags
      });
      
      setTransactions(prev => 
        prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
      );
      setShowEditModal(false);
      setEditingTransaction(null);
      toast.success('Transaction updated successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update transaction');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;
    
    try {
      await transactionService.deleteTransaction(deletingTransaction.id);
      setTransactions(prev => prev.filter(t => t.id !== deletingTransaction.id));
      setShowDeleteDialog(false);
      setDeletingTransaction(null);
      toast.success('Transaction deleted successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete transaction');
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600">Manage your income and expenses</p>
          </div>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setShowEditModal(true);
            }}
            className="btn btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <TransactionFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <TransactionList
            items={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <TransactionEditModal
          transaction={editingTransaction}
          onSave={handleEditSave}
          onCancel={() => {
            setShowEditModal(false);
            setEditingTransaction(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteDialog && deletingTransaction && (
        <ConfirmDialog
          title="Delete Transaction"
          message={`Are you sure you want to delete the transaction "${deletingTransaction.description || 'Untitled'}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteDialog(false);
            setDeletingTransaction(null);
          }}
        />
      )}
    </div>
  );
}