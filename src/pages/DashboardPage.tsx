import { useState, useEffect } from 'react';
import { QuickAddTransaction } from '../components/Dashboard/QuickAddTransaction';
import { ScanBillModal } from '../components/Dashboard/ScanBillModal';
import { ExpenseBreakdown } from '../components/Dashboard/ExpenseBreakdown';
import { BulkTransactionUpload } from '../components/Dashboard/BulkTransactionUpload';
import { transactionService } from '../services/transaction';
import { investmentService } from '../services/investment';
import { useCurrencyFormatter } from '../utils/currency';
import { formatTransactionDescription } from '../utils/transactionNameFormatter';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, BarChart3, Building, Grid3X3, ArrowRight } from 'lucide-react';
import { Transaction } from '../types';
import toast from 'react-hot-toast';
import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { DashboardTour, dashboardTourSteps } from '../components/Tour/DashboardTour';
import { useTour } from '@reactour/tour';
import { Tooltip, PulsingHotspot } from '../components/UI/Tooltip';
import { ModernSuccessPopup, useModernSuccessPopup } from '../components/UI/ModernSuccessPopup';
import { LoadingSpinner, Skeleton } from '../components/UI/LoadingSpinner';
import { LoadingOverlay } from '../components/UI/LoadingOverlay';
import { Link } from 'react-router-dom';
import { InstantCurrencyDisplay, FastCurrencyDisplay, CompactCurrencyDisplay, CurrencySkeleton } from '../components/UI/FastCurrencyDisplay';

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
  const { setSteps } = useTour();
  const { popup, showPopup, hidePopup } = useModernSuccessPopup();

  // Setup tour steps when component mounts
  React.useEffect(() => {
    setSteps?.(dashboardTourSteps as any);
  }, [setSteps]);

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

  const handleTransactionAdded = (transactionData?: any) => {
    // Refresh dashboard data when a new transaction is added
    fetchDashboardData();
    
    // Show modern success popup with transaction details
    if (transactionData?.amount) {
      showPopup({
        variant: 'floating-badge',
        title: 'Transaction Added!',
        message: 'Your transaction has been successfully recorded.',
        amount: transactionData.amount,
        type: transactionData.type || 'expense'
      });
    }
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
      <div className="px-3 py-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <Skeleton lines={2} className="w-48 sm:w-64" />
            </div>
            <div className="flex space-x-2">
              <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card group animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="card-body p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                    <Skeleton lines={3} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Transactions skeleton */}
          <div className="card animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="card-header">
              <Skeleton lines={2} />
            </div>
            <div className="card-body">
              <Skeleton variant="list" lines={5} />
            </div>
          </div>

          {/* Expense Breakdown skeleton */}
          <div className="card animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div className="card-header">
              <Skeleton lines={2} />
            </div>
            <div className="card-body">
              <Skeleton variant="list" lines={4} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoadingOverlay 
        isLoading={loading && !stats} 
        text="Loading your financial dashboard..." 
        variant="default"
        size="xl"
      />
      <div className="px-3 py-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              {currentMonth ? `Financial overview for ${currentMonth}` : 'Get an overview of your financial health'}
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3" data-tour="quick-actions">
            <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-2 sm:space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBulkUploadModal(true)}
                className="btn-secondary flex items-center justify-center flex-1 sm:flex-none text-xs sm:text-sm px-3 py-2 transition-transform"
              >
                <Grid3X3 className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Bulk Upload</span>
                <span className="xs:hidden">Bulk</span>
              </motion.button>
              <div className="flex space-x-2 xs:space-x-2 sm:space-x-3">
                <ScanBillModal onSuccess={handleTransactionAdded} />
                <QuickAddTransaction onSuccess={handleTransactionAdded} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4" data-tour="stats-cards">
        {/* Stats Cards */}
        <div className="card group hover:shadow-lg transition-all duration-300">
          <div className="card-body p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-emerald-100/20 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className="flex items-center relative z-10">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-sm" />
                </div>
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <Tooltip content="Total income received this month from all sources" position="top">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate group-hover:text-gray-600 transition-colors">Total Income</h3>
                </Tooltip>
                <p className="text-lg sm:text-2xl font-bold text-green-600 truncate group-hover:text-green-700 transition-colors">
                  {stats ? (
                    <FastCurrencyDisplay
                      amount={stats.totalIncome}
                      color="positive"
                      size="lg"
                      showAnimation={true}
                      animationDuration={0.4}
                    />
                  ) : (
                    <CurrencySkeleton size="lg" />
                  )}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block group-hover:text-gray-600 transition-colors">This month</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card group hover:shadow-lg transition-all duration-300">
          <div className="card-body p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-rose-100/20 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className="flex items-center relative z-10">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-400 to-rose-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-sm" />
                </div>
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <Tooltip content="Total expenses and spending this month" position="top">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate group-hover:text-gray-600 transition-colors">Expenses</h3>
                </Tooltip>
                <p className="text-lg sm:text-2xl font-bold text-red-600 truncate group-hover:text-red-700 transition-colors">
                  {stats ? (
                    <FastCurrencyDisplay
                      amount={stats.totalExpenses}
                      color="negative"
                      size="lg"
                      showAnimation={true}
                      animationDuration={0.4}
                    />
                  ) : (
                    <CurrencySkeleton size="lg" />
                  )}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block group-hover:text-gray-600 transition-colors">This month</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card group hover:shadow-lg transition-all duration-300" data-tour="investment-card">
          <div className="card-body p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-lg" />
                </div>
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <Tooltip content="Total amount invested this month in your portfolio" position="top">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate group-hover:text-gray-600 transition-colors">Investments</h3>
                </Tooltip>
                <p className="text-lg sm:text-2xl font-bold text-purple-600 truncate group-hover:text-purple-700 transition-colors">
                  {stats ? (
                    <FastCurrencyDisplay
                      amount={stats.totalInvestments}
                      color="neutral"
                      size="lg"
                      showAnimation={true}
                      animationDuration={0.4}
                    />
                  ) : (
                    <CurrencySkeleton size="lg" />
                  )}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block group-hover:text-gray-600 transition-colors">This month</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card col-span-2 lg:col-span-1 group hover:shadow-lg transition-all duration-300 relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${
            stats && stats.totalSavings >= 0 
              ? 'from-blue-50/30 to-cyan-100/20' 
              : 'from-red-50/30 to-rose-100/20'
          }`}></div>
          <div className="card-body p-4 sm:p-6 relative z-10">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg ${
                  stats && stats.totalSavings >= 0 
                    ? 'bg-gradient-to-br from-blue-400 to-cyan-500' 
                    : 'bg-gradient-to-br from-red-400 to-rose-500'
                }`}>
                  <PiggyBank className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-sm" />
                </div>
              </div>
              <div className="ml-2 sm:ml-4 min-w-0">
                <Tooltip content="Your savings this month (Income - Expenses - Investments)" position="top">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate group-hover:text-gray-600 transition-colors">Net Savings</h3>
                </Tooltip>
                <p className={`text-lg sm:text-2xl font-bold truncate transition-all duration-300 group-hover:scale-105 ${
                  stats && stats.totalSavings >= 0 
                    ? 'text-blue-600 group-hover:text-blue-700' 
                    : 'text-red-600 group-hover:text-red-700'
                }`}>
                  {stats ? (
                    <>
                      {stats.totalSavings < 0 && '-'}
                      <FastCurrencyDisplay
                        amount={Math.abs(stats.totalSavings)}
                        color={stats.totalSavings >= 0 ? "positive" : "negative"}
                        size="lg"
                        showAnimation={true}
                        animationDuration={0.4}
                      />
                    </>
                  ) : (
                    <CurrencySkeleton size="lg" />
                  )}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block group-hover:text-gray-600 transition-colors">This month</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <div className="card group hover:shadow-lg transition-all duration-300 relative overflow-hidden" data-tour="recent-transactions">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/15 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
          <div className="card-header relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium group-hover:text-gray-800 transition-colors">Recent Transactions</h3>
              <Link
                to="/transactions"
                className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {/* Simple Transaction Type Tabs */}
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
          <div className="card-body relative z-10">
            {filteredTransactions.length > 0 ? (
              <>
                <div className="space-y-4">
                  {filteredTransactions.slice(0, 10).map((t) => {
                    const primaryText = (t.description && t.description.trim().length > 0)
                      ? formatTransactionDescription(t.description)
                      : (t.category?.name || 'Transaction');
                    const showCategoryChip = Boolean(t.description && t.description.trim().length > 0);
                    return (
                      <div key={t.id} className="flex items-center justify-between py-1.5 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
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
              </>
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
        <div data-tour="expense-breakdown">
          <ExpenseBreakdown 
            limit={8} 
            showTrends={true} 
          />
        </div>
      </div>


      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <BulkTransactionUpload
          onClose={() => setShowBulkUploadModal(false)}
          onSuccess={handleTransactionAdded}
        />
      )}
      
      {/* Dashboard Tour */}
      <DashboardTour />
      
      {/* Modern Success Popup */}
      <ModernSuccessPopup
        isVisible={popup.isVisible}
        variant={popup.variant}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        amount={popup.amount}
        onComplete={hidePopup}
      />
    </div>
    </>
  );
}