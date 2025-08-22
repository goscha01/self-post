'use client';

import { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Globe, Star, Clock, MessageSquare, FileText, Loader2, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

interface BusinessAccount {
  name: string;
  accountName: string;
  type: string;
  role: string;
  verificationState: string;
  vettedState?: string;
}

interface BusinessLocation {
  name: string;
  title: string;
  address?: {
    formattedAddress: string;
  };
  phoneNumbers?: {
    primaryPhone: string;
  };
  websiteUri?: string;
  rating?: {
    averageRating: number;
    reviewCount: number;
  };
  businessHours?: any;
  serviceArea?: any;
  categories?: any[];
  labels?: any[];
  attributes?: any;
  regularHours?: any;
  specialHours?: any;
  openInfo?: any;
  metadata?: any;
  profile?: any;
  relationshipData?: any;
  moreHours?: any[];
  priceLists?: any[];
  services?: any[];
  latlng?: {
    latitude: number;
    longitude: number;
  };
  adWordsLocationExtensions?: any;
}

interface BusinessProfileData {
  account: BusinessAccount;
  locations: BusinessLocation[];
  reviews: any[];
  posts: any[];
  insights: any;
}

export function GoogleProfileCard() {
  const [businessAccounts, setBusinessAccounts] = useState<BusinessAccount[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingBusiness, setLoadingBusiness] = useState(false);

  useEffect(() => {
    // Ensure we have the correct email set
    const currentEmail = localStorage.getItem('userEmail');
    if (!currentEmail || currentEmail === 'demo@example.com') {
      console.log('⚠️ Fixing incorrect email in localStorage');
      localStorage.setItem('userEmail', 'spotlesshomestampa@gmail.com');
    }
    fetchBusinessAccounts();
  }, []);

  const fetchBusinessAccounts = async () => {
    try {
      setLoading(true);
      const userEmail = localStorage.getItem('userEmail') || 'spotlesshomestampa@gmail.com';
      console.log('🔍 Fetching business accounts for email:', userEmail);
      
      const response = await fetch(`http://localhost:3001/auth/business-accounts/${encodeURIComponent(userEmail)}`);
      console.log('📡 Business accounts API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Business accounts data received:', data);
        
        if (data.success) {
          setBusinessAccounts(data.accounts || []);
          setError(null);
          console.log('✅ Business accounts loaded successfully');
        } else {
          const errorMessage = data.error || 'Failed to fetch business accounts';
          console.log('❌ Business accounts fetch failed:', data.error);
          
          // Check if it's a token-related error that requires reconnection
          if (errorMessage.includes('refresh token') || errorMessage.includes('reconnect')) {
            setError(`${errorMessage}\n\nPlease reconnect your Google account to enable business profile access.`);
          } else {
            setError(errorMessage);
          }
        }
      } else {
        setError('Failed to fetch business accounts');
        console.log('❌ Business accounts API failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error fetching business accounts:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchBusinessProfile = async (accountName: string) => {
    setLoadingBusiness(true);
    setSelectedBusiness(null);
    try {
      const userEmail = localStorage.getItem('userEmail') || 'spotlesshomestampa@gmail.com';
      console.log('🔍 Fetching business profile for account:', accountName);
      
      const response = await fetch(`http://localhost:3001/auth/business-profile/${encodeURIComponent(userEmail)}/${encodeURIComponent(accountName)}`);
      console.log('📡 Business profile API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Business profile data received:', data);
        
        if (data.success) {
          setSelectedBusiness(data.data);
          console.log('✅ Business profile loaded successfully');
        } else {
          console.error('❌ Failed to fetch business profile:', data.error);
          setError(`Failed to fetch business profile: ${data.error}`);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Business profile API failed:', response.status, errorText);
        setError(`Business profile API failed: ${response.status} - ${errorText}`);
      }
    } catch (error: any) {
      console.error('❌ Error fetching business profile:', error);
      setError(`Network error: ${error.message || 'Unknown error'}`);
    } finally {
      setLoadingBusiness(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBusinessAccounts();
  };

  const handleForceFreshConsent = async () => {
    try {
      setError('Clearing OAuth state...');
      const userEmail = localStorage.getItem('userEmail') || 'spotlesshomestampa@gmail.com';
      
      const response = await fetch(`http://localhost:3001/auth/force-fresh-consent/${encodeURIComponent(userEmail)}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setError('OAuth state cleared! Please reconnect your Google account.');
          // Clear local state
          setBusinessAccounts([]);
          setSelectedBusiness(null);
        } else {
          setError(`Failed to clear OAuth state: ${data.error}`);
        }
      } else {
        setError('Failed to clear OAuth state');
      }
    } catch (error: any) {
      setError(`Error: ${error.message || 'Unknown error'}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDayName = (dayNumber: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Google Business Profile</h3>
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-300 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Google Business Profile</h3>
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <div className="text-gray-600 mb-4">
            {error.split('\n').map((line, index) => (
              <p key={index} className={index === 0 ? 'font-medium' : 'text-sm'}>
                {line}
              </p>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchBusinessAccounts}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Retry
            </button>
            {error.includes('reconnect') && (
              <div className="flex gap-2">
                <a
                  href="/integration"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Reconnect Google
                </a>
                <button
                  onClick={handleForceFreshConsent}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                >
                  Force Fresh Consent
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Google Business Profile</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <a
            href="/integration"
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-700 font-medium text-sm transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Manage</span>
          </a>
        </div>
      </div>

      {/* Business Accounts Section */}
      {businessAccounts.length > 0 ? (
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Business Accounts ({businessAccounts.length})</h4>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-3">
              You have access to {businessAccounts.length} business account(s). Select one to view detailed information.
            </p>
            
            <div className="space-y-3">
              {businessAccounts.map((account, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{account.accountName}</h5>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>Type: {account.type}</span>
                        <span>Role: {account.role}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          account.verificationState === 'VERIFIED' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {account.verificationState}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => fetchBusinessProfile(account.name)}
                      disabled={loadingBusiness}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {loadingBusiness ? 'Loading...' : 'View Profile'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 rounded-lg p-4 mb-6">
          <div className="text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
            <p className="text-sm text-gray-700 mb-2">No business accounts found</p>
            <p className="text-xs text-gray-600 mb-3">
              This account doesn't have access to Google Business Profile. 
              You need to be added as a manager or owner of a business account.
            </p>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>To get started:</strong> Create a Google Business Profile or ask to be added as a manager to an existing business account.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Business Profile Information */}
      {selectedBusiness && (
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Business Profile: {selectedBusiness.account.accountName}
          </h4>
          
          {/* Account Overview */}
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-lg font-semibold text-gray-900">{selectedBusiness.account.accountName}</h5>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedBusiness.account.verificationState === 'VERIFIED' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedBusiness.account.verificationState}
                </span>
                <span className="text-sm text-gray-500">{selectedBusiness.account.type}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Role:</span> {selectedBusiness.account.role}
              </div>
              <div>
                <span className="font-medium">Locations:</span> {selectedBusiness.locations.length}
              </div>
            </div>
          </div>

          {/* Business Locations */}
          {selectedBusiness.locations.map((location, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-lg font-semibold text-gray-900">{location.title}</h5>
                {location.rating && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-700">{location.rating.averageRating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({location.rating.reviewCount} reviews)</span>
                  </div>
                )}
              </div>
              
              {/* Location Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {location.address && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{location.address.formattedAddress}</span>
                  </div>
                )}
                
                {location.phoneNumbers?.primaryPhone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{location.phoneNumbers.primaryPhone}</span>
                  </div>
                )}
                
                {location.websiteUri && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <a href={location.websiteUri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {location.websiteUri}
                    </a>
                  </div>
                )}
              </div>

              {/* Business Hours */}
              {location.regularHours && (
                <div className="bg-orange-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-medium text-orange-600 uppercase tracking-wide">Business Hours</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    {location.regularHours.periods?.map((period: any, periodIndex: number) => (
                      <div key={periodIndex} className="flex justify-between">
                        <span className="text-gray-700">
                          {getDayName(period.open?.day)}
                        </span>
                        <span className="text-gray-600">
                          {period.open?.time} - {period.close?.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Categories */}
              {location.categories && location.categories.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-3 mb-4">
                  <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-2">Business Categories</div>
                  <div className="flex flex-wrap gap-2">
                    {location.categories.map((category: any, catIndex: number) => (
                      <span key={catIndex} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        {category.displayName || category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Services */}
              {location.services && location.services.length > 0 && (
                <div className="bg-teal-50 rounded-lg p-3 mb-4">
                  <div className="text-xs font-medium text-teal-600 uppercase tracking-wide mb-2">Services</div>
                  <div className="space-y-2">
                    {location.services.map((service: any, serviceIndex: number) => (
                      <div key={serviceIndex} className="text-sm border-l-2 border-teal-200 pl-3">
                        <div className="font-medium text-gray-900">{service.displayName || service.name}</div>
                        {service.description && (
                          <div className="text-gray-600 text-xs">{service.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Business Insights */}
          {selectedBusiness.insights && (
            <div className="bg-violet-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-violet-600 uppercase tracking-wide mb-3">Business Insights</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet-600">{selectedBusiness.insights.totalLocations}</div>
                  <div className="text-gray-600">Locations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet-600">{selectedBusiness.insights.totalPosts}</div>
                  <div className="text-gray-600">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet-600">{selectedBusiness.insights.totalReviews}</div>
                  <div className="text-gray-600">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet-600">{selectedBusiness.insights.averageRating.toFixed(1)}</div>
                  <div className="text-gray-600">Avg Rating</div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Posts */}
          {selectedBusiness.posts && selectedBusiness.posts.length > 0 && (
            <div className="bg-pink-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="h-4 w-4 text-pink-500" />
                <span className="text-xs font-medium text-pink-600 uppercase tracking-wide">Recent Posts ({selectedBusiness.posts.length})</span>
              </div>
              <div className="space-y-3">
                {selectedBusiness.posts.slice(0, 3).map((post: any, postIndex: number) => (
                  <div key={postIndex} className="bg-white rounded-lg p-3 border border-pink-200">
                    <div className="font-medium text-gray-900 mb-1">{post.summary}</div>
                    <div className="text-gray-600 text-xs mb-2">
                      {post.createTime && formatDate(post.createTime)}
                    </div>
                    {post.locationTitle && (
                      <div className="text-xs text-gray-500">
                        Location: {post.locationTitle}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Reviews */}
          {selectedBusiness.reviews && selectedBusiness.reviews.length > 0 && (
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Recent Reviews ({selectedBusiness.reviews.length})</span>
              </div>
              <div className="space-y-3">
                {selectedBusiness.reviews.slice(0, 3).map((review: any, reviewIndex: number) => (
                  <div key={reviewIndex} className="bg-white rounded-lg p-3 border border-emerald-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < review.starRating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-gray-600 text-xs">
                        {review.createTime && formatDate(review.createTime)}
                      </span>
                    </div>
                    <div className="text-gray-700 text-sm mb-2">{review.comment}</div>
                    {review.locationTitle && (
                      <div className="text-xs text-gray-500">
                        Location: {review.locationTitle}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Debug Information - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="border-t border-gray-200 pt-4">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700">
              Debug: Business Accounts Data
            </summary>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <pre className="text-xs text-gray-600 overflow-y-auto max-h-40">
                {JSON.stringify({ businessAccounts, selectedBusiness }, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
