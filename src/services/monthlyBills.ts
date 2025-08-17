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
  private baseUrl = '/monthly-expenses'; // Using existing endpoint

  async getAllBills(): Promise<MonthlyBill[]> {
    try {
      console.log('MonthlyBillsService - Fetching all bills from database');
      const response = await apiService.get<{ data: MonthlyBill[] }>(this.baseUrl);
      console.log('MonthlyBillsService - Fetched bills:', response.data);
      
      // Transform the response to ensure compatibility
      const bills = response.data.data || response.data;
      return Array.isArray(bills) ? bills.map(bill => ({
        ...bill,
        id: bill._id || bill.id // Ensure we have an id field
      })) : [];
    } catch (error: any) {
      console.error('Error fetching monthly bills from database:', error);
      
      // Fallback to localStorage if database fails
      console.log('MonthlyBillsService - Falling back to localStorage');
      return this.getStoredBills();
    }
  }

  async createBill(data: CreateMonthlyBill): Promise<MonthlyBill> {
    try {
      console.log('MonthlyBillsService - Creating bill in database:', data);
      
      // Transform data to match backend expectations
      const billData = {
        ...data,
        autoDeduct: data.autoDeduct ?? true,
        tags: data.tags ?? []
      };

      const response = await apiService.post<{ data: MonthlyBill }>(this.baseUrl, billData);
      console.log('MonthlyBillsService - Bill created successfully:', response.data);
      
      const newBill = response.data.data || response.data;
      
      // Also store in localStorage as backup
      const existingBills = this.getStoredBills();
      existingBills.push({
        ...newBill,
        id: newBill._id || newBill.id
      });
      localStorage.setItem('monthlyBills', JSON.stringify(existingBills));
      
      return {
        ...newBill,
        id: newBill._id || newBill.id
      };
    } catch (error: any) {
      console.error('Error creating bill in database:', error);
      
      // Fallback to localStorage
      console.log('MonthlyBillsService - Falling back to localStorage for create');
      return this.createBillLocally(data);
    }
  }

  async updateBill(id: string, data: Partial<CreateMonthlyBill>): Promise<MonthlyBill> {
    try {
      console.log('MonthlyBillsService - Updating bill in database:', id, data);
      
      const response = await apiService.put<{ data: MonthlyBill }>(`${this.baseUrl}/${id}`, data);
      console.log('MonthlyBillsService - Bill updated successfully:', response.data);
      
      const updatedBill = response.data.data || response.data;
      
      // Update localStorage as well
      const existingBills = this.getStoredBills();
      const billIndex = existingBills.findIndex(bill => bill._id === id || bill.id === id);
      if (billIndex !== -1) {
        existingBills[billIndex] = {
          ...updatedBill,
          id: updatedBill._id || updatedBill.id
        };
        localStorage.setItem('monthlyBills', JSON.stringify(existingBills));
      }
      
      return {
        ...updatedBill,
        id: updatedBill._id || updatedBill.id
      };
    } catch (error: any) {
      console.error('Error updating bill in database:', error);
      
      // Fallback to localStorage
      console.log('MonthlyBillsService - Falling back to localStorage for update');
      return this.updateBillLocally(id, data);
    }
  }

  async deleteBill(id: string): Promise<void> {
    try {
      console.log('MonthlyBillsService - Deleting bill from database:', id);
      
      await apiService.delete(`${this.baseUrl}/${id}`);
      console.log('MonthlyBillsService - Bill deleted successfully');
      
      // Also remove from localStorage
      const existingBills = this.getStoredBills();
      const filteredBills = existingBills.filter(bill => bill._id !== id && bill.id !== id);
      localStorage.setItem('monthlyBills', JSON.stringify(filteredBills));
    } catch (error: any) {
      console.error('Error deleting bill from database:', error);
      
      // Fallback to localStorage
      console.log('MonthlyBillsService - Falling back to localStorage for delete');
      this.deleteBillLocally(id);
    }
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
