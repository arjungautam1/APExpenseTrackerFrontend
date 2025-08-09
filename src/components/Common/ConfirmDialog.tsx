import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!open) return null;

  const confirmBtnClasses =
    variant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
      : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        <div className="relative w-full max-w-md transform rounded-xl bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${variant === 'danger' ? 'text-red-600' : 'text-yellow-600'}`} />
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button onClick={onClose} className="btn-secondary">{cancelText}</button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`btn ${confirmBtnClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Please wait…' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


