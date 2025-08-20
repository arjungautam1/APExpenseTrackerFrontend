import { apiService } from './api';
import { Transaction, ApiResponse, PaginatedResponse } from '../types';

export interface CreateTransactionData {
  amount: number;
  type: 'income' | 'expense' | 'transfer' | 'investment';
  categoryId: string;
  description?: string;
  date?: string;
  location?: string;
  tags?: string[];
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: 'income' | 'expense' | 'transfer' | 'investment';
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  month?: string; // YYYY-MM format
  year?: string; // YYYY format
}

export interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
}

export interface ExpenseBreakdownItem {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  totalAmount: number;
  transactionCount: number;
  avgAmount: number;
  lastTransaction: string;
  percentage: number;
}

export interface MonthlyTrendItem {
  categoryId: string;
  categoryName: string;
  monthlyData: Array<{
    _id: { year: number; month: number };
    amount: number;
    count: number;
  }>;
}

export interface ExpenseBreakdownData {
  breakdown: ExpenseBreakdownItem[];
  totalExpenses: number;
  monthlyTrends: MonthlyTrendItem[];
  summary: {
    totalCategories: number;
    avgExpensePerCategory: number;
    topCategory: ExpenseBreakdownItem | null;
  };
}

export class TransactionService {
  async getTransactions(filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const queryString = params.toString();
    const url = queryString ? `/transactions?${queryString}` : '/transactions';
    
    const response = await apiService.get<any>(url);
    
    // Map MongoDB _id to id for frontend consistency
    const mappedData = response.data.data.map((transaction: any) => ({
      id: transaction._id,
      userId: transaction.userId,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.categoryId?._id || transaction.categoryId,
      category: transaction.categoryId && transaction.categoryId._id ? {
        id: transaction.categoryId._id,
        name: transaction.categoryId.name,
        type: transaction.categoryId.type,
        icon: transaction.categoryId.icon,
        color: transaction.categoryId.color,
        userId: transaction.categoryId.userId,
        parentCategoryId: transaction.categoryId.parentCategoryId,
        isDefault: transaction.categoryId.isDefault
      } : undefined,
      description: transaction.description,
      date: transaction.date,
      location: transaction.location,
      tags: transaction.tags || [],
      receipt: transaction.receipt,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    }));
    
    return {
      success: response.data.success,
      message: response.data.message,
      data: mappedData,
      pagination: response.data.pagination
    };
  }

  async getTransaction(id: string): Promise<Transaction> {
    const response = await apiService.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    return response.data.data;
  }

  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    const response = await apiService.post<ApiResponse<any>>('/transactions', data);
    
    // Map MongoDB _id to id for frontend consistency
    const transaction = response.data.data;
    return {
      id: transaction._id,
      userId: transaction.userId,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.categoryId,
      category: transaction.categoryId, // This might be populated
      description: transaction.description,
      date: transaction.date,
      location: transaction.location,
      tags: transaction.tags || [],
      receipt: transaction.receipt,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    };
  }

  async updateTransaction(id: string, data: UpdateTransactionData): Promise<Transaction> {
    const response = await apiService.put<ApiResponse<Transaction>>(`/transactions/${id}`, data);
    return response.data.data;
  }

  async deleteTransaction(id: string): Promise<void> {
    await apiService.delete(`/transactions/${id}`);
  }

  async deleteAllTransactions(): Promise<{ deletedCount: number }> {
    const response = await apiService.delete<ApiResponse<{ deletedCount: number }>>('/transactions');
    return response.data.data;
  }

  async getTransactionStats(startDate?: string, endDate?: string): Promise<TransactionStats> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const url = queryString ? `/transactions/stats?${queryString}` : '/transactions/stats';
    
    const response = await apiService.get<ApiResponse<TransactionStats>>(url);
    return response.data.data;
  }

  async getExpenseBreakdown(startDate?: string, endDate?: string, limit?: number): Promise<ExpenseBreakdownData> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/transactions/expense-breakdown?${queryString}` : '/transactions/expense-breakdown';
    
    const response = await apiService.get<ApiResponse<ExpenseBreakdownData>>(url);
    return response.data.data;
  }

  async getMonthlyTrends(startDate?: string, endDate?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const url = queryString ? `/transactions/monthly-trends?${queryString}` : '/transactions/monthly-trends';
    
    const response = await apiService.get<ApiResponse<any[]>>(url);
    return response.data.data;
  }
}

export const transactionService = new TransactionService();