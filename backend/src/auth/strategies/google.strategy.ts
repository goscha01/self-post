import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    // Use a default callback URL initially, will be updated after super() call
    const defaultCallbackURL = '/auth/google/oauth/callback';
    
    // Enhanced OAuth configuration with debugging
    const oauthConfig = {
      clientID: 'placeholder', // Will be replaced after super() call
      clientSecret: 'placeholder', // Will be replaced after super() call
      callbackURL: defaultCallbackURL,
      scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/business.manage',
        'https://www.googleapis.com/auth/plus.business.manage'
      ],
      accessType: 'offline',
      prompt: 'consent',
      includeGrantedScopes: false, // CRITICAL: Forces Google to treat this as fresh authorization
      approvalPrompt: 'force' // Additional parameter to force consent screen
    };
    
    super(oauthConfig);
    
    // Get credentials from environment variables after super() call
    const clientID = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = this.configService.get<string>('GOOGLE_CALLBACK_URL') || defaultCallbackURL;
    
    // Validate required environment variables
    if (!clientID || !clientSecret) {
      throw new Error('Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
    }
    
    // Update the strategy with real credentials and callback URL
    (this as any)._oauth2._clientId = clientID;
    (this as any)._oauth2._clientSecret = clientSecret;
    (this as any)._callbackURL = callbackURL;
    
    console.log('🔧 Google Strategy initialized');
    console.log('🆔 Client ID:', clientID ? 'Present (Environment)' : 'Missing (Environment)');
    console.log('🔐 Client Secret:', clientSecret ? 'Present (Environment)' : 'Missing (Environment)');
    console.log('🎯 Callback URL:', callbackURL);
    console.log('📋 Scopes:', oauthConfig.scope);
    console.log('🔑 Access Type:', oauthConfig.accessType);
    console.log('📝 Prompt:', oauthConfig.prompt);
    console.log('🔄 Include Granted Scopes:', oauthConfig.includeGrantedScopes);
    console.log('🔒 Approval Prompt:', oauthConfig.approvalPrompt);
    console.log('📊 Full OAuth Config:', JSON.stringify(oauthConfig, null, 2));
  }

    async validate(accessToken: string, refreshToken: string, profile: any) {
    const requestId = Math.random().toString(36).substring(7);
    const timestamp = new Date().toISOString();

    console.log(`=== GOOGLE STRATEGY VALIDATE [${requestId}] [${timestamp}] ===`);
    console.log(`🔍 [${requestId}] Google Strategy - validate called`);
    console.log(`📱 [${requestId}] Profile ID:`, profile?.id);
    console.log(`📱 [${requestId}] Profile Email:`, profile?.emails?.[0]?.value);
    console.log(`📱 [${requestId}] Profile Display Name:`, profile?.displayName);
    console.log(`🔑 [${requestId}] Access Token:`, accessToken ? `Present (${accessToken.length} chars)` : 'Missing');
    console.log(`🔄 [${requestId}] Refresh Token:`, refreshToken ? `Present (${refreshToken.length} chars)` : 'Missing');

    // Enhanced debugging for token analysis
    if (accessToken) {
      console.log(`🔑 [${requestId}] Access Token Preview:`, accessToken.substring(0, 20) + '...');
      console.log(`🔑 [${requestId}] Access Token Type:`, typeof accessToken);
      console.log(`🔑 [${requestId}] Access Token Length:`, accessToken.length);
      console.log(`🔑 [${requestId}] Access Token Valid:`, accessToken.length > 50 ? 'Yes' : 'No (too short)');
    }

    if (refreshToken) {
      console.log(`🔄 [${requestId}] Refresh Token Preview:`, refreshToken.substring(0, 20) + '...');
      console.log(`🔄 [${requestId}] Refresh Token Type:`, typeof refreshToken);
      console.log(`🔄 [${requestId}] Refresh Token Length:`, refreshToken.length);
      console.log(`🔄 [${requestId}] Refresh Token Valid:`, refreshToken.length > 50 ? 'Yes' : 'No (too short)');
      console.log(`✅ [${requestId}] SUCCESS: Refresh token received - offline access enabled!`);
    } else {
      console.log(`❌ [${requestId}] CRITICAL: No refresh token received from Google OAuth!`);
      console.log(`❌ [${requestId}] This will prevent offline access to Google Business Profile APIs`);
      console.log(`❌ [${requestId}] Possible causes:`);
      console.log(`❌ [${requestId}] 1. Google OAuth consent screen not configured for offline access`);
      console.log(`❌ [${requestId}] 2. User has already granted permissions (no consent screen shown)`);
      console.log(`❌ [${requestId}] 3. OAuth flow parameters not being sent correctly`);
      console.log(`❌ [${requestId}] 4. Google Cloud Console project settings issue`);
      console.log(`❌ [${requestId}] 5. OAuth consent screen not published or in testing mode`);
      console.log(`❌ [${requestId}] 6. User account restrictions or security policies`);
      console.log(`❌ [${requestId}] 7. OAuth app verification status issues`);
      console.log(`🔧 [${requestId}] Debugging steps:`);
      console.log(`🔧 [${requestId}]   - Check Google Cloud Console OAuth consent screen`);
      console.log(`🔧 [${requestId}]   - Verify "Access type" includes "Offline"`);
      console.log(`🔧 [${requestId}]   - Check if consent screen is published or user is test user`);
      console.log(`🔧 [${requestId}]   - Check if user has already granted permissions before`);
      console.log(`🔧 [${requestId}]   - Verify OAuth app verification status`);
      console.log(`🔧 [${requestId}]   - Check user account security settings`);
    }

    // Log the exact return object for debugging
    const returnObject = {
      profile,
      accessToken,
      refreshToken,
      requestId,
      timestamp,
    };

    console.log(`📤 [${requestId}] Returning from validate:`, {
      hasProfile: !!returnObject.profile,
      hasAccessToken: !!returnObject.accessToken,
      hasRefreshToken: !!returnObject.refreshToken,
      profileKeys: returnObject.profile ? Object.keys(returnObject.profile) : [],
      requestId: returnObject.requestId,
      timestamp: returnObject.timestamp,
    });

    return returnObject;
  }
}
