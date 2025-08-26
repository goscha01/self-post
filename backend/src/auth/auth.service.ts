import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities';
import { SocialProfile } from '../entities/social-profile.entity';
import { FacebookApiService, FacebookPage } from './facebook-api.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SocialProfile)
    private socialProfileRepository: Repository<SocialProfile>,
    private jwtService: JwtService,
    private facebookApiService: FacebookApiService,
  ) {}

  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async storeGoogleConnection(profile: any, accessToken: string, refreshToken: string) {
    try {
      console.log('🔧 Storing Google Business Profile connection for profile:', profile);
      console.log('🔑 Access Token Length:', accessToken?.length || 0);
      console.log('🔄 Refresh Token Length:', refreshToken?.length || 0);
      console.log('🔑 Access Token Type:', typeof accessToken);
      console.log('🔄 Refresh Token Type:', typeof refreshToken);
      console.log('🔑 Access Token Present:', !!accessToken);
      console.log('🔄 Refresh Token Present:', !!refreshToken);
      
      // Log the exact parameters received
      console.log('📥 Received parameters:', {
        profileId: profile?.id,
        profileEmail: profile?.emails?.[0]?.value,
        accessTokenLength: accessToken?.length || 0,
        refreshTokenLength: refreshToken?.length || 0,
        accessTokenType: typeof accessToken,
        refreshTokenType: typeof refreshToken
      });
      
      // For now, create a demo user (you can enhance this later)
      let user = await this.userRepository.findOne({ 
        where: { email: profile.emails[0].value } 
      });
      
      if (!user) {
        user = this.userRepository.create({
          email: profile.emails[0].value,
          name: profile.displayName,
          avatarUrl: profile.photos[0]?.value,
          googleId: profile.id,
        });
        user = await this.userRepository.save(user);
        console.log('✅ Created new user:', user.id);
      } else {
        console.log('✅ Found existing user:', user.id);
      }

      // Check if social profile already exists
      let socialProfile = await this.socialProfileRepository.findOne({
        where: { user: { id: user.id }, platform: 'google' }
      });

      if (socialProfile) {
        // Update existing profile with new tokens
        console.log('🔄 Updating existing social profile...');
        console.log('🔄 Old refresh token length:', socialProfile.refreshToken?.length || 0);
        console.log('🔄 New refresh token length:', refreshToken?.length || 0);
        
        socialProfile.accessToken = accessToken;
        socialProfile.refreshToken = refreshToken || socialProfile.refreshToken; // Preserve existing refresh token if new one not provided
        socialProfile.platformUserId = profile.id;
        socialProfile.profileData = { 
          displayName: profile.displayName, 
          emails: profile.emails, 
          photos: profile.photos,
          isBusinessProfile: true // Mark as business profile
        };
        socialProfile.isActive = true;
        
        console.log('💾 Saving social profile with tokens:', {
          accessTokenLength: socialProfile.accessToken?.length || 0,
          refreshTokenLength: socialProfile.refreshToken?.length || 0,
          isActive: socialProfile.isActive
        });
        
        socialProfile = await this.socialProfileRepository.save(socialProfile);
        console.log('✅ Updated existing Google Business Profile connection');
      } else {
        // Create new social profile
        console.log('🆕 Creating new social profile...');
        socialProfile = this.socialProfileRepository.create({
          user: { id: user.id },
          platform: 'google',
          platformUserId: profile.id,
          profileData: { 
            displayName: profile.displayName, 
            emails: profile.emails, 
            photos: profile.photos,
            isBusinessProfile: true // Mark as business profile
          },
          accessToken,
          refreshToken,
          isActive: true,
        });
        
        console.log('💾 Creating social profile with tokens:', {
          accessTokenLength: socialProfile.accessToken?.length || 0,
          refreshTokenLength: socialProfile.refreshToken?.length || 0,
          isActive: socialProfile.isActive
        });
        
        socialProfile = await this.socialProfileRepository.save(socialProfile);
        console.log('✅ Created new Google Business Profile connection');
      }

      // Enhanced validation and error handling for missing refresh tokens
      if (!refreshToken) {
        console.warn('⚠️ No refresh token received - business operations may fail');
        console.warn('🔍 Token Analysis:');
        console.warn('🔍 - Access Token Present:', !!accessToken);
        console.warn('🔍 - Access Token Length:', accessToken?.length || 0);
        console.warn('🔍 - Refresh Token Present:', !!refreshToken);
        console.warn('🔍 - Refresh Token Length:', refreshToken?.length || 0);
        console.warn('🔍 - Profile Type:', profile?.provider || 'unknown');
        console.warn('🔍 - User Email:', user.email);
        console.warn('🔍 - Timestamp:', new Date().toISOString());
        
        // Log detailed error information for debugging
        console.error('❌ REFRESH TOKEN MISSING - DETAILED ANALYSIS:');
        console.error('❌ This will prevent offline access to Google Business Profile APIs');
        console.error('❌ Possible causes:');
        console.error('❌ 1. Google OAuth consent screen not configured for offline access');
        console.error('❌ 2. User has already granted permissions (no consent screen shown)');
        console.error('❌ 3. OAuth flow parameters not being sent correctly');
        console.error('❌ 4. Google Cloud Console project settings issue');
        console.error('❌ 5. OAuth consent screen not published or in testing mode');
        console.error('❌ 6. User account restrictions or security policies');
        console.error('❌ 7. OAuth app verification status issues');
        console.error('🔧 Immediate debugging steps:');
        console.error('🔧 - Check /auth/debug-google endpoint for configuration issues');
        console.error('🔧 - Verify Google Cloud Console OAuth consent screen settings');
        console.error('🔧 - Ensure "Access type" includes "Offline"');
        console.error('🔧 - Check if consent screen is published or user is test user');
        console.error('🔧 - Try /auth/force-fresh-consent/:email to reset OAuth state');
      }
      
      // Final validation after saving with enhanced logging
      console.log('🔍 Final validation after saving:');
      console.log('🔍 Stored access token length:', socialProfile.accessToken?.length || 0);
      console.log('🔍 Stored refresh token length:', socialProfile.refreshToken?.length || 0);
      console.log('🔍 Profile active:', socialProfile.isActive);
      console.log('🔍 Profile ID:', socialProfile.id);
      console.log('🔍 User ID:', user.id);
      console.log('🔍 Timestamp:', new Date().toISOString());
      
      if (!socialProfile.refreshToken) {
        console.error('❌ CRITICAL: Refresh token still missing after saving to database!');
        console.error('❌ This suggests the token was never received from Google OAuth');
        console.error('❌ Check Google Cloud Console OAuth consent screen configuration');
        console.error('❌ Use /auth/debug-google endpoint to diagnose configuration issues');
        console.error('❌ Consider using /auth/force-fresh-consent/:email to reset OAuth state');
      } else {
        console.log('✅ SUCCESS: Refresh token successfully stored in database');
        console.log('✅ Business profile operations should work correctly');
      }

      return {
        success: true,
        profileId: socialProfile.id,
        userEmail: user.email,
        message: 'Google Business Profile connection stored successfully',
        hasRefreshToken: !!refreshToken
      };
    } catch (error) {
      console.error('❌ Error storing Google Business Profile connection:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUserConnections(email: string) {
    try {
      const user = await this.userRepository.findOne({ 
        where: { email },
        relations: ['socialProfiles']
      });
      
      if (!user) {
        return { connections: [] };
      }

      const connections = user.socialProfiles?.map(profile => ({
        id: profile.id,
        platform: profile.platform,
        isActive: profile.isActive,
        connectedAt: profile.createdAt,
        profileData: profile.profileData
      })) || [];

      return { connections };
    } catch (error) {
      console.error('❌ Error getting user connections:', error);
      return { connections: [], error: error.message };
    }
  }

  async getGoogleProfile(email: string) {
    try {
      const user = await this.userRepository.findOne({ 
        where: { email },
        relations: ['socialProfiles']
      });
      
      if (!user) {
        return { error: 'User not found' };
      }

      const googleProfile = user.socialProfiles?.find(profile => 
        profile.platform === 'google' && profile.isActive
      );

      if (!googleProfile || !googleProfile.accessToken || googleProfile.accessToken === '') {
        return { error: 'Google profile not connected or no access token' };
      }

      // First, get the list of available business accounts
      let businessAccounts: Array<{
        name: string;
        accountName: string;
        type: string;
        role: string;
        verificationState: string;
      }> = [];
      try {
        const accountsResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
          headers: {
            'Authorization': `Bearer ${googleProfile.accessToken}`,
          },
        });

        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json();
          console.log('✅ Fetched Google Business accounts:', accountsData);

          if (accountsData.accounts && accountsData.accounts.length > 0) {
            businessAccounts = accountsData.accounts;
          }
        }
      } catch (businessError) {
        console.log('⚠️ Could not fetch Google Business accounts:', businessError.message);
      }

      // If no business accounts, return basic profile only
      if (businessAccounts.length === 0) {
        // Fetch basic profile data
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${googleProfile.accessToken}`,
          },
        });

        if (!response.ok) {
          return { error: 'Failed to fetch Google profile data' };
        }

        const profileData = await response.json();
        
        return {
          success: true,
          profile: {
            id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            picture: profileData.picture,
            verifiedEmail: profileData.verified_email,
            locale: profileData.locale,
            connectedAt: googleProfile.createdAt,
            platform: 'google',
            businessAccounts: [],
            message: 'No business accounts found. This account may not have access to Google Business Profile.'
          }
        };
      }

      // Return list of available business accounts
      return {
        success: true,
        profile: {
          id: 'business-user',
          name: 'Business Profile User',
          email: email,
          picture: '',
          verifiedEmail: true,
          locale: 'en',
          connectedAt: googleProfile.createdAt,
          platform: 'google',
          businessAccounts: businessAccounts.map(account => ({
            name: account.name,
            accountName: account.accountName,
            type: account.type,
            role: account.role,
            verificationState: account.verificationState
          })),
          message: `Found ${businessAccounts.length} business account(s) you can access.`
        }
      };
    } catch (error) {
      console.error('❌ Error fetching Google profile:', error);
      return { error: error.message };
    }
  }

  async getBusinessProfileData(email: string, accountName: string) {
    try {
      const user = await this.userRepository.findOne({ 
        where: { email },
        relations: ['socialProfiles']
      });
      
      if (!user) {
        return { error: 'User not found' };
      }

      const googleProfile = user.socialProfiles?.find(profile => 
        profile.platform === 'google' && profile.isActive
      );

      if (!googleProfile || !googleProfile.accessToken || googleProfile.accessToken === '') {
        return { error: 'Google profile not connected or no access token' };
      }

      // First, check if this is a business account by trying to get account details
      let accountDetails: any = null;
      try {
        const accountResponse = await fetch(`https://mybusinessaccountmanagement.googleapis.com/v1/${accountName}`, {
          headers: {
            'Authorization': `Bearer ${googleProfile.accessToken}`,
          },
        });

        if (accountResponse.ok) {
          accountDetails = await accountResponse.json();
          console.log('✅ Fetched account details:', accountDetails);
        }
      } catch (accountError: any) {
        console.log('⚠️ Could not fetch account details:', accountError.message);
      }

      // Check if this is a personal account (which won't have business locations)
      if (accountDetails && accountDetails.type === 'PERSONAL') {
        return { 
          error: 'This is a personal Google account, not a business account. Personal accounts do not have business locations, reviews, or posts.',
          accountType: 'PERSONAL',
          message: 'To access business features, you need to create or be added to a Google Business Profile account.'
        };
      }

      // Check if this is a business account but not verified
      if (accountDetails && accountDetails.verificationState === 'UNVERIFIED') {
        return {
          error: 'This business account is not verified yet. Business profiles must be verified before they can have locations, reviews, or posts.',
          accountType: accountDetails.type,
          verificationState: accountDetails.verificationState,
          message: 'Please complete the verification process for your business account in Google Business Profile.'
        };
      }

      // Get locations for the specific account
      const locationsResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations`, {
        headers: {
          'Authorization': `Bearer ${googleProfile.accessToken}`,
        },
      });

      if (!locationsResponse.ok) {
        const errorText = await locationsResponse.text();
        console.log('❌ Locations API failed:', locationsResponse.status, errorText);
        return { error: `Failed to fetch business locations: ${locationsResponse.status} - ${errorText}` };
      }

      const locationsData = await locationsResponse.json();
      console.log('✅ Fetched business locations:', locationsData);

      if (!locationsData.locations || locationsData.locations.length === 0) {
        return { error: 'No business locations found for this account. This account may not be set up as a business profile yet.' };
      }

      const location = locationsData.locations[0]; // Use first location
      
      // Get detailed location information
      const locationDetailsResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${location.name}`, {
        headers: {
          'Authorization': `Bearer ${googleProfile.accessToken}`,
        },
      });

      if (!locationDetailsResponse.ok) {
        return { error: 'Failed to fetch location details' };
      }

      const locationDetails = await locationDetailsResponse.json();
      console.log('✅ Fetched location details:', locationDetails);

      // Get reviews with more details
      let reviews = [];
      try {
        const reviewsResponse = await fetch(`https://mybusinessplaceactions.googleapis.com/v1/${location.name}/reviews`, {
          headers: {
            'Authorization': `Bearer ${googleProfile.accessToken}`,
          },
        });
        
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          reviews = reviewsData.reviews || [];
          console.log('✅ Fetched reviews:', reviews.length);
        }
      } catch (reviewError) {
        console.log('⚠️ Could not fetch reviews:', reviewError.message);
      }

      // Get posts with more details
      let posts = [];
      try {
        const postsResponse = await fetch(`https://mybusinessplaceactions.googleapis.com/v1/${location.name}/localPosts`, {
          headers: {
            'Authorization': `Bearer ${googleProfile.accessToken}`,
          },
        });
        
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          posts = postsData.localPosts || [];
          console.log('✅ Fetched posts:', posts.length);
        }
      } catch (postError) {
        console.log('⚠️ Could not fetch posts:', postError.message);
      }

      // Get additional business information
      let additionalInfo: any = {};
      try {
        // Get business categories and attributes
        const categoriesResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${location.name}?readMask=title,address,phoneNumbers,websiteUri,rating,regularHours,specialHours,serviceArea,categories,labels,adWordsLocationExtensions,latlng,openInfo,metadata,profile,relationshipData,moreHours,priceLists,services,attributes`, {
          headers: {
            'Authorization': `Bearer ${googleProfile.accessToken}`,
          },
        });
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          additionalInfo = {
            categories: categoriesData.categories || [],
            labels: categoriesData.labels || [],
            attributes: categoriesData.attributes || {},
            regularHours: categoriesData.regularHours || {},
            specialHours: categoriesData.specialHours || {},
            openInfo: categoriesData.openInfo || {},
            metadata: categoriesData.metadata || {},
            profile: categoriesData.profile || {},
            relationshipData: categoriesData.relationshipData || {},
            moreHours: categoriesData.moreHours || [],
            priceLists: categoriesData.priceLists || [],
            services: categoriesData.services || [],
            latlng: categoriesData.latlng || {},
            adWordsLocationExtensions: categoriesData.adWordsLocationExtensions || {}
          };
          console.log('✅ Fetched additional business info:', Object.keys(additionalInfo));
        }
      } catch (additionalError: any) {
        console.log('⚠️ Could not fetch additional business info:', additionalError.message);
      }

      // Get business insights and analytics if available
      let insights = {};
      try {
        const insightsResponse = await fetch(`https://mybusinessplaceactions.googleapis.com/v1/${location.name}/localPosts?readMask=localPosts.summary,localPosts.createTime,localPosts.searchResult,localPosts.media,localPosts.topicType,localPosts.languageCode`, {
          headers: {
            'Authorization': `Bearer ${googleProfile.accessToken}`,
          },
        });
        
        if (insightsResponse.ok) {
          const insightsData = await insightsResponse.json();
          insights = {
            totalPosts: insightsData.localPosts?.length || 0,
            postTypes: insightsData.localPosts?.map((post: any) => post.topicType) || [],
            languages: insightsData.localPosts?.map((post: any) => post.languageCode) || [],
            mediaCount: insightsData.localPosts?.filter((post: any) => post.media && post.media.length > 0).length || 0
          };
          console.log('✅ Fetched business insights:', insights);
        }
      } catch (insightsError: any) {
        console.log('⚠️ Could not fetch business insights:', insightsError.message);
      }

      return {
        success: true,
        businessProfile: {
          name: locationDetails.title || 'Unknown Business',
          title: locationDetails.title || 'Unknown Business',
          address: locationDetails.address?.formattedAddress || 'No address',
          phone: locationDetails.phoneNumbers?.primaryPhone || 'No phone',
          website: locationDetails.websiteUri || 'No website',
          rating: locationDetails.rating || 0,
          reviewCount: locationDetails.reviewCount || 0,
          hours: locationDetails.businessHours,
          services: locationDetails.serviceArea,
          posts: posts,
          reviews: reviews,
          locationName: location.name,
          accountName: accountName,
          // Additional comprehensive business data
          categories: additionalInfo.categories || [],
          labels: additionalInfo.labels || [],
          attributes: additionalInfo.attributes || {},
          regularHours: additionalInfo.regularHours || {},
          specialHours: additionalInfo.specialHours || {},
          openInfo: additionalInfo.openInfo || {},
          metadata: additionalInfo.metadata || {},
          profile: additionalInfo.profile || {},
          relationshipData: additionalInfo.relationshipData || {},
          moreHours: additionalInfo.moreHours || [],
          priceLists: additionalInfo.priceLists || [],
          detailedServices: additionalInfo.services || [],
          coordinates: additionalInfo.latlng || {},
          adWordsExtensions: additionalInfo.adWordsLocationExtensions || {},
          insights: insights,
          // Network Access Token (NAT) - this is the access token used for API calls
          nat: googleProfile.accessToken
        }
      };
    } catch (error) {
      console.error('❌ Error fetching business profile data:', error);
      return { error: error.message };
    }
  }

  async disconnectPlatform(email: string, platform: string) {
    try {
      console.log(`🔌 Disconnecting ${platform} for user: ${email}`);
      
      const user = await this.userRepository.findOne({ 
        where: { email },
        relations: ['socialProfiles']
      });
      
      if (!user) {
        return { error: 'User not found' };
      }

      const socialProfile = user.socialProfiles?.find(profile => 
        profile.platform === platform && profile.isActive
      );

      if (!socialProfile) {
        return { error: `${platform} profile not found or already disconnected` };
      }

      // Deactivate the social profile instead of deleting it
      socialProfile.isActive = false;
      socialProfile.accessToken = '';
      socialProfile.refreshToken = '';
      
      await this.socialProfileRepository.save(socialProfile);
      
      console.log(`✅ Successfully disconnected ${platform} for user: ${email}`);

      return {
        success: true,
        message: `Successfully disconnected from ${platform}`,
        platform: platform
      };
    } catch (error) {
      console.error(`❌ Error disconnecting ${platform}:`, error);
      return { error: error.message };
    }
  }

  async clearOAuthState(email: string) {
    try {
      console.log(`🧹 Clearing OAuth state for user: ${email}`);
      
      const user = await this.userRepository.findOne({ 
        where: { email } 
      });
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }
      
      // Find all Google social profiles for this user
      const socialProfiles = await this.socialProfileRepository.find({
        where: { user: { id: user.id }, platform: 'google' }
      });
      
      if (socialProfiles.length === 0) {
        return { success: false, error: 'No Google connection found' };
      }
      
      // Clear all OAuth state (tokens, profile data, etc.)
      for (const profile of socialProfiles) {
        profile.accessToken = '';
        profile.refreshToken = '';
        profile.profileData = {};
        profile.isActive = false;
        profile.tokenExpiresAt = null;
        await this.socialProfileRepository.save(profile);
      }
      
      console.log(`✅ OAuth state cleared for user: ${email}`);
      return { 
        success: true, 
        message: 'OAuth state cleared successfully',
        clearedProfiles: socialProfiles.length
      };
      
    } catch (error) {
      console.error(`❌ Error clearing OAuth state:`, error);
      return { success: false, error: 'Failed to clear OAuth state' };
    }
  }

  /**
   * Store Facebook connection with pages
   */
  async storeFacebookConnection(profile: any, accessToken: string, pages: FacebookPage[]) {
    try {
      console.log('🔧 Storing Facebook connection for profile:', profile);
      console.log('🔑 Access Token Length:', accessToken?.length || 0);
      console.log('📄 Pages Count:', pages?.length || 0);
      
      // Find or create user
      let user = await this.userRepository.findOne({ 
        where: { email: profile.emails[0].value } 
      });
      
      if (!user) {
        user = this.userRepository.create({
          email: profile.emails[0].value,
          name: profile.displayName,
          avatarUrl: profile.photos?.[0]?.value,
        });
        user = await this.userRepository.save(user);
        console.log('✅ Created new user for Facebook:', user.id);
      } else {
        console.log('✅ Found existing user for Facebook:', user.id);
      }

      // Check if Facebook profile already exists
      let socialProfile = await this.socialProfileRepository.findOne({
        where: { user: { id: user.id }, platform: 'facebook' }
      });

      if (socialProfile) {
        // Update existing profile
        console.log('🔄 Updating existing Facebook profile...');
        socialProfile.accessToken = accessToken;
        socialProfile.platformUserId = profile.id;
        socialProfile.profileData = { 
          displayName: profile.displayName, 
          emails: profile.emails, 
          photos: profile.photos,
          pages: pages.map(page => ({
            id: page.id,
            name: page.name,
            access_token: page.access_token,
            category: page.category,
            tasks: page.tasks,
            fan_count: page.fan_count,
            verification_status: page.verification_status
          }))
        };
        socialProfile.isActive = true;
        
        socialProfile = await this.socialProfileRepository.save(socialProfile);
        console.log('✅ Updated existing Facebook connection');
      } else {
        // Create new profile
        console.log('🆕 Creating new Facebook profile...');
        socialProfile = this.socialProfileRepository.create({
          user: { id: user.id },
          platform: 'facebook',
          platformUserId: profile.id,
          profileData: { 
            displayName: profile.displayName, 
            emails: profile.emails, 
            photos: profile.photos,
            pages: pages.map(page => ({
              id: page.id,
              name: page.name,
              access_token: page.access_token,
              category: page.category,
              tasks: page.tasks,
              fan_count: page.fan_count,
              verification_status: page.verification_status
            }))
          },
          accessToken,
          isActive: true,
        });
        
        socialProfile = await this.socialProfileRepository.save(socialProfile);
        console.log('✅ Created new Facebook connection');
      }

      return {
        success: true,
        profileId: socialProfile.id,
        userEmail: user.email,
        message: 'Facebook connection stored successfully',
        pagesCount: pages.length
      };
    } catch (error) {
      console.error('❌ Error storing Facebook connection:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get Facebook pages for a user
   */
  async getFacebookPages(email: string) {
    try {
      const user = await this.userRepository.findOne({ 
        where: { email },
        relations: ['socialProfiles']
      });
      
      if (!user) {
        return { error: 'User not found' };
      }

      const facebookProfile = user.socialProfiles?.find(profile => 
        profile.platform === 'facebook' && profile.isActive
      );

      if (!facebookProfile || !facebookProfile.accessToken) {
        return { error: 'Facebook profile not connected or no access token' };
      }

      // Get fresh pages from Facebook API
      const pages = await this.facebookApiService.getPages(facebookProfile.accessToken);
      
      return {
        success: true,
        pages: pages,
        count: pages.length
      };
    } catch (error) {
      console.error('❌ Error fetching Facebook pages:', error);
      return { error: error.message };
    }
  }

  /**
   * Get Facebook pages directly using an access token (for OAuth callback)
   */
  async getFacebookPagesDirect(accessToken: string) {
    try {
      console.log('🔍 Fetching Facebook pages directly with access token...');
      
      // Get fresh pages from Facebook API
      const pages = await this.facebookApiService.getPages(accessToken);
      
      return {
        success: true,
        pages: pages,
        count: pages.length
      };
    } catch (error) {
      console.error('❌ Error fetching Facebook pages directly:', error);
      return { error: error.message };
    }
  }

  async exchangeCodeForTokens(code: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing Google OAuth environment variables');
    }

    try {
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const tokenData = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenData.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google OAuth error: ${response.status} - ${errorText}`);
      }

      const tokenResponse = await response.json();
      return tokenResponse;

    } catch (error) {
      console.error('❌ Token exchange error:', error);
      throw error;
    }
  }
}
