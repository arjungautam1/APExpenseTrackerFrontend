import React, { useState } from 'react';
import { Calendar, DollarSign, MoreHorizontal, Trash2, Clock } from 'lucide-react';
import { LoanDto, loanService } from '../../services/loan';
import { ConfirmDialog } from '../Common/ConfirmDialog';
import toast from 'react-hot-toast';

interface LoanCardProps {
  loan: LoanDto;
  onChange: () => void;
  onViewSchedule: (loan: LoanDto) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export function LoanCard({ loan, onChange, onViewSchedule }: LoanCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDelete = () => { setMenuOpen(false); setConfirmOpen(true); };

  const doDelete = async () => {
    setIsDeleting(true);
    try {
      await loanService.deleteLoan(loan.id);
      toast.success('Loan deleted');
      setConfirmOpen(false);
      onChange();
    } catch (e) {
      toast.error('Failed to delete loan');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="card relative transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{loan.name}</h3>
            <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                {formatCurrency(loan.currentBalance)} remaining
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                {formatDate(loan.startDate)} - {formatDate(loan.endDate)}
              </span>
            </div>
          </div>
          <div className="relative">
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded-lg" onClick={() => setMenuOpen(!menuOpen)}>
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-20 min-w-[140px] rounded-lg border border-gray-200 bg-white shadow-lg py-1">
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => { setMenuOpen(false); onViewSchedule(loan); }}>View EMI Schedule</button>
                  <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50" onClick={openDelete}>Delete</button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Principal</div>
            <div className="font-medium">{formatCurrency(loan.principalAmount)}</div>
          </div>
          <div>
            <div className="text-gray-600">Interest Rate</div>
            <div className="font-medium">{loan.interestRate}% p.a.</div>
          </div>
        </div>

        <div className="mt-4">
          <button className="btn-secondary" onClick={() => onViewSchedule(loan)}>View EMI Schedule</button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete loan?"
        description={`This will permanently delete "${loan.name}".`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
        onConfirm={doDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}


