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
}

export const aiService = new AIService();


