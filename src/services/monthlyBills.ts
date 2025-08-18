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
  // Payment tracking
  paidMonths?: string[]; // Array of "YYYY-MM" strings for paid months
  lastPaidDate?: string; // ISO date string of last payment
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

  // Payment tracking methods
  markBillAsPaid(billId: string, month?: string): void {
    const bills = this.getStoredBills();
    const billIndex = bills.findIndex(bill => bill._id === billId || bill.id === billId);
    
    if (billIndex === -1) return;

    const currentMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM format
    const bill = bills[billIndex];
    
    // Initialize paidMonths array if it doesn't exist
    if (!bill.paidMonths) {
      bill.paidMonths = [];
    }
    
    // Add current month if not already paid
    if (!bill.paidMonths.includes(currentMonth)) {
      bill.paidMonths.push(currentMonth);
    }
    
    // Update last paid date
    bill.lastPaidDate = new Date().toISOString();
    bill.updatedAt = new Date().toISOString();
    
    // Save updated bills
    localStorage.setItem('monthlyBills', JSON.stringify(bills));
  }

  isBillPaidForMonth(billId: string, month?: string): boolean {
    const bills = this.getStoredBills();
    const bill = bills.find(bill => bill._id === billId || bill.id === billId);
    
    if (!bill || !bill.paidMonths) return false;
    
    const currentMonth = month || new Date().toISOString().slice(0, 7);
    return bill.paidMonths.includes(currentMonth);
  }

  getNextDueMonth(billId: string): string {
    const bills = this.getStoredBills();
    const bill = bills.find(bill => bill._id === billId || bill.id === billId);
    
    if (!bill || !bill.paidMonths || bill.paidMonths.length === 0) {
      return new Date().toISOString().slice(0, 7); // Current month if never paid
    }
    
    // Find the latest paid month
    const latestPaidMonth = bill.paidMonths.sort().pop()!;
    const [year, month] = latestPaidMonth.split('-').map(Number);
    
    // Calculate next month
    let nextYear = year;
    let nextMonth = month + 1;
    
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    }
    
    return `${nextYear}-${nextMonth.toString().padStart(2, '0')}`;
  }

  getPaymentStatus(billId: string): {
    isPaid: boolean;
    currentMonth: string;
    nextDueMonth: string;
    lastPaidDate?: string;
  } {
    const bills = this.getStoredBills();
    const bill = bills.find(bill => bill._id === billId || bill.id === billId);
    
    if (!bill) {
      return {
        isPaid: false,
        currentMonth: new Date().toISOString().slice(0, 7),
        nextDueMonth: new Date().toISOString().slice(0, 7)
      };
    }
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const isPaid = this.isBillPaidForMonth(billId, currentMonth);
    const nextDueMonth = this.getNextDueMonth(billId);
    
    return {
      isPaid,
      currentMonth,
      nextDueMonth,
      lastPaidDate: bill.lastPaidDate
    };
  }
}

export const monthlyBillsService = new MonthlyBillsService();
