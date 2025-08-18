import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import { monthlyBillsService } from '../../services/monthlyBills';

interface PaymentStatusBadgeProps {
  billId: string;
  dueDay: number;
  onStatusChange?: () => void;
}

export function PaymentStatusBadge({ billId, dueDay, onStatusChange }: PaymentStatusBadgeProps) {
  const paymentStatus = monthlyBillsService.getPaymentStatus(billId);
  
  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatExactDueDate = (monthString: string, dueDay: number) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, dueDay);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleMarkAsPaid = () => {
    monthlyBillsService.markBillAsPaid(billId);
    onStatusChange?.();
  };

  if (paymentStatus.isPaid) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full"
      >
        <CheckCircle className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-medium text-emerald-700">
          Paid for {formatExactDueDate(paymentStatus.currentMonth, dueDay)}
        </span>
        <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-2"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
        <Clock className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-700">
          Due on {formatExactDueDate(paymentStatus.nextDueMonth, dueDay)}
        </span>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleMarkAsPaid}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
      >
        <CheckCircle className="h-3 w-3" />
        Mark Paid
      </motion.button>
    </motion.div>
  );
}
