import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SocialProfile } from '../entities/social-profile.entity';

export interface BusinessAccount {
  name: string;
  accountName: string;
  type: string;
  role: string;
  verificationState: string;
  vettedState?: string;
}

export interface BusinessLocation {
  name: string;
  title: string;
  address?: {
    formattedAddress: string;
  };
  phoneNumbers?: {
    primaryPhone: string;
  };
  websiteUri?: string;
  rating?: number;
  reviewCount?: number;
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
  parsedHours?: string;
  parsedServiceArea?: string;
  profileImageUri?: string;
}

export interface BusinessProfileData {
  account: BusinessAccount;
  locations: BusinessLocation[];
  reviews: any[];
  posts: any[];
  insights: any;
}

@Injectable()
export class BusinessProfileService {
  private readonly logger = new Logger(BusinessProfileService.name);

  constructor(
    @InjectRepository(SocialProfile)
    private socialProfileRepository: Repository<SocialProfile>,
    private configService: ConfigService,
  ) {}

  /**
   * Get all business accounts the user has access to manage
   */
  async getBusinessAccounts(email: string): Promise<BusinessAccount[]> {
    try {
      const googleProfile = await this.getActiveGoogleProfile(email);
      if (!googleProfile) {
        throw new Error('No active Google Business Profile connection found. Please reconnect your Google account.');
      }

      // Check if we have a refresh token
      if (!googleProfile.refreshToken) {
        this.logger.error('❌ No refresh token available for user:', email);
        throw new Error('No refresh token available. Please reconnect your Google account to enable offline access.');
      }

      // Get fresh access token using refresh token
      const accessToken = await this.refreshAccessToken(googleProfile.refreshToken);
      
      const response = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Failed to fetch business accounts: ${response.status} - ${errorText}`);
        throw new Error(`Failed to fetch business accounts: ${response.status}. Please reconnect your Google account.`);
      }

      const data = await response.json();
      this.logger.log(`✅ Fetched ${data.accounts?.length || 0} business accounts`);

      return data.accounts || [];
    } catch (error: any) {
      this.logger.error('❌ Error fetching business accounts:', error);
      throw error;
    }
  }

  /**
   * Test all API capabilities for the authenticated user
   */
  async testApiCapabilities(email: string): Promise<any> {
    try {
      this.logger.log('🧪 Testing API capabilities for user:', email);
      
      const googleProfile = await this.getActiveGoogleProfile(email);
      if (!googleProfile?.refreshToken) {
        return { error: 'No refresh token available' };
      }

      const accessToken = await this.refreshAccessToken(googleProfile.refreshToken);
      const capabilities: {
        accountAccess: boolean;
        locationAccess: boolean;
        reviewAccess: boolean;
        postAccess: boolean;
        createPostAccess: boolean;
        accounts: any[];
        locations: any[];
        errors: string[];
        warnings: string[];
      } = {
        accountAccess: false,
        locationAccess: false,
        reviewAccess: false,
        postAccess: false,
        createPostAccess: false,
        accounts: [],
        locations: [],
        errors: [],
        warnings: []
      };

      try {
        // Test account access
        this.logger.log('🔍 Testing account access...');
        const accountsResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json();
          capabilities.accountAccess = true;
          capabilities.accounts = accountsData.accounts || [];
          this.logger.log(`✅ Account access: ${capabilities.accounts.length} accounts found`);
          
          // Test location access for first account
          if (capabilities.accounts.length > 0) {
            const firstAccount = capabilities.accounts[0];
            this.logger.log(`🔍 Testing location access for account: ${firstAccount.accountName}`);
            
            try {
              const locationsResponse = await fetch(`https://mybusinessaccountmanagement.googleapis.com/v1/${firstAccount.name}/locations?readMask=name,title`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
              });
              
