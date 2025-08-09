import React, { useState, useEffect } from 'react';
import { PieChart, BarChart3, TrendingUp, DollarSign, Calendar, Hash } from 'lucide-react';
import { transactionService } from '../../services/transaction';
import { ExpenseBreakdownData, ExpenseBreakdownItem } from '../../services/transaction';
import toast from 'react-hot-toast';

interface ExpenseBreakdownProps {
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  limit?: number;
  showTrends?: boolean;
}

export function ExpenseBreakdown({ dateRange, limit = 5, showTrends = false }: ExpenseBreakdownProps) {
  const [breakdown, setBreakdown] = useState<ExpenseBreakdownData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'breakdown' | 'trends'>('breakdown');

  const fetchExpenseBreakdown = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getExpenseBreakdown(
        dateRange?.startDate,
        dateRange?.endDate,
        limit
      );
      setBreakdown(data);
    } catch (error: any) {
      console.error('Failed to fetch expense breakdown:', error);
      toast.error('Failed to load expense breakdown');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseBreakdown();
  }, [dateRange?.startDate, dateRange?.endDate, limit]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'utensils': '🍽️',
      'shopping-bag': '🛒',
      'car': '🚗',
      'zap': '⚡',
      'film': '🎬',
      'heart': '❤️',
      'book': '📚',
      'plane': '✈️',
      'user': '👤',
      'home': '🏠',
      'gift': '🎁',
      'trending-up': '📈',
      'briefcase': '💼',
      'laptop': '💻',
      'building': '🏢',
      'award': '🏆',
      'plus': '➕',
      'more-horizontal': '⋯'
    };
    return iconMap[iconName] || '💰';
  };

  const getColorIntensity = (percentage: number) => {
    if (percentage > 30) return 'from-red-500 to-red-600';
    if (percentage > 20) return 'from-orange-500 to-orange-600';
    if (percentage > 10) return 'from-yellow-500 to-yellow-600';
    if (percentage > 5) return 'from-blue-500 to-blue-600';
    return 'from-gray-400 to-gray-500';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Expense Breakdown</h3>
        </div>
        <div className="card-body">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!breakdown || breakdown.breakdown.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Expense Breakdown</h3>
        </div>
        <div className="card-body">
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <PieChart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Add some expense transactions to see a beautiful breakdown of your spending patterns
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h3 className="text-lg font-medium">Expense Breakdown</h3>
        {showTrends && breakdown.monthlyTrends.length > 0 && (
          <div className="flex space-x-1">
            <button
              onClick={() => setSelectedView('breakdown')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedView === 'breakdown' 
                  ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <PieChart className="h-4 w-4 inline mr-1" />
              Categories
            </button>
            <button
              onClick={() => setSelectedView('trends')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedView === 'trends' 
                  ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="h-4 w-4 inline mr-1" />
              Trends
            </button>
          </div>
        )}
      </div>

      <div className="card-body">
        {selectedView === 'breakdown' ? (
          <>
            {/* Summary Stats */}
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(breakdown.totalExpenses)}
                  </p>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Hash className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{breakdown.summary.totalCategories}</p>
                  <p className="text-sm text-gray-600">Categories</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(breakdown.summary.avgExpensePerCategory)}
                  </p>
                  <p className="text-sm text-gray-600">Avg per Category</p>
                </div>
              </div>
            </div>

            {/* Category Breakdown List */}
            <div className="space-y-4">
              {breakdown.breakdown.map((item: ExpenseBreakdownItem, index: number) => (
                <div key={item.categoryId} className="group p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-600">#{index + 1}</span>
                      </div>
                    </div>

                    {/* Category Icon */}
                    <div className="flex-shrink-0">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
                        style={{ backgroundColor: item.categoryColor }}
                      >
                        <span className="text-xl">{getCategoryIcon(item.categoryIcon)}</span>
                      </div>
                    </div>

                    {/* Category Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {item.categoryName}
                        </h4>
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(item.totalAmount)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full bg-gradient-to-r ${getColorIntensity(item.percentage)}`}
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-12 text-right">
                          {formatPercentage(item.percentage)}
                        </span>
                      </div>

                      {/* Additional Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Hash className="h-3 w-3 mr-1" />
                            {item.transactionCount} transactions
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Avg: {formatCurrency(item.avgAmount)}
                          </span>
                        </div>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(item.lastTransaction)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Monthly Trends View */
          <div className="space-y-6">
            {breakdown.monthlyTrends.map((trend) => (
              <div key={trend.categoryId} className="p-4 rounded-xl border border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">{trend.categoryName}</h4>
                <div className="space-y-3">
                  {trend.monthlyData.map((month, index) => {
                    const monthName = new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    });
                    const maxAmount = Math.max(...breakdown.monthlyTrends.flatMap(t => t.monthlyData.map(m => m.amount)));
                    const percentage = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;

                    return (
                      <div key={`${month._id.year}-${month._id.month}`} className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 w-20 font-medium">{monthName}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                            {formatCurrency(month.amount)}
                          </span>
                          <span className="text-xs text-gray-500 w-8 text-right">
                            {month.count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}