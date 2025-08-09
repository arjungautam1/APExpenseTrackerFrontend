import { useState, useEffect } from 'react';
import { QuickAddTransaction } from '../components/Dashboard/QuickAddTransaction';
import { ScanBillModal } from '../components/Dashboard/ScanBillModal';
import { ExpenseBreakdown } from '../components/Dashboard/ExpenseBreakdown';
import { transactionService } from '../services/transaction';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';
import { Transaction } from '../types';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats and recent transactions in parallel
      const [statsResponse, transactionsResponse] = await Promise.all([
        transactionService.getTransactionStats(),
        transactionService.getTransactions({ limit: 5 })
      ]);

      setStats(statsResponse);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Get an overview of your financial health</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
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
                <p className="text-sm text-gray-500">{stats?.incomeCount || 0} transactions</p>
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
                <p className="text-sm text-gray-500">{stats?.expenseCount || 0} transactions</p>
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
                <p className="text-sm text-gray-500">Income - Expenses</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Transactions</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.transactionCount || 0}
                </p>
                <p className="text-sm text-gray-500">All time</p>
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
          </div>
          <div className="card-body">
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
              {recentTransactions.map((t) => {
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
                      </div>
                    </div>
                    <p className={`font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                  </div>
                );
              })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No transactions yet</p>
                <p className="text-sm text-gray-400">Add your first transaction using the Quick Add button</p>
              </div>
            )}
          </div>
        </div>

        {/* Expense Breakdown */}
        <ExpenseBreakdown limit={8} showTrends={true} />
      </div>
    </div>
  );
}