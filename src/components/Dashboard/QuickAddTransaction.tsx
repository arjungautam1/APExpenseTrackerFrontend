import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, Tag, FileText, X } from 'lucide-react';
import { transactionService } from '../../services/transaction';
import { categoryService } from '../../services/category';
import { Category } from '../../types';
import toast from 'react-hot-toast';

interface QuickAddTransactionProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export function QuickAddTransaction({ onClose, onSuccess }: QuickAddTransactionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch categories when modal opens or type changes
  useEffect(() => {
    if (isModalOpen) {
      fetchCategories();
    }
  }, [isModalOpen, formData.type]);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories for type:', formData.type);
      const fetchedCategories = await categoryService.getCategories(formData.type);
      console.log('Fetched categories:', fetchedCategories);
      setCategories(fetchedCategories);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      console.error('Categories error response:', error.response?.data);
      toast.error('Failed to load categories');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'type' && { categoryId: '' }) // Reset category when type changes
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const transactionData = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        categoryId: formData.categoryId,
        description: formData.description.trim() || undefined,
        date: formData.date
      };

      await transactionService.createTransaction(transactionData);
      
      toast.success(`${formData.type === 'income' ? 'Income' : 'Expense'} added successfully!`);
      
      // Reset form
      setFormData({
        amount: '',
        type: 'expense',
        categoryId: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      setIsModalOpen(false);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error: any) {
      console.error('Failed to create transaction:', error);
      console.log('Error response:', error.response?.data);
      console.log('Transaction data sent:', {
        amount: parseFloat(formData.amount),
        type: formData.type,
        categoryId: formData.categoryId,
        description: formData.description,
        date: formData.date
      });
      
      let message = 'Failed to add transaction';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.errors) {
        message = typeof error.response.data.errors === 'object' 
          ? Object.values(error.response.data.errors).join(', ')
          : error.response.data.errors;
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    console.log('Opening Quick Add Transaction modal');
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    if (onClose) onClose();
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <>
      {/* Quick Add Button */}
      <button
        onClick={openModal}
        className="btn-primary flex items-center space-x-2"
      >
        <Plus className="h-4 w-4" />
        <span>Quick Add</span>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={closeModal} />
            
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Add Transaction</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Transaction Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="expense"
                        checked={formData.type === 'expense'}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Expense</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="income"
                        checked={formData.type === 'income'}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Income</span>
                    </label>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
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
                      {filteredCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="input pl-10 resize-none"
                      placeholder="Add a note about this transaction..."
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`btn flex-1 ${
                      formData.type === 'expense' 
                        ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' 
                        : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </div>
                    ) : (
                      `Add ${formData.type === 'expense' ? 'Expense' : 'Income'}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}