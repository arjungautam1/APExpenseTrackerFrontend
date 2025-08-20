import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

interface PaymentStatusBadgeProps {
  billId: string;
  isPaid: boolean;
  onMarkAsPaid: () => void;
  onMarkAsUnpaid: () => void;
}

export function PaymentStatusBadge({ billId, isPaid, onMarkAsPaid, onMarkAsUnpaid }: PaymentStatusBadgeProps) {
  if (isPaid) {
    return (
      <div className="inline-flex items-center gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">Paid</span>
        </div>
        <button
          onClick={onMarkAsUnpaid}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
        >
          Mark Unpaid
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
        <Clock className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-700">Unpaid</span>
      </div>
      
      <button
        onClick={onMarkAsPaid}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
      >
        <CheckCircle className="h-3 w-3" />
        Mark Paid
      </button>
    </div>
  );
}
