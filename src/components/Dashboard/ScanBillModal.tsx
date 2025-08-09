import React, { useEffect, useMemo, useState } from 'react';
import { Camera, Image as ImageIcon, Upload, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiService, ScanBillResult } from '../../services/ai';
import { categoryService } from '../../services/category';
import { transactionService } from '../../services/transaction';
import { Category } from '../../types';
import heic2any from 'heic2any';

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
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      let processed: Blob = file;
      const isHeic = file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic');
      if (isHeic) {
        const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
        processed = Array.isArray(converted) ? converted[0] : converted;
      } else if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image');
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
      toast.error('Failed to process HEIC image');
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
    return Boolean(result?.amount && selectedCategoryId);
  }, [result, selectedCategoryId]);

  const handleCreate = async () => {
    if (!result?.amount || !selectedCategoryId) return;
    try {
      // Ensure we have a valid date
      const transactionDate = selectedDate || new Date().toISOString().split('T')[0];
      
      const transactionData = {
        amount: result.amount,
        type: (result.transactionType as 'income' | 'expense') || 'expense',
        categoryId: selectedCategoryId,
        description: result.description || result.merchant || 'Scanned document',
        date: transactionDate,
      };
      
      console.log('Creating transaction with data:', transactionData);
      
      await transactionService.createTransaction(transactionData);
      toast.success(`${result.transactionType === 'income' ? 'Income' : 'Expense'} created`);
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
      <button onClick={open} className="btn-secondary flex items-center space-x-2">
        <Camera className="h-4 w-4" />
        <span>Scan Bill</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={close} />

            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Scan Bill</h3>
                <button onClick={close} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {!imagePreview ? (
                  <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400">
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-700 font-medium">Upload a bill photo</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to ~5MB</p>
                  </label>
                ) : (
                  <div>
                    <img src={imagePreview} alt="Preview" className="w-full rounded-lg border" />
                    <div className="flex justify-between mt-3">
                      <button onClick={() => { setImagePreview(null); setImageBase64(null); setResult(null); }} className="btn-secondary">Change</button>
                      <button onClick={handleScan} disabled={scanning} className="btn-primary flex items-center">
                        {scanning ? (
                          <>
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                            Scanning...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" /> Analyze
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {result && (
                  <div className="mt-2 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="card"><div className="card-body py-3"><p className="text-sm text-gray-500">Amount</p><p className="font-semibold">{result.amount ?? '-'}</p></div></div>
                      <div className="card"><div className="card-body py-3"><p className="text-sm text-gray-500">Type</p><p className="font-semibold capitalize">{result.transactionType || '—'}</p></div></div>
                      <div className="card"><div className="card-body py-3"><p className="text-sm text-gray-500">Currency</p><p className="font-semibold">{result.currency || '—'}</p></div></div>
                      <div className="card"><div className="card-body py-3"><p className="text-sm text-gray-500">Date</p><p className="font-semibold">{result.date || '—'}</p></div></div>
                      <div className="card"><div className="card-body py-3"><p className="text-sm text-gray-500">Merchant</p><p className="font-semibold">{result.merchant || '—'}</p></div></div>
                      <div className="card"><div className="card-body py-3"><p className="text-sm text-gray-500">Category</p><p className="font-semibold">{result.categoryName || '—'}</p></div></div>
                    </div>
                    <div className="card">
                      <div className="card-body py-3">
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="font-semibold break-words">{result.description || '—'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select className="select select-bordered w-full" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
                        <option value="">Select category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        className="input input-bordered w-full"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>

                    <button onClick={handleCreate} className="btn btn-primary w-full" disabled={!canCreate}>
                      Create {result.transactionType === 'income' ? 'Income' : 'Expense'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


