
import { useState, useEffect } from 'react';
import { Calendar, Filter, Download, TrendingUp, BarChart3 } from 'lucide-react';
import { ExpenseBreakdown } from '../components/Dashboard/ExpenseBreakdown';
import { transactionService } from '../services/transaction';
import { TransactionStats } from '../services/transaction';
import { useCurrencyFormatter } from '../utils/currency';
import toast from 'react-hot-toast';

export function AnalyticsPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrencyFormatter();

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

  useEffect(() => {
    // When year changes, automatically set to full year of that year
    const today = new Date();
    const isCurrentYear = selectedYear === today.getFullYear();
    
    // Create dates in local timezone (Toronto)
    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31);
    
    // Format dates as YYYY-MM-DD in local timezone
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setDateRange({
      startDate: formatLocalDate(yearStart),
      endDate: isCurrentYear ? formatLocalDate(today) : formatLocalDate(yearEnd)
    });
  }, [selectedYear]);


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

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year);
    }
    return years;
  };

  const resetToDefault = () => {
    const today = new Date();
    const defaultStartDate = new Date(today.getFullYear(), today.getMonth() - 2, 1).toISOString().split('T')[0];
    const defaultEndDate = today.toISOString().split('T')[0];
    
    setSelectedYear(today.getFullYear());
    setDateRange({
      startDate: defaultStartDate,
      endDate: defaultEndDate
    });
  };

  const getQuickDateRanges = () => {
    const today = new Date();
    const isCurrentYear = selectedYear === today.getFullYear();
    
    // Format dates as YYYY-MM-DD in local timezone (Toronto)
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31);
    
    const ranges = [
      {
        label: 'Full Year',
        startDate: formatLocalDate(yearStart),
        endDate: isCurrentYear ? formatLocalDate(today) : formatLocalDate(yearEnd)
      }
    ];

    if (isCurrentYear) {
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      
      ranges.unshift(
        {
          label: 'This Month',
          startDate: formatLocalDate(thisMonth),
          endDate: formatLocalDate(today)
        },
        {
          label: 'Last Month',
          startDate: formatLocalDate(lastMonth),
          endDate: formatLocalDate(lastMonthEnd)
        }
      );
    }

    return ranges;
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
          <div className="flex flex-col space-y-4">
            {/* Year Selector */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Year:</span>
              </div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="input text-sm py-1 px-3 w-auto"
              >
                {getAvailableYears().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Display and Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-2">
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
                <button
                  onClick={resetToDefault}
                  className="px-3 py-1 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  Reset
                </button>
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