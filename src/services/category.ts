import { apiService } from './api';
import { Category, ApiResponse } from '../types';

export interface CreateCategoryData {
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  parentCategoryId?: string;
}

export interface UpdateCategoryData extends Partial<Omit<CreateCategoryData, 'type'>> {}

export class CategoryService {
  async getCategories(type?: 'income' | 'expense'): Promise<Category[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    
    const queryString = params.toString();
    const url = queryString ? `/categories?${queryString}` : '/categories';
    
    const response = await apiService.get<ApiResponse<any[]>>(url);
    
    // Map MongoDB _id to id for frontend consistency
    return response.data.data.map((category: any) => ({
      id: category._id,
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
      userId: category.userId,
      parentCategoryId: category.parentCategoryId,
      isDefault: category.isDefault
    }));
  }

  async getCategory(id: string): Promise<Category> {
    const response = await apiService.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  }

  async createCategory(data: CreateCategoryData): Promise<Category> {
    const response = await apiService.post<ApiResponse<Category>>('/categories', data);
    return response.data.data;
  }

  async updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
    const response = await apiService.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await apiService.delete(`/categories/${id}`);
  }
}

export const categoryService = new CategoryService();