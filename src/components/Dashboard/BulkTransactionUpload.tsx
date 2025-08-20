import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileImage, X, AlertTriangle, CheckCircle, Loader2, Eye, EyeOff, Edit2, Save, ChevronDown } from 'lucide-react';
import { transactionService } from '../../services/transaction';
import { aiService } from '../../services/ai';
import { categoryService } from '../../services/category';
import { useCurrencyFormatter } from '../../utils/currency';
import toast from 'react-hot-toast';
import { Category } from '../../types';

interface ExtractedTransaction {
  amount: number;
  description: string;
  date: string;
  merchant?: string;
  categoryId?: string;
  categoryName?: string;
  transactionType: 'income' | 'expense';
  confidence: 'high' | 'medium' | 'low';
  isDuplicate?: boolean;
  duplicateId?: string;
}

interface BulkTransactionUploadProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function BulkTransactionUpload({ onClose, onSuccess }: BulkTransactionUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [extractedTransactions, setExtractedTransactions] = useState<ExtractedTransaction[]>([]);
  const [duplicates, setDuplicates] = useState<ExtractedTransaction[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [categories, setCategories] = useState<{
    income: Category[];
    expense: Category[];
  }>({ income: [], expense: [] });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { formatCurrency } = useCurrencyFormatter();

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const [incomeCategories, expenseCategories] = await Promise.all([
          categoryService.getCategories('income'),
          categoryService.getCategories('expense')
        ]);
        setCategories({ income: incomeCategories, expense: expenseCategories });
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  const handleQuickEdit = (index: number, field: 'description' | 'categoryId', value: string) => {
    const updatedTransactions = [...extractedTransactions];
    const transaction = updatedTransactions[index];
    
    if (field === 'description') {
      transaction.description = value;
    } else if (field === 'categoryId') {
      transaction.categoryId = value;
      // Update category name based on selected category
      const allCategories = [...categories.income, ...categories.expense];
      const selectedCategory = allCategories.find(cat => cat.id === value);
      transaction.categoryName = selectedCategory?.name || '';
    }
    
    setExtractedTransactions(updatedTransactions);
  };

  const handleSaveEdit = () => {
    setEditingIndex(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowCategoryDropdown(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      setProcessingStep('Initializing AI analysis...');
      setProcessingProgress(10);
      setStartTime(Date.now());
      setEstimatedTime(15000); // 15 seconds estimate
      
      toast.loading('Processing image and extracting transactions...');

      // Step 1: Convert file to base64
      setProcessingStep('Preparing image for analysis...');
      setProcessingProgress(20);
      const base64 = await fileToBase64(selectedFile);
      
      // Step 2: Call AI service to extract transactions
      setProcessingStep('AI is analyzing the image and extracting transactions...');
      setProcessingProgress(40);
      
      // Update progress periodically during AI processing
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          const elapsed = Date.now() - startTime;
          const estimated = Math.min(90, 40 + (elapsed / estimatedTime) * 50);
          return Math.floor(estimated);
        });
      }, 1000);
      
      // Set a timeout warning for long operations
      const timeoutWarning = setTimeout(() => {
        if (isProcessing) {
          toast.dismiss();
          toast('Processing is taking longer than expected. This is normal for complex images.', {
            duration: 4000,
            icon: '⏱️'
          });
        }
      }, 20000); // 20 seconds
      
      const result = await aiService.extractBulkTransactions(base64);
      clearInterval(progressInterval);
      clearTimeout(timeoutWarning);
      
      console.log('AI extraction result:', result);
      console.log('Transactions found:', result.transactions?.length || 0);
      
      if (result.transactions && result.transactions.length > 0) {
        console.log('Setting extracted transactions:', result.transactions);
        
        // Step 3: Check for duplicates
        setProcessingStep('Checking for duplicate transactions...');
        setProcessingProgress(80);
        
        const duplicatesFound = await checkForDuplicates(result.transactions);
        
        setProcessingStep('Finalizing results...');
        setProcessingProgress(100);
        
        if (duplicatesFound.length > 0) {
          console.log('Found duplicates:', duplicatesFound);
          setDuplicates(duplicatesFound);
          setShowDuplicates(true);
          toast.dismiss();
          toast.success(`Found ${duplicatesFound.length} potential duplicates`);
        } else {
          console.log('No duplicates found, setting transactions:', result.transactions);
          setExtractedTransactions(result.transactions);
          toast.dismiss();
          toast.success(`Extracted ${result.transactions.length} transactions`);
        }
      } else {
        toast.dismiss();
        toast.error('No transactions found in the image');
      }
    } catch (error: any) {
      console.error('Error processing image:', error);
      toast.dismiss();
      toast.error('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
      setProcessingProgress(0);
      setStartTime(0);
      setEstimatedTime(0);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        resolve(base64.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const checkForDuplicates = async (transactions: ExtractedTransaction[]): Promise<ExtractedTransaction[]> => {
    const duplicates: ExtractedTransaction[] = [];
    
    for (const transaction of transactions) {
      try {
        // Search for similar transactions in the last 30 days
        const searchDate = new Date(transaction.date);
        const startDate = new Date(searchDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        const endDate = new Date(searchDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const existingTransactions = await transactionService.getTransactions({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          limit: 100
        });

        // Check for exact matches
        const duplicate = existingTransactions.data.find(existing => {
          const amountMatch = Math.abs(existing.amount - transaction.amount) < 0.01;
          const dateMatch = new Date(existing.date).toDateString() === new Date(transaction.date).toDateString();
          const descriptionMatch = existing.description?.toLowerCase().includes(transaction.description.toLowerCase()) ||
                                 transaction.description.toLowerCase().includes(existing.description?.toLowerCase() || '');
          
          return amountMatch && dateMatch && descriptionMatch;
        });

        if (duplicate) {
          duplicates.push({
            ...transaction,
            isDuplicate: true,
            duplicateId: duplicate.id
          });
        }
      } catch (error) {
        console.error('Error checking for duplicates:', error);
      }
    }

    return duplicates;
  };

  const handleRemoveDuplicates = () => {
    const nonDuplicates = extractedTransactions.filter(t => !t.isDuplicate);
    setExtractedTransactions(nonDuplicates);
    setShowDuplicates(false);
    setDuplicates([]);
    toast.success(`Removed ${duplicates.length} duplicates`);
  };

  const handleKeepAll = () => {
    setShowDuplicates(false);
    setDuplicates([]);
    toast.success('Keeping all transactions including duplicates');
  };

  const handleDeleteTransaction = (index: number) => {
    setDeleteIndex(index);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTransaction = () => {
    if (deleteIndex !== null) {
      const updatedTransactions = extractedTransactions.filter((_, i) => i !== deleteIndex);
      setExtractedTransactions(updatedTransactions);
      toast.success('Transaction removed');
    }
    setShowDeleteConfirm(false);
    setDeleteIndex(null);
  };

  const saveTransactions = async () => {
    if (extractedTransactions.length === 0) return;

    try {
      setIsUploading(true);
      toast.loading(`Saving ${extractedTransactions.length} transactions...`);

      const results = await Promise.allSettled(
        extractedTransactions.map(transaction => 
          transactionService.createTransaction({
            amount: transaction.amount,
            type: transaction.transactionType,
            categoryId: transaction.categoryId || '',
            description: transaction.description,
            date: transaction.date
          })
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      toast.dismiss();
      
      if (successful > 0) {
        toast.success(`Successfully saved ${successful} transactions`);
        if (failed > 0) {
          toast.error(`${failed} transactions failed to save`);
        }
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error('Failed to save any transactions');
      }
    } catch (error: any) {
      console.error('Error saving transactions:', error);
      toast.dismiss();
      toast.error('Failed to save transactions');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadedImage(null);
    setExtractedTransactions([]);
    setDuplicates([]);
    setShowDuplicates(false);
    setProcessingStep('');
    setProcessingProgress(0);
    setStartTime(0);
    setEstimatedTime(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />

          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Bulk Transaction Upload</h3>
                <p className="text-sm text-gray-600 mt-1">Upload a screenshot of your bank transactions</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row h-[calc(95vh-80px)] sm:h-[calc(90vh-100px)]">
              {/* Left Side - Image Upload & Preview */}
              <div className="w-full lg:w-1/2 p-4 lg:border-r border-gray-200 overflow-y-auto">
                {/* Upload Section */}
                {!uploadedImage && (
                  <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-primary-400 transition-colors min-h-[200px] flex flex-col items-center justify-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <FileImage className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-base sm:text-lg text-gray-700 font-medium mb-2">Upload bank transaction screenshot</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                  </label>
                )}

                {/* Image Preview */}
                {uploadedImage && (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto">
                      <div className="relative mb-3">
                        <img
                          src={uploadedImage}
                          alt="Uploaded transaction screenshot"
                          className="w-full h-auto rounded-lg border shadow-sm"
                        />
                        <div className="absolute top-2 right-2">
                          <button 
                            onClick={resetUpload}
                            className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 text-gray-600 hover:text-gray-800 shadow-sm"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 pt-4">
                      <button
                        onClick={processImage}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 sm:py-4 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[48px]"
                      >
                        {isProcessing ? (
                          <>
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                            <span className="hidden sm:inline">Processing... ({processingProgress}%)</span>
                            <span className="sm:hidden">Processing...</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Extract Transactions</span>
                            <span className="sm:hidden">Extract</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side - Results */}
              <div className="w-full lg:w-1/2 p-4 overflow-y-auto border-t lg:border-t-0 border-gray-200">
                {/* Processing State */}
                {isProcessing && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center w-full max-w-md">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 mx-auto relative">
                          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                            <circle
                              cx="40"
                              cy="40"
                              r="36"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="transparent"
                              className="text-gray-200"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="36"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="transparent"
                              strokeDasharray={`${2 * Math.PI * 36}`}
                              strokeDashoffset={`${2 * Math.PI * 36 * (1 - processingProgress / 100)}`}
                              className="text-primary-600 transition-all duration-300 ease-out"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-gray-900">{processingProgress}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Processing Image
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-4">
                        {processingStep}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${processingProgress}%` }}
                        ></div>
                      </div>
                      
                      {/* Time Estimate */}
                      {startTime > 0 && (
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>Estimated time: {Math.ceil(estimatedTime / 1000)} seconds</p>
                          <p>This may take longer for images with many transactions</p>
                        </div>
                      )}
                      
                      {/* Tips */}
                      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700">
                          💡 <strong>Tip:</strong> Processing time depends on image quality and number of transactions. 
                          Clear, high-resolution images work best.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Duplicates Confirmation */}
                {showDuplicates && duplicates.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-center pb-3 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">Potential Duplicates Found</h4>
                      <p className="text-xs text-gray-600">We found {duplicates.length} transactions that might be duplicates</p>
                    </div>
                    
                    <div className="space-y-3">
                      {duplicates.slice(0, 6).map((duplicate, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{duplicate.description}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>{duplicate.date}</span>
                              <span className="capitalize">{duplicate.transactionType}</span>
                            </div>
                          </div>
                          <div className="text-right ml-3">
                            <span className="font-bold text-red-600">
                              {formatCurrency(duplicate.amount)}
                            </span>
                          </div>
                        </div>
                      ))}
                      {duplicates.length > 6 && (
                        <p className="text-sm text-yellow-600 text-center py-2">
                          ... and {duplicates.length - 6} more potential duplicates
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleRemoveDuplicates}
                        className="flex-1 btn-secondary flex items-center justify-center py-3 touch-manipulation min-h-[48px]"
                      >
                        <X className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Remove Duplicates</span>
                        <span className="sm:hidden">Remove</span>
                      </button>
                      <button
                        onClick={handleKeepAll}
                        className="flex-1 btn-primary flex items-center justify-center py-3 touch-manipulation min-h-[48px]"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Keep All</span>
                        <span className="sm:hidden">Keep</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Extracted Transactions */}
                {extractedTransactions.length > 0 && !isProcessing && (
                  <div className="space-y-4">
                    <div className="text-center pb-3 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">Extracted Transactions</h4>
                      <p className="text-xs text-gray-600">{extractedTransactions.length} transactions found • Total: {formatCurrency(extractedTransactions.reduce((sum, t) => sum + t.amount, 0))}</p>
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {extractedTransactions.map((transaction, index) => (
                        <div
                          key={index}
                          className={`relative p-3 rounded-lg border ${
                            transaction.isDuplicate ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                          } hover:shadow-md transition-shadow`}
                        >
                          {/* Transaction Header with Quick Edit */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                              {editingIndex === index ? (
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="text"
                                    value={transaction.description}
                                    onChange={(e) => handleQuickEdit(index, 'description', e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    autoFocus
                                  />
                                  <button
                                    onClick={handleSaveEdit}
                                    className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                                    title="Save changes"
                                  >
                                    <Save className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold text-gray-900 truncate">
                                    {transaction.description}
                                  </h4>
                                  <button
                                    onClick={() => setEditingIndex(index)}
                                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Edit description"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                              <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                <span>{transaction.date}</span>
                                <span className="capitalize">{transaction.transactionType}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <span className={`text-lg font-bold ${
                                  transaction.transactionType === 'expense' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {transaction.transactionType === 'expense' ? '-' : '+'}
                                  {formatCurrency(transaction.amount)}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteTransaction(index)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove transaction"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Transaction Details - Improved Layout */}
                          <div className="space-y-2 text-xs">
                            {/* Category Row */}
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600 font-medium min-w-16">Category:</span>
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowCategoryDropdown(showCategoryDropdown === index ? null : index);
                                  }}
                                  className="flex items-center space-x-2 px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors justify-between min-w-32 max-w-48"
                                >
                                  <div className="flex items-center space-x-2">
                                    <div 
                                      className="w-3 h-3 rounded-full flex-shrink-0" 
                                      style={{ backgroundColor: categories.income.concat(categories.expense).find(cat => cat.id === transaction.categoryId)?.color || '#9CA3AF' }}
                                    />
                                    <span className="truncate">{transaction.categoryName || 'Select Category'}</span>
                                  </div>
                                  <ChevronDown className="h-3 w-3 flex-shrink-0" />
                                </button>
                                
                                {showCategoryDropdown === index && (
                                  <div 
                                    className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="p-2">
                                      {transaction.transactionType === 'income' ? (
                                        <>
                                          <div className="text-xs font-medium text-gray-700 mb-2 px-2">Income Categories</div>
                                          {categories.income.map((category) => (
                                            <button
                                              key={category.id}
                                              onClick={() => {
                                                handleQuickEdit(index, 'categoryId', category.id);
                                                setShowCategoryDropdown(null);
                                              }}
                                              className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded flex items-center space-x-2"
                                            >
                                              <div 
                                                className="w-3 h-3 rounded-full" 
                                                style={{ backgroundColor: category.color || '#9CA3AF' }}
                                              />
                                              <span>{category.name}</span>
                                            </button>
                                          ))}
                                        </>
                                      ) : (
                                        <>
                                          <div className="text-xs font-medium text-gray-700 mb-2 px-2">Expense Categories</div>
                                          {categories.expense.map((category) => (
                                            <button
                                              key={category.id}
                                              onClick={() => {
                                                handleQuickEdit(index, 'categoryId', category.id);
                                                setShowCategoryDropdown(null);
                                              }}
                                              className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded flex items-center space-x-2"
                                            >
                                              <div 
                                                className="w-3 h-3 rounded-full" 
                                                style={{ backgroundColor: category.color || '#9CA3AF' }}
                                              />
                                              <span>{category.name}</span>
                                            </button>
                                          ))}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* AI Confidence Row */}
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600 font-medium min-w-20">AI Confidence:</span>
                              <span className={`px-2 py-1 rounded font-medium ${
                                transaction.confidence === 'high' ? 'bg-green-100 text-green-800' :
                                transaction.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {transaction.confidence}
                              </span>
                            </div>



                            {/* Duplicate Warning */}
                            {transaction.isDuplicate && (
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-600 font-medium min-w-16">Status:</span>
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-medium">
                                  ⚠️ Duplicate
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={onClose}
                        className="flex-1 btn-secondary py-3 touch-manipulation min-h-[48px]"
                        disabled={isUploading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveTransactions}
                        className="flex-1 btn-primary flex items-center justify-center py-3 touch-manipulation min-h-[48px]"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        <span className="hidden sm:inline">
                          {isUploading ? 'Saving...' : `Save ${extractedTransactions.length} Transactions`}
                        </span>
                        <span className="sm:hidden">
                          {isUploading ? 'Saving...' : `Save ${extractedTransactions.length}`}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && deleteIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center mb-6">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-gray-900">Remove Transaction</h3>
            </div>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Are you sure you want to remove "{extractedTransactions[deleteIndex]?.description}"? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteIndex(null);
                }}
                className="btn-secondary py-3 touch-manipulation min-h-[48px] order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTransaction}
                className="btn-primary bg-red-600 hover:bg-red-700 py-3 touch-manipulation min-h-[48px] order-1 sm:order-2"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
