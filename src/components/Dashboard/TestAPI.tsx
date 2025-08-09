import React, { useState } from 'react';
import { categoryService } from '../../services/category';
import { transactionService } from '../../services/transaction';
import toast from 'react-hot-toast';

export function TestAPI() {
  const [loading, setLoading] = useState(false);

  const testCategories = async () => {
    setLoading(true);
    try {
      const categories = await categoryService.getCategories('expense');
      console.log('Categories loaded:', categories);
      toast.success(`Loaded ${categories.length} categories`);
    } catch (error: any) {
      console.error('Categories test failed:', error);
      toast.error('Categories test failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const testTransaction = async () => {
    setLoading(true);
    try {
      // First get categories
      const categories = await categoryService.getCategories('expense');
      if (categories.length === 0) {
        throw new Error('No categories available');
      }

      // Create a test transaction
      const transaction = await transactionService.createTransaction({
        amount: 25.50,
        type: 'expense',
        categoryId: categories[0].id,
        description: 'Test transaction from API test component',
        date: new Date().toISOString().split('T')[0]
      });

      console.log('Transaction created:', transaction);
      toast.success('Transaction created successfully!');
    } catch (error: any) {
      console.error('Transaction test failed:', error);
      toast.error('Transaction test failed: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">API Test Component</h3>
      <div className="flex gap-2">
        <button
          onClick={testCategories}
          disabled={loading}
          className="btn-primary px-4 py-2 text-sm"
        >
          {loading ? 'Loading...' : 'Test Categories'}
        </button>
        <button
          onClick={testTransaction}
          disabled={loading}
          className="btn-success px-4 py-2 text-sm"
        >
          {loading ? 'Loading...' : 'Test Transaction'}
        </button>
      </div>
    </div>
  );
}