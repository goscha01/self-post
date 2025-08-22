import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const callbackURL = '/auth/google/oauth/callback';
    
    // Enhanced OAuth configuration with debugging
    const oauthConfig = {
      clientID: '', // Will be set from environment variable
      clientSecret: '', // Will be set from environment variable
      callbackURL: callbackURL,
      scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/business.manage'
      ],
      accessType: 'offline',
      prompt: 'consent'
    };
    
    super(oauthConfig);
    
    // Get credentials from environment variables after super() call
    const clientID = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    
    // Validate required environment variables
    if (!clientID || !clientSecret) {
      throw new Error('Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
    }
    
    oauthConfig.clientID = clientID;
    oauthConfig.clientSecret = clientSecret;
    
    console.log('🔧 Google Strategy initialized');
    console.log('🆔 Client ID:', clientID ? 'Present (Environment)' : 'Missing (Environment)');
    console.log('🔐 Client Secret:', clientSecret ? 'Present (Environment)' : 'Missing (Environment)');
    console.log('🎯 Callback URL:', callbackURL);
    console.log('📋 Scopes:', oauthConfig.scope);
    console.log('🔑 Access Type:', oauthConfig.accessType);
    console.log('📝 Prompt:', oauthConfig.prompt);
    console.log('📊 Full OAuth Config:', JSON.stringify(oauthConfig, null, 2));
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    console.log('🔍 Google Strategy - validate called');
    console.log('📱 Profile ID:', profile?.id);
    console.log('📱 Profile Email:', profile?.emails?.[0]?.value);
    console.log('📱 Profile Display Name:', profile?.displayName);
    console.log('🔑 Access Token:', accessToken ? `Present (${accessToken.length} chars)` : 'Missing');
    console.log('🔄 Refresh Token:', refreshToken ? `Present (${refreshToken.length} chars)` : 'Missing');
    
    // Enhanced debugging for token analysis
    if (accessToken) {
      console.log('🔑 Access Token Preview:', accessToken.substring(0, 20) + '...');
      console.log('🔑 Access Token Type:', typeof accessToken);
    }
    
    if (refreshToken) {
      console.log('🔄 Refresh Token Preview:', refreshToken.substring(0, 20) + '...');
      console.log('🔄 Refresh Token Type:', typeof refreshToken);
      console.log('✅ SUCCESS: Refresh token received - offline access enabled!');
    } else {
      console.log('⚠️  CRITICAL: No refresh token received from Google OAuth!');
      console.log('⚠️  This will prevent offline access to Google Business Profile APIs');
      console.log('⚠️  Possible causes:');
      console.log('⚠️  1. Google OAuth consent screen not configured for offline access');
      console.log('⚠️  2. User has already granted permissions (no consent screen shown)');
      console.log('⚠️  3. OAuth flow parameters not being sent correctly');
      console.log('⚠️  4. Google Cloud Console project settings issue');
      console.log('⚠️  5. OAuth consent screen not published or in testing mode');
      console.log('🔧 Debugging steps:');
      console.log('🔧   - Check Google Cloud Console OAuth consent screen');
      console.log('🔧   - Verify "Access type" includes "Offline"');
      console.log('🔧   - Ensure consent screen is published or user is added as test user');
      console.log('🔧   - Check if user has already granted permissions before');
    }
    
    // Log the exact return object for debugging
    const returnObject = {
      profile,
      accessToken,
      refreshToken,
    };
    
    console.log('📤 Returning from validate:', {
      hasProfile: !!returnObject.profile,
      hasAccessToken: !!returnObject.accessToken,
      hasRefreshToken: !!returnObject.refreshToken,
      profileKeys: returnObject.profile ? Object.keys(returnObject.profile) : [],
    });
    
    return returnObject;
  }
}
