import { apiService } from './api';
import { ApiResponse, PaginatedResponse, Transfer } from '../types';

export interface TransferFilters {
  page?: number;
  limit?: number;
  status?: 'pending' | 'completed' | 'failed';
}

export interface CreateTransferData {
  recipientName: string;
  amount: number;
  purpose: string;
  destinationCountry: string; // ISO 3166-1 alpha-2
  transferMethod: string;
  fees: number;
  exchangeRate?: number;
  status?: 'pending' | 'completed' | 'failed';
  transactionId?: string;
}

export class TransferService {
  async getTransfers(filters?: TransferFilters): Promise<PaginatedResponse<Transfer>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) params.append(key, String(value));
      });
    }
    const url = params.toString() ? `/transfers?${params.toString()}` : '/transfers';
    const response = await apiService.get<any>(url);
    const mappedData = response.data.data.map((t: any) => ({
      id: t._id,
      userId: t.userId,
      recipientName: t.recipientName,
      amount: t.amount,
      purpose: t.purpose,
      destinationCountry: t.destinationCountry,
      transferMethod: t.transferMethod,
      fees: t.fees,
      exchangeRate: t.exchangeRate,
      status: t.status,
      transactionId: t.transactionId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
    return {
      success: response.data.success,
      message: response.data.message,
      data: mappedData,
      pagination: response.data.pagination,
    };
  }

  async getTransfer(id: string): Promise<Transfer> {
    const response = await apiService.get<ApiResponse<any>>(`/transfers/${id}`);
    const t = response.data.data as any;
    return {
      id: t._id,
      userId: t.userId,
      recipientName: t.recipientName,
      amount: t.amount,
      purpose: t.purpose,
      destinationCountry: t.destinationCountry,
      transferMethod: t.transferMethod,
      fees: t.fees,
      exchangeRate: t.exchangeRate,
      status: t.status,
      transactionId: t.transactionId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  }

  async createTransfer(data: CreateTransferData): Promise<Transfer> {
    const response = await apiService.post<ApiResponse<any>>('/transfers', data);
    const t = response.data.data as any;
    return {
      id: t._id,
      userId: t.userId,
      recipientName: t.recipientName,
      amount: t.amount,
      purpose: t.purpose,
      destinationCountry: t.destinationCountry,
      transferMethod: t.transferMethod,
      fees: t.fees,
      exchangeRate: t.exchangeRate,
      status: t.status,
      transactionId: t.transactionId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  }

  async updateTransfer(id: string, data: Partial<CreateTransferData>): Promise<Transfer> {
    const response = await apiService.put<ApiResponse<any>>(`/transfers/${id}`, data);
    const t = response.data.data as any;
    return {
      id: t._id,
      userId: t.userId,
      recipientName: t.recipientName,
      amount: t.amount,
      purpose: t.purpose,
      destinationCountry: t.destinationCountry,
      transferMethod: t.transferMethod,
      fees: t.fees,
      exchangeRate: t.exchangeRate,
      status: t.status,
      transactionId: t.transactionId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  }

  async deleteTransfer(id: string): Promise<void> {
    await apiService.delete(`/transfers/${id}`);
  }
}

export const transferService = new TransferService();












