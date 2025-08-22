'use client';

import { Wifi, WifiOff, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const connectionStatuses = [
  {
    platform: 'Instagram',
    status: 'connected',
    lastSync: '2 minutes ago',
    nextSync: 'in 3 minutes',
    health: 'excellent',
  },
  {
    platform: 'Twitter',
    status: 'connected',
    lastSync: '5 minutes ago',
    nextSync: 'in 2 minutes',
    health: 'good',
  },
  {
    platform: 'Facebook',
    status: 'connected',
    lastSync: '1 hour ago',
    nextSync: 'in 59 minutes',
    health: 'warning',
  },
  {
    platform: 'LinkedIn',
    status: 'disconnected',
    lastSync: 'Never',
    nextSync: 'N/A',
    health: 'error',
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'connected':
      return <Wifi className="h-5 w-5 text-green-600" />;
    case 'disconnected':
      return <WifiOff className="h-5 w-5 text-red-600" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
  }
};

const getHealthColor = (health: string) => {
  switch (health) {
    case 'excellent':
      return 'text-green-600 bg-green-100';
    case 'good':
      return 'text-blue-600 bg-blue-100';
    case 'warning':
      return 'text-yellow-600 bg-yellow-100';
    case 'error':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export function ConnectionStatus() {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Status</h3>
      
      <div className="space-y-4">
        {connectionStatuses.map((item) => (
          <div key={item.platform} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getStatusIcon(item.status)}
                <h4 className="font-medium text-gray-900">{item.platform}</h4>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(item.health)}`}>
                {item.health}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Clock className="h-4 w-4" />
                  <span>Last Sync</span>
                </div>
                <p className="font-medium text-gray-900">{item.lastSync}</p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Clock className="h-4 w-4" />
                  <span>Next Sync</span>
                </div>
                <p className="font-medium text-gray-900">{item.nextSync}</p>
              </div>
            </div>
            
            {item.status === 'disconnected' && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Connection lost. Please reconnect.</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2 text-blue-700">
          <CheckCircle className="h-5 w-5" />
          <div>
            <p className="font-medium">Sync Status</p>
            <p className="text-sm">All connected platforms are syncing automatically every 5 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
