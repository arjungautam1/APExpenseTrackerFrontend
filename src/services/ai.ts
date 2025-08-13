import { apiService } from './api';

export interface ScanBillResult {
  amount?: number;
  currency?: string;
  date?: string;
  merchant?: string;
  description?: string;
  categoryName?: string;
  transactionType?: string;
  raw?: string;
}

export interface AutoCategorizeRequest {
  description: string;
  amount?: number;
  merchant?: string;
}

export interface AutoCategorizeResult {
  categoryId: string | null;
  categoryName: string;
  transactionType: 'income' | 'expense';
  confidence: 'high' | 'medium' | 'low';
  raw?: string;
  availableCategories: Array<{
    id: string;
    name: string;
    type: 'income' | 'expense' | 'investment';
  }>;
}

class AIService {
  async scanBill(imageBase64?: string, imageUrl?: string): Promise<ScanBillResult> {
    const payload: any = {};
    if (imageBase64) payload.imageBase64 = imageBase64;
    if (imageUrl) payload.imageUrl = imageUrl;
    const response = await apiService.post<{ success: boolean; data: ScanBillResult; message: string }>(
      '/ai/scan-bill',
      payload
    );
    return response.data.data;
  }

  async autoCategorize(data: AutoCategorizeRequest): Promise<AutoCategorizeResult> {
    const response = await apiService.post<{ success: boolean; data: AutoCategorizeResult; message: string }>(
      '/ai/auto-categorize',
      data
    );
    return response.data.data;
  }
}

export const aiService = new AIService();


