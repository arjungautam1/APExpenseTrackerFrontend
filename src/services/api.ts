import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    // Use the DigitalOcean App Platform URL for API calls
    const getApiUrl = () => {
      // Use the DigitalOcean App Platform backend URL
      return 'https://ap-bhaoh.ondigitalocean.app/apexpensetrackerbackend2/api';
    };

    this.api = axios.create({
      baseURL: getApiUrl(),
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token && token !== 'mock-jwt-token') {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              const { token, refreshToken: newRefreshToken } = response.data.data;
              
              localStorage.setItem('token', token);
              localStorage.setItem('refreshToken', newRefreshToken);
              
              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            } else {
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
            }
          } catch (refreshError) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }
        } else if (error.response?.status === 401 && originalRequest._retry) {
          // Already tried to refresh, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(refreshToken: string) {
    return this.api.post('/auth/refresh', { refreshToken });
  }

  // Generic methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete(url, config);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.patch(url, data, config);
  }
}

export const apiService = new ApiService();
export default apiService;