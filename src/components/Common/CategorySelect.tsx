import React, { useState, useEffect } from 'react';
import { Tag, Plus, X } from 'lucide-react';
import { Category } from '../../types';
import { categoryService } from '../../services/category';
import { toast } from 'react-hot-toast';

interface CategorySelectProps {
  value: string;
  onChange: (categoryId: string) => void;
  type: 'income' | 'expense' | 'investment';
  required?: boolean;
  placeholder?: string;
  className?: string;
  showCreateOption?: boolean;
}

export function CategorySelect({
  value,
  onChange,
  type,
  required = false,
  placeholder = "Select a category",
  className = "input pl-10",
  showCreateOption = true
}: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [type]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const fetchedCategories = await categoryService.getCategories(type);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      setIsCreating(true);
      const newCategory = await categoryService.createCategory({
        name: newCategoryName.trim(),
        type,
        icon: 'tag',
        color: '#6B7280'
      });

      // Add the new category to the list
      setCategories(prev => [...prev, newCategory]);
      
      // Select the new category
      onChange(newCategory.id);
      
      // Close modal and reset
      setShowCreateModal(false);
      setNewCategoryName('');
      
      toast.success(`Category "${newCategory.name}" created successfully`);
    } catch (error: any) {
      console.error('Failed to create category:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create category');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateCategory();
    }
  };

  return (
    <div className="relative">
      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <select
        value={value}
        onChange={(e) => {
          if (e.target.value === '__create_new__') {
            setShowCreateModal(true);
          } else {
            onChange(e.target.value);
          }
        }}
        required={required}
        className={`w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ${showCreateOption ? 'hover:ring-2 hover:ring-blue-100' : ''}`}
        disabled={isLoading}
      >
        <option value="">{isLoading ? 'Loading...' : placeholder}</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
        {showCreateOption && categories.length > 0 && (
          <option value="__separator__" disabled>
            ──────────────────────
          </option>
        )}
        {showCreateOption && (
          <option value="__create_new__" className="text-blue-600 font-medium bg-blue-50">
            ✨ Create New Category
          </option>
        )}
      </select>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto transform transition-all animate-in zoom-in-95 duration-200 border border-gray-100 ring-4 ring-blue-100/50">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Create Category
                  </h3>
                  <p className="text-sm text-gray-600">
                    Add a new custom category
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-md flex items-center justify-center transition-all duration-200"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`e.g., ${type === 'expense' ? 'Coffee Shops' : type === 'income' ? 'Freelance' : 'Stocks'}`}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder-gray-400 text-lg"
                  autoFocus
                />
              </div>
              
              {/* Category Type Badge */}
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className={`w-4 h-4 rounded-full shadow-sm ${
                  type === 'expense' ? 'bg-gradient-to-r from-red-400 to-red-600' : 
                  type === 'income' ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-purple-400 to-purple-600'
                }`} />
                <span className="text-sm font-semibold text-gray-800">
                  {type.charAt(0).toUpperCase() + type.slice(1)} Category
                </span>
                <div className="ml-auto">
                  <Tag className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex space-x-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-4 text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-200 shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={isCreating || !newCategoryName.trim()}
                className="flex-1 px-6 py-4 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    <span>Create Category</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
