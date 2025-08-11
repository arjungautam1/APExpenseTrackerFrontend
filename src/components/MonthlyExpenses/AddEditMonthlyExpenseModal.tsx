import React, { useState, useEffect } from 'react';
import { X, Home, Phone, Wifi, Dumbbell, CreditCard } from 'lucide-react';
import { MonthlyExpenseDto, CreateMonthlyExpenseDto, UpdateMonthlyExpenseDto, monthlyExpenseService } from '../../services/monthlyExpense';
import toast from 'react-hot-toast';

interface AddEditMonthlyExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: MonthlyExpenseDto | null;
  onSuccess: () => void;
}

const categories = [
  { key: 'home', name: 'Home', icon: Home, color: 'bg-red-100 text-red-600' },
  { key: 'mobile', name: 'Mobile Bills', icon: Phone, color: 'bg-blue-100 text-blue-600' },
  { key: 'internet', name: 'Internet', icon: Wifi, color: 'bg-purple-100 text-purple-600' },
  { key: 'gym', name: 'Gym', icon: Dumbbell, color: 'bg-green-100 text-green-600' },
  { key: 'other', name: 'Other', icon: CreditCard, color: 'bg-orange-100 text-orange-600' }
];

const AddEditMonthlyExpenseModal: React.FC<AddEditMonthlyExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CreateMonthlyExpenseDto>({
    name: '',
    category: 'home',
    amount: 0,
    dueDate: 1,
    description: '',
    autoDeduct: true,
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!expense;

  useEffect(() => {
    if (expense) {
      setFormData({
        name: expense.name,
        category: expense.category,
        amount: expense.amount,
        dueDate: expense.dueDate,
        description: expense.description,
        autoDeduct: expense.autoDeduct,
        tags: expense.tags
      });
    } else {
      setFormData({
        name: '',
        category: 'home',
        amount: 0,
        dueDate: 1,
        description: '',
        autoDeduct: true,
        tags: []
      });
    }
    setErrors({});
  }, [expense, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Expense name is required';
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
      if (isEditing && expense) {
        await monthlyExpenseService.updateMonthlyExpense(expense._id, formData);
        toast.success('Monthly expense updated successfully');
      } else {
        await monthlyExpenseService.createMonthlyExpense(formData);
        toast.success('Monthly expense added successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving monthly expense:', error);
      toast.error(isEditing ? 'Failed to update expense' : 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateMonthlyExpenseDto, value: any) => {
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
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Monthly Expense' : 'Add Monthly Expense'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Expense Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Expense Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Apartment Rent, Netflix Subscription"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => handleInputChange('category', category.key)}
                  className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                    formData.category === category.key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`p-2 rounded-full ${category.color} mr-3`}>
                    <category.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="amount"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                step="0.01"
                min="0"
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
              Due Date (Day of Month) *
            </label>
            <input
              type="number"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', parseInt(e.target.value) || 1)}
              min="1"
              max="31"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dueDate ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1-31"
            />
            {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Enter the day of the month when this expense is due (e.g., 1 for 1st, 15 for 15th)
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional details about this expense..."
            />
          </div>

          {/* Auto Deduct */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoDeduct"
              checked={formData.autoDeduct}
              onChange={(e) => handleInputChange('autoDeduct', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="autoDeduct" className="ml-2 block text-sm text-gray-900">
              Automatically deduct this expense monthly
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Adding...'}
                </div>
              ) : (
                isEditing ? 'Update Expense' : 'Add Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditMonthlyExpenseModal;
