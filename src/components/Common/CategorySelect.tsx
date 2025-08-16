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
            ────────────────
          </option>
        )}
        {showCreateOption && (
          <option value="__create_new__">
            ➕ Create New Category
          </option>
        )}
      </select>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Create New Category
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Enter ${type} category name`}
                  className="input w-full"
                  autoFocus
                />
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Tag className="h-4 w-4" />
                <span>Type: {type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={isCreating || !newCategoryName.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Create</span>
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
