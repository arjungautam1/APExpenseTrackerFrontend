
import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar } from 'lucide-react';
import { investmentService } from '../services/investment';
import { Investment } from '../types';
import { InvestmentStats } from '../services/investment';
import { AddInvestmentModal } from '../components/Investments/AddInvestmentModal';
import { InvestmentCard } from '../components/Investments/InvestmentCard';
import { useCurrencyFormatter } from '../utils/currency';
import toast from 'react-hot-toast';

export function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<InvestmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'stocks' | 'mutual_funds' | 'crypto' | 'real_estate' | 'other'>('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { formatCurrency } = useCurrencyFormatter();
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const yearStart = new Date(today.getFullYear(), 0, 1); // January 1st of current year
    
    // Format dates as YYYY-MM-DD in local timezone (Toronto)
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      startDate: formatLocalDate(yearStart),
      endDate: formatLocalDate(today)
    };
  });

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const [investmentsResponse, statsResponse] = await Promise.all([
        investmentService.getInvestments({
          limit: 50,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          ...(filter !== 'all' && { type: filter })
        }),
        investmentService.getInvestmentStats(dateRange.startDate, dateRange.endDate)
      ]);

      setInvestments(investmentsResponse.data);
      setStats(statsResponse);
    } catch (error: any) {
      console.error('Failed to fetch investments:', error);
      toast.error('Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [filter, dateRange.startDate, dateRange.endDate]);

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

  const handleInvestmentAdded = () => {
    fetchInvestments();
    setIsAddModalOpen(false);
    toast.success('Investment added successfully!');
  };

  const handleInvestmentUpdated = () => {
    fetchInvestments();
    toast.success('Investment updated successfully!');
  };

  const handleInvestmentDeleted = () => {
    fetchInvestments();
    toast.success('Investment deleted successfully!');
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
    const yearStart = new Date(today.getFullYear(), 0, 1); // January 1st of current year
    
    // Format dates as YYYY-MM-DD in local timezone (Toronto)
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setSelectedYear(today.getFullYear());
    setDateRange({
      startDate: formatLocalDate(yearStart),
      endDate: formatLocalDate(today)
    });
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


  const formatPercentage = (percentage: number) => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const getInvestmentTypeLabel = (type: string) => {
    const labels = {
      stocks: 'Stocks',
      mutual_funds: 'Mutual Funds',
      crypto: 'Cryptocurrency',
      real_estate: 'Real Estate',
      other: 'Other'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="mb-8">
            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card">
                <div className="card-body">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investments</h1>
          <p className="text-gray-600">Track and manage your investment portfolio</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Investment</span>
          </button>
        </div>
      </div>

      {/* Year and Date Range Filter */}
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

      {/* Investment Statistics */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Invested</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats.totalInvested)}
                  </p>
                  <p className="text-sm text-gray-500">{stats.totalInvestments} investments</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Investments</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.totalInvestments}
                  </p>
                  <p className="text-sm text-gray-500">Portfolio items</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'stocks', 'mutual_funds', 'crypto', 'real_estate', 'other'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === filterType
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterType === 'all' ? 'All' : getInvestmentTypeLabel(filterType)}
          </button>
        ))}
      </div>

      {/* Investments List */}
      {investments.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {investments.map((investment) => (
            <InvestmentCard
              key={investment.id}
              investment={investment}
              onUpdate={handleInvestmentUpdated}
              onDelete={handleInvestmentDeleted}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <BarChart3 className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No investments</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first investment.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add Investment</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Investment Modal */}
      {isAddModalOpen && (
        <AddInvestmentModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleInvestmentAdded}
        />
      )}
    </div>
  );
}