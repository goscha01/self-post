import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
   * Get comprehensive business profile data for a specific account
   */
  async getBusinessProfileData(email: string, accountName: string): Promise<BusinessProfileData> {
    try {
      const googleProfile = await this.getActiveGoogleProfile(email);
      if (!googleProfile) {
        throw new Error('No active Google Business Profile connection found');
      }

      // Get fresh access token
      const accessToken = await this.refreshAccessToken(googleProfile.refreshToken);

      // Get account details
      const account = await this.getAccountDetails(accountName, accessToken);
      
      // Get all locations for this account
      const locations = await this.getAccountLocations(accountName, accessToken);
      
      // Get reviews and posts for all locations
      const reviews = await this.getBusinessReviews(locations, accessToken);
      const posts = await this.getBusinessPosts(locations, accessToken);
      
      // Get business insights
      const insights = await this.getBusinessInsights(locations, accessToken);

      return {
        account,
        locations,
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
   * Create or update a business post
   */
  async createBusinessPost(locationName: string, postData: any, email: string): Promise<any> {
    try {
      const googleProfile = await this.getActiveGoogleProfile(email);
      if (!googleProfile) {
        throw new Error('No active Google Business Profile connection found');
      }

      const accessToken = await this.refreshAccessToken(googleProfile.refreshToken);

      const response = await fetch(`https://mybusinessplaceactions.googleapis.com/v1/${locationName}/localPosts`, {
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

  private async getActiveGoogleProfile(email: string): Promise<SocialProfile | null> {
    return this.socialProfileRepository.findOne({
      where: { 
        user: { email },
        platform: 'google',
        isActive: true 
      },
      relations: ['user']
    });
  }

  private async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      // Validate required environment variables
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error('Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
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
    const response = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch account locations: ${response.status}`);
    }

    const data = await response.json();
    return data.locations || [];
  }

  private async getBusinessReviews(locations: BusinessLocation[], accessToken: string): Promise<any[]> {
    const allReviews: any[] = [];
    
    for (const location of locations) {
      try {
        const response = await fetch(`https://mybusinessplaceactions.googleapis.com/v1/${location.name}/reviews`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.reviews) {
            allReviews.push(...data.reviews.map((review: any) => ({
              ...review,
              locationName: location.name,
              locationTitle: location.title
            })));
          }
        }
      } catch (error: any) {
        this.logger.warn(`⚠️ Could not fetch reviews for location ${location.name}:`, error.message);
      }
    }

    return allReviews;
  }

  private async getBusinessPosts(locations: BusinessLocation[], accessToken: string): Promise<any[]> {
    const allPosts: any[] = [];
    
    for (const location of locations) {
      try {
        const response = await fetch(`https://mybusinessplaceactions.googleapis.com/v1/${location.name}/localPosts`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.localPosts) {
            allPosts.push(...data.localPosts.map((post: any) => ({
              ...post,
              locationName: location.name,
              locationTitle: location.title
            })));
          }
        }
      } catch (error: any) {
        this.logger.warn(`⚠️ Could not fetch posts for location ${location.name}:`, error.message);
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
    for (const location of locations) {
      if (location.rating) {
        insights.totalRating += location.rating.averageRating || 0;
        insights.totalReviews += location.rating.reviewCount || 0;
      }
    }

    if (insights.totalReviews > 0) {
      insights.averageRating = insights.totalRating / insights.totalReviews;
    }

    return insights;
  }
}
