
import { useState, useEffect } from 'react';
import { Calendar, Filter, Download, TrendingUp, BarChart3 } from 'lucide-react';
import { ExpenseBreakdown } from '../components/Dashboard/ExpenseBreakdown';
import { transactionService } from '../services/transaction';
import { TransactionStats } from '../services/transaction';
import toast from 'react-hot-toast';

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const statsData = await transactionService.getTransactionStats(
        dateRange.startDate,
        dateRange.endDate
      );
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange.startDate, dateRange.endDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDateRange = () => {
    const start = new Date(dateRange.startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const end = new Date(dateRange.endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return `${start} - ${end}`;
  };

  const getQuickDateRanges = () => {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const last3Months = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    const thisYear = new Date(today.getFullYear(), 0, 1);

    return [
      {
        label: 'This Month',
        startDate: thisMonth.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      },
      {
        label: 'Last Month',
        startDate: lastMonth.toISOString().split('T')[0],
        endDate: new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0]
      },
      {
        label: 'Last 3 Months',
        startDate: last3Months.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      },
      {
        label: 'This Year',
        startDate: thisYear.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      }
    ];
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Detailed financial insights and reports</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="mb-8 card">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Date Range:</span>
              <span className="text-sm text-gray-900">{formatDateRange()}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {getQuickDateRanges().map((range) => (
                <button
                  key={range.label}
                  onClick={() => setDateRange({ startDate: range.startDate, endDate: range.endDate })}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    dateRange.startDate === range.startDate && dateRange.endDate === range.endDate
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="input text-sm py-1 px-2"
                />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="input text-sm py-1 px-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.totalIncome)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(stats.totalExpenses)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 ${stats.totalSavings >= 0 ? 'bg-blue-100' : 'bg-red-100'} rounded-lg flex items-center justify-center`}>
                    <TrendingUp className={`w-5 h-5 ${stats.totalSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Net Savings</h3>
                  <p className={`text-2xl font-bold ${stats.totalSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(stats.totalSavings)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Savings Rate</h3>
                  <p className={`text-2xl font-bold ${stats.totalSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.totalIncome > 0 
                      ? `${((stats.totalSavings / stats.totalIncome) * 100).toFixed(1)}%`
                      : '0.0%'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expense Breakdown */}
        <div className="lg:col-span-2">
          <ExpenseBreakdown 
            dateRange={dateRange} 
            limit={15} 
            showTrends={true}
          />
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading analytics...</p>
          </div>
        </div>
      )}
    </div>
  );
}