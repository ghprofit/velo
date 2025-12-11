'use client';

import { useState, useEffect } from 'react';
import { useGetAllSettingsQuery, useBulkUpdateSettingsMutation, useResetSettingsToDefaultsMutation } from '@/state/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Button from '@/components/ui/Button';

type SettingCategory = 'general' | 'payments' | 'content' | 'security';

interface SettingInput {
  key: string;
  value: string;
  label: string;
  description: string;
  type: 'text' | 'number' | 'boolean';
}

const SETTING_CONFIGS: Record<SettingCategory, SettingInput[]> = {
  general: [
    {
      key: 'platform_name',
      label: 'Platform Name',
      description: 'The name of your platform',
      type: 'text',
      value: '',
    },
    {
      key: 'support_email',
      label: 'Support Email',
      description: 'Contact email for user support',
      type: 'text',
      value: '',
    },
  ],
  payments: [
    {
      key: 'platform_fee_percentage',
      label: 'Platform Fee (%)',
      description: 'Percentage fee taken from each transaction',
      type: 'number',
      value: '',
    },
    {
      key: 'min_payout_amount',
      label: 'Minimum Payout Amount ($)',
      description: 'Minimum amount required for creator payouts',
      type: 'number',
      value: '',
    },
    {
      key: 'payout_schedule',
      label: 'Payout Schedule',
      description: 'How often payouts are processed (e.g., weekly, monthly)',
      type: 'text',
      value: '',
    },
    {
      key: 'stripe_public_key',
      label: 'Stripe Public Key',
      description: 'Your Stripe publishable key',
      type: 'text',
      value: '',
    },
  ],
  content: [
    {
      key: 'max_content_size',
      label: 'Max Content Size (MB)',
      description: 'Maximum file size for uploaded content',
      type: 'number',
      value: '',
    },
    {
      key: 'allowed_content_types',
      label: 'Allowed Content Types',
      description: 'Comma-separated list of allowed file types',
      type: 'text',
      value: '',
    },
    {
      key: 'min_content_price',
      label: 'Minimum Content Price ($)',
      description: 'Minimum price creators can set for content',
      type: 'number',
      value: '',
    },
    {
      key: 'max_content_price',
      label: 'Maximum Content Price ($)',
      description: 'Maximum price creators can set for content',
      type: 'number',
      value: '',
    },
  ],
  security: [
    {
      key: 'max_login_attempts',
      label: 'Max Login Attempts',
      description: 'Maximum failed login attempts before lockout',
      type: 'number',
      value: '',
    },
    {
      key: 'session_timeout',
      label: 'Session Timeout (minutes)',
      description: 'How long before inactive sessions expire',
      type: 'number',
      value: '',
    },
  ],
};

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('general');
  const [settingValues, setSettingValues] = useState<Record<string, string>>({});

  const { data: settingsData, isLoading, refetch } = useGetAllSettingsQuery();
  const [bulkUpdateSettings, { isLoading: isUpdating }] = useBulkUpdateSettingsMutation();
  const [resetSettings, { isLoading: isResetting }] = useResetSettingsToDefaultsMutation();

  // Load settings when data is available
  useEffect(() => {
    if (settingsData?.settings) {
      const values: Record<string, string> = {};
      settingsData.settings.forEach(setting => {
        values[setting.key] = setting.value;
      });
      setSettingValues(values);
    }
  }, [settingsData]);

  const handleInputChange = (key: string, value: string) => {
    setSettingValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const updates = Object.entries(settingValues)
        .filter(([key]) => SETTING_CONFIGS[activeCategory].some(s => s.key === key))
        .map(([key, value]) => ({ key, value }));

      await bulkUpdateSettings({ updates }).unwrap();
      alert('Settings saved successfully!');
      refetch();
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to default values? This cannot be undone.')) {
      return;
    }

    try {
      await resetSettings().unwrap();
      alert('Settings reset to defaults successfully!');
      refetch();
    } catch (error) {
      console.error('Failed to reset settings:', error);
      alert('Failed to reset settings. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  const categoryConfigs = SETTING_CONFIGS[activeCategory];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Platform Settings</h1>
        <p className="text-gray-600">Manage your platform configuration and preferences</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {(Object.keys(SETTING_CONFIGS) as SettingCategory[]).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
              activeCategory === category
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{activeCategory} Settings</CardTitle>
          <CardDescription>
            Configure {activeCategory} settings for your platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categoryConfigs.map((setting) => {
              const currentValue = settingValues[setting.key] || '';
              
              return (
                <div key={setting.key} className="space-y-2">
                  <label htmlFor={setting.key} className="block text-sm font-medium text-gray-700">
                    {setting.label}
                  </label>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                  {setting.type === 'boolean' ? (
                    <select
                      id={setting.key}
                      value={currentValue}
                      onChange={(e) => handleInputChange(setting.key, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>
                  ) : (
                    <input
                      id={setting.key}
                      type={setting.type}
                      value={currentValue}
                      onChange={(e) => handleInputChange(setting.key, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Enter ${setting.label.toLowerCase()}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={handleSave}
              disabled={isUpdating}
              variant="default"
              className="px-6 py-2"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              onClick={handleReset}
              disabled={isResetting}
              variant="outline"
              className="px-6 py-2"
            >
              {isResetting ? 'Resetting...' : 'Reset to Defaults'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Settings Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Total Settings:</strong> {settingsData?.total || 0}</p>
            <p><strong>Public Settings:</strong> Settings marked as public are visible to all users</p>
            <p><strong>Auto-save:</strong> Changes are applied immediately after clicking Save Changes</p>
            <p><strong>Reset:</strong> Resetting will restore all settings to their default values</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
