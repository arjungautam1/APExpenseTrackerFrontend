import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/user';
import { useCurrencyFormatter } from '../utils/currency';
import { 
  User, 
  Mail, 
  Lock, 
  Globe, 
  Bell, 
  Palette, 
  Shield, 
  Save, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  Camera,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface ProfileFormData {
  name: string;
  email: string;
  currency: string;
  timezone: string;
  language: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  transactionAlerts: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  investmentUpdates: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  loginAlerts: boolean;
}

export function ProfileSettingsPage() {
  const { user, updateUser } = useAuth();
  const { formatCurrency, currency, currencyCode } = useCurrencyFormatter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: '',
    email: '',
    currency: 'USD',
    timezone: 'America/Toronto',
    language: 'en'
  });

  // Update profile data when user data is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        currency: user.currency || 'USD',
        timezone: user.timezone || 'America/Toronto',
        language: user.language || 'en'
      });
    }
  }, [user]);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    transactionAlerts: true,
    weeklyReports: false,
    monthlyReports: true,
    investmentUpdates: true
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAlerts: true
  });

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' }
  ];

  const timezones = [
    { value: 'America/Toronto', label: 'Eastern Time (ET)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
    { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'ne', name: 'नेपाली' }
  ];

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      await userService.updateProfile(profileData);
      updateUser({ ...user, ...profileData });
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setIsLoading(true);
    try {
      await userService.updateNotificationSettings(notificationSettings);
      toast.success('Notification settings updated!');
    } catch (error: any) {
      toast.error('Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityUpdate = async () => {
    setIsLoading(true);
    try {
      await userService.updateSecuritySettings(securitySettings);
      toast.success('Security settings updated!');
    } catch (error: any) {
      toast.error('Failed to update security settings');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'preferences', name: 'Preferences', icon: Palette }
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Profile Settings
        </h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Picture Section */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
                <p className="text-sm text-gray-600">Update your profile picture</p>
              </div>
              <div className="card-body">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="h-20 w-20 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-lg">
                      <User className="h-10 w-10 text-white" />
                    </div>
                    <button className="absolute -bottom-1 -right-1 h-8 w-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-primary-300 transition-colors">
                      <Camera className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{user?.name}</h4>
                    <p className="text-sm text-gray-500">Upload a new profile picture</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                <p className="text-sm text-gray-600">Update your personal information</p>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="input"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="input"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={profileData.currency}
                      onChange={(e) => setProfileData({ ...profileData, currency: e.target.value })}
                      className="input"
                    >
                      {currencies.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={profileData.timezone}
                      onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                      className="input"
                    >
                      {timezones.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={profileData.language}
                      onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                      className="input"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleProfileUpdate}
                    disabled={isLoading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Change Password */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="input pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handlePasswordChange}
                    disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Lock className="h-4 w-4" />
                    <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                <p className="text-sm text-gray-600">Configure additional security measures</p>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <button
                    onClick={() => setSecuritySettings({ ...securitySettings, twoFactorAuth: !securitySettings.twoFactorAuth })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      securitySettings.twoFactorAuth ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Login Alerts</h4>
                    <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                  </div>
                  <button
                    onClick={() => setSecuritySettings({ ...securitySettings, loginAlerts: !securitySettings.loginAlerts })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      securitySettings.loginAlerts ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        securitySettings.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                  <select
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                    className="input"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={480}>8 hours</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSecurityUpdate}
                    disabled={isLoading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span>{isLoading ? 'Saving...' : 'Save Security Settings'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
              <p className="text-sm text-gray-600">Choose how and when you want to be notified</p>
            </div>
            <div className="card-body space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, emailNotifications: !notificationSettings.emailNotifications })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.emailNotifications ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Push Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications in your browser</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, pushNotifications: !notificationSettings.pushNotifications })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.pushNotifications ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Transaction Alerts</h4>
                    <p className="text-sm text-gray-600">Get notified when transactions are added</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, transactionAlerts: !notificationSettings.transactionAlerts })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.transactionAlerts ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.transactionAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Weekly Reports</h4>
                    <p className="text-sm text-gray-600">Receive weekly financial summaries</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, weeklyReports: !notificationSettings.weeklyReports })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.weeklyReports ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Monthly Reports</h4>
                    <p className="text-sm text-gray-600">Receive monthly financial summaries</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, monthlyReports: !notificationSettings.monthlyReports })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.monthlyReports ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.monthlyReports ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Investment Updates</h4>
                    <p className="text-sm text-gray-600">Get notified about investment changes</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, investmentUpdates: !notificationSettings.investmentUpdates })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings.investmentUpdates ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.investmentUpdates ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNotificationUpdate}
                  disabled={isLoading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Bell className="h-4 w-4" />
                  <span>{isLoading ? 'Saving...' : 'Save Notification Settings'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            {/* Display Preferences */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Display Preferences</h3>
                <p className="text-sm text-gray-600">Customize how information is displayed</p>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                    <select
                      value={profileData.currency}
                      onChange={(e) => setProfileData({ ...profileData, currency: e.target.value })}
                      className="input"
                    >
                      {currencies.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                    <select className="input">
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
                <p className="text-sm text-gray-600">Manage your data and privacy</p>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Export Data</h4>
                    <p className="text-sm text-gray-600">Download all your financial data</p>
                  </div>
                  <button className="btn-secondary">
                    Export
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <h4 className="font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                  </div>
                  <button className="btn-danger flex items-center space-x-2">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
