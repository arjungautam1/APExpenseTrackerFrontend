
import { useState, useEffect } from 'react';
import { Calendar, Filter, Download, TrendingUp, BarChart3 } from 'lucide-react';
import { ExpenseBreakdown } from '../components/Dashboard/ExpenseBreakdown';
import { AnalyticsChart } from '../components/Dashboard/AnalyticsChart';
import { transactionService } from '../services/transaction';
import { TransactionStats } from '../services/transaction';
import { investmentService } from '../services/investment';
import { InvestmentStats } from '../services/investment';
import { useCurrencyFormatter } from '../utils/currency';
import toast from 'react-hot-toast';

export function AnalyticsPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  // Initialize with the full current year range
  const getYearRange = (year: number) => {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      startDate: formatLocalDate(yearStart),
      endDate: formatLocalDate(yearEnd)
    };
  };
  
  const [dateRange, setDateRange] = useState(getYearRange(currentYear));
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [investmentStats, setInvestmentStats] = useState<InvestmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { formatCurrency } = useCurrencyFormatter();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch transaction stats and investment stats in parallel
      const [statsData, investmentStatsData] = await Promise.all([
        transactionService.getTransactionStats(
          dateRange.startDate,
          dateRange.endDate
        ),
        investmentService.getInvestmentStats(
          dateRange.startDate,
          dateRange.endDate
        )
      ]);
      
      setStats(statsData);
      setInvestmentStats(investmentStatsData);
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      setError('Failed to load analytics data');
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
    setDateRange(getYearRange(selectedYear));
  }, [selectedYear]);


  const formatDateRange = () => {
    // Parse the date strings and format them consistently
    const formatDisplayDate = (dateString: string) => {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };
    
    const start = formatDisplayDate(dateRange.startDate);
    const end = formatDisplayDate(dateRange.endDate);
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
    const currentYear = today.getFullYear();
    
    setSelectedYear(currentYear);
    setDateRange(getYearRange(currentYear));
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
    
    const yearRange = getYearRange(selectedYear);
    
    const ranges = [
      {
        label: 'Full Year',
        startDate: yearRange.startDate,
        endDate: yearRange.endDate
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

      {/* Error State */}
      {error && (
        <div className="mb-8 card">
          <div className="card-body">
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load analytics</h3>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      {stats && !error && (
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
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Investment</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {investmentStats ? formatCurrency(investmentStats.totalInvested) : '$0.00'}
                  </p>
                  {investmentStats && investmentStats.totalGainLoss !== 0 && (
                    <p className={`text-sm ${investmentStats.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {investmentStats.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(investmentStats.totalGainLoss)} 
                      ({investmentStats.totalGainLossPercentage >= 0 ? '+' : ''}{investmentStats.totalGainLossPercentage.toFixed(1)}%)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Trends Chart */}
      {!loading && !error && (
        <div className="mb-8">
          <AnalyticsChart dateRange={dateRange} />
        </div>
      )}

      {/* Detailed Analytics */}
      {!loading && !error && (
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
      )}

      {/* Empty State */}
      {!loading && !error && stats && stats.transactionCount === 0 && (
        <div className="card">
          <div className="card-body">
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                No transactions found for the selected date range. Try adjusting the date range or add some transactions to see analytics.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetToDefault}
                  className="btn-secondary"
                >
                  Reset Date Range
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Loading analytics...</p>
          </div>
        </div>
      )}
    </div>
  );
}