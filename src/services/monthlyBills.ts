// Simple Monthly Bills Service - Built from scratch
import { apiService } from './api';

export interface MonthlyBill {
  id: string;
  name: string;
  amount: number;
  dueDate: number; // Day of month (1-31)
  category: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMonthlyBill {
  name: string;
  amount: number;
  dueDate: number;
  category: string;
  description?: string;
}

class MonthlyBillsService {
  private baseUrl = '/monthly-bills';

  async getAllBills(): Promise<MonthlyBill[]> {
    try {
      // For now, return mock data until we have a working backend endpoint
      return [
        {
          id: '1',
          name: 'Rent',
          amount: 1200,
          dueDate: 1,
          category: 'housing',
          description: 'Monthly apartment rent',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Internet',
          amount: 80,
          dueDate: 15,
          category: 'utilities',
          description: 'High-speed internet',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching monthly bills:', error);
      return [];
    }
  }

  async createBill(data: CreateMonthlyBill): Promise<MonthlyBill> {
    // For now, create a mock bill with a generated ID
    const newBill: MonthlyBill = {
      id: Date.now().toString(),
      ...data,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store in localStorage for demo purposes
    const existingBills = this.getStoredBills();
    existingBills.push(newBill);
    localStorage.setItem('monthlyBills', JSON.stringify(existingBills));

    return newBill;
  }

  async updateBill(id: string, data: Partial<CreateMonthlyBill>): Promise<MonthlyBill> {
    const existingBills = this.getStoredBills();
    const billIndex = existingBills.findIndex(bill => bill.id === id);
    
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

  async deleteBill(id: string): Promise<void> {
    const existingBills = this.getStoredBills();
    const filteredBills = existingBills.filter(bill => bill.id !== id);
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
