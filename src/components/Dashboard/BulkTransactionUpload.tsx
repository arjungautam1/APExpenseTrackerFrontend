import React, { useState, useRef } from 'react';
import { aiService, BulkTransactionData, ExtractedTransaction } from '../../services/ai';
import { transactionService } from '../../services/transaction';
import { useCurrencyFormatter } from '../../utils/currency';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface BulkTransactionUploadProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkTransactionUpload({ onClose, onSuccess }: BulkTransactionUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [extractedTransactions, setExtractedTransactions] = useState<ExtractedTransaction[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { formatCurrency } = useCurrencyFormatter();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'text/csv'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid file type (JPEG, PNG, PDF, or CSV)');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Extract transactions using AI
      const result = await aiService.extractBulkTransactions({ text: base64, format: 'text' });

      // Check for duplicates
      const duplicatesFound = await checkForDuplicates(result.transactions);

      if (duplicatesFound.length > 0) {
        toast.error(`Found ${duplicatesFound.length} potential duplicate transactions`);
      }

      setExtractedTransactions(result.transactions);
      setSelectedTransactions(new Set(result.transactions.map((_, index) => index)));
      toast.success(`Successfully extracted ${result.transactions.length} transactions`);

    } catch (error: any) {
      console.error('Error processing file:', error);
      toast.error(error?.response?.data?.message || 'Failed to process file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const checkForDuplicates = async (transactions: ExtractedTransaction[]): Promise<ExtractedTransaction[]> => {
    // This is a simplified duplicate check
    // In a real implementation, you'd compare with existing transactions
    const duplicates: ExtractedTransaction[] = [];
    
    for (const transaction of transactions) {
      // Check if similar transaction exists in the last 30 days
      const similarTransactions = await transactionService.getTransactions({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        limit: 100
      });

      const isDuplicate = similarTransactions.data.some(existing => 
        Math.abs(existing.amount - transaction.amount) < 0.01 &&
        existing.description?.toLowerCase().includes(transaction.description.toLowerCase())
      );

      if (isDuplicate) {
        duplicates.push(transaction);
      }
    }

    return duplicates;
  };

  const handleTransactionToggle = (index: number) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTransactions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTransactions.size === extractedTransactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(extractedTransactions.map((_, index) => index)));
    }
  };

  const handleProcessSelected = async () => {
    if (selectedTransactions.size === 0) {
      toast.error('Please select at least one transaction to process');
      return;
    }

    setIsProcessing(true);

    try {
      const selectedTransactionsList = Array.from(selectedTransactions).map(index => extractedTransactions[index]);
      let successCount = 0;
      let errorCount = 0;

      for (const transaction of selectedTransactionsList) {
        try {
          await transactionService.createTransaction({
            amount: transaction.amount,
            type: transaction.type || 'expense',
            categoryId: '', // Will be auto-categorized
            description: transaction.description,
            date: transaction.date || new Date().toISOString()
          });
          successCount++;
        } catch (error) {
          console.error('Error creating transaction:', error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} transactions`);
        onSuccess();
        onClose();
      }

      if (errorCount > 0) {
        toast.error(`Failed to create ${errorCount} transactions`);
      }

    } catch (error: any) {
      console.error('Error processing transactions:', error);
      toast.error('Failed to process transactions');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setExtractedTransactions([]);
    setSelectedTransactions(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Transaction Upload</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {extractedTransactions.length === 0 ? (
            /* Upload Section */
            <div className="space-y-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Upload Transaction File</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Upload a receipt image, PDF, or CSV file to extract transactions
                </p>
              </div>

              <div className="flex justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="btn btn-primary inline-flex items-center"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Choose File
                    </>
                  )}
                </button>
              </div>

              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <div className="text-sm text-gray-500 text-center">
                <p>Supported formats: JPEG, PNG, PDF, CSV</p>
                <p>Maximum file size: 10MB</p>
              </div>
            </div>
          ) : (
            /* Review Section */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Review Extracted Transactions ({extractedTransactions.length})
                </h3>
                <button
                  onClick={handleRetry}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Upload Another File
                </button>
              </div>

              {/* Select All */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedTransactions.size === extractedTransactions.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Select All ({selectedTransactions.size}/{extractedTransactions.length})
                </label>
              </div>

              {/* Transactions List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {extractedTransactions.map((transaction, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg transition-colors ${
                      selectedTransactions.has(index)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.has(index)}
                        onChange={() => handleTransactionToggle(index)}
                        className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {transaction.description}
                          </p>
                          <p className={`text-sm font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                          <span className="capitalize">{transaction.type || 'expense'}</span>
                          {transaction.date && (
                            <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          )}
                          {transaction.confidence && (
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              transaction.confidence === 'high' ? 'bg-green-100 text-green-800' :
                              transaction.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {transaction.confidence} confidence
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={onClose}
                  className="btn btn-secondary"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessSelected}
                  disabled={selectedTransactions.size === 0 || isProcessing}
                  className="btn btn-primary inline-flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Create {selectedTransactions.size} Transaction{selectedTransactions.size !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
