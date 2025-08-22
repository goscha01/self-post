import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { API_ENDPOINTS } from '@/lib/api';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, ExternalLink, Settings } from 'lucide-react';

interface OAuthDebugInfo {
  timestamp: string;
  requestId: string;
  oauthConfig: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
    scopes: string[];
    accessType: string;
    prompt: string;
  };
  environment: {
    nodeEnv: string;
    googleClientId: string;
    googleClientSecret: string;
    googleCallbackUrl: string;
    googleApiKey: string;
  };
  generatedUrls: {
    authorizationUrl: string;
    tokenUrl: string;
  };
  validation: {
    hasClientId: boolean;
    hasClientSecret: boolean;
    hasCallbackUrl: boolean;
    hasApiKey: boolean;
    callbackUrlMatch: boolean;
  };
  recommendations: string[];
}

interface TokenRefreshTest {
  success: boolean;
  message: string;
  details?: any;
}

interface EnvironmentValidation {
  isValid: boolean;
  issues: string[];
  warnings: string[];
}

export default function OAuthDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<OAuthDebugInfo | null>(null);
  const [tokenRefreshTest, setTokenRefreshTest] = useState<TokenRefreshTest | null>(null);
  const [environmentValidation, setEnvironmentValidation] = useState<EnvironmentValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'testing' | 'validation'>('overview');

  const fetchDebugInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.DEBUG_GOOGLE);
      const data = await response.json();
      if (data.success) {
        setDebugInfo(data.debugInfo);
      }
    } catch (error) {
      console.error('Error fetching debug info:', error);
    } finally {
      setLoading(false);
    }
  };

  const testTokenRefresh = async (refreshToken: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.TEST_TOKEN_REFRESH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      const data = await response.json();
      if (data.success) {
        setTokenRefreshTest(data.result);
      }
    } catch (error) {
      console.error('Error testing token refresh:', error);
    }
  };

  const validateEnvironment = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.VALIDATE_ENVIRONMENT);
      const data = await response.json();
      if (data.success) {
        setEnvironmentValidation(data.validation);
      }
    } catch (error) {
      console.error('Error validating environment:', error);
    }
  };

  useEffect(() => {
    fetchDebugInfo();
    validateEnvironment();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading OAuth debug information...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">OAuth Debug Panel</h2>
        <div className="flex space-x-2">
          <Button onClick={fetchDebugInfo} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={validateEnvironment} variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Validate Env
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'overview'
              ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('testing')}
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'testing'
              ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Testing
        </button>
        <button
          onClick={() => setActiveTab('validation')}
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'validation'
              ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Environment
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && debugInfo && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                OAuth Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Client ID</label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {debugInfo.oauthConfig.clientId === 'NOT_SET' ? 'Not Set' : 'Configured'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Client Secret</label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {debugInfo.oauthConfig.clientSecret === 'NOT_SET' ? 'Not Set' : 'Configured'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Callback URL</label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {debugInfo.oauthConfig.callbackUrl}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Access Type</label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {debugInfo.oauthConfig.accessType}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Scopes</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {debugInfo.oauthConfig.scopes.map((scope, index) => (
                    <Badge key={index} variant="secondary">
                      {scope}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Authorization URL</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="text"
                    value={debugInfo.generatedUrls.authorizationUrl}
                    readOnly
                    className="flex-1 text-sm font-mono bg-gray-100 p-2 rounded"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(debugInfo.generatedUrls.authorizationUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Validation & Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {debugInfo.validation.hasClientId ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Client ID is configured
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircle className="h-4 w-4 mr-2" />
                    Client ID is missing
                  </div>
                )}

                {debugInfo.validation.hasClientSecret ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Client Secret is configured
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircle className="h-4 w-4 mr-2" />
                    Client Secret is missing
                  </div>
                )}

                {debugInfo.validation.hasCallbackUrl ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Callback URL is configured
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircle className="h-4 w-4 mr-2" />
                    Callback URL is missing
                  </div>
                )}

                {debugInfo.validation.callbackUrlMatch ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Callback URL format is valid
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircle className="h-4 w-4 mr-2" />
                    Callback URL format is invalid
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {debugInfo.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Testing Tab */}
      {activeTab === 'testing' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Token Refresh Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Refresh Token</label>
                  <textarea
                    placeholder="Paste refresh token here to test..."
                    className="w-full h-20 p-2 border rounded text-sm font-mono"
                    onChange={(e) => {
                      // Store for testing
                      localStorage.setItem('testRefreshToken', e.target.value);
                    }}
                  />
                </div>
                <Button
                  onClick={() => {
                    const token = localStorage.getItem('testRefreshToken');
                    if (token) {
                      testTokenRefresh(token);
                    }
                  }}
                  className="w-full"
                >
                  Test Token Refresh
                </Button>

                {tokenRefreshTest && (
                  <div className={`p-4 rounded ${
                    tokenRefreshTest.success ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <div className="flex items-center">
                      {tokenRefreshTest.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mr-2" />
                      )}
                      <span className="font-medium">
                        {tokenRefreshTest.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <p className="text-sm mt-2">{tokenRefreshTest.message}</p>
                    {tokenRefreshTest.details && (
                      <pre className="text-xs mt-2 bg-white p-2 rounded overflow-auto">
                        {JSON.stringify(tokenRefreshTest.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Environment Tab */}
      {activeTab === 'validation' && environmentValidation && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {environmentValidation.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                )}
                Environment Validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`p-4 rounded ${
                  environmentValidation.isValid ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <div className="flex items-center">
                    {environmentValidation.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <span className="font-medium">
                      {environmentValidation.isValid ? 'Environment is valid' : 'Environment has issues'}
                    </span>
                  </div>
                </div>

                {environmentValidation.issues.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">Issues:</h4>
                    <ul className="space-y-1">
                      {environmentValidation.issues.map((issue, index) => (
                        <li key={index} className="flex items-start text-red-600">
                          <span className="mr-2">•</span>
                          <span className="text-sm">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {environmentValidation.warnings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-yellow-700 mb-2">Warnings:</h4>
                    <ul className="space-y-1">
                      {environmentValidation.warnings.map((warning, index) => (
                        <li key={index} className="flex items-start text-yellow-600">
                          <span className="mr-2">•</span>
                          <span className="text-sm">{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
