'use client';

import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

const platforms = [
  {
    name: 'Instagram',
    icon: Instagram,
    profile: '@mybrand',
    status: 'Connected',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
  },
  {
    name: 'Twitter',
    icon: Twitter,
    profile: '@mybrand',
    status: 'Connected',
    color: 'bg-blue-400',
  },
  {
    name: 'Facebook',
    icon: Facebook,
    profile: 'My Brand Page',
    status: 'Connected',
    color: 'bg-blue-600',
  },
  {
    name: 'YouTube',
    icon: Youtube,
    profile: 'My Brand Channel',
    status: 'Connected',
    color: 'bg-red-600',
  },
];

export function ConnectedProfiles() {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Profiles</h3>
      <div className="space-y-3">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <div key={platform.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${platform.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{platform.name}</p>
                  <p className="text-sm text-gray-600">{platform.profile}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-green-600">{platform.status}</span>
            </div>
          );
        })}
      </div>
      <button className="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
        Connect New Platform
      </button>
    </div>
  );
}
