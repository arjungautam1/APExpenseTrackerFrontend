export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  timezone: string;
  language?: string;
  isVerified: boolean;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer' | 'investment';
  categoryId: string;
  category?: Category;
  description?: string;
  date: string;
  location?: string;
  tags?: string[];
  receipt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'investment';
  icon: string;
  color: string;
  userId: string;
  parentCategoryId?: string;
  isDefault: boolean;
}

export interface Investment {
  id: string;
  userId: string;
  name: string;
  type: 'stocks' | 'mutual_funds' | 'crypto' | 'real_estate' | 'other';
  amountInvested: number;
  currentValue?: number;
  purchaseDate: string;
  quantity?: number;
  symbol?: string;
  platform?: string;
  gainLoss?: number;
  gainLossPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: string;
  userId: string;
  name: string;
  principalAmount: number;
  currentBalance: number;
  interestRate: number;
  emiAmount: number;
  startDate: string;
  endDate: string;
  nextEmiDate: string;
  status: 'active' | 'completed' | 'defaulted';
  createdAt: string;
  updatedAt: string;
}

export interface Transfer {
  id: string;
  userId: string;
  recipientName: string;
  amount: number;
  purpose: string;
  destinationCountry: string;
  transferMethod: string;
  fees: number;
  exchangeRate?: number;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyBill {
  id: string;
  userId: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  spentAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  totalInvestments: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  expensesByCategory: Array<{
    categoryName: string;
    amount: number;
    percentage: number;
  }>;
  recentTransactions: Transaction[];
}