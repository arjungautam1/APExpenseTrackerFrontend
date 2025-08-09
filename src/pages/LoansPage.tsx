import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { loanService, LoanDto } from '../services/loan';
import { AddLoanModal } from '../components/Loans/AddLoanModal';
import { LoanCard } from '../components/Loans/LoanCard';
import { EmiScheduleModal } from '../components/Loans/EmiScheduleModal';
import toast from 'react-hot-toast';

export function LoansPage() {
  const [loans, setLoans] = useState<LoanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [scheduleLoan, setScheduleLoan] = useState<LoanDto | null>(null);

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

      {loading ? (
        <div className="text-gray-500">Loading…</div>
      ) : loans.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No loans yet</h3>
          <p className="mt-1 text-sm text-gray-500">Add your first loan to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} onChange={loadLoans} onViewSchedule={setScheduleLoan} />
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