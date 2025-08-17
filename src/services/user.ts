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

// Type guards for runtime validation
const isUser = (data: unknown): data is User => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as any).id === 'string' &&
    typeof (data as any).name === 'string' &&
    typeof (data as any).email === 'string' &&
    typeof (data as any).createdAt === 'string' &&
    typeof (data as any).updatedAt === 'string'
  );
};

const isNotificationSettings = (data: unknown): data is NotificationSettings => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as any).emailNotifications === 'boolean' &&
    typeof (data as any).pushNotifications === 'boolean' &&
    typeof (data as any).transactionAlerts === 'boolean' &&
    typeof (data as any).weeklyReports === 'boolean' &&
    typeof (data as any).monthlyReports === 'boolean' &&
    typeof (data as any).investmentUpdates === 'boolean'
  );
};

const isSecuritySettings = (data: unknown): data is SecuritySettings => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as any).twoFactorAuth === 'boolean' &&
    typeof (data as any).sessionTimeout === 'number' &&
    typeof (data as any).loginAlerts === 'boolean'
  );
};

const isImageUrlResponse = (data: unknown): data is { imageUrl: string } => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as any).imageUrl === 'string'
  );
};

export const userService = {
  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiService.get('/users/profile');
    const data = response.data;
    
    if (!isUser(data)) {
      throw new Error('Invalid user data received from server');
    }
    
    return data;
  },

  // Update user profile
  updateProfile: async (data: ProfileUpdateData): Promise<User> => {
    const response = await apiService.put('/users/profile', data);
    const responseData = response.data;
    
    if (!isUser(responseData)) {
      throw new Error('Invalid user data received from server');
    }
    
    return responseData;
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
    const data = response.data;
    
    if (!isNotificationSettings(data)) {
      throw new Error('Invalid notification settings data received from server');
    }
    
    return data;
  },

  // Get security settings
  getSecuritySettings: async (): Promise<SecuritySettings> => {
    const response = await apiService.get('/users/security-settings');
    const data = response.data;
    
    if (!isSecuritySettings(data)) {
      throw new Error('Invalid security settings data received from server');
    }
    
    return data;
  },

  // Export user data
  exportData: async (): Promise<Blob> => {
    const response = await apiService.get('/users/export-data', {
      responseType: 'blob'
    });
    
    if (!(response.data instanceof Blob)) {
      throw new Error('Invalid blob data received from server');
    }
    
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
    
    const data = response.data;
    
    if (!isImageUrlResponse(data)) {
      throw new Error('Invalid image URL response received from server');
    }
    
    return data;
  }
};


