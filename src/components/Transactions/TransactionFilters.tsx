import React, { useEffect, useState } from 'react';
import { Calendar, Filter, TrendingUp, TrendingDown, Building, Send, X, Sparkles } from 'lucide-react';
import { categoryService } from '../../services/category';
import { transactionService } from '../../services/transaction';
import { Category } from '../../types';
import { motion } from 'framer-motion';
import './NativeDateStyles.css';

export interface TransactionFilterState {
  type?: 'income' | 'expense' | 'transfer' | 'investment';
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  month?: string; // MM format (01-12)
  year?: string; // YYYY format
}

interface TransactionFiltersProps {
  filters: TransactionFilterState;
  onFiltersChange: (filters: TransactionFilterState) => void;
}

export function TransactionFilters({ filters, onFiltersChange }: TransactionFiltersProps) {
  const [categories, setCategories] = useState<{
    income: Category[];
    expense: Category[];
    investment: Category[];
  }>({ income: [], expense: [], investment: [] });
  const [categoryUsage, setCategoryUsage] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [income, expense, investment] = await Promise.all([
          categoryService.getCategories('income'),
          categoryService.getCategories('expense'),
          categoryService.getCategories('investment')
        ]);
        setCategories({ income, expense, investment });

        // Fetch category usage statistics
        try {
          const transactions = await transactionService.getTransactions({ limit: 100 });
          const usage: {[key: string]: number} = {};
          
          transactions.data.forEach(transaction => {
            // Use category.id if available, otherwise fall back to categoryId
            const categoryId = transaction.category?.id || transaction.categoryId;
            if (categoryId) {
              usage[categoryId] = (usage[categoryId] || 0) + 1;
            }
          });
          
          setCategoryUsage(usage);
        } catch (error) {
          console.warn('Failed to load category usage statistics:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const next: TransactionFilterState = { ...filters, [name]: value || undefined };
    
    // Clear category when type changes
    if (name === 'type') {
      next.categoryId = undefined;
    }
    
    // Clear date filters when month/year is selected
    if (name === 'month' || name === 'year') {
      next.startDate = undefined;
      next.endDate = undefined;
    }
    
    // Clear month/year when date filters are used
    if (name === 'startDate' || name === 'endDate') {
      next.month = undefined;
      next.year = undefined;
    }
    
    onFiltersChange(next);
  };

  // Generate month options
  const getMonthOptions = () => {
    const months = [
      { value: '01', label: 'January' },
      { value: '02', label: 'February' },
      { value: '03', label: 'March' },
      { value: '04', label: 'April' },
      { value: '05', label: 'May' },
      { value: '06', label: 'June' },
      { value: '07', label: 'July' },
      { value: '08', label: 'August' },
      { value: '09', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' }
    ];
    return months;
  };

  // Generate year options (current year + 5 years back)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push({ value: i.toString(), label: i.toString() });
    }
    return years;
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(Boolean).length;
  };

  const getCurrentCategories = () => {
    if (filters.type === 'income') return categories.income;
    if (filters.type === 'expense') return categories.expense;
    if (filters.type === 'investment') return categories.investment;
    return [...categories.income, ...categories.expense, ...categories.investment];
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900">Filters</h3>
            {getActiveFilterCount() > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getActiveFilterCount()}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <X className="h-3 w-3" />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? 'Hide' : 'Show'} Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4 space-y-4"
        >
          {/* Type Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Transaction Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { value: 'income', label: 'Income', icon: TrendingUp, color: 'green' },
                { value: 'expense', label: 'Expense', icon: TrendingDown, color: 'red' },
                { value: 'transfer', label: 'Transfer', icon: Send, color: 'blue' },
                { value: 'investment', label: 'Investment', icon: Building, color: 'purple' }
              ].map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleInput({ target: { name: 'type', value } } as any)}
                  className={`flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    filters.type === value
                      ? `bg-${color}-100 border-${color}-300 text-${color}-700`
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
            <select
              name="categoryId"
              value={filters.categoryId || ''}
              onChange={handleInput}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {getCurrentCategories().map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({categoryUsage[category.id] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate || ''}
                onChange={handleInput}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate || ''}
                onChange={handleInput}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Month/Year Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Month</label>
              <select
                name="month"
                value={filters.month || ''}
                onChange={handleInput}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Months</option>
                {getMonthOptions().map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Year</label>
              <select
                name="year"
                value={filters.year || ''}
                onChange={handleInput}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Years</option>
                {getYearOptions().map((year) => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

