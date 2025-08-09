import { apiService } from './api';
import { ApiResponse, User } from '../types';

export interface UpdateProfileInput {
  name?: string;
  currency?: string;
  timezone?: string;
  avatar?: string;
}

class UserService {
  async getProfile(): Promise<User> {
    const response = await apiService.get<ApiResponse<{ user: User }>>('/settings/me');
    return response.data.data.user;
  }

  async updateProfile(data: UpdateProfileInput): Promise<User> {
    const response = await apiService.put<ApiResponse<{ user: User }>>('/settings/me', data);
    return response.data.data.user;
  }
}

export const userService = new UserService();


