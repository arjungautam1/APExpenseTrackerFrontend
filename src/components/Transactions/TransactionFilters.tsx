import React, { useEffect, useState } from 'react';
import { Calendar, Tag, X, Filter, ChevronDown } from 'lucide-react';
import { categoryService } from '../../services/category';
import { transactionService } from '../../services/transaction';
import { Category } from '../../types';

export interface TransactionFilterState {
  type?: 'income' | 'expense' | 'transfer' | 'investment';
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  month?: string; // MM format (01-12)
  year?: string; // YYYY format
}

interface TransactionFiltersProps {
  value: TransactionFilterState;
  onChange: (next: TransactionFilterState) => void;
  onClear?: () => void;
}

export function TransactionFilters({ value, onChange, onClear }: TransactionFiltersProps) {
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
          const transactions = await transactionService.getTransactions({ limit: 1000 });
          const usage: {[key: string]: number} = {};
          
          transactions.data.forEach(transaction => {
            if (transaction.categoryId) {
              usage[transaction.categoryId] = (usage[transaction.categoryId] || 0) + 1;
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
    const next: TransactionFilterState = { ...valueStateRef(), [name]: value || undefined };
    
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
    
    onChange(next);
  };

  const valueStateRef = () => value;

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

  // Generate year options (last 10 years)
  const getYearOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 9; year--) {
      options.push({ value: year.toString(), label: year.toString() });
    }
    return options;
  };

  const getFilteredCategories = () => {
    if (!value.type) return [];
    const typeCategories = categories[value.type as keyof typeof categories] || [];
    
    // Sort categories by usage frequency (most used first)
    return typeCategories.sort((a, b) => {
      const aUsage = categoryUsage[a.id] || 0;
      const bUsage = categoryUsage[b.id] || 0;
      return bUsage - aUsage; // Descending order (most used first)
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (value.type) count++;
    if (value.categoryId) count++;
    if (value.month) count++;
    if (value.year) count++;
    if (value.startDate) count++;
    if (value.endDate) count++;
    return count;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'bg-green-100 text-green-700 border-green-200';
      case 'expense': return 'bg-red-100 text-red-700 border-red-200';
      case 'investment': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'transfer': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Filter className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
            <p className="text-xs text-gray-500">
              {getActiveFiltersCount()} active filter{getActiveFiltersCount() !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onClear && getActiveFiltersCount() > 0 && (
            <button 
              onClick={onClear}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Filters - Always Visible */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-wrap gap-2">
          {(['income', 'expense', 'investment', 'transfer'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onChange({ ...value, type: value.type === type ? undefined : type, categoryId: undefined })}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                value.type === type 
                  ? getTypeColor(type)
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Category Filter - Compact & Colorful */}
          {value.type && value.type !== 'transfer' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {value.type.charAt(0).toUpperCase() + value.type.slice(1)} Categories
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => onChange({ ...value, categoryId: undefined })}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all ${
                    !value.categoryId 
                      ? getTypeColor(value.type)
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                {getFilteredCategories().map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onChange({ ...value, categoryId: value.categoryId === c.id ? undefined : c.id })}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all flex items-center gap-1.5 ${
                      value.categoryId === c.id 
                        ? getTypeColor(value.type)
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: c.color || '#9CA3AF' }}
                    />
                    <span>{c.name}</span>
                    {categoryUsage[c.id] && (
                      <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                        {categoryUsage[c.id]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Filters - Single Line */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date Filters</label>
            <div className="flex gap-2">
              {/* Month */}
              <div className="flex-1">
                <div className="relative">
                  <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <select
                    name="month"
                    value={value.month || ''}
                    onChange={handleInput}
                    className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Month</option>
                    {getMonthOptions().map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Year */}
              <div className="flex-1">
                <div className="relative">
                  <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <select
                    name="year"
                    value={value.year || ''}
                    onChange={handleInput}
                    className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Year</option>
                    {getYearOptions().map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Range */}
              <div className="flex items-center text-xs text-gray-400 px-1">or</div>
              
              <div className="flex-1 relative">
                <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="date"
                  name="startDate"
                  value={value.startDate || ''}
                  onChange={handleInput}
                  className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="From"
                />
              </div>
              <div className="flex items-center text-xs text-gray-400">to</div>
              <div className="flex-1 relative">
                <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="date"
                  name="endDate"
                  value={value.endDate || ''}
                  onChange={handleInput}
                  className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="To"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

