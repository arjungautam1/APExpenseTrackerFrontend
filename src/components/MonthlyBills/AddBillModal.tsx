import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import { CreateMonthlyBill, MonthlyBill, monthlyBillsService } from '../../services/monthlyBills';
import toast from 'react-hot-toast';

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingBill?: MonthlyBill | null;
}

const categories = [
  { value: 'housing', label: 'Housing', color: 'bg-blue-100 text-blue-800' },
  { value: 'utilities', label: 'Utilities', color: 'bg-green-100 text-green-800' },
  { value: 'transport', label: 'Transport', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'food', label: 'Food & Dining', color: 'bg-red-100 text-red-800' },
  { value: 'entertainment', label: 'Entertainment', color: 'bg-purple-100 text-purple-800' },
  { value: 'health', label: 'Health & Fitness', color: 'bg-pink-100 text-pink-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
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
        await monthlyBillsService.updateBill(editingBill.id, formData);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingBill ? 'Edit Monthly Bill' : 'Add Monthly Bill'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Bill Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bill Name *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Netflix Subscription, Rent"
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Amount and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', parseInt(e.target.value))}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.dueDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any additional details..."
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : editingBill ? 'Update Bill' : 'Add Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
