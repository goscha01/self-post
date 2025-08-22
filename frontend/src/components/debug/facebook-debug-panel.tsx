import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { API_ENDPOINTS } from '@/lib/api';
import { 
  Facebook, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Settings,
  Database,
  Globe
} from 'lucide-react';

interface FacebookDebugInfo {
  success: boolean;
  appId: string;
  callbackUrl: string;
  environment: string;
  mockingEnabled: boolean;
  scopes: string[];
}

interface FacebookPagesDebug {
  success: boolean;
  pages?: any[];
  count?: number;
  error?: string;
  debug?: {
    email: string;
    timestamp: string;
    environment: string;
    mockingEnabled: boolean;
  };
}

export default function FacebookDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<FacebookDebugInfo | null>(null);
  const [pagesDebug, setPagesDebug] = useState<FacebookPagesDebug | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPages, setLoadingPages] = useState(false);
  const [email, setEmail] = useState('');

  const checkFacebookConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.DEBUG_FACEBOOK);
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Error checking Facebook config:', error);
      setDebugInfo({
        success: false,
        appId: 'Error',
        callbackUrl: 'Error',
        environment: 'Error',
        mockingEnabled: false,
        scopes: []
      });
    } finally {
      setLoading(false);
    }
  };

  const testFacebookPages = async () => {
    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }

    setLoadingPages(true);
    try {
      const response = await fetch(API_ENDPOINTS.DEBUG_FACEBOOK_PAGES(email));
      const data = await response.json();
      setPagesDebug(data);
    } catch (error) {
      console.error('Error testing Facebook pages:', error);
      setPagesDebug({
        success: false,
        error: 'Network error occurred'
      });
    } finally {
      setLoadingPages(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Facebook Integration Debug</h2>
        <div className="flex space-x-2">
          <Button onClick={checkFacebookConfig} disabled={loading} variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Check Config
          </Button>
        </div>
      </div>

      {/* Facebook Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Facebook className="h-5 w-5 mr-2 text-blue-600" />
            Facebook Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!debugInfo ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">Click "Check Config" to verify Facebook OAuth setup</p>
              <Button onClick={checkFacebookConfig} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Facebook Configuration'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">App ID:</span>
                  <span className={`ml-2 ${debugInfo.appId === 'Present' ? 'text-green-600' : 'text-red-600'}`}>
                    {debugInfo.appId}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Callback URL:</span>
                  <span className={`ml-2 ${debugInfo.callbackUrl === 'Missing' ? 'text-red-600' : 'text-green-600'}`}>
                    {debugInfo.callbackUrl}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Environment:</span>
                  <Badge variant={debugInfo.environment === 'development' ? 'secondary' : 'default'}>
                    {debugInfo.environment}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Mock Mode:</span>
                  <Badge variant={debugInfo.mockingEnabled ? 'secondary' : 'default'}>
                    {debugInfo.mockingEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="font-medium">OAuth Scopes:</span>
                <div className="mt-2 space-y-1">
                  {debugInfo.scopes.map((scope, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{scope}</code>
                    </div>
                  ))}
                </div>
              </div>

              {debugInfo.appId === 'Missing' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-800">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="font-medium">Configuration Issue</span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">
                    Facebook App ID is missing. Please set FACEBOOK_APP_ID in your environment variables.
                  </p>
                </div>
              )}

              {debugInfo.callbackUrl === 'Missing' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-800">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="font-medium">Configuration Issue</span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">
                    Facebook callback URL is missing. Please set FACEBOOK_CALLBACK_URL in your environment variables.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Facebook Pages Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Test Facebook Pages API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">User Email</label>
              <input
                type="email"
                placeholder="Enter email to test Facebook pages"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded mt-1"
              />
            </div>

            <Button
              onClick={testFacebookPages}
              disabled={loadingPages || !email.trim()}
              className="w-full"
            >
              {loadingPages ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing Facebook Pages...
                </>
              ) : (
                'Test Facebook Pages API'
              )}
            </Button>

            {/* Results Display */}
            {pagesDebug && (
              <div className={`p-4 rounded ${
                pagesDebug.success ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <div className="flex items-center mb-3">
                  {pagesDebug.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <span className="font-medium">
                    {pagesDebug.success ? 'Facebook Pages Test Successful' : 'Facebook Pages Test Failed'}
                  </span>
                </div>

                {pagesDebug.success && (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Pages Found:</span> {pagesDebug.count || 0}
                    </div>
                    {pagesDebug.debug && (
                      <div className="mt-3 p-2 bg-white rounded">
                        <div className="font-medium mb-2">Debug Info:</div>
                        <div>Email: {pagesDebug.debug.email}</div>
                        <div>Environment: {pagesDebug.debug.environment}</div>
                        <div>Mock Mode: {pagesDebug.debug.mockingEnabled ? 'Enabled' : 'Disabled'}</div>
                        <div>Timestamp: {pagesDebug.debug.timestamp}</div>
                      </div>
                    )}
                  </div>
                )}

                {!pagesDebug.success && pagesDebug.error && (
                  <div className="text-red-600">
                    <div className="font-medium">Error:</div>
                    <div>{pagesDebug.error}</div>
                  </div>
                )}

                {/* Pages List */}
                {pagesDebug.success && pagesDebug.pages && pagesDebug.pages.length > 0 && (
                  <div className="mt-4">
                    <div className="font-medium mb-2">Pages:</div>
                    <div className="space-y-2">
                      {pagesDebug.pages.map((page: any) => (
                        <div key={page.id} className="p-2 bg-white rounded border">
                          <div className="font-medium">{page.name}</div>
                          <div className="text-sm text-gray-600">
                            ID: {page.id} | Category: {page.category}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Development Mode Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Development Mode Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center text-blue-800">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="font-medium">Development Mode Active</span>
              </div>
              <p className="text-blue-700 mt-1">
                Facebook posting is currently in mock mode. All posts will be simulated and no actual content will be published to Facebook.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">What This Means:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Posts are simulated with mock IDs and timestamps</li>
                <li>No actual content is sent to Facebook</li>
                <li>Perfect for testing the integration flow</li>
                <li>Real posting will be enabled after Facebook app approval</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Next Steps for Production:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Submit Facebook app for advanced access review</li>
                <li>Provide privacy policy and terms of service</li>
                <li>Demonstrate app functionality to Facebook reviewers</li>
                <li>Set NODE_ENV=production to enable real posting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
