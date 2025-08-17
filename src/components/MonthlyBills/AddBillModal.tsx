import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Tag, FileText, Plus, Edit, Sparkles } from 'lucide-react';
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
  { value: 'housing', label: 'Housing', color: 'bg-blue-500', icon: '🏠', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  { value: 'utilities', label: 'Utilities', color: 'bg-green-500', icon: '⚡', bgColor: 'bg-green-50', textColor: 'text-green-700' },
  { value: 'transport', label: 'Transport', color: 'bg-yellow-500', icon: '🚗', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
  { value: 'food', label: 'Food & Dining', color: 'bg-red-500', icon: '🍽️', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  { value: 'entertainment', label: 'Entertainment', color: 'bg-purple-500', icon: '🎬', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
  { value: 'health', label: 'Health & Fitness', color: 'bg-pink-500', icon: '💪', bgColor: 'bg-pink-50', textColor: 'text-pink-700' },
  { value: 'other', label: 'Other', color: 'bg-gray-500', icon: '📋', bgColor: 'bg-gray-50', textColor: 'text-gray-700' }
];

export default function AddBillModal({ isOpen, onClose, onSuccess, editingBill }: AddBillModalProps) {
  const [formData, setFormData] = useState<CreateMonthlyBill>({
    name: '',
    amount: 0,
    dueDate: 1,
    category: 'other',
    description: ''
  });
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
    } else {
      setFormData({
        name: '',
        amount: 0,
        dueDate: 1,
        category: 'other',
        description: ''
      });
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

  const getCategoryInfo = (categoryValue: string) => {
    return categories.find(cat => cat.value === categoryValue) || categories[categories.length - 1];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modern Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  {editingBill ? (
                    <Edit className="h-6 w-6 text-white" />
                  ) : (
                    <Plus className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {editingBill ? 'Edit Monthly Bill' : 'Add Monthly Bill'}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {editingBill ? 'Update your bill details' : 'Create a new recurring bill'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-4 right-6 p-3 rounded-full bg-white shadow-lg">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Bill Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Bill Name *
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="e.g., Netflix Subscription, Rent"
              />
            </div>
            {errors.name && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600 flex items-center"
              >
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                {errors.name}
              </motion.p>
            )}
          </div>

          {/* Amount and Due Date */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                    errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 flex items-center"
                >
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  {errors.amount}
                </motion.p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Due Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', parseInt(e.target.value))}
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                    errors.dueDate ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              {errors.dueDate && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 flex items-center"
                >
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  {errors.dueDate}
                </motion.p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Category *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map(cat => {
                const isSelected = formData.category === cat.value;
                const categoryInfo = getCategoryInfo(cat.value);
                return (
                  <motion.button
                    key={cat.value}
                    type="button"
                    onClick={() => handleInputChange('category', cat.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                      isSelected 
                        ? `${cat.bgColor} ${cat.textColor} border-${cat.color.split('-')[1]}-300 shadow-md` 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-medium text-sm">{cat.label}</span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-5 h-5 rounded-full ${cat.color} flex items-center justify-center`}
                      >
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none"
              placeholder="Add any additional details about this bill..."
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-6">
            <motion.button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  {editingBill ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  <span>{editingBill ? 'Update Bill' : 'Add Bill'}</span>
                </div>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
    </AnimatePresence>
  );
}
