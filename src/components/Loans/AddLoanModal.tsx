import React, { useState } from 'react';
import { X, DollarSign, Calendar } from 'lucide-react';
import { loanService } from '../../services/loan';
import toast from 'react-hot-toast';

interface AddLoanModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddLoanModal({ onClose, onSuccess }: AddLoanModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    principalAmount: '',
    interestRate: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await loanService.createLoan({
        name: form.name.trim(),
        principalAmount: parseFloat(form.principalAmount),
        interestRate: parseFloat(form.interestRate),
        startDate: form.startDate,
        endDate: form.endDate,
      });
      toast.success('Loan added');
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to add loan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Add Loan</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input name="name" value={form.name} onChange={handleChange} required className="input" placeholder="Home Loan" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Principal Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="number" name="principalAmount" value={form.principalAmount} onChange={handleChange} required className="input pl-10" min="0" step="0.01" placeholder="10000" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (Annual %)</label>
              <input type="number" name="interestRate" value={form.interestRate} onChange={handleChange} required className="input" min="0" step="0.01" placeholder="12" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required className="input pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required className="input pl-10" />
                </div>
              </div>
            </div>
            <div className="flex space-x-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={isSaving} className="btn flex-1 bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500">
                {isSaving ? 'Saving...' : 'Add Loan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


