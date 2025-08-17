import { useState, useEffect } from 'react';
import { QuickAddTransaction } from '../components/Dashboard/QuickAddTransaction';
import { ScanBillModal } from '../components/Dashboard/ScanBillModal';
import { ExpenseBreakdown } from '../components/Dashboard/ExpenseBreakdown';
import { BulkTransactionUpload } from '../components/Dashboard/BulkTransactionUpload';
import { transactionService } from '../services/transaction';
import { investmentService } from '../services/investment';
import { useCurrencyFormatter } from '../utils/currency';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, BarChart3, Building, Grid3X3 } from 'lucide-react';
import { Transaction } from '../types';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  totalInvestments: number;
  totalSavings: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState('');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null);
  const [activeTransactionTab, setActiveTransactionTab] = useState<'all' | 'income' | 'expense' | 'investment'>('all');
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const { formatCurrency } = useCurrencyFormatter();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Calculate current month start and end dates
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];
      
      // Set current month name for UI and store date range
      const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      setCurrentMonth(monthName);
      setDateRange({ startDate, endDate });
      
      // Fetch stats, investments, and recent transactions in parallel
      const [statsResponse, investmentStatsResponse, transactionsResponse] = await Promise.all([
        transactionService.getTransactionStats(startDate, endDate),
        investmentService.getInvestmentStats(startDate, endDate),
        transactionService.getTransactions({ limit: 15 })
      ]);

      // Combine stats with investment data
      const combinedStats = {
        ...statsResponse,
        totalInvestments: investmentStatsResponse.totalInvested,
        totalSavings: statsResponse.totalIncome - statsResponse.totalExpenses - investmentStatsResponse.totalInvested
      };

      setStats(combinedStats);
      setRecentTransactions(transactionsResponse.data);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTransactionAdded = () => {
    // Refresh dashboard data when a new transaction is added
    fetchDashboardData();
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredTransactions = activeTransactionTab === 'all' 
    ? recentTransactions 
    : recentTransactions.filter(t => t.type === activeTransactionTab);

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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            {currentMonth ? `Financial overview for ${currentMonth}` : 'Get an overview of your financial health'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <button
            onClick={() => setShowBulkUploadModal(true)}
            className="btn-secondary flex items-center"
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Bulk Upload
          </button>
          <ScanBillModal onSuccess={handleTransactionAdded} />
          <QuickAddTransaction onSuccess={handleTransactionAdded} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stats Cards */}
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
                  {stats ? formatCurrency(stats.totalIncome) : '$0'}
                </p>
                <p className="text-sm text-gray-500">This month</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
                <p className="text-2xl font-bold text-red-600">
                  {stats ? formatCurrency(stats.totalExpenses) : '$0'}
                </p>
                <p className="text-sm text-gray-500">This month</p>
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
                <h3 className="text-sm font-medium text-gray-500">Total Investments</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {stats ? formatCurrency(stats.totalInvestments) : '$0'}
                </p>
                <p className="text-sm text-gray-500">This month</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Net Savings</h3>
                <p className={`text-2xl font-bold ${stats && stats.totalSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {stats ? formatCurrency(stats.totalSavings) : '$0'}
                </p>
                <p className="text-sm text-gray-500">This month</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Recent Transactions</h3>
            
            {/* Transaction Type Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mt-3">
              <button
                onClick={() => setActiveTransactionTab('all')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTransactionTab === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                All
              </button>
              <button
                onClick={() => setActiveTransactionTab('income')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTransactionTab === 'income'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Income
              </button>
              <button
                onClick={() => setActiveTransactionTab('expense')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTransactionTab === 'expense'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <TrendingDown className="h-4 w-4 mr-1" />
                Expense
              </button>
              <button
                onClick={() => setActiveTransactionTab('investment')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTransactionTab === 'investment'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Building className="h-4 w-4 mr-1" />
                Investment
              </button>
            </div>
          </div>
          <div className="card-body">
            {filteredTransactions.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredTransactions.map((t) => {
                const primaryText = (t.description && t.description.trim().length > 0)
                  ? t.description
                  : (t.category?.name || 'Transaction');
                const showCategoryChip = Boolean(t.description && t.description.trim().length > 0);
                return (
                  <div key={t.id} className="flex items-center justify-between py-1.5">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="font-medium text-gray-900 truncate">{primaryText}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm">
                        {showCategoryChip && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                            <span
                              className="mr-2 h-2 w-2 rounded-full"
                              style={{ backgroundColor: t.category?.color || '#9CA3AF' }}
                            />
                            {t.category?.name || 'Unknown Category'}
                          </span>
                        )}
                        <span className="text-gray-500">{formatDate(t.date)}</span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            t.type === 'income'
                              ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                              : t.type === 'investment'
                              ? 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20'
                              : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                          }`}
                        >
                          {t.type}
                        </span>
                      </div>
                    </div>
                    <p className={`font-medium ${
                      t.type === 'income' 
                        ? 'text-green-600' 
                        : t.type === 'investment'
                        ? 'text-purple-600'
                        : 'text-red-600'
                    }`}>
                      {t.type === 'income' ? '+' : t.type === 'investment' ? '⬆' : '-'}{formatCurrency(t.amount)}
                    </p>
                  </div>
                );
              })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {activeTransactionTab === 'all' 
                    ? 'No transactions yet' 
                    : `No ${activeTransactionTab} transactions yet`}
                </p>
                <p className="text-sm text-gray-400">Add your first transaction using the Quick Add button</p>
              </div>
            )}
          </div>
        </div>

        {/* Expense Breakdown */}
        <ExpenseBreakdown 
          limit={8} 
          showTrends={true} 
        />
      </div>

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <BulkTransactionUpload
          onClose={() => setShowBulkUploadModal(false)}
          onSuccess={handleTransactionAdded}
        />
      )}
    </div>
  );
}