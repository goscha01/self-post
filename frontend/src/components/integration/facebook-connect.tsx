import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { API_ENDPOINTS } from '@/lib/api';
import { Facebook, ExternalLink, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface FacebookConnectProps {
  email: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export default function FacebookConnect({ email, onConnect, onDisconnect }: FacebookConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const [pages, setPages] = useState<any[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);

  // Check connection status on mount
  React.useEffect(() => {
    checkConnectionStatus();
  }, [email]);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CONNECTIONS(email));
      const data = await response.json();
      
      const facebookConnection = data.connections?.find((conn: any) => conn.platform === 'facebook');
      if (facebookConnection && facebookConnection.isActive) {
        setConnectionStatus('connected');
        loadFacebookPages();
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      setConnectionStatus('disconnected');
    }
  };

  const loadFacebookPages = async () => {
    if (connectionStatus !== 'connected') return;
    
    setLoadingPages(true);
    try {
      const response = await fetch(API_ENDPOINTS.FACEBOOK_PAGES(email));
      const data = await response.json();
      
      if (data.success) {
        setPages(data.pages || []);
      }
    } catch (error) {
      console.error('Error loading Facebook pages:', error);
    } finally {
      setLoadingPages(false);
    }
  };

  const connectFacebook = () => {
    setIsConnecting(true);
    // Redirect to Facebook OAuth
    window.location.href = API_ENDPOINTS.FACEBOOK_AUTH;
  };

  const disconnectFacebook = async () => {
    setIsDisconnecting(true);
    try {
      const response = await fetch(API_ENDPOINTS.DISCONNECT(email, 'facebook'), {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setConnectionStatus('disconnected');
        setPages([]);
        onDisconnect?.();
      }
    } catch (error) {
      console.error('Error disconnecting Facebook:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const refreshPages = () => {
    loadFacebookPages();
  };

  if (connectionStatus === 'loading') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Facebook className="h-5 w-5 mr-2 text-blue-600" />
            Facebook Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Checking connection status...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Facebook className="h-5 w-5 mr-2 text-blue-600" />
            Facebook Connection
          </div>
          <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'}>
            {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionStatus === 'disconnected' ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">
              Connect your Facebook account to manage business pages and schedule posts.
            </p>
            <Button 
              onClick={connectFacebook} 
              disabled={isConnecting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Facebook className="h-4 w-4 mr-2" />
                  Connect Facebook
                </>
              )}
            </Button>
            <div className="mt-3 text-xs text-gray-500">
              <p>• Manage business pages</p>
              <p>• Schedule and publish posts</p>
              <p>• View page insights and analytics</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Successfully connected to Facebook</span>
              </div>
              <Button 
                onClick={disconnectFacebook} 
                disabled={isDisconnecting}
                variant="outline"
                size="sm"
              >
                {isDisconnecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  'Disconnect'
                )}
              </Button>
            </div>

            {/* Facebook Pages */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Business Pages</h4>
                <Button 
                  onClick={refreshPages} 
                  disabled={loadingPages}
                  variant="outline"
                  size="sm"
                >
                  {loadingPages ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {loadingPages ? (
                <div className="text-center py-4">
                  <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Loading pages...</p>
                </div>
              ) : pages.length > 0 ? (
                <div className="space-y-2">
                  {pages.map((page) => (
                    <div key={page.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Facebook className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{page.name}</p>
                          <p className="text-sm text-gray-600">{page.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {page.fan_count && (
                          <p className="text-sm text-gray-600">{page.fan_count.toLocaleString()} followers</p>
                        )}
                        {page.verification_status && (
                          <Badge variant={page.verification_status === 'VERIFIED' ? 'default' : 'secondary'}>
                            {page.verification_status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No business pages found</p>
                  <p className="text-sm">Make sure you have admin access to Facebook business pages</p>
                </div>
              )}
            </div>

            {/* Development Mode Notice */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center text-yellow-800">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span className="font-medium">Development Mode</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Facebook posting is currently in mock mode. Real posting will be enabled once advanced access is approved.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
