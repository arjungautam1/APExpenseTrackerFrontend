import React, { useState, useEffect } from 'react';
import { Plus, Home, Phone, Wifi, Dumbbell, CreditCard, ChevronDown, ChevronUp, Edit, Trash2, Calendar, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { monthlyExpenseService, MonthlyExpenseDto, CreateMonthlyExpenseDto, MonthlyExpensesSummary } from '../services/monthlyExpense';
import AddEditMonthlyExpenseModal from '../components/MonthlyExpenses/AddEditMonthlyExpenseModal';
import toast from 'react-hot-toast';

const MonthlyExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<MonthlyExpenseDto[]>([]);
  const [summary, setSummary] = useState<MonthlyExpensesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<MonthlyExpenseDto | null>(null);

  const categories = [
    { key: 'home', name: 'Home', icon: Home, color: 'bg-red-100 text-red-600' },
    { key: 'mobile', name: 'Mobile Bills', icon: Phone, color: 'bg-blue-100 text-blue-600' },
    { key: 'internet', name: 'Internet', icon: Wifi, color: 'bg-purple-100 text-purple-600' },
    { key: 'gym', name: 'Gym', icon: Dumbbell, color: 'bg-green-100 text-green-600' },
    { key: 'other', name: 'Other', icon: CreditCard, color: 'bg-orange-100 text-orange-600' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesData, summaryData] = await Promise.all([
        monthlyExpenseService.getMonthlyExpenses(),
        monthlyExpenseService.getMonthlyExpensesSummary()
      ]);
      setExpenses(expensesData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching monthly expenses:', error);
      toast.error('Failed to load monthly expenses');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryExpenses = (category: string) => {
    return expenses.filter(expense => expense.category === category);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isDueThisMonth = (expense: MonthlyExpenseDto) => {
    const today = new Date();
    const dueDate = new Date(expense.nextDueDate);
    return dueDate.getMonth() === today.getMonth() && dueDate.getFullYear() === today.getFullYear();
  };

  const isOverdue = (expense: MonthlyExpenseDto) => {
    const today = new Date();
    const dueDate = new Date(expense.nextDueDate);
    return dueDate < today;
  };

  const handleProcessPayment = async (expense: MonthlyExpenseDto) => {
    try {
      await monthlyExpenseService.processPayment(expense._id);
      toast.success(`Payment processed for ${expense.name}`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    }
  };

  const handleDeleteExpense = async (expense: MonthlyExpenseDto) => {
    if (!confirm(`Are you sure you want to delete "${expense.name}"?`)) {
      return;
    }

    try {
      await monthlyExpenseService.deleteMonthlyExpense(expense._id);
      toast.success('Expense deleted successfully');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Monthly Expenses</h1>
        <p className="text-gray-600">Manage your recurring monthly bills and subscriptions</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Monthly</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalMonthly)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Expenses</p>
                <p className="text-2xl font-bold text-gray-900">{summary.count}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Due This Month</p>
                <p className="text-2xl font-bold text-gray-900">{summary.dueThisMonth}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                <Plus className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  Add New Expense
                </button>
                <p className="text-2xl font-bold text-gray-900">+</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Sections */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryExpenses = getCategoryExpenses(category.key);
          const categoryTotal = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
          const isExpanded = expandedCategories.has(category.key);

          return (
            <div key={category.key} className="bg-white rounded-lg shadow">
              {/* Category Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleCategory(category.key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full ${category.color}`}>
                      <category.icon className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">
                        {categoryExpenses.length} expense{categoryExpenses.length !== 1 ? 's' : ''} • {formatCurrency(categoryTotal)}/month
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-semibold text-gray-900">{formatCurrency(categoryTotal)}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Category Content */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  {categoryExpenses.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <category.icon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No {category.name.toLowerCase()} expenses yet</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Add your first {category.name.toLowerCase()} expense
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 space-y-4">
                      {categoryExpenses.map((expense) => (
                        <div key={expense._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${category.color}`}>
                              <category.icon className="h-4 w-4" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{expense.name}</h4>
                              <p className="text-sm text-gray-600">
                                Due on {expense.dueDate}th • {formatCurrency(expense.amount)}/month
                              </p>
                              {expense.description && (
                                <p className="text-xs text-gray-500 mt-1">{expense.description}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {/* Status Indicators */}
                            {isOverdue(expense) && (
                              <div className="flex items-center text-red-600">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                <span className="text-xs">Overdue</span>
                              </div>
                            )}
                            {isDueThisMonth(expense) && !isOverdue(expense) && (
                              <div className="flex items-center text-orange-600">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span className="text-xs">Due Soon</span>
                              </div>
                            )}
                            
                            {/* Amount */}
                            <span className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</span>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleProcessPayment(expense)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                                title="Mark as paid"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setEditingExpense(expense)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                title="Edit expense"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(expense)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                title="Delete expense"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      <AddEditMonthlyExpenseModal
        isOpen={showAddModal || !!editingExpense}
        onClose={() => {
          setShowAddModal(false);
          setEditingExpense(null);
        }}
        expense={editingExpense}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default MonthlyExpensesPage;
