import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateMonthlyBill, MonthlyBill, monthlyBillsService } from '../../services/monthlyBills';
import toast from 'react-hot-toast';

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingBill?: MonthlyBill | null;
}

const categories = [
  { value: 'housing', label: 'Housing', icon: '🏠', color: 'blue' },
  { value: 'utilities', label: 'Utilities', icon: '⚡', color: 'emerald' },
  { value: 'transport', label: 'Transport', icon: '🚗', color: 'amber' },
  { value: 'food', label: 'Food', icon: '🍽️', color: 'red' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬', color: 'purple' },
  { value: 'health', label: 'Health', icon: '💪', color: 'pink' },
  { value: 'other', label: 'Other', icon: '📋', color: 'gray' }
];

export default function AddBillModal({ isOpen, onClose, onSuccess, editingBill }: AddBillModalProps) {
  const [formData, setFormData] = useState<CreateMonthlyBill>({
    name: '',
    amount: 0,
    dueDate: 1,
    category: 'other',
    description: ''
  });

  const [amountDisplay, setAmountDisplay] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingBill) {
      setFormData({
        name: editingBill.name,
        amount: editingBill.amount,
        dueDate: editingBill.dueDate,
        category: editingBill.category,
        description: editingBill.description || ''
      });
      setAmountDisplay(editingBill.amount.toString());
    } else {
      setFormData({
        name: '',
        amount: 0,
        dueDate: 1,
        category: 'other',
        description: ''
      });
      setAmountDisplay('');
    }
    setErrors({});
  }, [editingBill, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Bill name is required';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (formData.dueDate < 1 || formData.dueDate > 31) {
      newErrors.dueDate = 'Due date must be between 1 and 31';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (editingBill) {
        await monthlyBillsService.updateBill(editingBill._id, formData);
        toast.success('Bill updated successfully');
      } else {
        await monthlyBillsService.createBill(formData);
        toast.success('Bill added successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving bill:', error);
      toast.error(error.message || 'Failed to save bill');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateMonthlyBill, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAmountChange = (value: string) => {
    setAmountDisplay(value);
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      amount: numValue
    }));
    
    if (errors.amount) {
      setErrors(prev => ({
        ...prev,
        amount: ''
      }));
    }
  };

  const getSelectedCategory = () => {
    return categories.find(cat => cat.value === formData.category) || categories[categories.length - 1];
  };

  if (!isOpen) return null;

  const selectedCategory = getSelectedCategory();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Clean Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 bg-gradient-to-br from-${selectedCategory.color}-400 to-${selectedCategory.color}-600 rounded-lg shadow-sm`}>
                  <span className="text-xl">{selectedCategory.icon}</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingBill ? 'Edit Bill' : 'New Monthly Bill'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Recurring payment
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Clean Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Bill Name - Clean Input */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                BILL NAME
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2.5 bg-gray-50 border rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="e.g., Netflix, Spotify, Rent"
                autoFocus
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Amount and Date Row */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  AMOUNT
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="text"
                    value={amountDisplay}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className={`w-full pl-7 pr-3 py-2.5 bg-gray-50 border rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="123.45"
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  DUE DAY
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <select
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', parseInt(e.target.value))}
                    className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 border rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none ${
                      errors.dueDate ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.dueDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.dueDate}</p>
                )}
              </div>
            </div>

            {/* Category - Minimal Pills */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                CATEGORY
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => {
                  const isSelected = formData.category === cat.value;
                  return (
                    <motion.button
                      key={cat.value}
                      type="button"
                      onClick={() => handleInputChange('category', cat.value)}
                      className={`px-3 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                        isSelected 
                          ? `bg-${cat.color}-100 text-${cat.color}-700 ring-2 ring-${cat.color}-500 ring-offset-1` 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <Check className="h-3 w-3" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Description - Optional */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                NOTES (OPTIONAL)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                placeholder="Add any notes..."
              />
            </div>

            {/* Clean Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    {editingBill ? 'Update Bill' : 'Add Bill'}
                  </span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}