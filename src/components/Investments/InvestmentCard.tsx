import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Investment } from '../../types';
import { investmentService } from '../../services/investment';
import { EditInvestmentModal } from './EditInvestmentModal';
import { ConfirmDialog } from '../Common/ConfirmDialog';
import toast from 'react-hot-toast';

interface InvestmentCardProps {
  investment: Investment;
  onUpdate: () => void;
  onDelete: () => void;
}

export function InvestmentCard({ investment, onUpdate, onDelete }: InvestmentCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      stocks: 'Stocks',
      mutual_funds: 'Mutual Funds',
      crypto: 'Crypto',
      real_estate: 'Real Estate',
      other: 'Other'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      stocks: 'bg-blue-100 text-blue-800',
      mutual_funds: 'bg-green-100 text-green-800',
      crypto: 'bg-orange-100 text-orange-800',
      real_estate: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleEdit = () => {
    setShowDropdown(false);
    setIsEditModalOpen(true);
  };

  const openDeleteConfirm = () => {
    setShowDropdown(false);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    setIsDeleting(true);
    try {
      await investmentService.deleteInvestment(investment.id);
      onDelete();
      setConfirmOpen(false);
    } catch (error: any) {
      console.error('Failed to delete investment:', error);
      toast.error('Failed to delete investment');
    } finally {
      setIsDeleting(false);
      setShowDropdown(false);
    }
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    onUpdate();
  };

  const gainLoss = investment.gainLoss ?? (investment.currentValue - investment.amountInvested);
  const gainLossPercentage = investment.gainLossPercentage ?? 
    (investment.amountInvested === 0 ? 0 : (gainLoss / investment.amountInvested) * 100);

  return (
    <>
      <div className="card relative">
        <div className="card-body">
          {/* Header with dropdown */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 truncate">{investment.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(investment.type)}`}>
                  {getTypeLabel(investment.type)}
                </span>
                {investment.symbol && (
                  <span className="text-sm text-gray-500 font-mono">{investment.symbol}</span>
                )}
              </div>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                disabled={isDeleting}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              
              {showDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[120px]">
                    <button
                      onClick={handleEdit}
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={openDeleteConfirm}
                      disabled={isDeleting}
                      className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Investment Values */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Invested:</span>
              <span className="font-medium">{formatCurrency(investment.amountInvested)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Current Value:</span>
              <span className="font-medium">{formatCurrency(investment.currentValue)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Gain/Loss:</span>
              <div className="text-right">
                <div className={`flex items-center ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {gainLoss >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  <span className="font-semibold">
                    {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                  </span>
                </div>
                <div className={`text-sm ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(gainLossPercentage)}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Purchased {formatDate(investment.purchaseDate)}</span>
            </div>
            
            {investment.quantity && (
              <div className="mt-1 text-sm text-gray-500">
                Quantity: {investment.quantity}
              </div>
            )}
            
            {investment.platform && (
              <div className="mt-1 text-sm text-gray-500">
                Platform: {investment.platform}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditInvestmentModal
          investment={investment}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete investment?"
        description={`This will permanently delete "${investment.name}".`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
        onConfirm={performDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}