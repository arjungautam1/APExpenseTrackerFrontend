import React, { useState } from 'react';
import { X, DollarSign, Calendar, Building, Hash, Briefcase } from 'lucide-react';
import { Investment } from '../../types';
import { investmentService } from '../../services/investment';
import toast from 'react-hot-toast';

interface EditInvestmentModalProps {
  investment: Investment;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditInvestmentModal({ investment, onClose, onSuccess }: EditInvestmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: investment.name,
    type: investment.type,
    amountInvested: investment.amountInvested.toString(),
    currentValue: investment.currentValue.toString(),
    purchaseDate: investment.purchaseDate.split('T')[0], // Convert to YYYY-MM-DD format
    quantity: investment.quantity?.toString() || '',
    symbol: investment.symbol || '',
    platform: investment.platform || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        type: formData.type,
        amountInvested: parseFloat(formData.amountInvested),
        currentValue: parseFloat(formData.currentValue),
        purchaseDate: formData.purchaseDate,
        ...(formData.quantity ? { quantity: parseFloat(formData.quantity) } : { quantity: undefined }),
        ...(formData.symbol.trim() ? { symbol: formData.symbol.trim().toUpperCase() } : { symbol: undefined }),
        ...(formData.platform.trim() ? { platform: formData.platform.trim() } : { platform: undefined })
      };

      await investmentService.updateInvestment(investment.id, updateData);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to update investment:', error);
      
      let message = 'Failed to update investment';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.errors) {
        message = typeof error.response.data.errors === 'object' 
          ? Object.values(error.response.data.errors).join(', ')
          : error.response.data.errors;
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      stocks: 'Stocks',
      mutual_funds: 'Mutual Funds',
      crypto: 'Cryptocurrency',
      real_estate: 'Real Estate',
      other: 'Other'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Edit Investment</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Investment Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Name *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input pl-10"
                  placeholder="e.g., Apple Inc., S&P 500 Index Fund"
                />
              </div>
            </div>

            {/* Investment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Type *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="input pl-10"
                >
                  <option value="stocks">Stocks</option>
                  <option value="mutual_funds">Mutual Funds</option>
                  <option value="crypto">Cryptocurrency</option>
                  <option value="real_estate">Real Estate</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Amount Invested */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Invested *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="amountInvested"
                  value={formData.amountInvested}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="input pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Current Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Value *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="currentValue"
                  value={formData.currentValue}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="input pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  required
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Optional Fields Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity (Optional)
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="input pl-10"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Symbol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symbol (Optional)
                </label>
                <input
                  type="text"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  className="input"
                  placeholder="AAPL, VTIAX"
                  maxLength={10}
                />
              </div>
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform/Broker (Optional)
              </label>
              <input
                type="text"
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Robinhood, Fidelity, Vanguard"
                maxLength={50}
              />
            </div>

            {/* Performance Preview */}
            {formData.amountInvested && formData.currentValue && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Preview</h4>
                {(() => {
                  const invested = parseFloat(formData.amountInvested) || 0;
                  const current = parseFloat(formData.currentValue) || 0;
                  const gainLoss = current - invested;
                  const percentage = invested === 0 ? 0 : (gainLoss / invested) * 100;
                  
                  return (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Gain/Loss:</span>
                      <div className="text-right">
                        <p className={`font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}
                        </p>
                        <p className={`text-sm ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {percentage >= 0 ? '+' : ''}{percentage.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Investment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}