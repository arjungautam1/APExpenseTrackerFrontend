import { apiService } from './api';

export interface MonthlyExpenseDto {
  _id: string;
  name: string;
  category: 'home' | 'mobile' | 'internet' | 'gym' | 'other';
  amount: number;
  dueDate: number;
  description: string;
  isActive: boolean;
  lastPaidDate?: string;
  nextDueDate: string;
  autoDeduct: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMonthlyExpenseDto {
  name: string;
  category: 'home' | 'mobile' | 'internet' | 'gym' | 'other';
  amount: number;
  dueDate: number;
  description?: string;
  autoDeduct?: boolean;
  tags?: string[];
}

export interface UpdateMonthlyExpenseDto extends Partial<CreateMonthlyExpenseDto> {}

export interface MonthlyExpensesSummary {
  totalMonthly: number;
  byCategory: {
    home: number;
    mobile: number;
    internet: number;
    gym: number;
    other: number;
  };
  count: number;
  dueThisMonth: number;
}

class MonthlyExpenseService {
  private baseUrl = '/monthly-expenses';

  async getMonthlyExpenses(): Promise<MonthlyExpenseDto[]> {
    const response = await apiService.get<{ data: MonthlyExpenseDto[] }>(this.baseUrl);
    return (response.data as any).data;
  }

  async getMonthlyExpensesByCategory(category: string): Promise<MonthlyExpenseDto[]> {
    const response = await apiService.get<{ data: MonthlyExpenseDto[] }>(`${this.baseUrl}/category/${category}`);
    return (response.data as any).data;
  }

  async getMonthlyExpensesSummary(): Promise<MonthlyExpensesSummary> {
    const response = await apiService.get<{ data: MonthlyExpensesSummary }>(`${this.baseUrl}/summary`);
    return (response.data as any).data;
  }

  async createMonthlyExpense(data: CreateMonthlyExpenseDto): Promise<MonthlyExpenseDto> {
    const response = await apiService.post<{ data: MonthlyExpenseDto }>(this.baseUrl, data);
    return (response.data as any).data;
  }

  async updateMonthlyExpense(id: string, data: UpdateMonthlyExpenseDto): Promise<MonthlyExpenseDto> {
    const response = await apiService.put<{ data: MonthlyExpenseDto }>(`${this.baseUrl}/${id}`, data);
    return (response.data as any).data;
  }

  async deleteMonthlyExpense(id: string): Promise<{ message: string }> {
    const response = await apiService.delete<{ data: { message: string } }>(`${this.baseUrl}/${id}`);
    return (response.data as any).data;
  }

  async processPayment(id: string): Promise<{
    message: string;
    transaction: any;
    nextDueDate: string;
  }> {
    const response = await apiService.post<{ data: { message: string; transaction: any; nextDueDate: string } }>(`${this.baseUrl}/${id}/pay`);
    return (response.data as any).data;
  }
}

export const monthlyExpenseService = new MonthlyExpenseService();
