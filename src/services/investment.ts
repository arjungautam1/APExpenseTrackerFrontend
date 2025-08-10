import { apiService } from './api';
import { Investment, ApiResponse, PaginatedResponse } from '../types';

export interface CreateInvestmentData {
  name: string;
  type: 'stocks' | 'mutual_funds' | 'crypto' | 'real_estate' | 'other';
  amountInvested: number;
  currentValue?: number;
  purchaseDate: string;
  quantity?: number;
  symbol?: string;
  platform?: string;
}

export interface UpdateInvestmentData extends Partial<CreateInvestmentData> {}

export interface InvestmentFilters {
  page?: number;
  limit?: number;
  type?: 'stocks' | 'mutual_funds' | 'crypto' | 'real_estate' | 'other';
  sortBy?: 'name' | 'type' | 'amountInvested' | 'currentValue' | 'purchaseDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface InvestmentStats {
  totalInvestments: number;
  totalInvested: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  investmentsByType: {
    [key: string]: {
      count: number;
      totalInvested: number;
      totalCurrentValue: number;
      gainLoss: number;
      gainLossPercentage: number;
    };
  };
  topPerforming: Investment[];
  worstPerforming: Investment[];
}

export class InvestmentService {
  async getInvestments(filters?: InvestmentFilters): Promise<PaginatedResponse<Investment>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const queryString = params.toString();
    const url = queryString ? `/investments?${queryString}` : '/investments';
    
    const response = await apiService.get<any>(url);
    
    // Map MongoDB _id to id for frontend consistency
    const mappedData = response.data.data.map((investment: any) => ({
      id: investment._id,
      userId: investment.userId,
      name: investment.name,
      type: investment.type,
      amountInvested: investment.amountInvested,
      currentValue: investment.currentValue,
      purchaseDate: investment.purchaseDate,
      quantity: investment.quantity,
      symbol: investment.symbol,
      platform: investment.platform,
      gainLoss: investment.gainLoss,
      gainLossPercentage: investment.gainLossPercentage,
      createdAt: investment.createdAt,
      updatedAt: investment.updatedAt
    }));
    
    return {
      success: response.data.success,
      message: response.data.message,
      data: mappedData,
      pagination: response.data.pagination
    };
  }

  async getInvestment(id: string): Promise<Investment> {
    const response = await apiService.get<ApiResponse<any>>(`/investments/${id}`);
    const investment = response.data.data;
    
    // Map MongoDB _id to id for frontend consistency
    return {
      id: investment._id,
      userId: investment.userId,
      name: investment.name,
      type: investment.type,
      amountInvested: investment.amountInvested,
      currentValue: investment.currentValue,
      purchaseDate: investment.purchaseDate,
      quantity: investment.quantity,
      symbol: investment.symbol,
      platform: investment.platform,
      gainLoss: investment.gainLoss,
      gainLossPercentage: investment.gainLossPercentage,
      createdAt: investment.createdAt,
      updatedAt: investment.updatedAt
    };
  }

  async createInvestment(data: CreateInvestmentData): Promise<Investment> {
    const response = await apiService.post<ApiResponse<any>>('/investments', data);
    const investment = response.data.data;
    
    // Map MongoDB _id to id for frontend consistency
    return {
      id: investment._id,
      userId: investment.userId,
      name: investment.name,
      type: investment.type,
      amountInvested: investment.amountInvested,
      currentValue: investment.currentValue,
      purchaseDate: investment.purchaseDate,
      quantity: investment.quantity,
      symbol: investment.symbol,
      platform: investment.platform,
      gainLoss: investment.gainLoss || (investment.currentValue ? investment.currentValue - investment.amountInvested : 0),
      gainLossPercentage: investment.gainLossPercentage || 
        (investment.currentValue && investment.amountInvested > 0 ? ((investment.currentValue - investment.amountInvested) / investment.amountInvested) * 100 : 0),
      createdAt: investment.createdAt,
      updatedAt: investment.updatedAt
    };
  }

  async updateInvestment(id: string, data: UpdateInvestmentData): Promise<Investment> {
    const response = await apiService.put<ApiResponse<any>>(`/investments/${id}`, data);
    const investment = response.data.data;
    
    return {
      id: investment._id,
      userId: investment.userId,
      name: investment.name,
      type: investment.type,
      amountInvested: investment.amountInvested,
      currentValue: investment.currentValue,
      purchaseDate: investment.purchaseDate,
      quantity: investment.quantity,
      symbol: investment.symbol,
      platform: investment.platform,
      gainLoss: investment.gainLoss || (investment.currentValue ? investment.currentValue - investment.amountInvested : 0),
      gainLossPercentage: investment.gainLossPercentage || 
        (investment.currentValue && investment.amountInvested > 0 ? ((investment.currentValue - investment.amountInvested) / investment.amountInvested) * 100 : 0),
      createdAt: investment.createdAt,
      updatedAt: investment.updatedAt
    };
  }

  async deleteInvestment(id: string): Promise<void> {
    await apiService.delete(`/investments/${id}`);
  }

  async getInvestmentStats(): Promise<InvestmentStats> {
    const response = await apiService.get<ApiResponse<any>>('/investments/stats');
    const stats = response.data.data;
    
    // Map MongoDB _id to id for investments in topPerforming and worstPerforming
    const mapInvestmentArray = (investments: any[]) => {
      return investments.map(investment => ({
        id: investment._id,
        userId: investment.userId,
        name: investment.name,
        type: investment.type,
        amountInvested: investment.amountInvested,
        currentValue: investment.currentValue,
        purchaseDate: investment.purchaseDate,
        quantity: investment.quantity,
        symbol: investment.symbol,
        platform: investment.platform,
        gainLoss: investment.gainLoss,
        gainLossPercentage: investment.gainLossPercentage,
        createdAt: investment.createdAt,
        updatedAt: investment.updatedAt
      }));
    };
    
    return {
      totalInvestments: stats.totalInvestments,
      totalInvested: stats.totalInvested,
      totalCurrentValue: stats.totalCurrentValue,
      totalGainLoss: stats.totalGainLoss,
      totalGainLossPercentage: stats.totalGainLossPercentage,
      investmentsByType: stats.investmentsByType,
      topPerforming: mapInvestmentArray(stats.topPerforming || []),
      worstPerforming: mapInvestmentArray(stats.worstPerforming || [])
    };
  }
}

export const investmentService = new InvestmentService();