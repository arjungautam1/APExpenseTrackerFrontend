import React, { useEffect, useState } from 'react';
import { Calendar, Tag, X } from 'lucide-react';
import { categoryService } from '../../services/category';
import { Category } from '../../types';

export interface TransactionFilterState {
  type?: 'income' | 'expense' | 'transfer';
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

interface TransactionFiltersProps {
  value: TransactionFilterState;
  onChange: (next: TransactionFilterState) => void;
  onClear?: () => void;
}

export function TransactionFilters({ value, onChange, onClear }: TransactionFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [income, expense] = await Promise.all([
          categoryService.getCategories('income'),
          categoryService.getCategories('expense')
        ]);
        setCategories([
          ...income.map(c => ({ ...c, name: `${c.name} (Income)` })),
          ...expense.map(c => ({ ...c, name: `${c.name} (Expense)` }))
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const next: TransactionFilterState = { ...valueStateRef(), [name]: value || undefined };
    if (name === 'type') {
      next.categoryId = undefined;
    }
    onChange(next);
  };

  const valueStateRef = () => value;

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h3 className="text-lg font-medium">Filters</h3>
        {onClear && (
          <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center" onClick={onClear}>
            <X className="h-4 w-4 mr-1" /> Clear
          </button>
        )}
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              name="type"
              value={value.type || ''}
              onChange={handleInput}
              className="input"
            >
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                name="categoryId"
                value={value.categoryId || ''}
                onChange={handleInput}
                className="input pl-10"
                disabled={loading}
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                name="startDate"
                value={value.startDate || ''}
                onChange={handleInput}
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                name="endDate"
                value={value.endDate || ''}
                onChange={handleInput}
                className="input pl-10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

