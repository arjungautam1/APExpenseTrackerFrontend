import { apiService } from './api';
import { ApiResponse } from '../types';

export interface LoanDto {
  id: string;
  userId: string;
  name: string;
  principalAmount: number;
  currentBalance: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'defaulted';
  nextEmiDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanData {
  name: string;
  principalAmount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
}

export class LoanService {
  async getLoans(): Promise<LoanDto[]> {
    const res = await apiService.get<ApiResponse<any[]>>('/loans');
    return res.data.data.map((l: any) => ({
      id: l._id,
      userId: l.userId,
      name: l.name,
      principalAmount: l.principalAmount,
      currentBalance: l.currentBalance,
      interestRate: l.interestRate,
      startDate: l.startDate,
      endDate: l.endDate,
      status: l.status,
      nextEmiDate: l.nextEmiDate,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
    }));
  }

  async createLoan(data: CreateLoanData): Promise<LoanDto> {
    const res = await apiService.post<ApiResponse<any>>('/loans', data);
    const l = res.data.data;
    return {
      id: l._id,
      userId: l.userId,
      name: l.name,
      principalAmount: l.principalAmount,
      currentBalance: l.currentBalance,
      interestRate: l.interestRate,
      startDate: l.startDate,
      endDate: l.endDate,
      status: l.status,
      nextEmiDate: l.nextEmiDate,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
    };
  }

  async deleteLoan(id: string): Promise<void> {
    await apiService.delete(`/loans/${id}`);
  }

  async updateLoan(id: string, data: Partial<CreateLoanData & { currentBalance: number; status: LoanDto['status'] }>): Promise<LoanDto> {
    const res = await apiService.put<ApiResponse<any>>(`/loans/${id}`, data);
    const l = res.data.data;
    return {
      id: l._id,
      userId: l.userId,
      name: l.name,
      principalAmount: l.principalAmount,
      currentBalance: l.currentBalance,
      interestRate: l.interestRate,
      startDate: l.startDate,
      endDate: l.endDate,
      status: l.status,
      nextEmiDate: l.nextEmiDate,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
    };
  }

  async getSchedule(id: string): Promise<{ emi: number; months: number; schedule: Array<{ installment: number; date: string; principal: number; interest: number; balance: number }>; }> {
    const res = await apiService.get<ApiResponse<any>>(`/loans/${id}/schedule`);
    return res.data.data;
  }
}

export const loanService = new LoanService();