              if (locationsResponse.ok) {
                const locationsData = await locationsResponse.json();
                capabilities.locationAccess = true;
                capabilities.locations = locationsData.locations || [];
                this.logger.log(`✅ Location access: ${capabilities.locations.length} locations found`);
                
                // Test review access for first location
                if (capabilities.locations.length > 0) {
                  try {
                    const reviewResponse = await fetch(`https://mybusinessaccountmanagement.googleapis.com/v1/${capabilities.locations[0].name}/reviews`, {
                      headers: { 'Authorization': `Bearer ${accessToken}` }
                    });
                    
                    if (reviewResponse.ok) {
                      capabilities.reviewAccess = true;
                      this.logger.log('✅ Review access: Available');
                    } else {
                      const errorText = await reviewResponse.text();
                      capabilities.warnings.push(`Review access: ${reviewResponse.status} - ${errorText}`);
                      this.logger.warn(`⚠️ Review access: ${reviewResponse.status} - ${errorText}`);
                    }
                  } catch (error) {
                    capabilities.warnings.push(`Review access test failed: ${error.message}`);
                    this.logger.warn(`⚠️ Review access test failed: ${error.message}`);
                  }
                }
              } else {
                const errorText = await locationsResponse.text();
                capabilities.errors.push(`Location access failed: ${locationsResponse.status} - ${errorText}`);
                this.logger.error(`❌ Location access failed: ${locationsResponse.status} - ${errorText}`);
              }
            } catch (error) {
              capabilities.errors.push(`Location access test failed: ${error.message}`);
              this.logger.error(`❌ Location access test failed: ${error.message}`);
            }
          }
        } else {
          const errorText = await accountsResponse.text();
          capabilities.errors.push(`Account access failed: ${accountsResponse.status} - ${errorText}`);
          this.logger.error(`❌ Account access failed: ${accountsResponse.status} - ${errorText}`);
        }
      } catch (error) {
        capabilities.errors.push(`API test failed: ${error.message}`);
        this.logger.error(`❌ API test failed: ${error.message}`);
      }

      return capabilities;
    } catch (error) {
      this.logger.error('❌ Error testing API capabilities:', error);
      return { error: error.message };
    }
  }

  /**
   * Get comprehensive business profile data for a specific account
   */
  async getBusinessProfileData(email: string, accountName: string): Promise<BusinessProfileData> {
    try {
      this.logger.log(`🔍 Fetching business profile data for: ${email} - Account: ${accountName}`);
      
      const googleProfile = await this.getActiveGoogleProfile(email);
      if (!googleProfile) {
        throw new Error('No active Google Business Profile connection found');
      }

      if (!googleProfile.refreshToken) {
        throw new Error('No refresh token available');
      }

      const accessToken = await this.refreshAccessToken(googleProfile.refreshToken);

      // Use dynamic discovery instead of hardcoded account
      const { accounts, locations } = await this.discoverBusinessAccess(accessToken);
      
      // Find the specific account or use the first available
      const targetAccount = accounts.find(acc => acc.name === accountName) || accounts[0];
      if (!targetAccount) {
        throw new Error('No accessible business accounts found');
      }

      // Get locations for the target account specifically
      const accountLocations = await this.getAccountLocations(targetAccount.name, accessToken);
      
      // Enhance locations with profile, rating, and reviewCount data
      const enhancedLocations = await Promise.all(
        accountLocations.map(async (location) => {
          try {
            const detailedLocation = await this.getLocationDetailsWithProfile(location.name, email);
            return {
              ...location,
              profile: detailedLocation.profile,
              rating: detailedLocation.rating,
              reviewCount: detailedLocation.reviewCount,
              profileImageUri: detailedLocation.profileImageUri
            };
          } catch (error) {
            this.logger.warn(`⚠️ Could not fetch detailed location data for ${location.name}:`, error);
            return location; // Return basic location data if detailed fetch fails
          }
        })
      );
      
      const reviews = await this.getBusinessReviews(enhancedLocations, accessToken);
      const posts = await this.getBusinessPosts(enhancedLocations, accessToken);
      const insights = await this.getBusinessInsights(enhancedLocations, accessToken);

      return {
        account: targetAccount,
        locations: enhancedLocations,
        reviews,
        posts,
        insights
      };
    } catch (error) {
      this.logger.error('❌ Error fetching business profile data:', error);
      throw error;
    }
  }

  /**
   * Discover business access and available accounts/locations with detailed capability testing
   */
  private async discoverBusinessAccess(accessToken: string): Promise<{
    accounts: BusinessAccount[],
    locations: BusinessLocation[]
  }> {
    try {
      this.logger.log('🔍 Discovering business access with capability testing...');
      
      // Step 1: Get all accounts this user can access
      const accountsResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!accountsResponse.ok) {
        const errorText = await accountsResponse.text();
        this.logger.error(`❌ Account discovery failed: ${accountsResponse.status} - ${errorText}`);
        throw new Error(`Account discovery failed: ${accountsResponse.status} - ${errorText}`);
      }

      const accountsData = await accountsResponse.json();
      const accounts = (accountsData.accounts || []) as BusinessAccount[];
      this.logger.log(`✅ Discovered ${accounts.length} business accounts`);
      
      // Step 2: Test capabilities for each account
      const allLocations: BusinessLocation[] = [];
      
      for (const account of accounts) {
        this.logger.log(`🔍 Testing capabilities for account: ${(account as any).accountName} (${(account as any).type})`);
        this.logger.log(`   - Verification State: ${(account as any).verificationState}`);
        this.logger.log(`   - Vetted State: ${(account as any).vettedState || 'N/A'}`);
        
        try {
          // Test location access
          this.logger.log(`   - Testing location access...`);
          const locations = await this.getAccountLocations((account as any).name, accessToken);
          allLocations.push(...locations);
          this.logger.log(`   ✅ Location access: ${locations.length} locations found`);
          
          // Test review access for first location (if any)
          if (locations.length > 0) {
            try {
              this.logger.log(`   - Testing review access for location: ${locations[0].name}`);
              const reviewResponse = await fetch(`https://mybusinessaccountmanagement.googleapis.com/v1/${locations[0].name}/reviews`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
              });
              if (reviewResponse.ok) {
                this.logger.log(`   ✅ Review access: Available`);
              } else {
                this.logger.log(`   ⚠️ Review access: ${reviewResponse.status} - ${await reviewResponse.text()}`);
              }
            } catch (error) {
              this.logger.log(`   ❌ Review access test failed: ${error.message}`);
            }
          }
          
        } catch (error) {
          this.logger.error(`❌ Could not access locations for account ${(account as any).name}: ${error.message}`);
          this.logger.error(`   - Account type: ${(account as any).type}`);
          this.logger.error(`   - Verification: ${(account as any).verificationState}`);
          this.logger.error(`   - This suggests limited API access for personal/unverified accounts`);
        }
      }

      return { accounts, locations: allLocations };
    } catch (error) {
      this.logger.error('❌ Error discovering business access:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific business location
   */
  async getLocationDetails(locationName: string, email: string): Promise<BusinessLocation> {
    try {
      const googleProfile = await this.getActiveGoogleProfile(email);
      if (!googleProfile) {
        throw new Error('No active Google Business Profile connection found');
      }

      const accessToken = await this.refreshAccessToken(googleProfile.refreshToken);

      const response = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${locationName}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch location details: ${response.status} - ${errorText}`);
      }

      const locationData = await response.json();
      this.logger.log(`✅ Fetched location details for: ${locationData.title || locationName}`);

      return locationData;
    } catch (error) {
      this.logger.error('❌ Error fetching location details:', error);
      throw error;
    }
  }

      /**
   * Test different posting endpoints to see which ones work
   */
  async testPostsEndpoints(locationName: string, accessToken: string) {
    this.logger.log('🧪 Testing different posting endpoints...');
    
    // Extract account ID from location name if possible
    const accountMatch = locationName.match(/accounts\/([^\/]+)\/locations\/([^\/]+)/);
    const accountId = accountMatch ? accountMatch[1] : '109194636448236279020'; // Fallback to your account ID
    
    const endpoints = [
      `https://mybusinessaccountmanagement.googleapis.com/v1/${locationName}/localPosts`,
      `https://mybusinessbusinessinformation.googleapis.com/v1/${locationName}/localPosts`,
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationName.split('/').pop()}/localPosts`
    ];

    const results: Array<{
      endpoint: string;
      status: number | string;
      statusText: string;
      accessible: boolean;
      data: any;
    }> = [];

    for (const endpoint of endpoints) {
      try {
        this.logger.log(`🔍 Testing endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'GET', // Use GET to test access without creating posts
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        const result = {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          accessible: response.ok,
          data: null
        };
        
        if (response.ok) {
          try {
            const data = await response.json();
            result.data = data;
            this.logger.log(`✅ ${endpoint}: ${response.status} - Accessible`);
          } catch (parseError) {
            this.logger.log(`⚠️ ${endpoint}: ${response.status} - Accessible but couldn't parse response`);
          }
        } else {
          this.logger.log(`❌ ${endpoint}: ${response.status} - ${response.statusText}`);
        }
        
        results.push(result);
      } catch (error) {
        this.logger.log(`❌ ${endpoint}: Error - ${error.message}`);
        results.push({
          endpoint,
          status: 'ERROR',
          statusText: error.message,
          accessible: false,
          data: null
        });
      }
    }

    return results;
  }

  /**
   * Create or update a business post
   */
    async createBusinessPost(locationName: string, postContent: {
      message: string;
      postType?: 'STANDARD' | 'EVENT' | 'OFFER';
      callToActionType?: 'LEARN_MORE' | 'ORDER' | 'BOOK' | 'CALL';
      callToActionUrl?: string;
      mediaUrls?: string[];
    }, email: string): Promise<any> {
      try {
        const googleProfile = await this.getActiveGoogleProfile(email);
        if (!googleProfile) {
          throw new Error('No active Google Business Profile connection found');
        }

        const accessToken = await this.refreshAccessToken(googleProfile.refreshToken);

        // Structure the post data correctly for the API
        const postData = {
          topicType: postContent.postType || 'STANDARD',
          languageCode: 'en-US',
          summary: postContent.message,
          ...(postContent.callToActionType && {
            callToAction: {
              actionType: postContent.callToActionType,
              url: postContent.callToActionUrl
            }
          }),
          ...(postContent.mediaUrls && {
            media: postContent.mediaUrls.map(url => ({ sourceUrl: url }))
          })
        };

        // Use the consistent API endpoint
        const response = await fetch(`https://mybusinessaccountmanagement.googleapis.com/v1/${locationName}/localPosts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create business post: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        this.logger.log(`✅ Created business post for location: ${locationName}`);

        return result;
      } catch (error) {
        this.logger.error('❌ Error creating business post:', error);
        throw error;
      }
    }

  /**
   * Reply to a business review
   */
  async replyToReview(reviewName: string, replyData: any, email: string): Promise<any> {
    try {
      const googleProfile = await this.getActiveGoogleProfile(email);
      if (!googleProfile) {
        throw new Error('No active Google Business Profile connection found');
      }

      const accessToken = await this.refreshAccessToken(googleProfile.refreshToken);

      const response = await fetch(`https://mybusinessplaceactions.googleapis.com/v1/${reviewName}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(replyData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to reply to review: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      this.logger.log(`✅ Replied to review: ${reviewName}`);

      return result;
    } catch (error) {
      this.logger.error('❌ Error replying to review:', error);
      throw error;
    }
  }

  /**
   * Update business information
   */
  async updateBusinessInfo(locationName: string, updateData: any, email: string): Promise<any> {
    try {
      const googleProfile = await this.getActiveGoogleProfile(email);
      if (!googleProfile) {
        throw new Error('No active Google Business Profile connection found');
      }

      const accessToken = await this.refreshAccessToken(googleProfile.refreshToken);

      const response = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${locationName}?updateMask=title,address,phoneNumbers,websiteUri,regularHours,specialHours,serviceArea,categories,labels,attributes`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update business info: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      this.logger.log(`✅ Updated business info for location: ${locationName}`);

      return result;
    } catch (error) {
      this.logger.error('❌ Error updating business info:', error);
      throw error;
    }
  }

  // Private helper methods

  async getActiveGoogleProfile(email: string): Promise<SocialProfile | null> {
    return this.socialProfileRepository.findOne({
      where: { 
        user: { email },
        platform: 'google',
        isActive: true 
      },
      relations: ['user']
    });
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      // Get credentials from ConfigService
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
      
      if (!clientId || !clientSecret) {
        throw new Error('Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
      }

      const tokenData = await response.json();
      this.logger.log('✅ Access token refreshed successfully');

      return tokenData.access_token;
    } catch (error) {
      this.logger.error('❌ Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  private async getAccountDetails(accountName: string, accessToken: string): Promise<BusinessAccount> {
    const response = await fetch(`https://mybusinessaccountmanagement.googleapis.com/v1/${accountName}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch account details: ${response.status}`);
    }

    return await response.json();
  }

  private async getAccountLocations(accountName: string, accessToken: string): Promise<BusinessLocation[]> {
    try {
      this.logger.log(`🔍 Fetching locations for account: ${accountName}`);
      
      // Use ONLY mybusinessaccountmanagement.googleapis.com for consistency
      // Only request fields that are valid for the locations endpoint
      const response = await fetch(`https://mybusinessaccountmanagement.googleapis.com/v1/${accountName}/locations?readMask=name,title,storefrontAddress,phoneNumbers,websiteUri,regularHours,categories,serviceArea`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Failed to fetch locations: ${response.status} - ${errorText}`);
        throw new Error(`Failed to fetch locations: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      this.logger.log(`✅ Fetched ${data.locations?.length || 0} locations`);
      
             return (data.locations || []).map(location => ({
         name: location.name,
         title: location.title,
         address: location.storefrontAddress ? { formattedAddress: location.storefrontAddress.formattedAddress || 'Address not available' } : undefined,
         phoneNumbers: location.phoneNumbers,
         websiteUri: location.websiteUri,
         regularHours: location.regularHours,
         categories: location.categories,
         serviceArea: location.serviceArea,
         // Note: profile, rating, and reviewCount are not available from the locations endpoint
         // These would need to be fetched separately from the location details endpoint
         parsedHours: this.parseBusinessHours(location.regularHours),
         parsedServiceArea: this.parseServiceArea(location.serviceArea)
       }));
    } catch (error) {
      this.logger.error('❌ Error fetching authenticated business locations:', error);
      throw error;
    }
  }

  private async getBusinessReviews(locations: BusinessLocation[], accessToken: string): Promise<any[]> {
    const allReviews: any[] = [];
    
    for (const location of locations) {
      try {
        // Use Business Profile API consistently
        const response = await fetch(`https://mybusinessaccountmanagement.googleapis.com/v1/${location.name}/reviews`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.reviews) {
            allReviews.push(...data.reviews.map(review => ({
              ...review,
              locationName: location.name,
              locationTitle: location.title
            })));
          }
        } else {
          this.logger.warn(`⚠️ Reviews access denied for ${location.name}: ${response.status}`);
        }
      } catch (error) {
        this.logger.warn(`⚠️ Could not fetch reviews for location ${location.name}:`, error);
      }
    }

    return allReviews;
  }

  private async getBusinessPosts(locations: BusinessLocation[], accessToken: string): Promise<any[]> {
    const allPosts: any[] = [];
    
    for (const location of locations) {
      try {
        // Consistent endpoint usage
        const response = await fetch(`https://mybusinessaccountmanagement.googleapis.com/v1/${location.name}/localPosts`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.localPosts) {
            allPosts.push(...data.localPosts.map(post => ({
              ...post,
              locationName: location.name,
              locationTitle: location.title
            })));
          }
        }
      } catch (error) {
        this.logger.warn(`⚠️ Could not fetch posts for location ${location.name}:`, error);
      }
    }

    return allPosts;
  }

  private async getBusinessInsights(locations: BusinessLocation[], accessToken: string): Promise<any> {
    const insights = {
      totalLocations: locations.length,
      totalPosts: 0,
      totalReviews: 0,
      postTypes: [],
      languages: [],
      mediaCount: 0,
      averageRating: 0,
      totalRating: 0
    };

    // Aggregate insights from all locations
    let totalRatingSum = 0;
    let totalReviewsCount = 0;
    
    for (const location of locations) {
      if (location.rating && location.reviewCount) {
        totalRatingSum += location.rating;
        totalReviewsCount += location.reviewCount;
      }
    }

    if (totalReviewsCount > 0) {
      insights.totalReviews = totalReviewsCount;
      insights.averageRating = totalRatingSum / locations.length;
    }

    return insights;
  }

  /**
   * Parse business hours into readable format
   */
  private parseBusinessHours(regularHours: any): string {
    if (!regularHours || !regularHours.periods || !Array.isArray(regularHours.periods)) {
      return 'Hours not available';
    }

    try {
      const periods = regularHours.periods;
      if (periods.length === 0) {
        return 'Closed';
      }

      // Check if open 24 hours (Google Business Profile API format)
      if (periods.length === 7) {
        const all24Hours = periods.every((period: any) => {
          return period.openDay === period.closeDay && 
                 period.closeTime && period.closeTime.hours === 24;
        });
        if (all24Hours) {
          return 'Open 24 hours';
        }
      }

      // Format regular hours (Google Business Profile API format)
      const dayNames: { [key: string]: string } = {
        'SUNDAY': 'Sunday',
        'MONDAY': 'Monday', 
        'TUESDAY': 'Tuesday',
        'WEDNESDAY': 'Wednesday',
        'THURSDAY': 'Thursday',
        'FRIDAY': 'Friday',
        'SATURDAY': 'Saturday'
      };

      const formattedHours = periods.map((period: any) => {
        if (period.openDay && period.closeDay) {
          const dayName = dayNames[period.openDay] || period.openDay;
          
          // Handle 24-hour format
          if (period.closeTime && period.closeTime.hours === 24) {
            return `${dayName}: Open 24 hours`;
          }
          
          // Handle regular hours if available
          if (period.openTime && period.closeTime) {
            const openTime = this.formatTime(period.openTime);
            const closeTime = this.formatTime(period.closeTime);
            return `${dayName}: ${openTime} - ${closeTime}`;
          }
          
          return `${dayName}: Hours not specified`;
        }
        return null;
      }).filter(Boolean);

      if (formattedHours.length === 0) {
        return 'Hours not available';
      }

      return formattedHours.join(', ');
    } catch (error) {
      this.logger.warn('⚠️ Error parsing business hours:', error);
      return 'Hours not available';
    }
  }

  /**
   * Parse service area information
   */
  private parseServiceArea(serviceArea: any): string {
    if (!serviceArea) {
      return 'Service area not specified';
    }

    try {
      if (serviceArea.businessType === 'SERVICE_AREA') {
        const areas = serviceArea.areas || [];
        if (areas.length > 0) {
          const areaNames = areas.map((area: any) => area.name || 'Unknown area').join(', ');
          return `Serves: ${areaNames}`;
        }
      }
      return 'Service area not specified';
    } catch (error) {
      this.logger.warn('⚠️ Error parsing service area:', error);
      return 'Service area not specified';
    }
  }

  /**
   * Format time from Google Business Profile API format to readable format
   */
  private formatTime(timeObj: any): string {
    if (!timeObj) {
      return 'Time not specified';
    }

    try {
      // Handle Google Business Profile API time format
      if (timeObj.hours !== undefined) {
        const hours = timeObj.hours;
        const minutes = timeObj.minutes || 0;
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
      }
      
      // Handle legacy string format if needed
      if (typeof timeObj === 'string' && timeObj.length === 4) {
        const hours = parseInt(timeObj.substring(0, 2));
        const minutes = timeObj.substring(2, 4);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        return `${displayHours}:${minutes} ${period}`;
      }
      
      return 'Time not specified';
    } catch (error) {
      return 'Time not specified';
    }
  }

  /**
   * Get comprehensive location details including profile, rating, and reviewCount
   */
  async getLocationDetailsWithProfile(locationName: string, email: string): Promise<any> {
    try {
      const googleProfile = await this.getActiveGoogleProfile(email);
      if (!googleProfile) {
        throw new Error('No active Google Business Profile connection found');
      }
      if (!googleProfile.refreshToken) {
        throw new Error('No refresh token available');
      }
      const accessToken = await this.refreshAccessToken(googleProfile.refreshToken);
      
      // Try multiple API endpoints to get profile data
      const endpoints = [
        `https://mybusinessbusinessinformation.googleapis.com/v1/${locationName}?readMask=title,address,phoneNumbers,websiteUri,regularHours,categories,serviceArea`,
        `https://mybusinessaccountmanagement.googleapis.com/v1/${locationName}?readMask=name,title,storefrontAddress,phoneNumbers,websiteUri,regularHours,categories,serviceArea`,
        `https://mybusiness.googleapis.com/v4/accounts/109194636448236279020/locations/2141374650782668963`
      ];
      
      for (const endpoint of endpoints) {
        try {
          this.logger.log(`🔍 Trying endpoint: ${endpoint}`);
          const response = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });

          if (response.ok) {
            const locationData = await response.json();
            this.logger.log(`✅ Fetched location details from ${endpoint} for: ${locationData.title || locationName}`);
            
            // Extract profile image URI if available - check multiple possible locations
            let profileImageUri = null;
            this.logger.log(`🔍 Checking for profile image in location data...`);
            this.logger.log(`🔍 Available top-level keys:`, Object.keys(locationData));
            
            if (locationData.profile) {
              this.logger.log(`🔍 Profile object keys:`, Object.keys(locationData.profile));
              if (locationData.profile.profileImageUri) {
                profileImageUri = locationData.profile.profileImageUri;
                this.logger.log(`✅ Found profileImageUri in profile.profileImageUri:`, profileImageUri);
              } else if (locationData.profile.logoUri) {
                profileImageUri = locationData.profile.logoUri;
                this.logger.log(`✅ Found profileImageUri in profile.logoUri:`, profileImageUri);
              } else if (locationData.profile.imageUri) {
                profileImageUri = locationData.profile.imageUri;
                this.logger.log(`✅ Found profileImageUri in profile.imageUri:`, profileImageUri);
              }
            }
            
            // Check other possible locations
            if (!profileImageUri && locationData.logoUri) {
              profileImageUri = locationData.logoUri;
              this.logger.log(`✅ Found profileImageUri in logoUri:`, profileImageUri);
            }
            
            if (!profileImageUri && locationData.imageUri) {
              profileImageUri = locationData.imageUri;
              this.logger.log(`✅ Found profileImageUri in imageUri:`, profileImageUri);
            }
            
            if (!profileImageUri && locationData.media && locationData.media.length > 0) {
              // Check if there's a profile image in media
              const profileMedia = locationData.media.find((m: any) => 
                m.mediaFormat === 'PHOTO' && (m.mediaType === 'PROFILE' || m.mediaType === 'LOGO')
              );
              if (profileMedia?.sourceUrl) {
                profileImageUri = profileMedia.sourceUrl;
                this.logger.log(`✅ Found profileImageUri in media:`, profileImageUri);
              }
            }
            
            this.logger.log(`🔍 Final profileImageUri result:`, profileImageUri);
            
            return {
              ...locationData,
              profileImageUri
            };
          } else {
            this.logger.warn(`⚠️ Endpoint ${endpoint} failed: ${response.status}`);
          }
        } catch (endpointError) {
          this.logger.warn(`⚠️ Endpoint ${endpoint} error:`, endpointError);
        }
      }
      
      // If all endpoints fail, try the dedicated profile images endpoint as a last resort
      this.logger.warn(`⚠️ All profile endpoints failed for ${locationName}, trying dedicated profile images endpoint...`);
      
      try {
        const profileImagesResult = await this.fetchProfileImages(locationName, email);
        if (profileImagesResult.success && profileImagesResult.profileImages.length > 0) {
          const firstProfileImage = profileImagesResult.profileImages[0];
          this.logger.log(`✅ Found profile image via dedicated endpoint:`, firstProfileImage.sourceUrl);
          
          return {
            profile: null,
            rating: null,
            reviewCount: null,
            profileImageUri: firstProfileImage.sourceUrl
          };
        }
      } catch (profileImageError) {
        this.logger.warn(`⚠️ Profile images endpoint also failed:`, profileImageError);
      }
      
      // If everything fails, return basic data
      this.logger.warn(`⚠️ All profile endpoints failed for ${locationName}, returning basic data`);
      return {
        profile: null,
        rating: null,
        reviewCount: null,
        profileImageUri: null
      };
    } catch (error) {
      this.logger.error('❌ Error fetching location details with profile:', error);
      // Return basic data instead of throwing
      return {
        profile: null,
        rating: null,
        reviewCount: null,
        profileImageUri: null
      };
    }
  }

  /**
   * Test direct review access for a specific location
   */
  async testDirectReviewAccess(email: string): Promise<any> {
    const googleProfile = await this.getActiveGoogleProfile(email);
    if (!googleProfile) {
      throw new Error('No active Google Business Profile connection found');
    }
    if (!googleProfile.refreshToken) {
      throw new Error('No refresh token available');
    }
    const accessToken = await this.refreshAccessToken(googleProfile.refreshToken);
    
    const locationName = 'locations/2141374650782668963';
    
    const response = await fetch(`https://mybusinessaccountmanagement.googleapis.com/v1/${locationName}/reviews`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    return {
      status: response.status,
      statusText: response.statusText,
      canReadReviews: response.ok,
      data: response.ok ? await response.json() : await response.text()
    };
  }

  /**
   * Fetch profile images specifically from Google Business Profile API
   */
  async fetchProfileImages(locationName: string, email: string): Promise<any> {
    try {
      const googleProfile = await this.getActiveGoogleProfile(email);
      if (!googleProfile?.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const accessToken = await this.refreshAccessToken(googleProfile.refreshToken);
      
      // Try the specific profile images endpoint
      const profileImagesEndpoint = `https://mybusinessbusinessinformation.googleapis.com/v1/${locationName}/media`;
      
      this.logger.log(`🔍 Fetching profile images from: ${profileImagesEndpoint}`);
      
      const response = await fetch(profileImagesEndpoint, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (response.ok) {
        const mediaData = await response.json();
        this.logger.log(`✅ Media data received:`, mediaData);
        
        // Look for profile/logo images
        const profileImages = mediaData.media?.filter((media: any) => 
          media.mediaFormat === 'PHOTO' && 
          (media.mediaType === 'PROFILE' || media.mediaType === 'LOGO' || media.mediaType === 'COVER')
        ) || [];
        
        this.logger.log(`🔍 Found ${profileImages.length} profile images:`, profileImages);
        
        return {
          success: true,
          profileImages,
          allMedia: mediaData.media || [],
          mediaCount: mediaData.media?.length || 0
        };
      } else {
        const errorText = await response.text();
        this.logger.log(`⚠️ Profile images endpoint failed: ${response.status} - ${errorText}`);
        
        // Try alternative endpoint
        const alternativeEndpoint = `https://mybusinessaccountmanagement.googleapis.com/v1/${locationName}/media`;
        this.logger.log(`🔍 Trying alternative endpoint: ${alternativeEndpoint}`);
        
        const altResponse = await fetch(alternativeEndpoint, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (altResponse.ok) {
          const altMediaData = await altResponse.json();
          this.logger.log(`✅ Alternative media data received:`, altMediaData);
          
          const profileImages = altMediaData.media?.filter((media: any) => 
            media.mediaFormat === 'PHOTO' && 
            (media.mediaType === 'PROFILE' || media.mediaType === 'LOGO' || media.mediaType === 'COVER')
          ) || [];
          
          return {
            success: true,
            profileImages,
            allMedia: altMediaData.media || [],
            mediaCount: altMediaData.media?.length || 0,
            source: 'alternative'
          };
        } else {
          const altErrorText = await altResponse.text();
          return {
            success: false,
            error: `Both endpoints failed: ${response.status} and ${altResponse.status}`,
            primaryError: errorText,
            alternativeError: altErrorText
          };
        }
      }
    } catch (error) {
      this.logger.error('❌ Error fetching profile images:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
