
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/user';
import { getSupportedCurrencies } from '../utils/currency';
import toast from 'react-hot-toast';

const supportedCurrencies = getSupportedCurrencies();

export function SettingsPage() {
  const { user, isLoading, checkAuth } = useAuth();
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCurrency(user.currency || 'USD');
      setTimezone(user.timezone || 'UTC');
    }
  }, [user]);

  const timezones = useMemo(() => {
    try {
      return (Intl as any).supportedValuesOf ? (Intl as any).supportedValuesOf('timeZone') : ['UTC'];
    } catch {
      return ['UTC'];
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updatedUser = await userService.updateProfile({ name, currency, timezone });
      
      // Force refresh the auth context with updated user data
      await checkAuth();
      
      // Double-check that the currency was actually saved
      if (updatedUser.currency !== currency) {
        toast.error('Currency setting was not saved properly. Please try again.');
        return;
      }
      
      toast.success('Settings updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update settings';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="card-body space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              className="mt-1 input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 input input-bordered w-full bg-gray-50"
              value={user?.email || ''}
              disabled
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select
                className="mt-1 select select-bordered w-full"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={isLoading}
              >
                {supportedCurrencies.map((c) => (
                  <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <select
                className="mt-1 select select-bordered w-full"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={isLoading}
              >
                {timezones.map((tz: string) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="submit" className="btn btn-primary" disabled={saving || isLoading}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}