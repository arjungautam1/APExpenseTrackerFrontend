import React, { useEffect, useMemo, useState } from 'react';
import { Camera, Image as ImageIcon, Upload, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiService, ScanBillResult } from '../../services/ai';
import { categoryService } from '../../services/category';
import { transactionService } from '../../services/transaction';
import { Category } from '../../types';
import heic2any from 'heic2any';
import { TransactionSuccessNotification, useTransactionSuccessNotification } from '../UI/TransactionSuccessNotification';

interface ScanBillModalProps {
  onSuccess?: () => void;
}

export function ScanBillModal({ onSuccess }: ScanBillModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanBillResult | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editableAmount, setEditableAmount] = useState<number>(0);
  const { notification, showSuccess, hideNotification } = useTransactionSuccessNotification();

  useEffect(() => {
    if (isOpen) {
      // load expense categories by default
      categoryService.getCategories('expense').then(setCategories).catch(() => {});
    }
  }, [isOpen]);

  // Load appropriate categories based on transaction type
  useEffect(() => {
    if (result?.transactionType && isOpen) {
      const type = result.transactionType as 'income' | 'expense';
      console.log('Loading categories for type:', type);
      categoryService.getCategories(type).then(setCategories).catch(() => {});
    }
  }, [result?.transactionType, isOpen]);

  // Reset category selection when categories change
  useEffect(() => {
    if (result && categories.length > 0) {
      // try to map category name
      const normalized = (result.categoryName || '').toLowerCase();
      console.log('Looking for category:', normalized);
      
      // First try exact match
      let match = categories.find(c => c.name.toLowerCase() === normalized);
      
      // If no exact match, try partial matches for common variations
      if (!match) {
        if (normalized.includes('grocery') || normalized.includes('supermarket') || normalized.includes('food market')) {
          match = categories.find(c => c.name.toLowerCase().includes('grocery'));
        } else if (normalized.includes('restaurant') || normalized.includes('cafe') || normalized.includes('coffee') || normalized.includes('dining')) {
          match = categories.find(c => c.name.toLowerCase().includes('food') && c.name.toLowerCase().includes('dining'));
        }
      }
      
      if (match) {
        console.log('Found matching category:', match.name);
        setSelectedCategoryId(match.id);
      } else {
        // Find appropriate "other" category based on transaction type
        const type = result.transactionType as 'income' | 'expense';
        const other = categories.find(c => 
          c.name.toLowerCase().includes('other') && c.type === type
        );
        if (other) {
          console.log('Using other category:', other.name);
          setSelectedCategoryId(other.id);
        } else if (categories.length > 0) {
          // Fallback to first category of correct type
          const firstCategory = categories.find(c => c.type === type);
          if (firstCategory) {
            console.log('Using first category:', firstCategory.name);
            setSelectedCategoryId(firstCategory.id);
          }
        }
      }
    }
  }, [result, categories]);

  const open = () => setIsOpen(true);
  const close = () => {
    setIsOpen(false);
    setImagePreview(null);
    setImageBase64(null);
    setScanning(false);
    setResult(null);
    setSelectedCategoryId('');
    setSelectedDate('');
    setEditableAmount(0);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      let processed: Blob = file;
      const isHeic = file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic');
      
      if (isHeic) {
        // Show conversion message
        toast.loading('Converting HEIC image to JPEG format...', { duration: 5000 });
        
        try {
          const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
          processed = Array.isArray(converted) ? converted[0] : converted;
          
          // Dismiss loading toast and show success
          toast.dismiss();
          toast.success('HEIC image converted successfully to JPEG');
        } catch (conversionError) {
          // Dismiss loading toast and show error
          toast.dismiss();
          toast.error('Failed to convert HEIC image. Please try a different image or convert it manually.');
          return;
        }
      } else if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (JPEG, PNG, HEIC, etc.)');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
        setImageBase64(base64);
      };
      reader.readAsDataURL(processed);
    } catch (err) {
      console.error('File processing error:', err);
      toast.error('Failed to process image. Please try again with a different file.');
    }
  };

  const handleScan = async () => {
    if (!imageBase64) {
      toast.error('Upload an image first');
      return;
    }
    try {
      setScanning(true);
      console.log('Sending scan request with base64 length:', imageBase64.length);
      
      // Show progress message
      toast.loading('Analyzing image... This may take 10-30 seconds', { duration: 30000 });
      
      const data = await aiService.scanBill(imageBase64);
      console.log('Scan response received:', data);
      
      // Dismiss loading toast
      toast.dismiss();
      
      if (!data.amount && !data.merchant && !data.description) {
        toast.error('Could not extract meaningful data from the image. Please try a clearer image.');
        return;
      }
      
      setResult(data);
      
      // Set editable amount from result
      setEditableAmount(data.amount || 0);
      
      // Use extracted date if available, otherwise use current date
      let dateToUse = '';
      if (data.date) {
        // Try to parse the extracted date
        try {
          const extractedDate = new Date(data.date);
          if (!isNaN(extractedDate.getTime())) {
            // Format the extracted date to YYYY-MM-DD
            const year = extractedDate.getFullYear();
            const month = String(extractedDate.getMonth() + 1).padStart(2, '0');
            const day = String(extractedDate.getDate()).padStart(2, '0');
            dateToUse = `${year}-${month}-${day}`;
            console.log('Using extracted date:', dateToUse);
          }
        } catch (dateError) {
          console.warn('Failed to parse extracted date:', data.date, dateError);
        }
      }
      
      // Fallback to current date if no valid date was extracted
      if (!dateToUse) {
        const torontoDate = new Date().toLocaleDateString('en-CA', { 
          timeZone: 'America/Toronto',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        dateToUse = torontoDate;
        console.log('Using current date as fallback:', dateToUse);
      }
      
      setSelectedDate(dateToUse);
      
      toast.success('Details extracted successfully');
    } catch (error: any) {
      console.error('Scan error:', error);
      console.error('Error response:', error.response?.data);
      
      // Dismiss loading toast
      toast.dismiss();
      
      let message = 'Failed to analyze image';
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        message = 'Analysis timed out. Please try again with a smaller or clearer image.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.details) {
        message = `Analysis failed: ${error.response.data.details}`;
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
    } finally {
      setScanning(false);
    }
  };

  const canCreate = useMemo(() => {
    return Boolean(editableAmount && editableAmount > 0 && selectedCategoryId);
  }, [editableAmount, selectedCategoryId]);

  const handleCreate = async () => {
    if (!editableAmount || editableAmount <= 0 || !selectedCategoryId) return;
    try {
      // Ensure we have a valid date in Toronto timezone
      const transactionDate = selectedDate || new Date().toLocaleDateString('en-CA', { 
        timeZone: 'America/Toronto',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      // Ensure date is sent as local date string to avoid timezone conversion
      const localDateString = transactionDate + 'T12:00:00';
      
      const transactionData = {
        amount: editableAmount,
        type: (result?.transactionType as 'income' | 'expense') || 'expense',
        categoryId: selectedCategoryId,
        description: result?.description || result?.merchant || 'Scanned document',
        date: localDateString,
      };
      
      console.log('Creating transaction with data:', transactionData);
      
      const transactionResult = await transactionService.createTransaction(transactionData);
      
      // Find the category name for the notification
      const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
      
      // Show modern success notification
      const notificationAmount = parseFloat(editableAmount.toString());
      console.log('ScanBillModal - Amount being passed to notification:', {
        originalAmount: editableAmount,
        parsedAmount: notificationAmount,
        type: typeof notificationAmount
      });
      showSuccess({
        type: (result?.transactionType as 'income' | 'expense') || 'expense',
        amount: notificationAmount,
        description: result?.description || result?.merchant || 'Scanned document',
        category: selectedCategory ? { name: selectedCategory.name } : undefined,
        date: localDateString
      });
      
      close();
      onSuccess?.();
    } catch (error: any) {
      console.error('Transaction creation error:', error);
      console.error('Error response:', error.response?.data);
      
      let message = 'Failed to create transaction';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        message = typeof errors === 'object' 
          ? Object.values(errors).join(', ')
          : errors;
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
    }
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

      <button onClick={open} className="btn-secondary flex items-center space-x-2">
        <Camera className="h-4 w-4" />
        <span>Scan Bill</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={close} />

            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[85vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">Scan Bill & Extract Details</h3>
                <button onClick={close} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex h-[calc(85vh-80px)]">
                {/* Left Side - Image Upload & Preview */}
                <div className="w-1/2 p-4 border-r border-gray-200 overflow-y-auto">
                  {!imagePreview ? (
                    <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 transition-colors">
                      <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-3" />
                      <p className="text-base text-gray-700 font-medium mb-1">Upload a bill photo</p>
                      <p className="text-xs text-gray-500">PNG, JPG, HEIC up to ~5MB</p>
                    </label>
                  ) : (
                    <div className="flex flex-col h-full">
                      <div className="flex-1 overflow-y-auto">
                        <div className="relative mb-3">
                          <img src={imagePreview} alt="Preview" className="w-full h-auto rounded-lg border shadow-sm" />
                          <div className="absolute top-2 right-2">
                            <button 
                              onClick={() => { setImagePreview(null); setImageBase64(null); setResult(null); }}
                              className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 text-gray-600 hover:text-gray-800 shadow-sm"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 pt-3">
                        <button 
                          onClick={handleScan} 
                          disabled={scanning} 
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {scanning ? (
                            <>
                              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                              Analyzing image...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" /> 
                              Analyze Bill
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - Analysis Results */}
                <div className="w-1/2 p-4 overflow-y-auto">
                  {!result ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-base font-medium">Upload and analyze a bill</p>
                        <p className="text-xs">Extracted details will appear here</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="text-center pb-3 border-b border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">Extracted Details</h4>
                        <p className="text-xs text-gray-600">Review and edit the information below</p>
                      </div>

                      {/* Key Details Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                          <p className="text-xs font-medium text-green-700 mb-1">Amount</p>
                          <div className="flex items-center">
                            <span className="text-lg font-bold text-green-800 mr-1">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="text-lg font-bold text-green-800 bg-transparent border-none outline-none w-full"
                              value={editableAmount}
                              onChange={(e) => setEditableAmount(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                          <p className="text-xs font-medium text-blue-700 mb-1">Type</p>
                          <p className="text-sm font-semibold text-blue-800 capitalize">{result.transactionType || 'expense'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border">
                          <p className="text-xs font-medium text-gray-600 mb-1">Currency</p>
                          <p className="text-sm font-semibold text-gray-800">{result.currency || 'USD'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border">
                          <p className="text-xs font-medium text-gray-600 mb-1">Date</p>
                          <p className="text-sm font-semibold text-gray-800">{result.date || 'Not detected'}</p>
                        </div>
                      </div>

                      {/* Merchant & Description */}
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg border">
                          <p className="text-xs font-medium text-gray-600 mb-1">Merchant</p>
                          <p className="text-sm font-semibold text-gray-800">{result.merchant || 'Not detected'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border">
                          <p className="text-xs font-medium text-gray-600 mb-1">Description</p>
                          <p className="text-sm font-semibold text-gray-800 break-words">{result.description || 'Not detected'}</p>
                        </div>
                      </div>

                      {/* Form Fields */}
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                          <select 
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedCategoryId} 
                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                          >
                            <option value="">Select category</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Transaction Date</label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                          />
                          {result.date && (
                            <p className="text-xs text-gray-500 mt-1">Date extracted from receipt: {result.date}</p>
                          )}
                        </div>

                        <button 
                          onClick={handleCreate} 
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!canCreate}
                        >
                          <span className="mr-2">✓</span>
                          Create {result.transactionType === 'income' ? 'Income' : 'Expense'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


