import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, Tag, FileText, X, TrendingUp, TrendingDown, Building, Sparkles } from 'lucide-react';
import { transactionService } from '../../services/transaction';
import { categoryService } from '../../services/category';
import { investmentService } from '../../services/investment';
import { aiService } from '../../services/ai';
import { Category } from '../../types';
import toast from 'react-hot-toast';
import { CategorySelect } from '../Common/CategorySelect';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { LoadingButton } from '../UI/LoadingOverlay';
import { TransactionSuccessNotification, useTransactionSuccessNotification } from '../UI/TransactionSuccessNotification';

interface QuickAddTransactionProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export function QuickAddTransaction({ onClose, onSuccess }: QuickAddTransactionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);
  const [autoCategorized, setAutoCategorized] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryUsage, setCategoryUsage] = useState<{[key: string]: number}>({});
  const [autoCategorizeTimeout, setAutoCategorizeTimeout] = useState<NodeJS.Timeout | null>(null);
  const { notification, showSuccess, hideNotification } = useTransactionSuccessNotification();
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense' | 'investment',
    categoryId: '',
    description: '',
    date: new Date().toLocaleDateString('en-CA', { 
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }),
    // Investment specific fields
    investmentType: 'other' as 'stocks' | 'mutual_funds' | 'crypto' | 'real_estate' | 'other',
    platform: ''
  });

  // Fetch categories when modal opens or type changes
  useEffect(() => {
    if (isModalOpen && (formData.type === 'income' || formData.type === 'expense')) {
      fetchCategories();
    }
  }, [isModalOpen, formData.type]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoCategorizeTimeout) {
        clearTimeout(autoCategorizeTimeout);
      }
    };
  }, [autoCategorizeTimeout]);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories for type:', formData.type);
      const fetchedCategories = await categoryService.getCategories(formData.type);

      // Fetch category usage statistics
      try {
        const transactions = await transactionService.getTransactions({ limit: 100 });
        const usage: {[key: string]: number} = {};
        
        transactions.data.forEach(transaction => {
          // Use category.id if available, otherwise fall back to categoryId
          const categoryId = transaction.category?.id || transaction.categoryId;
          if (categoryId) {
            usage[categoryId] = (usage[categoryId] || 0) + 1;
          }
        });
        
        setCategoryUsage(usage);
      } catch (error) {
        console.warn('Failed to load category usage statistics:', error);
      }

      console.log('Fetched categories:', fetchedCategories);
      setCategories(fetchedCategories);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      console.error('Categories error response:', error.response?.data);
      toast.error('Failed to load categories');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'type' && { categoryId: '' }) // Reset category when type changes
    }));

    // Reset auto-categorized flag when description changes
    if (name === 'description') {
      setAutoCategorized(false);
    }

    // Auto-categorize when description changes and has enough content
    if (name === 'description' && value.trim().length >= 3) {
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

  const handleAutoCategorize = async (description: string) => {
    if (!description || description.length < 3) return;
    
    try {
      setIsAutoCategorizing(true);
      console.log('Auto-categorizing:', description);
      
      if (formData.type === 'investment') {
        // For investments, categorize the investment type and select appropriate category
        const lowerName = description.toLowerCase();
        let suggestedInvestmentType = 'other';
        let confidence = 'medium';

        // Stocks detection
        if (lowerName.includes('stock') || lowerName.includes('inc') || lowerName.includes('corp') || 
            lowerName.includes('ltd') || lowerName.includes('apple') || lowerName.includes('google') || 
            lowerName.includes('microsoft') || lowerName.includes('amazon') || lowerName.includes('tesla') ||
            lowerName.includes('netflix') || lowerName.includes('meta') || lowerName.includes('nvidia') ||
            lowerName.includes('amd') || lowerName.includes('intel') || lowerName.includes('oracle') ||
            lowerName.includes('salesforce') || lowerName.includes('adobe') || lowerName.includes('paypal')) {
          suggestedInvestmentType = 'stocks';
          confidence = 'high';
        } 
        // Mutual Funds detection
        else if (lowerName.includes('fund') || lowerName.includes('etf') || lowerName.includes('index') || 
                 lowerName.includes('mutual') || lowerName.includes('vanguard') || lowerName.includes('fidelity') ||
                 lowerName.includes('schwab') || lowerName.includes('blackrock') || lowerName.includes('sp500') ||
                 lowerName.includes('s&p') || lowerName.includes('nasdaq') || lowerName.includes('dow') ||
                 lowerName.includes('total market') || lowerName.includes('target date') || lowerName.includes('target-date')) {
          suggestedInvestmentType = 'mutual_funds';
          confidence = 'high';
        } 
        // Cryptocurrency detection
        else if (lowerName.includes('bitcoin') || lowerName.includes('crypto') || lowerName.includes('eth') || 
                 lowerName.includes('btc') || lowerName.includes('coin') || lowerName.includes('ethereum') ||
                 lowerName.includes('cardano') || lowerName.includes('solana') || lowerName.includes('polkadot') ||
                 lowerName.includes('chainlink') || lowerName.includes('uniswap') || lowerName.includes('binance') ||
                 lowerName.includes('dogecoin') || lowerName.includes('shiba') || lowerName.includes('xrp') ||
                 lowerName.includes('ripple') || lowerName.includes('litecoin') || lowerName.includes('ltc')) {
          suggestedInvestmentType = 'crypto';
          confidence = 'high';
        } 
        // Real Estate detection
        else if (lowerName.includes('real estate') || lowerName.includes('property') || lowerName.includes('house') || 
                 lowerName.includes('land') || lowerName.includes('apartment') || lowerName.includes('condo') ||
                 lowerName.includes('rental') || lowerName.includes('reit') || lowerName.includes('real estate investment') ||
                 lowerName.includes('commercial') || lowerName.includes('residential') || lowerName.includes('office') ||
                 lowerName.includes('retail') || lowerName.includes('industrial') || lowerName.includes('warehouse')) {
          suggestedInvestmentType = 'real_estate';
          confidence = 'high';
        }
        // Other investments (bonds, commodities, etc.)
        else if (lowerName.includes('bond') || lowerName.includes('treasury') || lowerName.includes('commodity') ||
                 lowerName.includes('gold') || lowerName.includes('silver') || lowerName.includes('oil') ||
                 lowerName.includes('futures') || lowerName.includes('options') || lowerName.includes('derivative')) {
          suggestedInvestmentType = 'other';
          confidence = 'medium';
        }

        // Get investment categories and select appropriate one
        const investmentCategories = await categoryService.getCategories('investment');
        let selectedCategory = investmentCategories.find(cat => cat.name === 'Investment Transaction');
        
        // If it's a specific type of investment, use the main "Investment" category
        if (suggestedInvestmentType !== 'other') {
          selectedCategory = investmentCategories.find(cat => cat.name === 'Investment');
        }

        // Update form data
        setFormData(prev => ({
          ...prev,
          investmentType: suggestedInvestmentType as 'stocks' | 'mutual_funds' | 'crypto' | 'real_estate' | 'other',
          categoryId: selectedCategory?.id || ''
        }));

        // Show success message
        const typeLabel = suggestedInvestmentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const categoryName = selectedCategory?.name || 'Investment';
        const confidenceText = confidence === 'high' ? 'high confidence' : 'medium confidence';
        toast.success(`Auto-categorized as "${typeLabel}" investment (${confidenceText})`);
        
        setAutoCategorized(true);
      } else {
        // For regular transactions, use the existing AI service
        const result = await aiService.autoCategorize({
          description,
          amount: formData.amount ? parseFloat(formData.amount) : undefined
        });

        console.log('Auto-categorization result:', result);

        if (result.categoryId && result.confidence !== 'low') {
          // Update form data with the suggested category and type
          setFormData(prev => ({
            ...prev,
            type: result.transactionType,
            categoryId: result.categoryId || ''
          }));

          // Show success message
          const confidenceText = result.confidence === 'high' ? 'high confidence' : 'medium confidence';
          toast.success(`Auto-categorized as "${result.categoryName}" (${confidenceText})`);
          
          // Set auto-categorized flag
          setAutoCategorized(true);
        }
      }
      
      // Force refresh categories if needed
      if (categories.length === 0) {
        await fetchCategories();
      }
    } catch (error: any) {
      console.error('Auto-categorization failed:', error);
      
      if (error.response?.status === 401) {
        // User is not authenticated
        toast.error('Please log in to use auto-categorization');
      } else if (error.response?.status === 404) {
        // Route not found - server issue
        toast.error('Auto-categorization service is not available');
      } else {
        // Other errors
        toast.error(`Auto-categorization failed: ${error.message}`);
      }
    } finally {
      setIsAutoCategorizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    setIsLoading(true);

    try {
      if (formData.type === 'investment') {
        // Use the auto-categorized categoryId or fallback to Investment Transaction
        let categoryId = formData.categoryId;
        
        if (!categoryId) {
          // Fallback to Investment Transaction category
          const investmentCategories = await categoryService.getCategories('investment');
          const investmentCategory = investmentCategories.find(cat => cat.name === 'Investment Transaction');
          
          if (!investmentCategory) {
            toast.error('Investment category not found. Please contact support.');
            return;
          }
          categoryId = investmentCategory.id;
        }

        // Create both investment and transaction
        const [investmentData, transactionData] = await Promise.all([
          // Create investment record
          investmentService.createInvestment({
            name: formData.description.trim() || 'Quick Investment',
            type: formData.investmentType,
            amountInvested: parseFloat(formData.amount),
            purchaseDate: formData.date + 'T12:00:00',
            platform: formData.platform.trim() || 'Quick Add'
          }),
          // Create transaction record
          transactionService.createTransaction({
            amount: parseFloat(formData.amount),
            type: 'investment',
            categoryId: categoryId,
            description: formData.description.trim() || 'Investment',
            date: formData.date + 'T12:00:00'
          })
        ]);

        // Show modern success notification for investment
        showSuccess({
          type: 'investment',
          amount: parseFloat(formData.amount),
          description: formData.description.trim() || 'Investment',
          category: { name: 'Investment' },
          date: formData.date + 'T12:00:00'
        });
      } else {
        // Create transaction for income/expense
        const transactionData = {
          amount: parseFloat(formData.amount),
          type: formData.type,
          categoryId: formData.categoryId,
          description: formData.description.trim() || undefined,
          date: formData.date + 'T12:00:00'
        };

        const transactionResult = await transactionService.createTransaction(transactionData);
        
        // Find the category name for the notification
        const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
        
        // Show modern success notification
        const notificationAmount = parseFloat(formData.amount);
        console.log('QuickAddTransaction - Amount being passed to notification:', {
          originalAmount: formData.amount,
          parsedAmount: notificationAmount,
          type: typeof notificationAmount
        });
        showSuccess({
          type: formData.type,
          amount: notificationAmount,
          description: formData.description.trim(),
          category: selectedCategory ? { name: selectedCategory.name } : undefined,
          date: formData.date + 'T12:00:00'
        });
      }
      
      // Reset form
      setFormData({
        amount: '',
        type: 'expense',
        categoryId: '',
        description: '',
        date: new Date().toLocaleDateString('en-CA', { 
          timeZone: 'America/Toronto',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        investmentType: 'other',
        platform: ''
      });
      
      // Reset auto-categorization state
      setAutoCategorized(false);
      
      setIsModalOpen(false);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error: any) {
      console.error('Failed to create:', error);
      console.log('Error response:', error.response?.data);
      
      let message = `Failed to add ${formData.type}`;
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

  const openModal = () => {
    console.log('Opening Quick Add Transaction modal');
    console.log('Current modal state:', isModalOpen);
    setIsModalOpen(true);
    console.log('Modal state after setting:', true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    if (onClose) onClose();
  };



  return (
    <>
      {/* Transaction Success Notification */}
      <TransactionSuccessNotification
        isVisible={notification.isVisible}
        onClose={hideNotification}
        transaction={notification.transaction}
        autoHide={true}
        duration={1500}
      />

      {/* Quick Add Button */}
      <button
        onClick={openModal}
        className="btn-primary flex items-center space-x-2 px-4 py-2.5"
        style={{ cursor: 'pointer' }}
        type="button"
      >
        <Plus className="h-4 w-4" />
        <span className="font-medium">Quick Add</span>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={closeModal} />
          <div className="flex min-h-screen items-center justify-center p-4 relative z-10">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Quick Add Transaction</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Transaction Type Tabs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Type
                  </label>
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: 'expense', categoryId: '' }))}
                      className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        formData.type === 'expense'
                          ? 'bg-white text-red-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <TrendingDown className="h-4 w-4 mr-1" />
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: 'income', categoryId: '' }))}
                      className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        formData.type === 'income'
                          ? 'bg-white text-green-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Income
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: 'investment', categoryId: '' }))}
                      className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        formData.type === 'investment'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Building className="h-4 w-4 mr-1" />
                      Investment
                    </button>
                  </div>
                </div>

                {/* Description/Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                    {formData.type === 'investment' ? 'Investment Name' : 'Description'}
                    {formData.type !== 'investment' && (
                      <span className="ml-2 text-xs text-gray-500 flex items-center">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI-powered categorization
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="input-with-icon resize-none"
                      placeholder={formData.type === 'investment' ? 'e.g., Apple Stock, S&P 500 ETF' : 'Add a note about this transaction... (e.g., "coffee at starbucks")'}
                    />
                    {isAutoCategorizing && (
                      <div className="absolute right-3 top-3 flex items-center bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                        <LoadingSpinner size="sm" variant="default" />
                        <span className="ml-2 text-xs text-blue-600 font-medium">AI Categorizing...</span>
                      </div>
                    )}
                    {!isAutoCategorizing && formData.description.trim().length >= 3 && formData.type !== 'investment' && !autoCategorized && (
                      <button
                        type="button"
                        onClick={() => handleAutoCategorize(formData.description.trim())}
                        className="absolute right-3 top-3 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        title="Auto-categorize this transaction"
                      >
                        <Sparkles className="h-4 w-4" />
                      </button>
                    )}
                    {autoCategorized && !isAutoCategorizing && (
                      <div className="absolute right-3 top-3 flex items-center bg-green-50 px-2 py-1 rounded-md border border-green-200">
                        <Sparkles className="h-4 w-4 text-green-600" />
                        <span className="ml-2 text-xs text-green-600 font-medium">AI Categorized</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category for all types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center justify-between">
                    Category
                    {formData.description.trim().length >= 3 && formData.type !== 'investment' && (
                      <button
                        type="button"
                        onClick={() => handleAutoCategorize(formData.description.trim())}
                        disabled={isAutoCategorizing}
                        className="flex items-center space-x-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>{isAutoCategorizing ? 'Categorizing...' : 'Auto-Categorize'}</span>
                      </button>
                    )}
                  </label>
                  {formData.type === 'investment' ? (
                    <CategorySelect
                      value={formData.categoryId}
                      onChange={(categoryId) => setFormData(prev => ({ ...prev, categoryId }))}
                      type="investment"
                      required={false}
                      placeholder="Select investment category"
                    />
                  ) : (
                    <CategorySelect
                      value={formData.categoryId}
                      onChange={(categoryId) => setFormData(prev => ({ ...prev, categoryId }))}
                      type={formData.type}
                      required={false}
                      placeholder="Select a category"
                    />
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      step="0.01"
                      min="0"
                      className="input-with-icon"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Investment Type */}
                {formData.type === 'investment' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Investment Type
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                      <select
                        name="investmentType"
                        value={formData.investmentType}
                        onChange={handleChange}
                        required
                        className="input-with-icon"
                      >
                        <option value="stocks">Stocks</option>
                        <option value="mutual_funds">Mutual Funds</option>
                        <option value="crypto">Cryptocurrency</option>
                        <option value="real_estate">Real Estate</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="input-with-icon"
                    />
                  </div>
                </div>

                {/* Platform for Investments */}
                {formData.type === 'investment' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Platform (Optional)
                    </label>
                    <input
                      type="text"
                      name="platform"
                      value={formData.platform}
                      onChange={handleChange}
                      className="input"
                      placeholder="e.g., Robinhood, Fidelity, Vanguard"
                    />
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    type="submit"
                    isLoading={isLoading}
                    loadingText="Adding..."
                    variant={formData.type === 'expense' ? 'error' : formData.type === 'income' ? 'success' : 'investment'}
                    className="flex-1"
                  >
                    {`Add ${formData.type === 'expense' ? 'Expense' : formData.type === 'income' ? 'Income' : 'Investment'}`}
                  </LoadingButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}