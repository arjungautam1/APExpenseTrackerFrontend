import React, { useState, useEffect } from 'react';
import { X, Home, Phone, Wifi, Dumbbell, CreditCard, Save, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface MonthlyExpense {
  _id: string;
  name: string;
  category: 'home' | 'mobile' | 'internet' | 'gym' | 'other';
  amount: number;
  dueDate: number;
  description: string;
  isActive: boolean;
  lastPaidDate?: string;
  nextDueDate: string;
  autoDeduct: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface CreateMonthlyExpenseData {
  name: string;
  category: 'home' | 'mobile' | 'internet' | 'gym' | 'other';
  amount: number;
  dueDate: number;
  description?: string;
  autoDeduct?: boolean;
  tags?: string[];
}

interface AddEditMonthlyExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: MonthlyExpense | null;
  onSuccess: () => void;
}

const categories = [
  { key: 'home', name: 'Home', icon: Home, color: 'bg-red-100 text-red-600' },
  { key: 'mobile', name: 'Mobile Bills', icon: Phone, color: 'bg-blue-100 text-blue-600' },
  { key: 'internet', name: 'Internet', icon: Wifi, color: 'bg-purple-100 text-purple-600' },
  { key: 'gym', name: 'Gym', icon: Dumbbell, color: 'bg-green-100 text-green-600' },
  { key: 'other', name: 'Other', icon: CreditCard, color: 'bg-orange-100 text-orange-600' }
];

// Use the existing API service that works for other endpoints
import { apiService } from '../../services/api';

// Simple API service for monthly expenses
const monthlyExpenseAPI = {
  async create(data: CreateMonthlyExpenseData): Promise<MonthlyExpense> {
    console.log('MonthlyExpenseAPI - Using apiService for create request');
    
    try {
      const response = await apiService.post<{ data: MonthlyExpense }>('/monthly-expenses', data);
      console.log('MonthlyExpenseAPI - Create successful via apiService');
      return response.data.data;
    } catch (error: any) {
      console.log('MonthlyExpenseAPI - Create failed via apiService:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<CreateMonthlyExpenseData>): Promise<MonthlyExpense> {
    console.log('MonthlyExpenseAPI - Using apiService for update request');
    
    try {
      const response = await apiService.put<{ data: MonthlyExpense }>(`/monthly-expenses/${id}`, data);
      console.log('MonthlyExpenseAPI - Update successful via apiService');
      return response.data.data;
    } catch (error: any) {
      console.log('MonthlyExpenseAPI - Update failed via apiService:', error);
      throw error;
    }
  }
};

const AddEditMonthlyExpenseModal: React.FC<AddEditMonthlyExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CreateMonthlyExpenseData>({
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
      console.log('Submitting monthly expense with data:', formData);
      
      if (isEditing && expense) {
        await monthlyExpenseAPI.update(expense._id, formData);
        toast.success('Monthly expense updated successfully');
      } else {
        await monthlyExpenseAPI.create(formData);
        toast.success('Monthly expense added successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving monthly expense:', error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        console.log('Authentication error - offering user options');
        toast.error('Authentication failed. You will be redirected to login.');
        
        // Give user a moment to see the message, then redirect
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }, 2000);
      } else if (error.message?.includes('authentication') || error.message?.includes('token')) {
        toast.error('Please log in again to continue');
      } else {
        toast.error(error.message || (isEditing ? 'Failed to update expense' : 'Failed to add expense'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateMonthlyExpenseData, value: any) => {
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              {isEditing ? <Save className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Edit Monthly Expense' : 'Add Monthly Expense'}
              </h3>
              <p className="text-sm text-gray-500">
                {isEditing ? 'Update your recurring expense' : 'Set up a new recurring expense'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
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
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="e.g., Apartment Rent, Netflix Subscription"
            />
            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => handleInputChange('category', category.key)}
                  className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                    formData.category === category.key
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
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

          {/* Amount and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  step="0.01"
                  min="0"
                  className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.amount ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && <p className="mt-2 text-sm text-red-600">{errors.amount}</p>}
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <select
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', parseInt(e.target.value))}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.dueDate ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              {errors.dueDate && <p className="mt-2 text-sm text-red-600">{errors.dueDate}</p>}
            </div>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors hover:border-gray-400"
              placeholder="Add any additional details about this expense..."
            />
          </div>

          {/* Auto Deduct Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Auto Deduct</h4>
              <p className="text-sm text-gray-500">Automatically create transaction on due date</p>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('autoDeduct', !formData.autoDeduct)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.autoDeduct ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.autoDeduct ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  {isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  <span>{isEditing ? 'Update Expense' : 'Add Expense'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditMonthlyExpenseModal;
