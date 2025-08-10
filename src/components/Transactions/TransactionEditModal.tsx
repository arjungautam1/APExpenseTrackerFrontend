import React, { useEffect, useState } from 'react';
import { DollarSign, Calendar, Tag, FileText, X } from 'lucide-react';
import { Transaction, Category } from '../../types';
import { categoryService } from '../../services/category';
import { transactionService } from '../../services/transaction';
import toast from 'react-hot-toast';

interface TransactionEditModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSaved: () => void;
}

export function TransactionEditModal({ transaction, onClose, onSaved }: TransactionEditModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense' | 'transfer' | 'investment',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Initialize from transaction
  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: String(transaction.amount),
        type: transaction.type,
        categoryId: transaction.categoryId,
        description: transaction.description || '',
        date: transaction.date ? transaction.date.substring(0, 10) : new Date().toISOString().split('T')[0]
      });
    }
  }, [transaction]);

  // Load categories when modal opens or type changes
  useEffect(() => {
    const loadCategories = async () => {
      try {
        if (formData.type === 'transfer') {
          setCategories([]);
          return;
        }
        const fetched = await categoryService.getCategories(formData.type);
        setCategories(fetched);
      } catch (e) {
        toast.error('Failed to load categories');
      }
    };
    loadCategories();
  }, [formData.type]);

  if (!transaction) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'type' ? { categoryId: '' } : {})
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await transactionService.updateTransaction(transaction.id, {
        amount: parseFloat(formData.amount),
        type: formData.type,
        categoryId: formData.categoryId,
        description: formData.description.trim() || undefined,
        date: formData.date
      });
      toast.success('Transaction updated');
      onSaved();
      onClose();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to update transaction';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Edit Transaction</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="flex space-x-4">
                {(['expense','income','investment','transfer'] as const).map((t) => (
                  <label key={t} className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      checked={formData.type === t}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="input pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="input pl-10"
                >
                  <option value="">Select a category</option>
                  {categories
                    .filter((c) => c.type === formData.type)
                    .map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="input pl-10 resize-none"
                  placeholder="Add a note..."
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={isSaving} className={`btn flex-1 ${formData.type === 'expense' ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'}`}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


