import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, Tag, FileText, X, TrendingUp, TrendingDown, Building } from 'lucide-react';
import { transactionService } from '../../services/transaction';
import { categoryService } from '../../services/category';
import { investmentService } from '../../services/investment';
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
    type: 'expense' as 'income' | 'expense' | 'investment',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    // Investment specific fields
    investmentType: 'other' as 'stocks' | 'mutual_funds' | 'crypto' | 'real_estate' | 'other',
    platform: ''
  });

  // Fetch categories when modal opens or type changes
  useEffect(() => {
    if (isModalOpen && (formData.type === 'income' || formData.type === 'expense')) {
      fetchCategories();
    }
  }, [isModalOpen, formData.type]);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories for type:', formData.type);
      const fetchedCategories = await categoryService.getCategories(formData.type);
      // Filter out Investment category from expenses
      const filteredCategories = fetchedCategories.filter(cat => 
        !(formData.type === 'expense' && cat.name === 'Investment')
      );
      console.log('Fetched categories:', filteredCategories);
      setCategories(filteredCategories);
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
      if (formData.type === 'investment') {
        // First, get the investment transaction category
        const investmentCategories = await categoryService.getCategories('investment');
        const investmentCategory = investmentCategories.find(cat => cat.name === 'Investment Transaction');
        
        if (!investmentCategory) {
          toast.error('Investment category not found. Please contact support.');
          return;
        }

        // Create both investment and transaction
        const [investmentData, transactionData] = await Promise.all([
          // Create investment record
          investmentService.createInvestment({
            name: formData.description.trim() || 'Quick Investment',
            type: formData.investmentType,
            amountInvested: parseFloat(formData.amount),
            purchaseDate: formData.date,
            platform: formData.platform.trim() || 'Quick Add'
          }),
          // Create transaction record
          transactionService.createTransaction({
            amount: parseFloat(formData.amount),
            type: 'investment',
            categoryId: investmentCategory.id,
            description: formData.description.trim() || 'Investment',
            date: formData.date
          })
        ]);

        toast.success('Investment added successfully!');
      } else {
        // Create transaction for income/expense
        const transactionData = {
          amount: parseFloat(formData.amount),
          type: formData.type,
          categoryId: formData.categoryId,
          description: formData.description.trim() || undefined,
          date: formData.date
        };

        await transactionService.createTransaction(transactionData);
        toast.success(`${formData.type === 'income' ? 'Income' : 'Expense'} added successfully!`);
      }
      
      // Reset form
      setFormData({
        amount: '',
        type: 'expense',
        categoryId: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        investmentType: 'other',
        platform: ''
      });
      
      setIsModalOpen(false);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error: any) {
      console.error('Failed to create:', error);
      console.log('Error response:', error.response?.data);
      
      let message = `Failed to add ${formData.type}`;
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
                {/* Transaction Type Tabs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Type
                  </label>
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: 'expense', categoryId: '' }))}
                      className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        formData.type === 'expense'
                          ? 'bg-white text-red-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <TrendingDown className="h-4 w-4 mr-1" />
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: 'income', categoryId: '' }))}
                      className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        formData.type === 'income'
                          ? 'bg-white text-green-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Income
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: 'investment', categoryId: '' }))}
                      className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        formData.type === 'investment'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Building className="h-4 w-4 mr-1" />
                      Investment
                    </button>
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

                {/* Category for Income/Expense */}
                {formData.type !== 'investment' && (
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
                )}

                {/* Investment Type */}
                {formData.type === 'investment' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Investment Type
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="investmentType"
                        value={formData.investmentType}
                        onChange={handleChange}
                        required
                        className="input pl-10"
                      >
                        <option value="stocks">Stocks</option>
                        <option value="mutual_funds">Mutual Funds</option>
                        <option value="crypto">Cryptocurrency</option>
                        <option value="real_estate">Real Estate</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                )}

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

                {/* Platform for Investments */}
                {formData.type === 'investment' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform (Optional)
                    </label>
                    <input
                      type="text"
                      name="platform"
                      value={formData.platform}
                      onChange={handleChange}
                      className="input"
                      placeholder="e.g., Robinhood, Fidelity, Vanguard"
                    />
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.type === 'investment' ? 'Investment Name' : 'Description (Optional)'}
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="input pl-10 resize-none"
                      placeholder={formData.type === 'investment' ? 'e.g., Apple Stock, S&P 500 ETF' : 'Add a note about this transaction...'}
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
                        : formData.type === 'income'
                        ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                        : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </div>
                    ) : (
                      `Add ${formData.type === 'expense' ? 'Expense' : formData.type === 'income' ? 'Income' : 'Investment'}`
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