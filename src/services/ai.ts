import { apiService } from './api';
import { ApiResponse } from '../types';

export interface BulkTransactionData {
  text: string;
  format?: 'csv' | 'text' | 'pdf';
}

export interface ExtractedTransaction {
  amount: number;
  description: string;
  date?: string;
  category?: string;
  type: 'income' | 'expense';
}

export interface BulkExtractionResult {
  transactions: ExtractedTransaction[];
  totalAmount: number;
  confidence: number;
  processingTime: number;
}

export interface CategorySuggestion {
  name: string;
  confidence: number;
  type: 'income' | 'expense';
}

export interface InvestmentSuggestion {
  type: 'stocks' | 'mutual_funds' | 'crypto' | 'real_estate' | 'other';
  confidence: number;
}

export class AIService {
  async extractBulkTransactions(data: BulkTransactionData): Promise<BulkExtractionResult> {
    const response = await apiService.post<ApiResponse<BulkExtractionResult>>('/ai/extract-bulk-transactions', data);
    return response.data.data;
  }

  async suggestCategory(description: string, amount: number): Promise<CategorySuggestion> {
    const response = await apiService.post<ApiResponse<CategorySuggestion>>('/ai/suggest-category', {
      description,
      amount
    });
    return response.data.data;
  }

  async suggestInvestmentType(name: string, amount: number): Promise<InvestmentSuggestion> {
    const response = await apiService.post<ApiResponse<InvestmentSuggestion>>('/ai/suggest-investment-type', {
      name,
      amount
    });
    return response.data.data;
  }

  async analyzeExpenses(transactions: any[]): Promise<{
    insights: string[];
    recommendations: string[];
    trends: any[];
  }> {
    const response = await apiService.post<ApiResponse<{
      insights: string[];
      recommendations: string[];
      trends: any[];
    }>>('/ai/analyze-expenses', { transactions });
    return response.data.data;
  }

  async generateFinancialReport(month: string, year: string): Promise<{
    summary: string;
    highlights: string[];
    recommendations: string[];
  }> {
    const response = await apiService.post<ApiResponse<{
      summary: string;
      highlights: string[];
      recommendations: string[];
    }>>('/ai/generate-report', { month, year });
    return response.data.data;
  }

  async predictExpenses(historicalData: any[]): Promise<{
    predictions: Array<{
      month: string;
      predictedAmount: number;
      confidence: number;
    }>;
    factors: string[];
  }> {
    const response = await apiService.post<ApiResponse<{
      predictions: Array<{
        month: string;
        predictedAmount: number;
        confidence: number;
      }>;
      factors: string[];
    }>>('/ai/predict-expenses', { historicalData });
    return response.data.data;
  }

  async optimizeBudget(categories: any[], income: number): Promise<{
    allocations: Array<{
      category: string;
      recommendedAmount: number;
      reasoning: string;
    }>;
    savings: number;
    tips: string[];
  }> {
    const response = await apiService.post<ApiResponse<{
      allocations: Array<{
        category: string;
        recommendedAmount: number;
        reasoning: string;
      }>;
      savings: number;
      tips: string[];
    }>>('/ai/optimize-budget', { categories, income });
    return response.data.data;
  }

  async detectAnomalies(transactions: any[]): Promise<{
    anomalies: Array<{
      transaction: any;
      reason: string;
      severity: 'low' | 'medium' | 'high';
    }>;
    riskScore: number;
  }> {
    const response = await apiService.post<ApiResponse<{
      anomalies: Array<{
        transaction: any;
        reason: string;
        severity: 'low' | 'medium' | 'high';
      }>;
      riskScore: number;
    }>>('/ai/detect-anomalies', { transactions });
    return response.data.data;
  }

  async suggestSavingsGoals(income: number, expenses: number, age: number): Promise<{
    goals: Array<{
      name: string;
      targetAmount: number;
      timeframe: string;
      monthlyContribution: number;
      priority: 'low' | 'medium' | 'high';
    }>;
    totalMonthlySavings: number;
  }> {
    const response = await apiService.post<ApiResponse<{
      goals: Array<{
        name: string;
        targetAmount: number;
        timeframe: string;
        monthlyContribution: number;
        priority: 'low' | 'medium' | 'high';
      }>;
      totalMonthlySavings: number;
    }>>('/ai/suggest-savings-goals', { income, expenses, age });
    return response.data.data;
  }

  async generateTaxInsights(transactions: any[], year: number): Promise<{
    deductions: Array<{
      category: string;
      amount: number;
      description: string;
    }>;
    estimatedTaxSavings: number;
    recommendations: string[];
  }> {
    const response = await apiService.post<ApiResponse<{
      deductions: Array<{
        category: string;
        amount: number;
        description: string;
      }>;
      estimatedTaxSavings: number;
      recommendations: string[];
    }>>('/ai/tax-insights', { transactions, year });
    return response.data.data;
  }
}

export const aiService = new AIService();


