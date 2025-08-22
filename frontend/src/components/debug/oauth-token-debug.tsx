import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/lib/api';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Key,
  Clock,
  Database
} from 'lucide-react';

interface TokenExchangeResult {
  success: boolean;
  responseTime?: number;
  status?: number;
  hasAccessToken?: boolean;
  hasRefreshToken?: boolean;
  tokenType?: string;
  expiresIn?: number;
  scope?: string;
  error?: string;
  errorDescription?: string;
  fullResponse?: any;
}

export default function OAuthTokenDebug() {
  const [authorizationCode, setAuthorizationCode] = useState('');
  const [result, setResult] = useState<TokenExchangeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailedOAuthUrl, setDetailedOAuthUrl] = useState<string>('');

  const testTokenExchange = async () => {
    if (!authorizationCode.trim()) {
      alert('Please enter an authorization code');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.DEBUG_GOOGLE.replace('/auth/debug-google', `/auth/debug/manual-token-exchange/${authorizationCode}`));
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error testing token exchange:', error);
      setResult({
        success: false,
        error: 'Network error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const getDetailedOAuthUrl = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.DEBUG_GOOGLE.replace('/auth/debug-google', '/auth/debug/oauth-url-detailed'));
      const data = await response.json();
      if (data.success) {
        setDetailedOAuthUrl(data.url);
      }
    } catch (error) {
      console.error('Error getting detailed OAuth URL:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">OAuth Token Exchange Debug</h2>
        <div className="flex space-x-2">
          <Button onClick={getDetailedOAuthUrl} variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Get OAuth URL
          </Button>
        </div>
      </div>

      {/* OAuth URL Display */}
      {detailedOAuthUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ExternalLink className="h-5 w-5 mr-2" />
              Generated OAuth URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={detailedOAuthUrl}
                  readOnly
                  className="flex-1 text-sm font-mono bg-gray-100 p-2 rounded"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(detailedOAuthUrl)}
                >
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(detailedOAuthUrl, '_blank')}
                >
                  Open
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Use this URL to manually test the OAuth flow. After authorization, you'll get an authorization code to test below.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Token Exchange Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="h-5 w-5 mr-2" />
            Manual Token Exchange Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Authorization Code</label>
              <textarea
                placeholder="Paste the authorization code from OAuth flow here..."
                value={authorizationCode}
                onChange={(e) => setAuthorizationCode(e.target.value)}
                className="w-full h-20 p-2 border rounded text-sm font-mono mt-1"
              />
            </div>
            
            <Button
              onClick={testTokenExchange}
              disabled={loading || !authorizationCode.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing Token Exchange...
                </>
              ) : (
                'Test Token Exchange'
              )}
            </Button>

            {/* Results Display */}
            {result && (
              <div className={`p-4 rounded ${
                result.success ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <div className="flex items-center mb-3">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <span className="font-medium">
                    {result.success ? 'Token Exchange Successful' : 'Token Exchange Failed'}
                  </span>
                </div>

                {result.success && (
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Response Time:</span> {result.responseTime}ms
                      </div>
                      <div>
                        <span className="font-medium">Status:</span> {result.status}
                      </div>
                      <div>
                        <span className="font-medium">Access Token:</span> 
                        <span className={result.hasAccessToken ? 'text-green-600' : 'text-red-600'}>
                          {result.hasAccessToken ? ' ✅ Present' : ' ❌ Missing'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Refresh Token:</span> 
                        <span className={result.hasRefreshToken ? 'text-green-600' : 'text-red-600'}>
                          {result.hasRefreshToken ? ' ✅ Present' : ' ❌ Missing'}
                        </span>
                      </div>
                    </div>
                    
                    {result.tokenType && (
                      <div>
                        <span className="font-medium">Token Type:</span> {result.tokenType}
                      </div>
                    )}
                    
                    {result.expiresIn && (
                      <div>
                        <span className="font-medium">Expires In:</span> {result.expiresIn} seconds
                      </div>
                    )}
                    
                    {result.scope && (
                      <div>
                        <span className="font-medium">Scope:</span> {result.scope}
                      </div>
                    )}
                  </div>
                )}

                {!result.success && result.error && (
                  <div className="text-red-600">
                    <div className="font-medium">Error:</div>
                    <div>{result.error}</div>
                    {result.errorDescription && (
                      <div className="mt-1 text-sm">{result.errorDescription}</div>
                    )}
                  </div>
                )}

                {/* Full Response Details */}
                {result.fullResponse && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700">
                      View Full Response
                    </summary>
                    <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(result.fullResponse, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            How to Use This Debug Tool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">1.</span>
              <span>Click "Get OAuth URL" to generate the OAuth authorization URL</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">2.</span>
              <span>Open the generated URL in your browser to start OAuth flow</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">3.</span>
              <span>Complete the OAuth authorization (look for "Offline access" permission)</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">4.</span>
              <span>Copy the authorization code from the callback URL</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">5.</span>
              <span>Paste the code above and click "Test Token Exchange"</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">6.</span>
              <span>Review the results to see if refresh token was received</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 rounded">
            <div className="flex items-center text-yellow-800">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="font-medium">Important:</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              This tool helps identify whether the refresh token issue is in your OAuth configuration 
              or in Google Cloud Console settings. If no refresh token is received here, the issue 
              is with Google's OAuth consent screen configuration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
