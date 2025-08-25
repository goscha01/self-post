'use client';

import { useState } from 'react';

interface BusinessInfo {
  name: string;
  industry: string;
  website: string;
  timezone: string;
  description: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  engagementAlerts: boolean;
  postReminders: boolean;
}

interface AISettings {
  model: string;
  tone: string;
  maxLength: number;
  autoGenerate: boolean;
  industryContext: string;
}

interface PostingSchedule {
  frequency: string;
  days: string[];
  time: string;
  autoPost: boolean;
  timezone: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business');
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: 'Spotless Home Stampa',
    industry: 'Home Services',
    website: 'https://spotlesshomestampa.com',
    timezone: 'America/New_York',
    description: 'Professional home cleaning and stampa services'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    engagementAlerts: true,
    postReminders: false
  });

  const [aiSettings, setAISettings] = useState<AISettings>({
    model: 'gpt-4',
    tone: 'Professional',
    maxLength: 280,
    autoGenerate: true,
    industryContext: 'Home services, cleaning, customer satisfaction'
  });

  const [postingSchedule, setPostingSchedule] = useState<PostingSchedule>({
    frequency: 'weekly',
    days: ['Monday', 'Wednesday', 'Friday'],
    time: '09:00',
    autoPost: true,
    timezone: 'America/New_York'
  });

  const handleBusinessInfoChange = (field: keyof BusinessInfo, value: string) => {
    setBusinessInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handleAISettingsChange = (field: keyof AISettings, value: string | number | boolean) => {
    setAISettings(prev => ({ ...prev, [field]: value }));
  };

  const handleScheduleChange = (field: keyof PostingSchedule, value: string | string[] | boolean) => {
    setPostingSchedule(prev => ({ ...prev, [field]: value }));
  };

  const saveSettings = () => {
    // TODO: Implement API call to save settings
    console.log('Saving settings...', { businessInfo, notifications, aiSettings, postingSchedule });
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'business', name: 'Business Info', icon: '🏢' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'ai', name: 'AI Configuration', icon: '🤖' },
    { id: 'schedule', name: 'Posting Schedule', icon: '📅' }
  ];

  return (
    <div className="min-h-full p-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <button
          onClick={saveSettings}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {/* Business Info Tab */}
        {activeTab === 'business' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessInfo.name}
                  onChange={(e) => handleBusinessInfoChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={businessInfo.industry}
                  onChange={(e) => handleBusinessInfoChange('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Home Services">Home Services</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Retail">Retail</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Technology">Technology</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={businessInfo.website}
                  onChange={(e) => handleBusinessInfoChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={businessInfo.timezone}
                  onChange={(e) => handleBusinessInfoChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <textarea
                  value={businessInfo.description}
                  onChange={(e) => handleBusinessInfoChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {key === 'emailNotifications' && 'Receive notifications via email'}
                      {key === 'pushNotifications' && 'Receive push notifications in the app'}
                      {key === 'weeklyReports' && 'Get weekly performance summaries'}
                      {key === 'engagementAlerts' && 'Alert when posts get high engagement'}
                      {key === 'postReminders' && 'Remind about scheduled posts'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleNotificationChange(key as keyof NotificationSettings, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Configuration Tab */}
        {activeTab === 'ai' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">AI Post Generation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Model
                </label>
                <select
                  value={aiSettings.model}
                  onChange={(e) => handleAISettingsChange('model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gpt-4">GPT-4 (Most Advanced)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast & Efficient)</option>
                  <option value="claude-3">Claude 3 (Creative & Safe)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone
                </label>
                <select
                  value={aiSettings.tone}
                  onChange={(e) => handleAISettingsChange('tone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Professional">Professional</option>
                  <option value="Casual">Casual</option>
                  <option value="Friendly">Friendly</option>
                  <option value="Humorous">Humorous</option>
                  <option value="Inspirational">Inspirational</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Post Length
                </label>
                <input
                  type="number"
                  value={aiSettings.maxLength}
                  onChange={(e) => handleAISettingsChange('maxLength', parseInt(e.target.value))}
                  min="50"
                  max="500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Characters (50-500)</p>
              </div>

              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiSettings.autoGenerate}
                    onChange={(e) => handleAISettingsChange('autoGenerate', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="ml-3 text-sm font-medium text-gray-900">Auto-generate posts</span>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry Context
                </label>
                <textarea
                  value={aiSettings.industryContext}
                  onChange={(e) => handleAISettingsChange('industryContext', e.target.value)}
                  rows={3}
                  placeholder="Describe your industry, target audience, and key topics for better AI-generated content"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Posting Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Automatic Posting Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posting Frequency
                </label>
                <select
                  value={postingSchedule.frequency}
                  onChange={(e) => handleScheduleChange('frequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="twice-weekly">Twice a Week</option>
                  <option value="weekly">Once a Week</option>
                  <option value="bi-weekly">Every 2 Weeks</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posting Time
                </label>
                <input
                  type="time"
                  value={postingSchedule.time}
                  onChange={(e) => handleScheduleChange('time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posting Days
                </label>
                <div className="space-y-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={postingSchedule.days.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleScheduleChange('days', [...postingSchedule.days, day]);
                          } else {
                            handleScheduleChange('days', postingSchedule.days.filter(d => d !== day));
                          }
                        }}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={postingSchedule.timezone}
                  onChange={(e) => handleScheduleChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={postingSchedule.autoPost}
                      onChange={(e) => handleScheduleChange('autoPost', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="ml-3 text-sm font-medium text-gray-900">Enable automatic posting</span>
                </div>
                <p className="text-sm text-gray-600 mt-2 ml-14">
                  When enabled, posts will be automatically published according to your schedule
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
