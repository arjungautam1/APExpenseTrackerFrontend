// Monthly Bills Service - Database Integration
import { MonthlyBill } from '../types';

export interface CreateMonthlyBillData {
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
  paymentMethod?: string;
  notes?: string;
}

export interface UpdateMonthlyBillData extends Partial<CreateMonthlyBillData> {}

export interface MonthlyBillFilters {
  isPaid?: boolean;
  category?: string;
  month?: string;
  year?: string;
}

export class MonthlyBillsService {
  private bills: MonthlyBill[] = [];

  constructor() {
    this.loadBills();
  }

  private loadBills(): void {
    // Use localStorage only to avoid authentication issues
    try {
      const stored = localStorage.getItem('monthlyBills');
      if (stored) {
        this.bills = JSON.parse(stored);
      }
    } catch (error) {
      this.bills = [];
    }
  }

  async getBills(filters?: MonthlyBillFilters): Promise<MonthlyBill[]> {
    let filteredBills = [...this.bills];

    if (filters) {
      if (filters.isPaid !== undefined) {
        filteredBills = filteredBills.filter(bill => bill.isPaid === filters.isPaid);
      }
      if (filters.category) {
        filteredBills = filteredBills.filter(bill => bill.category === filters.category);
      }
      if (filters.month && filters.year) {
        const targetMonth = parseInt(filters.month);
        const targetYear = parseInt(filters.year);
        filteredBills = filteredBills.filter(bill => {
          const billDate = new Date(bill.dueDate);
          return billDate.getMonth() === targetMonth && billDate.getFullYear() === targetYear;
        });
      }
    }

    return filteredBills.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  async getAllBills(): Promise<MonthlyBill[]> {
    return this.getBills();
  }

  async createBill(data: CreateMonthlyBillData): Promise<MonthlyBill> {
    const newBill: MonthlyBill = {
      id: Date.now().toString(),
      userId: 'local',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.bills.push(newBill);
    this.saveBills();
    return newBill;
  }

  async updateBill(id: string, data: UpdateMonthlyBillData): Promise<MonthlyBill> {
    const index = this.bills.findIndex(bill => bill.id === id);
    if (index === -1) {
      throw new Error('Bill not found');
    }

    this.bills[index] = {
      ...this.bills[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.saveBills();
    return this.bills[index];
  }

  async deleteBill(id: string): Promise<void> {
    this.bills = this.bills.filter(bill => bill.id !== id);
    this.saveBills();
  }

  async markAsPaid(id: string, paymentMethod?: string): Promise<MonthlyBill> {
    return this.updateBill(id, { isPaid: true, paymentMethod });
  }

  async markAsUnpaid(id: string): Promise<MonthlyBill> {
    return this.updateBill(id, { isPaid: false });
  }

  async markBillAsPaid(billId: string, month?: string): Promise<void> {
    const bill = this.bills.find(b => b.id === billId);
    if (bill) {
      await this.markAsPaid(billId);
    }
  }

  async getBillsByMonth(month: number, year: number): Promise<MonthlyBill[]> {
    return this.getBills({ month: month.toString(), year: year.toString() });
  }

  async getUpcomingBills(days: number = 30): Promise<MonthlyBill[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.bills.filter(bill => {
      const dueDate = new Date(bill.dueDate);
      return dueDate >= today && dueDate <= futureDate && !bill.isPaid;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  async getOverdueBills(): Promise<MonthlyBill[]> {
    const today = new Date();
    return this.bills.filter(bill => {
      const dueDate = new Date(bill.dueDate);
      return dueDate < today && !bill.isPaid;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  getSummary(): { totalMonthly: number; activeCount: number; categories: Record<string, number> } {
    const activeBills = this.bills.filter(bill => !bill.isPaid);
    
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

  getPaymentStatus(billId: string): {
    isPaid: boolean;
    currentMonth: string;
    nextDueMonth: string;
    lastPaidDate?: string;
  } {
    const bill = this.bills.find(b => b.id === billId);
    
    if (!bill) {
      return {
        isPaid: false,
        currentMonth: new Date().toISOString().slice(0, 7),
        nextDueMonth: new Date().toISOString().slice(0, 7)
      };
    }
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const isPaid = bill.isPaid;
    const nextDueMonth = new Date(bill.dueDate).toISOString().slice(0, 7);
    
    return {
      isPaid,
      currentMonth,
      nextDueMonth,
      lastPaidDate: bill.isPaid ? bill.updatedAt : undefined
    };
  }

  isBillPaidForMonth(billId: string, month?: string): boolean {
    const bill = this.bills.find(b => b.id === billId);
    if (!bill) return false;
    
    const currentMonth = month || new Date().toISOString().slice(0, 7);
    return bill.isPaid;
  }

  async getBillsSummary(): Promise<{
    total: number;
    paid: number;
    unpaid: number;
    overdue: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
  }> {
    const today = new Date();
    const summary = {
      total: this.bills.length,
      paid: 0,
      unpaid: 0,
      overdue: 0,
      totalAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0
    };

    this.bills.forEach(bill => {
      summary.totalAmount += bill.amount;
      
      if (bill.isPaid) {
        summary.paid++;
        summary.paidAmount += bill.amount;
      } else {
        summary.unpaid++;
        summary.unpaidAmount += bill.amount;
        
        const dueDate = new Date(bill.dueDate);
        if (dueDate < today) {
          summary.overdue++;
        }
      }
    });

    return summary;
  }

  private saveBills(): void {
    localStorage.setItem('monthlyBills', JSON.stringify(this.bills));
  }

  // Fallback methods for localStorage
  async getBillsFromStorage(): Promise<MonthlyBill[]> {
    try {
      const stored = localStorage.getItem('monthlyBills');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  async saveBillsToStorage(bills: MonthlyBill[]): Promise<void> {
    localStorage.setItem('monthlyBills', JSON.stringify(bills));
  }

  async clearBillsFromStorage(): Promise<void> {
    localStorage.removeItem('monthlyBills');
  }

  // Bulk operations
  async createMultipleBills(billsData: CreateMonthlyBillData[]): Promise<MonthlyBill[]> {
    const newBills: MonthlyBill[] = billsData.map((data, index) => ({
      id: (Date.now() + index).toString(),
      userId: 'local',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    this.bills.push(...newBills);
    this.saveBills();
    return newBills;
  }

  async deleteMultipleBills(ids: string[]): Promise<void> {
    this.bills = this.bills.filter(bill => !ids.includes(bill.id));
    this.saveBills();
  }

  async markMultipleAsPaid(ids: string[], paymentMethod?: string): Promise<MonthlyBill[]> {
    const updatedBills: MonthlyBill[] = [];
    
    for (const id of ids) {
      const updatedBill = await this.markAsPaid(id, paymentMethod);
      updatedBills.push(updatedBill);
    }
    
    return updatedBills;
  }

  // Data export/import
  async exportBills(): Promise<string> {
    return JSON.stringify(this.bills, null, 2);
  }

  async importBills(billsJson: string): Promise<MonthlyBill[]> {
    try {
      const importedBills = JSON.parse(billsJson);
      if (Array.isArray(importedBills)) {
        this.bills = importedBills.map(bill => ({
          ...bill,
          id: bill.id || Date.now().toString(),
          userId: bill.userId || 'local',
          createdAt: bill.createdAt || new Date().toISOString(),
          updatedAt: bill.updatedAt || new Date().toISOString()
        }));
        this.saveBills();
        return this.bills;
      }
      throw new Error('Invalid bills data format');
    } catch (error) {
      throw new Error('Failed to import bills: ' + (error as Error).message);
    }
  }
}

export const monthlyBillsService = new MonthlyBillsService();
