import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign, Calendar, BarChart3, CheckCircle } from 'lucide-react';
import { MonthlyBill, monthlyBillsService } from '../services/monthlyBills';
import AddBillModal from '../components/MonthlyBills/AddBillModal';
import DeleteConfirmModal from '../components/UI/DeleteConfirmModal';
import { PaymentStatusBadge } from '../components/MonthlyBills/PaymentStatusBadge';
import { useCurrencyFormatter } from '../utils/currency';
import toast from 'react-hot-toast';

const categories = [
  { value: 'housing', label: 'Housing', color: 'bg-blue-100 text-blue-800', icon: '🏠' },
  { value: 'utilities', label: 'Utilities', color: 'bg-green-100 text-green-800', icon: '⚡' },
  { value: 'transport', label: 'Transport', color: 'bg-yellow-100 text-yellow-800', icon: '🚗' },
  { value: 'food', label: 'Food & Dining', color: 'bg-red-100 text-red-800', icon: '🍕' },
  { value: 'entertainment', label: 'Entertainment', color: 'bg-purple-100 text-purple-800', icon: '🎬' },
  { value: 'health', label: 'Health & Fitness', color: 'bg-pink-100 text-pink-800', icon: '💪' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800', icon: '📋' }
];

export default function MonthlyExpensesPage() {
  const [bills, setBills] = useState<MonthlyBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBill, setEditingBill] = useState<MonthlyBill | null>(null);
  const [deletingBill, setDeletingBill] = useState<MonthlyBill | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { formatCurrency } = useCurrencyFormatter();

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      const billsData = await monthlyBillsService.getAllBills();
      setBills(billsData);
    } catch (error) {
      console.error('Error loading bills:', error);
      toast.error('Failed to load monthly bills');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBill = (bill: MonthlyBill) => {
    setDeletingBill(bill);
  };

  const confirmDeleteBill = async () => {
    if (!deletingBill) return;

    setDeleteLoading(true);
    try {
      await monthlyBillsService.deleteBill(deletingBill._id);
      toast.success('Bill deleted successfully');
      setDeletingBill(null);
      loadBills();
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast.error('Failed to delete bill');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getCategoryInfo = (categoryValue: string) => {
    return categories.find(cat => cat.value === categoryValue) || categories[categories.length - 1];
  };

  const summary = monthlyBillsService.getSummary();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Monthly Bills</h1>
          <p className="text-gray-600">Track and manage your recurring monthly expenses</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Bill
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Monthly</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalMonthly)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Bills</p>
              <p className="text-2xl font-bold text-gray-900">{summary.activeCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(summary.categories).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-emerald-100">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {bills.filter(bill => monthlyBillsService.isBillPaidForMonth(bill._id)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Monthly Bills</h2>
        </div>

        {bills.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No monthly bills yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first recurring bill or subscription</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Bill
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {bills.map((bill) => {
              const categoryInfo = getCategoryInfo(bill.category);
              return (
                <div key={bill._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{categoryInfo.icon}</div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{bill.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                            {categoryInfo.label}
                          </span>
                          <span>Due on {bill.dueDate}{bill.dueDate === 1 ? 'st' : bill.dueDate === 2 ? 'nd' : bill.dueDate === 3 ? 'rd' : 'th'}</span>
                        </div>
                        <PaymentStatusBadge 
                          billId={bill._id} 
                          onStatusChange={loadBills}
                        />
                        {bill.description && (
                          <p className="text-sm text-gray-500 mt-2">{bill.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(bill.amount)}</p>
                        <p className="text-sm text-gray-500">per month</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingBill(bill)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit bill"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBill(bill)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete bill"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Add/Edit Modal */}
      <AddBillModal
        isOpen={showAddModal || !!editingBill}
        onClose={() => {
          setShowAddModal(false);
          setEditingBill(null);
        }}
        onSuccess={loadBills}
        editingBill={editingBill}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingBill}
        onClose={() => setDeletingBill(null)}
        onConfirm={confirmDeleteBill}
        title="Delete Monthly Bill"
        itemName={deletingBill?.name || ''}
        description={`This will permanently remove "${deletingBill?.name}" (${deletingBill ? formatCurrency(deletingBill.amount) : ''}/month) from your monthly bills. You won't receive any reminders for this bill anymore.`}
        isLoading={deleteLoading}
      />
    </div>
  );
}