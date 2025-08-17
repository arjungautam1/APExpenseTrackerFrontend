import { apiService } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  currency?: string;
  timezone?: string;
  language?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  currency?: string;
  timezone?: string;
  language?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  transactionAlerts: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  investmentUpdates: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  loginAlerts: boolean;
}

export const userService = {
  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiService.get('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: ProfileUpdateData): Promise<User> => {
    const response = await apiService.put('/users/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiService.put('/users/change-password', {
      currentPassword,
      newPassword
    });
  },

  // Update notification settings
  updateNotificationSettings: async (settings: NotificationSettings): Promise<void> => {
    await apiService.put('/users/notification-settings', settings);
  },

  // Update security settings
  updateSecuritySettings: async (settings: SecuritySettings): Promise<void> => {
    await apiService.put('/users/security-settings', settings);
  },

  // Get notification settings
  getNotificationSettings: async (): Promise<NotificationSettings> => {
    const response = await apiService.get('/users/notification-settings');
    return response.data;
  },

  // Get security settings
  getSecuritySettings: async (): Promise<SecuritySettings> => {
    const response = await apiService.get('/users/security-settings');
    return response.data;
  },

  // Export user data
  exportData: async (): Promise<Blob> => {
    const response = await apiService.get('/users/export-data', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Delete account
  deleteAccount: async (password: string): Promise<void> => {
    await apiService.delete('/users/account', {
      data: { password }
    });
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await apiService.post('/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};


