import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { loanService, LoanDto } from '../../services/loan';

interface EmiScheduleModalProps {
  loan: LoanDto | null;
  onClose: () => void;
}

export function EmiScheduleModal({ loan, onClose }: EmiScheduleModalProps) {
  const [loading, setLoading] = useState(true);
  const [emi, setEmi] = useState(0);
  const [rows, setRows] = useState<Array<{ installment: number; date: string; principal: number; interest: number; balance: number }>>([]);

  useEffect(() => {
    const load = async () => {
      if (!loan) return;
      setLoading(true);
      try {
        const res = await loanService.getSchedule(loan.id);
        setEmi(res.emi);
        setRows(res.schedule.map((r) => ({ ...r, date: new Date(r.date).toISOString().substring(0, 10) })));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loan]);

  if (!loan) return null;

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">EMI Schedule — {loan.name}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-gray-500">Loading schedule…</div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-700">Monthly EMI: <span className="font-semibold">{fmt(emi)}</span></div>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-fixed border-separate border-spacing-0 text-sm">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border-b border-gray-200">#</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border-b border-gray-200">Date</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 border-b border-gray-200">Principal</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 border-b border-gray-200">Interest</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 border-b border-gray-200">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rows.map((r) => (
                        <tr key={r.installment}>
                          <td className="px-3 py-2">{r.installment}</td>
                          <td className="px-3 py-2">{r.date}</td>
                          <td className="px-3 py-2 text-right">{fmt(r.principal)}</td>
                          <td className="px-3 py-2 text-right">{fmt(r.interest)}</td>
                          <td className="px-3 py-2 text-right">{fmt(r.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


