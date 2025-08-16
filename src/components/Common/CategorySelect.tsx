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
        className={className}
        disabled={isLoading}
      >
        <option value="">{isLoading ? 'Loading...' : placeholder}</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
        {showCreateOption && categories.length > 0 && (
          <option value="__create_new__" disabled>
            ──────────────────────
          </option>
        )}
        {showCreateOption && (
          <option value="__create_new__" className="text-blue-600 font-medium">
            ➕ Create New Category
          </option>
        )}
      </select>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto transform transition-all animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    New Category
                  </h3>
                  <p className="text-sm text-gray-500">
                    Add a custom category
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`e.g., ${type === 'expense' ? 'Coffee Shops' : type === 'income' ? 'Freelance' : 'Stocks'}`}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                  autoFocus
                />
              </div>
              
              {/* Category Type Badge */}
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  type === 'expense' ? 'bg-red-500' : 
                  type === 'income' ? 'bg-green-500' : 'bg-purple-500'
                }`} />
                <span className="text-sm font-medium text-gray-700">
                  {type.charAt(0).toUpperCase() + type.slice(1)} Category
                </span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex space-x-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={isCreating || !newCategoryName.trim()}
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
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
