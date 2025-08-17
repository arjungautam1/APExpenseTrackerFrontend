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

  // Helper function to check if current date range matches a specific period
  const isCurrentPeriod = (period: 'thisMonth' | 'lastMonth' | 'thisYear' | 'last7Days') => {
    if (!value.startDate || !value.endDate) return false;
    
    const startDate = new Date(value.startDate);
    const endDate = new Date(value.endDate);
    const today = new Date();
    
    // Normalize dates to start of day for comparison
    const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedStart = normalizeDate(startDate);
    const normalizedEnd = normalizeDate(endDate);
    
    let result = false;
    
    switch (period) {
      case 'thisMonth': {
        // Check if the date range represents a full month (1st to last day)
        const startMonth = startDate.getMonth();
        const startYear = startDate.getFullYear();
        const firstDayOfMonth = new Date(startYear, startMonth, 1);
        const lastDayOfMonth = new Date(startYear, startMonth + 1, 0);
        
        result = normalizedStart.getTime() === firstDayOfMonth.getTime() && 
                normalizedEnd.getTime() === lastDayOfMonth.getTime() &&
                startMonth === today.getMonth() && startYear === today.getFullYear();
        break;
      }
      case 'lastMonth': {
        // Check if the date range represents the previous month
        const startMonth = startDate.getMonth();
        const startYear = startDate.getFullYear();
        const firstDayOfMonth = new Date(startYear, startMonth, 1);
        const lastDayOfMonth = new Date(startYear, startMonth + 1, 0);
        
        // Check if this is the month before the current month
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const expectedMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const expectedYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        result = normalizedStart.getTime() === firstDayOfMonth.getTime() && 
                normalizedEnd.getTime() === lastDayOfMonth.getTime() &&
                startMonth === expectedMonth && startYear === expectedYear;
        break;
      }
      case 'thisYear': {
        // Check if the date range represents the full current year
        const startYear = startDate.getFullYear();
        const firstDayOfYear = new Date(startYear, 0, 1);
        const lastDayOfYear = new Date(startYear, 11, 31);
        
        result = normalizedStart.getTime() === firstDayOfYear.getTime() && 
                normalizedEnd.getTime() === lastDayOfYear.getTime() &&
                startYear === today.getFullYear();
        break;
      }
      case 'last7Days': {
        // Check if the date range represents the last 7 days
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const normalizedSevenDaysAgo = normalizeDate(sevenDaysAgo);
        const normalizedToday = normalizeDate(today);
        
        result = normalizedStart.getTime() === normalizedSevenDaysAgo.getTime() && 
                normalizedEnd.getTime() === normalizedToday.getTime();
        break;
      }
      default:
        result = false;
    }
    
    return result;
  };

  // Debug current filter values
  console.log('TransactionFilters render - current value:', value);
  
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
            {getActiveFiltersCount() > 0 && (
              <p className="text-xs text-blue-600 font-medium">
                {getActiveFiltersCount()} active filter{getActiveFiltersCount() !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        {onClear && getActiveFiltersCount() > 0 && (
          <button 
            onClick={onClear}
            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="p-3 space-y-4">
        {/* Compact Filter Row - Transaction Type and Time Period */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Transaction Types */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Transaction Type</label>
            <div className="flex bg-gray-50/80 backdrop-blur-sm rounded-lg p-0.5 border border-gray-200/50">
              {(['income', 'expense', 'investment', 'transfer'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => onChange({ ...value, type: value.type === type ? undefined : type, categoryId: undefined })}
                  className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                    value.type === type 
                      ? (() => {
                          switch (type) {
                            case 'income': return 'bg-green-600 text-white shadow-sm';
                            case 'expense': return 'bg-red-600 text-white shadow-sm';
                            case 'investment': return 'bg-purple-600 text-white shadow-sm';
                            case 'transfer': return 'bg-blue-600 text-white shadow-sm';
                            default: return 'bg-gray-600 text-white shadow-sm';
                          }
                        })()
                      : (() => {
                          switch (type) {
                            case 'income': return 'text-green-700 hover:text-green-800 hover:bg-green-50';
                            case 'expense': return 'text-red-700 hover:text-red-800 hover:bg-red-50';
                            case 'investment': return 'text-purple-700 hover:text-purple-800 hover:bg-purple-50';
                            case 'transfer': return 'text-blue-700 hover:text-blue-800 hover:bg-blue-50';
                            default: return 'text-gray-600 hover:text-gray-800 hover:bg-white/50';
                          }
                        })()
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Time Period Quick Filters */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Time Period</label>
            <div className="flex bg-gray-50/80 backdrop-blur-sm rounded-lg p-0.5 border border-gray-200/50">
              <button
                onClick={() => {
                  const today = new Date();
                  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                  
                  const newFilters = {
                    ...value,
                    startDate: firstDay.toISOString().split('T')[0],
                    endDate: lastDay.toISOString().split('T')[0],
                    month: undefined,
                    year: undefined
                  };
                  
                  console.log('This Month clicked - setting filters:', newFilters);
                  onChange(newFilters);
                }}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  isCurrentPeriod('thisMonth')
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/80 hover:shadow-sm'
                }`}
              >
                This Month
              </button>
              
              <button
                onClick={() => {
                  const today = new Date();
                  const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                  const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                  
                  const newFilters = {
                    ...value,
                    startDate: firstDayLastMonth.toISOString().split('T')[0],
                    endDate: lastDayLastMonth.toISOString().split('T')[0],
                    month: undefined,
                    year: undefined
                  };
                  
                  console.log('Last Month clicked - setting filters:', newFilters);
                  onChange(newFilters);
                }}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  isCurrentPeriod('lastMonth')
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/80 hover:shadow-sm'
                }`}
              >
                Last Month
              </button>
              
              <button
                onClick={() => {
                  const today = new Date();
                  const firstDayYear = new Date(today.getFullYear(), 0, 1);
                  const lastDayYear = new Date(today.getFullYear(), 11, 31);
                  
                  onChange({
                    ...value,
                    startDate: firstDayYear.toISOString().split('T')[0],
                    endDate: lastDayYear.toISOString().split('T')[0],
                    month: undefined,
                    year: undefined
                  });
                }}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  isCurrentPeriod('thisYear')
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/80 hover:shadow-sm'
                }`}
              >
                This Year
              </button>
              
              <button
                onClick={() => {
                  const today = new Date();
                  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  
                  onChange({
                    ...value,
                    startDate: sevenDaysAgo.toISOString().split('T')[0],
                    endDate: today.toISOString().split('T')[0],
                    month: undefined,
                    year: undefined
                  });
                }}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  isCurrentPeriod('last7Days')
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/80 hover:shadow-sm'
                }`}
              >
                Last 7 Days
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Date Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Advanced Date Selection</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {/* Month */}
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 z-0 pointer-events-none" />
              <select
                name="month"
                value={value.month || ''}
                onChange={handleInput}
                className="w-full pl-7 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none cursor-pointer"
              >
                <option value="">Select Month</option>
                {getMonthOptions().map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            {/* Year */}
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 z-0 pointer-events-none" />
              <select
                name="year"
                value={value.year || ''}
                onChange={handleInput}
                className="w-full pl-7 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none cursor-pointer"
              >
                <option value="">Select Year</option>
                {getYearOptions().map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 z-0 pointer-events-none" />
              <input
                type="date"
                name="startDate"
                value={value.startDate || ''}
                onChange={handleInput}
                data-placeholder="yyyy-mm-dd"
                className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              />
            </div>

            {/* End Date */}
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 z-0 pointer-events-none" />
              <input
                type="date"
                name="endDate"
                value={value.endDate || ''}
                onChange={handleInput}
                min={value.startDate || undefined}
                data-placeholder="yyyy-mm-dd"
                className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              />
            </div>
          </div>
        </div>

        {/* Categories - Only show when type is selected */}
        {value.type && value.type !== 'transfer' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              {value.type.charAt(0).toUpperCase() + value.type.slice(1)} Categories
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onChange({ ...value, categoryId: undefined })}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  !value.categoryId 
                    ? getTypeColor(value.type || '')
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                }`}
              >
                All Categories
              </button>
              {getFilteredCategories().map((c) => (
                <button
                  key={c.id}
                  onClick={() => onChange({ ...value, categoryId: value.categoryId === c.id ? undefined : c.id })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-2 ${
                    value.categoryId === c.id 
                      ? getTypeColor(value.type || '')
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: c.color || '#9CA3AF' }}
                  />
                  <span>{c.name}</span>
                  {categoryUsage[c.id] && (
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                      {categoryUsage[c.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

