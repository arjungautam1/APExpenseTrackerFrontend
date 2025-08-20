import React, { useEffect, useState } from 'react';
import { monthlyBillsService } from '../services/monthlyBills';
import { MonthlyBill } from '../types';
import { Plus, Calendar, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { AddBillModal } from '../components/MonthlyBills/AddBillModal';
import { PaymentStatusBadge } from '../components/MonthlyBills/PaymentStatusBadge';
import { useCurrencyFormatter } from '../utils/currency';
import toast from 'react-hot-toast';

export default function MonthlyExpensesPage() {
  const [bills, setBills] = useState<MonthlyBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { formatCurrency } = useCurrencyFormatter();

  const fetchBills = async () => {
    try {
      setLoading(true);
      const billsData = await monthlyBillsService.getAllBills();
      setBills(billsData);
    } catch (error: any) {
      console.error('Failed to fetch bills:', error);
      toast.error('Failed to load monthly bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleAddBill = () => {
    setShowAddModal(true);
  };

  const handleBillAdded = () => {
    fetchBills();
  };

  const handleMarkAsPaid = async (billId: string) => {
    try {
      await monthlyBillsService.markAsPaid(billId);
      toast.success('Bill marked as paid');
      fetchBills();
    } catch (error: any) {
      console.error('Failed to mark bill as paid:', error);
      toast.error('Failed to update bill status');
    }
  };

  const handleMarkAsUnpaid = async (billId: string) => {
    try {
      await monthlyBillsService.markAsUnpaid(billId);
      toast.success('Bill marked as unpaid');
      fetchBills();
    } catch (error: any) {
      console.error('Failed to mark bill as unpaid:', error);
      toast.error('Failed to update bill status');
    }
  };

  const handleDeleteBill = async (billId: string) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await monthlyBillsService.deleteBill(billId);
        toast.success('Bill deleted successfully');
        fetchBills();
      } catch (error: any) {
        console.error('Failed to delete bill:', error);
        toast.error('Failed to delete bill');
      }
    }
  };

  const summary = monthlyBillsService.getSummary();

  const getUpcomingBills = () => {
    const today = new Date();
    return bills.filter(bill => {
      const dueDate = new Date(bill.dueDate);
      return dueDate >= today && !bill.isPaid;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const getOverdueBills = () => {
    const today = new Date();
    return bills.filter(bill => {
      const dueDate = new Date(bill.dueDate);
      return dueDate < today && !bill.isPaid;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const upcomingBills = getUpcomingBills();
  const overdueBills = getOverdueBills();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Monthly Bills</h1>
            <p className="text-gray-600">Manage your recurring monthly expenses</p>
          </div>
          <button
            onClick={handleAddBill}
            className="btn btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Bill
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Monthly</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalMonthly)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Bills</p>
              <p className="text-2xl font-bold text-gray-900">{summary.activeCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingBills.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{overdueBills.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Bills</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {bills.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bills yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first monthly bill.</p>
              <div className="mt-6">
                <button
                  onClick={handleAddBill}
                  className="btn btn-primary inline-flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bill
                </button>
              </div>
            </div>
          ) : (
            bills.map((bill) => (
              <div key={bill.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {bill.name}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">
                          Due: {new Date(bill.dueDate).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {bill.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(bill.amount)}
                    </span>
                    <PaymentStatusBadge
                      billId={bill.id}
                      isPaid={bill.isPaid}
                      onMarkAsPaid={() => handleMarkAsPaid(bill.id)}
                      onMarkAsUnpaid={() => handleMarkAsUnpaid(bill.id)}
                    />
                    <button
                      onClick={() => handleDeleteBill(bill.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Bill Modal */}
      <AddBillModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleBillAdded}
      />
    </div>
  );
}