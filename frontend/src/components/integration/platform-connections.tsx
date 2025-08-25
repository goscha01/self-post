'use client';

import { useState, useEffect } from 'react';
import { Instagram, Twitter, Facebook, Linkedin, Youtube, ExternalLink, CheckCircle, Globe, AlertTriangle } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api';

const platforms = [
  {
    id: 'google',
    name: 'Google My Business',
    icon: Globe,
    description: 'Connect your Google My Business account',
    color: 'bg-gradient-to-r from-blue-500 to-green-500',
    profileName: null,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    description: 'Connect your Instagram Business account',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    profileName: '@mybrand',
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    description: 'Connect your Twitter account',
    color: 'bg-blue-400',
    profileName: '@mybrand',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    description: 'Connect your Facebook Page',
    color: 'bg-blue-600',
    profileName: 'My Brand Page',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    description: 'Connect your LinkedIn Company page',
    color: 'bg-blue-700',
    profileName: null,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    description: 'Connect your YouTube channel',
    color: 'bg-red-600',
    profileName: null,
  },
];

export function PlatformConnections() {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check connection status on component mount
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail') || 'spotlesshomestampa@gmail.com';
    console.log('🔍 Platform connections - using email:', userEmail);
    console.log('🔍 localStorage userEmail:', localStorage.getItem('userEmail'));
    checkConnectionStatus(userEmail);
  }, []);

  const checkConnectionStatus = async (email: string) => {
    try {
      console.log('🔍 Checking connection status for email:', email);
      const response = await fetch(API_ENDPOINTS.CONNECTIONS(email));
      console.log('📡 Connection API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Connection data received:', data);
        
        const statusMap: {[key: string]: boolean} = {};
        
        if (data.connections && data.connections.length > 0) {
          data.connections.forEach((conn: { platform: string; isActive: boolean; profileData?: { displayName?: string } }) => {
            statusMap[conn.platform] = conn.isActive;
            console.log(`🔗 Platform ${conn.platform}: ${conn.isActive ? 'Connected' : 'Disconnected'}`);
            // Store profile data for display
            if (conn.profileData && conn.profileData.displayName) {
              localStorage.setItem(`profile_${conn.platform}`, conn.profileData.displayName);
            }
          });
        } else {
          console.log('📭 No connections found');
        }
        
        setConnectionStatus(statusMap);
        console.log('✅ Connection status updated:', statusMap);
      } else {
        console.error('❌ Connection API failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error checking connection status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    
    if (platformId === 'google') {
      // Use the OAuth authorization endpoint
      try {
        console.log('🔍 Getting OAuth authorization URL...');
        const response = await fetch('http://localhost:3001/auth/oauth/authorize');
        
        if (response.ok) {
          const data = await response.json();
          // Use the first scope option (Basic Business) - EXACTLY what worked
          const authUrl = data.scopeOptions[0].authUrl;
          console.log('🔗 Redirecting to Google OAuth:', authUrl);
          window.location.href = authUrl;
        } else {
          console.error('❌ Failed to get OAuth authorization URL');
          setConnecting(null);
        }
      } catch (error) {
        console.error('❌ Error getting OAuth authorization URL:', error);
        setConnecting(null);
      }
    } else {
      // Simulate connection process for other platforms
      setTimeout(() => {
        setConnecting(null);
        console.log(`Connecting to ${platformId}...`);
      }, 2000);
    }
  };

  // Refresh connection status after successful OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const platform = urlParams.get('platform');
    const error = urlParams.get('error');
    
    if (success === 'true' && platform === 'google') {
      // OAuth was successful, refresh connection status
      console.log('✅ OAuth successful, refreshing connection status...');
      setTimeout(() => {
        const userEmail = localStorage.getItem('userEmail') || 'spotlesshomestampa@gmail.com';
        checkConnectionStatus(userEmail);
        setLoading(false);
        setConnecting(null);
      }, 1000);
    } else if (error && platform === 'google') {
      // OAuth failed, show error and clear connecting state
      console.error('❌ OAuth failed:', error);
      setConnecting(null);
      setError(`OAuth connection failed: ${error}`);
    }
  }, []);

  const handleDisconnect = async (platformId: string) => {
    try {
      const userEmail = localStorage.getItem('userEmail') || 'spotlesshomestampa@gmail.com';
      console.log(`🔌 Disconnecting from ${platformId} for user: ${userEmail}`);
      
              const response = await fetch(API_ENDPOINTS.DISCONNECT(userEmail, platformId), {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Disconnect response:', data);
        
        if (data.success) {
          // Update local state to reflect disconnection
          setConnectionStatus(prev => ({
            ...prev,
            [platformId]: false
          }));
          
          // Remove stored profile data
          localStorage.removeItem(`profile_${platformId}`);
          
          console.log(`✅ Successfully disconnected from ${platformId}`);
        } else {
          console.error('❌ Disconnect failed:', data.error);
        }
      } else {
        console.error('❌ Disconnect API failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error(`❌ Error disconnecting from ${platformId}:`, error);
    }
  };

  const handleForceFreshConnection = async (platformId: string) => {
    if (platformId === 'google') {
      try {
        const userEmail = localStorage.getItem('userEmail') || 'spotlesshomestampa@gmail.com';
        console.log(`🔌 Forcing fresh connection for Google for user: ${userEmail}`);
        
        // Disconnect the current connection first
        await handleDisconnect(platformId);
        
        // Use the OAuth authorization endpoint
        setConnecting(platformId);
        console.log('🔍 Getting OAuth authorization URL for fresh connection...');
        const response = await fetch('http://localhost:3001/auth/oauth/authorize');
        
        if (response.ok) {
          const data = await response.json();
          const authUrl = data.scopeOptions[0].authUrl;
          console.log('🔗 Redirecting to working Google OAuth URL for fresh connection:', authUrl);
          window.location.href = authUrl;
        } else {
          console.error('❌ Failed to get working OAuth URL for fresh connection');
          setConnecting(null);
        }
      } catch (error) {
        console.error('❌ Error forcing fresh connection:', error);
        setConnecting(null);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Connections</h3>
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-red-700 font-medium">Connection Error</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="space-y-4">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isConnected = connectionStatus[platform.id] || false;
          
          return (
            <div key={platform.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${platform.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{platform.name}</h4>
                    <p className="text-sm text-gray-600">{platform.description}</p>
                    {isConnected && (
                      <p className="text-sm text-blue-600 font-medium">
                        {localStorage.getItem(`profile_${platform.id}`) || 'Connected'}
                      </p>
                    )}
                    {platform.id === 'google' && isConnected && (
                      <div className="text-xs text-amber-600 mt-1 space-y-1">
                        <p>⚠️ If you see "No refresh token" errors:</p>
                        <p>• <strong>Reconnect:</strong> Try to refresh the current connection</p>
                        <p>• <strong>Force Fresh:</strong> Complete disconnection + fresh OAuth (recommended)</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <>
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleConnect(platform.id)}
                          disabled={connecting === platform.id}
                          className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                        >
                          {connecting === platform.id ? 'Reconnecting...' : 'Reconnect'}
                        </button>
                        {platform.id === 'google' && (
                          <button
                            onClick={() => handleForceFreshConnection(platform.id)}
                            disabled={connecting === platform.id}
                            className="px-3 py-1 text-sm text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
                          >
                            Force Fresh
                          </button>
                        )}
                        <button
                          onClick={() => handleDisconnect(platform.id)}
                          className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Disconnect
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(platform.id)}
                      disabled={connecting === platform.id || loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {connecting === platform.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
