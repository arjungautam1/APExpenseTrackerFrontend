import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    // Use deployed backend API for all environments
    const getApiUrl = () => {
      // Always use the deployed backend API
      return 'https://ap-bhaoh.ondigitalocean.app/apexpensetrackerbackend2/api';
    };

    this.api = axios.create({
      baseURL: getApiUrl(),
      timeout: 30000, // Increased from 10000ms to 30000ms for AI processing
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        console.log('API Request - Token check:', {
          hasToken: !!token,
          tokenValue: token ? token.substring(0, 20) + '...' : 'none',
          url: config.url,
          method: config.method,
          isMonthlyExpense: config.url?.includes('monthly-expenses')
        });
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

        console.log('API Response Error:', {
          status: error.response?.status,
          url: originalRequest.url,
          method: originalRequest.method,
          message: error.response?.data?.message,
          isMonthlyExpense: originalRequest.url?.includes('monthly-expenses'),
          willRedirect: error.response?.status === 401
        });

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          console.log('Attempting token refresh...');

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            console.log('Token refresh attempt - refresh token available:', !!refreshToken);
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              const { token, refreshToken: newRefreshToken } = response.data.data;
              
              localStorage.setItem('token', token);
              localStorage.setItem('refreshToken', newRefreshToken);
              
              console.log('Token refresh successful, retrying request');
              
              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            } else {
              console.log('No refresh token available - NOT redirecting for debugging');
              // Temporarily disable redirect for debugging
              // localStorage.removeItem('token');
              // localStorage.removeItem('refreshToken');
              // console.log('About to redirect to login page...');
              // window.location.href = '/login';
            }
          } catch (refreshError) {
            console.log('Token refresh failed:', refreshError);
            // Temporarily disable redirect for debugging
            // localStorage.removeItem('token');
            // localStorage.removeItem('refreshToken');
            // console.log('About to redirect to login page due to refresh failure...');
            // window.location.href = '/login';
          }
        } else if (error.response?.status === 401 && originalRequest._retry) {
          // Already tried to refresh, redirect to login
          console.log('Token refresh already attempted - NOT redirecting for debugging');
          // Temporarily disable redirect for debugging
          // localStorage.removeItem('token');
          // localStorage.removeItem('refreshToken');
          // console.log('About to redirect to login page due to retry failure...');
          // window.location.href = '/login';
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