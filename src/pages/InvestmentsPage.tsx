
import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { investmentService } from '../services/investment';
import { Investment } from '../types';
import { InvestmentStats } from '../services/investment';
import { AddInvestmentModal } from '../components/Investments/AddInvestmentModal';
import { InvestmentCard } from '../components/Investments/InvestmentCard';
import toast from 'react-hot-toast';

export function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<InvestmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'stocks' | 'mutual_funds' | 'crypto' | 'real_estate' | 'other'>('all');

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
        investmentService.getInvestmentStats()
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
  }, [filter]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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