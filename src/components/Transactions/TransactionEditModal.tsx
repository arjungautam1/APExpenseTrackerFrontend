import React, { useEffect, useState } from 'react';
import { DollarSign, Calendar, Tag, FileText, X, Sparkles, TrendingUp, TrendingDown, Building, Send, Save, ArrowLeft } from 'lucide-react';
import { Transaction, Category } from '../../types';
import { categoryService } from '../../services/category';
import { transactionService } from '../../services/transaction';
import { aiService } from '../../services/ai';
import toast from 'react-hot-toast';
import { CategorySelect } from '../Common/CategorySelect';
import { motion, AnimatePresence } from 'framer-motion';

interface TransactionEditModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSaved: () => void;
}

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
      return <Tag className="h-4 w-4" />;
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
        button: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
        ring: 'focus:ring-green-500'
      };
    case 'expense':
      return {
        bg: 'bg-gradient-to-r from-red-50 to-rose-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: 'text-red-600',
        button: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700',
        ring: 'focus:ring-red-500'
      };
    case 'investment':
      return {
        bg: 'bg-gradient-to-r from-purple-50 to-violet-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        icon: 'text-purple-600',
        button: 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700',
        ring: 'focus:ring-purple-500'
      };
    case 'transfer':
      return {
        bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: 'text-blue-600',
        button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
        ring: 'focus:ring-blue-500'
      };
    default:
      return {
        bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        icon: 'text-gray-600',
        button: 'bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700',
        ring: 'focus:ring-gray-500'
      };
  }
};

export function TransactionEditModal({ transaction, onClose, onSaved }: TransactionEditModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);
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
      // Fix timezone issue by properly converting the date
      let formattedDate = new Date().toISOString().split('T')[0]; // Default to today
      
      if (transaction.date) {
        // Create a date object and format it properly to avoid timezone issues
        const dateObj = new Date(transaction.date);
        // Use toLocaleDateString to get the date in local timezone
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
      }
      
      setFormData({
        amount: String(transaction.amount),
        type: transaction.type,
        categoryId: transaction.categoryId,
        description: transaction.description || '',
        date: formattedDate
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

  const colors = getTypeColor(formData.type);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'type' ? { categoryId: '' } : {})
    }));

    // Auto-categorize when description changes and has enough content
    if (name === 'description' && value.trim().length >= 3) {
      handleAutoCategorize(value.trim());
    }
  };

  const handleAutoCategorize = async (description: string) => {
    if (!description || description.length < 3) return;
    
    try {
      setIsAutoCategorizing(true);
      console.log('Auto-categorizing:', description);
      
      const result = await aiService.autoCategorize({
        description,
        amount: formData.amount ? parseFloat(formData.amount) : undefined
      });

      console.log('Auto-categorization result:', result);

      if (result.categoryId && result.confidence !== 'low') {
        // Update form data with the suggested category and type
        setFormData(prev => ({
          ...prev,
          type: result.transactionType,
          categoryId: result.categoryId || ''
        }));

        // Show success message
        const confidenceText = result.confidence === 'high' ? 'high confidence' : 'medium confidence';
        toast.success(`Auto-categorized as "${result.categoryName}" (${confidenceText})`);
      }
    } catch (error: any) {
      console.error('Auto-categorization failed:', error);
      
      if (error.response?.status === 401) {
        // User is not authenticated
        toast.error('Please log in to use auto-categorization');
      } else if (error.response?.status === 404) {
        // Route not found - server issue
        toast.error('Auto-categorization service is not available');
      } else {
        // Other errors - don't show for auto-categorization failures
        console.log('Auto-categorization failed silently:', error.message);
      }
    } finally {
      setIsAutoCategorizing(false);
    }
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
      toast.success('Transaction updated successfully!');
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-auto overflow-hidden"
          >
            {/* Header */}
            <div className={`relative p-4 ${colors.bg} border-b ${colors.border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
                    <div className={colors.icon}>
                      {getTypeIcon(formData.type)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Edit Transaction</h3>
                    <p className="text-xs text-gray-600">Update transaction details</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['expense', 'income', 'investment', 'transfer'] as const).map((type) => {
                    const typeColors = getTypeColor(type);
                    const isSelected = formData.type === type;
                    
                    return (
                      <motion.button
                        key={type}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setFormData(prev => ({ ...prev, type, categoryId: '' }))}
                        className={`relative p-2.5 rounded-lg border transition-all duration-200 ${
                          isSelected
                            ? `${typeColors.bg} ${typeColors.border} shadow-sm`
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`p-1.5 rounded-md ${
                            isSelected ? 'bg-white/80' : 'bg-gray-100'
                          }`}>
                            <div className={isSelected ? typeColors.icon : 'text-gray-500'}>
                              {getTypeIcon(type)}
                            </div>
                          </div>
                          <span className={`text-sm font-medium capitalize ${
                            isSelected ? typeColors.text : 'text-gray-700'
                          }`}>
                            {type}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Amount and Date Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      step="0.01"
                      min="0"
                      className="w-full pl-9 pr-3 py-2.5 text-sm font-medium border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder-gray-400"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Category */}
              {formData.type !== 'transfer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <CategorySelect
                    value={formData.categoryId}
                    onChange={(categoryId) => setFormData(prev => ({ ...prev, categoryId }))}
                    type={formData.type}
                    required
                    placeholder="Select a category"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                  Description
                  <span className="ml-1.5 text-xs text-blue-600 flex items-center bg-blue-50 px-1.5 py-0.5 rounded-full">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI
                  </span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none placeholder-gray-400"
                    placeholder="Add a note... (e.g., 'coffee at starbucks')"
                  />
                  <AnimatePresence>
                    {isAutoCategorizing && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute right-2 top-2 flex items-center bg-blue-50 px-2 py-1 rounded-full"
                      >
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div>
                        <span className="ml-1 text-xs text-blue-600 font-medium">AI...</span>
                      </motion.div>
                    )}
                    {!isAutoCategorizing && formData.description.trim().length >= 3 && formData.type !== 'transfer' && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        type="button"
                        onClick={() => handleAutoCategorize(formData.description.trim())}
                        className="absolute right-2 top-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all duration-200"
                        title="Auto-categorize this transaction"
                      >
                        <Sparkles className="h-4 w-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-3">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Cancel</span>
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSaving}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium text-white ${colors.button} disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md`}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}


