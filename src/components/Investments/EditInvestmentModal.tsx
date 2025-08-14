import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Building, Hash, Briefcase, Sparkles } from 'lucide-react';
import { Investment } from '../../types';
import { investmentService } from '../../services/investment';
import { aiService } from '../../services/ai';
import toast from 'react-hot-toast';

interface EditInvestmentModalProps {
  investment: Investment;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditInvestmentModal({ investment, onClose, onSuccess }: EditInvestmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);
  const [autoCategorized, setAutoCategorized] = useState(false);
  const [autoCategorizeTimeout, setAutoCategorizeTimeout] = useState<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState({
    name: investment.name,
    type: investment.type,
    amountInvested: investment.amountInvested.toString(),
    currentValue: investment.currentValue?.toString() || '',
    purchaseDate: (() => {
      // Fix timezone issue by properly converting the date
      const dateObj = new Date(investment.purchaseDate);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(),
    quantity: investment.quantity?.toString() || '',
    symbol: investment.symbol || '',
    platform: investment.platform || ''
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoCategorizeTimeout) {
        clearTimeout(autoCategorizeTimeout);
      }
    };
  }, [autoCategorizeTimeout]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset auto-categorized flag when name changes
    if (name === 'name') {
      setAutoCategorized(false);
    }

    // Auto-categorize when name changes and has enough content
    if (name === 'name' && value.trim().length >= 3) {
      // Clear existing timeout
      if (autoCategorizeTimeout) {
        clearTimeout(autoCategorizeTimeout);
      }
      
      // Set new timeout for debounced auto-categorization
      const timeout = setTimeout(() => {
        handleAutoCategorize(value.trim());
      }, 1000); // Wait 1 second after user stops typing
      
      setAutoCategorizeTimeout(timeout);
    }
  };

  const handleAutoCategorize = async (name: string) => {
    if (!name || name.length < 3) return;
    
    try {
      setIsAutoCategorizing(true);
      console.log('Auto-categorizing investment:', name);
      
      // Direct investment type categorization based on the name
      const lowerName = name.toLowerCase();
      let suggestedType = 'other';
      let confidence = 'medium';

      // Stocks detection
      if (lowerName.includes('stock') || lowerName.includes('inc') || lowerName.includes('corp') || 
          lowerName.includes('ltd') || lowerName.includes('apple') || lowerName.includes('google') || 
          lowerName.includes('microsoft') || lowerName.includes('amazon') || lowerName.includes('tesla') ||
          lowerName.includes('netflix') || lowerName.includes('meta') || lowerName.includes('nvidia') ||
          lowerName.includes('amd') || lowerName.includes('intel') || lowerName.includes('oracle') ||
          lowerName.includes('salesforce') || lowerName.includes('adobe') || lowerName.includes('paypal')) {
        suggestedType = 'stocks';
        confidence = 'high';
      } 
      // Mutual Funds detection
      else if (lowerName.includes('fund') || lowerName.includes('etf') || lowerName.includes('index') || 
               lowerName.includes('mutual') || lowerName.includes('vanguard') || lowerName.includes('fidelity') ||
               lowerName.includes('schwab') || lowerName.includes('blackrock') || lowerName.includes('sp500') ||
               lowerName.includes('s&p') || lowerName.includes('nasdaq') || lowerName.includes('dow') ||
               lowerName.includes('total market') || lowerName.includes('target date') || lowerName.includes('target-date')) {
        suggestedType = 'mutual_funds';
        confidence = 'high';
      } 
      // Cryptocurrency detection
      else if (lowerName.includes('bitcoin') || lowerName.includes('crypto') || lowerName.includes('eth') || 
               lowerName.includes('btc') || lowerName.includes('coin') || lowerName.includes('ethereum') ||
               lowerName.includes('cardano') || lowerName.includes('solana') || lowerName.includes('polkadot') ||
               lowerName.includes('chainlink') || lowerName.includes('uniswap') || lowerName.includes('binance') ||
               lowerName.includes('dogecoin') || lowerName.includes('shiba') || lowerName.includes('xrp') ||
               lowerName.includes('ripple') || lowerName.includes('litecoin') || lowerName.includes('ltc')) {
        suggestedType = 'crypto';
        confidence = 'high';
      } 
      // Real Estate detection
      else if (lowerName.includes('real estate') || lowerName.includes('property') || lowerName.includes('house') || 
               lowerName.includes('land') || lowerName.includes('apartment') || lowerName.includes('condo') ||
               lowerName.includes('rental') || lowerName.includes('reit') || lowerName.includes('real estate investment') ||
               lowerName.includes('commercial') || lowerName.includes('residential') || lowerName.includes('office') ||
               lowerName.includes('retail') || lowerName.includes('industrial') || lowerName.includes('warehouse')) {
        suggestedType = 'real_estate';
        confidence = 'high';
      }
      // Other investments (bonds, commodities, etc.)
      else if (lowerName.includes('bond') || lowerName.includes('treasury') || lowerName.includes('commodity') ||
               lowerName.includes('gold') || lowerName.includes('silver') || lowerName.includes('oil') ||
               lowerName.includes('futures') || lowerName.includes('options') || lowerName.includes('derivative')) {
        suggestedType = 'other';
        confidence = 'medium';
      }

      // Update form data with the suggested type
      setFormData(prev => ({
        ...prev,
        type: suggestedType as 'stocks' | 'mutual_funds' | 'crypto' | 'real_estate' | 'other'
      }));

      // Show success message
      const typeLabel = suggestedType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      toast.success(`Auto-categorized as "${typeLabel}" (${confidence} confidence)`);
      
      // Set auto-categorized flag
      setAutoCategorized(true);
      
      console.log('Investment auto-categorized:', { name, suggestedType, confidence });
      
    } catch (error: any) {
      console.error('Auto-categorization failed:', error);
      toast.error('Failed to auto-categorize investment');
    } finally {
      setIsAutoCategorizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        type: formData.type,
        amountInvested: parseFloat(formData.amountInvested),
        ...(formData.currentValue ? { currentValue: parseFloat(formData.currentValue) } : { currentValue: undefined }),
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
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                Investment Name *
                <span className="ml-2 text-xs text-gray-500 flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-powered categorization
                </span>
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
                  placeholder="e.g., Apple Inc., S&P 500 Index Fund (AI will auto-categorize)"
                />
                {isAutoCategorizing && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-xs text-blue-600 font-medium">AI Categorizing...</span>
                  </div>
                )}
                {!isAutoCategorizing && formData.name.trim().length >= 3 && !autoCategorized && (
                  <button
                    type="button"
                    onClick={() => handleAutoCategorize(formData.name.trim())}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                    title="Auto-categorize this investment"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                )}
                {autoCategorized && !isAutoCategorizing && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center bg-green-50 px-2 py-1 rounded-md border border-green-200">
                    <Sparkles className="h-4 w-4 text-green-600" />
                    <span className="ml-2 text-xs text-green-600 font-medium">AI Categorized</span>
                  </div>
                )}
              </div>
            </div>

            {/* Investment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                Investment Type *
                {formData.name.trim().length >= 3 && (
                  <button
                    type="button"
                    onClick={() => handleAutoCategorize(formData.name.trim())}
                    disabled={isAutoCategorizing}
                    className="flex items-center space-x-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{isAutoCategorizing ? 'Categorizing...' : 'Auto-Categorize'}</span>
                  </button>
                )}
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
                Current Value (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="currentValue"
                  value={formData.currentValue}
                  onChange={handleChange}
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