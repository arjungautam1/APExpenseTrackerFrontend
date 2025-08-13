import { apiService } from './api';
import { AuthResponse, User, ApiResponse } from '../types';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  currency?: string;
  timezone?: string;
}

export class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await apiService.post('/auth/logout');
    this.clearTokens();
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data.data.user;
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiService.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  }

  setTokens(token: string, refreshToken: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!(token && token !== 'mock-jwt-token');
  }
}

export const authService = new AuthService();