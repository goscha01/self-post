'use client';

import { Users, Calendar, TrendingUp, Share2 } from 'lucide-react';

const stats = [
  {
    name: 'Connected Profiles',
    value: '3',
    icon: Users,
    change: '+2',
    changeType: 'positive',
  },
  {
    name: 'Scheduled Posts',
    value: '12',
    icon: Calendar,
    change: '+5',
    changeType: 'positive',
  },
  {
    name: 'Total Engagement',
    value: '2.4K',
    icon: TrendingUp,
    change: '+12%',
    changeType: 'positive',
  },
  {
    name: 'Posts This Week',
    value: '8',
    icon: Share2,
    change: '+3',
    changeType: 'positive',
  },
];

export function QuickStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm font-medium text-green-600">
                {stat.change}
              </span>
              <span className="text-sm text-gray-600 ml-1">from last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
