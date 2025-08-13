import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { loanService, LoanDto } from '../services/loan';
import { AddLoanModal } from '../components/Loans/AddLoanModal';
import { LoanCard } from '../components/Loans/LoanCard';
import { EmiScheduleModal } from '../components/Loans/EmiScheduleModal';
import { useCurrencyFormatter } from '../utils/currency';
import toast from 'react-hot-toast';

export function LoansPage() {
  const [loans, setLoans] = useState<LoanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [scheduleLoan, setScheduleLoan] = useState<LoanDto | null>(null);
  const { formatCurrency } = useCurrencyFormatter();

  const loadLoans = async () => {
    try {
      setLoading(true);
      const data = await loanService.getLoans();
      setLoans(data);
    } catch (e) {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLoans(); }, []);


  // Aggregate stats
  const totalPrincipal = loans.reduce((sum, l) => sum + (l.principalAmount || 0), 0);
  const totalOutstanding = loans.reduce((sum, l) => sum + (l.currentBalance || 0), 0);
  const activeCount = loans.filter(l => l.status === 'active').length;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loans & EMI</h1>
          <p className="text-gray-600">Track your loans, balances, and payment schedule</p>
        </div>
        <button className="btn-primary flex items-center space-x-2" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4" />
          <span>Add Loan</span>
        </button>
      </div>

      {/* Summary cards */}
      {!loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8 animate-fade-in-up">
          <div className="card transition hover:shadow-md">
            <div className="card-body">
              <div className="text-sm text-gray-500">Total Principal</div>
              <div className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(totalPrincipal)}</div>
            </div>
          </div>
          <div className="card transition hover:shadow-md">
            <div className="card-body">
              <div className="text-sm text-gray-500">Total Outstanding</div>
              <div className="mt-1 text-2xl font-bold text-indigo-600">{formatCurrency(totalOutstanding)}</div>
            </div>
          </div>
          <div className="card transition hover:shadow-md">
            <div className="card-body">
              <div className="text-sm text-gray-500">Active Loans</div>
              <div className="mt-1 text-2xl font-bold text-gray-900">{activeCount}</div>
            </div>
          </div>
          <div className="card transition hover:shadow-md">
            <div className="card-body">
              <div className="text-sm text-gray-500">Total Loans</div>
              <div className="mt-1 text-2xl font-bold text-gray-900">{loans.length}</div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse">
          <div className="mb-8">
            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => (
              <div key={i} className="card">
                <div className="card-body">
                  <div className="h-28 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : loans.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No loans yet</h3>
          <p className="mt-1 text-sm text-gray-500">Add your first loan to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loans.map((loan, idx) => (
            <div key={loan.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 60}ms` }}>
              <LoanCard loan={loan} onChange={loadLoans} onViewSchedule={setScheduleLoan} />
            </div>
          ))}
        </div>
      )}

      {isAddOpen && (
        <AddLoanModal onClose={() => setIsAddOpen(false)} onSuccess={loadLoans} />
      )}

      {scheduleLoan && (
        <EmiScheduleModal loan={scheduleLoan} onClose={() => setScheduleLoan(null)} />
      )}
    </div>
  );
}