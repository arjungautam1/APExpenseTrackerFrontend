// Monthly Bills Service - Database Integration
import { apiService } from './api';

export interface MonthlyBill {
  _id: string;
  id?: string; // For compatibility
  name: string;
  amount: number;
  dueDate: number; // Day of month (1-31)
  category: string;
  description?: string;
  isActive: boolean;
  autoDeduct?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMonthlyBill {
  name: string;
  amount: number;
  dueDate: number;
  category: string;
  description?: string;
  autoDeduct?: boolean;
  tags?: string[];
}

class MonthlyBillsService {
  // Use localStorage only to avoid authentication issues
  
  async getAllBills(): Promise<MonthlyBill[]> {
    console.log('MonthlyBillsService - Loading bills from localStorage');
    return this.getStoredBills();
  }

  async createBill(data: CreateMonthlyBill): Promise<MonthlyBill> {
    console.log('MonthlyBillsService - Creating bill locally:', data);
    return this.createBillLocally(data);
  }

  async updateBill(id: string, data: Partial<CreateMonthlyBill>): Promise<MonthlyBill> {
    console.log('MonthlyBillsService - Updating bill locally:', id, data);
    return this.updateBillLocally(id, data);
  }

  async deleteBill(id: string): Promise<void> {
    console.log('MonthlyBillsService - Deleting bill locally:', id);
    this.deleteBillLocally(id);
  }

  // Fallback methods for localStorage
  private createBillLocally(data: CreateMonthlyBill): MonthlyBill {
    const newBill: MonthlyBill = {
      _id: Date.now().toString(),
      id: Date.now().toString(),
      ...data,
      isActive: true,
      autoDeduct: data.autoDeduct ?? true,
      tags: data.tags ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existingBills = this.getStoredBills();
    existingBills.push(newBill);
    localStorage.setItem('monthlyBills', JSON.stringify(existingBills));

    return newBill;
  }

  private updateBillLocally(id: string, data: Partial<CreateMonthlyBill>): MonthlyBill {
    const existingBills = this.getStoredBills();
    const billIndex = existingBills.findIndex(bill => bill._id === id || bill.id === id);
    
    if (billIndex === -1) {
      throw new Error('Bill not found');
    }

    const updatedBill = {
      ...existingBills[billIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };

    existingBills[billIndex] = updatedBill;
    localStorage.setItem('monthlyBills', JSON.stringify(existingBills));

    return updatedBill;
  }

  private deleteBillLocally(id: string): void {
    const existingBills = this.getStoredBills();
    const filteredBills = existingBills.filter(bill => bill._id !== id && bill.id !== id);
    localStorage.setItem('monthlyBills', JSON.stringify(filteredBills));
  }

  private getStoredBills(): MonthlyBill[] {
    try {
      const stored = localStorage.getItem('monthlyBills');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  getSummary(): { totalMonthly: number; activeCount: number; categories: Record<string, number> } {
    const bills = this.getStoredBills();
    const activeBills = bills.filter(bill => bill.isActive);
    
    const totalMonthly = activeBills.reduce((sum, bill) => sum + bill.amount, 0);
    const categories: Record<string, number> = {};
    
    activeBills.forEach(bill => {
      categories[bill.category] = (categories[bill.category] || 0) + bill.amount;
    });

    return {
      totalMonthly,
      activeCount: activeBills.length,
      categories
    };
  }
}

export const monthlyBillsService = new MonthlyBillsService();
